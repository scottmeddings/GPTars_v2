# GP-TARS V2 1000

Parametric CAD project for an approximately 1,000 mm tall autonomous walking TARS-style robot.

The downloaded GPTARS source geometry is reference-only. Primary loads must pass through the aluminium frame, steel shafts and bearings, aluminium actuator brackets, and aluminium chassis components. Production body panels are formed aluminium rather than printed plastic.

The current architecture uses a 6061-T6 aluminium load-bearing chassis and formed 5052-H32 aluminium bodywork. Steel is retained where mechanically necessary for shafts, bearings, motor internals, and selected fasteners.

Onboard compute is a vertically mounted **MINISFORUM AI X1 Pro-370**. The current preferred performance configuration is **32 GB system RAM plus an NVIDIA RTX 2000 Ada Generation 16 GB** connected through OCuLink. The discrete GPU remains modular so the robot can also be benchmarked on the Ryzen AI 9 HX370 / Radeon 890M / NPU alone.

The canonical robot power architecture is now **12.8 V nominal LiFePO4**, with the WattCycle 12.8 V 100 Ah Mini as the current battery baseline. The battery stays low and central. The mini PC is powered from a protected 12 V-to-USB-C-PD path through the rear USB4 PD input, subject to physical verification and sustained-load testing.

The **display/TV is mounted at the top of GP-TARS** and acts as the robot's visual face. Camera and microphone hardware should be co-located with the display in a removable upper service cassette. On the 1,000 mm robot the current target interaction zone is approximately 850–950 mm above ground, with a possible 5–10 degree rearward screen tilt.

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

## Current status

- Stage 1 source geometry inspection: complete
- Stage 2 scaled BREP import: blocked by missing `GP_TARS_V2_1000mm_scaled.brep`
- Stage 2 datum and joint proposal: documented, not frozen
- Stage 3 frame: earlier Fusion layout is concept-only and requires revision
- Stage 4 interference report: preliminary reservations documented
- 12.8 V power architecture: selected as design baseline
- upper display/face location: selected as design baseline; exact screen model still open
- RTX 2000 Ada 16 GB: selected as external GPU baseline

See `docs/original_geometry_analysis.md`, `docs/design_assumptions.md`, and `docs/compute_hardware.md` before modifying the CAD.
