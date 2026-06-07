import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { runPipeline } from "./pipeline";
import { randomEntries } from "./philosopher-data";
import { fetchRandomQuotes } from "./fetch-quotes";
import { clearMusicCache } from "./download-music";

const OUT_DIR = path.resolve(__dirname, "../out");
const STATE_FILE = path.join(OUT_DIR, "continuous-state.json");

interface ContinuousState {
  runCount: number;
  lastRun: string;
}

function loadState(): ContinuousState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return { runCount: 0, lastRun: "" };
  }
}

function saveState(state: ContinuousState) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uploadToSocial(videoPath: string, title: string, name: string, quote: string) {
  try {
    const script = path.resolve(__dirname, "../social-upload.py");
    if (fs.existsSync(script)) {
      execSync(
        `python3 "${script}" "${videoPath}" --name "${name}" --quote "${quote}" --platforms facebook --delete 2>/dev/null || true`,
        { stdio: "inherit", timeout: 120000 },
      );
    }
  } catch {
    console.log("  Social upload skipped");
  }
}

function uploadToYoutube(videoPath: string, name: string, quote: string) {
  try {
    const script = path.resolve(__dirname, "../upload-youtube.py");
    if (fs.existsSync(script)) {
      execSync(
        `python3 "${script}" "${videoPath}" --name "${name}" --quote "${quote}" --privacy public --delete 2>/dev/null || true`,
        { stdio: "inherit", timeout: 120000 },
      );
    }
  } catch {
    console.log("  YouTube upload skipped");
  }
}

async function main() {
  const count = parseInt(process.argv[2] || "3", 10);
  const intervalMinutes = parseInt(process.argv[3] || "30", 10);
  const useApi = process.argv[4] === "api" || process.env.QUOTE_SOURCE === "api";
  const autoUpload = process.argv.includes("--upload") || process.env.AUTO_UPLOAD === "1";
const outputFile = path.join(OUT_DIR, "all-reels-compilation.mp4");
  const state = loadState();

  console.log("╔══════════════════════════════════════════════╗");
  console.log("║     Continuous Reel Generator — Running      ║");
  console.log(`║     ${count} reels every ${intervalMinutes} min             ║`);
  console.log(`║     Source: ${useApi ? "API (dynamic)" : "local file"}          ║`);
  console.log("╚══════════════════════════════════════════════╝");

  while (true) {
    state.runCount++;
    const startTime = new Date().toLocaleString();

    console.log(`\n━━━ Run #${state.runCount} — ${startTime} ━━━`);

    const entries = useApi
      ? await fetchRandomQuotes(count)
      : randomEntries(count);
    console.log(`Selected ${entries.length} random entries`);

    try {
      await runPipeline({
        entries,
        addMusic: true,
        addCaptions: true,
      });
      console.log(`Run #${state.runCount} complete!`);

      if (autoUpload && fs.existsSync(outputFile)) {
        const entry = entries[0];
        const name = entry.philosopher || "Unknown";
        const quote = `${entry.hook} ${entry.punchline}`;
        console.log("Uploading to Facebook...");
        uploadToSocial(outputFile, "", name, quote);
        console.log("Uploading to YouTube...");
        uploadToYoutube(outputFile, name, quote);
      }
    } catch (err) {
      console.error(`Run #${state.runCount} FAILED:`, err);
    }

    state.lastRun = new Date().toISOString();
    saveState(state);
    clearMusicCache();

    const nextRun = new Date(Date.now() + intervalMinutes * 60 * 1000).toLocaleString();
    console.log(`\nNext run at ${nextRun} (in ${intervalMinutes} minutes)`);
    console.log(`Press Ctrl+C to stop\n`);

    await sleep(intervalMinutes * 60 * 1000);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
