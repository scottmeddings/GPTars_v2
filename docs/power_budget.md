# Power budget

Status: proposed budget, revision Power V2, 2026-08-11.

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
| 2 — Conversational | GPU powered and model resident, inference bursts, vision active | **~160 W** |
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

### Mode 2 — conversational, ~160 W

| Item | W |
|---|---:|
| External GPU, RTX 2000 Ada at 70 W | 70 |
| Mini PC | 45 |
| Vision and sensors | 12 |
| Display | 12 |
| Safety and brakes | 4 |
| Conversion losses | 17 |

The GPU is the **RTX 2000 Ada**: 16 GB, 70 W, single slot, and with no
auxiliary power connector it runs on slot power alone. That deletes the separate
GPU supply, the 12VHPWR cable bend problem and most of the thermal load. It was
chosen on VRAM per watt rather than throughput: 0.23 GB/W against 0.048 for a
250 W RTX 5070, which also offers only 12 GB and would have put conversational
draw at about 358 W.

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

If conversation and walking must overlap, budget approximately **460 W** and size
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
| 95% synchronous conversion throughout | ~15 W | Design rule |
| Boost the actuator rail to 24 V rather than derating the drive | speed, not watts | Selected |

The brake requirement deserves emphasis. The gait **stands splayed**, so without
power-off brakes the robot burns holding current whenever it is upright, converts
it to heat inside a sealed aluminium body, and does so in the mode it spends most
of its life in.

## Battery and runtime

`docs/design_assumptions.md` sets the main bus at **12.8 V nominal LiFePO4** and
the baseline pack at a **WattCycle 12.8 V 100 Ah Mini**, approximately
**1,280 Wh**. Runtimes assume 90% usable, about 1,152 Wh.

| Mode | Draw | Current at 12.8 V | Runtime |
|---|---:|---:|---:|
| 0 — Deep sleep | 8 W | 0.6 A | **144 h, about 6 days** |
| 1 — Attentive | 39 W | 3.0 A | 29.5 h |
| 2 — Conversational | 160 W | 12.5 A | **7.2 h** |
| 3 — Walking, at 20 kg | 300 W | 23.4 A | 3.8 h |
| 3 — Walking, at 33 kg | ~450 W | 35.2 A | 2.6 h |

Walking draw scales with mass, and the 33 kg figure is the one that matters now
that the battery is selected. At 35 A continuous it consumes most of the 100 A
BMS headroom before the GPU wakes, so conversation and walking together should
be treated as the sizing case, not an edge case.

### The consequence of a 12.8 V bus

Halving the bus voltage doubles every current for the same power. The 460 W
overlap case becomes **36 A** rather than 19 A. That is not fatal, but it
propagates:

- Main feed, fuse, contactor and disconnect must all be rated near 40 A
  continuous, and the cable cross-section rises accordingly.
- Distribution losses scale with the square of current, so the same wiring loses
  four times as much power. Runs must be short and generously sized.
- **Actuator choice narrows**, which is why the drive no longer runs off the bus
  directly. See below.

### Resolved: the actuators run at 24 V

The AK45-10 is 24 V nominal. Run from 12.8 V it delivers roughly half its speed,
which held walking to 0.24 m/s, and the specification's 24–48 V actuator envelope
contradicted the 12.8 V bus outright.

A **boost stage** settles both: 12.8 V distribution, 24 V at the drive. Walking
duty is low, so the conversion loss costs little in energy terms while recovering
the speed the bus had halved.

| Item | Value |
|---|---|
| Input | 12.8 V from the pack |
| Output | 24 V to the actuators only |
| Continuous | 400 W |
| Peak | 800 W, two actuators at peak torque |
| Peak input current | ~69 A at 90% efficiency |

Two requirements come with it.

**Bulk capacitance on the 24 V rail.** Landing transients should come out of
capacitors rather than being pulled through the converter and the BMS. 69 A is
inside a 100 A BMS but leaves little headroom.

**A brake chopper and dump resistor.** This is the one most likely to be missed.
The gait is a *controlled fall*, so the actuators absorb energy on the way down
and act as generators. A boost converter is unidirectional, so that energy has no
path back to the pack: it pumps the 24 V rail up until something trips or fails.
Either fit a chopper across the rail or use a bidirectional converter. A chopper
is cheap and is standard practice on any drive that decelerates a mass.

Mixed duty is more useful than any single mode. At 70% attentive, 20%
conversational and 10% walking the average is about 108 W, giving roughly
**10 hours** of continuous mixed operation.

For a two-day target the robot must spend most of that time in Mode 0. At 90%
sleep and 10% attentive the average is about 11 W, or roughly **four days**. Two
days of *availability* is achievable. Two days of *continuous operation* is not,
and no plausible battery inside this body changes that.

Peak current at the 460 W overlap case is approximately 19 A at 24 V, which is
0.48C on a 40 Ah pack and unremarkable. Wiring, fusing, the contactor and the
connectors must still be rated for it.

## How much battery is actually needed

Sizing from a realistic two-day deployment rather than from continuous operation:

