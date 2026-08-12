# Compute and software stack

Status: proposed stack, revision Stack V1, 2026-08-10.

This document specifies the Ubuntu and container architecture that runs on the
MINISFORUM AI X1 Pro-370, the onboard display and screen-sharing design, and the
memory, storage, power and thermal budgets that follow from them.

It covers layers 03 to 05 of `docs/software_architecture.md` only. Layers 01 and
02 — the hardwired E-stop loop, the actuator contactor and the deterministic
motion MCU — are hardware and firmware. Nothing in this document may become a
dependency of stopping the robot.

## Host baseline

| Item | Selection | Note |
|---|---|---|
| Distribution | Ubuntu 24.04 LTS, server (no desktop) | Matches ROS 2 Jazzy's supported platform |
| Kernel | Stock `linux-generic`, `PREEMPT` | Hard real-time lives on the MCU, not here |
| Container runtime | Docker Engine + Compose v2 | |
| GPU runtime | `nvidia-container-toolkit` | Required for CUDA inside containers |
| CAN | SocketCAN, `can0` brought up by systemd before Docker | |
| Time | `chrony`, with the MCU as a monotonic cross-check | Log correlation across a fall is worthless without it |

The mini PC runs no graphical session on the host. The onboard display is driven
from a container in kiosk mode (see *Human-machine interface*).

Isolate two CPU cores for the ROS 2 control path using `isolcpus` and pin the
`ros-control` container to them. Container overhead is namespacing, not
virtualisation, so throughput is unaffected — but scheduling jitter under a
loaded LLM is real, and the control loop must not compete with inference.

## Container inventory

Eleven containers. The split follows failure domain and update cadence, not
service granularity for its own sake; every additional split is another IPC hop
in a latency path.

### Tier 1 — robot core

Must start and run with no AI stack present.

| Container | Contents | Devices |
|---|---|---|
| `ros-control` | ros2_control, CAN hardware interface, URDF/`robot_state_publisher`, TF, state estimation | `can0` |
| `safety-supervisor` | Behaviour supervisor, fault state machine, MCU watchdog peer | `can0` (read), serial |

`safety-supervisor` is deliberately separate from `ros-control`. It must survive
an out-of-memory event or crash anywhere in the intelligence stack, and it should
be auditable and updatable independently. Give it a memory reservation, not just
a limit.

### Tier 2 — perception and interaction

| Container | Contents | Devices |
|---|---|---|
| `llm-server` | llama.cpp CUDA server, OpenAI-style API | NVIDIA GPU |
| `vision` | Camera pipeline, depth, detection and recognition | V4L2, depth camera, NVIDIA GPU |
| `speech` | Wake word, STT and TTS as one pipeline | ALSA/USB audio |

`speech` is intentionally one container. Wake word, transcription and speech
output chain directly, and barge-in is latency-critical; splitting them adds
round trips to the path a person actually feels.

### Tier 3 — behaviour, data and interface

| Container | Contents | Devices |
|---|---|---|
| `tars-ai` | Persona, message router, memory orchestration, skill registry | — |
| `memory` | Vector store and embeddings | Data volume |
| `hmi` | Onboard display UI in kiosk mode | DRM/KMS or remote panel |
| `streaming` | WebRTC/RTSP/HLS server for screen sharing | iGPU encoder |

### Tier 4 — operations

| Container | Contents |
|---|---|
| `observability` | Log and metric shipping, rosbag recording, health endpoints |

A robot that falls over without a recording is a robot that falls over twice.

### Reduced sets

- **First bring-up (5):** `ros-control`, `safety-supervisor`, `observability`,
  `hmi`, `streaming`. No AI at all until joints move under supervision.
- **Permanent merge candidate:** fold `hmi` into `tars-ai` if the interface stays
  a thin web client.

## Networking model

All containers run with `network_mode: host`.

ROS 2 discovery is DDS multicast, which bridged Docker networking breaks. Host
networking is standard practice for robots and is assumed throughout. The
consequence must be understood: isolation between these containers is process,
filesystem and cgroup, **not** network. Any container can reach any ROS 2 topic.

The LLM command boundary in `docs/software_architecture.md` is therefore enforced
in `safety-supervisor`, not by network segmentation. Do not weaken it on the
assumption that containers cannot see each other.

