"use client";

import { useEffect, useState } from "react";

const keySpecs = [
  ["Standing height", "1,000", "mm target envelope"],
  ["Reference width", "958.7", "mm scaled source"],
  ["Reference depth", "259.9", "mm scaled source"],
  ["Frame", "6061-T6", "aluminium"],
  ["Body panels", "5052-H32", "1.2 mm nominal"],
  ["System bus", "24", "V DC nominal"],
];

const packageRows = [
  ["Battery reservation", "300 × 150 × 120", "Lower central bay", "Provisional"],
  ["AI X1 Pro body", "195 × 195 × 47.5", "Vertical, Y 180–375", "Exact"],
  ["PC service envelope", "225 × 225 × 100", "Y 165–390", "Reserved"],
  ["External GPU", "300 × 130 × 60", "Vertical, Y 420–550", "Card placeholder"],
  ["Main actuator", "Ø120 × 100 max", "Four main joint zones", "Placeholder"],
  ["Secondary actuator", "Ø70 × 70", "Linkage zones", "Placeholder"],
];

const materials = [
  ["Primary chassis", "6061-T6", "20 × 40 / fabricated sections", "Load path"],
  ["Joint bulkheads", "6061-T6 plate", "8 mm starting point", "Load path"],
  ["Body panels", "5052-H32 sheet", "1.0–1.6 mm", "Formed skin"],
  ["Equipment trays", "5052-H32 sheet", "2–3 mm", "Removable"],
  ["Main shafts", "Steel", "Ø20 mm starting point", "To be calculated"],
  ["Secondary shafts", "Steel", "Ø12 mm starting point", "To be calculated"],
];

const softwareLayers = [
  ["05", "TARS-AI experience", "Personality, wake word, STT, TTS, memory, vision, dashboard and skills", "Mini PC · Python services"],
  ["04", "Behaviour supervisor", "Validates intent, robot state, permissions and movement preconditions", "Mini PC · ROS 2 node"],
  ["03", "ROS 2 control", "Robot model, trajectories, state estimation, diagnostics and hardware abstraction", "Mini PC · ROS 2 Jazzy"],
  ["02", "Real-time motion", "CAN commands, encoder feedback, limits, watchdog, brakes and safe stop", "Dedicated MCU"],
  ["01", "Independent safety", "E-stop loop, contactor, hard limits and power isolation", "Hardwired system"],
];

const reuseRows = [
  ["Character/persona system", "Reuse", "TARS voice, humour and response behaviour"],
  ["Wake word, STT and barge-in", "Reuse", "Keep modular speech pipeline"],
  ["Piper TTS", "Reuse", "Local low-latency speech"],
  ["Memory/RAG and message router", "Reuse", "Keep behind a stable service boundary"],
  ["Vision and web dashboard", "Adapt", "Move heavy processing to mini PC/GPU"],
  ["Movement skill registry", "Adapt", "Emit restricted ROS actions only"],
  ["PCA9685 servo controller", "Replace", "Not suitable for full-scale walking loads"],
  ["Threaded direct movement calls", "Replace", "Use supervised, cancellable trajectories"],
];

const softwarePhases = [
  ["01", "Digital robot", "Create URDF/Xacro from the Fusion joint layout and run every joint with mock hardware."],
  ["02", "One-joint bench", "Implement the MCU/CAN protocol, encoder feedback, limits and watchdog on one restrained actuator."],
  ["03", "Safety supervisor", "Add E-stop state, contactor control, faults, timeouts and deterministic safe stopping."],
  ["04", "Restrained motion", "Run neutral poses and gestures with the robot supported by an independent fall-arrest fixture."],
  ["05", "Walking primitives", "Develop monitored step, turn, stop and recovery actions before voice control is enabled."],
  ["06", "TARS integration", "Connect personality, speech, memory and vision through the restricted behaviour bridge."],
  ["07", "Local LLM", "Run a CUDA-backed model server on the external NVIDIA GPU and profile heat, power and latency."],
];

