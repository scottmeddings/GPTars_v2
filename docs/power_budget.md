# Power budget

Status: proposed budget, revision Power V1, 2026-08-10.

This document estimates the electrical load of GP-TARS V2 by operating mode,
sets the reduction measures, and derives runtime from the battery envelope. It
exists because `docs/design_assumptions.md` lists battery energy and discharge
requirements as a decision required before the frame can be committed, and
because the first estimate showed the robot could not run for a useful period.

Every figure is an estimate from stated assumptions. **Actuator draw is the
weakest number and will remain so until actuators are selected**; it is also the
number that decides whether walking costs 250 W or 400 W.

## Why this document exists

A first pass at continuous operation gave approximately 305 W in conversation
and 600 W walking. Against the 5.4 litre battery reservation, which holds
roughly 1,200 Wh, that is under four hours of conversation and under two hours of
walking. A two-day target would have needed a 25 kg battery for standby alone,
against a 12–25 kg budget for the entire robot.

The load breakdown showed why:

| Load | W | Share of conversational draw |
|---|---:|---:|
| External GPU | 150 | 49% |
| Mini PC | 60 | 20% |
| Conversion losses | 33 | 11% |
| MCU, sensors, fans | 25 | 8% |
| Actuators holding | 20 | 7% |
| Display | 18 | 6% |

Half the budget is one component. The architecture therefore keeps the GPU but
**powers it only when it is actually inferring**.

## Operating modes

| Mode | State | Estimated draw |
|---|---|---:|
| 0 — Deep sleep | PC suspended, GPU unpowered, wake word on a dedicated MCU, brakes engaged, display off | **~8 W** |
| 1 — Attentive | PC awake at capped TDP, display dimmed, sensors live, GPU still down | **~39 W** |
| 2 — Conversational | GPU powered and model resident, inference bursts, vision active | **~251 W** |
| 3 — Walking | Actuators driving, GPU deliberately down | **~250–420 W** |

### Mode 0 — deep sleep, ~8 W

| Item | W |
|---|---:|
| Wake-word MCU and microphone | 0.5 |
| Mini PC, suspend to RAM | 3.0 |
| Safety MCU, CAN transceivers | 3.0 |
| Actuators, power-off brakes engaged | 0.0 |
| GPU supply, gated | 0.5 |
| Conversion losses | 1.0 |

The wake word must run on a small always-on microcontroller, not on the mini PC.
Keeping the PC awake purely to listen costs roughly 85 W for a task a
sub-watt device can do.

### Mode 1 — attentive, ~39 W

| Item | W |
|---|---:|
| Mini PC, idle at capped cTDP | 15 |
| Display, dimmed | 8 |
| Sensors: IMU, microphones, one camera | 8 |
| Safety MCU and CAN | 3 |
| Actuators on brakes | 1 |
| Conversion losses | 4 |

### Mode 2 — conversational, ~251 W

| Item | W |
|---|---:|
| External GPU, active | 150 |
| Mini PC | 45 |
| Vision and sensors | 12 |
| Display | 12 |
| Safety and brakes | 4 |
| Conversion losses | 28 |

150 W is a sustained figure. Real inference is bursty, so a conversation
averages nearer 90 W of GPU draw; the sustained number is used for sizing.

### Mode 3 — walking, ~250–420 W

| Item | W |
|---|---:|
| Actuators, average over the gait cycle | 150–300 |
| Mini PC | 45 |
| Vision, sensors, balance | 15 |
| Display | 12 |
| Safety | 5 |
| Conversion losses | 25–40 |

**The GPU is deliberately down while walking.** The language model is not needed
between footfalls, and gating it keeps the two largest loads from peaking
together. This is a benefit of power gating beyond energy saving: it de-conflicts
the actuator current surge from the inference load.

If conversation and walking must overlap, budget approximately **550 W** and size
the wiring, fusing and battery C-rate for that case, or have the behaviour
supervisor forbid it.

## Powering the GPU on and off

