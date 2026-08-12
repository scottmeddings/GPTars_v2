# Hybrid mechanical architecture

## Decision

GP-TARS V2 will use aluminium for the load-bearing chassis, actuator carriers and equipment trays, with steel at highly loaded shafts and bearing elements. Removable formed 5052-H32 aluminium panels will form the recognisable external TARS body.

This supersedes the printed-polymer bodywork called for in the original brief; `docs/project_specification.md` carries the same revision note.

The external shell is cosmetic and must never become part of the walking load path. Safety-critical material exceptions include:

- steel main and secondary shafts;
- steel bearing races and rolling elements;
- motor, gearbox, encoder, wiring, insulation, seals, tyres/contact pads, and electronic materials;
- stainless or high-strength steel fasteners where joint preload, wear, or repeated service requires them.

Using aluminium shafts, bearing races, or highly loaded aluminium fasteners is rejected as the baseline because of wear, galling, fatigue, and stiffness limits.

## Material schedule

| System | Material | Initial thickness/profile | Manufacturing intent |
|---|---|---|---|
| Primary frame | 6061-T6 aluminium | 20×40 at primary paths | Extrusion or rectangular tube terminating at joint bulkheads |
| Light crossmembers | 6061-T6 aluminium | 20×20 | Equipment support and anti-racking members |
| Main joint bulkheads | 6061-T6 plate | 8 mm starting point | CNC-machined; thickness requires FEA and bearing-load checks |
| Actuator brackets | 6061-T6 plate | 8 mm starting point | CNC/fabricated; locally gusseted |
| Exterior panels | 5052-H32 aluminium sheet | 1.2 mm nominal, 1.0–1.6 mm range | Formed and folded removable cosmetic shell with replaceable mounting plates |
| Battery tray | 5052-H32 sheet | 3 mm | Folded metal tray with bolted retainers and strap |
| Compute/GPU trays | 5052-H32 sheet | 2 mm | Folded removable trays with vibration isolators |
| Access-panel doublers | 5052-H32 or 6061-T6 | 2 mm | Riveted/bolted behind frequently serviced edges |

5052-H32 remains suitable for folded internal trays and is now also the exterior panel material; it forms well and resists corrosion, but it is not heat-treatable and must not be substituted for 6061-T6 anywhere in the load path. 6061-T6 is preferred for machined plates, carriers and stiff structural members. Final panel gauge and forming process will be confirmed after stiffness, dent-resistance and fastener-pull-through testing on representative coupons.

## Panel design rules

- Do not scale the source shell thickness.
- Divide the shell into independently removable service panels.
- Use folded returns, swaged beads and local doublers to control flex without turning the shell into a structural member.
- Use replaceable mounting plates or isolated inserts at hinges, latches, handles and concentrated fasteners.
- Isolate dissimilar metals from aluminium to limit galvanic corrosion, and isolate panel fixings to limit fretting against the chassis.
- Use captive nuts, rivnuts, nut plates or replaceable interfaces attached to the structural chassis.
- Deburr and radius every formed edge; a 1.2 mm sheet edge is a laceration hazard on a machine people stand next to.
- Make compute, GPU, battery, motor controller, and actuator panels independently removable.
- Deburr and radius all wiring penetrations; add grommets or edge protection.

## Mass warning

This is the most serious consequence of the aluminium bodywork decision. A complete 1.2 mm skin over the rectangular envelope is approximately **9.4 kg** before formed returns, doublers and hardware, against a **12–25 kg** total design target. The shell alone could consume most of the lower bound.

The actual panel set must therefore:

- avoid duplicate hidden skins;
- use structural openings and removable subpanels intelligently;
- drop to the 1.0 mm end of the gauge range wherever stiffness testing allows;
- add local doublers only at exposed and frequently handled areas rather than raising the gauge globally;
- maintain a formal mass budget before panel release.

The complete robot will exceed the 12–25 kg target unless actuators, battery, frame, compute and bodywork are tightly mass-controlled. No panel geometry should be released until the mass budget exists.

## Joining and finish

- Prefer bolted, riveted, or replaceable jointing around service areas.
- The subframe is **TIG welded** from 6061-T6: 20 × 40 × 2.5 wall rails and 20 × 20 × 2.0 wall cross and depth members. See the welded-strength rule below.
- Use structural adhesive only as a secondary load path unless specifically qualified.
- Use anodising, powder coat, or conversion coating on the chassis and the exterior panels, selecting a finish system compatible with both alloys.

