import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const MUSIC_DIR = path.resolve(__dirname, "../music");

const MOOD_MAP: Record<string, string[]> = {
  "dark-ambient": [
    "Dark Cinematic Ambient No Copyright Music",
    "Dark Cinematic Ambient Soundtrack ｜ ＂Babel＂ (Royalty Free Background Music",
    "(No Copyright) Dark Cinematic Ambient Music ｜ ＂Ravage＂ by Argsound",
    "Aliaksei Yukhnevich - Deliverance (Epic Dark Orchestral Trailer Music - Copyright Free)",
    "Dreamy Ambient Cinematic Beautiful Soundtrack ｜ Inspiring Royalty Free Download Music",
    "Dark Ambient Music Mix ｜ Royalty Free Suspenseful Background Music",
    "🍂 Ambient Music (No Copyright) - ＂Helen 2＂ by Nikos Spiliotis",
    "⚗️ Mysterious Dark Piano (Music For Videos) - ＂Shattered Glass＂ by Cjbeards",
  ],
  "sad-piano": [
    "Dark Atmospheric Cinematic Thoughtful Piano Music For Trailers and Videos",
    "Emotional Sad Piano Music ｜ Touch  (Download and Royalty FREE)",
    "Crying - Sad Emotional Background Music No Copyright Music Free Sad Music",
    "Sad and Emotional Piano by Alex-Productions (No Copyright Music) Free Music ｜ Sad Piano ｜",
    "Life Blossom by Keys of Moon Music - Cinematic - Classical - Emotional - Piano - No Copyright Music",
    "Emotional Sad Piano Music - Farewell [Royalty Free]",
    "😓 Sad Piano Ambient Music (Copyright Free) - ＂Undertow＂ by @ScottBuckley",
    "Emotional Piano - Purpose - Royalty Free Music",
    "⚗️ Mysterious Dark Piano (Music For Videos) - ＂Shattered Glass＂ by Cjbeards",
    "[Non Copyrighted Music] Scott Buckley - Growing Up [Piano]",
  ],
  epic: [
    "Epic & Heroic Orchestral Music Compilation ｜ Cinematic Royalty-Free Soundtracks",
    "Sad Dramatic Emotional Epic Music - My Spirit Is Free [Royalty Free]",
    "Aliaksei Yukhnevich - Deliverance (Epic Dark Orchestral Trailer Music - Copyright Free)",
    "[No copyright] Fuzzeke - We Built This World [Epic Orchestral Trailer Music]",
    "'Awakening' by @SteffenDaum  🇩🇪 ｜ Epic Piano Music (No Copyright) 🌿",
    "Cinematic Motivational Orchestral Epic music (No Copyright Music) ｜ Monumental by Alex-Productions",
  ],
  meditative: [
    "3 Hours of Deep Thinking and Reflection - Stoic Roman Philosopher Meditation (Ambient)",
    "After going through so many challenges in life, you have acquired an armored mind ｜ Stoic Ambience",
    "Dreamy Ambient Cinematic Beautiful Soundtrack ｜ Inspiring Royalty Free Download Music",
    "🌻 Ambient (Royalty Free Music) - ＂IN MEMORIAM＂ by Onycs",
    "🍂 Ambient Music (No Copyright) - ＂Helen 2＂ by Nikos Spiliotis",
    "The Stoic and the Sailor by Unicorn Heads",
    "[Non Copyrighted Music] Scott Buckley - Growing Up [Piano]",
  ],
  greek: [
    "Ancient Greek Background Music for Philosophy Videos ｜ No Copyright",
    "🎶 Philosophy - MuktoDMI 🎧 [ Free copyright] 🎵",
  ],
  thoughtful: [
    "Philosophy Background Music ( no copyright Royalty-Free Rhythms)",
    "Ancient Greek Background Music for Philosophy Videos ｜ No Copyright",
    "Life Blossom by Keys of Moon Music - Cinematic - Classical - Emotional - Piano - No Copyright Music",
    "Dreamy Ambient Cinematic Beautiful Soundtrack ｜ Inspiring Royalty Free Download Music",
    "Emotional Piano - Purpose - Royalty Free Music",
    "The Stoic and the Sailor by Unicorn Heads",
    "Emotional Sad Piano Music - Farewell [Royalty Free]",
    "[Non Copyrighted Music] Scott Buckley - Growing Up [Piano]",
  ],
  "sad-emotional": [
    "Crying - Sad Emotional Background Music No Copyright Music Free Sad Music",
    "End ｜ Sad Non Copyright Background music",
    "Sad Cinematic Documentary Music by Infraction [No Copyright Music] ⧸ Planet",
    "Sad and Emotional Piano by Alex-Productions (No Copyright Music) Free Music ｜ Sad Piano ｜",
    "Emotional Sad Piano Music - Farewell [Royalty Free]",
    "😓 Sad Piano Ambient Music (Copyright Free) - ＂Undertow＂ by @ScottBuckley",
    "Emotional Piano - Purpose - Royalty Free Music",
  ],
  dramatic: [
    "Sad Dramatic Emotional Epic Music - My Spirit Is Free [Royalty Free]",
    "Dark Cinematic Ambient Soundtrack ｜ ＂Babel＂ (Royalty Free Background Music",
    "Aliaksei Yukhnevich - Deliverance (Epic Dark Orchestral Trailer Music - Copyright Free)",
    "[No copyright] Fuzzeke - We Built This World [Epic Orchestral Trailer Music]",
    "'Awakening' by @SteffenDaum  🇩🇪 ｜ Epic Piano Music (No Copyright) 🌿",
    "Cinematic Motivational Orchestral Epic music (No Copyright Music) ｜ Monumental by Alex-Productions",
  ],
  mysterious: [
    "Dark Cinematic Ambient No Copyright Music",
    "(No Copyright) Dark Cinematic Ambient Music ｜ ＂Ravage＂ by Argsound",
    "Ancient Greek Background Music for Philosophy Videos ｜ No Copyright",
    "Dreamy Ambient Cinematic Beautiful Soundtrack ｜ Inspiring Royalty Free Download Music",
    "Dark Ambient Music Mix ｜ Royalty Free Suspenseful Background Music",
    "🍂 Ambient Music (No Copyright) - ＂Helen 2＂ by Nikos Spiliotis",
    "⚗️ Mysterious Dark Piano (Music For Videos) - ＂Shattered Glass＂ by Cjbeards",
    "🌻 Ambient (Royalty Free Music) - ＂IN MEMORIAM＂ by Onycs",
  ],
};

