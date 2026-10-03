export const principles = [
  {
    id: "order", name: "ORDER", number: "01", icon: { x: 208, w: 64 },
    homeCopy: ["A clear mind. A strong system.", "Build your environment with intention."],
    title: "A clear mind. A strong system.",
    description: "Create room to think before you act. Repeat the basics until a careful response becomes easier than a rushed one. Progress begins with a routine you can return to.",
    habits: ["Pause when a message tries to rush you.", "Verify a request through a channel you already trust.", "Take one clear step at a time."],
    maxim: "Move with intention.",
    scenario: {
      title: "An urgent message lands in your inbox.",
      situation: "It says you have 30 minutes to save your account. The pressure makes immediate action feel like the only option.",
      response: "Pause. Open the service through its official app or a known address, then check the request there.",
      reflection: "A message should not choose your destination. Your routine should.",
    },
    commitment: "I will pause and verify before I act.",
  },
  {
    id: "respect", name: "RESPECT", number: "02", icon: { x: 645, w: 62 },
    homeCopy: ["For data. For others. For yourself.", "Ethics first. Always."],
    title: "For data. For others. For yourself.",
    description: "There are people behind every account, file and system. Treat their privacy with care, respect agreed boundaries and make learning a place where questions are welcome.",
    habits: ["Get permission before testing someone else’s systems.", "Stay within the agreed scope and protect private data.", "Help beginners ask questions without embarrassment."],
    maxim: "Skill comes with responsibility.",
    scenario: {
      title: "You want to test a friend’s website.",
      situation: "You have learned something new and want to help. Being friends does not tell you which tests they are comfortable with.",
      response: "Ask for explicit permission and agree on the boundaries first. Keep practicing in an environment where testing is allowed.",
      reflection: "A useful skill starts with respect for the person it could affect.",
    },
    commitment: "I will practice within agreed boundaries.",
  },
  {
    id: "honor", name: "HONOR", number: "03", icon: { x: 1117, w: 66 },
    homeCopy: ["Do what’s right when it counts.", "Become someone others trust."],
    title: "Do what’s right when it counts.",
    description: "Let your actions match your words. Be honest about what you know, own your mistakes and pass on what you learn. Trust grows through small choices made consistently.",
    habits: ["Say when you are unsure instead of pretending.", "Own a mistake and turn it into a lesson.", "Share what you learn in clear, useful language."],
    maxim: "Become someone others can trust.",
    scenario: {
      title: "You make a mistake during practice.",
      situation: "Your first instinct is to hide it or blame the tool. You also have a chance to understand it and help the next learner.",
      response: "Write down what happened, say what you are unsure about and explain what you learned in plain language.",
      reflection: "Honest progress is a stronger foundation than a perfect-looking result.",
    },
    commitment: "I will learn honestly and help the next person.",
  },
] as const;

export type PrincipleId = typeof principles[number]["id"];

export function isPrincipleId(value: string | undefined): value is PrincipleId {
  return principles.some(principle => principle.id === value);
}
