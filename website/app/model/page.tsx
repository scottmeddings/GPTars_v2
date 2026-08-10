import type { Metadata } from "next";
import { parameters } from "virtual:gptars/parameters";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "3D model — GP-TARS V2",
  description:
    "Interactive STL view of the GP-TARS V2 aluminium bodywork, leg-arm slabs and internal frame, exported from the Fusion assembly.",
};

const parameterMap = new Map(parameters.map((entry) => [entry.name, entry]));
const value = (name: string): string => parameterMap.get(name)?.value ?? "—";

// Loaded by the standalone viewer bundle. Paths are rewritten for the
// GitHub Pages base path at export time.
const MODELS = [
  { name: "panels", label: "Bodywork panels", url: "/models/gptars-panels.stl", color: "#9aa7b0" },
  { name: "arms", label: "Leg-arm slabs", url: "/models/gptars-arms.stl", color: "#6c7a85" },
  { name: "frame", label: "Internal frame", url: "/models/gptars-frame.stl", color: "#d97b19", hidden: true },
];

export default function ModelPage() {
  return (
    <main className="page-shell">
      <article className="drawing-sheet">
        <header className="title-block" id="top">
          <div>
            <p className="eyebrow">GP-TARS V2 · interactive assembly</p>
            <h1>3D model</h1>
            <p className="subtitle">
              The formed aluminium bodywork, leg-arm slabs and internal frame, exported directly from the Fusion
              assembly. Drag to orbit, scroll to zoom, and use the keys below to isolate a group.
            </p>
          </div>
          <div className="revision-stamp" aria-label="Model status">
            <span>HEIGHT <b>{value("ROBOT_HEIGHT")} mm</b></span>
            <span>SHELL <b>{value("SHELL_WALL")} mm</b></span>
            <span>SOURCE <b>COMPUTE V2</b></span>
            <span>STATUS <b>CONCEPT</b></span>
          </div>
        </header>

        <SiteNav
          current="/model"
          links={[
            { href: "/", label: "Overview" },
            { href: "/model", label: "3D model" },
            { href: "/docs", label: "Documents" },
            { href: "/parameters", label: "Parameters" },
          ]}
        />

        <section>
          <div className="section-heading">
            <span>01</span>
            <div>
              <p>Exported assembly</p>
              <h2>Bodywork and structure</h2>
            </div>
          </div>

          {/*
            The viewer builds its own DOM inside this element. dangerouslySetInnerHTML
            tells React not to reconcile the subtree, which is what stops hydration
            failing once the canvas and legend are injected.
          */}
          <div
            className="stl-viewer"
            data-stl-viewer
            data-models={JSON.stringify(MODELS)}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: "" }}
          />
          <noscript>
            <p className="viewer-fallback">
              The interactive model needs JavaScript. The STL files are linked below and open in any CAD or mesh viewer.
            </p>
          </noscript>

          <div className="notice warning">
            <b>Form and packaging only:</b> these bodies carry no fastener patterns, formed returns, beads, doublers or
            joint hardware, and the internal frame still has four known conflicts with the main actuator envelopes. See
            the{" "}
            {/* Plain anchor: the static Pages export has no client runtime. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/docs/interference-report">interference report</a>. Nothing here is releasable for fabrication.
          </div>

          <div className="download-list">
            {MODELS.map((model) => (
              <a href={model.url} key={model.name} download>
                <span>
                  <b>{model.label}</b>
                  <small>{model.url.replace("/models/", "")}</small>
                </span>
                <i>STL ↓</i>
              </a>
            ))}
          </div>
        </section>

        <footer>
          <span>GP‑TARS V2 · 3D MODEL</span>
          <span>EXPORTED FROM THE FUSION ASSEMBLY</span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </article>

      {/* data-static keeps this script through the scriptless Pages export. */}
      <script src="/viewer.js" defer data-static="true" />
    </main>
  );
}
