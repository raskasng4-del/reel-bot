import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { PHILOSOPHER_QUOTES, randomEntries, type PhilosopherEntry } from "./philosopher-data";
import { getPhilosopherImage } from "./generate-images";
import { getMusicForPhilosopher, addMusicToVideo } from "./download-music";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "SDW3Y5RfFJuGxPad7WlmNx02fJ8Q1GqLJuJNdGTO74G1bUorK3qRGG5a";
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "52435323-f7088602629340a1338d67b2b";
const BROWSER_EXECUTABLE = (() => {
  const env = process.env.BROWSER_EXECUTABLE;
  if (env) return env;
  const paths = ["/usr/bin/chromium-browser", "/usr/bin/google-chrome", "/usr/bin/chromium", "/snap/bin/chromium"];
  for (const p of paths) {
    try { if (fs.statSync(p).isFile()) return p; } catch {}
  }
  return undefined;
})();
const SOURCE = process.env.IMAGE_SOURCE || "pexels";

const OUT_DIR = path.resolve(__dirname, "../out");
const IMAGE_STATE_FILE = path.join(OUT_DIR, "used-images.json");

function loadUsedImages(): Record<string, string[]> {
  try {
    return JSON.parse(fs.readFileSync(IMAGE_STATE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveUsedImage(philosopher: string, url: string) {
  const state = loadUsedImages();
  if (!state[philosopher]) state[philosopher] = [];
  if (!state[philosopher].includes(url)) state[philosopher].push(url);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(IMAGE_STATE_FILE, JSON.stringify(state, null, 2));
}

function isImageUsed(philosopher: string, url: string): boolean {
  const state = loadUsedImages();
  return state[philosopher]?.includes(url) ?? false;
}

interface PipelineOptions {
  count?: number;
  entries?: PhilosopherEntry[];
  addMusic?: boolean;
  musicPath?: string;
  addIntro?: boolean;
  addOutro?: boolean;
  addCaptions?: boolean;
  generateCaptions?: boolean;
  concurrency?: number;
}

function log(message: string) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${message}`);
}

const SEARCH_QUERIES = [
  "portrait painting",
  "statue bust",
  "oil painting",
  "sculpture face",
  "ancient art",
  "marble statue",
  "drawing sketch",
  "philosophy art",
  "vintage illustration",
  "classical art portrait",
];

async function fetchImage(
  philosopher: string,
): Promise<string> {
  if (SOURCE === "ai") {
    return getPhilosopherImage(philosopher);
  }

  const used = loadUsedImages();
  const usedCount = used[philosopher]?.length ?? 0;
  const queryIdx = usedCount % SEARCH_QUERIES.length;
  const searchTerm = `${philosopher} ${SEARCH_QUERIES[queryIdx]}`;

  if (SOURCE === "pixabay") {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&image_type=photo&orientation=vertical&safesearch=true&per_page=10`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Pixabay error: ${res.status}`);
    const data = await res.json();
    for (const hit of data.hits ?? []) {
      if (!isImageUsed(philosopher, hit.largeImageURL)) {
        saveUsedImage(philosopher, hit.largeImageURL);
        return hit.largeImageURL;
      }
    }
    throw new Error(`No unused Pixabay image for: ${philosopher}`);
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=5&orientation=portrait`;

  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY },
  });

  if (!res.ok) throw new Error(`Pexels error: ${res.status}`);

  const data = await res.json();
  for (const photo of data.photos ?? []) {
    if (!isImageUsed(philosopher, photo.src.large)) {
      saveUsedImage(philosopher, photo.src.large);
      return photo.src.large;
    }
  }
  throw new Error(`No unused Pexels image for: ${philosopher}`);
}

function generateCaption(entry: PhilosopherEntry): string {
  const lines = [
    `"${entry.hook} ${entry.punchline}"`,
    "",
    `— ${entry.philosopher}`,
    "",
    "-------------------",
    "",
    "🎯 Daily dose of wisdom.",
    "Follow for more.",
    "",
    entry.hashtags.map((t) => `#${t}`).join(" "),
    "#philosophy #wisdom #stoicism #dailystoic #mindsetshift #sigma",
  ];
  return lines.join("\n");
}

function generateHashtagString(entry: PhilosopherEntry): string {
  const base = [
    "philosophy",
    "wisdom",
    "mindset",
    "stoicism",
    "dailystoic",
    "mindsetshift",
    "sigma",
    "darkaesthetic",
    "philosophyquotes",
    "motivation",
  ];
  const all = [...new Set([...entry.hashtags, ...base])];
  return all.map((t) => `#${t}`).join(" ");
}

