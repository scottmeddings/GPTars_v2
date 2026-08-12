# GP-TARS V2 software architecture

Status: software baseline, revision Software V2.

## Core decision

GP-TARS V2 is a **local-first autonomous robot**. Core conversation, perception, memory, display, orchestration and safety functions must continue to operate without Internet access.

Use TARS-AI V3 as a reusable source for character/persona, speech, memory, vision and user-interface concepts where practical. Replace its hobby-servo motion layer with a ROS 2 control stack and a separate real-time safety/motion controller.

The operating principle is:

> TARS-AI supplies the character. ROS 2 supplies the robot. A dedicated MCU supplies deterministic motion and safety.

The LLM is never a motor controller.

## Host platform

Primary compute baseline:

- **MINISFORUM AI X1 Pro-370**
- AMD Ryzen AI 9 HX370
- Radeon 890M integrated GPU
- XDNA 2 NPU
- **64 GB DDR5-5600, 2 × 32 GB**
- **4 TB Lexar NQ780 PCIe 4.0 NVMe**
- **NVIDIA RTX 2000 Ada Generation 16 GB** via OCuLink

Operating system baseline:

- **Ubuntu Server 24.04 LTS**
- Docker Engine
- NVIDIA Linux driver
- NVIDIA Container Toolkit
- CUDA runtime for GPU-enabled containers
- ROS 2 Jazzy

The RTX 2000 Ada is the primary CUDA accelerator for local LLM inference and other heavy AI workloads. The HX370 CPU, Radeon 890M and XDNA 2 NPU remain available for secondary, low-power or fallback workloads where supported.

## Layered system

1. **Independent safety:** hardwired E-stop loop, motor contactor, power isolation and hard limits.
2. **Real-time motion:** dedicated MCU connected by CAN/CAN-FD; encoder monitoring, actuator commands, brakes, joint limits, watchdog and safe stop.
3. **Robot control:** ROS 2 Jazzy on Ubuntu 24.04 LTS; URDF/Xacro model, ros2_control hardware interface, trajectories, state estimation and diagnostics.
4. **Behaviour supervisor:** validates high-level intent against mode, robot state, balance, limits, active faults and operator permission.
5. **TARS experience layer:** personality, wake word, STT, TTS, memory/RAG, vision, display, dashboard and skills.

The MINISFORUM AI X1 Pro runs the non-real-time layers. It must not perform motor commutation or be the only path to a safe shutdown.

## Container architecture

GP-TARS software should be split into small services rather than one monolithic container.

| Service | Responsibility |
|---|---|
| `tars-core` | Main orchestrator, state machine and behaviour coordination |
| `tars-llm` | Local LLM inference |
| `tars-memory` | User profiles, semantic memory, episodic memory and RAG |
| `tars-stt` | Wake word, voice activity detection and speech-to-text |
| `tars-tts` | Local text-to-speech |
| `tars-vision` | Camera ingestion, person/object detection and tracking |
| `tars-display` | Top display/face UI, states and animation |
| `tars-ros` | ROS 2 bridge and robot-state integration |
| `tars-motion` | Gait, kinematics, pose and trajectory requests |
| `tars-can` | Controlled software interface to the safety/motion MCU |
| `tars-api` | REST/WebSocket management API |
| `tars-web` | Local browser management and diagnostics UI |
| `tars-telemetry` | Logs, metrics, health and diagnostics |

Only containers that require CUDA should receive access to the RTX 2000 Ada. GPU access is not granted to every container by default.

## Community software reuse

| Subsystem | Decision | Treatment |
|---|---|---|
| Character/persona system | Reuse/adapt | Preserve TARS character and response behaviour |
| Wake word, STT and barge-in | Reuse/adapt | Retain a modular local speech pipeline |
| TTS | Reuse/adapt | Local, low-latency speech |
| Memory/RAG and message routing | Reuse/adapt | Place behind stable service boundaries |
| Vision and web dashboard | Adapt | Run heavy work on the mini PC / RTX GPU |
| Movement skill registry | Adapt | Emit restricted high-level ROS actions only |
| PCA9685 hobby-servo control | Replace | Not suitable for full-scale walking loads |
| Threaded direct movement calls | Replace | Use supervised, cancellable, monitored ROS actions |

