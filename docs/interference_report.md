# Preliminary interference and reservation report

Status: preliminary envelope review only. A production interference report requires the missing scaled BREP, reconstructed joints, joint limits, and component sweep bodies.

> **Superseded by the 480 mm rebuild, 2026-08-10.** Everything below the Narrow-body section was written against the 958.7 mm scaled-source width and a horizontally mounted GPU. The clearances it reports no longer describe the model. It is retained as the record of how the wide layout failed.

## Narrow-body review, 480 mm

The body is now 480 mm wide as four 120 mm slabs, with a 240 mm central chassis, depth unchanged at 259.867 mm. Verified extent of the robot bodies, excluding the source reference envelope: **480.0 × 1000.0 × 259.9 mm**.

Equipment was repacked because the previous reservations were wider than the new chassis:

| Reservation | Was | Now | Reason |
|---|---|---|---|
| GPU | 300 × 130 × 60, flat | 130 × 300 × 60, vertical | The brief always specified a vertical card; the model had it flat, and 300 mm lateral no longer fits |
| Mini PC | 195 × 195 × 47.5, facing forward | 47.5 × 195 × 195, edge-on | Turning the board plane parallel to the side panels drops its lateral demand to 47.5 mm |
| Battery | 300 × 150 × 120 | 200 × 150 × 180 | Width traded for depth at approximately constant volume |

### Confirmed conflicts

An axis-aligned check over all 48 bodies returns 30 overlaps. Most are joint modules correctly occupying both parts they connect. Two are genuine defects:

| A | B | Overlap XYZ (mm) | Volume (mm³) | Disposition |
|---|---|---|---:|---|
| `FRAME_VERTICAL_1_0` | Mini PC service keep-out | 20 × 225 × 40 | 180,000 | **Real.** Move the rail outboard, split it around the PC, or reduce the service envelope |
| `FRAME_VERTICAL_1_1` | Mini PC service keep-out | 20 × 225 × 40 | 180,000 | **Real.** Same |
| `ACTUATOR_HIP_*` | Arm thigh and upper shells | 66 × 59 × 120 | 467,280 | Expected. A hip module must occupy both the chassis and the limb it drives |
| `ACTUATOR_KNEE_*` | Arm shin and thigh shells | 70 × 34 × 70 | 166,600 | Expected. Same reasoning at the knee |

The mini PC conflict is the packaging consequence of narrowing. At a 240 mm chassis the 225 mm service envelope cannot pass between 20 mm frame rails, so the rails, the envelope, or the service method must change before the frame is committed.

### Mass consequence

Skin area scales with perimeter. Narrowing takes the section perimeter from 2,437 mm to 1,480 mm, so the 1.2 mm aluminium skin falls from approximately 9.4 kg to **roughly 5.7 kg**. That is the largest single mass saving identified so far and materially improves the 12–25 kg target.

### Still not checked

Joint sweeps, cable bends, GPU dock and supply, connector protrusion, airflow, panel fasteners, service extraction paths, and clearance against a verified external BREP.

---

Latest concept model checked: `cad/output/GP_TARS_V2_1000_ALUMINIUM_COMPUTE_V2.f3d`.

## Reserved equipment envelopes

| Reservation | Envelope (mm) | Preferred region | Current result |
|---|---:|---|---|
| Battery | 300 × 150 × 120 | Lowest central bay | Plausible within 532 mm scaled chassis width; joint sweep not checked |
| MINISFORUM AI X1 Pro body | 195 × 195 × 47.5 | Vertical above battery | Selected hardware; exact body now modelled |
| Mini-PC service keep-out | 225 × 225 × 100 | Around selected PC | Includes initial airflow, cable, isolator and removal allowance |
| Required external NVIDIA GPU | 300 × 130 × 60 provisional card-only envelope | Vertical, central, dedicated access | LLM accelerator required; exact card, PSU, OCuLink adapter, cable bend and airflow not checked |
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
9. **Aluminium skin mass:** a complete 1.2 mm rectangular-envelope skin would be approximately 9.4 kg before formed returns and hardware. Actual panel geometry and openings require a controlled mass budget.

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

## Compute V2 static-envelope results

The selected MINISFORUM AI X1 Pro is represented by an exact 195 × 195 × 47.5 mm body and a provisional 225 × 225 × 100 mm service keep-out. It is mounted vertically in the lower central bay, above the battery reservation.

- No PC-body or PC-service-envelope overlap was found with a structural frame member.
- The service envelope finishes at Y=390 mm and the GPU keep-out starts at Y=420 mm, leaving 30 mm between reservations.
- The battery keep-out finishes at Y=150 mm and the PC service envelope starts at Y=165 mm, leaving 15 mm between reservations.
- The exact PC body has 45 mm to the GPU reservation and 30 mm to the battery reservation.
- Intersections with `EXTERNAL_REFERENCE_ENVELOPE` and `CENTRAL_CHASSIS_REFERENCE` are intentional because those bodies are transparent reference volumes, not physical parts.

These are static axis-aligned clearances. Connector protrusion, USB4/OCuLink cable bend radii, ventilation flow, tray fasteners, vibration isolators, and removal motion still require detailed modelling.

## Required Stage 4 checks

- Import the verified 1,000 mm external BREP as a non-structural reference.
- Create joint sweep bodies for every proposed moving module.
- Check frame members against static shell clearance and full sweep.
- Check Ø120×100 main-actuator placeholders against shell, bearings, and service-tool access.
- Check battery tray against lower-link sweep plus 10–25 mm ground-clearance requirements.
- Check GPU, PC, and wiring reservations against frame and actuator removal paths.
- Add at least 10 mm general wiring space, larger at high-current bends and moving joints.
- Produce a Fusion interference table with component pairs, overlap volume, and disposition.
