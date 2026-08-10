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
| Internal DC input requirement | 19 V / 7.1 A, approximately 134.9 W maximum |
| Alternative input | Rear USB4 PD input, 65–100 W |
| Memory | Two DDR5-5600 SO-DIMM slots, up to 128 GB |
| Storage | Three M.2 2280 NVMe slots |
| External GPU link | OCuLink PCIe 4.0 x4 |
| Networking | Two 2.5 GbE ports, Wi-Fi 7, Bluetooth 5.4 |

The Amazon ASIN is `B0G32PTF92`. The listing is the barebone configuration, so RAM, SSD, and operating system installation must be confirmed separately.

## CAD orientation

The unit is reserved vertically:

- X / lateral width: 195 mm
- Y / vertical height: 195 mm
- Z / chassis depth: 47.5 mm
- body location in Concept V1: centred on X and Z, Y=180–375 mm

Service keep-out:

```text
225 × 225 × 100 mm
```

This provides initial allowance for vibration isolation, side airflow, front controls, rear cable bends, and vertical removal. Port-specific cut-outs require measurement from the physical machine or an official mechanical drawing.

## Interfaces to preserve

Front/service access:

- USB4
- USB-A
- 3.5 mm audio
- Copilot button
- microphones

Rear cable space:

- USB4 PD input
- HDMI 2.1
- DisplayPort 2.0
- two 2.5 GbE ports
- OCuLink
- USB 2.0
- AC input if used during bench testing
- Kensington slot

Side/top access:

- SD card slot
- fingerprint sensor

## Selected robot power architecture

GP-TARS V2 uses a **12.8 V nominal LiFePO4 main battery bus**.

The preferred current battery is the WattCycle **12.8 V 100 Ah Mini LiFePO4** pack, giving approximately **1,280 Wh** installed energy. The electrical design intentionally remains compatible with larger 12.8 V WattCycle batteries, including the 314 Ah Mini, provided mass, structure, cabling, fusing and packaging are appropriate for the specific build.

The robot is therefore designed around a single low-voltage DC bus rather than a 24/25.6 V series battery system.

## Mini PC power conversion

The MINISFORUM AI X1 Pro requires a regulated 19 V supply for full-power operation. The selected conversion path is:

```text
12.8 V LiFePO4 MAIN BUS
        |
        +-- 20 A branch fuse
        |
        +-- local isolation/service switch
        |
        +-- SZWENGAO WG-12S1920 DC-DC boost converter
                |
                +-- regulated 19 V output
                |
                +-- MINISFORUM AI X1 Pro DC input
```

Selected converter baseline:

| Item | Value |
|---|---|
| Converter | SZWENGAO WG-12S1920 |
| Function | DC-DC boost converter |
| Input | nominal 12 V system; verify production unit supports the complete LiFePO4 operating range before final installation |
| Output | regulated 19 V |
| Maximum output current | 20 A |
| Maximum advertised power | 380 W |
| Topology | non-isolated |

The X1 Pro itself is expected to require no more than approximately **19 V × 7.1 A = 134.9 W**. The 380 W converter therefore provides substantial thermal and transient headroom and should operate well below its maximum rating.

At approximately 135 W output, expected battery-side current is roughly **11–13 A** depending on battery voltage and conversion efficiency. The current baseline is therefore a **20 A fuse on the 12 V input branch**. Final fuse, cable and connector sizing must be checked against measured startup and sustained current on the completed robot.

The converter must be mounted to a thermally conductive internal structure with free airflow around its finned housing. Do not bury it between insulation, battery foam or wiring bundles.

Because the converter is non-isolated, input and output grounds share the robot common ground. Grounding for the mini PC, RTX 2000 Ada, display and OCuLink dock must be designed as one intentional low-impedance system to minimise ground-loop and EMI problems.

USB-C PD remains available as a backup/bench power method, but the direct regulated **19 V DC path is preferred onboard** because it preserves the X1 Pro's full approximately 135 W input capability rather than imposing the 100 W USB-C PD ceiling.

## Confirmed external GPU for the LLM

The onboard accelerator is confirmed as the **NVIDIA RTX 2000 Ada Generation 16 GB**. It connects to the AI X1 Pro through OCuLink PCIe 4.0 x4.

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

The previous 300 × 130 × 60 mm generic GPU reservation is superseded. CAD should reserve the physical card envelope plus the OCuLink adapter, connector bend, airflow and removable service clearance. A preliminary engineering keep-out of **190 × 90 × 70 mm** is acceptable until the actual card and adapter are measured.

At 70 W maximum board power the RTX 2000 Ada materially improves the power and thermal budget compared with the former 150 W placeholder while meeting the 16 GB VRAM target.

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

The mini PC and GPU are not powered from this general-purpose 12 V accessory rail.

## Power-domain separation

A shared 12.8 V battery does not mean a shared switched domain. The power distribution unit separates motion and compute after the main battery disconnect:

```text
12.8 V LiFePO4 MAIN BUS
      |
      +-- MOTION CONTACTOR / E-STOP --> 12 V-class motion system
      |
      +-- 20 A COMPUTE FUSE --> 12-to-19 V WG-12S1920 --> Mini PC
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
- Mount the WG-12S1920 to a thermally conductive internal plate with airflow.
- Place temperature probes in PC inlet/exhaust air and near the GPU exhaust and DC-DC converter.
- Isolate compute exhaust from motor controllers and the battery.
- Mount compute devices with removable vibration isolation without making them part of the structural load path.