Grant devices explicitly with `--device`. No container in this stack runs
`--privileged`; a privileged container adjacent to a safety system defeats the
authority boundary the whole architecture exists to create.

## GPU allocation

The external NVIDIA card is the scarce resource, and `llm-server` and `vision`
both want it. VRAM, not system RAM, is the binding constraint on this robot.

| VRAM | What it supports |
|---|---|
| 16 GB | A 14B-class model at Q4 (~9 GB) plus vision (~3 GB). Workable, but the two compete and context length is limited |
| 24 GB | A 32B-class model at Q4, or a 14B model with comfortable vision headroom and long context |

24 GB is the better buy if the bay and its independent supply allow it. It is
cheaper than discovering after the GPU bracket is fabricated that vision and the
language model cannot co-reside.

Set explicit VRAM limits per container rather than letting both allocate freely.
An OOM inside CUDA during a walking trial is a fault case, not an inconvenience.

Video encoding for screen sharing uses the **Radeon 890M integrated GPU** via
VA-API, not the NVIDIA card. This keeps encode traffic off the OCuLink PCIe 4.0
x4 link, leaves NVENC free, and keeps the display pipeline local to whatever
drives the panel.

## Human-machine interface

### What the source geometry already contains

The imported GPTARS assembly contains `Screen`, `Screen Protector` and a
`Screen support` under `Chassis / Upper Lid`. A display is original design
intent and V2 should scale that intent rather than invent a new location.

![GP-TARS V2 dimensioned front and side elevations at the 480 x 1000 x 259.9 mm build size](/images/gptars-elevation.svg)

### The constraint that sets the size

The central chassis measures 133.232 × 250.050 × 65.070 mm in the source and
**532 × 999 × 260 mm** at the 3.993659 reference scale, but the build width was subsequently narrowed to **240 mm** (see below). That is a large
front face, but it is not one rigid body: the upper and lower chassis articulate
about the main and secondary axles. Source axis heights are measured from a base
at `SOURCE_Y_MIN = -10.366961`, so height above ground is
`(Y_source - SOURCE_Y_MIN) x 3.993659`:

| Axle | Source Y | Scaled height (mm) |
|---|---:|---:|
| Upper secondary | 212.460 | 889.9 |
| Upper main | 199.460 | 838.0 |
| Lower secondary | 186.460 | 786.1 |
| Lower main | 142.585 | 610.8 |

These agree with `docs/interference_report.md`, which records the upper axes at
approximately Y=786–890 and the lower main axis near Y=611.

The Upper Lid volume above the upper secondary axle is therefore
**240 mm wide by only 110 mm tall**. A display must fit inside one rigid section;
nothing may span an articulating axle.

### Recommended display

The Upper Lid therefore admits only a wide bar panel, roughly 210 × 85 mm of
usable aperture. **The display is not placed there.**

Reference footage of a working replica mounts its screen on the **main front face
of the lower chassis** instead, and that is the better location. The front face
below the hip axis is a single rigid section approximately **240 mm wide by 600 mm
tall**, which is a far larger canvas than the lid.

| Location | Usable aperture | Verdict |
|---|---|---|
| Front face, below the hip axis | ~240 × 600 mm | **Selected.** Admits a full portrait panel |
| Upper Lid, above Y=889.9 | ~210 × 85 mm | Bar panels only |
| Between the lower axes, Y=611–786 | 240 × 175 mm | Too shallow once structure is allowed for |

The modelled aperture is a **15.6 inch portrait panel, 194 × 345 mm active**,
positioned Y=130 to 475. It clears the hip axis at Y=610.8 comfortably, so no
panel crosses an articulating joint.

Panel size is set by the **240 mm chassis**, not by preference. With 23 mm of
margin each side for the panel return and aperture doubler, 194 mm is the widest
active area that fits. A 21.5 inch panel at 268 mm wide will not go in.

Reserve approximately **25 mm of Z depth** behind the aperture. The mini PC and
GPU reservations sit deeper in the body, so there is no depth conflict, but the
25 mm still comes out of the 259.9 mm total that `docs/interference_report.md`
lists as risk 1.

### The cable problem solves itself

