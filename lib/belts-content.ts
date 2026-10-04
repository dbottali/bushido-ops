import type { BeltId } from "@/lib/dojo-content";

type Curriculum = { focus: string; outcomes: readonly string[]; mission: string; situation: string; nextMove: string };

export const beltCurriculum = {
  white: {
    focus: "A calmer first response.",
    outcomes: ["Notice urgency and pressure in an unexpected message.", "Verify a request through an app, address or number you already trust.", "Keep passwords and sign-in codes private, and report suspicious messages."],
    mission: "THE 30-MINUTE DEADLINE",
    situation: "A message says your account will be deleted unless you confirm your login right now. The clock is ticking. What do you do first?",
    nextMove: "Pause. Open the official service yourself. Check the request there.",
  },
  yellow: {
    focus: "Make your identity harder to borrow.",
    outcomes: ["Build a habit of unique passwords with a password manager.", "Understand multifactor authentication and recovery options.", "Review how someone could regain access to an account."],
    mission: "THE ACCOUNT CHECKUP",
    situation: "Your email account is the recovery address for several other services. Plan how you would strengthen its sign-in and recovery settings.",
    nextMove: "Map the account, its sign-in methods and its recovery routes before making changes.",
  },
  orange: {
    focus: "Take care of what you carry.",
    outcomes: ["Build an update and device-lock routine.", "Plan backups and practice restoring a test file.", "Recognize what personal information an app can access."],
    mission: "THE LOST LAPTOP",
    situation: "Imagine your laptop goes missing tomorrow. Work through what you could recover and what information might be exposed.",
    nextMove: "Inventory the data, check the backup plan and identify the protections already in place.",
  },
  green: {
    focus: "Understand the connection.",
    outcomes: ["Learn what happens between your device and a website.", "Read a web address and understand connection indicators.", "Explore a home network and its settings in a practice environment."],
    mission: "THE CONNECTION MAP",
    situation: "Follow a fictional device from its Wi-Fi connection to a website. Identify the network, the destination and the questions you would ask.",
    nextMove: "Draw the route and check each part instead of trusting a familiar-looking page.",
  },
  blue: {
    focus: "Choose a defense with purpose.",
    outcomes: ["Identify what matters and how it could be affected.", "Compare likelihood, impact and the effort needed to reduce risk.", "Choose practical defenses for a realistic everyday situation."],
    mission: "THE SMALL-TEAM DEFENSE",
    situation: "A fictional team shares devices, documents and accounts. It has time to improve three habits. Decide where those changes would help most.",
    nextMove: "Start with the assets and likely problems, then explain why each defense belongs in the plan.",
  },
  purple: {
    focus: "Follow the signals carefully.",
    outcomes: ["Read sample alerts and activity records.", "Separate an observation from an assumption.", "Build a clear timeline and document what still needs checking."],
    mission: "THE UNFAMILIAR SIGN-IN",
    situation: "A practice log contains a sign-in that looks unusual. Compare the surrounding events before deciding what it means.",
    nextMove: "Record the evidence, look for context and keep your conclusions separate from your questions.",
  },
  brown: {
    focus: "Respond with a clear plan.",
    outcomes: ["Work through containment decisions in a simulated incident.", "Plan recovery and check that a restored service works.", "Write a useful incident note and identify improvements."],
    mission: "THE RECOVERY TABLETOP",
    situation: "A fictional device shows signs of compromise. Walk through a response with a practice team and agree on who does what.",
    nextMove: "Assess the situation, preserve useful evidence and make containment and recovery decisions together.",
  },
  black: {
    focus: "Practice well. Help the next person.",
    outcomes: ["Connect the earlier skills in an end-to-end practice scenario.", "Explain your decisions and recognize the limits of your knowledge.", "Guide a beginner through a useful habit with patience and care."],
    mission: "THE NEXT PERSON’S FIRST STEP",
    situation: "Bring a practice defense plan together, then explain one part to someone who is new to security.",
    nextMove: "Make the explanation clear, invite questions and use feedback to improve your own understanding.",
  },
} as const satisfies Record<BeltId, Curriculum>;

export const beltQuestions = [
  { question: "Where should I start?", answer: "Start at White Belt. Its phishing-awareness pilot is open now and needs no signup or technical experience. The other belts show the planned learning path." },
  { question: "Does 100 XP unlock Yellow Belt?", answer: "100 XP marks completion of the three White Belt pilot modules. The remaining curriculum and full belt advancement are still in development. The pilot does not issue an accredited certification." },
  { question: "Can I retry or change modules?", answer: "Yes. You can move between Warm-up, Lesson and Quiz and retry the exercises. Each module awards XP once in your saved progress. Reloading keeps it when this browser allows saving. Export or import a backup and manage resets in Your Progress." },
] as const;
