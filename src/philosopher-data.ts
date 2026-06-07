export type MusicMood =
  | "dark-ambient"
  | "sad-piano"
  | "epic"
  | "meditative"
  | "greek"
  | "thoughtful"
  | "sad-emotional"
  | "dramatic"
  | "mysterious";

export interface PhilosopherEntry {
  philosopher: string;
  hook: string;
  punchline: string;
  hashtags: string[];
  musicMood?: MusicMood;
}

export const PHILOSOPHER_QUOTES: PhilosopherEntry[] = [
  {
    philosopher: "Seneca",
    hook: "We suffer more in imagination",
    punchline: "than in reality.",
    hashtags: ["stoicism", "seneca", "stoic", "philosophy", "mentality"],
    musicMood: "sad-piano",
  },
  {
    philosopher: "Seneca",
    hook: "Luck is what happens when preparation",
    punchline: "meets opportunity.",
    hashtags: ["stoicism", "seneca", "discipline", "success", "mindset"],
    musicMood: "dark-ambient",
  },
  {
    philosopher: "Friedrich Nietzsche",
    hook: "He who has a why to live for",
    punchline: "can bear almost any how.",
    hashtags: ["nietzsche", "philosophy", "meaning", "resilience"],
    musicMood: "dramatic",
  },
  {
    philosopher: "Friedrich Nietzsche",
    hook: "What doesn't kill me",
    punchline: "makes me stronger.",
    hashtags: ["nietzsche", "strength", "mindset", "sigma"],
    musicMood: "epic",
  },
  {
    philosopher: "Marcus Aurelius",
    hook: "The happiness of your life depends",
    punchline: "upon the quality of your thoughts.",
    hashtags: ["marcusaurelius", "stoicism", "mindset", "wisdom"],
    musicMood: "meditative",
  },
  {
    philosopher: "Marcus Aurelius",
    hook: "You have power over your mind — not outside events.",
    punchline: "Realize this, and you will find strength.",
    hashtags: ["stoicism", "marcusaurelius", "control", "power"],
    musicMood: "meditative",
  },
  {
    philosopher: "Socrates",
    hook: "The unexamined life",
    punchline: "is not worth living.",
    hashtags: ["socrates", "philosophy", "wisdom", "selfawareness"],
    musicMood: "greek",
  },
  {
    philosopher: "Epictetus",
    hook: "It's not what happens to you, but how you react",
    punchline: "that matters.",
    hashtags: ["epictetus", "stoicism", "reaction", "control"],
    musicMood: "dark-ambient",
  },
  {
    philosopher: "Epictetus",
    hook: "First say to yourself what you would be;",
    punchline: "then do what you have to do.",
    hashtags: ["epictetus", "stoicism", "action", "discipline"],
    musicMood: "thoughtful",
  },
  {
    philosopher: "Aristotle",
    hook: "We are what we repeatedly do.",
    punchline: "Excellence, then, is not an act, but a habit.",
    hashtags: ["aristotle", "habits", "excellence", "discipline"],
    musicMood: "thoughtful",
  },
  {
    philosopher: "Plato",
    hook: "The measure of a man is what he does",
    punchline: "with power.",
    hashtags: ["plato", "power", "character", "philosophy"],
    musicMood: "greek",
  },
  {
    philosopher: "Lao Tzu",
    hook: "The journey of a thousand miles",
    punchline: "begins with a single step.",
    hashtags: ["laotzu", "taoism", "journey", "wisdom"],
    musicMood: "meditative",
  },
  {
    philosopher: "Sun Tzu",
    hook: "In the midst of chaos, there is also",
    punchline: "opportunity.",
    hashtags: ["suntzu", "strategy", "chaos", "opportunity"],
    musicMood: "epic",
  },
  {
    philosopher: "Arthur Schopenhauer",
    hook: "The greatest of follies is to sacrifice health",
    punchline: "for any other kind of happiness.",
    hashtags: ["schopenhauer", "health", "wisdom", "philosophy"],
    musicMood: "sad-emotional",
  },
  {
    philosopher: "Immanuel Kant",
    hook: "Act in such a way that you treat humanity",
    punchline: "never merely as a means, but always at the same time as an end.",
    hashtags: ["kant", "ethics", "philosophy", "morality"],
    musicMood: "thoughtful",
  },

  // ─── Psychology ─────────────────────────────────────────────
  {
    philosopher: "Carl Jung",
    hook: "I am not what happened to me,",
    punchline: "I am what I choose to become.",
    hashtags: ["jung", "psychology", "growth", "selfawareness", "identity"],
    musicMood: "dark-ambient",
  },
  {
    philosopher: "Carl Jung",
    hook: "Until you make the unconscious conscious,",
    punchline: "it will direct your life and you will call it fate.",
    hashtags: ["jung", "psychology", "unconscious", "selfawareness", "shadow"],
    musicMood: "mysterious",
  },
  {
    philosopher: "Carl Jung",
    hook: "The privilege of a lifetime is to become",
    punchline: "who you truly are.",
    hashtags: ["jung", "psychology", "individuation", "self", "authenticity"],
    musicMood: "thoughtful",
  },
  {
    philosopher: "Viktor Frankl",
    hook: "Between stimulus and response there is a space.",
    punchline: "In that space is our power to choose our response.",
    hashtags: ["frankl", "psychology", "logotherapy", "meaning", "freedom"],
    musicMood: "meditative",
  },
  {
    philosopher: "Viktor Frankl",
    hook: "Those who have a 'why' to live,",
    punchline: "can bear with almost any 'how'.",
    hashtags: ["frankl", "meaning", "resilience", "psychology", "purpose"],
    musicMood: "sad-piano",
  },
  {
    philosopher: "Viktor Frankl",
    hook: "When we are no longer able to change a situation,",
    punchline: "we are challenged to change ourselves.",
    hashtags: ["frankl", "psychology", "change", "acceptance", "growth"],
    musicMood: "meditative",
  },
  {
    philosopher: "Sigmund Freud",
    hook: "The mind is like an iceberg,",
    punchline: "it floats with one-seventh of its bulk above water.",
    hashtags: ["freud", "psychology", "unconscious", "mind", "psychoanalysis"],
    musicMood: "mysterious",
  },
  {
    philosopher: "Sigmund Freud",
    hook: "Unexpressed emotions will never die.",
    punchline: "They are buried alive and will come forth later in uglier ways.",
    hashtags: ["freud", "psychology", "emotions", "repression", "healing"],
    musicMood: "dramatic",
  },
  {
    philosopher: "Abraham Maslow",
    hook: "What a man can be,",
    punchline: "he must be.",
    hashtags: ["maslow", "psychology", "selfactualization", "potential", "growth"],
    musicMood: "thoughtful",
  },
  {
    philosopher: "Abraham Maslow",
    hook: "The story of the human race is the story of men and women",
    punchline: "selling themselves short.",
    hashtags: ["maslow", "psychology", "potential", "limitations", "growth"],
    musicMood: "sad-piano",
  },
  {
    philosopher: "Carl Rogers",
    hook: "The curious paradox is that when I accept myself just as I am,",
    punchline: "then I can change.",
    hashtags: ["rogers", "psychology", "acceptance", "change", "growth"],
    musicMood: "meditative",
  },
  {
    philosopher: "Carl Rogers",
    hook: "What I am is good enough",
    punchline: "if I would only be it openly.",
    hashtags: ["rogers", "psychology", "authenticity", "selfacceptance", "being"],
    musicMood: "thoughtful",
  },
  {
    philosopher: "B.F. Skinner",
    hook: "The real problem is not whether machines think,",
    punchline: "but whether men do.",
    hashtags: ["skinner", "psychology", "thinking", "behaviorism", "mind"],
    musicMood: "thoughtful",
  },
  {
    philosopher: "William James",
    hook: "The greatest discovery of my generation is that a human being",
    punchline: "can alter his life by altering his attitudes.",
    hashtags: ["james", "psychology", "attitude", "change", "mindset"],
    musicMood: "epic",
  },
  {
    philosopher: "William James",
    hook: "Act as if what you do makes a difference.",
    punchline: "It does.",
    hashtags: ["james", "psychology", "action", "impact", "meaning"],
    musicMood: "thoughtful",
  },
];

export function randomEntries(count: number): PhilosopherEntry[] {
  const shuffled = [...PHILOSOPHER_QUOTES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
