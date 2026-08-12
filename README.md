# GP-TARS V2 1000

Parametric CAD and software project for an approximately 1,000 mm tall autonomous walking TARS-style robot.

The downloaded GPTARS source geometry is reference-only. Primary loads must pass through the aluminium frame, steel shafts and bearings, aluminium actuator brackets, and aluminium chassis components. Production body panels are formed aluminium rather than printed plastic.

The current architecture uses a 6061-T6 aluminium load-bearing chassis and formed 5052-H32 aluminium bodywork. Steel is retained where mechanically necessary for shafts, bearings, motor internals, and selected fasteners.

## Compute baseline

Onboard compute is a vertically mounted **MINISFORUM AI X1 Pro-370** configured with:

- AMD Ryzen AI 9 HX370
- Radeon 890M integrated GPU
- XDNA 2 NPU
- **64 GB DDR5-5600 (2 × 32 GB)**
- **4 TB Lexar NQ780 PCIe 4.0 NVMe**
- **NVIDIA RTX 2000 Ada Generation 16 GB** through OCuLink

The RTX 2000 Ada is the primary CUDA accelerator for local AI inference, while the HX370 CPU, Radeon 890M and NPU remain available for secondary or fallback workloads.

## Software baseline

GP-TARS V2 is **local-first**. Core conversation, vision, memory, display, orchestration and robot-control functions should continue to work without Internet access.

Current software platform:

- **Ubuntu Server 24.04 LTS**
- Docker Engine
- NVIDIA Linux driver
- NVIDIA Container Toolkit
- CUDA-enabled AI containers
- ROS 2 Jazzy
- dedicated real-time safety/motion MCU over CAN/CAN-FD

The LLM operates only at the high-level behaviour layer. It does not directly command raw motor current, torque, PWM or unchecked joint positions. Deterministic motion limits, watchdogs, E-stop handling and safe-state transitions remain under the dedicated safety/motion controller.

See `docs/software_architecture.md` for the full container, ROS 2, memory, vision, speech, display and safety design.

## Power baseline

The canonical robot power architecture is **12.8 V nominal LiFePO4**, with the WattCycle 12.8 V 100 Ah Mini as the current battery baseline. The battery stays low and central.

The mini PC is intended to use a protected 12 V-to-USB-C-PD path through the rear USB4 PD input, subject to physical verification and sustained-load testing. The RTX 2000 Ada remains on its own protected power branch.

## Display / interaction module

The **display/TV is mounted at the top of GP-TARS** and acts as the robot's visual face. Camera and microphone hardware should be co-located with the display in a removable upper service cassette.

On the 1,000 mm robot, the current target interaction zone is approximately 850–950 mm above ground, with a possible 5–10 degree rearward screen tilt. The existing documented screen selection remains authoritative for final CAD cut-out and mounting dimensions.

Current vertical packaging intent:

```text
TOP
Display / face
Camera + microphones
Mini PC
RTX 2000 Ada + OCuLink dock
Power distribution / controllers
12.8 V battery
Walking structure
BOTTOM
```

## Motion development

Initial motion development begins with **two actuators** for bench and supported mechanism testing. Additional joints are added only after the first pair is validated for control, torque, thermal behaviour, current draw and mechanical integration.

Voice- or LLM-triggered movement remains disabled until physical E-stop, motor power isolation, watchdogs, joint limits, fault handling and restrained trajectory tests have passed.

## Current status

- Stage 1 source geometry inspection: complete
- Stage 2 scaled BREP import: blocked by missing `GP_TARS_V2_1000mm_scaled.brep`
- Stage 2 datum and joint proposal: documented, not frozen
- Stage 3 frame: earlier Fusion layout is concept-only and requires revision
- Stage 4 interference report: preliminary reservations documented
- 12.8 V power architecture: selected as design baseline
- upper display/face location: selected as design baseline
- 64 GB RAM + 4 TB NVMe compute configuration: selected as design baseline
- RTX 2000 Ada 16 GB: selected as external CUDA GPU baseline
- Ubuntu Server 24.04 + Docker + ROS 2 Jazzy: selected as software baseline
- local-first AI architecture: selected as software baseline

See `docs/original_geometry_analysis.md`, `docs/design_assumptions.md`, `docs/compute_hardware.md`, and `docs/software_architecture.md` before modifying the CAD or software stack.
