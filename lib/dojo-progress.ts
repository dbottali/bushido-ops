import { earnedXp, finishModule, questions, warmup, type ModuleId } from "./dojo-content";
import { principles, type PrincipleId } from "./philosophy-content";

export const PROGRESS_KEY = "bushido-ops.progress";
export const PILOT_ID = "white-phishing-pilot";
export const MAX_BACKUP_BYTES = 256 * 1024;
const moduleOrder: ModuleId[] = ["warmup", "lesson", "quiz"];
const habitOrder = principles.map(item => item.id);

export type PilotProgress = {
  completed: ModuleId[];
  warmupAnswer: string;
  warmupChecked: boolean;
  quizAnswers: string[];
  quizSubmitted: boolean;
};
export type DojoProgress = { courses: Record<typeof PILOT_ID, PilotProgress>; commitments: PrincipleId[] };
export type ProgressSnapshot = {
  ready: boolean;
  data: DojoProgress;
  mode: "saved" | "temporary" | "protected";
  notice: string | null;
  savedRaw: string | null;
};
export type ProgressAction =
  | { type: "warmup-answer"; answer: string }
  | { type: "check-warmup" }
  | { type: "complete-lesson" }
  | { type: "quiz-answer"; index: number; answer: string }
  | { type: "submit-quiz" }
  | { type: "retry-quiz" }
  | { type: "toggle-habit"; id: PrincipleId };

export function emptyProgress(): DojoProgress {
  return { courses: { [PILOT_ID]: { completed: [], warmupAnswer: "", warmupChecked: false, quizAnswers: questions.map(() => ""), quizSubmitted: false } }, commitments: [] };
}
export function nextModule(completed: ModuleId[]): ModuleId {
  return moduleOrder.find(id => !completed.includes(id)) ?? "warmup";
}
function validAnswer(value: unknown, count: number): value is string {
  return typeof value === "string" && (value === "" || Array.from({ length: count }, (_, i) => String(i)).includes(value));
}
export function reduceProgress(data: DojoProgress, action: ProgressAction): DojoProgress {
  const course = data.courses[PILOT_ID];
  let next = course;
  switch (action.type) {
    case "warmup-answer":
      if (!validAnswer(action.answer, warmup.options.length) || action.answer === course.warmupAnswer) return data;
      next = { ...course, warmupAnswer: action.answer, warmupChecked: false }; break;
    case "check-warmup":
      if (course.warmupAnswer === "" || course.warmupChecked) return data;
      next = { ...course, warmupChecked: true, completed: Number(course.warmupAnswer) === warmup.correct ? finishModule(course.completed, "warmup") : course.completed }; break;
    case "complete-lesson":
      if (course.completed.includes("lesson")) return data;
      next = { ...course, completed: finishModule(course.completed, "lesson") }; break;
    case "quiz-answer":
      if (course.quizSubmitted || !Number.isInteger(action.index) || !questions[action.index] || !validAnswer(action.answer, questions[action.index].options.length) || course.quizAnswers[action.index] === action.answer) return data;
      next = { ...course, quizAnswers: course.quizAnswers.map((answer, i) => i === action.index ? action.answer : answer) }; break;
    case "submit-quiz":
      if (course.quizSubmitted || course.quizAnswers.some(answer => answer === "")) return data;
      next = { ...course, quizSubmitted: true, completed: questions.every((question, i) => Number(course.quizAnswers[i]) === question.correct) ? finishModule(course.completed, "quiz") : course.completed }; break;
    case "retry-quiz":
      next = { ...course, quizAnswers: questions.map(() => ""), quizSubmitted: false }; break;
    case "toggle-habit":
      if (!habitOrder.includes(action.id)) return data;
      return { ...data, commitments: data.commitments.includes(action.id) ? data.commitments.filter(id => id !== action.id) : [...data.commitments, action.id] };
  }
  return { ...data, courses: { ...data.courses, [PILOT_ID]: next } };
}

