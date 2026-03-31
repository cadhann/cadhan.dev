import { readFile, writeFile } from "node:fs/promises";
import { projects } from "../data/projects.js";
import { injectProjectsGrid } from "./project-grid-render.mjs";

const htmlUrl = new URL("../index.html", import.meta.url);

/**
 * Replace the generated project-grid block in index.html.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const html = await readFile(htmlUrl, "utf8");
  const nextHtml = injectProjectsGrid(html, projects);

  if (nextHtml !== html) {
    await writeFile(htmlUrl, nextHtml);
  }
}

await main();
