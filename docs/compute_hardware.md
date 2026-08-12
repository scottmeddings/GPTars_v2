# Compute hardware

## Selected mini PC

Model: **MINISFORUM AI X1 Pro-370 barebone**

| Item | Value |
|---|---|
| Processor | AMD Ryzen AI 9 HX370, 12 cores / 24 threads |
| Integrated GPU | AMD Radeon 890M |
| NPU / total AI performance | Up to 80 TOPS total |
| Physical size | 195 × 195 × 47.5 mm including feet |
| Chassis height without feet | 42.5 mm |
| Mass | 1.5 kg |
| Internal mains PSU | approximately 134.9 W internal supply |
| Alternative power input | rear USB4 PD input, 65–100 W |
| Memory | **64 GB DDR5-5600, 2 × 32 GB SO-DIMM** |
| Primary storage | **4 TB Lexar NQ780 M.2 2280 PCIe 4.0 NVMe** |
| Storage expansion | Three M.2 2280 NVMe slots total |
| External GPU link | OCuLink PCIe 4.0 x4 |
| Networking | Two 2.5 GbE ports, Wi-Fi 7, Bluetooth 5.4 |

The Amazon ASIN is `B0G32PTF92`. The machine is a barebone configuration, with the RAM and NVMe configuration below forming the GP-TARS build baseline.

## Compute configuration baseline

The current GP-TARS V2 compute baseline is now locked as:

- **MINISFORUM AI X1 Pro-370**
- **AMD Ryzen AI 9 HX370**
- **64 GB DDR5-5600 using 2 × 32 GB SO-DIMMs for dual-channel operation**
- **4 TB Lexar NQ780 PCIe 4.0 NVMe, M.2 2280**
- **NVIDIA RTX 2000 Ada Generation 16 GB through OCuLink**

The 64 GB configuration provides headroom for Docker containers, ROS/robot services, speech-to-text, text-to-speech, vision services, vector/RAG databases and CPU-offloaded model components while retaining dual-channel memory bandwidth for the HX370 and Radeon 890M.

The 4 TB NVMe is preferred over a smaller PCIe 5.0 drive because the X1 Pro's primary M.2 interfaces are PCIe 4.0-class and GP-TARS benefits more from model/data capacity than unused Gen5 sequential bandwidth. The primary NVMe should host the operating system, Docker data directory, active AI model cache, application stack and high-performance databases.

The system should also be benchmarked without the discrete GPU because the Ryzen AI 9 HX370 includes Radeon 890M graphics and an XDNA 2 NPU. The RTX 2000 Ada remains the performance baseline for local LLM inference, but CAD and wiring keep it modular and removable.

## Storage allocation

Initial storage plan:

- **Primary M.2 x4 slot:** 4 TB Lexar NQ780 — OS, Docker, active AI models, databases and applications
- **Second M.2 x4 slot:** reserved for future 2–4 TB model/data expansion
- **Third/slower M.2 slot:** reserved for future telemetry, logs, recordings, cache or backup workloads

The Lexar NQ780 should be installed with appropriate thermal contact/cooling supported by the X1 Pro chassis. Sustained model loading, Docker image extraction and database workloads should be included in thermal validation.

## CAD orientation

The mini PC is reserved vertically:

- X / lateral width: 195 mm
- Y / vertical height: 195 mm
- Z / chassis depth: 47.5 mm

Service keep-out:

```text
225 × 225 × 100 mm
```

This provides initial allowance for vibration isolation, airflow, controls, rear cable bends, and vertical removal. Port-specific cut-outs require measurement from the physical machine or an official mechanical drawing.

The mini PC should be placed in the centre body below the display module and above the battery where packaging allows. It is not to occupy the upper display/face area.

## Upper display / face module

The TV/display is a **top-of-body component** and forms the primary visible face of GP-TARS.

Design intent:

- display mounted in the upper body/head area, not the centre or lower chassis
- target display/camera zone approximately 850–950 mm above ground on the 1,000 mm standing robot
- display face may be tilted rearward approximately 5–10 degrees for adult viewing while remaining visible to children
- camera located immediately above, beside, or closely integrated with the display so gaze direction and visual interaction appear natural
- microphone array located in the same upper module where practical
- speakers may be integrated into the upper module or immediately below it
- the complete screen/camera/microphone assembly should be removable as a service cassette
- existing documented display selection remains authoritative; CAD should use its actual dimensions when finalising the upper cassette

The display module must not become a primary structural load path. Walking and impact loads pass through the internal aluminium chassis.

## Component vertical layout target

```text
TOP OF ROBOT

DISPLAY / FACE
CAMERA + MICROPHONES

MINI PC
RTX 2000 ADA + OCuLink DOCK

POWER DISTRIBUTION / CONTROLLERS

12.8 V BATTERY

LOWER BODY / WALKING STRUCTURE
```

