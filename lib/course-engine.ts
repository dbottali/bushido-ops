import type { CourseCatalog, CourseDefinition, CourseStatus, LearningProgress, ModuleProgress, Question, TrainingModule } from "./course-types";

const beltIds = ["white", "yellow", "orange", "green", "blue", "purple", "brown", "black"];
export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
export const isStableId = (value: unknown): value is string => typeof value === "string" && /^[a-z][a-z0-9-]{0,79}$/.test(value) && !["constructor", "prototype"].includes(value);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= 12000;
const count = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 10000;
function requireValid(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(`Invalid course catalog: ${message}`); }
function uniqueIds(items: { id: string }[]) { return new Set(items.map(item => item.id)).size === items.length; }

export function validateCatalog(raw: unknown): CourseCatalog {
  requireValid(isRecord(raw) && raw.schemaVersion === 1 && Array.isArray(raw.courses) && raw.courses.length > 0 && raw.courses.length <= 100, "expected schemaVersion 1 and a course list");
  for (const course of raw.courses) {
    requireValid(isRecord(course) && isStableId(course.id) && beltIds.includes(String(course.belt)) && text(course.title) && text(course.summary), "course identity or text");
    requireValid(["available", "planned"].includes(String(course.availability)) && Array.isArray(course.prerequisites) && course.prerequisites.every(isStableId) && new Set(course.prerequisites).size === course.prerequisites.length, "availability or prerequisites");
    requireValid(Array.isArray(course.modules) && course.modules.length <= 100 && (course.availability !== "available" || course.modules.length > 0), "an available course needs modules");
    for (const module of course.modules) {
      requireValid(isRecord(module) && isStableId(module.id) && text(module.title) && text(module.intro) && count(module.reward), "module identity, text or reward");
      requireValid(["warmup", "lesson", "quiz"].includes(String(module.kind)), "unsupported module kind");
      if (module.kind === "lesson") {
        requireValid(module.lead === undefined || text(module.lead), "lesson lead");
        requireValid(Array.isArray(module.sections) && module.sections.length > 0 && module.sections.length <= 100 && module.sections.every(section => isRecord(section) && text(section.title) && text(section.body)), "lesson sections");
        requireValid(module.note === undefined || (isRecord(module.note) && text(module.note.title) && text(module.note.body)), "lesson note");
      } else {
        if (module.kind === "warmup") requireValid(isRecord(module.scenario) && ["from", "title", "body", "action"].every(key => text(module.scenario && (module.scenario as Record<string, unknown>)[key])), "warm-up scenario");
        const questions = module.kind === "warmup" ? [module.question] : module.questions;
        requireValid(Array.isArray(questions) && questions.length > 0 && questions.length <= 100, "question list");
        for (const question of questions) {
          requireValid(isRecord(question) && isStableId(question.id) && text(question.prompt) && text(question.explanation) && Array.isArray(question.options) && question.options.length >= 2 && question.options.length <= 10 && question.options.every(text) && Number.isInteger(question.correct) && Number(question.correct) >= 0 && Number(question.correct) < question.options.length, "question, choices or correct answer");
        }
        requireValid(uniqueIds(questions as Question[]), "duplicate question IDs");
        if (module.kind === "quiz") requireValid(Number.isInteger(module.passingScore) && Number(module.passingScore) > 0 && Number(module.passingScore) <= questions.length, "quiz passing score");
      }
    }
    requireValid(uniqueIds(course.modules as TrainingModule[]), "duplicate module IDs");
  }
  const catalog = raw as unknown as CourseCatalog;
  requireValid(uniqueIds(catalog.courses), "duplicate course IDs");
  const visited = new Set<string>(), visiting = new Set<string>();
  function visit(course: CourseDefinition) {
    requireValid(!visiting.has(course.id), "cyclic prerequisites");
    if (visited.has(course.id)) return;
    visiting.add(course.id);
    for (const id of course.prerequisites) {
      const prerequisite = catalog.courses.find(item => item.id === id);
      requireValid(prerequisite, `unknown prerequisite ${id}`);
      visit(prerequisite);
    }
    visiting.delete(course.id); visited.add(course.id);
  }
  catalog.courses.forEach(visit);
  return catalog;
}