An earlier revision of this document placed the display in the Upper Lid and
concluded, correctly for that position, that no video cable should cross the
articulating axes.

Moving the display to the lower chassis front face removes the problem entirely:
the mini PC service envelope sits at Y=165–390 and the display at Y=100–576, so
**both are inside the same rigid section**. A direct HDMI or DisplayPort run from
the mini PC to the panel crosses nothing that moves.

This is a significant simplification. It removes the need for an Upper Lid
display controller, removes power and Ethernet from the joint crossing, and lets
the panel be driven natively at full resolution.

Reserve approximately **25 mm of Z depth** for panel, driver board, bonding and
cover. That comes directly out of the 259.9 mm body depth, which
`docs/interference_report.md` already lists as risk 1.

### Limb articulation

Reference footage of a walking replica shows the gait is a splay-and-close in the
sagittal plane: the slabs separate into leading and trailing groups, swing apart
into a wide A-frame, the body translates through, then they close. Every visible
rotation axis is horizontal and lateral, matching the X-parallel axles in the
source geometry. No yaw or roll degree of freedom is present.

Each outer slab bends mid-limb, so there are **two rotational degrees of freedom
per limb**: a hip at the lower main axis, Y=610.8, and a knee. The knee is
modelled at half the hip height, Y=305.4. That ratio is an engineering choice,
not a measurement from the source geometry, and it is parameterised as
`ARM_KNEE_RATIO` so it can move once the gait is reconstructed properly.

The splay is not a stylistic flourish. Standing, the fore-aft footprint is only
259.9 mm on a 1,000 mm robot, an aspect ratio of 3.8:1. Splaying converts that
into roughly an 800 mm base. **The splay is the stability mechanism**, which is
why the reference robot stands slightly splayed even at rest.

### Actuator sizing follows from the landing, not the stance

A static estimate: at 20 kg with the centre of gravity offset 200–300 mm
horizontally from the loaded hip, holding torque is 39–59 N·m. The 60 N·m
continuous target covers that.

But every gait cycle ends in a controlled fall and catch. Applying a 2–3 impact
factor puts the landing case at **80–180 N·m**, which brackets and may exceed the
100 N·m peak target. The landing also sizes the shafts, bearings and brackets.

These are order-of-magnitude figures from stated assumptions, not a dynamic
analysis. They are recorded to show that the peak torque target is the number at
risk, and that it must not be frozen without proper simulation.

### As modelled

The bodywork and leg-arm slabs exist in
`cad/output/GP_TARS_V2_1000_ALUMINIUM_COMPUTE_V2.f3d` as 20 bodies across
`11_BODY_PANELS` (14) and `14_ARMS` (6):

![Fusion view of the GP-TARS V2 aluminium shell, service panels and leg-arm slabs](/images/gptars-shell-iso.png)

| Group | Bodies |
|---|---|
| Front | Lower, display, upper and lid |
| Rear | Battery, compute and GPU access, plus upper |
| Sides | Port and starboard, each split at the hip |
| Lids | Top and bottom |
| Leg-arms | Port and starboard, each as shin, thigh and upper |
| Display insert | Aperture doubler, cover lens, panel module, driver board |

Two rules drive that layout. **No panel crosses the hip axis at Y=610.8**, since
the upper and lower chassis articulate there; a 6 mm break straddles it. And
**service access is on the rear**, so the display is never removed to reach the
GPU or the mini PC.

Each arm slab is 209.317 mm wide, leaving 4 mm running clearance to the central
chassis per side. All shells are modelled at the 1.2 mm sheet gauge. The display
aperture is cut through `PANEL_FRONT_DISPLAY` at 194 × 345 mm.

### The display insert

`15_DISPLAY` models what actually occupies the aperture, not just the hole:

| Body | Size (mm) | Note |
|---|---|---|
| `DISPLAY_APERTURE_DOUBLER` | 230 × 381 × 2, holed | Restores the stiffness a 194 × 345 hole removes from 1.2 mm sheet |
| `DISPLAY_COVER_LENS` | 206 × 357 × 2 | Bonded behind the aperture, overlapping the doubler flange |
| `DISPLAY_PANEL_MODULE` | 223.8 × 359.5 × 5.5 | Bare 15.6 inch class panel outline, portrait |
| `DISPLAY_DRIVER_BOARD` | 110 × 65 × 12 | On standoffs behind the panel |

