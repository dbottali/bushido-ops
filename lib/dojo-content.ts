export type ModuleId = "warmup" | "lesson" | "quiz";
export const rewards: Record<ModuleId, number> = { warmup: 20, lesson: 30, quiz: 50 };
export function earnedXp(completed: ModuleId[]) {
  return [...new Set(completed)].reduce((total, item) => total + rewards[item], 0);
}
export function finishModule(completed: ModuleId[], module: ModuleId): ModuleId[] {
  return completed.includes(module) ? completed : [...completed, module];
}
export const belts = [
  { id: "white", name: "White", x: 157, topic: "Everyday digital self-defense", description: "Start with suspicious messages, independent verification, and safer habits.", available: true },
  { id: "yellow", name: "Yellow", x: 328, topic: "Accounts & identity", description: "Unique passwords, password managers, multifactor authentication, and account recovery.", available: false },
  { id: "orange", name: "Orange", x: 507, topic: "Devices & data", description: "Updates, backups, device security, and protecting your personal information.", available: false },
  { id: "green", name: "Green", x: 692, topic: "Networks & the web", description: "Understand connections, safe browsing, and the basics of network security.", available: false },
  { id: "blue", name: "Blue", x: 880, topic: "Defensive thinking", description: "Recognize threats, understand risk, and build practical defenses.", available: false },
  { id: "purple", name: "Purple", x: 1066, topic: "Investigation & detection", description: "Read the signals, investigate suspicious activity, and document what happened.", available: false },
  { id: "brown", name: "Brown", x: 1238, topic: "Incident response", description: "Contain a problem, recover safely, and improve your defenses.", available: false },
  { id: "black", name: "Black", x: 1418, topic: "Practice & mentorship", description: "Apply your skills with care and help the next person find their path.", available: false },
] as const;
export type BeltId = (typeof belts)[number]["id"];
export function isBeltId(value: string | undefined): value is BeltId {
  return belts.some(belt => belt.id === value);
}
export const warmup = {
  prompt: "A message says your account will be deleted in 30 minutes. What is the safest first move?",
  options: ["Click the link before time runs out.", "Open the service yourself, using its app or a known address.", "Reply with your password to prove it is your account."],
  correct: 1,
};
export const questions = [
  { prompt: "A message uses a company's real logo. Does that prove it is genuine?", options: ["Yes. Only the company can use its logo.", "No. A logo can be copied.", "Yes, if the message sounds professional."], correct: 1, explanation: "Logos and writing styles are easy to copy. Verify the request through a channel you already trust." },
  { prompt: "You receive an unexpected security alert. Where should you check it?", options: ["In the link provided by the message.", "By replying to the sender.", "In the official app or website you open independently."], correct: 2, explanation: "Open the official service yourself. Do not let an unexpected message choose your destination." },
  { prompt: "A caller asks for your one-time sign-in code. What should you do?", options: ["Keep the code private and verify through the service's official support.", "Share it if they know your name.", "Share it if they say it is urgent."], correct: 0, explanation: "A one-time code can let someone into your account. Keep it private, end the call, and verify independently." },
];
