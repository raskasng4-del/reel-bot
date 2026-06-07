import { type PhilosopherEntry, type MusicMood } from "./philosopher-data";

interface QuoteSource {
  content: string;
  author: string;
  tags?: string[];
}

const AUTHOR_MOOD: Record<string, MusicMood> = {
  "seneca": "sad-piano",
  "marcus aurelius": "meditative",
  "epictetus": "dark-ambient",
  "socrates": "greek",
  "plato": "greek",
  "aristotle": "thoughtful",
  "friedrich nietzsche": "dramatic",
  "immanuel kant": "thoughtful",
  "lao tzu": "meditative",
  "sun tzu": "epic",
  "arthur schopenhauer": "sad-emotional",
  "carl jung": "dark-ambient",
  "sigmund freud": "mysterious",
  "viktor frankl": "meditative",
  "abraham maslow": "thoughtful",
  "rumi": "meditative",
  "confucius": "thoughtful",
  "buddha": "meditative",
};

const TAG_MOOD: Record<string, MusicMood> = {
  "stoicism": "meditative",
  "philosophy": "thoughtful",
  "wisdom": "thoughtful",
  "inspirational": "epic",
  "life": "meditative",
  "death": "sad-emotional",
  "love": "sad-piano",
  "happiness": "thoughtful",
  "success": "epic",
  "psychology": "mysterious",
  "knowledge": "thoughtful",
  "courage": "epic",
  "change": "meditative",
  "truth": "thoughtful",
  "mindfulness": "meditative",
};

function guessMood(author: string, tags: string[] = []): MusicMood {
  const slug = author.toLowerCase().trim();
  if (AUTHOR_MOOD[slug]) return AUTHOR_MOOD[slug];
  for (const tag of tags) {
    const t = tag.toLowerCase().trim();
    if (TAG_MOOD[t]) return TAG_MOOD[t];
  }
  return "thoughtful";
}

function splitQuote(content: string, author: string): { hook: string; punchline: string } {
  const mid = Math.ceil(content.length / 2);
  const breakAt = content.indexOf(",", mid - 15);
  if (breakAt > 0 && breakAt < content.length - 10) {
    return {
      hook: content.slice(0, breakAt).trim(),
      punchline: content.slice(breakAt + 1).trim(),
    };
  }
  const breakAt2 = content.indexOf(" ", mid);
  if (breakAt2 > 0) {
    return {
      hook: content.slice(0, breakAt2).trim(),
      punchline: content.slice(breakAt2 + 1).trim(),
    };
  }
  return { hook: content, punchline: `— ${author}` };
}

async function fetchFromDummyJSON(count: number): Promise<QuoteSource[]> {
  const total = Math.min(count, 50);
  const ids: number[] = [];
  while (ids.length < total) {
    ids.push(Math.floor(Math.random() * 1454) + 1);
  }
  const uniqueIds = [...new Set(ids)].slice(0, total);
  const results: QuoteSource[] = [];

  for (const id of uniqueIds) {
    try {
      const res = await fetch(`https://dummyjson.com/quotes/${id}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.quote && data.author) {
        results.push({ content: data.quote, author: data.author });
      }
    } catch {
      continue;
    }
  }
  return results;
}

async function fetchFromZenQuotes(count: number): Promise<QuoteSource[]> {
  const results: QuoteSource[] = [];
  for (let i = 0; i < count; i++) {
    try {
      const res = await fetch("https://zenquotes.io/api/random");
      if (!res.ok) continue;
      const data = await res.json();
      if (data[0]?.q && data[0]?.a) {
        results.push({ content: data[0].q, author: data[0].a });
      }
    } catch {
      continue;
    }
  }
  return results;
}

export async function fetchRandomQuotes(count: number = 5): Promise<PhilosopherEntry[]> {
  let sources: QuoteSource[] = await fetchFromDummyJSON(count);

  if (sources.length < count) {
    const remaining = count - sources.length;
    const zen = await fetchFromZenQuotes(remaining);
    sources = [...sources, ...zen];
  }

  return sources.map((q) => {
    const { hook, punchline } = splitQuote(q.content, q.author);
    return {
      philosopher: q.author,
      hook,
      punchline,
      hashtags: (q.tags || ["quote", "wisdom"]).slice(0, 5).map(t => t.toLowerCase().replace(/\s+/g, "")),
      musicMood: guessMood(q.author, q.tags),
    };
  });
}
