import { docs } from "virtual:gptars/docs";
import { parameters } from "virtual:gptars/parameters";
import { SITE_LINKS, SiteNav } from "./site-nav";

// Every figure on this sheet is read from cad/parameters.py so the published
// numbers cannot drift away from the values the CAD generators consume.
const parameterMap = new Map(parameters.map((entry) => [entry.name, entry]));
const value = (name: string): string => parameterMap.get(name)?.value ?? "—";
// The literal as written in parameters.py, preserving engineering decimals.
const raw = (name: string): string => parameterMap.get(name)?.raw ?? "—";

const keySpecs = [
  ["Standing height", value("ROBOT_HEIGHT"), "mm target envelope"],
  ["CAD scale factor", `${value("REFERENCE_SCALE_MEASURED")}×`, "measured from source height"],
  ["Mass target", "12–25", "kg design class"],
  ["Main joint torque", value("MAIN_ACTUATOR_CONTINUOUS_TORQUE_MIN"), "N·m continuous target"],
  ["Peak joint torque", `${value("MAIN_ACTUATOR_PEAK_TORQUE_INITIAL_MIN")}+`, "N·m preliminary target"],
  ["System bus", value("BATTERY_VOLTAGE"), "V DC nominal"],
];

const packageRows = [
  [
    "Battery reservation",
    `${value("BATTERY_WIDTH")} × ${value("BATTERY_DEPTH")} × ${value("BATTERY_HEIGHT")}`,
    "Lower central bay",
    "Provisional",
  ],
  [
    "AI X1 Pro body",
    `${value("MINI_PC_WIDTH")} × ${value("MINI_PC_HEIGHT")} × ${value("MINI_PC_DEPTH")}`,
    "Vertical, Y 180–375",
    "Exact",
  ],
  [
    "PC service envelope",
    `${value("MINI_PC_KEEP_OUT_WIDTH")} × ${value("MINI_PC_KEEP_OUT_HEIGHT")} × ${value("MINI_PC_KEEP_OUT_DEPTH")}`,
    "Y 165–390",
    "Reserved",
  ],
  [
    "External GPU",
    `${value("GPU_LENGTH")} × ${value("GPU_HEIGHT")} × ${value("GPU_WIDTH")}`,
    "Vertical, Y 420–550",
    "Card placeholder",
  ],
  [
    "Hip actuator",
    `Ø${value("ACTUATOR_HIP_PLACEHOLDER_DIAMETER")} × ${value("ACTUATOR_HIP_PLACEHOLDER_LENGTH")} max`,
    "Hip modules, port and starboard",
    "Placeholder",
  ],
  [
    "Knee actuator",
    `Ø${value("ACTUATOR_KNEE_PLACEHOLDER_DIAMETER")} × ${value("ACTUATOR_KNEE_PLACEHOLDER_LENGTH")}`,
    "Linkage zones",
    "Placeholder",
  ],
];

const materials = [
  ["Primary chassis", value("FRAME_MATERIAL"), "20 × 40 / fabricated sections", "Load path"],
  [
    "Actuator brackets",
    value("STRUCTURAL_MATERIAL"),
    `${value("ACTUATOR_BRACKET_THICKNESS")} mm plate, sized after load study`,
    "Load path",
  ],
  [
    "External panels",
    value("SHELL_MATERIAL"),
    `${raw("SHELL_WALL")} mm nominal (${raw("SHELL_WALL_MIN")}–${raw("SHELL_WALL_MAX")})`,
    "Cosmetic shell",
  ],
  ["Equipment trays", value("ELECTRONICS_TRAY_MATERIAL"), "2–3 mm", "Removable"],
  ["Main shafts", "Steel", `Ø${value("MAIN_SHAFT_DIAMETER")} mm starting point`, "To be calculated"],
  ["Bearing carriers", "Aluminium / steel", "Replaceable", "Service item"],
];

const walkingSteps = [
  "Stand",
  "Shift centre of gravity",
  "Unload leading section",
  "Rotate",
  "Controlled pivot",
  "Detect ground contact",
  "Absorb landing",
  "Rotate body through",
  "Recover vertical",
  "Verify stability",
];

