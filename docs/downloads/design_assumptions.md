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
8. Main actuators remain placeholders until 12 V-compatible BLDC/CAN actuator selection and torque-speed-thermal analysis are complete.
9. Main torque targets of 60 N·m continuous and 100 N·m peak are not selections. They require mass, acceleration, impact-factor, lever-arm, and recovery-case calculations.
10. Design mass must now include the selected battery, compute hardware, display and optional external GPU explicitly; the previous 12–25 kg target may need revision after the real mass budget is built.
11. The canonical electrical architecture is now a **12.8 V nominal LiFePO4 main bus**.
12. Preferred current battery baseline is the **WattCycle 12.8 V 100 Ah Mini LiFePO4**, approximately 1,280 Wh. Larger 12.8 V packs are considered future capacity options only if their mass and packaging are acceptable.
13. The battery is mounted as low and central as joint sweep permits to minimise centre-of-gravity height.
14. Compute hardware is the **MINISFORUM AI X1 Pro-370**, 195×195×47.5 mm and approximately 1.5 kg, mounted vertically inside a 225×225×100 mm service/airflow keep-out.
15. Current preferred performance configuration is **32 GB system RAM plus NVIDIA RTX 2000 Ada Generation 16 GB** through OCuLink. RAM remains upgradeable to 64 GB or 128 GB.
16. The RTX 2000 Ada is modular, independently powered, cooled and removable. CAD should retain a preliminary 190×90×70 mm keep-out until the exact card + OCuLink dock assembly is measured.
17. The X1 Pro production chassis accepts AC mains at its internal power supply and has no exposed 19 V DC barrel input. Onboard DC operation should use the rear USB4 PD input at up to 100 W, subject to physical verification and sustained-load testing. A pure-sine inverter feeding the factory AC inlet is the fallback if 100 W PD proves insufficient.
18. Motor commutation and safety interlocks are handled by a deterministic MCU/CAN layer, not the mini PC or LLM.
19. Bottom-to-top compute airflow is preferred. Motor-controller cooling should be separated where practical.
20. Exterior bodywork is formed 5052-H32 aluminium sheet, nominally 1.2 mm with a 1.0–1.6 mm range, folded returns, beads, and local doublers.
21. Load-bearing structure, joint bulkheads, and actuator brackets use 6061-T6 aluminium. Steel remains required for shafts, bearing elements, and selected fasteners.
22. The earlier `TARS_1m_frame_layout_v1.f3d` is a packaging concept only. It is not approved for walking loads and must not be fabricated.
23. The **TV/display is mounted in the upper body/head area** and acts as the visual face of GP-TARS.
24. The display/camera interaction zone should target approximately **850–950 mm above ground** on the standing 1,000 mm robot, subject to final screen dimensions and shell geometry.
25. The display may be tilted rearward approximately **5–10 degrees** to improve viewing by standing adults while remaining visible to children.
26. The primary camera should be immediately above, beside, or closely integrated with the display so visual attention and displayed interaction feel co-located.
27. Microphones should be integrated into the upper display/sensor module where practical. Speakers may be in the same cassette or immediately below it.
28. The display/camera/microphone assembly should be designed as a removable service cassette and must not form part of the primary structural load path.
29. The current vertical packaging intent is: **display/sensors at top; mini PC and optional RTX 2000 Ada in the middle; power distribution/controllers below compute; battery low and central**.

## Decisions required before final frame commitment

- Supply and validate `GP_TARS_V2_1000mm_scaled.brep` or approve the measured STEP as the master envelope.
- Define walking degrees of freedom and reconstruct source motion with collision sweeps.
- Establish full mass budget and component mass estimates.
- Reconcile the aluminium panel mass, battery mass, compute hardware and actuator mass with the acceptable total walking mass.
- Calculate static holding, controlled-fall, landing, recovery, and fault load cases.
- Select 12 V-compatible actuator topology only after torque-speed-thermal analysis.
- Size main shafts, bearings, carriers, and brackets from calculated radial/axial/moment loads.
- Confirm the final battery model, connector, fuse, disconnect, contactor and charging architecture.
- Select and test the 12 V-to-100 W USB-C PD power path for the AI X1 Pro; use the factory AC inlet via a pure-sine inverter only if required by measured load.
- Select the exact OCuLink adapter/dock and regulated GPU power supply for the RTX 2000 Ada.
- Select the exact display model and freeze its active area, bezel, mounting pattern, mass, power draw and viewing angle.
- Freeze camera, microphone and speaker locations after the display is selected.
- Define fall-arrest/test-rig provisions for early walking tests.
- Establish joint hard-stop angles after shell and equipment sweep studies.

## Safety assumption

No unrestrained walking test is permitted from placeholder CAD. Initial motion testing requires an overhead restraint or other engineered fall-arrest fixture, independent E-stop power removal, conservative current limits, and a clear exclusion zone.
