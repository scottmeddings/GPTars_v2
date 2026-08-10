# Original GPTARS geometry analysis

## Scope and source state

Inspection date: 2026-08-09.

Primary source inspected:

- `GPTARS_Interstellar/tars_3_v9_original.zip`
- Archive member: `edit tars_3_v9_original.STEP`
- Separate source part: `GPTARS_Interstellar/525125.STEP`
- Comparison source: TARS-AI V3 STL set and static STEP

Named brief assets not found in the workspace or Spotlight index:

- `GPTARS_Interstellar-main.zip`
- `GP_TARS_V2_1000mm_scaled.brep`
- `GP_TARS_V2_1000mm_CAD_README.txt`

The missing BREP is therefore not silently replaced. Measurements below come from the imported full STEP assembly.

## Coordinate convention

The imported STEP is oriented as follows:

- X: lateral, starboard to port; all principal axle directions are parallel to X.
- Y: vertical in the standing reference pose.
- Z: front-to-back depth.

Imported bounding box, millimetres:

| Axis | Minimum | Maximum | Extent |
|---|---:|---:|---:|
| X | -65.030000 | 175.030000 | 240.060000 |
| Y | -10.366961 | 240.030000 | 250.396961 |
| Z | -0.040000 | 65.030011 | 65.070012 |

Envelope centre is approximately `(55.000, 114.832, 32.495)` mm.

Normalising this exact imported geometry to 1,000 mm height gives:

```text
scale = 1000 / 250.3969610849432
      = 3.993658692

reference width = 958.718 mm
reference depth = 259.867 mm
```

The brief states a separate BREP scale of `3.9943785`, derived from an approximately `250.35 mm` source height. That value cannot be verified until the named BREP is supplied. Applying it to the measured STEP would produce slightly more than 1,000 mm height, so the two source bases must not be mixed.

## Assembly structure

Fusion import results:

- Components: 281
- Occurrences: 289
- Root-level occurrences: 20
- Fusion joints: 0
- As-built joints: 0
- Geometry type: imported BRep/base features with no parametric source history

The lack of retained joints means moving axes must be reconstructed from shafts, bearings, servo outputs, and mating geometry.

Main hierarchy:

```text
Imported assembly
├── Chassis
│   ├── Upper Lid
│   │   ├── Screen Protector
│   │   ├── Screen
│   │   ├── Letters / T A R S
│   │   └── Lid body and fasteners
│   ├── Upper Chassis
│   │   ├── Port Side / Starboard Side
│   │   ├── Suspension mounts and mount bearings
│   │   ├── Main Axle
│   │   ├── Secondary Axles
│   │   └── Strut mounts and fasteners
│   ├── Lower Chassis
│   ├── Interchassis Components
│   │   ├── Port / Starboard leg mounts
│   │   ├── Bearings
│   │   ├── Futaba S3003 servo and pusher rod
│   │   ├── Lower Axle
│   │   └── Screen support
│   └── Lower lid
├── Port Leg_Arm
│   ├── Leg shells, hulls, lids and foot pads
│   ├── LD-3015MG-class servo models (`2000-0025-0002`)
│   ├── Flexor assemblies
│   ├── Main arm / forearm / fingers
│   ├── Linkage assemblies
│   └── Servo clips
├── Raspberry Pi 4 model
├── 12-channel PWM model
├── Buck converter
├── LiPo and Pi battery models
└── Mirrored arm lids, hand parts, spacer and flexor parts
```

The root hierarchy contains redundant detailed subcomponents inside purchased-part models, especially the Raspberry Pi. These inflate component count and should be replaced with simplified keep-out envelopes in V2.

## Principal component envelopes

| Component | Centre XYZ (mm) | Size XYZ (mm) | Interpretation |
|---|---|---|---|
| Full reference (`Port Leg_Arm`) | 55.000, 114.832, 32.495 | 240.060, 250.397, 65.070 | Overall source envelope |
| Chassis | 54.995, 115.005, 32.495 | 133.232, 250.050, 65.070 | Central body envelope |
| Leg | 55.000, 114.832, 32.500 | 240.060, 250.397, 65.060 | Combined leg/outer section hierarchy |
| Raspberry Pi 4 model | 33.505, 39.005, 13.000 | 57.030, 88.030, 18.040 | Obsolete V2 equipment reference |
| PWM model | 98.754, 57.850, 17.700 | 7.553, 66.740, 25.440 | Obsolete V2 controller reference |
| LiPo model | 53.112, 41.389, 51.500 | 35.031, 88.030, 25.023 | Obsolete V2 battery reference |
| Pi battery model | 21.366, 42.384, 45.495 | 22.540, 90.040, 37.030 | Obsolete V2 battery reference |

## Original actuators and servo locations

