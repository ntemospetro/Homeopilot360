import fs from "fs";
import path from "path";

const CACHE_PATH = path.resolve("./data/kent_repertory_cache.json");
if (fs.existsSync(CACHE_PATH)) {
  const rawData = fs.readFileSync(CACHE_PATH, "utf-8");
  const cache = JSON.parse(rawData);
  console.log("Rubric Count:", cache.rubrics?.length);
  console.log("Remedy Count:", cache.remedies?.length);
  if (cache.rubrics && cache.rubrics.length > 0) {
    console.log("First rubric:", cache.rubrics[0]);
    console.log("Second rubric:", cache.rubrics[1]);
  }
} else {
  console.log("Cache file does not exist!");
}