This is the part most likely to go wrong, and it needs testing before the bay is
committed.

**Do not assume the card can be hard power-cycled.** The GPU attaches over
OCuLink PCIe 4.0 x4. Removing power from a PCIe device at runtime requires the
host to re-enumerate the bus, and many systems and firmware do not tolerate that
reliably. A hard contactor on the GPU supply may leave the card missing until the
host reboots.

The preferred mechanism is therefore layered:

1. **Runtime suspend as the primary mechanism.** Let the driver place the card in
   its deepest runtime power state when idle. This typically brings a 150 W card
   to single-digit watts without disturbing PCIe enumeration, and recovery is
   seconds rather than a reboot.
2. **Hard isolation only for Mode 0**, when the host is suspending anyway and
   will re-enumerate on resume regardless.
3. **Soft-start on the GPU supply.** Switching a PSU of this size produces
   significant inrush; a pre-charge or soft-start stage is required to avoid
   nuisance trips of the main fuse or contactor.

Verify the wake path end to end early: supply up, link trained, driver attached,
model loaded into VRAM, first token. Model load over an x4 link is a few seconds
for a 9 GB model, but driver and enumeration time dominate.

**Authority:** the behaviour supervisor may *request* GPU power, and the
deterministic MCU switches it. The language model must never control its own
power state, in either direction. This follows the command boundary in
`docs/software_architecture.md`.

## Reduction measures

| Measure | Saves | Status |
|---|---:|---|
| Power-gate the GPU outside inference | ~150 W in modes 0, 1 and 3 | Selected |
| Actuators with power-off holding brakes | ~20 W continuous | **Specify before actuator selection** |
| Wake word on a dedicated MCU | ~85 W in standby | Selected |
| Cap the mini PC cTDP, 15–54 W configurable | 15–25 W | Selected |
| Dim or blank the display when nobody is near | 10–18 W | Uses existing ToF and person detection |
| Fans on a thermal control loop; LiDAR optional | 10–15 W | Selected |
| 95% synchronous conversion; actuators native 24 V | ~15 W | Design rule |

The brake requirement deserves emphasis. The gait **stands splayed**, so without
power-off brakes the robot burns holding current whenever it is upright, converts
it to heat inside a sealed aluminium body, and does so in the mode it spends most
of its life in.

## Battery and runtime

The reservation is 200 × 150 × 180 mm, which is 5.4 litres. At a realistic
pack-level density of roughly 220 Wh/litre that is about **1,200 Wh**, or
**50 Ah at the 24 V nominal bus**, weighing approximately 6.6 kg. That mass is
already a quarter of the 12–25 kg target and must appear in the mass budget.

Runtimes assume 90% usable capacity, about 1,080 Wh, to protect cell life.

| Mode | Draw | Runtime |
|---|---:|---:|
| 0 — Deep sleep | 8 W | **135 h, about 5.6 days** |
| 1 — Attentive | 39 W | 27.7 h |
| 2 — Conversational | 251 W | 4.3 h |
| 3 — Walking | 300 W | 3.6 h |

Mixed duty is more useful than any single mode. At 70% attentive, 20%
conversational and 10% walking the average is about 108 W, giving roughly
**10 hours** of continuous mixed operation.

For a two-day target the robot must spend most of that time in Mode 0. At 90%
sleep and 10% attentive the average is about 11 W, or roughly **four days**. Two
days of *availability* is achievable. Two days of *continuous operation* is not,
and no plausible battery inside this body changes that.

Peak current at the 550 W overlap case is approximately 23 A at 24 V, which is
0.46C on a 50 Ah pack and unremarkable. Wiring, fusing, the contactor and the
connectors must still be rated for it.

## How much battery is actually needed

Sizing from a realistic two-day deployment rather than from continuous operation:

| Activity over two days | Draw | Energy |
|---|---:|---:|
| 43 h asleep | 8 W | 344 Wh |
| 4 h attentive | 39 W | 156 Wh |
| 1 h conversation | 251 W | 251 Wh |
| ~10 min walking | 300 W | 50 Wh |
| **Total** | | **~800 Wh** |

