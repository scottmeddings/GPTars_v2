import type { Metadata } from "next";
import { SITE_LINKS, SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Decals — GP-TARS V2",
  description:
    "Print-ready 1:1 vinyl decal artwork for the GP-TARS V2 aluminium bodywork: wordmark, data plate, hazard labels, E-stop surround and service markings.",
};

const SHEET = "/images/gptars-decal-sheet.svg";

const decals = [
  ["TARS vertical wordmark", "52 × 250", "×2", "Port and starboard identity, two colourways"],
  ["Data plate", "120 × 72", "×1", "Build, height, mass class, bus voltage, alloys, unit number"],
  ["Hazard triangles", "44 × 40", "×4", "Crush · 24 V live · hot surface · starts without warning"],
  ["E-stop surround", "Ø70", "×1", "Centre cut out for the mushroom head"],
  ["Service labels", "130 × 16", "×4", "Compute, GPU and battery access, plus isolate before opening"],
  ["Pinch-point stripes", "344 × 14", "×2", "Limb leading edges and the hip gap"],
  ["Panel index marks", "26 × 26", "×8", "Return each panel to the opening it came from"],
  ["Display surround", "Scales to 194 × 345", "×1", "Bezel trim for the front-face aperture"],
];

const rules = [
  "Convert to the printer's CMYK profile. The source artwork is RGB.",
  "Matte or satin vinyl. Gloss reflects badly under exhibition lighting.",
  "Laminate everything. The limbs strike the ground every gait cycle.",
  "Degrease with isopropyl alcohol. Never apply over fresh anodising or uncured powder coat.",
  "Keep decals 10 mm clear of panel edges and fasteners so they survive removal.",
  "Do not cover the E-stop mushroom head. The centre of that decal is a cut-out.",
];

export default function DecalsPage() {
  return (
    <main className="page-shell">
      <article className="drawing-sheet">
        <header className="title-block" id="top">
          <div>
            <p className="eyebrow">GP-TARS V2 · bodywork markings</p>
            <h1>Decals</h1>
            <p className="subtitle">
              Print-ready vinyl artwork for the formed 5052-H32 panels, drawn 1:1 in millimetres on an A2 sheet. The
              hazard markings are function rather than decoration and belong on the robot before any powered test.
            </p>
          </div>
          <div className="revision-stamp" aria-label="Sheet status">
            <span>SHEET <b>A2 · 420 × 594</b></span>
            <span>SCALE <b>1:1 MM</b></span>
            <span>ITEMS <b>{decals.length}</b></span>
            <span>REVISION <b>A</b></span>
          </div>
        </header>

        <SiteNav
          current="/decals"
          links={SITE_LINKS}
        />

        <section>
          <div className="section-heading">
            <span>01</span>
            <div>
              <p>Artwork</p>
              <h2>Decal sheet, revision A</h2>
            </div>
          </div>

          <figure className="decal-sheet">
            <img src={SHEET} alt="GP-TARS V2 decal sheet showing the wordmark, data plate, hazard triangles, E-stop surround, service labels, pinch-point stripes and panel index marks" />
            <figcaption>A2 at 1:1 · dashed rules are cut lines and do not print</figcaption>
          </figure>

          <div className="download-list">
            <a href={SHEET} download>
              <span>
                <b>Decal sheet, revision A</b>
                <small>SVG · vector · 1:1 at A2</small>
              </span>
              <i>DOWNLOAD ↓</i>
            </a>
            <a href={SHEET} target="_blank" rel="noreferrer">
              <span>
                <b>Open full size</b>
                <small>Inspect before sending to print</small>
              </span>
              <i>VIEW ↗</i>
            </a>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <span>02</span>
            <div>
              <p>Contents</p>
              <h2>What is on the sheet</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Decal</th>
                  <th>Size (mm)</th>
                  <th>Qty</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {decals.map(([name, size, qty, purpose]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td className="mono">{size}</td>
                    <td className="mono">{qty}</td>
                    <td className="decal-purpose">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <span>03</span>
            <div>
              <p>Application</p>
              <h2>Print and fitting rules</h2>
            </div>
          </div>
          <ol className="decision-list">
            {rules.map((rule) => (
              <li key={rule}>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
          <div className="notice warning">
            <b>Not certified labels:</b> the hazard pictograms follow ISO 7010 geometry so they read correctly, but they
            are original artwork and carry no certification. Source certified labels wherever compliance is actually
            required, and treat the pinch-point stripes and E-stop surround as safety equipment rather than styling.
          </div>
        </section>

        <footer>
          <span>GP‑TARS V2 · DECAL SHEET REVISION A</span>
          <span>DIMENSIONS IN MILLIMETRES</span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </article>
    </main>
  );
}
