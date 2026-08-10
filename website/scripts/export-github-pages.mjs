import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const siteRoot = path.resolve(import.meta.dirname, "..");
const projectRoot = path.resolve(siteRoot, "..");
const outputRoot = path.join(projectRoot, "docs");
const sourceOrigin = (process.env.SITE_EXPORT_URL ?? "http://localhost:3000/").replace(/\/$/, "");
const repositoryName = process.env.GITHUB_REPOSITORY_NAME ?? "GPTars_v2";
const basePath = `/${repositoryName}/`;

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^\da-z]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Route list is derived from docs/*.md, matching the Vite plugin, so a new
// source document is exported without editing this script.
const documentSlugs = (await readdir(path.join(projectRoot, "docs")))
  .filter((name) => path.extname(name) === ".md")
  .map((name) => slugify(path.basename(name, ".md")))
  .sort();

const routes = [
  { route: "/", output: "index.html" },
  { route: "/model", output: path.join("model", "index.html") },
  { route: "/decals", output: path.join("decals", "index.html") },
  { route: "/docs", output: path.join("docs", "index.html") },
  { route: "/parameters", output: path.join("parameters", "index.html") },
  ...documentSlugs.map((slug) => ({
    route: `/docs/${slug}`,
    output: path.join("docs", slug, "index.html"),
  })),
];

const assetNames = await readdir(path.join(siteRoot, "dist/client/assets"));
const stylesheet = assetNames.find((name) => /^index-.*\.css$/.test(name));
if (!stylesheet) throw new Error("Compiled site stylesheet was not found");

/**
 * The GitHub Pages copy is deliberately static: the vinext/RSC runtime is
 * removed and the fully rendered HTML kept, with a small theme controller.
 */
function toStaticHtml(html) {
  return html
    // Model URLs live inside a data attribute whose quotes are HTML-escaped,
    // so rebase both forms before the generic href/src pass, which cannot
    // reach inside an attribute value.
    .replaceAll('"/models/', `"${basePath}models/`)
    .replaceAll("&quot;/models/", `&quot;${basePath}models/`)
    // Strip the RSC runtime but keep scripts marked data-static, such as the
    // STL viewer bundle, which the page genuinely needs.
    .replace(/<script\b(?![^>]*\bdata-static\b)[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*>/gi, "")
    .replace(/\sdata-rsc-css-href="[^"]*"/gi, "")
    .replace(/\sdata-precedence="[^"]*"/gi, "")
    .replace(/<!--\s*-->/g, "")
    .replaceAll('href="/', `href="${basePath}`)
    .replaceAll('src="/', `src="${basePath}`)
    .replace(`${basePath}app/globals.css`, `${basePath}assets/${stylesheet}`)
    .replaceAll(
      `${sourceOrigin}/og-project-summary-v2.png`,
      `https://scottmeddings.github.io/${repositoryName}/og-project-summary-v2.png`,
    )
    .replace("</body>", `<script src="${basePath}theme.js" defer></script></body>`);
}

// Replace only the generated directories, leaving the docs/*.md sources alone.
await mkdir(outputRoot, { recursive: true });
for (const directory of ["assets", "images", "downloads", "parameters", "models", "model"]) {
  await rm(path.join(outputRoot, directory), { recursive: true, force: true });
}
for (const slug of documentSlugs) {
  await rm(path.join(outputRoot, "docs", slug), { recursive: true, force: true });
}
await rm(path.join(outputRoot, "docs", "index.html"), { force: true });

await cp(path.join(siteRoot, "dist/client/assets"), path.join(outputRoot, "assets"), { recursive: true });
await cp(path.join(siteRoot, "public/images"), path.join(outputRoot, "images"), { recursive: true });
await cp(path.join(siteRoot, "public/downloads"), path.join(outputRoot, "downloads"), { recursive: true });
await cp(path.join(siteRoot, "public/models"), path.join(outputRoot, "models"), { recursive: true });
await cp(path.join(siteRoot, "public/viewer.js"), path.join(outputRoot, "viewer.js"));
await cp(path.join(siteRoot, "public/og.png"), path.join(outputRoot, "og.png"));
await cp(path.join(siteRoot, "public/og-project-summary-v2.png"), path.join(outputRoot, "og-project-summary-v2.png"));
await cp(path.join(siteRoot, "public/favicon.svg"), path.join(outputRoot, "favicon.svg"));

for (const { route, output } of routes) {
  const response = await fetch(`${sourceOrigin}${route}`);
  if (!response.ok) {
    throw new Error(`Unable to render ${route}: HTTP ${response.status}`);
  }

  const destination = path.join(outputRoot, output);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, toStaticHtml(await response.text()));
  console.log(`  ${route.padEnd(34)} → docs/${output}`);
}

const themeSource = await readFile(path.join(siteRoot, "static/theme.js"));
await writeFile(path.join(outputRoot, "theme.js"), themeSource);
await writeFile(path.join(outputRoot, ".nojekyll"), "");

console.log(`\n${routes.length} pages exported to ${outputRoot}`);
