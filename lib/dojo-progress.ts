import { courseCatalog, PILOT_ID } from "./course-catalog";
import { canTrain, emptyModule, gradeModule, isRecord, learningSummary, moduleProgress, moduleQuestions } from "./course-engine";
import type { CourseCatalog, CourseProgress, LearningProgress, ModuleProgress } from "./course-types";
import { principles, type PrincipleId } from "./philosophy-content";

export { PILOT_ID } from "./course-catalog";
export const PROGRESS_KEY = "bushido-ops.progress";
export const PROGRESS_VERSION = 3;
export const MAX_BACKUP_BYTES = 256 * 1024;
const habitOrder = principles.map(item => item.id);
export type DojoProgress = LearningProgress & { commitments: PrincipleId[] };
export type ProgressSnapshot = { ready: boolean; data: DojoProgress; mode: "saved" | "temporary" | "protected"; notice: string | null; savedRaw: string | null };
export type ProgressAction =
  | { type: "answer"; courseId: string; moduleId: string; questionId: string; answer: string }
  | { type: "submit" | "complete-lesson" | "retry"; courseId: string; moduleId: string }
  | { type: "toggle-habit"; id: PrincipleId };

export function emptyProgress(catalog: CourseCatalog = courseCatalog): DojoProgress {
  return { courses: Object.fromEntries(catalog.courses.map(course => [course.id, { modules: Object.fromEntries(course.modules.map(module => [module.id, emptyModule(module)])) }])), commitments: [] };
}
function validAnswer(value: unknown, choices: number): value is string { return typeof value === "string" && (value === "" || Array.from({ length: choices }, (_, i) => String(i)).includes(value)); }
function list<T extends string>(value: unknown, allowed: T[]): T[] | null {
  return Array.isArray(value) && value.length <= 100 && value.every(item => typeof item === "string" && allowed.includes(item as T)) ? allowed.filter(item => value.includes(item)) : null;
}
export function reduceProgress(data: DojoProgress, action: ProgressAction, catalog: CourseCatalog = courseCatalog): DojoProgress {
  if (action.type === "toggle-habit") {
    if (!habitOrder.includes(action.id)) return data;
    return { ...data, commitments: data.commitments.includes(action.id) ? data.commitments.filter(id => id !== action.id) : [...data.commitments, action.id] };
  }
  const course = catalog.courses.find(item => item.id === action.courseId);
  const module = course?.modules.find(item => item.id === action.moduleId);
  if (!course || !module || !canTrain(data, course, catalog)) return data;
  const previous = moduleProgress(data, course, module);
  let next: ModuleProgress;
  if (action.type === "answer") {
    const question = moduleQuestions(module).find(item => item.id === action.questionId);
    if (!question || !validAnswer(action.answer, question.options.length) || previous.answers[question.id] === action.answer || (module.kind === "quiz" && previous.submitted)) return data;
    next = { ...previous, answers: { ...previous.answers, [question.id]: action.answer }, submitted: false };
  } else if (action.type === "submit") {
    const grade = gradeModule(module, previous);
    if (module.kind === "lesson" || previous.submitted || grade.answered !== grade.total) return data;
    next = { ...previous, submitted: true, completed: previous.completed || grade.passed };
  } else if (action.type === "complete-lesson") {
    if (module.kind !== "lesson" || previous.completed) return data;
    next = { ...previous, completed: true };
  } else {
    if (module.kind === "lesson") return data;
    next = { ...emptyModule(module), completed: previous.completed };
  }
  return { ...data, courses: { ...data.courses, [course.id]: { modules: { ...data.courses[course.id]?.modules, [module.id]: next } } } };
}