const downloads = [
  ["Fusion assembly · Compute V2", "/downloads/GP_TARS_V2_1000_ALUMINIUM_COMPUTE_V2.f3d", "F3D · current concept"],
  ["Fusion assembly · Aluminium V1", "/downloads/GP_TARS_V2_1000_ALUMINIUM_CONCEPT_V1.f3d", "F3D · archived concept"],
  ["Project specification", "/downloads/project_specification.md", "Markdown"],
  ["Compute hardware specification", "/downloads/compute_hardware.md", "Markdown"],
  ["Aluminium architecture", "/downloads/aluminium_architecture.md", "Markdown"],
  ["Interference report", "/downloads/interference_report.md", "Markdown"],
  ["Software architecture", "/downloads/software_architecture.md", "Markdown"],
];

export default function Home() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("gptars-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored ? stored === "dark" : preferred);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    window.localStorage.setItem("gptars-theme", next ? "dark" : "light");
  }

  return (
    <main className="page-shell">
      <article className="drawing-sheet">
        <header className="title-block" id="top">
          <div>
            <p className="eyebrow">GP-TARS V2 · 1 metre walking robot · engineering concept</p>
            <h1>Full-scale aluminium TARS</h1>
            <p className="subtitle">
              Parametric mechanical architecture, onboard AI compute and service packaging for a self-propelled walking robot.
            </p>
          </div>
          <div className="revision-stamp" aria-label="Project revision">
            <span>MODEL <b>COMPUTE V2</b></span>
            <span>MATERIAL <b>ALUMINIUM</b></span>
            <span>UNITS <b>MM</b></span>
            <span>STATUS <b>CONCEPT</b></span>
          </div>
        </header>

        <nav className="section-nav" aria-label="Page sections">
          <a href="#overview">Overview</a>
          <a href="#drawings">Drawings</a>
          <a href="#structure">Structure</a>
          <a href="#compute">AI compute</a>
          <a href="#software">Software</a>
          <a href="#clearance">Clearance</a>
          <a href="#downloads">Files</a>
          <button type="button" onClick={toggleTheme} aria-label="Toggle colour theme">
            {dark ? "Light sheet" : "Dark sheet"}
          </button>
        </nav>

        <section className="hero" id="overview">
          <div className="hero-copy">
            <div className="status-line"><i /> Active packaging study</div>
            <h2>One-metre robot. Real structure. Local AI.</h2>
            <p>
              The original TARS geometry supplies proportions only. Walking loads pass through a purpose-built aluminium frame, dual-bearing joint modules and steel shafts. A MINISFORUM AI X1 Pro provides onboard compute, with a required external NVIDIA GPU for local LLM inference.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="/downloads/GP_TARS_V2_1000_ALUMINIUM_COMPUTE_V2.f3d">Download current Fusion model</a>
              <a className="button" href="https://github.com/scottmeddings/GPTars_v2">Private project repository</a>
            </div>
          </div>
          <figure className="hero-figure">
            <img src="/images/gptars-compute-v2.png" alt="Fusion perspective view of the GP-TARS V2 aluminium frame and equipment reservations" />
            <figcaption>COMPUTE V2 · transparent reference volumes · Fusion assembly</figcaption>
          </figure>
        </section>

        <section>
          <div className="section-heading">
            <span>01</span><div><p>Master envelope</p><h2>Key specifications</h2></div>
          </div>
          <div className="spec-grid">
            {keySpecs.map(([label, value, unit]) => (
              <article className="spec-card" key={label}>
                <p>{label}</p><strong>{value}</strong><span>{unit}</span>
              </article>
            ))}
          </div>
          <div className="notice warning">
            <b>Concept status:</b> the current frame proves packaging only. Actuator torque, joint geometry, bearing loads, stability and full motion sweeps must be resolved before any walking-load fabrication.
          </div>
        </section>

        <section id="drawings">
          <div className="section-heading">
            <span>02</span><div><p>Fusion reference views</p><h2>CAD drawing gallery</h2></div>
          </div>
          <div className="drawing-grid">
            <figure className="drawing drawing-main">
              <img src="/images/gptars-compute-v2.png" alt="Current GP-TARS V2 compute packaging assembly" />
              <figcaption><b>Current assembly.</b> Exact mini-PC body and service envelope with provisional GPU, battery and actuator reservations.</figcaption>
            </figure>
            <figure className="drawing">
              <img src="/images/gptars-aluminium-v1.png" alt="GP-TARS V2 aluminium architecture concept" />
              <figcaption><b>Aluminium V1.</b> 6061 frame architecture and 5052 equipment-tray intent.</figcaption>
            </figure>
            <figure className="drawing">
              <img src="/images/tars-original-reference.png" alt="Original imported TARS source geometry in Fusion" />
              <figcaption><b>Source reference.</b> Original geometry retained for external proportion and datum extraction only.</figcaption>
            </figure>
          </div>
        </section>

        <section id="structure">
          <div className="section-heading">
            <span>03</span><div><p>Mechanical architecture</p><h2>Aluminium structure and body</h2></div>
          </div>
          <div className="split-layout">
            <div className="diagram-card">
              <div className="robot-elevation" role="img" aria-label="Simplified GP-TARS vertical equipment-zone diagram">
                <div className="dimension height-dim"><span>1,000 mm</span></div>
                <div className="robot-outline">
                  <div className="zone upper">UPPER JOINT MODULES</div>
                  <div className="zone controls">CONTROLS + IMU</div>
                  <div className="zone gpu">EXTERNAL GPU</div>
                  <div className="zone pc">AI X1 PRO</div>
                  <div className="zone battery">24 V BATTERY</div>
                </div>
                <div className="dimension width-dim"><span>958.7 mm reference</span></div>
              </div>
            </div>
            <div>
              <div className="notice">
                <b>Load-path rule:</b> cosmetic panels never carry walking loads. Major pivots use two separated sealed bearings where packaging permits; single-bearing cantilever joints are not the baseline.
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Part group</th><th>Material</th><th>Nominal size</th><th>Role</th></tr></thead>
                  <tbody>{materials.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className={i > 0 ? "mono" : ""}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section id="compute">
          <div className="section-heading">
            <span>04</span><div><p>Onboard intelligence</p><h2>Compute and external LLM GPU</h2></div>
          </div>
          <div className="compute-grid">
            <article className="system-card featured">
              <p className="card-label">Selected mini PC</p>
              <h3>MINISFORUM AI X1 Pro-370</h3>
              <ul>
                <li><span>Processor</span><b>AMD Ryzen AI 9 HX 370</b></li>
                <li><span>Integrated graphics</span><b>Radeon 890M</b></li>
                <li><span>Memory support</span><b>Up to 128 GB DDR5</b></li>
                <li><span>Installed envelope</span><b>195 × 195 × 47.5 mm</b></li>
                <li><span>Mass</span><b>1.5 kg</b></li>
                <li><span>GPU link</span><b>OCuLink PCIe 4.0 ×4</b></li>
              </ul>
            </article>
            <article className="system-card">
              <p className="card-label">Required accelerator</p>
              <h3>External NVIDIA GPU</h3>
              <ul>
                <li><span>Primary role</span><b>Local LLM inference</b></li>
                <li><span>Current reservation</span><b>300 × 130 × 60 mm</b></li>
                <li><span>Connection</span><b>OCuLink data</b></li>
                <li><span>Power</span><b>Independent supply required</b></li>
                <li><span>Exact card</span><b className="pending">To be selected</b></li>
                <li><span>Dock + cable volume</span><b className="pending">Not yet modelled</b></li>
              </ul>
            </article>
          </div>
          <div className="power-flow" aria-label="Robot compute power and data architecture">
            <div><small>ENERGY</small><b>24 V battery</b></div><i>→</i>
            <div><small>REGULATION</small><b>Protected DC conversion</b></div><i>→</i>
            <div><small>COMPUTE</small><b>AI X1 Pro</b></div><i className="data">OCuLink</i>
            <div><small>LLM</small><b>NVIDIA GPU</b></div>
          </div>
          <p className="fine-print">The 24 V robot battery must not connect directly to the mini PC. The external GPU also needs a separately sized protected supply; OCuLink carries data, not card power.</p>
        </section>

        <section id="software" className="software-section">
          <div className="section-heading">
            <span>05</span><div><p>Control and intelligence</p><h2>Software architecture</h2></div>
          </div>
          <div className="software-intro">
            <div>
              <p className="software-lede">TARS-AI supplies the character. ROS 2 supplies the robot. A dedicated MCU supplies deterministic motion and safety.</p>
              <p>The community software is a strong starting point for personality, speech, memory, vision and interface work. Its hobby-servo motion layer will be replaced by a supervised ROS 2 and CAN architecture designed for a one-metre walking machine.</p>
            </div>
            <div className="source-links">
              <a href="https://github.com/TARS-AI-Community/TARS-AI" target="_blank" rel="noreferrer"><b>TARS-AI V3</b><span>Primary software reference ↗</span></a>
              <a href="https://github.com/poboisvert/GPTARS_Interstellar" target="_blank" rel="noreferrer"><b>GPTARS Interstellar</b><span>Historical motion reference ↗</span></a>
            </div>
          </div>

          <div className="software-stack" aria-label="GP-TARS software and safety layers">
            {softwareLayers.map(([number, title, description, host]) => (
              <article key={number}>
                <span className="layer-number">{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
                <b>{host}</b>
              </article>
            ))}
          </div>

          <div className="software-columns">
            <div>
              <h3 className="subheading">Community code decision</h3>
              <div className="table-wrap software-table">
                <table>
                  <thead><tr><th>Subsystem</th><th>Decision</th><th>GP-TARS V2 treatment</th></tr></thead>
                  <tbody>{reuseRows.map(([system, decision, treatment]) => (
                    <tr key={system}><td>{system}</td><td><span className={`decision-chip ${decision.toLowerCase()}`}>{decision}</span></td><td>{treatment}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="subheading">Operating stack</h3>
              <div className="stack-specs">
                <article><span>Host OS</span><b>Ubuntu 24.04 LTS</b><small>MINISFORUM AI X1 Pro</small></article>
                <article><span>Robot framework</span><b>ROS 2 Jazzy</b><small>Lifecycle-managed nodes</small></article>
                <article><span>Motion framework</span><b>ros2_control</b><small>Custom CAN hardware interface</small></article>
                <article><span>LLM runtime</span><b>llama.cpp server</b><small>CUDA · OpenAI-style API</small></article>
                <article><span>Real-time layer</span><b>Dedicated MCU</b><small>CAN/CAN-FD · watchdog</small></article>
                <article><span>Simulation</span><b>URDF + mock hardware</b><small>No motors required</small></article>
              </div>
            </div>
          </div>

          <div className="command-boundary">
            <div className="boundary-title"><span>LLM COMMAND BOUNDARY</span><b>High-level intent only</b></div>
            <div className="command-grid">
              <div className="allowed"><small>ALLOWED</small><code>perform_gesture(&quot;wave_right&quot;)</code><code>walk_relative(0.30, 0.05)</code><code>turn_relative(15)</code><code>stop_motion()</code></div>
              <div className="blocked"><small>BLOCKED</small><code>raw_pwm(channel, value)</code><code>set_motor_current(amps)</code><code>unchecked_joint_angle()</code><code>bypass_safety()</code></div>
            </div>
            <p>The behaviour supervisor checks mode, balance state, active faults, limits and operator permission before any motion action reaches ROS 2. The MCU independently rejects stale or invalid commands.</p>
          </div>

          <div className="software-repo">
            <div>
              <h3 className="subheading">Proposed project structure</h3>
              <pre aria-label="Proposed software repository structure">{`software/
├── ros2_ws/src/
│   ├── gptars_description/
│   ├── gptars_interfaces/
│   ├── gptars_hardware/
│   ├── gptars_control/
│   ├── gptars_safety/
│   ├── gptars_behaviors/
│   ├── gptars_state/
│   └── tars_ai_bridge/
├── firmware/motion_controller/
├── simulation/
├── ai/
├── dashboard/
├── config/
└── tests/`}</pre>
            </div>
            <div>
              <h3 className="subheading">Communication model</h3>
              <ul className="interface-list">
                <li><b>Topics</b><span>Joint state, IMU, temperatures, battery, faults and diagnostics.</span></li>
                <li><b>Services</b><span>Short operations such as reset fault, get configuration or enter maintenance mode.</span></li>
                <li><b>Actions</b><span>Cancellable walking, turning, gestures, homing and recovery sequences with feedback.</span></li>
                <li><b>Hardwired</b><span>E-stop, contactor and final power removal remain independent of ROS and the LLM.</span></li>
              </ul>
            </div>
          </div>

          <h3 className="subheading roadmap-heading">Development sequence</h3>
          <ol className="software-roadmap">
            {softwarePhases.map(([number, title, description]) => (
              <li key={number}><span>{number}</span><div><b>{title}</b><p>{description}</p></div></li>
            ))}
          </ol>
          <div className="notice warning">
            <b>Safety gate:</b> voice or LLM-triggered motion stays disabled until physical E-stop, contactor removal, watchdog behaviour, joint limits and restrained trajectory tests have all passed.
          </div>
        </section>

        <section id="clearance">
          <div className="section-heading">
            <span>06</span><div><p>Static packaging audit</p><h2>Reservations and clearances</h2></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Reservation</th><th>Envelope (mm)</th><th>Position</th><th>Status</th></tr></thead>
              <tbody>{packageRows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className={i > 0 ? "mono" : ""}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <div className="clearance-cards">
            <article><span>PC service → GPU</span><strong>30 mm</strong><small>clear static gap</small></article>
            <article><span>Battery → PC service</span><strong>15 mm</strong><small>clear static gap</small></article>
            <article><span>PC body → GPU</span><strong>45 mm</strong><small>clear static gap</small></article>
            <article className="alert"><span>Frame → actuators</span><strong>4</strong><small>known concept conflicts</small></article>
          </div>
          <div className="notice warning">
            <b>Not yet checked:</b> moving-joint sweeps, cable bends, GPU dock and PSU, connector protrusions, airflow ducts, panel fasteners, service extraction paths and clearance to a verified scaled external BREP.
          </div>
        </section>

        <section>
          <div className="section-heading">
            <span>07</span><div><p>Release gates</p><h2>Open engineering decisions</h2></div>
          </div>
          <ol className="decision-list">
            <li><b>Freeze motion architecture.</b><span>Define walking degrees of freedom, hard stops and complete collision sweeps.</span></li>
            <li><b>Calculate loads.</b><span>Resolve holding, landing, recovery, fault and fatigue cases before choosing actuators.</span></li>
            <li><b>Select the LLM GPU.</b><span>Choose exact card, VRAM, dock, PSU and cooling so the bay can be finalised.</span></li>
            <li><b>Close the mass budget.</b><span>Reconcile aluminium body mass, battery capacity and stability within the 12–25 kg target class.</span></li>
            <li><b>Design for safe testing.</b><span>Add independent E-stop power removal and an engineered overhead fall-arrest fixture.</span></li>
          </ol>
        </section>

        <section id="downloads">
          <div className="section-heading">
            <span>08</span><div><p>Project package</p><h2>Drawings, CAD and specifications</h2></div>
          </div>
          <div className="download-list">
            {downloads.map(([name, href, meta]) => (
              <a href={href} key={name} download>
                <span><b>{name}</b><small>{meta}</small></span><i>DOWNLOAD ↓</i>
              </a>
            ))}
          </div>
        </section>

        <footer>
          <span>GP‑TARS V2 · ENGINEERING PROJECT SHEET</span>
          <span>REV SOFTWARE V1 · 2026-08-10</span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </article>
    </main>
  );
}
