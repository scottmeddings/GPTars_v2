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
| Memory | Two DDR5-5600 SO-DIMM slots, up to 128 GB |
| Storage | Three M.2 2280 NVMe slots |
| External GPU link | OCuLink PCIe 4.0 x4 |
| Networking | Two 2.5 GbE ports, Wi-Fi 7, Bluetooth 5.4 |

The Amazon ASIN is `B0G32PTF92`. The listing is the barebone configuration, so RAM, SSD, and operating system installation must be confirmed separately.

## Compute configuration baseline

Current preferred configuration for the robot is:

- MINISFORUM AI X1 Pro-370
- 32 GB system RAM if the external GPU is installed initially
- NVIDIA RTX 2000 Ada Generation 16 GB through OCuLink
- retain RAM upgrade path to 64 GB or 128 GB later

The system should also be benchmarked without the discrete GPU because the Ryzen AI 9 HX370 includes Radeon 890M graphics and an XDNA 2 NPU. The RTX 2000 Ada remains the performance baseline for local LLM inference, but CAD and wiring should keep it modular and removable.

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

The TV/display is now a **top-of-body component** and forms the primary visible face of GP-TARS.

Design intent:

- display mounted in the upper body/head area, not the centre or lower chassis
- target display/camera zone approximately 850–950 mm above ground on the 1,000 mm standing robot
- display face may be tilted rearward approximately 5–10 degrees for adult viewing while remaining visible to children
- camera located immediately above, beside, or closely integrated with the display so gaze direction and visual interaction appear natural
- microphone array located in the same upper module where practical
- speakers may be integrated into the upper module or immediately below it
- the complete screen/camera/microphone assembly should be removable as a service cassette
- exact screen cut-out and mounting geometry remain open until the final display model is selected

The display module must not become a primary structural load path. Walking and impact loads pass through the internal aluminium chassis.

## Component vertical layout target

Current packaging order from top to bottom:

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

The robot is therefore designed around a single low-voltage DC bus rather than a 24/25.6 V series battery system.

## Mini PC battery power

The X1 Pro chassis has an internal AC power supply; there is no exposed 19 V DC barrel input on the rear panel. Therefore the previously proposed direct 12-to-19 V DC converter path is **not used** unless the computer is deliberately modified internally, which is not part of the baseline design.

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

The earlier SZWENGAO WG-12S1920 12-to-19 V converter is no longer specified for the mini PC because the production chassis does not expose a 19 V DC input.

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

At 70 W maximum board power the RTX 2000 Ada fits the current mobile power and thermal strategy while meeting the 16 GB dedicated VRAM target.

The GPU uses its own protected regulated power branch from the **12.8 V main bus** through the selected OCuLink dock/adapter. OCuLink carries PCIe data and does not itself power the card. Final converter, fuse and wiring sizing must use measured complete GPU + adapter consumption rather than the 70 W board figure alone.

The GPU and its supply must remain separately removable from the mini PC tray.

## 12 V accessory rail

The display, audio amplifier, fans, lighting and other nominal 12 V accessories use a **regulated 12 V buck-boost rail** from the 12.8 V LiFePO4 main bus.

A regulator is still required even though the battery is called a 12 V battery because LiFePO4 terminal voltage varies with state of charge and charging conditions. Sensitive 12 V electronics should not be connected directly to the raw battery unless explicitly rated for the complete battery voltage range.

Initial accessory converter target:

- regulated 12 V output
- 20–30 A rating to provide useful accessory and transient margin
- input range covering the complete 4S LiFePO4 operating voltage
- fused input and fused downstream branches
- over-current, over-temperature and short-circuit protection

## Power-domain separation

A shared 12.8 V battery does not mean a shared switched domain. The power distribution unit separates motion and compute after the main battery disconnect:

```text
12.8 V LiFePO4 MAIN BUS
      |
      +-- MOTION CONTACTOR / E-STOP --> 12 V-class motion system
      |
      +-- COMPUTE FUSE --> 12 V to 100 W USB-C PD --> Mini PC rear USB4 PD-IN
      |
      +-- GPU FUSE --> regulated GPU/dock supply --> RTX 2000 Ada
      |
      +-- AUX FUSE --> regulated 12 V buck-boost --> display/audio/fans/lights
      |
      +-- SAFETY SUPPLY --> safety MCU / contactor supervision
```

The physical emergency stop must remove actuator power immediately while leaving the safety controller and, where practical, the compute system powered so that GP-TARS can log the event, retain perception and report its stopped state.

## 12 V design implications

Moving from a 24/25.6 V bus to 12.8 V approximately doubles current for a given power level. This must be reflected in:

- actuator selection
- motor controller ratings
- fuse sizes
- contactor ratings
- cable cross-section
- connectors
- busbar sizing
- voltage-drop calculations
- thermal management

For example, a 600 W total load is approximately 47 A at 12.8 V before conversion losses. The architecture therefore targets battery packs with substantial BMS current capability and short, low-resistance high-current wiring.

## Thermal design

- Do not block the PC's inlet or exhaust faces.
- Maintain the 225 × 225 × 100 mm mini-PC keep-out until airflow direction is physically verified.
- Preserve clear intake and exhaust paths around the RTX 2000 Ada active cooler.
- Keep display heat isolated from the camera and microphone electronics where practical.
- Place temperature probes in PC inlet/exhaust air and near the GPU exhaust.
- Isolate compute exhaust from motor controllers and the battery.
- Mount compute devices with removable vibration isolation without making them part of the structural load path.
