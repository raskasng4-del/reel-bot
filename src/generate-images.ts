import fs from "fs";
import path from "path";

const ENGINE = process.env.IMAGE_ENGINE || "pexels";

const PHILOSOPHER_PROMPTS: Record<string, string> = {
  Seneca:
    "A dramatic dark portrait of Seneca the Younger, Roman Stoic philosopher, marble bust style, dramatic side lighting, dark moody background, cinematic 4K, high contrast, sigma aesthetic, dark academia",
  "Friedrich Nietzsche":
    "A dramatic dark portrait of Friedrich Nietzsche, intense gaze, dark moody background, cinematic lighting, high contrast black and white, sigma aesthetic, dark academia portrait photography",
  "Marcus Aurelius":
    "A dramatic dark portrait of Marcus Aurelius, Roman emperor and Stoic philosopher, marble bust, dramatic low-key lighting, dark moody background, cinematic 4K, sigma aesthetic",
  "Rene Descartes":
    "A dramatic dark portrait of Rene Descartes, French philosopher, dark moody background, dramatic chiaroscuro lighting, cinematic portrait, sigma aesthetic, dark academia",
  Socrates:
    "A dramatic dark portrait of Socrates, classical Greek marble bust, dramatic side lighting, dark moody background, cinematic 4K, high contrast, sigma aesthetic",
};

async function generateWithStabilityAI(
  philosopher: string,
  apiKey: string,
): Promise<string> {
  const prompt =
    PHILOSOPHER_PROMPTS[philosopher] ||
    `A dramatic dark portrait of ${philosopher}, dark moody background, cinematic lighting, sigma aesthetic, high contrast, 4K`;

  const response = await fetch(
    "https://api.stability.ai/v2beta/stable-image/generate/sd3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "image/*",
      },
      body: new URLSearchParams({
        prompt,
        output_format: "jpeg",
        aspect_ratio: "9:16",
        style_preset: "cinematic",
        negative_prompt: "bright, colorful, happy, cartoon, painting",
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Stability AI error ${response.status}: ${err}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const filename = `philosopher-${philosopher.replace(/\s+/g, "-").toLowerCase()}.jpg`;
  const filepath = path.resolve(__dirname, "../out", filename);
  fs.writeFileSync(filepath, buffer);

  return `file://${filepath}`;
}

async function generateWithReplicate(philosopher: string, apiKey: string) {
  const prompt =
    PHILOSOPHER_PROMPTS[philosopher] ||
    `A dramatic dark portrait of ${philosopher}, dark moody background, cinematic lighting, sigma aesthetic, high contrast`;

  const response = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: "9:16",
          output_format: "jpeg",
          negative_prompt: "bright, colorful, happy, cartoon, painting",
        },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate error ${response.status}: ${err}`);
  }

  const { urls } = await response.json();
  const outputUrl = urls?.get;

  if (!outputUrl) throw new Error("No output URL from Replicate");

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(outputUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const status = await statusRes.json();
    if (status.status === "succeeded") {
      return status.output?.[0] || status.output;
    }
    if (status.status === "failed") throw new Error("Replicate generation failed");
  }

  throw new Error("Replicate generation timed out");
}

export async function getPhilosopherImage(philosopher: string): Promise<string> {
  if (ENGINE === "stability") {
    const key = process.env.STABILITY_API_KEY;
    if (!key) throw new Error("Set STABILITY_API_KEY env var");
    return generateWithStabilityAI(philosopher, key);
  }

  if (ENGINE === "replicate") {
    const key = process.env.REPLICATE_API_TOKEN;
    if (!key) throw new Error("Set REPLICATE_API_TOKEN env var");
    return generateWithReplicate(philosopher, key);
  }

  throw new Error(`Unknown engine: ${ENGINE}`);
}
