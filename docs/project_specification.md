# GP-TARS V2 — 1 Metre Walking Robot CAD Project

We are building a full-size robotic version of GPTARS based on:

[https://github.com/poboisvert/GPTARS_Interstellar](https://github.com/poboisvert/GPTARS_Interstellar)

This is **not** a static prop and not simply an enlarged version of the original hobby-servo robot.

The target is:

**GP-TARS V2 — an approximately 1,000 mm tall, self-propelled walking TARS-style robot with onboard local AI compute.**

## Source Files

The project workspace should contain or be given access to:

* Original GPTARS repository
* `GPTARS_Interstellar-main.zip`
* `GP_TARS_V2_1000mm_scaled.brep`
* `GP_TARS_V2_1000mm_CAD_README.txt`

The existing GPTARS design is the visual and kinematic reference.

The original full robot geometry measured approximately:

* Tall axis: 250.35 mm
* Other dimensions approximately: 240 mm × 65 mm

The external geometry has initially been uniformly scaled by:

**3.9943785**

to produce an exact overall height of:

**1000 mm**

Do not assume that original screw holes, servo mounts, wall thicknesses, shafts, bearings or internal mechanisms should also remain scaled.

The scaled model is only the **external dimensional reference**.

---

# MAIN PROJECT OBJECTIVE

Create a new parametric CAD design named:

# GP-TARS V2 1000

The robot must:

* remain visually recognisable as TARS
* stand approximately 1000 mm tall
* reproduce TARS-style articulated walking
* support its own weight
* turn left and right
* execute controlled pivoting
* recover to vertical
* contain onboard batteries
* contain onboard computer hardware
* contain an NVIDIA GPU
* contain real-time motor control electronics
* be serviceable
* have removable panels
* use metal structural components
* use printed panels primarily as cosmetic bodywork

The mechanical structure must NOT rely on printed plastic body panels for primary structural loads.

---

# CAD DESIGN PHILOSOPHY

Separate the design into:

1. External cosmetic shell
2. Internal aluminium skeleton
3. Walking joints
4. Actuator assemblies
5. Bearings and shafts
6. Battery compartment
7. Compute compartment
8. GPU compartment
9. Electronics compartment
10. Cooling system
11. Sensors
12. Wiring channels
13. Service panels
14. Safety systems

Maintain the original TARS proportions wherever mechanically practical.

---

# PARAMETRIC MASTER VARIABLES

Create a master parameter/configuration file.

Use millimetres unless otherwise specified.

Initial parameters:

```text
ROBOT_HEIGHT = 1000

SHELL_WALL = 3.0
SHELL_WALL_MIN = 2.5
SHELL_WALL_MAX = 4.0

FRAME_PROFILE_SMALL = 20
FRAME_PROFILE_LARGE_X = 20
FRAME_PROFILE_LARGE_Y = 40

MAIN_SHAFT_DIAMETER = 20
SECONDARY_SHAFT_DIAMETER = 12

MAIN_ACTUATOR_CONTINUOUS_TORQUE = 60 Nm minimum design target
MAIN_ACTUATOR_PEAK_TORQUE = 100 Nm minimum initial design target

SECONDARY_ACTUATOR_TORQUE = 10–25 Nm

BATTERY_VOLTAGE = 24 V

GROUND_CLEARANCE_TARGET = 10–25 mm

STRUCTURAL_MATERIAL = 6061-T6 aluminium

PANEL_MATERIAL =
PETG / ASA / CF reinforced filament
```

Do not permanently lock actuator torque until proper static and dynamic calculations are performed.

---

# STRUCTURAL DESIGN

Create a central aluminium structural chassis.

Preferred materials:

* 6061-T6 aluminium
* 20×20 extrusion where lightly loaded
* 20×40 extrusion or fabricated aluminium sections at primary load points
* CNC aluminium actuator brackets
* steel shafts at major pivots

Avoid relying on long printed pivot shafts.

Major loads must transfer:

```text
foot/contact surface
    ↓
lower frame
    ↓
joint shaft
    ↓
bearings
    ↓
actuator bracket
    ↓
central structural frame
```

The printed exterior should bolt onto the structural chassis.

---

# WALKING MECHANISM

The original GPTARS walking concept uses coordinated lifting, rotation and controlled falling/pivoting.

GP-TARS V2 should preserve this general movement but replace hobby servo open-loop control with closed-loop robotic actuators.

Primary walking sequence:

```text
STAND

→ SHIFT CENTRE OF MASS

→ UNLOAD / LIFT LEADING SECTION

→ ROTATE LEADING SECTION

→ CONTROLLED PIVOT

→ DETECT GROUND CONTACT

→ ABSORB LANDING

→ ROTATE BODY THROUGH

→ RECOVER TO VERTICAL

→ VERIFY STABILITY

→ NEXT STEP
```

Create CAD joint limits for every moving component.

Mechanical hard stops should exist before any joint reaches a physically damaging position.

Do not depend exclusively upon software travel limits.

---

# ACTUATORS

Do NOT use the original RC hobby servos.

Design around integrated BLDC robotic actuators containing:

* brushless motor
* reduction gearbox
* absolute or high-resolution encoder
* CAN communications
* current measurement
* torque/current limiting

Initial design envelope for main actuators:

```text
Diameter:
80–120 mm

Length:
50–100 mm

Continuous torque:
>= 60 Nm preferred

Peak torque:
>= 100 Nm preferred

Supply:
24–48 V compatible
```

Use placeholder actuator geometry initially so actuator brands can later be swapped.

Create actuator components such as:

```text
ACTUATOR_MAIN_PLACEHOLDER

ACTUATOR_SECONDARY_PLACEHOLDER
```

Do not design the chassis around one proprietary motor until the torque analysis is complete.

---

# MAIN PIVOTS

Use proper shafts and bearings.

Initial main pivot:

```text
20 mm steel shaft
```

Suggested bearing starting point:

```text
20 mm ID sealed bearings
```

Use two bearings where practical to resist moment loads rather than cantilevering joints off a single bearing.

Design replaceable bearing carriers.

---

# COMPUTE SYSTEM

The robot will contain a high-performance mini PC.

Allow approximately:

```text
220 mm × 220 mm × 80 mm
```

for the mini-PC installation envelope until exact measurements are inserted.

The computer will handle:

* local LLM
* vision
* speech recognition
* text-to-speech
* ROS 2
* navigation
* behaviour
* high-level motion requests

The computer must NOT directly control motor commutation or safety-critical joint control.

---

# LOCAL GPU

Design an onboard NVIDIA GPU compartment.

Do not assume a specific final GPU yet.

Initial envelope:

```text
GPU length = 300 mm
GPU height = 130 mm
GPU thickness = 60 mm
```

Make these CAD parameters:

```text
GPU_LENGTH
GPU_HEIGHT
GPU_WIDTH
```

GPU should preferably be mounted vertically.

Provide:

* intake airflow
* exhaust airflow
* removable GPU bracket
* PCIe/OCuLink cable path
* protection from vibration
* access without dismantling the complete robot

The GPU mount should support a card approximately equivalent in size to a modern 2–3 slot NVIDIA GPU.

---

# COOLING

Create a bottom-to-top airflow path.

Preferred layout:

```text
LOW AIR INTAKE
      ↓
FILTER
      ↓
GPU
      ↓
MINI PC
      ↓
EXHAUST FANS
      ↓
HIGH EXHAUST
```

Keep motor-controller cooling separate where practical.

Add fan mounting locations.

Initial fan sizes to consider:

* 80 mm
* 92 mm
* 120 mm

Do not compromise structural members for airflow.

---

# BATTERY

Battery should be positioned as low as possible.

Initial system voltage:

**24 V**

Create a configurable battery envelope approximately:

```text
300 mm wide
150 mm deep
120 mm high
```

This is only a placeholder until battery energy requirements are calculated.

Battery tray requirements:

* bolted metal tray
* retaining strap
* removable
* protected from GPU heat
* protected from actuator impact
* accessible charging connector
* fused main output
* manual disconnect

The battery location should lower the centre of gravity.

---

# ELECTRONICS

Provide mounting areas for:

* real-time motor controller
* CAN interface
* power distribution
* motor fuses
* contactors
* DC/DC converters
* IMU
* emergency-stop controller
* cooling controller
* network switch if needed

Possible real-time controller:

* STM32
* Teensy
* similar deterministic MCU

Architecture:

```text
MINI PC
   │
USB / Ethernet / CAN
   │
REAL-TIME CONTROLLER
   │
CAN BUS
   │
BLDC ACTUATORS
```

---

# SAFETY

The mechanical model must include provision for:

## Physical emergency stop

Large mushroom E-stop.

The E-stop should disable actuator power independently of the local LLM or operating system.

Also design:

* actuator power contactor
* main battery disconnect
* fuse panel
* joint mechanical hard stops
* accessible service disconnect

Do not place E-stop somewhere that becomes inaccessible while the robot is moving.

---

# SENSORS

Reserve mounting provisions for:

* IMU
* front RGB camera
* depth camera
* microphone array
* ToF sensors
* ground contact sensors
* joint encoders
* optional LiDAR

Do not permanently model specific sensors yet unless required.

Use replaceable mounting plates.

---

# CENTRE OF GRAVITY

Create CAD reference points for:

```text
COG_STATIC

COG_BATTERY

COG_GPU

COG_COMPUTE
```

Use component masses when available.

The CAD project should eventually calculate approximate overall centre of gravity.

Keep heavy components centred laterally.

Place the battery below the GPU and computer where possible.

---

# BODY PANELS

Use the existing scaled TARS geometry as reference surfaces.

Redesign external panels instead of simply scaling the old STL wall thickness.

Preferred panel thickness:

```text
2.5–4 mm
```

Use ribs where required rather than unnecessarily thick walls.

Panels should be removable using:

* M3
* M4
* M5

fasteners depending on location.

Use heat-set inserts only in non-critical printed components.

Structural joints should use bolts into aluminium or steel.

---

# SERVICEABILITY

Major areas should be accessible separately.

Create panels for:

```text
COMPUTE ACCESS

GPU ACCESS

BATTERY ACCESS

MOTOR CONTROLLER ACCESS

LEFT ACTUATOR ACCESS

RIGHT ACTUATOR ACCESS
```

Aim to replace the GPU or mini PC without removing the walking mechanism.

Aim to replace an actuator without completely disassembling the body.

---

# CAD COMPONENT TREE

Use a clean assembly hierarchy.

Recommended structure:

```text
GP_TARS_V2_1000
│
├── 00_MASTER_REFERENCE
│
│   └── Original_1000mm_Scaled_Geometry
│
├── 01_FRAME
│   ├── Central_Spine
│   ├── Left_Frame
│   ├── Right_Frame
│   └── Crossmembers
│
├── 02_JOINTS
│   ├── Upper_Pivot
│   ├── Lower_Pivot
│   ├── Left_Leg_Pivot
│   └── Right_Leg_Pivot
│
├── 03_ACTUATORS
│
├── 04_BEARINGS_SHAFTS
│
├── 05_BATTERY
│
├── 06_COMPUTE
│
├── 07_GPU
│
├── 08_ELECTRONICS
│
├── 09_COOLING
│
├── 10_SENSORS
│
├── 11_BODY_PANELS
│
├── 12_FASTENERS
│
└── 13_WIRING
```

---

# SOFTWARE / CAD AUTOMATION

Where possible, generate geometry parametrically using Python.

Preferred options:

* CadQuery
* FreeCAD Python
* Fusion 360 Python API

Create scripts under:

```text
cad/
```

Suggested structure:

```text
cad/
├── README.md
├── parameters.py
├── gp_tars_master.py
├── frame.py
├── actuator_placeholders.py
├── battery.py
├── compute.py
├── gpu.py
├── cooling.py
├── export.py
└── output/
```

Running:

```bash
python cad/export.py
```

should eventually generate:

```text
output/
├── GP_TARS_V2_MASTER.step
├── GP_TARS_V2_FRAME.step
├── GP_TARS_V2_ASSEMBLY.step
└── STL/
```

Do not overwrite original GPTARS source CAD.

---

# FIRST TASK

Do NOT attempt to completely redesign the robot immediately.

Perform this sequence:

## Stage 1

Inspect all original GPTARS CAD/STL/STEP files.

Document:

* component names
* external dimensions
* moving components
* original pivot locations
* original servo locations
* original joint axes

Create:

```text
docs/original_geometry_analysis.md
```

---

## Stage 2

Import or reference the existing:

```text
GP_TARS_V2_1000mm_scaled.brep
```

and establish the 1000 mm body as the master external envelope.

Create datum planes and axes for:

* vertical centreline
* lateral centreline
* front/back centre
* main joint axes

---

## Stage 3

Create a simplified aluminium internal frame within the shell.

Do NOT create body panels yet.

Create space reservations for:

* actuators
* battery
* mini PC
* GPU
* controllers

---

## Stage 4

Generate an interference report.

Check:

* frame vs shell
* actuator vs shell
* GPU vs frame
* battery vs walking mechanism
* wiring clearance
* joint sweep clearance

Document this in:

```text
docs/interference_report.md
```

---

## Stage 5

Create engineering drawings showing:

* front view
* side view
* top view
* main dimensions
* joint axes
* actuator centres
* battery location
* compute location
* GPU location

---

# IMPORTANT

Do not simply create a four-times larger copy of the original hobby robot.

Use the original design for:

* appearance
* proportions
* articulation concept
* general motion concept

Redesign the internals as a real approximately 1 metre, 12–25 kg class autonomous walking robot.

Prioritise:

1. Mechanical safety
2. Stable walking geometry
3. Low centre of gravity
4. Structural stiffness
5. Serviceability
6. Thermal management
7. Appearance

Do not compromise structural integrity merely to preserve an internal feature of the original small-scale design.

Before making large design assumptions, document them in:

```text
docs/design_assumptions.md
```

Begin by inspecting the existing CAD files and reporting the exact geometry, component structure and proposed V2 joint locations before committing to the final internal frame.