export function moduleQuestions(module: TrainingModule): Question[] { return module.kind === "warmup" ? [module.question] : module.kind === "quiz" ? module.questions : []; }
export function emptyModule(module: TrainingModule): ModuleProgress { return { completed: false, answers: Object.fromEntries(moduleQuestions(module).map(question => [question.id, ""])), submitted: false }; }
export function moduleProgress(data: LearningProgress, course: CourseDefinition, module: TrainingModule): ModuleProgress { return data.courses[course.id]?.modules[module.id] ?? emptyModule(module); }
export function completedModules(data: LearningProgress, course: CourseDefinition): string[] { return course.modules.filter(module => moduleProgress(data, course, module).completed).map(module => module.id); }
export function courseComplete(data: LearningProgress, course: CourseDefinition): boolean { return course.availability === "available" && course.modules.length > 0 && completedModules(data, course).length === course.modules.length; }
export function courseXp(data: LearningProgress, course: CourseDefinition): number { return course.availability === "available" ? course.modules.reduce((sum, module) => sum + (moduleProgress(data, course, module).completed ? module.reward : 0), 0) : 0; }
export function courseMaxXp(course: CourseDefinition): number { return course.modules.reduce((sum, module) => sum + module.reward, 0); }
export function courseStarted(data: LearningProgress, course: CourseDefinition): boolean { return course.modules.some(module => { const progress = moduleProgress(data, course, module); return progress.completed || progress.submitted || Object.values(progress.answers).some(answer => answer !== ""); }); }
export function canTrain(data: LearningProgress, course: CourseDefinition, catalog: CourseCatalog): boolean { return course.availability === "available" && course.prerequisites.every(id => { const prerequisite = catalog.courses.find(item => item.id === id); return !!prerequisite && courseComplete(data, prerequisite); }); }
export function courseStatus(data: LearningProgress, course: CourseDefinition, catalog: CourseCatalog): CourseStatus {
  if (course.availability !== "available") return "unavailable";
  if (!canTrain(data, course, catalog)) return "locked";
  return courseComplete(data, course) ? "completed" : courseStarted(data, course) ? "in-progress" : "not-started";
}
export const statusLabels: Record<CourseStatus, string> = { "not-started": "NOT STARTED", "in-progress": "IN PROGRESS", completed: "COMPLETE", unavailable: "IN DEVELOPMENT", locked: "PREREQUISITE NEEDED" };
export function nextCourseModule(data: LearningProgress, course: CourseDefinition): TrainingModule | undefined { return course.modules.find(module => !moduleProgress(data, course, module).completed) ?? course.modules[0]; }
export function resumeTarget(data: LearningProgress, catalog: CourseCatalog): { courseId: string; moduleId: string } | null {
  const accessible = catalog.courses.filter(course => canTrain(data, course, catalog));
  const course = accessible.find(item => !courseComplete(data, item) && courseStarted(data, item)) ?? accessible.find(item => !courseComplete(data, item)) ?? accessible[0];
  const module = course && nextCourseModule(data, course);
  return course && module ? { courseId: course.id, moduleId: module.id } : null;
}
export function trainingHref(courseId: string, moduleId?: string): string { return `#dojo/${encodeURIComponent(courseId)}${moduleId ? `/${encodeURIComponent(moduleId)}` : ""}`; }
export function gradeModule(module: TrainingModule, progress: ModuleProgress): { answered: number; correct: number; total: number; passed: boolean } {
  const questions = moduleQuestions(module);
  const answered = questions.filter(question => progress.answers[question.id] !== "" && progress.answers[question.id] !== undefined).length;
  const correct = questions.filter(question => progress.answers[question.id] !== "" && progress.answers[question.id] !== undefined && Number(progress.answers[question.id]) === question.correct).length;
  return { answered, correct, total: questions.length, passed: questions.length > 0 && answered === questions.length && correct >= (module.kind === "quiz" ? module.passingScore : 1) };
}
export function learningSummary(data: LearningProgress, catalog: CourseCatalog) {
  const available = catalog.courses.filter(course => course.availability === "available");
  return { xp: available.reduce((sum, course) => sum + courseXp(data, course), 0), maxXp: available.reduce((sum, course) => sum + courseMaxXp(course), 0), completedCourses: available.filter(course => courseComplete(data, course)).length, availableCourses: available.length, completedModules: available.reduce((sum, course) => sum + completedModules(data, course).length, 0), totalModules: available.reduce((sum, course) => sum + course.modules.length, 0) };
}