Primary references:

- TARS-AI V3: https://github.com/TARS-AI-Community/TARS-AI
- Original GPTARS Interstellar project: https://github.com/poboisvert/GPTARS_Interstellar
- ROS 2 Jazzy
- ros2_control
- llama.cpp or another CUDA-capable local inference runtime

## LLM command boundary

The LLM may request only named, high-level actions, for example:

```text
perform_gesture("wave_right")
walk_relative(distance=0.30, speed=0.05)
turn_relative(angle_degrees=15)
stop_motion()
return_to_neutral()
approach_person(person_id="known-user")
display_expression("thinking")
```

The LLM must never receive an interface for raw PWM, motor current, direct torque, unchecked joint angles, disabled limits or safety bypass.

The behaviour supervisor approves every motion request. ROS actions provide execution feedback and cancellation. The real-time MCU independently rejects stale, malformed or out-of-limit commands.

Example flow:

```text
User: "TARS, come over here"
        |
        v
Speech-to-text
        |
        v
TARS agent / local LLM
        |
        +-- intent: approach_person
        +-- target: recognised person
        |
        v
Behaviour supervisor
        |
        +-- identity/permission check
        +-- safety/state check
        +-- vision target lookup
        |
        v
ROS 2 navigation / motion action
        |
        v
Real-time safety MCU
        |
        v
CAN actuator commands
```

## ROS communication model

Use ROS 2 for robotics data and control:

- **Topics:** joint state, IMU, camera/sensor state, temperatures, battery, faults and diagnostics.
- **Services:** configuration reads, maintenance-mode transitions and approved fault resets.
- **Actions:** cancellable walking, turning, homing, recovery and gesture sequences with progress feedback.
- **Hardwired:** E-stop, motor contactor and final power removal remain independent of ROS and the LLM.

## Application event bus

Use NATS or MQTT for application-level events that do not belong in the real-time robotics layer, for example:

```text
person.detected
person.recognised
speech.started
speech.completed
battery.low
robot.wake
robot.sleep
user.profile.changed
fault.reported
```

The exact choice between NATS and MQTT remains open.

## Management interfaces

Use REST and WebSocket APIs for:

- browser management UI
- configuration
- health and diagnostics
- telemetry dashboards
- local development tools
- safe operator commands

## Memory architecture

GP-TARS memory should be divided into distinct scopes:

- **Working memory** — current conversation and immediate environment
- **Session memory** — events since boot/session start
- **Personal memory** — known people, preferences and relationships
- **Semantic memory** — manuals, project documents and general facts
- **Episodic memory** — notable previous interactions and experiences
- **Robot memory** — faults, battery history, actuator temperatures, maintenance and calibration history

Current database baseline:

- PostgreSQL
- pgvector

Memory retrieval must be identity- and policy-aware so the robot does not disclose one user's private information to another person.

## Vision and identity

The vision service is responsible for:

- camera capture
- person detection
- face/person recognition where enabled
- object detection
- tracking
- spatial context

Recognised users may receive different interaction styles or profiles, but **mechanical safety rules never change based on identity**.

The primary interaction camera should be physically co-located with the top display/face module.

## Speech architecture

```text
microphone array
      |
      v
wake word / VAD
      |
      v
speech-to-text
      |
      v
TARS agent
      |
      v
text-to-speech
      |
      v
speakers + display animation
```

Speech recognition and synthesis should operate locally where practical.

## Display architecture

The top-mounted display is controlled by `tars-display`.

Responsibilities:

- TARS face / expression rendering
- listening / thinking / speaking states
- warnings and fault status
- boot and self-test state
- battery / connectivity indicators when appropriate
- local setup/status UI where useful

