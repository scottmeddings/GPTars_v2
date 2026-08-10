# GP-TARS V2 1000

Parametric CAD project for an approximately 1,000 mm tall autonomous walking TARS-style robot.

The downloaded GPTARS source geometry is reference-only. Primary loads must pass through the aluminium frame, steel shafts and bearings, aluminium actuator brackets, and aluminium chassis components. Production body panels are formed aluminium rather than printed plastic.

The current architecture uses a 6061-T6 aluminium load-bearing chassis and formed 5052-H32 aluminium bodywork. Steel is retained where mechanically necessary for shafts, bearings, motor internals, and selected fasteners.

Onboard compute is a vertically mounted MINISFORUM AI X1 Pro-370 with a required external NVIDIA GPU for local LLM inference, connected through OCuLink. The GPU card, its independent power supply, and cooling hardware remain replaceable modules until exact parts are selected.

## Current status

- Stage 1 source geometry inspection: complete
- Stage 2 scaled BREP import: blocked by missing `GP_TARS_V2_1000mm_scaled.brep`
- Stage 2 datum and joint proposal: documented, not frozen
- Stage 3 frame: earlier Fusion layout is concept-only and requires revision
- Stage 4 interference report: preliminary reservations documented

See `docs/original_geometry_analysis.md` and `docs/design_assumptions.md` before modifying the CAD.