const sensorGroups = [
  ["Perception", "RGB cameras · depth camera · optional LiDAR"],
  ["Proximity", "Time-of-Flight distance sensors · collision detection"],
  ["Balance", "IMU · tilt detection · ground-contact sensing"],
  ["Joint state", "Absolute encoders · velocity · motor current"],
  ["Interaction", "Microphone array · person and object recognition"],
  ["Platform health", "Battery · power · actuator and compute temperatures"],
];

const safetySystems = [
  "Physical mushroom E-stop",
  "Independent actuator contactor",
  "Manual battery disconnect",
  "Current and torque limits",
  "Joint travel limits and hard stops",
  "Motion and communication watchdogs",
  "Tilt and collision detection",
  "Deterministic controlled fault state",
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

const projectRoadmap = [
  ["01", "Original CAD analysis", "Map the source geometry, articulation and pivot positions."],
  ["02", "1,000 mm master model", "Maintain the scaled source as the external reference envelope."],
  ["03", "Structural chassis", "Design the internal aluminium skeleton and serviceable shell mounts."],
  ["04", "Walking mechanism", "Resolve joint geometry, centre of gravity and required actuator torque."],
  ["05", "Actuator selection", "Choose closed-loop BLDC actuators and finalise their mounting systems."],
  ["06", "Power and electronics", "Engineer the battery, distribution, controllers and independent safety circuits."],
  ["07", "Compute and AI", "Integrate local LLM, CUDA GPU, speech, vision and memory."],
  ["08", "Prototype walking", "Prove restrained single-step and recovery movements."],
  ["09", "Autonomous operation", "Add perception, navigation and person-aware interaction."],
  ["10", "Refinement", "Improve gait, body panels, cooling, runtime and reliability."],
];

const cadDownloads = [
  ["Fusion assembly · R09", "/downloads/GP_TARS_V2_R09.f3d", "F3D · current, generated by cad/build_model.py"],
];

// Document downloads are derived from docs/*.md, so a new source file is
// published here without touching this page.
const downloads = [
  ...cadDownloads,
  ...docs.map((entry) => [entry.title, entry.downloadPath, `Markdown · ${entry.file}`]),
];

export default function Home() {
  return (
    <main className="page-shell">
      <article className="drawing-sheet">
        <header className="title-block" id="top">
          <div>
            <p className="eyebrow">GP-TARS V2 · 1 metre walking robot · engineering concept</p>
            <h1>Autonomous walking TARS</h1>
            <p className="subtitle">
              A one-metre robotic platform combining a structural metal chassis, closed-loop walking, local AI, speech and vision inside the recognisable TARS form.
            </p>
          </div>
          <div className="revision-stamp" aria-label="Project revision">
            <span>MODEL <b>NARROW 480</b></span>
            <span>BUILD <b>HYBRID</b></span>
            <span>UNITS <b>MM</b></span>
            <span>STATUS <b>CONCEPT</b></span>
          </div>
        </header>

        <SiteNav
          current="/"
          links={SITE_LINKS}
        />

        <section className="hero" id="overview">
          <div className="hero-copy">
            <div className="status-line"><i /> Full-scale engineering development</div>
            <h2>TARS on the outside. A modern autonomous robot inside.</h2>
            <p>
              The open-source GPTARS geometry supplies the external proportions only. Walking loads pass through a purpose-built {value("FRAME_MATERIAL")} frame, steel shafts and sealed bearings; removable cosmetic panels create the exterior. A high-performance mini PC, NVIDIA GPU and dedicated real-time controller provide local intelligence without giving the LLM direct control of the motors.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="/downloads/GP_TARS_V2_1000_ALUMINIUM_COMPUTE_V2.f3d">Download current Fusion model</a>
              <a className="button" href="https://github.com/scottmeddings/GPTars_v2">Private project repository</a>
            </div>
          </div>
          <figure className="hero-figure">
            <img src="/images/gptars-shell-iso.png" alt="Fusion view of the 480 mm GP-TARS V2 aluminium shell, service panels and leg-arm slabs" />
            <figcaption>NARROW 480 · 480 × 1000 × 260 mm · Fusion assembly</figcaption>
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
            <b>Concept status:</b> 60 N·m continuous and 100+ N·m peak are preliminary main-joint targets. Centre-of-gravity, static-load, landing, recovery and fatigue calculations must validate them before actuator selection or walking-load fabrication.
          </div>
        </section>

        <section id="drawings">
          <div className="section-heading">
            <span>02</span><div><p>Generated from cad/build_model.py</p><h2>CAD drawing gallery</h2></div>
          </div>
          <div className="drawing-grid">
            <figure className="drawing drawing-main">
              <img src="/images/gptars-elevation.svg" alt="Dimensioned front and side elevations of GP-TARS V2 at 480 by 1000 by 259.9 mm" />
              <figcaption><b>General arrangement, R09.</b> Front and side elevations dimensioned: 480 × 1000 × 259.9 overall, 240 chassis, 116 leg-arm slabs, hip axis at 610.8, 174 × 310 display aperture and the 200 mm rockered sole.</figcaption>
            </figure>
            <figure className="drawing">
              <img src="/images/gptars-shell-iso.png" alt="GP-TARS V2 assembled bodywork, leg-arm slabs and rockered feet" />
              <figcaption><b>Assembly.</b> Formed 5052-H32 bodywork over the welded subframe, with the display high on the front face.</figcaption>
            </figure>
            <figure className="drawing">
              <img src="/images/gptars-subframe-iso.png" alt="GP-TARS V2 with the skins removed, showing the welded subframe, drive train and equipment" />
              <figcaption><b>Skins off.</b> TIG-welded 6061 subframe, machined hip bulkheads, the AK45-10 drive and the equipment stack.</figcaption>
            </figure>
          </div>
        </section>

        <section id="structure">
          <div className="section-heading">
            <span>03</span><div><p>Mechanical architecture</p><h2>Metal structure, removable exterior</h2></div>
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
                <div className="dimension width-dim"><span>480 mm</span></div>
              </div>
            </div>
            <div>
              <div className="notice">
                <b>Load-path rule:</b> removable cosmetic panels never carry walking loads, whatever they are made from. The aluminium chassis, actuator brackets, steel shafts and sealed bearings form a serviceable structural robot beneath the shell.
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

        <section id="walking" className="walking-section">
          <div className="section-heading">
            <span>04</span><div><p>Closed-loop locomotion</p><h2>Walking system</h2></div>
          </div>
          <div className="walking-intro">
            <div>
              <p className="software-lede">Movement is measured, supervised and recoverable—not a scaled-up hobby-servo routine.</p>
              <p>Integrated BLDC robotic actuators provide reduction gearing, encoders, closed-loop position control, current monitoring, torque limiting and CAN communication. The controller uses joint state, IMU, contact and current feedback to decide whether each stage is safe to continue.</p>
            </div>
            <article className="torque-card">
              <span>Preliminary main-joint target</span>
              <strong>60 N·m</strong>
              <small>continuous</small>
              <b>100+ N·m peak</b>
            </article>
          </div>
          <ol className="walking-cycle" aria-label="Proposed GP-TARS walking cycle">
            {walkingSteps.map((step, index) => (
              <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><b>{step}</b></li>
            ))}
          </ol>
          <div className="control-chain" aria-label="Walking control chain">
            <div><small>INTENT</small><b>Local AI computer</b></div><i>→</i>
            <div><small>BOUNDARY</small><b>Motion API</b></div><i>→</i>
            <div><small>REAL TIME</small><b>STM32 / Teensy-class MCU</b></div><i>→</i>
            <div><small>FIELD BUS</small><b>CAN robotic actuators</b></div>
          </div>
        </section>

        <section id="compute">
          <div className="section-heading">
            <span>05</span><div><p>Onboard intelligence</p><h2>Compute and local LLM GPU</h2></div>
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
              <p className="card-label">Configurable accelerator bay</p>
              <h3>Approximately 16 GB NVIDIA GPU</h3>
              <ul>
                <li><span>Primary role</span><b>Local LLM inference</b></li>
                <li><span>Current reservation</span><b>300 × 130 × 60 mm</b></li>
                <li><span>Connection</span><b>OCuLink data</b></li>
                <li><span>Power</span><b>Independent supply required</b></li>
                <li><span>VRAM target</span><b>Approximately 16 GB</b></li>
                <li><span>Exact card</span><b className="pending">To be selected after power tests</b></li>
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

        <section id="sensors">
          <div className="section-heading">
            <span>06</span><div><p>Awareness and protection</p><h2>Sensors and independent safety</h2></div>
          </div>
          <div className="sensor-safety-grid">
            <div>
              <h3 className="subheading">Sensor platform</h3>
              <div className="sensor-grid">
                {sensorGroups.map(([title, detail]) => (
                  <article key={title}><b>{title}</b><span>{detail}</span></article>
                ))}
              </div>
            </div>
            <div>
              <h3 className="subheading">Safety independent of AI</h3>
              <ul className="safety-list">
                {safetySystems.map((system) => <li key={system}>{system}</li>)}
              </ul>
            </div>
          </div>
          <div className="notice warning">
            <b>Authority boundary:</b> the LLM may request a high-level action, but it can never bypass the behaviour supervisor, real-time limits, MCU watchdog or hardwired actuator-power isolation.
          </div>
        </section>

        <section id="software" className="software-section">
          <div className="section-heading">
            <span>07</span><div><p>Control and intelligence</p><h2>Software architecture</h2></div>
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
              <pre aria-label="Proposed project repository structure">{`/
├── cad/          Parametric mechanical design
├── firmware/     Real-time motion controller
├── robot/        ROS 2 model, control and safety
├── ai/           Local LLM, memory and behaviour
├── vision/       Perception and recognition
├── speech/       Wake word, STT and TTS
├── docs/         Engineering source of truth
├── bom/          Parts, suppliers and mass budget
├── website/      Public project documentation
└── tests/        Simulation and hardware checks`}</pre>
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
            <span>08</span><div><p>Static packaging audit</p><h2>Reservations and clearances</h2></div>
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
            <span>09</span><div><p>Release gates</p><h2>Open engineering decisions</h2></div>
          </div>
          <ol className="decision-list">
            <li><b>Freeze motion architecture.</b><span>Define walking degrees of freedom, hard stops and complete collision sweeps.</span></li>
            <li><b>Calculate loads.</b><span>Resolve holding, landing, recovery, fault and fatigue cases before choosing actuators.</span></li>
            <li><b>Select the LLM GPU.</b><span>Choose exact card, VRAM, dock, PSU and cooling so the bay can be finalised.</span></li>
            <li><b>Close the mass budget.</b><span>Reconcile chassis, aluminium shell, battery and compute mass with stability inside the 12–25 kg target class.</span></li>
            <li><b>Design for safe testing.</b><span>Add independent E-stop power removal and an engineered overhead fall-arrest fixture.</span></li>
          </ol>
        </section>

        <section id="roadmap" className="roadmap-section">
          <div className="section-heading">
            <span>10</span><div><p>End-to-end programme</p><h2>Development roadmap</h2></div>
          </div>
          <ol className="project-roadmap">
            {projectRoadmap.map(([number, title, description]) => (
              <li key={number}><span>{number}</span><div><b>{title}</b><p>{description}</p></div></li>
            ))}
          </ol>
          <div className="goal-statement">
            <small>GUIDING PRINCIPLE</small>
            <strong>TARS on the outside.</strong>
            <b>A modern autonomous AI robot on the inside.</b>
          </div>
        </section>

        <section id="downloads">
          <div className="section-heading">
            <span>11</span><div><p>Project package</p><h2>Drawings, CAD and specifications</h2></div>
          </div>
          {/* Plain anchors throughout: the GitHub Pages export strips the client
              runtime, so every route must stay reachable without JavaScript. */}
          {/* eslint-disable @next/next/no-html-link-for-pages */}
          <div className="notice">
            <b>Read them online:</b> every specification below is also published as a live page in the{" "}
            <a href="/docs">document register</a>, rendered straight from its markdown source. The master variables are
            browsable in the <a href="/parameters">parameter register</a>.
          </div>
          {/* eslint-enable @next/next/no-html-link-for-pages */}
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
          <span>REV PROJECT SUMMARY V2 · 2026-08-10</span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </article>
    </main>
  );
}
