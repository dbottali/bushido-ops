import { courseCatalog, pilotCourse } from "./course-catalog";

export type ModuleId = "warmup" | "lesson" | "quiz";
// About previews the existing pilot; playable content and rewards live in JSON.
export const rewards = Object.fromEntries(pilotCourse.modules.map(module => [module.id, module.reward])) as Record<ModuleId, number>;
const beltDefinitions = [
  { id: "white", name: "White", x: 157, topic: "Everyday digital self-defense", description: "Start with suspicious messages, independent verification, and safer habits.", available: true },
  { id: "yellow", name: "Yellow", x: 328, topic: "Accounts & identity", description: "Unique passwords, password managers, multifactor authentication, and account recovery.", available: false },
  { id: "orange", name: "Orange", x: 507, topic: "Devices & data", description: "Updates, backups, device security, and protecting your personal information.", available: false },
  { id: "green", name: "Green", x: 692, topic: "Networks & the web", description: "Understand connections, safe browsing, and the basics of network security.", available: false },
  { id: "blue", name: "Blue", x: 880, topic: "Defensive thinking", description: "Recognize threats, understand risk, and build practical defenses.", available: false },
  { id: "purple", name: "Purple", x: 1066, topic: "Investigation & detection", description: "Read the signals, investigate suspicious activity, and document what happened.", available: false },
  { id: "brown", name: "Brown", x: 1238, topic: "Incident response", description: "Contain a problem, recover safely, and improve your defenses.", available: false },
  { id: "black", name: "Black", x: 1418, topic: "Practice & mentorship", description: "Apply your skills with care and help the next person find their path.", available: false },
] as const;
export type BeltId = (typeof beltDefinitions)[number]["id"];
export const belts = beltDefinitions.map(belt => ({ ...belt, available: courseCatalog.courses.some(course => course.belt === belt.id && course.availability === "available") }));
export function isBeltId(value: string | undefined): value is BeltId {
  return belts.some(belt => belt.id === value);
}