type DecodeResult = { ok: true; data: DojoProgress; migrated: boolean } | { ok: false; reason: "invalid" | "newer" };
function migrateLegacy(envelope: Record<string, unknown>, catalog: CourseCatalog): DojoProgress | null {
  const course = catalog.courses.find(item => item.id === PILOT_ID);
  if (!course) return null;
  let source = envelope;
  let commitmentsSource: unknown = envelope.commitments ?? [];
  if (envelope.version === 2) {
    if (!isRecord(envelope.progress) || !isRecord(envelope.progress.courses) || Object.keys(envelope.progress.courses).some(id => id !== PILOT_ID) || !isRecord(envelope.progress.courses[PILOT_ID])) return null;
    source = envelope.progress.courses[PILOT_ID]; commitmentsSource = envelope.progress.commitments;
  }
  const completed = list(source.completed, ["warmup", "lesson", "quiz"]);
  const commitments = list(commitmentsSource, habitOrder);
  if (!completed || !commitments) return null;
  const data = emptyProgress(catalog);
  for (const id of completed) {
    if (!data.courses[PILOT_ID].modules[id]) return null;
    data.courses[PILOT_ID].modules[id].completed = true;
  }
  data.commitments = commitments;
  if (envelope.version === 1) return data;
  const warmup = course.modules.find(module => module.id === "warmup");
  const quiz = course.modules.find(module => module.id === "quiz");
  if (!warmup || warmup.kind !== "warmup" || !quiz || quiz.kind !== "quiz" || !validAnswer(source.warmupAnswer, warmup.question.options.length) || typeof source.warmupChecked !== "boolean" || (source.warmupChecked && source.warmupAnswer === "") || !Array.isArray(source.quizAnswers) || source.quizAnswers.length !== quiz.questions.length || !source.quizAnswers.every((answer, index) => validAnswer(answer, quiz.questions[index].options.length)) || typeof source.quizSubmitted !== "boolean" || (source.quizSubmitted && source.quizAnswers.some(answer => answer === ""))) return null;
  data.courses[PILOT_ID].modules.warmup.answers[warmup.question.id] = source.warmupAnswer;
  data.courses[PILOT_ID].modules.warmup.submitted = source.warmupChecked;
  data.courses[PILOT_ID].modules.quiz.answers = Object.fromEntries(quiz.questions.map((question, index) => [question.id, (source.quizAnswers as string[])[index]]));
  data.courses[PILOT_ID].modules.quiz.submitted = source.quizSubmitted;
  return data;
}
export function decodeProgress(raw: string, catalog: CourseCatalog = courseCatalog): DecodeResult {
  if (new TextEncoder().encode(raw).byteLength > MAX_BACKUP_BYTES) return { ok: false, reason: "invalid" };
  let envelope: unknown;
  try { envelope = JSON.parse(raw); } catch { return { ok: false, reason: "invalid" }; }
  if (!isRecord(envelope) || envelope.app !== "bushido-ops" || !Number.isInteger(envelope.version)) return { ok: false, reason: "invalid" };
  if (Number(envelope.version) > PROGRESS_VERSION) return { ok: false, reason: "newer" };
  if (envelope.version === 1 || envelope.version === 2) {
    const data = migrateLegacy(envelope, catalog);
    return data ? { ok: true, data, migrated: true } : { ok: false, reason: "invalid" };
  }
  if (envelope.version !== PROGRESS_VERSION || !isRecord(envelope.progress) || !isRecord(envelope.progress.courses)) return { ok: false, reason: "invalid" };
  const source = envelope.progress;
  const sources = source.courses as Record<string, unknown>;
  const commitments = list(source.commitments, habitOrder);
  if (!commitments || Object.keys(sources).some(id => !catalog.courses.some(course => course.id === id))) return { ok: false, reason: "invalid" };
  const data = emptyProgress(catalog);
  for (const course of catalog.courses) {
    const stored = sources[course.id];
    if (stored === undefined) continue;
    if (!isRecord(stored) || !isRecord(stored.modules) || Object.keys(stored.modules).some(id => !course.modules.some(module => module.id === id))) return { ok: false, reason: "invalid" };
    const normalized: CourseProgress = { modules: {} };
    for (const module of course.modules) {
      const progress = stored.modules[module.id];
      if (progress === undefined) { normalized.modules[module.id] = emptyModule(module); continue; }
      if (!isRecord(progress) || typeof progress.completed !== "boolean" || typeof progress.submitted !== "boolean" || !isRecord(progress.answers)) return { ok: false, reason: "invalid" };
      const questions = moduleQuestions(module);
      const answers = progress.answers;
      if (Object.keys(answers).some(id => !questions.some(question => question.id === id)) || (module.kind === "lesson" && progress.submitted)) return { ok: false, reason: "invalid" };
      const entries: [string, string][] = [];
      for (const question of questions) {
        const answer = answers[question.id] === undefined ? "" : answers[question.id];
        if (!validAnswer(answer, question.options.length) || (progress.submitted && answer === "")) return { ok: false, reason: "invalid" };
        entries.push([question.id, answer]);
      }
      normalized.modules[module.id] = { completed: progress.completed, submitted: progress.submitted, answers: Object.fromEntries(entries) };
    }
    data.courses[course.id] = normalized;
  }
  data.commitments = commitments;
  return { ok: true, data, migrated: false };
}
export function encodeProgress(data: DojoProgress): string { return JSON.stringify({ app: "bushido-ops", version: PROGRESS_VERSION, progress: data }, null, 2); }
export function progressXp(data: DojoProgress, catalog: CourseCatalog = courseCatalog) { return learningSummary(data, catalog).xp; }