## Welding the subframe

The frame is TIG welded rather than bolted from T-slot profile. Three consequences follow, and the first is the one that governs the design.

### Design to the welded allowable, not the T6 figure

Welding anneals 6061-T6 locally. Yield in the heat-affected zone falls from about **276 MPa to roughly 145 MPa**, a **47 per cent** reduction, and the affected band reaches around 25 mm either side of a weld. On 20 mm members that means most of a joint region is softened.

| Section | Area | Parent yield load | As-welded |
|---|---:|---:|---:|
| 20 × 40 × 2.5 rail | 275 mm² | 75.9 kN | **39.9 kN** |
| 20 × 20 × 2.0 member | 144 mm² | 39.7 kN | **20.9 kN** |

Full T6 recovery needs solution treatment near 530 °C, quench and artificial ageing. That is impractical for a one-metre welded frame and would distort it. Natural ageing recovers part of the loss over several weeks, to roughly T4, but the design must not depend on it.

**No stress analysis has been performed on this frame.** Wall thicknesses were chosen to match commercial extrusion mass, not from load cases. Welding makes that gap more consequential, because the joints are now the weakest regions rather than the strongest.

### Alloy note

6061 is entirely weldable and is the usual choice for welded tube frames, but it is not the strongest choice *as welded*. The 5xxx series is work-hardened rather than heat-treated, so it has no comparable softening problem: 5083-H111 retains essentially its full strength through a weld, which lands it close to welded 6061 despite a lower parent figure. If sourcing allows, it is worth comparing before committing.

### Practical requirements

- **Machine the bearing bores after welding.** The hip bulkheads carry the joint bores, and welding rails to them puts a heat-affected zone directly at the bore. Boring afterwards is the only way to hold alignment.
- **Build in a jig.** Twenty-eight members and thin walls distort readily; a fixture and a planned weld sequence are needed, not optional.
- **Filler:** 4043 is more forgiving and less crack-prone; 5356 gives higher joint strength. Choose deliberately.
- **2.0 mm wall is thin for TIG.** It welds, but burn-through at corners is a real risk and argues for a skilled hand or a thicker member at the most loaded joints.

Welding does remove the corner brackets and T-nuts a bolted frame would need, which is a small mass saving not previously counted.

## Decals and markings

Printed vinyl decals carry the identity and, more importantly, the safety markings. Artwork is held at `website/public/images/gptars-decal-sheet.svg`, drawn 1:1 in millimetres on an A2 sheet.

![GP-TARS V2 decal sheet](/images/gptars-decal-sheet.svg)

Placement on the robot, front and rear:

![GP-TARS V2 decal placement on the front and rear elevations](/images/gptars-decal-placement.svg)

| Decal | Size (mm) | Purpose |
|---|---|---|
| TARS vertical wordmark | 52 × 250, ×2 | Port and starboard identity, two colourways |
| Data plate | 120 × 72 | Build, height, mass class, bus voltage, alloys, unit number |
| Hazard triangles | 44 × 40, ×4 | Crush, 24 V live, hot surface, starts without warning |
| E-stop surround | Ø70 | Centre cut for the mushroom head |
| Service labels | 130 × 16, ×4 | Compute, GPU and battery access, plus isolate-before-opening |
| Pinch-point stripes | 344 × 14, ×2 | Limb leading edges and the hip gap |
| Panel index marks | 26 × 26, ×8 | Return each panel to the opening it came from |
| Display surround | Scales to the 268 × 476 aperture | Bezel trim |

Application rules:

- Convert the artwork to the printer's CMYK profile; the source is RGB.
- Use matte or satin vinyl. Gloss reflects badly under exhibition lighting.
- Laminate everything. The limbs strike the ground every gait cycle.
- Degrease with isopropyl alcohol. Do not apply over fresh anodising or uncured powder coat.
- Keep decals 10 mm clear of panel edges and fasteners so they survive removal.
- The hazard stripes and E-stop surround are function rather than decoration, and must be applied before any powered test.

The hazard pictograms follow ISO 7010 geometry but are not certified labels. Source certified labels wherever compliance is actually required.
