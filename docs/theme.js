(() => {
  const root = document.documentElement;
  const button = document.querySelector('[aria-label="Toggle colour theme"]');
  const stored = window.localStorage.getItem("gptars-theme");
  // Dark is the default. Only an explicit stored choice of "light" overrides it,
  // matching the data-theme="dark" already present in the served markup.
  let dark = stored !== "light";

  const apply = () => {
    root.dataset.theme = dark ? "dark" : "light";
    if (button) button.textContent = dark ? "Light sheet" : "Dark sheet";
  };

  // Keep newer top-level pages visible in the shared navigation even on older
  // generated HTML pages that pre-date these tabs.
  const nav = document.querySelector('.section-nav');
  if (nav) {
    const ensureLink = (href, label) => {
      if (nav.querySelector(`a[href="${href}"]`)) return;
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      if (window.location.pathname.replace(/\/$/, '') === href) {
        link.setAttribute('aria-current', 'page');
      }
      nav.insertBefore(link, button || null);
    };

    ensureLink('/GPTars_v2/software', 'Software');
    ensureLink('/GPTars_v2/personality', 'Personality');
    ensureLink('/GPTars_v2/lessons', 'Lessons');
  }

  button?.addEventListener("click", () => {
    dark = !dark;
    window.localStorage.setItem("gptars-theme", dark ? "dark" : "light");
    apply();
  });

  apply();
})();