async function renderSingleReel(
  bundleLocation: string,
  entry: PhilosopherEntry,
  index: number,
  total: number,
): Promise<string> {
  const filename = `reel-${String(index).padStart(2, "0")}-${entry.philosopher.replace(/\s+/g, "-")}.mp4`;
  const outputPath = path.join(OUT_DIR, filename);

  log(`[${index}/${total}] "${entry.hook}"`);

  let imageUrl: string;
  try {
    imageUrl = await fetchImage(entry.philosopher);
    log(`  Image OK: ${entry.philosopher}`);
  } catch (err) {
    log(`  Image FAILED: ${err}`);
    imageUrl = "";
  }

  const inputProps = {
    hook: entry.hook,
    punchline: entry.punchline,
    imageUrl,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "PhilosophyReel",
    inputProps,
    browserExecutable: BROWSER_EXECUTABLE,
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    browserExecutable: BROWSER_EXECUTABLE,
  });

  log(`  Done: ${filename}`);
  return outputPath;
}

function generateManifest(entries: PhilosopherEntry[], videoPaths: string[]) {
  const csvPath = path.join(OUT_DIR, "manifest.csv");
  const captionsDir = path.join(OUT_DIR, "captions");
  fs.mkdirSync(captionsDir, { recursive: true });

  const csvLines = ["filename,philosopher,caption,hashtags"];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const filename = path.basename(videoPaths[i] || "");
    const caption = generateCaption(entry);
    const hashtags = generateHashtagString(entry);

    csvLines.push(
      `${filename},"${entry.philosopher}","${caption.replace(/"/g, '""')}","${hashtags}"`,
    );

    const captionPath = path.join(captionsDir, `${path.basename(filename, ".mp4")}.txt`);
    fs.writeFileSync(captionPath, caption + "\n\n" + hashtags);
  }

  fs.writeFileSync(csvPath, csvLines.join("\n"));
  log(`Manifest: ${csvPath}`);
  log(`Captions: ${captionsDir}`);
}

async function concatVideos(videoPaths: string[]): Promise<string> {
  const listPath = path.join(OUT_DIR, "concat-list.txt");
  const content = videoPaths.map((p) => `file '${p}'`).join("\n");
  fs.writeFileSync(listPath, content);

  const outputPath = path.join(OUT_DIR, "all-reels-compilation.mp4");
  execSync(
    `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}" -y`,
  );

  log(`Compilation: ${outputPath}`);
  return outputPath;
}

export async function runPipeline(options: PipelineOptions = {}) {
  const {
    count = 5,
    entries,
    addMusic = true,
    musicPath,
    addCaptions = true,
  } = options;

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const selectedEntries = entries || randomEntries(count);

  log(`Pipeline started: ${selectedEntries.length} reels`);
  log(`Image source: ${SOURCE}`);

  log("Bundling Remotion...");
  const entryPoint = path.resolve(__dirname, "./index.ts");
  const bundleLocation = await bundle({ entryPoint });

  const videoPaths: string[] = [];

  for (let i = 0; i < selectedEntries.length; i++) {
    const videoPath = await renderSingleReel(
      bundleLocation,
      selectedEntries[i],
      i + 1,
      selectedEntries.length,
    );
    videoPaths.push(videoPath);
  }

  if (addMusic) {
    log("Adding background music...");
    for (let i = 0; i < videoPaths.length; i++) {
      const entry = selectedEntries[i];
      const trackPath = (musicPath && fs.existsSync(musicPath))
        ? musicPath
        : await getMusicForPhilosopher(entry.philosopher, entry.musicMood);

      if (trackPath) {
        log(`  Music for ${entry.philosopher}: ${path.basename(trackPath)}`);
        const withMusic = await addMusicToVideo(videoPaths[i], trackPath);
        videoPaths[i] = withMusic;
      } else {
        log(`  No music found for ${entry.philosopher}, skipping`);
      }
    }
  }

  if (addCaptions) {
    generateManifest(selectedEntries, videoPaths);
  }

  await concatVideos(videoPaths);

  // Save current entry info for upload scripts
  const entry = selectedEntries[0];
  if (entry) {
    const info = { name: entry.philosopher, quote: `${entry.hook} ${entry.punchline}` };
    fs.writeFileSync(path.join(OUT_DIR, "current-entry.json"), JSON.stringify(info));
  }

  log("Pipeline complete!");
  log(`Output: ${OUT_DIR}`);
  log(`Total videos: ${videoPaths.length}`);

  return { videoPaths, outputDir: OUT_DIR };
}

if (require.main === module) {
  const count = parseInt(process.argv[2] || "5", 10);
  runPipeline({ count }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