With 90% usable that is about **890 Wh**, or **37 Ah at 24 V**. Rounding up for
ageing and margin gives a target of **1,000 Wh, roughly 40 Ah at 24 V**.

This is the important consequence of Mode 0 costing only 8 W: multi-day
*availability* needs a modest pack. It is continuous operation that is
unaffordable, and no pack fixes that.

## Chemistry

| Chemistry | Pack density | 1,000 Wh weighs | Note |
|---|---:|---:|---|
| Li-ion NMC, 21700 cells | 180–250 Wh/kg | **4.5–5.5 kg** | Best mass, needs careful protection |
| LiFePO4 | 90–120 Wh/kg | **8–11 kg** | Roughly half the density, far better thermal safety and cycle life |

LiFePO4 is a defensible choice for a machine whose gait is a controlled fall,
because its thermal runaway behaviour is much more forgiving than NMC. That
safety argument is real and should not be dismissed on density alone. But the
mass penalty is roughly double, and it lands on a budget that is already tight.

### On a 12 V 135 Ah LiFePO4 pack

A pack of that size is 1,620 Wh, which is more energy than the robot needs, and
it fails on three other counts:

- **Voltage.** It is 12 V against a 24 V bus. Two in series doubles the mass to
  roughly 30 kg. Boosting 12 V to 24 V is lossy and doubles the input current.
  Running the whole robot at 12 V conflicts with actuators specified for 24–48 V
  and doubles every current in the machine.
- **Mass.** Packs of this class are typically 12–16 kg. That alone is most of the
  12–25 kg budget for the entire robot.
- **Size.** Typical case dimensions are near 330 × 175 × 215 mm, about 12.4
  litres against a 5.4 litre reservation, and 330 mm exceeds the 240 mm chassis
  width. It fits only stood on end, and only if the bay is redesigned.

The correct shape is a **24 V pack of roughly 40 Ah**, purpose-built rather than
a caravan or deep-cycle unit. Deep-cycle packs are optimised for cycle life and
cost at low discharge rates, carry heavy cases and terminals, and size their
management electronics for currents far beyond the 23 A peak here.

### The mass budget will not close on its own

A first tally of known components — 5.7 kg of skin, 3–4 kg of frame, 6–10 kg of
actuators, 2–3 kg of shafts and bearings, 1.5 kg of mini PC, 2–3 kg of GPU and
supply, about 1 kg of display, and 2 kg of wiring and fasteners — reaches roughly
**24–28 kg before any battery at all**.

The 12–25 kg design class in the specification is therefore already at risk
independently of the battery, and adding 5 to 15 kg of cells makes it certain.
This needs resolving as a mass budget exercise, not absorbed silently into the
battery choice.

## Charging

A dock is the intended recharge path, and it also allows the GPU to run from
mains rather than the pack during long stationary sessions.

At a 240 W charge rate the pack takes roughly five to six hours from empty.
Requirements already recorded in the specification apply: accessible charging
connector, fused main output, manual disconnect, and a battery management system
appropriate to the chemistry.

## Safety

Approximately 1.2 kWh of lithium sits inside a machine whose gait involves a
controlled fall. Cell protection, mechanical containment, fusing and the manual
disconnect are not optional, and the pack must not be part of the structural load
path. The battery tray is specified as a bolted metal tray with a retaining strap
for this reason.

## Open decisions

- Select actuators and measure real holding, walking and landing current. Every
  motion figure here is provisional until then.
- Confirm that the chosen actuators offer power-off holding brakes.
- Test GPU runtime suspend and resume on the actual OCuLink link before
  committing the GPU bay.
- Measure the mini PC at capped cTDP against the 100 W USB-C PD limit recorded in
  `docs/compute_hardware.md`, or approve the inverter alternative.
- Choose cell chemistry and format, then replace the volumetric energy estimate
  with a real pack specification.
- Define the dock interface and whether the GPU runs from mains while docked.
