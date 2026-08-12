import type { Metadata } from "next";
import { parameters } from "virtual:gptars/parameters";
import { SITE_LINKS, SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "3D model — GP-TARS V2",
  description:
    "Interactive STL view of the GP-TARS V2 aluminium bodywork, leg-arm slabs and internal frame, exported from the Fusion assembly.",
};

const parameterMap = new Map(parameters.map((entry) => [entry.name, entry]));
const value = (name: string): string => parameterMap.get(name)?.value ?? "—";

// Loaded by the standalone viewer bundle. Paths are rewritten for the
// GitHub Pages base path at export time.
// group drives the presets: "skin" is everything the Skins off preset removes.
const MODELS = [
  { name: "panels", label: "Bodywork panels", url: "/models/gptars-panels.stl", color: "#9aa7b0", group: "skin" },
  { name: "arms", label: "Leg-arm slabs", url: "/models/gptars-arms.stl", color: "#6c7a85", group: "skin" },
  { name: "display", label: "Display insert", url: "/models/gptars-display.stl", color: "#6fb8dd", group: "skin" },

  { name: "feet", label: "Rockered feet", url: "/models/gptars-feet.stl", color: "#d8a0c0", group: "skin" },

  { name: "frame", label: "Subframe", url: "/models/gptars-frame.stl", color: "#d97b19", group: "structure" },
  { name: "joints", label: "Hip bulkheads", url: "/models/gptars-joints.stl", color: "#efa54f", group: "structure" },

  { name: "drive", label: "Actuators + reduction", url: "/models/gptars-drive.stl", color: "#e36b56", group: "drive" },
  { name: "shafts", label: "Shafts", url: "/models/gptars-shafts.stl", color: "#c3ccd2", group: "drive" },

  { name: "battery", label: "Battery", url: "/models/gptars-battery.stl", color: "#58bd8c", group: "equipment" },
  { name: "compute", label: "Mini PC", url: "/models/gptars-compute.stl", color: "#6fb8dd", group: "equipment" },
  { name: "gpu", label: "RTX 2000 Ada", url: "/models/gptars-gpu.stl", color: "#8ad0a8", group: "equipment" },
  { name: "electronics", label: "E-stop + CAN hub", url: "/models/gptars-electronics.stl", color: "#e88a7a", group: "equipment" },
  { name: "sensors", label: "Sensors", url: "/models/gptars-sensors.stl", color: "#b6a4d6", group: "equipment" },
  { name: "wiring", label: "Harness", url: "/models/gptars-wiring.stl", color: "#d8c46a", group: "equipment" },

  { name: "dock", label: "Charge dock", url: "/models/gptars-dock.stl", color: "#7f8c94", group: "dock", hidden: true },
];

// Decal placement, in the model's own millimetres: X across with 0 on the
// centreline, Y up from the floor, Z depth with the front face positive. Sizes
// and positions come from the schedule in docs/aluminium_architecture.md.
// Decals are printed vinyl on the bodywork, so the viewer hides them whenever
// the skins come off.
const num = (name: string, fallback: number): number => {
  const raw = parameterMap.get(name)?.value;
  const parsed = raw === undefined ? NaN : Number.parseFloat(String(raw).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const HALF_WIDTH = num("ROBOT_WIDTH", 480) / 2;
const HALF_CHASSIS = num("CENTRAL_CHASSIS_WIDTH", 240) / 2;
const FRONT_Z = num("ROBOT_DEPTH_REFERENCE", 259.867) / 2;
const HIP_Y = num("AXLE_LOWER_MAIN_Y", 610.84);
const FOOT_TOP = num("FOOT_HEIGHT", 80);
const WORDMARK_Y = num("DECAL_WORDMARK_ORIGIN_Y", 350);
const STRIPE = 14;

const DECALS = [
  // Identity, on the lower chassis below the display.
  { kind: "wordmark", x: -64, y: WORDMARK_Y + 125, w: 52, h: 250, at: FRONT_Z, face: "front" },
  { kind: "dots", x: -10, y: WORDMARK_Y + 105, w: 36, h: 200, at: FRONT_Z, face: "front" },

  // Pinch stripes: the hip gap, and the leading edge of each limb.
  { kind: "hazard", x: 0, y: HIP_Y + 8, w: HALF_CHASSIS * 2, h: STRIPE, at: FRONT_Z, face: "front" },
  {
    kind: "hazard", x: -HALF_WIDTH + 9, y: (FOOT_TOP + HIP_Y - 30) / 2,
    w: STRIPE, h: HIP_Y - 30 - FOOT_TOP, at: FRONT_Z, face: "front",
  },
  {
    kind: "hazard", x: HALF_WIDTH - 9, y: (FOOT_TOP + HIP_Y - 30) / 2,
    w: STRIPE, h: HIP_Y - 30 - FOOT_TOP, at: FRONT_Z, face: "front",
  },

  // Hazards, each at the hazard it warns about.
  { kind: "crush", x: -172, y: 680, w: 44, h: 40, at: FRONT_Z, face: "front" },
  { kind: "starts", x: 54, y: 170, w: 44, h: 40, at: FRONT_Z, face: "front" },

  // Panel index marks: return each panel to the opening it came from.
  { kind: "index", label: "P1", x: 73, y: 107, w: 26, h: 26, at: FRONT_Z, face: "front" },
  { kind: "index", label: "P2", x: -187, y: 107, w: 26, h: 26, at: FRONT_Z, face: "front" },

  // Build stamp on the starboard limb. x is depth on a side face.
  {
    kind: "plate", x: -20, y: 456, w: 120, h: 52, at: HALF_WIDTH, face: "starboard",
    lines: [["BUS", `${parameterMap.get("BATTERY_VOLTAGE")?.value ?? "12.8"} V DC`], ["UNIT", "001"]],
  },
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
              assembly, wearing its printed decals. Drag to orbit and scroll to zoom. <b>Skins off</b> strips the
              bodywork to expose the welded subframe and the equipment inside it, and <b>Subframe only</b> leaves the
              bare 6061 cage. Decals are vinyl on the panels, so they come away with them.
            </p>
          </div>
          <div className="revision-stamp" aria-label="Model status">
            <span>HEIGHT <b>{value("ROBOT_HEIGHT")} mm</b></span>
            <span>SHELL <b>{value("SHELL_WALL")} mm</b></span>
            <span>SOURCE <b>GPTars_v4 · R10</b></span>
            <span>STATUS <b>CONCEPT</b></span>
          </div>
        </header>

        <SiteNav
          current="/model"
          links={SITE_LINKS}
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
            data-decals={JSON.stringify(DECALS)}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: "" }}
          />
          <noscript>
            <p className="viewer-fallback">
              The interactive model needs JavaScript. The STL files are linked below and open in any CAD or mesh viewer.
            </p>
          </noscript>

          <div className="notice warning">
            <b>Form and packaging only:</b> these bodies carry no fastener patterns, formed returns, beads or joint
            hardware. Non-assembly interference is now clear, but joint sweeps, cable bend radii and service extraction
            paths remain unchecked. See the{" "}
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
