import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const siteRoot = path.resolve(import.meta.dirname, "..");
const projectRoot = path.resolve(siteRoot, "..");
const outputRoot = path.join(projectRoot, "docs");
const sourceUrl = process.env.SITE_EXPORT_URL ?? "http://localhost:3000/";
const repositoryName = process.env.GITHUB_REPOSITORY_NAME ?? "GPTars_v2";
const basePath = `/${repositoryName}/`;

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Unable to render ${sourceUrl}: HTTP ${response.status}`);
}

let html = await response.text();
const assetNames = await readdir(path.join(siteRoot, "dist/client/assets"));
const stylesheet = assetNames.find((name) => /^index-.*\.css$/.test(name));
if (!stylesheet) throw new Error("Compiled site stylesheet was not found");

// The GitHub Pages copy is deliberately static. Remove the vinext/RSC runtime
// and retain the fully rendered HTML, stylesheet and a tiny theme controller.
html = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*>/gi, "")
  .replace(/\sdata-rsc-css-href="[^"]*"/gi, "")
  .replace(/\sdata-precedence="[^"]*"/gi, "")
  .replaceAll('href="/', `href="${basePath}`)
  .replaceAll('src="/', `src="${basePath}`)
  .replace(`${basePath}app/globals.css`, `${basePath}assets/${stylesheet}`)
  .replaceAll("http://localhost:3000/og.png", `https://scottmeddings.github.io/${repositoryName}/og.png`)
  .replace("</body>", `<script src="${basePath}theme.js" defer></script></body>`);

await mkdir(outputRoot, { recursive: true });
await rm(path.join(outputRoot, "assets"), { recursive: true, force: true });
await rm(path.join(outputRoot, "images"), { recursive: true, force: true });
await rm(path.join(outputRoot, "downloads"), { recursive: true, force: true });

await cp(path.join(siteRoot, "dist/client/assets"), path.join(outputRoot, "assets"), { recursive: true });
await cp(path.join(siteRoot, "public/images"), path.join(outputRoot, "images"), { recursive: true });
await cp(path.join(siteRoot, "public/downloads"), path.join(outputRoot, "downloads"), { recursive: true });
await cp(path.join(siteRoot, "public/og.png"), path.join(outputRoot, "og.png"));
await cp(path.join(siteRoot, "public/favicon.svg"), path.join(outputRoot, "favicon.svg"));
await writeFile(path.join(outputRoot, "index.html"), html);

const themeSource = await readFile(path.join(siteRoot, "static/theme.js"));
await writeFile(path.join(outputRoot, "theme.js"), themeSource);
await writeFile(path.join(outputRoot, ".nojekyll"), "");

console.log(`GitHub Pages export written to ${outputRoot}`);
