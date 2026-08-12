# GP-TARS V2 Ubuntu Server build specification

Status: build blueprint, revision Server V1.

This document turns the software architecture into a reproducible host build. It is not yet an install script; it is the checklist and source of truth that the future install script and Ansible/automation should implement.

## Goal

Starting from a blank MINISFORUM AI X1 Pro-370, another person should be able to build the GP-TARS host without relying on undocumented decisions.

Target host:

- MINISFORUM AI X1 Pro-370
- AMD Ryzen AI 9 HX370
- 64 GB DDR5-5600
- 4 TB Lexar NQ780 NVMe
- NVIDIA RTX 2000 Ada 16 GB over OCuLink
- Ubuntu Server 24.04 LTS
- Docker Engine
- NVIDIA Container Toolkit / CUDA
- ROS 2 Jazzy

## Required end state

The completed host must:

1. boot headless without a desktop dependency
2. obtain network connectivity
3. expose only approved management ports
4. detect the RTX 2000 Ada with `nvidia-smi`
5. run a CUDA workload inside Docker
6. run GP-TARS Compose services automatically after boot
7. mount persistent data from stable host directories
8. start the top display service automatically
9. establish the host-to-safety-MCU heartbeat
10. keep motion disabled until safety readiness is confirmed
11. retain local conversation, speech, memory and vision when Internet access is unavailable
12. provide health, logs and diagnostics through the local management interface

## Installation phases

### Phase 1 — firmware and hardware verification

Before installing Ubuntu:

- update X1 Pro firmware/BIOS to an approved stable release
- confirm 64 GB RAM is detected
- confirm 4 TB NVMe is detected
- confirm OCuLink is enabled and RTX 2000 Ada is visible
- disable unnecessary automatic boot options that conflict with unattended robot startup
- record BIOS settings in the repository

### Phase 2 — Ubuntu Server

Install Ubuntu Server 24.04 LTS using a minimal/headless profile.

Baseline decisions:

- hostname: `gptars`
- system timezone: configurable; record deployed timezone
- SSH enabled using key authentication
- no public password SSH login in production
- automatic security updates enabled with a controlled reboot policy
- full disk encryption decision remains open because unattended robot boot and encryption-key handling must be reconciled

Partition/layout target:

```text
/                  OS and packages
/var/lib/docker    Docker images/containers/volumes
/opt/gptars        deployed application/configuration
/srv/gptars        persistent robot data
/srv/gptars/models AI model library
/srv/gptars/db     database storage/backup staging
/srv/gptars/logs   durable robot logs
```

Final filesystem and partition sizes should be set before implementation. A single 4 TB filesystem is acceptable for early development provided backups and Docker growth limits are enforced.

### Phase 3 — base packages

Install and record exact package versions or supported version ranges for:

- Git
- curl/wget
- build-essential
- Python 3 tooling
- chrony or system time synchronisation
- network diagnostic tools
- CAN utilities
- USB/serial utilities
- hardware monitoring tools
- NVMe health tools
- firewall tooling

Do not rely on manually installed packages that are absent from this document or the provisioning scripts.

### Phase 4 — NVIDIA and CUDA

Install an NVIDIA Linux driver supported by the RTX 2000 Ada and Ubuntu 24.04.

Acceptance check:

```bash
nvidia-smi
```

Must report the RTX 2000 Ada without driver errors.

Install NVIDIA Container Toolkit and configure Docker GPU support.

Container acceptance check must run a supported NVIDIA CUDA image and execute `nvidia-smi` inside the container.

CUDA toolkit installation on the host is optional if all CUDA applications run in containers. Prefer container-specific CUDA runtimes to reduce host coupling unless host-side development requires the toolkit.

### Phase 5 — Docker Engine

Install Docker Engine from the supported Docker repository rather than an ad-hoc desktop package.

Configuration requirements:

- Docker starts at boot
- GP-TARS service account has only the permissions it needs
- log rotation configured
- Docker data growth monitored
- NVIDIA runtime available
- restart policies defined in Compose
- container health checks defined for critical services

Primary Compose project:

```text
/opt/gptars/software/compose/docker-compose.yml
```

## GP-TARS container groups

### Core group

- `tars-core`
- `tars-personality`
- `tars-memory`
- `tars-api`
- `tars-telemetry`

### AI group

- `tars-llm`
- `tars-stt`
- `tars-tts`
- `tars-vision`

Only required AI containers receive GPU access.

### User experience group

- `tars-display`
- `tars-web`

### Robot group

- `tars-ros`
- `tars-motion`
- `tars-can`

Robot motion remains unavailable until the safety MCU and behaviour supervisor report ready.

## Container startup dependencies

Logical startup order:

```text
telemetry/database
        |
        v
memory + personality
        |
        v
LLM + STT + TTS + vision
        |
        v
TARS core
        |
        +--> display / web
        |
        +--> ROS 2 bridge
                 |
                 v
        safety MCU heartbeat
                 |
                 v
        motion availability
```

Docker startup order alone must not be treated as proof that a dependency is ready. Use health checks and application-level readiness probes.

## ROS 2 Jazzy

Install ROS 2 Jazzy using the official Ubuntu packages or a controlled container strategy.

Current preference: ROS 2 core host/container arrangement remains to be finalised after CAN and hardware-interface testing.

Required ROS packages will include:

- robot description / URDF tooling
- ros2_control
- controller manager
- joint state broadcaster
- trajectory controllers where appropriate
- diagnostics
- custom GP-TARS message/action packages

