# Design assumptions and open decisions

## Status labels

- **Reference**: measured from source geometry.
- **Placeholder**: reserved envelope, deliberately replaceable.
- **Design target**: engineering objective requiring verification.
- **Open**: no commitment may be made yet.

## Current assumptions

1. The 1,000 mm target is the Y extent of the standing external reference envelope.
2. The exact imported STEP is normalised with scale `3.993658692`; the brief's BREP scale `3.9943785` remains unverified until the missing BREP is supplied.
3. X is lateral, Y vertical, and Z front/back.
4. Cosmetic proportions come from the scaled source; structural and purchased parts use real engineering dimensions.
5. Primary structure is 6061-T6 aluminium. Light framing may use 20×20 extrusion; primary load paths should start with 20×40 or fabricated/CNC sections.
6. Major shafts start at 20 mm steel, secondary shafts at 12 mm, both subject to bending and fatigue checks.
7. Each major pivot uses two separated sealed bearings where packaging allows. Cantilevered single-bearing joints are rejected as a baseline.
8. Main actuators remain generic 80–120 mm diameter by 50–100 mm long BLDC/CAN placeholders.
9. Main torque targets of 60 N·m continuous and 100 N·m peak are not selections. They require mass, acceleration, impact-factor, lever-arm, and recovery-case calculations.
10. Design mass class is 12–25 kg. A mass budget has not yet been established.
11. Battery placeholder is 300×150×120 mm at 24 V, mounted as low and central as joint sweep permits.
12. Mini-PC placeholder is 220×220×80 mm.
13. GPU placeholder is 300×130×60 mm, preferably vertical and accessible through a dedicated service panel.
14. Motor commutation and safety interlocks are handled by a deterministic MCU/CAN layer, not the mini PC or LLM.
15. Bottom-to-top GPU/compute airflow is reserved. Motor-controller cooling should be separated where practical.
16. Printed shell thickness starts at 3.0 mm, with 2.5–4.0 mm bounds and ribs rather than wholesale thickening.
17. The earlier `TARS_1m_frame_layout_v1.f3d` is a packaging concept only. It is not approved for walking loads and must not be fabricated.

## Decisions required before final frame commitment

- Supply and validate `GP_TARS_V2_1000mm_scaled.brep` or approve the measured STEP as the master envelope.
- Define walking degrees of freedom and reconstruct source motion with collision sweeps.
- Establish full mass budget and component mass estimates.
- Calculate static holding, controlled-fall, landing, recovery, and fault load cases.
- Select actuator topology only after torque-speed-thermal analysis.
- Size main shafts, bearings, carriers, and brackets from calculated radial/axial/moment loads.
- Define battery energy and discharge requirements.
- Confirm exact mini-PC and GPU hardware or retain replaceable trays.
- Define fall-arrest/test-rig provisions for early walking tests.
- Establish joint hard-stop angles after shell and equipment sweep studies.

## Safety assumption

No unrestrained walking test is permitted from placeholder CAD. Initial motion testing requires an overhead restraint or other engineered fall-arrest fixture, independent E-stop power removal, conservative current limits, and a clear exclusion zone.

