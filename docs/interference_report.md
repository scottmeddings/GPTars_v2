# Preliminary interference and reservation report

Status: preliminary envelope review only. A production interference report requires the missing scaled BREP, reconstructed joints, joint limits, and component sweep bodies.

Concept model checked: `cad/output/GP_TARS_V2_1000_CONCEPT_V0.f3d`.

## Reserved equipment envelopes

| Reservation | Envelope (mm) | Preferred region | Current result |
|---|---:|---|---|
| Battery | 300 × 150 × 120 | Lowest central bay | Plausible within 532 mm scaled chassis width; joint sweep not checked |
| Mini PC | 220 × 220 × 80 | Above battery, service-side access | Plausible; mounting orientation remains open |
| GPU | 300 × 130 × 60 | Vertical, central, dedicated access | Plausible by height/width; cable bend and airflow not checked |
| Main actuator | Ø120 × 100 maximum placeholder | At proposed main joint modules | May conflict with shallow 259.9 mm body depth after brackets/bearings |
| Secondary actuator | Ø70 × 70 placeholder | Linkage zones | Not yet placed |
| Main battery disconnect / fuse / contactor | TBD | Low service-access side | Reserved conceptually only |

## Early risks

1. **Actuator-depth risk:** two 100 mm-long actuator modules plus dual-bearing support, brackets, wiring bends, and shell clearance consume much of the approximately 259.9 mm depth.
2. **Upper-joint/GPU conflict:** the upper reference axes occupy approximately Y=786–890 mm; the vertical GPU must terminate below or route around this mechanism.
3. **Lower-joint/battery conflict:** the lower main axis is near Y=611 mm, leaving useful low volume, but rotating links may sweep into a tall battery compartment.
4. **Frame/shell clearance:** the concept extrusion frame was created from a simple chassis box, not the actual scaled shell surfaces. Clearance is unverified.
5. **Wiring bend radius:** CAN/power cables crossing rotating X-axis joints require loops, guides, or rotary routing. No sweep reservation exists yet.
6. **Cooling path:** a vertical GPU helps bottom-to-top airflow, but structural crossmembers must not block intake/exhaust areas.
7. **Service extraction:** GPU and PC trays must slide out without crossing main shaft or actuator removal paths.
8. **COG uncertainty:** no trustworthy component masses are assigned; stability conclusions cannot yet be drawn.

## Concept V0 static-envelope results

The check included 29 frame and keep-out solids. All checked bodies are contained within the rectangular 958.718 × 1000 × 259.867 mm external reference envelope. This is not equivalent to clearance from the detailed TARS shell, which remains unavailable as the named scaled BREP.

No battery/compute/GPU keep-out bodies overlap one another. Four frame-to-main-actuator conflicts were found:

| Frame member | Actuator keep-out | Overlap XYZ (mm) | Volume (mm³) | Disposition |
|---|---|---:|---:|---|
| `FRAME_VERTICAL_0_1` | Lower starboard main | 20.020 × 120.020 × 5.024 | 12,071.7 | Redesign rail/carrier interface |
| `FRAME_VERTICAL_1_1` | Lower port main | 20.020 × 120.020 × 5.024 | 12,071.7 | Redesign rail/carrier interface |
| `FRAME_VERTICAL_0_0` | Upper starboard main | 5.979 × 120.020 × 14.997 | 10,761.8 | Move/split rail or integrate bearing carrier |
| `FRAME_VERTICAL_1_0` | Upper port main | 5.979 × 120.020 × 14.997 | 10,761.8 | Move/split rail or integrate bearing carrier |

These conflicts confirm that uninterrupted vertical extrusion rails are not a final solution at the main joints. The preferred next study is a fabricated/CNC transverse joint bulkhead that carries the dual bearings and actuator bracket, with 20×40 rails terminating into that bulkhead.

## Required Stage 4 checks

- Import the verified 1,000 mm external BREP as a non-structural reference.
- Create joint sweep bodies for every proposed moving module.
- Check frame members against static shell clearance and full sweep.
- Check Ø120×100 main-actuator placeholders against shell, bearings, and service-tool access.
- Check battery tray against lower-link sweep plus 10–25 mm ground-clearance requirements.
- Check GPU, PC, and wiring reservations against frame and actuator removal paths.
- Add at least 10 mm general wiring space, larger at high-current bends and moving joints.
- Produce a Fusion interference table with component pairs, overlap volume, and disposition.
