import type { Metadata } from "next";
import { docs } from "virtual:gptars/docs";
import { formatRevised, SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Document register — GP-TARS V2",
  description:
    "Live register of every GP-TARS V2 engineering document, rendered directly from the markdown sources in docs/.",
};

const gitTracked = docs.filter((entry) => entry.revisedSource === "git").length;

export default function DocumentRegister() {
  return (
    <main className="page-shell">
      <article className="drawing-sheet">
        <header className="title-block" id="top">
          <div>
            <p className="eyebrow">GP-TARS V2 · living engineering record</p>
            <h1>Document register</h1>
            <p className="subtitle">
              Every document below is rendered straight from its markdown source in <code>docs/</code>. Editing a
              source file updates this site, the download bundle and the register entry together — there is no second
              copy to keep in step.
            </p>
          </div>
          <div className="revision-stamp" aria-label="Register status">
            <span>DOCUMENTS <b>{docs.length}</b></span>
            <span>TRACKED <b>{gitTracked}/{docs.length}</b></span>
            <span>SOURCE <b>docs/*.md</b></span>
            <span>STATUS <b>LIVE</b></span>
          </div>
        </header>

        <SiteNav
          current="/docs"
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
              <p>Source of truth</p>
              <h2>All engineering documents</h2>
            </div>
          </div>

          <div className="doc-register">
            {docs.map((entry, index) => (
              <a className="doc-card" key={entry.slug} href={`/docs/${entry.slug}`}>
                <div className="doc-card-head">
                  <span className="doc-card-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <b>{entry.title}</b>
                    <p>{entry.summary}</p>
                  </div>
                </div>
                <dl className="doc-card-meta">
                  <div>
                    <dt>Revised</dt>
                    <dd>{formatRevised(entry.revised)}</dd>
                  </div>
                  <div>
                    <dt>Sections</dt>
                    <dd>{entry.headings.length}</dd>
                  </div>
                  <div>
                    <dt>Words</dt>
                    <dd>{entry.words.toLocaleString("en-GB")}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd className="doc-card-file">{entry.file}</dd>
                  </div>
                </dl>
                {entry.status ? <p className="doc-card-status">{entry.status}</p> : null}
              </a>
            ))}
          </div>

          <div className="notice">
            <b>How this stays current:</b> a build-time Vite plugin reads <code>docs/*.md</code> and{" "}
            <code>cad/parameters.py</code>, renders them, and mirrors the markdown into the download bundle. Add a new
            document to <code>docs/</code> and it appears here on the next reload without any further wiring.
          </div>
        </section>

        <section>
          <div className="section-heading">
            <span>02</span>
            <div>
              <p>Consistency</p>
              <h2>Open contradictions between sources</h2>
            </div>
          </div>
          <div className="notice">
            <b>Body panel material — resolved 2026-08-10.</b> Formed 5052-H32 aluminium sheet at 1.2 mm supersedes the
            printed PETG/ASA/CF bodywork in the original brief. <code>docs/project_specification.md</code> and{" "}
            <code>docs/aluminium_architecture.md</code> now carry the revision note, and all four sources agree. The
            open consequence is mass: a full skin is approximately 9.4 kg against a 12–25 kg target, so no panel
            geometry may be released before the mass budget exists.
          </div>
          <div className="notice warning">
            <b>Two scale factors are in circulation.</b> The brief quotes 3.9943785× and{" "}
            <code>docs/design_assumptions.md</code> records it as unverified, while{" "}
            <code>cad/parameters.py</code> derives 3.993659× from the measured 250.397 mm source height. The measured
            value is the one shown on the overview sheet and the parameter register.
          </div>
        </section>

        <footer>
          <span>GP‑TARS V2 · DOCUMENT REGISTER</span>
          <span>RENDERED FROM docs/*.md</span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </article>
    </main>
  );
}
