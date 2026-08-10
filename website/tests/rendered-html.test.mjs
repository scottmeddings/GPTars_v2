import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the GP-TARS engineering site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>GP-TARS V2 — 1 Metre Walking Robot<\/title>/i);
  assert.match(html, /Full-scale aluminium TARS/);
  assert.match(html, /MINISFORUM AI X1 Pro-370/);
  assert.match(html, /Software architecture/);
  assert.match(html, /Download current Fusion model/);
  assert.match(html, /Concept status:/);
});

test("keeps the downloadable engineering files in the site bundle", async () => {
  const requiredFiles = [
    "../public/downloads/GP_TARS_V2_1000_ALUMINIUM_COMPUTE_V2.f3d",
    "../public/downloads/GP_TARS_V2_1000_ALUMINIUM_CONCEPT_V1.f3d",
    "../public/downloads/project_specification.md",
    "../public/downloads/software_architecture.md",
    "../public/images/gptars-compute-v2.png",
    "../public/images/gptars-aluminium-v1.png",
  ];

  await Promise.all(requiredFiles.map((file) => access(new URL(file, import.meta.url))));

  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /id="drawings"/);
  assert.match(page, /id="compute"/);
  assert.match(page, /id="software"/);
  assert.match(page, /id="downloads"/);
});
