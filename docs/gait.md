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
| Actuator | CubeMars AK45-10 V3.0 with a 32:1 second stage, 320:1 total |
| Joint torque | 80 N·m continuous, 224 N·m peak; 68 and 190 after efficiency |
| Limb | Rigid from hip to foot; no knee |
| Leg length | 610.845 mm, equal to the hip axis height |
| Plane of motion | Sagittal only |

The limbs are modelled as **single rigid shells** in `14_ARMS`, with the rockered
feet as separate parts in `16_FEET`.

![GP-TARS V2 dimensioned front and side elevations, showing the hip axis, rockered feet and leg-arm slabs](/images/gptars-elevation.svg)

## Step geometry

Step length is `2 L sin θ` for a splay half-angle θ about a leg of length L.

| Splay half-angle | Step length | Swing time at 0.6 rad/s | Speed |
|---:|---:|---:|---:|
| 10° | 212 mm | 0.58 s | 0.36 m/s |
| 15° | 316 mm | 0.87 s | 0.36 m/s |
| 20° | 418 mm | 1.16 s | 0.36 m/s |
| 25° | 516 mm | 1.45 s | 0.36 m/s |

Speed is **independent of splay angle**, because step length and swing time both
scale with θ. Walking speed is set purely by joint angular velocity, so it is a
function of actuator speed and bus voltage, not of gait tuning.

The actuators run at 24 V from a boost stage off the 12.8 V bus, so speed is
**0.36 m/s**, about 1.3 km/h. The 32:1 second stage costs some of the 0.48 m/s
the raw 24 V supply would give, and buys torque margin with it: 68 N·m against
the 53.3 N·m needed to hold a 20° splay at 33 kg.

**Working point: 20° splay, 418 mm step, 1.16 s per swing.**

## Foot clearance is the one real problem

A rigid leg of fixed length cannot swing past the stance leg without striking the
ground. This is the defining constraint of a kneeless walker, and it must be
solved mechanically because there is no joint available to solve it.

The answer is a **rockered sole, curved fore and aft only**. The sole is flat
across the limb's width; the rocker acts in the plane the limb swings in.

As the stance foot rolls, the arc centre stays at height R and the hip rides
highest when the leg is vertical, which is exactly when the swing limb passes.
Clearance is

```text
clearance = (L - R)(1 - cos θ)      L = 610.845 mm, the hip height
```

**not** `R(1 - cos θ)`. The distinction matters and inverts the intuition: a
larger radius raises the arc centre, shortens the effective pendulum and gives
**less** clearance, not more.

| Rocker radius | at 15° | at 20° | Sagitta over 259.9 | Stands unaided |
|---:|---:|---:|---:|---|
| 0, a sharp edge | 20.8 mm | 36.8 mm | — | No |
| 200 mm | 14.0 mm | 24.8 mm | 48.0 mm | No |
| 300 mm | 10.6 mm | 18.7 mm | 29.6 mm | No |
| **400 mm** | 7.2 mm | **12.7 mm** | **21.7 mm** | **Yes** |
| 500 mm | 3.8 mm | 6.7 mm | 17.2 mm | Yes |

### Radius is set by standing, not by clearance

A body rocking on a curved sole is stable only while its centre of mass sits
**below** the centre of curvature. Above it, the sole behaves like a rocking
chair and the machine tips instead of self-righting.

The estimated centre of mass is **381 mm** above ground. Any radius below that
leaves the robot unable to stand still without continuous active balancing,
which would defeat the power-off holding brakes the power budget depends on, in
the mode the robot spends most of its life in.

**Specify R = 400 mm**, which puts the arc centre 19 mm above the estimated
centre of mass and still yields 12.7 mm of swing clearance. The resulting sole
is far shallower than a small rocker: 21.7 mm of curvature across the 259.9 mm
depth rather than 48 mm.

The margin is thin and rests on an estimated centre of mass. **Compute the real
figure before the feet are made**, and re-check the radius against it; the
battery dominates that number and its final mounting height is not fixed.

A rocker also reduces heel-strike impact, which matters because the landing case
sizes the joint.

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

- Confirm lateral stability: the machine is 480 mm wide but only 259.9 mm deep,
  and nothing in this gait stabilises roll.
- Measure real joint speed on the bench before trusting the 0.36 m/s figure; it
  assumes 0.6 rad/s at the output, which is derived rather than measured.
- Compute the real centre of mass and re-check the 400 mm rocker radius against
  it. The 19 mm stability margin rests on a 381 mm estimate.
- Verify the contact pad covers the working splay. It wraps the sole from ground
  level to 28 mm; beyond that the foot lands on bare aluminium.
- Decide whether turning is added later by a third joint, by asymmetric stepping,
  or not at all.
