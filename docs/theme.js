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

  // Keep the Software page visible in the shared top navigation even on older
  // generated HTML pages that pre-date the Software tab.
  const nav = document.querySelector('.section-nav');
  if (nav && !nav.querySelector('a[href="/GPTars_v2/software"]')) {
    const software = document.createElement('a');
    software.href = '/GPTars_v2/software';
    software.textContent = 'Software';
    if (window.location.pathname.replace(/\/$/, '') === '/GPTars_v2/software') {
      software.setAttribute('aria-current', 'page');
    }
    nav.insertBefore(software, button || null);
  }

  button?.addEventListener("click", () => {
    dark = !dark;
    window.localStorage.setItem("gptars-theme", dark ? "dark" : "light");
    apply();
  });

  apply();
})();
