# Aluminium architecture

## Decision

GP-TARS V2 will use aluminium for the load-bearing chassis, actuator carriers, equipment trays, and external body panels.

"Entirely aluminium" refers to fabricated robot structure and bodywork. The following safety-critical exceptions remain necessary:

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
| Exterior panels | 5052-H32 sheet | 1.2 mm nominal, 1.0–1.6 mm range | Brake-formed with beads, hems/returns, and local doublers |
| Battery tray | 5052-H32 sheet | 3 mm | Folded metal tray with bolted retainers and strap |
| Compute/GPU trays | 5052-H32 sheet | 2 mm | Folded removable trays with vibration isolators |
| Access-panel doublers | 5052-H32 or 6061-T6 | 2 mm | Riveted/bolted behind frequently serviced edges |

5052-H32 is preferred for folded panels because it forms more reliably than 6061-T6. 6061-T6 remains preferred for machined plates, carriers, and stiff structural members.

## Panel design rules

- Do not scale the source shell thickness.
- Use 15 mm folded edge returns as the initial stiffness and attachment feature.
- Use shallow beads/ribs on large flat faces to control drumming and oil-canning.
- Add 2 mm local doublers only at hinges, latches, handles, and concentrated fasteners.
- Isolate dissimilar metals and carbon-filled materials from aluminium to limit galvanic corrosion.
- Use captive nuts, rivnuts, nut plates, or bolts into structural aluminium; do not use printed heat-set inserts.
- Make compute, GPU, battery, motor controller, and actuator panels independently removable.
- Deburr and radius all wiring penetrations; add grommets or edge protection.

## Mass warning

A full rectangular skin at the current 958.7 × 1000 × 259.9 mm envelope has about 2.94 m² of surface area. At 1.2 mm and 2,680 kg/m³, an unperforated skin would be approximately 9.4 kg before returns, doublers, hinges, and fasteners.

The actual TARS panel set must therefore:

- avoid duplicate hidden skins;
- use structural openings and removable subpanels intelligently;
- use 1.0–1.2 mm sheet over most broad areas;
- reserve 1.6 mm sheet for exposed or frequently handled panels;
- maintain a formal mass budget before panel release.

An all-aluminium walking robot may exceed the original 12–25 kg target unless actuators, battery, frame, and bodywork are tightly mass-controlled.

## Joining and finish

- Prefer bolted, riveted, or replaceable jointing around service areas.
- Welding is acceptable for selected chassis modules but requires allowance for 6061 heat-affected-zone strength reduction and distortion.
- Use structural adhesive only as a secondary load path unless specifically qualified.
- Use anodising, powder coat, or conversion coating appropriate to the final appearance and corrosion environment.
