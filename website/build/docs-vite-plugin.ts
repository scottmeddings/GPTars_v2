import { execFile } from "node:child_process";
import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { promisify } from "node:util";
import { Marked } from "marked";
import type { Plugin } from "vite";

const execFileAsync = promisify(execFile);

export const DOCS_MODULE_ID = "virtual:gptars/docs";
export const PARAMETERS_MODULE_ID = "virtual:gptars/parameters";

// Reading order for the documents we know about. Anything new in docs/ is
// appended alphabetically, so dropping in a .md file publishes it unattended.
const READING_ORDER = [
  "project_specification",
  "design_assumptions",
  "original_geometry_analysis",
  "aluminium_architecture",
  "gait",
  "compute_hardware",
  "compute_software_stack",
  "power_budget",
  "software_architecture",
  "interference_report",
];

// Short labels for the nav. Falls back to the document's own H1.
const NAV_LABELS: Record<string, string> = {
  project_specification: "Specification",
  design_assumptions: "Assumptions",
  original_geometry_analysis: "Source geometry",
  aluminium_architecture: "Architecture",
  gait: "Gait",
  compute_hardware: "Compute",
  compute_software_stack: "Software stack",
  power_budget: "Power",
  software_architecture: "Software",
  interference_report: "Interference",
};

export interface DocHeading {
  id: string;
  text: string;
  depth: number;
}

export interface DocEntry {
  slug: string;
  file: string;
  title: string;
  navLabel: string;
  summary: string;
  status: string | null;
  revised: string;
  revisedSource: "git" | "filesystem";
  words: number;
  headings: DocHeading[];
  html: string;
  downloadPath: string;
}

export interface ParameterEntry {
  name: string;
  group: string;
  value: string;
  raw: string;
  kind: "number" | "string" | "boolean" | "tuple" | "null" | "expression";
  note: string | null;
  derived: boolean;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\da-z]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Builds a Marked instance that emits ids on headings and scroll-safe tables. */
function createRenderer(headings: DocHeading[]) {
  const marked = new Marked({ gfm: true });
  const used = new Map<string, number>();

  marked.use({
    renderer: {
      heading(token) {
        const text = this.parser.parseInline(token.tokens);
        const base = slugify(token.text) || `section-${headings.length + 1}`;
        const seen = used.get(base) ?? 0;
        used.set(base, seen + 1);
        const id = seen === 0 ? base : `${base}-${seen}`;

        // The H1 is rendered by the page shell, not inside the prose body.
        if (token.depth > 1) headings.push({ id, text: token.text, depth: token.depth });

        return `<h${token.depth} id="${id}"><a class="anchor" href="#${id}">${text}</a></h${token.depth}>\n`;
      },
      table(token) {
        const header = token.header
          .map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`)
          .join("");
        const body = token.rows
          .map(
            (row) =>
              `<tr>${row
                .map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`)
                .join("")}</tr>`,
          )
          .join("");
        return `<div class="table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>\n`;
      },
    },
  });

  return marked;
}

/** Last edit date, preferring git history so the site tracks real revisions. */
async function lastRevised(
  projectRoot: string,
  file: string,
): Promise<{ revised: string; revisedSource: "git" | "filesystem" }> {
  try {
    const { stdout } = await execFileAsync("git", ["log", "-1", "--format=%cI", "--", file], {
      cwd: projectRoot,
    });
    const committed = stdout.trim();
    if (committed) return { revised: committed, revisedSource: "git" };
  } catch {
    // Not a repository, or git unavailable. Fall through to the filesystem.
  }

  const info = await stat(resolve(projectRoot, file));
  return { revised: info.mtime.toISOString(), revisedSource: "filesystem" };
}

