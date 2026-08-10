import { ThemeToggle } from "./theme-toggle";

export interface NavLink {
  href: string;
  label: string;
}

/**
 * Sticky navigation shared by the overview sheet and every document page.
 * Plain anchors are used deliberately so the scriptless GitHub Pages export
 * keeps working after the RSC runtime is stripped out.
 */
export function SiteNav({ links, current }: { links: NavLink[]; current?: string }) {
  return (
    <nav className="section-nav" aria-label="Site sections">
      {links.map((link) => (
        <a key={link.href} href={link.href} aria-current={link.href === current ? "page" : undefined}>
          {link.label}
        </a>
      ))}
      <ThemeToggle />
    </nav>
  );
}

export function formatRevised(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
