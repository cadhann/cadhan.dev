import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { projects } from "../data/projects.js";
import { injectProjectsGrid } from "./project-grid-render.mjs";

const rootDir = new URL("../", import.meta.url);
const distDir = new URL("../dist/", import.meta.url);
const runtimeScripts = ["main.js", "nav.js", "projects.js", "starfield.js"];
const rootFiles = ["index.html", "CNAME"];
const rootDirectories = ["styles", "assets"];

/**
 * Build the static GitHub Pages artifact into dist/.
 *
 * @returns {Promise<void>}
 */
async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const sourceHtml = await readFile(new URL("index.html", rootDir), "utf8");
  const builtHtml = injectProjectsGrid(sourceHtml, projects);

  await writeFile(new URL("index.html", distDir), builtHtml);

  for (const fileName of rootFiles) {
    if (fileName === "index.html") {
      continue;
    }

    await cp(new URL(fileName, rootDir), new URL(fileName, distDir));
  }

  for (const directoryName of rootDirectories) {
    await cp(
      new URL(`${directoryName}/`, rootDir),
      new URL(`${directoryName}/`, distDir),
      {
        recursive: true,
      },
    );
  }

  await mkdir(new URL("scripts/", distDir), { recursive: true });

  for (const scriptName of runtimeScripts) {
    await cp(
      new URL(`scripts/${scriptName}`, rootDir),
      new URL(`scripts/${scriptName}`, distDir),
    );
  }
}

await main();