The stack consumes **22.9 mm** of depth against the 25 mm reservation, so it fits.

**Lateral clearance is the problem.** The chassis interior is 237.6 mm and the
panel module is 223.8 mm wide, leaving **6.9 mm per side**. That is enough for the
panel to pass but not for a mounting frame, edge retention or a cable exit at the
sides. Either the module hangs off the doubler alone, or the panel drops a size:
a 14 inch class module at roughly 323 × 202 mm would give about 17.8 mm per side.

The driver board was initially placed behind the panel and collided with the mini
PC service envelope by 45 × 38 × 5.5 mm. It now sits above both the PC envelope
and the GPU, at Y=490–555. Zero display conflicts remain.

Because the display and the mini PC are both in the lower chassis, the panel is
driven by a **direct HDMI run** from the PC. Nothing crosses a moving joint.

These are form and packaging bodies. They carry no fastener pattern, formed
returns, beads, hinges, bearings or joint hardware, the limbs have no feet or
contact pads, and none of them is releasable.

### Panel and safety consequences

- The bodywork is now formed 5052-H32 aluminium. A large display aperture removes
  significant stiffness from a 1.2 mm panel and requires a local doubler or a
  bonded subframe around the full opening.
- The gait involves controlled falling and landing. Do not fit ordinary cover
  glass. Use chemically strengthened thin glass or bonded polycarbonate, recessed
  behind the panel line, on compliant mounts.
- Mount the display away from the primary landing edge.
- The screen assembly needs its own service panel per the serviceability rules,
  with connector strain relief that does not cross a moving joint.
- Budget 300–800 g depending on size, against a 12–25 kg target in which the
  aluminium skin already accounts for approximately 9.4 kg.

## Screen sharing to Apple TV

### The problem, stated honestly

**There is no reliable open-source AirPlay screen-mirroring _sender_ for Linux.**
UxPlay and Shairport-Sync are AirPlay *receivers* — they make a Linux box a
target, which is the opposite of what is wanted here. Apple does not publish a
mirroring sender for Linux, and AirPlay 2 mirroring is authenticated.

Any plan that depends on the robot pushing an AirPlay mirror to an Apple TV
should be treated as unproven until demonstrated on the actual hardware. Do not
design the interface around it.

### Recommended approach: pull, do not push

Invert the direction. The robot continuously publishes its interface as a
network stream; the television pulls it on demand.

```text
hmi (web UI)
   │
   │ framebuffer or second headless render
   ▼
streaming container
   │  VA-API encode on Radeon 890M
   ├── WebRTC   → sub-second, for live operator view
   ├── RTSP     → VLC on tvOS, works today with no development
   └── HLS      → higher latency, most compatible
   ▼
Apple TV
```

Use `go2rtc` or MediaMTX in the `streaming` container; both serve WebRTC, RTSP
and HLS from one source and are well suited to an always-on publisher.

| Path | Effort | Latency | Notes |
|---|---|---|---|
| VLC on tvOS pulling RTSP | None — install and enter a URL | 1–3 s | Works today. Recommended starting point |
| Custom tvOS app | Apple Developer account, SwiftUI + WebRTC | < 1 s | Bonjour discovery, one-tap connect, polished |
| AirPlay mirroring from Linux | Unproven | — | Not recommended as a dependency |
| Chromecast instead | Low — mature Linux senders exist | 1–2 s | Only if the display target is negotiable |

"At any time" is satisfied by the stream always being available and advertised
over Bonjour/mDNS on the local network, with the television choosing when to
attach. This is more robust than a push model, because nothing on the robot has
to track or maintain a session with a device that may be off.

AirPlay **audio** is a separate and much easier case. RAOP senders for Linux do
exist, so routing TARS's speech to Apple TV speakers or AirPlay receivers is
achievable independently of video.

### Access control

The stream shows whatever the robot is doing and may include camera views. It
must not be an unauthenticated open port. Require a token or client certificate,
bind it to the robot's own network interface, and make it inoperable when the
robot is in a maintenance or fault state.

## Memory budget

