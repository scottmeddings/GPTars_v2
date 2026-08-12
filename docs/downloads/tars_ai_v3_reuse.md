# TARS-AI V3 reuse strategy

GP-TARS V2 uses the TARS-AI Community V3 source as an upstream software reference and selectively adapts the parts that already solve useful interaction problems.

Upstream source:

- https://github.com/TARS-AI-Community/TARS-AI/tree/V3/src

## Reuse matrix

| Upstream area | GP-TARS treatment | Target service |
|---|---|---|
| `character/` | Reuse/adapt heavily | `tars-core` / personality layer |
| `modules/module_character.py` | Reuse concepts and profile loading | `tars-core` |
| `stt/` | Reuse/adapt local speech pipeline | `tars-stt` |
| `tts/` | Reuse/adapt local speech pipeline | `tars-tts` |
| `modules/module_elevenlabs.py` | Optional cloud voice adapter, not required for offline operation | `tars-tts` |
| `modules/module_espeak.py` | Useful fallback voice path | `tars-tts` |
| `modules/module_eyes.py` | Reuse display/eyes behaviour concepts | `tars-display` |
| `modules/module_chatui.py` | Reuse UI interaction concepts where useful | `tars-display` / `tars-api` |
| `memory/initial_memory.json.example` | Import/seed concept only; persistent memory moves to PostgreSQL/pgvector | `tars-memory` |
| `modules/module_hyperdb.py` | Reuse retrieval concepts where useful | `tars-memory` |
| `skills/` | Reuse the skill-registry concept | `tars-core` |
| `modules/module_battery.py` | Adapt to GP-TARS BMS/power telemetry | `tars-telemetry` |
| `modules/module_cputemp.py` | Reuse/adapt compute telemetry | `tars-telemetry` |
| `modules/module_heartbeat.py` | Application-health pattern only | `tars-telemetry` |
| `www/` | Reuse UI ideas selectively | `tars-display` / management UI |
| servo/PCA9685 movement code | Replace | ROS 2 + safety MCU |
| direct hobby-servo sequences | Replace for locomotion | `tars-motion` + ROS actions |

## Important boundary

The TARS-AI application heartbeat is not the GP-TARS safety heartbeat.

GP-TARS requires a deterministic computer-to-MCU watchdog that remains independent of Python, Docker, ROS 2 and the LLM. Application health can influence whether the behaviour supervisor allows motion, but only the safety MCU owns the final motor-enable boundary.

## Character support

TARS-AI V3 already contains character profiles for TARS, CASE, KIPP, PLEX and Bishop. GP-TARS will initially use the TARS profile as a source/reference and extend the runtime personality system with:

- humour percentage
- honesty percentage
- age-aware interaction
- teaching profiles
- per-user preferences
- identity-scoped memory
- household/family policy

## Migration approach

Do not copy the complete V3 application into one monolithic GP-TARS container.

Instead:

1. identify a useful upstream behaviour or module;
2. preserve upstream attribution and licensing requirements;
3. move/adapt it behind a GP-TARS service API;
4. add tests around the behaviour;
5. remove direct dependencies on hobby-servo movement;
6. keep service state outside disposable containers;
7. preserve local-first operation even when optional cloud adapters exist.

This allows GP-TARS to benefit from the community project while keeping its full-scale robot architecture modular, testable and safe.