| Activity over two days | Draw | Energy |
|---|---:|---:|
| 43 h asleep | 8 W | 344 Wh |
| 4 h attentive | 39 W | 156 Wh |
| 1 h conversation | 160 W | 160 Wh |
| ~10 min walking | 300 W | 50 Wh |
| **Total** | | **~710 Wh** |

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

### Candidates assessed

| | 12 V 135 Ah LiFePO4 | 24 V 100 Ah LiFePO4 | Target |
|---|---:|---:|---:|
| Energy | 1,620 Wh | 2,560 Wh | ~1,000 Wh |
| Nominal voltage | 12 V | 25.6 V | 24 V |
| Typical mass | 12–16 kg | **20–26 kg** | 4.5–11 kg |
| Typical volume | ~12.4 L | ~12.5 L | 5.4 L bay |
| Verdict | Wrong voltage, too heavy, too large | Correct voltage, far too heavy, too large | — |

The 25.6 V unit fixes the voltage problem: 8S LiFePO4 is the standard
configuration for a 24 V bus and needs no series pairing or boost stage. It then
fails harder on the two constraints that actually bind. At roughly 24 kg it is
the **entire robot budget in one component**, and at about 12.5 litres it is
more than twice the bay.

It is also over-specified for the duty. At the 19 A peak, a 100 Ah pack runs at
0.19C. That discharge capability is paid for in mass and never used.

### The product class is the mistake

Deep-cycle solar, RV and camping packs are engineered for a different problem:
stationary installation where mass is irrelevant, cycle life and cost per watt-
hour dominate, and the discharge rating must suit an inverter drawing hundreds of
amps. They carry heavy cases, large terminals and oversized management
electronics to suit.

A walking robot inverts every one of those priorities. What is needed is a
**purpose-built 24 V pack of roughly 40 Ah**, closer in construction to a light
electric vehicle or power-tool pack than to a leisure battery.

### Volume also decides the chemistry

At pack level LiFePO4 runs about 150–200 Wh/litre against 250–350 for Li-ion
NMC. For a 1,000 Wh pack:

| Chemistry | Mass | Volume | Against the 5.4 L bay |
|---|---:|---:|---|
| Li-ion NMC, 7S from 21700 cells | ~5 kg | ~3.3 L | Comfortable |
| LiFePO4, 8S prismatic | ~9 kg | ~5.6 L | Marginal, bay needs enlarging |

So the safety argument for LiFePO4 costs roughly 4 kg **and** the whole of the
bay's spare volume. It remains a legitimate choice for a machine that falls over
deliberately, but it must be taken deliberately, with the mass budget reopened at
the same time.

### The mass budget will not close on its own

A first tally of known components — 5.7 kg of skin, 3–4 kg of frame, 6–10 kg of
actuators, 2–3 kg of shafts and bearings, 1.5 kg of mini PC, 2–3 kg of GPU and
supply, about 1 kg of display, and 2 kg of wiring and fasteners — reaches roughly
**24–28 kg before any battery at all**.

The 12–25 kg design class in the specification is therefore already at risk
independently of the battery, and adding 5 to 15 kg of cells makes it certain.
This needs resolving as a mass budget exercise, not absorbed silently into the
battery choice.

## The dock

![GP-TARS V2 seated on the charge and support dock](/images/gptars-dock-iso.png)

The dock is a **cradle the robot is placed into, not a station it returns to**.
`docs/gait.md` records why: two hip joints give forward walking in one plane,
with no turning, reversing or self-righting, so the machine cannot find a dock
or align itself to one. Designing for autonomous docking would be designing for
a capability this robot does not have.

Accepting that lets one structure do three jobs.

| Role | Detail |
|---|---|
| Charge | 30 A at 12.8 V is 384 W, about **3.3 hours** from empty |
| Fall arrest | The gantry is the engineered restraint the specification requires before any unrestrained motion test |
| Mains for the GPU | Docked, the RTX 2000 Ada runs from the wall instead of the pack, which is when long inference sessions happen anyway |

### Geometry

Modelled as `17_DOCK`: a base plate, a backboard, port and starboard funnel
guides that centre the robot as it is lowered in, a contact block, and a gantry
of two uprights and a crossbar for the fall-arrest tether. The robot carries a
mating contact plate on its rear panel.

Contacts sit at **Y=470**, above the mini PC service envelope which ends at 455
and below the hip bulkhead which begins at 570. An earlier placement at Y=300
fouled the PC envelope and sat on the compute access panel, which would have
meant removing a service panel disconnected charging.

### Two requirements that are not optional

**Blade or brush contacts, not pogo pins.** Spring pins will not carry 30 A.

**A detect pin must close the contactor only when the robot is seated.** At
12.8 V and 30 A, exposed terminals bridged by a dropped tool or a pet are a fire
risk. This is the same interlock principle as electric vehicle charging, and it
is cheap to implement compared with the consequence of omitting it.

The charge rate is a choice rather than a limit. LiFePO4 tolerates 0.5C, so 50 A
would halve the time to about two hours, at the cost of heavier cable and
contacts. 30 A is the sensible starting point.

Requirements already recorded in the specification still apply: accessible
charging connector, fused main output, manual disconnect, and a battery
management system appropriate to the chemistry.

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
