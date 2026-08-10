import type { Metadata } from "next";
import { parameters } from "virtual:gptars/parameters";
import { SITE_LINKS, SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Master parameters — GP-TARS V2",
  description:
    "The live GP-TARS V2 parameter register, read directly from cad/parameters.py so the published values always match the CAD source.",
};

const groups = parameters.reduce<Map<string, typeof parameters>>((accumulator, entry) => {
  const existing = accumulator.get(entry.group);
  if (existing) existing.push(entry);
  else accumulator.set(entry.group, [entry]);
  return accumulator;
}, new Map());

const derivedCount = parameters.filter((entry) => entry.derived).length;
const openCount = parameters.filter((entry) => entry.kind === "null").length;

export default function ParameterRegister() {
  return (
    <main className="page-shell">
      <article className="drawing-sheet">
        <header className="title-block" id="top">
          <div>
            <p className="eyebrow">GP-TARS V2 · master configuration</p>
            <h1>Parameter register</h1>
            <p className="subtitle">
              Read directly from <code>cad/parameters.py</code> at build time. These are the same values the CAD
              generators consume, so the published figures cannot drift from the model.
            </p>
          </div>
          <div className="revision-stamp" aria-label="Parameter status">
            <span>PARAMETERS <b>{parameters.length}</b></span>
            <span>DERIVED <b>{derivedCount}</b></span>
            <span>UNRESOLVED <b>{openCount}</b></span>
            <span>UNITS <b>MM · N·m · V</b></span>
          </div>
        </header>

        <SiteNav
          current="/parameters"
          links={SITE_LINKS}
        />

        <section>
          <div className="section-heading">
            <span>01</span>
            <div>
              <p>cad/parameters.py</p>
              <h2>Master variables</h2>
            </div>
          </div>

          <div className="notice warning">
            <b>Placeholder discipline:</b> values marked <i>derived</i> are computed from measured source geometry;
            values shown as <i>Not set</i> are deliberately unresolved. Nothing here is released for fabrication until
            the load, mass and thermal cases in the design assumptions are closed.
          </div>

          {[...groups.entries()].map(([group, entries], groupIndex) => (
            <div className="parameter-group" key={group}>
              <h3 className="subheading">
                {String(groupIndex + 1).padStart(2, "0")} · {group}
              </h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Value</th>
                      <th>Type</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.name}>
                        <td className="mono parameter-name">{entry.name}</td>
                        <td className="mono parameter-value">
                          {entry.value}
                          {entry.derived ? <i className="parameter-flag">derived</i> : null}
                        </td>
                        <td className="mono">{entry.kind}</td>
                        <td className="parameter-note">{entry.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        <footer>
          <span>GP‑TARS V2 · PARAMETER REGISTER</span>
          <span>RENDERED FROM cad/parameters.py</span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </article>
    </main>
  );
}
