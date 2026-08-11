# Gait and locomotion

Status: proposed gait, revision Gait V1, 2026-08-11.

GP-TARS V2 walks as a **compass walker**: two rigid limbs hinged at a common
hip axis, swinging in the sagittal plane. Two actuators, two degrees of freedom,
no knees.

This is a deliberate simplification and a legitimate configuration. Compass
walkers are the classic passive-dynamic form, and rigid slabs pivoting about a
shared axis is closer to the screen robot's motion than a knee-jointed limb.
Earlier revisions of this project assumed two degrees of freedom per limb after
reading a mid-limb bend in reference footage of a fan-built replica; that replica
carries more articulation than the gait requires.

## Configuration

| Item | Value |
|---|---|
| Actuated joints | 2, one hip per side |
| Actuator | CubeMars AK45-10 V3.0 with a 24:1 second stage, 240:1 total |
| Joint torque | 60 N·m continuous, 168 N·m peak |
| Limb | Rigid from hip to foot; no knee |
| Leg length | 610.845 mm, equal to the hip axis height |
| Plane of motion | Sagittal only |

The limbs must therefore be modelled as **single rigid shells**, not the shin,
thigh and upper split currently in `14_ARMS`. Any knee line becomes a fabricated
joint that is bolted solid, or is removed.

## Step geometry

Step length is `2 L sin θ` for a splay half-angle θ about a leg of length L.

| Splay half-angle | Step length | Swing time at 0.4 rad/s | Speed |
|---:|---:|---:|---:|
| 10° | 212 mm | 0.87 s | 0.24 m/s |
| 15° | 316 mm | 1.31 s | 0.24 m/s |
| 20° | 418 mm | 1.75 s | 0.24 m/s |
| 25° | 516 mm | 2.18 s | 0.24 m/s |

Speed is **independent of splay angle**, because step length and swing time both
scale with θ. Walking speed is set purely by joint angular velocity, so it is a
function of actuator speed and bus voltage, not of gait tuning.

At the 12.8 V bus that is **0.24 m/s**, about 0.9 km/h. At the actuator's 24 V
nominal it would be roughly 0.48 m/s. This is the clearest practical cost of the
12.8 V decision recorded in `docs/design_assumptions.md`.

**Working point: 20° splay, 418 mm step, 1.75 s per swing.**

## Foot clearance is the one real problem

A rigid leg of fixed length cannot swing past the stance leg without striking the
ground. This is the defining constraint of a kneeless walker, and it must be
solved mechanically because there is no joint available to solve it.

The answer is a **rockered foot**. As the stance foot rolls forward on a curved
sole the hip rises, peaking when the stance leg is vertical, which is exactly
when the swing limb passes. Clearance is `R(1 - cos θ)`.

| Rocker radius | at 15° | at 20° | at 25° |
|---:|---:|---:|---:|
| 100 mm | 3.4 mm | 6.0 mm | 9.4 mm |
| 150 mm | 5.1 mm | 9.0 mm | 14.1 mm |
| **200 mm** | 6.8 mm | **12.1 mm** | 18.7 mm |
| 260 mm | 8.9 mm | 15.7 mm | 24.4 mm |

**Specify R = 200 mm at the working point**, giving 12.1 mm of clearance. The
limb slab is 259.867 mm deep, so a 200 mm radius forms naturally across the foot
without adding depth.

A rocker also reduces heel-strike impact, which matters because the landing case
sizes the joint. Flat feet on rigid legs would both scuff and slam.

## What two joints will not do

The specification asks for behaviours this configuration cannot deliver:

| Requirement | With two hip joints |
|---|---|
| Walk forward | **Yes**, on flat ground |
| Turn left and right | **No.** Both limbs swing in one plane; there is no yaw freedom |
| Controlled pivoting | Limited to asymmetric stepping at best |
| Recover to vertical | **No.** Self-righting needs degrees of freedom this lacks |
| Step over obstacles | **No.** Clearance is fixed by the rocker geometry |

This is accepted for the current build, whose goal is forward walking. Turning
and recovery require either additional joints or a different mechanism, and
neither should be assumed to arrive by tuning software.

## Open items

- Reduce `14_ARMS` from shin, thigh and upper to a single rigid shell per side.
- Model the 200 mm rockered foot and its contact pad material.
- Confirm lateral stability: the machine is 480 mm wide but only 259.9 mm deep,
  and nothing in this gait stabilises roll.
- Measure real joint speed on the bench before trusting the 0.24 m/s figure; it
  assumes 0.4 rad/s at the output, which is itself derived rather than measured.
- Decide whether turning is added later by a third joint, by asymmetric stepping,
  or not at all.
