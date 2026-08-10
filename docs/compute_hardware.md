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
| Internal power supply | 19 V / 7.1 A, 134.9 W internal output rating |
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
- AC input if used
- Kensington slot

Side/top access:

- SD card slot
- fingerprint sensor

## Selected robot power architecture

GP-TARS uses two matched **WattCycle 12.8 V 50 Ah LiFePO4 batteries in series** as the main energy source. The resulting nominal robot bus is **25.6 V, 50 Ah, 1,280 Wh**.

The mini PC does **not** run from a 12 V rail. The selected prototype path is:

```text
25.6 V main battery bus
        |
        +-- dedicated fused DC/DC branch
                |
                +-- regulated USB-C PD, 20 V / 5 A, up to 100 W
                        |
                        +-- rear USB4 PD input on AI X1 Pro
```

The X1 Pro accepts 65–100 W PD input on its rear USB4 port. Sustained compute performance must be validated under the 100 W PD ceiling. If testing shows the PC needs more than 100 W for the intended workload, the fallback is a dedicated regulated 19 V DC supply sized to the machine rather than an AC inverter where practical.

Do not connect the 25.6 V battery bus directly to any mini-PC input. The converter must support the full charged-to-discharged voltage range of the two-series LiFePO4 bank and provide current limiting, input/output protection, appropriate grounding, and transient margin.

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

The GPU uses its own protected regulated power branch from the 25.6 V main bus through the selected OCuLink dock/adapter. OCuLink carries PCIe data and does not itself power the card. Final converter, fuse and wiring sizing must use measured complete GPU + adapter consumption rather than the 70 W board figure alone.

The GPU and its supply must remain separately removable from the mini PC tray.

## 12 V accessory rail

The display, audio amplifier, fans and other 12 V accessories are powered from a dedicated **25.6 V to regulated 12 V buck converter**.

Initial converter target:

- regulated 12 V output
- 20–30 A rating to provide useful accessory and transient margin
- input range covering the complete two-series LiFePO4 operating voltage
- fused input and fused downstream branches
- over-current, over-temperature and short-circuit protection

The mini PC and GPU are not powered from this general-purpose 12 V accessory rail.

## Power-domain separation

A shared battery does not mean a shared switched domain. The power distribution unit separates motion and compute after the main battery disconnect:

```text
25.6 V MAIN BUS
      |
      +-- MOTION CONTACTOR / E-STOP --> 24 V-class actuators
      |
      +-- COMPUTE FUSE --> 20 V USB-C PD --> Mini PC
      |
      +-- GPU FUSE --> regulated GPU supply --> RTX 2000 Ada / dock
      |
      +-- AUX FUSE --> 12 V buck --> display / audio / fans
```

The physical emergency stop must remove actuator power immediately while leaving the safety controller and, where practical, the compute system powered so that GP-TARS can log the event, retain perception and report its stopped state.

## Thermal design

- Do not block the PC's inlet or exhaust faces.
- Maintain the 225 × 225 × 100 mm mini-PC keep-out until airflow direction is physically verified.
- Preserve clear intake and exhaust paths around the RTX 2000 Ada active cooler.
- Place temperature probes in PC inlet/exhaust air and near the GPU exhaust.
- Isolate compute exhaust from motor controllers and the battery.
- Mount both compute devices with removable vibration isolation without making either part of the structural load path.