function findTrackByPrefix(prefix: string): string | null {
  const dir = MUSIC_DIR;
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.startsWith(prefix) && (file.endsWith(".mp3") || file.endsWith(".wav") || file.endsWith(".webm"))) {
      return path.join(dir, file);
    }
  }
  return null;
}

function findTracksForMood(mood: string): string[] {
  const prefixes = MOOD_MAP[mood] || MOOD_MAP["meditative"];
  const found: string[] = [];
  for (const prefix of prefixes) {
    const track = findTrackByPrefix(prefix);
    if (track) found.push(track);
  }
  return found;
}

function getAllTracks(): string[] {
  if (!fs.existsSync(MUSIC_DIR)) return [];
  return fs.readdirSync(MUSIC_DIR)
    .filter(f => f.endsWith(".mp3") || f.endsWith(".wav"))
    .map(f => path.join(MUSIC_DIR, f));
}

function pickRandomTrack(tracks: string[]): string | null {
  if (tracks.length === 0) return null;
  return tracks[Math.floor(Math.random() * tracks.length)];
}

const moodCache = new Map<string, string>();

export async function getMusicForPhilosopher(philosopher: string, mood?: string): Promise<string | null> {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });

  const musicMood = mood || "meditative";

  if (moodCache.has(philosopher)) {
    const cached = moodCache.get(philosopher)!;
    if (fs.existsSync(cached)) return cached;
  }

  let tracks = findTracksForMood(musicMood);

  if (tracks.length === 0) {
    tracks = getAllTracks();
  }

  if (tracks.length === 0) {
    return null;
  }

  const chosen = pickRandomTrack(tracks);
  if (chosen) {
    moodCache.set(philosopher, chosen);
    return chosen;
  }

  return null;
}

export function clearMusicCache() {
  moodCache.clear();
}

export async function addMusicToVideo(
  videoPath: string,
  musicPath: string,
): Promise<string> {
  const ext = path.extname(videoPath);
  const base = path.basename(videoPath, ext);
  const dir = path.dirname(videoPath);
  const outputPath = path.join(dir, `${base}-with-music${ext}`);

  console.log(`  Adding music to ${base}...`);

  const probeCmd = `ffprobe -v error -show_entries format=duration -of csv=p=0 "${musicPath}" 2>/dev/null`;
  const musicDuration = execSync(probeCmd).toString().trim();
  const musicDur = parseFloat(musicDuration) || 0;
  const videoDur = 15;

  let filterComplex: string;
  if (musicDur >= videoDur) {
    filterComplex = `[1:a]atrim=duration=${videoDur},volume=0.4[a1]`;
  } else {
    const loops = Math.ceil(videoDur / musicDur);
    filterComplex = `[1:a]aloop=loop=${loops - 1}:size=0,atrim=duration=${videoDur},volume=0.4[a1]`;
  }

  execSync(
    `ffmpeg -i "${videoPath}" -i "${musicPath}" -filter_complex ` +
      `"${filterComplex}" -map 0:v -map "[a1]" -c:v copy -shortest "${outputPath}" -y`,
    { stdio: "ignore" },
  );

  return outputPath;
}
