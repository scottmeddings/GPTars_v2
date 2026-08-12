(() => {
  const root = document.documentElement;
  const button = document.querySelector('[aria-label="Toggle colour theme"]');
  const stored = window.localStorage.getItem("gptars-theme");
  let dark = stored !== "light";

  const apply = () => {
    root.dataset.theme = dark ? "dark" : "light";
    if (button) button.textContent = dark ? "Light sheet" : "Dark sheet";
  };

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
    ensureLink('/GPTars_v2/power', 'Power Management');
  }

  // Add the full architecture drawing to the Software page. Keeping this in the
  // shared script means the diagram appears even when the generated HTML page
  // has not yet been rebuilt from its source template.
  if (window.location.pathname.replace(/\/$/, '') === '/GPTars_v2/software') {
    const article = document.querySelector('.drawing-sheet');
    const firstSection = article?.querySelector('section');
    if (article && firstSection && !document.getElementById('software-architecture-diagram')) {
      const section = document.createElement('section');
      section.id = 'software-architecture-diagram';
      section.innerHTML = `
        <div class="section-heading"><span>02</span><div><p>System view</p><h2>GP-TARS software architecture</h2></div></div>
        <p class="software-lede">Phase 1 keeps the robot local-first: OAK-D vision and the microphone array feed modular services on the HX370, while ROS 2 and the independent safety MCU remain below the AI layer. The RTX 2000 Ada is a later expansion rather than a Phase 1 dependency.</p>
        <figure class="drawing drawing-main">
          <a href="/GPTars_v2/images/gptars-software-architecture.svg" target="_blank" rel="noreferrer" aria-label="Open the GP-TARS software architecture diagram full size">
            <img src="/GPTars_v2/images/gptars-software-architecture.svg" alt="GP-TARS V2 Phase 1 software architecture diagram showing OAK-D Pro W, ReSpeaker microphone array, Ubuntu Server Docker services, local LLM and memory, ROS 2 motion control, safety MCU, CAN actuators, GitHub deployment and future RTX expansion"/>
          </a>
          <figcaption><b>Phase 1 architecture.</b> Click the drawing to open the full-size vector version. AI requests intent; deterministic robot control and the safety MCU retain authority over movement.</figcaption>
        </figure>`;
      firstSection.insertAdjacentElement('afterend', section);
    }
  }

  button?.addEventListener("click", () => {
    dark = !dark;
    window.localStorage.setItem("gptars-theme", dark ? "dark" : "light");
    apply();
  });

  apply();
})();