| Component | RAM |
|---|---:|
| Ubuntu 24.04 headless and Docker daemon | 2.5 GB |
| `ros-control` and `safety-supervisor` | 2 GB |
| `vision` | 3 GB |
| `speech` | 3 GB |
| `llm-server` host side | 2–4 GB |
| `tars-ai` and `memory` | 3 GB |
| `hmi`, `streaming`, `observability` | 2.3 GB |
| **Steady state** | **~20 GB** |

Steady state is misleading on its own. Size for the peaks:

- `colcon build` on device: 4–8 GB with parallel jobs
- rosbag recording bursts
- page cache holding model files so a model swap does not stall on storage
- a second model resident during comparison

**Specification: 64 GB, as 2 × 32 GB DDR5-5600 SO-DIMM.** This fills both slots
and keeps dual-channel operation. 32 GB works but leaves no room to build,
record and infer at the same time. 96 or 128 GB is only justified if a model is
partially offloaded to CPU, which is a symptom of insufficient VRAM rather than a
design goal.

Set the Radeon 890M UMA allocation in firmware to the minimum (512 MB to 2 GB).
The discrete card performs inference; the integrated GPU only drives the display
pipeline and the video encoder, and should not reserve system memory it will not
use.

## Storage budget

| Consumer | Space |
|---|---:|
| Ubuntu and development tools | 30 GB |
| Docker images — CUDA bases are 6–8 GB each | 60–100 GB |
| Models: language, speech, vision, voices | 50–80 GB |
| ROS 2 workspace and colcon build artefacts | 20–30 GB |
| Swap | 16 GB |
| rosbag and stream recordings | 50–100 GB **per test session** |

Recorded data dominates and is the reason 1 TB fails in practice: it works until
walking trials begin, after which time goes into pruning logs instead of
diagnosing faults.

The AI X1 Pro-370 has **three M.2 2280 slots**. Use them by role:

| Slot | Size | Role | Requirement |
|---|---|---|---|
| 1 | 1 TB TLC | OS, Docker, models | Reliability and read speed |
| 2 | 2 TB TLC | rosbags, recordings, datasets | Write endurance; avoid QLC |
| 3 | — | Spare or expansion | Consider thermal cost before filling |

At roughly 10 GB per hour of logging, annual writes reach several terabytes, so
endurance matters more than peak sequential speed on the data drive.

## Power and thermal consequences

Two constraints from existing documents tighten as a direct result of this stack.

**Power.** `docs/compute_hardware.md` selects a 100 W USB-C PD source, now fed from the 12.8 V bus,
feeding the rear USB4 input, against an internal supply rated 134.9 W, and
already flags that sustained performance must be tested at that ceiling. This
specification adds 64 GB of DDR5, two or three NVMe drives at 5–8 W each under
load, and a display at 5–15 W. That consumes the remaining headroom and pushes
the decision towards the inverter option previously recorded as not preferred, or
towards accepting throttling. This must be measured, not assumed.

The GPU is unaffected: OCuLink carries no card power, so the graphics card and
its independent supply are a separate budget.

**Thermal.** `docs/project_specification.md` specifies airflow as intake, filter,
GPU, mini PC, exhaust. The mini PC therefore receives GPU exhaust as its intake
air. NVMe drives throttle at approximately 70 °C, and this places two or three of
them in pre-heated air inside a sealed aluminium body. Either duct the mini PC a
dedicated cold intake, or reorder the path so the PC sits upstream of the GPU.
Resolve this before the compute bay geometry is frozen.

The display adds a further heat source at the top of the body, where the
bottom-to-top airflow is already warmest.

## Open decisions

- Select the GPU. VRAM drives model choice, the vision/LLM split and the bay
  envelope; nothing downstream can be frozen first.
- Measure the compute stack against the 100 W PD limit, or approve the inverter.
- Resolve the mini PC intake air temperature before freezing the bay.
- Choose display size and type, then confirm the Upper Lid aperture against panel
  stiffness and the landing case.
- Confirm the Upper Lid controller and the power/Ethernet route across the upper
  main axle, including the service loop geometry.
- Demonstrate the chosen streaming path to a real Apple TV before committing the
  interface design to it.
- Define the stream authentication scheme and its behaviour in fault states.
