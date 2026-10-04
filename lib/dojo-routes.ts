import { courseCatalog, PILOT_ID } from "./course-catalog";
import { nextCourseModule, resumeTarget } from "./course-engine";
import type { CourseCatalog, LearningProgress } from "./course-types";

export type TrainingRoute = { courseId: string; moduleId?: string; error?: string };
export function resolveTrainingRoute(hash: string, progress: LearningProgress, catalog: CourseCatalog = courseCatalog): TrainingRoute {
  const segments = hash.replace(/^#/, "").split("/");
  if (segments[0] !== "dojo" && hash !== "#training-content") return { courseId: "", error: "Training not found." };
  if (segments.length === 1 || hash === "#training-content") return resumeTarget(progress, catalog) ?? { courseId: "", error: "No practice is available yet." };
  if (segments.length === 2 && ["warmup", "lesson", "quiz"].includes(segments[1])) return { courseId: PILOT_ID, moduleId: segments[1] };
  const course = catalog.courses.find(item => item.id === segments[1]);
  if (!course || segments.length > 3) return { courseId: "", error: "This training link doesn't match the course catalog." };
  const moduleId = segments[2] ?? nextCourseModule(progress, course)?.id;
  if (segments[2] && !course.modules.some(module => module.id === segments[2])) return { courseId: course.id, error: "This step isn't part of this course." };
  return { courseId: course.id, moduleId };
}
