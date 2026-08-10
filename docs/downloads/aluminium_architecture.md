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
- Welding is acceptable for selected chassis modules but requires allowance for 6061 heat-affected-zone strength reduction and distortion.
- Use structural adhesive only as a secondary load path unless specifically qualified.
- Use anodising, powder coat, or conversion coating on the chassis and the exterior panels, selecting a finish system compatible with both alloys.