The display service should auto-start into kiosk/full-screen mode without requiring a full Ubuntu desktop environment.

## Motion and actuator architecture

Initial mechanical/software development starts with **two actuators** and expands only after the first pair is validated.

Motion services are responsible for:

- requested pose
- forward/inverse kinematics
- gait generation
- joint trajectory planning
- synchronisation
- balance logic

The safety MCU remains authoritative for:

- motor enable
- hard joint limits
- current/torque limits
- temperature limits
- watchdog timeout
- E-stop handling
- communications loss
- safe shutdown

## Safety MCU

A dedicated deterministic MCU such as STM32 or Teensy-class hardware provides the final safety/control boundary.

The host computer sends a continuous heartbeat. Loss of heartbeat, invalid command sequencing, over-current, thermal faults or E-stop activation forces the motion system to a defined safe state without depending on Docker, ROS 2 or the LLM.

## Proposed repository structure

```text
software/
├── compose/
│   └── docker-compose.yml
├── ros2_ws/src/
│   ├── gptars_description/
│   ├── gptars_interfaces/
│   ├── gptars_hardware/
│   ├── gptars_control/
│   ├── gptars_safety/
│   ├── gptars_behaviors/
│   ├── gptars_state/
│   └── tars_ai_bridge/
├── firmware/
│   └── motion_controller/
├── ai/
│   ├── llm/
│   ├── memory/
│   ├── speech/
│   └── vision/
├── display/
├── dashboard/
├── config/
├── simulation/
└── tests/
```

## Startup sequence

1. Safety MCU boots with motion disabled.
2. Battery and contactor state are checked.
3. Ubuntu Server boots.
4. Docker services start.
5. Core health services initialise.
6. Cameras, microphones and display initialise.
7. Local LLM loads.
8. ROS 2 and robot-state services start.
9. Computer-to-MCU heartbeat is established.
10. GP-TARS performs a self-test.
11. Display shows ready state.
12. Motor enable becomes available only if safety checks pass.

## Failure behaviour

- **LLM crash:** robot remains mechanically safe; AI service may restart independently.
- **GPU failure:** robot can fall back to CPU/iGPU/NPU-supported functions where practical.
- **Container failure:** supervisor restarts the failed service; MCU safety remains independent.
- **Wi-Fi/Internet loss:** local robot operation continues.
- **ROS/motion heartbeat loss:** MCU disables motion.
- **E-stop:** actuator power is removed while safety/compute power remains available where practical for logging and status reporting.

## Storage use

The 4 TB primary NVMe stores:

- Ubuntu Server
- Docker images and volumes
- local AI models
- speech models
- vision models
- PostgreSQL/pgvector data
- application code
- telemetry and active logs

Additional M.2 slots remain available for model libraries, recordings, long-term telemetry or backup data.

## Development sequence

1. Ubuntu Server 24.04 + Docker + NVIDIA driver + CUDA validation.
2. Local LLM container.
3. Wake word, speech-to-text and text-to-speech.
4. TARS personality/orchestration layer.
5. Memory and user profiles.
6. Top display/face service.
7. Vision and person recognition.
8. ROS 2 integration and URDF/Xacro simulation.
9. Safety MCU and CAN protocol.
10. First two actuator bench tests.
11. Supported two-actuator body-motion tests.
12. Additional joints and gait development.
13. Autonomous navigation and higher-level behaviours.

## Initial acceptance milestone

Before locomotion work, GP-TARS should be able to:

- boot autonomously
- show its face/status on the top display
- listen for a wake word
- transcribe speech locally
- run the local LLM through CUDA on the RTX 2000 Ada
- retrieve relevant memory
- generate a spoken response
- animate the display while speaking
- operate without Internet access
- expose health and diagnostics through the local web interface

## Safety release gate

Voice- or LLM-triggered movement remains disabled until the physical E-stop, contactor removal, communications watchdog, joint limits, fault handling and restrained trajectory tests have all passed.
