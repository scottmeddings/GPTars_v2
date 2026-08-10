(() => {
  const root = document.documentElement;
  const button = document.querySelector('[aria-label="Toggle colour theme"]');
  const stored = window.localStorage.getItem("gptars-theme");
  let dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;

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