DDS implementation and network configuration remain open until latency and container networking are tested.

## Database and memory

Baseline:

- PostgreSQL
- pgvector

Persistent database data must not live only inside an ephemeral container layer.

Required data classes:

- user/person profiles
- personality settings
- permissions
- memory records
- learning progress
- semantic embeddings
- robot maintenance history
- faults and diagnostics references

Backups must be encrypted when they contain personal information.

## Personality and teaching configuration

The server must persist authorised user profiles and personality settings.

Baseline configurable settings:

```text
Humour: 0-100
Honesty/directness: 0-100
Verbosity: low/medium/high
Formality: casual/neutral/formal
Teaching mode: off/opportunistic/active
Age adaptation: automatic/manual
```

The personality service selects an age-appropriate interaction profile after identity resolution. If identity is uncertain it uses the neutral general-audience profile.

Learning progress must be stored separately from general conversational memory so it can be reviewed, reset or deleted independently.

## Networking

Default policy: local-first and deny unnecessary inbound access.

Expected interfaces may include:

- SSH for administration
- local HTTPS management UI
- WebSocket management/telemetry
- ROS 2/DDS internal networking
- NATS or MQTT internal event bus

Exact ports must be documented before firewall rules are frozen.

Cloud APIs are optional enhancements and must not be required for normal local conversation, vision, memory or robot safety.

## Secrets

Secrets must not be committed to GitHub.

Use environment files or a secrets manager for:

- API keys
- database passwords
- encryption keys
- external-service credentials
- administrator bootstrap credentials

Provide `.env.example` files containing names and safe defaults only.

## Display startup

Ubuntu Server remains headless, but the physical TARS display needs a lightweight graphics session.

The display build must define:

- graphics driver
- compositor/window system
- kiosk browser or native renderer
- display resolution/orientation
- auto-login/service strategy where required
- crash restart behaviour
- boot/self-test screen

The display process should be independently restartable without restarting the AI stack.

## Audio

The deployment must enumerate and lock stable audio device names for:

- microphone array
- speakers/amplifier

Container/device permissions must be explicit. Do not rely on whichever ALSA/Pulse/PipeWire device happens to become `default` after a reboot.

## Cameras

Camera devices must use stable udev names or IDs. Record:

- model
- USB path/device ID
- supported resolution/frame rate
- which service owns the camera

Vision should continue in a degraded mode if an optional camera is unavailable.

## CAN and MCU

The Ubuntu host does not directly provide the final safety authority.

Server setup must define:

- CAN interface hardware
- stable interface name, ideally `can0`
- bitrate/CAN-FD settings
- udev/systemd configuration
- host-to-MCU heartbeat protocol
- diagnostics tooling

Loss of host software must cause the MCU to place motion in the defined safe state.

## systemd services

Even though application workloads run in Docker, systemd should supervise host-level dependencies such as:

- CAN interface setup
- display session prerequisites
- GP-TARS Compose project startup
- hardware readiness checks where appropriate

Do not hide important boot dependencies inside shell profile scripts.

## Logging and telemetry

Record at least:

- boot/session ID
- container health/restarts
- CPU/GPU temperatures
- GPU utilisation and VRAM
- RAM usage
- NVMe health/temperature
- battery state
- actuator state/faults
- MCU heartbeat
- software version/commit

Define retention limits so logs cannot fill the 4 TB SSD indefinitely.

## Backup and restore

Back up:

- PostgreSQL data
- user/profile configuration
- personality settings
- learning progress
- calibration
- robot configuration
- selected long-term memories

Do not back up Docker image layers if they can be reproduced from versioned Compose/Dockerfiles.

A restore test is part of release validation.

## Updates

Application updates should be versioned and rollback-capable.

Preferred flow:

```text
pull approved release
build/pull container images
run configuration validation
stop affected services safely
apply database migrations
start new services
run health checks
rollback if acceptance fails
```

Motion must remain disabled during updates that touch ROS, CAN, motion, safety coordination or the behaviour supervisor.

## Security baseline

- SSH keys, not routine password login
- firewall enabled
- minimum exposed ports
- no secrets in Git
- containers run non-root where practical
- minimum device access per container
- GPU access only for required services
- read-only filesystem mounts where practical
- regular security updates
- management UI authentication
- per-user/role permissions

## Validation suite

The automated build is not complete until these tests pass:

### Host

- boot without keyboard/monitor
- network reachable
- correct storage mounted
- system clock valid

### NVIDIA

- `nvidia-smi` succeeds
- CUDA Docker container succeeds

### Docker

- all required containers healthy
- critical containers restart after forced failure
- persistent data survives container recreation

### AI

- local LLM responds
- STT transcribes test audio
- TTS generates speech
- vision receives a camera frame
- memory store/retrieve succeeds
- personality settings alter response style
- teaching profile changes explanation depth appropriately

### Robot boundary

- MCU heartbeat established
- motion remains disabled before readiness
- simulated heartbeat loss disables motion
- E-stop state is visible to host software

### Offline

Disconnect Internet access and verify local wake word, STT, LLM, memory, TTS, display and local management continue operating.

## Automation target

The eventual production build should be reproducible through a combination of:

- one documented Ubuntu installation baseline
- provisioning script or Ansible playbook
- versioned Dockerfiles
- versioned Compose files
- versioned configuration templates
- automated acceptance tests

The goal is that rebuilding the GP-TARS computer becomes a controlled deployment task rather than a one-off workshop setup.