type DecodeResult = { ok: true; data: DojoProgress; migrated: boolean } | { ok: false; reason: "invalid" | "newer" };
function object(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function list<T extends string>(value: unknown, allowed: T[]): T[] | null {
  if (!Array.isArray(value) || value.length > 100 || !value.every(item => typeof item === "string" && allowed.includes(item as T))) return null;
  return allowed.filter(item => value.includes(item));
}
export function decodeProgress(raw: string): DecodeResult {
  if (raw.length > MAX_BACKUP_BYTES) return { ok: false, reason: "invalid" };
  let envelope: unknown;
  try { envelope = JSON.parse(raw); } catch { return { ok: false, reason: "invalid" }; }
  if (!object(envelope) || envelope.app !== "bushido-ops" || !Number.isInteger(envelope.version)) return { ok: false, reason: "invalid" };
  if (Number(envelope.version) > 2) return { ok: false, reason: "newer" };
  if (envelope.version === 1) {
    const completed = list(envelope.completed, moduleOrder);
    const commitments = list(envelope.commitments ?? [], habitOrder);
    if (!completed || !commitments) return { ok: false, reason: "invalid" };
    const data = emptyProgress();
    data.courses[PILOT_ID].completed = completed;
    data.commitments = commitments;
    return { ok: true, data, migrated: true };
  }
  if (envelope.version !== 2 || !object(envelope.progress) || !object(envelope.progress.courses)) return { ok: false, reason: "invalid" };
  const source = envelope.progress;
  const courses = source.courses as Record<string, unknown>;
  if (Object.keys(courses).some(id => id !== PILOT_ID)) return { ok: false, reason: "invalid" };
  const pilot = courses[PILOT_ID];
  if (!object(pilot)) return { ok: false, reason: "invalid" };
  const completed = list(pilot.completed, moduleOrder);
  const commitments = list(source.commitments, habitOrder);
  if (!completed || !commitments || !validAnswer(pilot.warmupAnswer, warmup.options.length) || typeof pilot.warmupChecked !== "boolean" || (pilot.warmupChecked && pilot.warmupAnswer === "") || !Array.isArray(pilot.quizAnswers) || pilot.quizAnswers.length !== questions.length || !pilot.quizAnswers.every((answer, i) => validAnswer(answer, questions[i].options.length)) || typeof pilot.quizSubmitted !== "boolean" || (pilot.quizSubmitted && pilot.quizAnswers.some(answer => answer === ""))) return { ok: false, reason: "invalid" };
  return { ok: true, migrated: false, data: { courses: { [PILOT_ID]: { completed, warmupAnswer: pilot.warmupAnswer, warmupChecked: pilot.warmupChecked, quizAnswers: [...pilot.quizAnswers] as string[], quizSubmitted: pilot.quizSubmitted } }, commitments } };
}
export function encodeProgress(data: DojoProgress): string {
  return JSON.stringify({ app: "bushido-ops", version: 2, progress: data }, null, 2);
}
export function progressXp(data: DojoProgress) { return earnedXp(data.courses[PILOT_ID].completed); }

const temporaryNotice = "This browser couldn't save your progress. Keep this page open and export a backup before leaving.";
const protectedNotice = (reason: "invalid" | "newer") => reason === "newer"
  ? "Update Bushido Ops to open your saved progress. Your saved copy has been kept; this practice session is temporary."
  : "Your saved progress couldn't be opened. Your saved copy has been kept; import a backup or reset progress to save again.";
type StorageAdapter = Pick<Storage, "getItem" | "setItem">;

export function createProgressStore() {
  const initial: ProgressSnapshot = { ready: false, data: emptyProgress(), mode: "temporary", notice: null, savedRaw: null };
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
      publish({ ready: true, data, mode: "saved", notice: null, savedRaw: raw });
      return true;
    } catch {
      publish({ ready: true, data, mode: "temporary", notice: temporaryNotice, savedRaw: snapshot.savedRaw });
      return false;
    }
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
      if (raw === null) { persist(emptyProgress()); return; }
      const parsed = decodeProgress(raw);
      if (!parsed.ok) { publish({ ...snapshot, ready: true, mode: "protected", notice: protectedNotice(parsed.reason), savedRaw: raw }); return; }
      publish({ ready: true, data: parsed.data, mode: "saved", notice: null, savedRaw: raw });
      if (parsed.migrated) persist(parsed.data);
    },
    dispatch(action: ProgressAction) {
      if (!snapshot.ready) return;
      const next = reduceProgress(snapshot.data, action);
      if (next !== snapshot.data) persist(next);
    },
    replace(data: DojoProgress) { return persist(data, true); },
    reset() { return persist(emptyProgress(), true); },
    receiveExternal(raw: string | null) {
      if (raw === null) { publish({ ready: true, data: emptyProgress(), mode: "saved", notice: null, savedRaw: null }); return; }
      const parsed = decodeProgress(raw);
      if (!parsed.ok) { publish({ ...snapshot, mode: "protected", notice: protectedNotice(parsed.reason), savedRaw: raw }); return; }
      publish({ ready: true, data: parsed.data, mode: "saved", notice: null, savedRaw: raw });
    },
  };
}
export type ProgressStore = ReturnType<typeof createProgressStore>;
