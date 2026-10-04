import type { BeltId } from "./dojo-content";

export type Question = { id: string; prompt: string; options: string[]; correct: number; explanation: string };
type ModuleBase = { id: string; title: string; intro: string; reward: number };
export type WarmupModule = ModuleBase & { kind: "warmup"; scenario: { from: string; title: string; body: string; action: string }; question: Question };
export type LessonModule = ModuleBase & { kind: "lesson"; lead?: string; sections: { title: string; body: string }[]; note?: { title: string; body: string } };
export type QuizModule = ModuleBase & { kind: "quiz"; questions: Question[]; passingScore: number };
export type TrainingModule = WarmupModule | LessonModule | QuizModule;
export type CourseDefinition = { id: string; belt: BeltId; title: string; summary: string; availability: "available" | "planned"; prerequisites: string[]; modules: TrainingModule[] };
export type CourseCatalog = { schemaVersion: 1; courses: CourseDefinition[] };
export type ModuleProgress = { completed: boolean; answers: Record<string, string>; submitted: boolean };
export type CourseProgress = { modules: Record<string, ModuleProgress> };
export type LearningProgress = { courses: Record<string, CourseProgress> };
export type CourseStatus = "not-started" | "in-progress" | "completed" | "unavailable" | "locked";