The STEP contains RC-servo geometry only; it does not contain useful torque or motion metadata.

| Source item | Centre XYZ (mm) | Envelope XYZ (mm) | Probable axis |
|---|---|---|---|
| Futaba S3003 | 84.050, 117.500, 15.000 | 41.920, 55.270, 20.020 | X |
| Futaba output cylinder | 69.100, 127.585, 15.000 | radius 7.125 | X |
| LD-3015MG leg servo assembly | 139.260, 189.610, 27.500 | 43.940, 54.360, 20.060 | X |
| LD-3015MG outer/arm servo assembly | 148.060, 118.496, 32.150 | 43.940, 20.060, 54.360 | X-oriented output; body rotated |

These servo bodies, clips, horns, and holes must not be scaled into V2. They are references for original linkage intent only.

## Original pivots and axes

All verified principal shafts are cylindrical and parallel to X.

| Source feature | Axis point XYZ (mm) | Diameter (mm) | Axis |
|---|---|---:|---|
| Upper Main Axle | 55.000, 199.460, 27.500 | 4.800 | X |
| Upper Secondary Axle | 55.000, 212.460, 22.000 | 4.800 | X |
| Lower Secondary Axle | 55.000, 186.460, 22.000 | 4.800 | X |
| Lower Main Axle | 55.000, 142.585, 35.000 | 4.800 | X |
| Upper mount bearings | X = 25 and 85, Y = 199.460, Z = 16.000 | 15 mm envelope | X |
| Lower bearing centres | X = 17.5 and 91.5, Y = 142.585, Z = 35.000 | 15 mm envelope | X |

The STEP has no joint limits. Hard-stop angles cannot be recovered reliably from joint metadata and must be derived later from collision/sweep studies.

## V2 datum transform

V2 uses:

- `X = 0`: lateral envelope centre.
- `Y = 0`: lowest source-envelope point / nominal ground datum before clearance is applied.
- `Z = 0`: front/back envelope centre.

For a source point `(x, y, z)`:

```text
Xv2 = (x - 55.000000) * 3.993658692
Yv2 = (y + 10.366961) * 3.993658692
Zv2 = (z - 32.495006) * 3.993658692
```

This transform is only for locating reference datums and motion concepts. Shaft diameters, bearings, clearances, wall thicknesses, and fasteners do not use the scale factor.

## Proposed V2 reference joint locations

These are provisional kinematic reference axes, not released actuator centres.

| V2 reference | Point XYZ (mm) | Axis | Design intent |
|---|---|---|---|
| `JOINT_UPPER_MAIN_REF` | 0.000, 837.977, -19.948 | X | Split into independently supported left/right coaxial modules where practical |
| `JOINT_UPPER_SECONDARY_REF` | 0.000, 889.895, -41.913 | X | Linkage reference; likely 12 mm secondary shaft |
| `JOINT_LOWER_SECONDARY_REF` | 0.000, 786.060, -41.913 | X | Linkage reference; likely 12 mm secondary shaft |
| `JOINT_LOWER_MAIN_REF` | 0.000, 610.838, 10.004 | X | Primary body/leg articulation candidate, 20 mm shaft starting point |
| `ACTUATOR_LEG_PORT_REF` | 264.041, 837.973, -19.977 | X | Placeholder centre based on original output region |
| `ACTUATOR_LEG_STARBOARD_REF` | -264.041, 837.973, -19.977 | X | Mirrored placeholder |
| `ACTUATOR_OUTER_PORT_REF` | 299.185, 514.664, 37.955 | X | Arm/outer-section placeholder; role requires motion reconstruction |
| `ACTUATOR_OUTER_STARBOARD_REF` | -299.185, 514.664, 37.955 | X | Mirrored placeholder |

V2 should use 20 mm steel main shafts with two separated bearings per major pivot, replaceable bearing carriers, and CNC/fabricated aluminium actuator brackets. Exact bearing spacing and actuator offsets remain open pending load and sweep analysis.

## Separate `525125.STEP`

This file is a single round hub-like part:

- Envelope: 25.39238 × 4.572 × 25.39238 mm
- Central bore radius: approximately 3.431 mm
- Eight-hole pattern around approximately 9.779 mm radius

It is a purchased-hardware/reference part and must not be uniformly scaled into V2.

## Moving-component reconstruction

The original motion concept appears to use:

1. Upper and lower lateral axle lines through the chassis.
2. RC servos driving leg/outer sections through horns and linkages.
3. Flexor assemblies and suspension/strut elements providing constrained relative movement.
4. Mirrored outer sections and arms.

Because the STEP import contains no joints, a reliable motion model requires new Fusion joints and explicit hard stops. The V2 kinematic skeleton must be built independently while using the source axle lines and shell sweep only as references.

