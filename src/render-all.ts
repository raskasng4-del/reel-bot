import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import philosophers from "./philosophers.json";
import { getPhilosopherImage } from "./generate-images";

const PEXELS_API_KEY = "SDW3Y5RfFJuGxPad7WlmNx02fJ8Q1GqLJuJNdGTO74G1bUorK3qRGG5a";
const BROWSER_EXECUTABLE = "/usr/bin/chromium-browser";

const SOURCE = process.env.IMAGE_SOURCE || "pexels";

async function fetchPhilosopherImage(philosopher: string): Promise<string> {
  if (SOURCE === "ai") {
    return getPhilosopherImage(philosopher);
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(philosopher + " philosopher statue")}&per_page=1&orientation=portrait`;

  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY },
  });

  if (!res.ok) throw new Error(`Pexels error: ${res.status}`);

  const data = await res.json();
  const photo = data.photos?.[0];

  if (!photo) throw new Error(`No image found for: ${philosopher}`);

  return photo.src.large;
}

async function main() {
  const entryPoint = path.resolve(__dirname, "./index.ts");

  console.log(`Bundling (image source: ${SOURCE})...`);
  const bundleLocation = await bundle({ entryPoint });

  const outDir = path.resolve(__dirname, "../out");
  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < philosophers.length; i++) {
    const item = philosophers[i];
    const outputPath = path.join(outDir, `reel-${i + 1}.mp4`);

    console.log(`\n[${i + 1}/${philosophers.length}] "${item.hook}"`);
    console.log(`  Fetching image for: ${item.philosopher}...`);

    let imageUrl: string;
    try {
      imageUrl = await fetchPhilosopherImage(item.philosopher);
      console.log(`  Image: ${imageUrl.slice(0, 80)}...`);
    } catch (err) {
      console.error(`  Failed: ${err}`);
      imageUrl = "";
    }

    const inputProps = {
      hook: item.hook,
      punchline: item.punchline,
      imageUrl,
    };

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "PhilosophyReel",
      inputProps,
      browserExecutable: BROWSER_EXECUTABLE,
    });

    console.log(`  Rendering...`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      browserExecutable: BROWSER_EXECUTABLE,
    });

    console.log(`  Done: ${outputPath}`);
  }

  console.log("\nAll reels rendered!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
