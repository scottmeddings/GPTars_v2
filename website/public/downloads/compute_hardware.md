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
| Alternative input | Rear USB4 PD input, up to 100 W |
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

## Robot power decision

The computer has an internal AC power supply, while GP-TARS uses a nominal 24 V DC battery bus. Two candidate approaches remain:

1. Preferred prototype path: 24 V battery to a regulated 100 W USB-C PD source, feeding the rear USB4 PD input at 20 V / 5 A. Sustained compute performance must be tested under the 100 W input limit.
2. Alternative: 24 V battery to a suitably rated inverter feeding the internal AC supply. This adds conversion loss, mass, heat, and EMI and is not preferred.

Do not connect the 24 V battery directly to any mini-PC input. The selected converter must provide current limiting, input/output protection, appropriate grounding, and sufficient transient margin.

## Required external GPU for the LLM

An external NVIDIA GPU is a required part of the onboard LLM system. It will connect to the AI X1 Pro through OCuLink PCIe 4.0 x4. The current 300 × 130 × 60 mm CAD reservation represents only a provisional graphics-card envelope; it does not yet include a power supply, OCuLink adapter/dock, cable bend volume, fans, ducts, or finger clearance.

The GPU must have an independent protected power supply because OCuLink carries PCIe data and does not power the card. Final electrical design requires the exact GPU's sustained and transient power requirements. Do not size the robot battery, DC converter, wiring, fuse, contactor, connectors, or cooling system from the provisional envelope.

The exact GPU choice should be driven first by usable VRAM for the intended model and quantisation, then by sustained power, physical size, and cooling. The GPU and its supply must be separately removable from the mini PC tray.

## Thermal design

- Do not block the PC's inlet or exhaust faces.
- Maintain the 225 × 225 × 100 mm keep-out until airflow direction is physically verified.
- Place temperature probes in PC inlet and exhaust air.
- Isolate PC exhaust from motor controllers and the battery.
- Mount with removable vibration isolators without making the unit part of the structural load path.
