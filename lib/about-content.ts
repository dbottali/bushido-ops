import type { ModuleId } from "@/lib/dojo-content";

export const aboutLearners = [
  { title: "NEW TO SECURITY", icon: { x: 195, y: 546, w: 62, h: 65 }, copy: "Start from the basics. You do not need technical experience or the right vocabulary to begin." },
  { title: "EVERYDAY DIGITAL LIFE", icon: { x: 629, y: 550, w: 57, h: 61 }, copy: "Build habits you can use around your accounts, messages and devices. Give the learning a practical purpose." },
  { title: "CURIOUS LEARNERS", icon: { x: 1093, y: 556, w: 66, h: 57 }, copy: "Explore one idea at a time. Ask questions, try again and understand the reason behind your next move." },
] as const;

export const aboutModules = [
  {
    id: "warmup", number: "01", name: "WARM-UP", title: "Notice the pressure. Choose your next move.",
    description: "Start with one realistic situation. In the White Belt pilot, an urgent account message asks you to act before you have time to think.",
    action: "Choose a response and get an explanation. A correct answer earns the Warm-up reward; you can retry when you need to.",
    rewardCondition: "Correct response", cta: "TRY THE WARM-UP", art: { x: 360, y: 402, w: 232, h: 96 },
  },
  {
    id: "lesson", number: "02", name: "LESSON", title: "Learn the reason behind the move.",
    description: "A short lesson connects the situation to a useful habit. The first practice introduces a three-move routine: pause, verify and protect.",
    action: "Read the explanation at your own pace, then mark the lesson complete. Bring the habit into the next exercise.",
    rewardCondition: "Lesson marked complete", cta: "OPEN THE LESSON", art: { x: 822, y: 390, w: 212, h: 114 },
  },
  {
    id: "quiz", number: "03", name: "QUIZ", title: "Check your understanding. Keep practicing.",
    description: "Put the idea into practice with three questions. Each answer has an explanation, so the result gives you something to learn from.",
    action: "Answer all three correctly to earn the Quiz reward. Review the feedback and retry if you need another attempt.",
    rewardCondition: "All three answers correct", cta: "TRY THE QUIZ", art: { x: 1258, y: 399, w: 247, h: 105 },
  },
] as const satisfies readonly { id: ModuleId; number: string; name: string; title: string; description: string; action: string; rewardCondition: string; cta: string; art: { x: number; y: number; w: number; h: number } }[];

export const aboutQuestions = [
  { question: "Do I need technical experience?", answer: "No. The first practice starts with everyday messages and plain-language explanations. Begin with the Warm-up and work through the lesson and quiz at your own pace." },
  { question: "Do I need an account?", answer: "The current pilot needs no signup. Training progress and dojo-code choices stay in this open session. Reloading the page resets them." },
  { question: "What can I practice today?", answer: "The White Belt phishing pilot is available now: one Warm-up, a short lesson and a three-question quiz. The remaining belt curriculum is still in development." },
  { question: "How do XP and retries work?", answer: "The pilot awards 20 XP for the correct Warm-up response, 30 XP for marking the lesson complete and 50 XP for a perfect quiz. Each module awards once per session. You can retry the Warm-up and Quiz without adding duplicate XP." },
  { question: "Does completing the pilot earn a certification?", answer: "No. The pilot is a practice experience. Its 100 XP marks completion of these three modules; it does not issue an accredited certification or unlock the full belt curriculum." },
] as const;