The battery remains as low and central as possible to reduce centre-of-gravity height. Compute hardware is placed near the middle of the body. The display and sensors are deliberately high for visibility and interaction.

## Interfaces to preserve

Front/service access:

- USB4
- USB-A
- 3.5 mm audio
- Copilot button
- microphones

Rear cable space:

- rear USB4 PD input
- HDMI 2.1
- DisplayPort 2.0
- two 2.5 GbE ports
- OCuLink
- USB 2.0
- AC mains inlet for bench/shore power
- Kensington slot

Side/top access:

- SD card slot
- fingerprint sensor

## Selected robot power architecture

GP-TARS V2 uses a **12.8 V nominal LiFePO4 main battery bus**.

The preferred current battery is the WattCycle **12.8 V 100 Ah Mini LiFePO4** pack, giving approximately **1,280 Wh** installed energy. The electrical design intentionally remains compatible with larger 12.8 V WattCycle batteries, provided mass, structure, cabling, fusing and packaging are appropriate for the specific build.

## Mini PC battery power

The X1 Pro chassis has an internal AC power supply; there is no exposed 19 V DC barrel input on the rear panel. The previously proposed direct 12-to-19 V DC converter path is not used unless the computer is deliberately modified internally, which is not part of the baseline design.

Preferred onboard battery path:

```text
12.8 V LiFePO4 MAIN BUS
        |
        +-- fused compute branch
        |
        +-- automotive DC/DC USB-C PD source
                |
                +-- 20 V / 5 A, up to 100 W USB-C PD
                        |
                        +-- rear USB4 PD-IN on AI X1 Pro
```

The rear USB4 port is the intended DC battery-input path and must be verified on the physical unit before final harness fabrication. The internal AC inlet remains available for workshop/shore power.

Because USB-C PD is limited to 100 W while the internal mains supply has a larger power envelope, sustained CPU/NPU workloads must be benchmarked on 100 W PD. If 100 W is insufficient, the preferred fallback is a properly rated 12 V DC to 230–240 V AC pure-sine inverter feeding the factory mains inlet rather than opening or modifying the mini PC.

## Confirmed external GPU for the LLM

The onboard discrete accelerator baseline is the **NVIDIA RTX 2000 Ada Generation 16 GB**. It connects to the AI X1 Pro through OCuLink PCIe 4.0 x4.

| Item | Confirmed value |
|---|---|
| GPU | NVIDIA RTX 2000 Ada Generation |
| Architecture | Ada Lovelace |
| VRAM | 16 GB GDDR6 with ECC |
| Maximum board power | 70 W |
| Native graphics bus | PCIe Gen 4 x8 |
| OCuLink host link | PCIe 4.0 x4 through external adapter |
| Card form factor | Low-profile, dual-slot |
| Card height | 2.7 in / 68.6 mm |
| Card length | 6.6 in / 167.6 mm |
| Cooling | Active |
| Display outputs | 4 × mini DisplayPort 1.4a |

CAD should reserve the physical card envelope plus the OCuLink adapter, connector bend, airflow and removable service clearance. A preliminary engineering keep-out of **190 × 90 × 70 mm** is acceptable until the actual card and adapter are measured.

The GPU uses its own protected regulated power branch from the **12.8 V main bus** through the selected OCuLink dock/adapter. OCuLink carries PCIe data and does not itself power the card.

## 12 V accessory rail

The display, audio amplifier, fans, lighting and other nominal 12 V accessories use a **regulated 12 V buck-boost rail** from the 12.8 V LiFePO4 main bus.

## Power-domain separation

```text
12.8 V LiFePO4 MAIN BUS
      |
      +-- MOTION CONTACTOR / E-STOP --> motion power conversion / actuators
      |
      +-- COMPUTE FUSE --> 12 V to 100 W USB-C PD --> Mini PC rear USB4 PD-IN
      |
      +-- GPU FUSE --> regulated GPU/dock supply --> RTX 2000 Ada
      |
      +-- AUX FUSE --> regulated 12 V buck-boost --> display/audio/fans/lights
      |
      +-- SAFETY SUPPLY --> safety MCU / contactor supervision
```

The physical emergency stop must remove actuator power immediately while leaving the safety controller and, where practical, the compute system powered.

## Thermal design

- Do not block the PC's inlet or exhaust faces.
- Maintain the 225 × 225 × 100 mm mini-PC keep-out until airflow direction is physically verified.
- Preserve clear intake and exhaust paths around the RTX 2000 Ada active cooler.
- Provide thermal management for the 4 TB NVMe under sustained Docker/model-loading workloads.
- Keep display heat isolated from the camera and microphone electronics where practical.
- Place temperature probes in PC inlet/exhaust air and near the GPU exhaust.
- Isolate compute exhaust from motor controllers and the battery.
- Mount compute devices with removable vibration isolation without making them part of the structural load path.
