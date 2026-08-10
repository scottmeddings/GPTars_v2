import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { docs } from "virtual:gptars/docs";
import { formatRevised, SiteNav } from "../../site-nav";

export function generateStaticParams() {
  return docs.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = docs.find((item) => item.slug === slug);
  if (!entry) return { title: "Document not found — GP-TARS V2" };

  return {
    title: `${entry.title} — GP-TARS V2`,
    description: entry.summary.slice(0, 200),
  };
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = docs.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  const entry = docs[index];
  const previous = docs[index - 1];
  const next = docs[index + 1];
  const contents = entry.headings.filter((heading) => heading.depth === 2);

  return (
    <main className="page-shell">
      <article className="drawing-sheet">
        <header className="title-block" id="top">
          <div>
            <p className="eyebrow">
              GP-TARS V2 · document {String(index + 1).padStart(2, "0")} of{" "}
              {String(docs.length).padStart(2, "0")}
            </p>
            <h1>{entry.title}</h1>
            {entry.summary ? <p className="subtitle">{entry.summary}</p> : null}
          </div>
          <div className="revision-stamp" aria-label="Document revision">
            <span>REVISED <b>{formatRevised(entry.revised)}</b></span>
            <span>SOURCE <b>{entry.file}</b></span>
            <span>SECTIONS <b>{entry.headings.length}</b></span>
            <span>WORDS <b>{entry.words.toLocaleString("en-GB")}</b></span>
          </div>
        </header>

        <SiteNav
          links={[
            { href: "/", label: "Overview" },
            { href: "/model", label: "3D model" },
            { href: "/docs", label: "Documents" },
            { href: "/parameters", label: "Parameters" },
          ]}
        />

        <section className="doc-section">
          <div className="doc-layout">
            <aside className="doc-toc" aria-label="Document contents">
              <p className="subheading">On this page</p>
              <ol>
                {contents.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`}>{heading.text}</a>
                  </li>
                ))}
              </ol>
              <a className="button doc-download" href={entry.downloadPath} download>
                Download markdown ↓
              </a>
            </aside>

            <div className="doc-body">
              {entry.status ? (
                <div className="notice">
                  <b>Status:</b> {entry.status}
                </div>
              ) : null}
              <div className="doc-prose" dangerouslySetInnerHTML={{ __html: entry.html }} />
            </div>
          </div>

          <nav className="doc-pager" aria-label="Adjacent documents">
            {previous ? (
              <a href={`/docs/${previous.slug}`}>
                <small>← PREVIOUS</small>
                <b>{previous.title}</b>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a className="doc-pager-next" href={`/docs/${next.slug}`}>
                <small>NEXT →</small>
                <b>{next.title}</b>
              </a>
            ) : (
              <span />
            )}
          </nav>
        </section>

        <footer>
          <span>GP‑TARS V2 · {entry.title.toUpperCase()}</span>
          <span>RENDERED FROM {entry.file}</span>
          {/* Plain anchor: the static GitHub Pages export has no client runtime. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/docs">ALL DOCUMENTS →</a>
        </footer>
      </article>
    </main>
  );
}
