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

  button?.addEventListener("click", () => {
    dark = !dark;
    window.localStorage.setItem("gptars-theme", dark ? "dark" : "light");
    apply();
  });

  apply();
})();