async function readDocs(projectRoot: string): Promise<DocEntry[]> {
  const docsDirectory = resolve(projectRoot, "docs");
  const files = (await readdir(docsDirectory))
    .filter((name) => extname(name) === ".md")
    .sort();

  const entries = await Promise.all(
    files.map(async (name): Promise<DocEntry> => {
      const stem = basename(name, ".md");
      const source = await readFile(resolve(docsDirectory, name), "utf8");
      const headings: DocHeading[] = [];
      const marked = createRenderer(headings);

      const title = source.match(/^#\s+(.+)$/m)?.[1].trim() ?? stem.replace(/_/g, " ");
      const status = source.match(/^Status:\s*(.+?)\.?$/m)?.[1].trim() ?? null;

      // First real paragraph, skipping the H1 and any Status: line.
      const summary =
        source
          .split(/\n{2,}/)
          .map((block) => block.trim())
          .find(
            (block) =>
              block.length > 0 &&
              !block.startsWith("#") &&
              !block.startsWith("Status:") &&
              !block.startsWith("|") &&
              !block.startsWith("```"),
          )
          ?.replace(/\s+/g, " ")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") ?? "";

      // The page shell renders the title and status, so drop them from the body.
      let body = source.replace(/^#\s+.+$/m, "");
      if (status) body = body.replace(/^Status:\s*.+$/m, "");
      const html = await marked.parse(body);
      const { revised, revisedSource } = await lastRevised(projectRoot, `docs/${name}`);

      return {
        slug: slugify(stem),
        file: `docs/${name}`,
        title,
        navLabel: NAV_LABELS[stem] ?? title,
        summary,
        status,
        revised,
        revisedSource,
        words: source.split(/\s+/).filter(Boolean).length,
        headings,
        html,
        downloadPath: `/downloads/${name}`,
      };
    }),
  );

  return entries.sort((a, b) => {
    const left = READING_ORDER.indexOf(basename(a.file, ".md"));
    const right = READING_ORDER.indexOf(basename(b.file, ".md"));
    if (left === -1 && right === -1) return a.slug.localeCompare(b.slug);
    if (left === -1) return 1;
    if (right === -1) return -1;
    return left - right;
  });
}

/**
 * Parses the flat assignments in cad/parameters.py. The file is deliberately
 * simple (literals plus a few arithmetic expressions), so a small reader keeps
 * the published values identical to the ones the CAD scripts consume.
 */
async function readParameters(projectRoot: string): Promise<ParameterEntry[]> {
  const source = await readFile(resolve(projectRoot, "cad/parameters.py"), "utf8");
  const lines = source.split("\n");
  const entries: ParameterEntry[] = [];
  const numeric = new Map<string, number>();
  let group = "General";
  let pendingNote: string | null = null;

  for (const line of lines) {
    const comment = line.match(/^#\s*(.+)$/);
    if (comment) {
      const text = comment[1].trim();
      // A short standalone comment is a section heading; longer ones annotate
      // the assignment that follows.
      if (text.length <= 48 && !text.endsWith(".")) {
        group = text.replace(/\.$/, "");
        pendingNote = null;
      } else {
        pendingNote = pendingNote ? `${pendingNote} ${text}` : text;
      }
      continue;
    }

    const assignment = line.match(/^([A-Z][A-Z\d_]*)\s*=\s*(.+?)\s*$/);
    if (!assignment) {
      if (line.trim() === "") pendingNote = null;
      continue;
    }

    const [, name, rawValue] = assignment;
    const [expression, trailing] = splitTrailingComment(rawValue);
    const note = trailing ?? pendingNote;
    pendingNote = null;

    let kind: ParameterEntry["kind"] = "expression";
    let display = expression;
    let derived = false;

    if (/^["'].*["']$/.test(expression)) {
      kind = "string";
      display = expression.slice(1, -1);
    } else if (expression === "True" || expression === "False") {
      kind = "boolean";
    } else if (expression === "None") {
      kind = "null";
      display = "Not set";
    } else if (expression.startsWith("(")) {
      kind = "tuple";
      display = expression
        .replace(/[()]/g, "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" · ");
    } else if (/^-?\d+(\.\d+)?$/.test(expression)) {
      kind = "number";
      numeric.set(name, Number(expression));
      display = formatNumber(Number(expression));
    } else {
      const computed = evaluateExpression(expression, numeric);
      if (computed !== null) {
        kind = "number";
        derived = true;
        numeric.set(name, computed);
        display = formatNumber(computed);
      }
    }

    entries.push({ name, group, value: display, raw: expression, kind, note, derived });
  }

  return entries;
}

function splitTrailingComment(value: string): [string, string | null] {
  let quote: string | null = null;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "#") {
      return [value.slice(0, index).trim(), value.slice(index + 1).trim()];
    }
  }
  return [value.trim(), null];
}

/** Evaluates the `A / B`-style arithmetic used for derived reference values. */
function evaluateExpression(expression: string, known: Map<string, number>): number | null {
  const tokens = expression.match(/[A-Z][A-Z\d_]*|\d+(?:\.\d+)?|[*/+-]/g);
  if (!tokens || tokens.join("") !== expression.replace(/\s+/g, "")) return null;

  const values: number[] = [];
  const operators: string[] = [];

  for (const token of tokens) {
    if (/^[*/+-]$/.test(token)) {
      operators.push(token);
      continue;
    }
    const value = /^\d/.test(token) ? Number(token) : known.get(token);
    if (value === undefined) return null;
    values.push(value);
  }

  if (values.length !== operators.length + 1) return null;

  // Multiplication and division first, then the additive pass.
  for (let index = 0; index < operators.length; ) {
    if (operators[index] === "*" || operators[index] === "/") {
      const result =
        operators[index] === "*"
          ? values[index] * values[index + 1]
          : values[index] / values[index + 1];
      values.splice(index, 2, result);
      operators.splice(index, 1);
    } else {
      index += 1;
    }
  }

  let total = values[0];
  for (let index = 0; index < operators.length; index += 1) {
    total = operators[index] === "+" ? total + values[index + 1] : total - values[index + 1];
  }
  return total;
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString("en-GB");
  return Number(value.toFixed(6)).toLocaleString("en-GB", { maximumFractionDigits: 6 });
}

/**
 * Mirrors docs/*.md into public/downloads so the copies can never drift.
 *
 * Files are overwritten in place rather than removed and recreated: the dev
 * server serves this directory, and a delete/copy window makes it lstat a path
 * that briefly does not exist.
 */
async function syncDownloads(projectRoot: string, siteRoot: string): Promise<void> {
  const docsDirectory = resolve(projectRoot, "docs");
  const downloads = resolve(siteRoot, "public/downloads");
  await mkdir(downloads, { recursive: true });

  const sources = (await readdir(docsDirectory)).filter((name) => extname(name) === ".md");
  await Promise.all(
    sources.map((name) => cp(resolve(docsDirectory, name), resolve(downloads, name))),
  );

  // Drop only the copies whose source document has gone away.
  const published = await readdir(downloads);
  await Promise.all(
    published
      .filter((name) => extname(name) === ".md" && !sources.includes(name))
      .map((name) => rm(resolve(downloads, name), { force: true })),
  );
}

export function gptarsDocs(): Plugin {
  let siteRoot = process.cwd();
  let projectRoot = resolve(siteRoot, "..");

  const resolvedDocs = `\0${DOCS_MODULE_ID}`;
  const resolvedParameters = `\0${PARAMETERS_MODULE_ID}`;

  return {
    name: "gptars-docs",
    async configResolved(config) {
      siteRoot = config.root;
      projectRoot = resolve(siteRoot, "..");
      await syncDownloads(projectRoot, siteRoot);
    },
    configureServer(server) {
      // Editing a source document or the CAD parameters refreshes the site.
      server.watcher.add([resolve(projectRoot, "docs"), resolve(projectRoot, "cad/parameters.py")]);

      let pending: NodeJS.Timeout | undefined;

      server.watcher.on("all", (_event, file) => {
        const isDoc = file.startsWith(resolve(projectRoot, "docs")) && file.endsWith(".md");
        const isParameters = file === resolve(projectRoot, "cad/parameters.py");
        if (!isDoc && !isParameters) return;

        // Editors often emit several events per save; collapse them into one
        // refresh so the download mirror is rewritten once.
        clearTimeout(pending);
        pending = setTimeout(() => {
          void (async () => {
            try {
              if (isDoc) await syncDownloads(projectRoot, siteRoot);

              for (const id of [resolvedDocs, resolvedParameters]) {
                const module = server.environments.rsc?.moduleGraph.getModuleById(id);
                if (module) server.environments.rsc.moduleGraph.invalidateModule(module);
              }
              server.ws.send({ type: "full-reload" });
            } catch (error) {
              // Never take the dev server down over a transient file event.
              server.config.logger.error(`[gptars-docs] refresh failed: ${error}`);
            }
          })();
        }, 60);
      });
    },
    resolveId(id) {
      if (id === DOCS_MODULE_ID) return resolvedDocs;
      if (id === PARAMETERS_MODULE_ID) return resolvedParameters;
      return null;
    },
    async load(id) {
      if (id === resolvedDocs) {
        const docs = await readDocs(projectRoot);
        return `export const docs = ${JSON.stringify(docs)};\nexport default docs;\n`;
      }
      if (id === resolvedParameters) {
        const parameters = await readParameters(projectRoot);
        return `export const parameters = ${JSON.stringify(parameters)};\nexport default parameters;\n`;
      }
      return null;
    },
  };
}