const temporaryNotice = "This browser couldn't save your progress. Keep this page open and export a backup before leaving.";
const protectedNotice = (reason: "invalid" | "newer") => reason === "newer" ? "Update Bushido Ops to open your saved progress. Your saved copy has been kept; this practice session is temporary." : "Your saved progress couldn't be opened. Your saved copy has been kept; import a backup or reset progress to save again.";
type StorageAdapter = Pick<Storage, "getItem" | "setItem">;
export function createProgressStore(catalog: CourseCatalog = courseCatalog) {
  const initial: ProgressSnapshot = { ready: false, data: emptyProgress(catalog), mode: "temporary", notice: null, savedRaw: null };
  let snapshot = initial;
  let storage: StorageAdapter | undefined;
  const listeners = new Set<() => void>();
  const publish = (value: ProgressSnapshot) => { snapshot = value; listeners.forEach(listener => listener()); };
  const persist = (data: DojoProgress, replace = false): boolean => {
    if (snapshot.mode === "protected" && !replace) { publish({ ...snapshot, data }); return false; }
    const raw = encodeProgress(data);
    try {
      if (!storage) throw new Error("No storage adapter");
      storage.setItem(PROGRESS_KEY, raw);
      publish({ ready: true, data, mode: "saved", notice: null, savedRaw: raw }); return true;
    } catch { publish({ ready: true, data, mode: "temporary", notice: temporaryNotice, savedRaw: snapshot.savedRaw }); return false; }
  };
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initial,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    hydrate(adapter: StorageAdapter) {
      if (snapshot.ready) return;
      storage = adapter;
      let raw: string | null;
      try { raw = adapter.getItem(PROGRESS_KEY); } catch { publish({ ...snapshot, ready: true, mode: "temporary", notice: temporaryNotice }); return; }
      if (raw === null) { persist(emptyProgress(catalog)); return; }
      const parsed = decodeProgress(raw, catalog);
      if (!parsed.ok) { publish({ ...snapshot, ready: true, mode: "protected", notice: protectedNotice(parsed.reason), savedRaw: raw }); return; }
      publish({ ready: true, data: parsed.data, mode: "saved", notice: null, savedRaw: raw });
      if (parsed.migrated) persist(parsed.data);
    },
    dispatch(action: ProgressAction) {
      if (!snapshot.ready) return;
      const next = reduceProgress(snapshot.data, action, catalog);
      if (next !== snapshot.data) persist(next);
    },
    replace(data: DojoProgress) { const parsed = decodeProgress(encodeProgress(data), catalog); return parsed.ok ? persist(parsed.data, true) : false; },
    reset() { return persist(emptyProgress(catalog), true); },
    receiveExternal(raw: string | null) {
      if (raw === null) { publish({ ready: true, data: emptyProgress(catalog), mode: "saved", notice: null, savedRaw: null }); return; }
      const parsed = decodeProgress(raw, catalog);
      if (!parsed.ok) { publish({ ...snapshot, mode: "protected", notice: protectedNotice(parsed.reason), savedRaw: raw }); return; }
      publish({ ready: true, data: parsed.data, mode: "saved", notice: null, savedRaw: raw });
    },
  };
}
export type ProgressStore = ReturnType<typeof createProgressStore>;
