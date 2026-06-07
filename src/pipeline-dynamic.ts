import { runPipeline } from "./pipeline";
import { fetchRandomQuotes } from "./fetch-quotes";

async function main() {
  const count = parseInt(process.argv[2] || "5", 10);

  console.log("Fetching quotes from API...");
  const entries = await fetchRandomQuotes(count);
  console.log(`Got ${entries.length} quotes`);

  entries.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.philosopher}: "${e.hook} ${e.punchline}" [${e.musicMood}]`);
  });

  await runPipeline({
    entries,
    addMusic: true,
    addCaptions: true,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
