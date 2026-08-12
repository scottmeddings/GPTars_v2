# GP-TARS V2 deployable software stack

This directory contains the runtime stack for GP-TARS V2.

## Deployment model

GP-TARS does **not** run `git pull` from inside application containers. Source code lives in GitHub and GitHub Actions builds immutable container images into GitHub Container Registry (GHCR).

Deployment flow:

```text
Developer pushes to GitHub
        |
        v
GitHub Actions
        |
        +-- build changed service images
        +-- tag images with `main` and commit SHA
        +-- publish to GHCR
        |
        v
GP-TARS Ubuntu host
        |
        +-- Watchtower checks GHCR
        +-- pulls updated images
        +-- restarts only changed containers
```

This gives GP-TARS automatic updates while preserving rollback capability. A previous image can be restored by pinning a commit-SHA tag in `.env` and running `docker compose pull && docker compose up -d`.

## Host baseline

- Ubuntu Server 24.04 LTS
- Docker Engine + Compose plugin
- NVIDIA Linux driver
- NVIDIA Container Toolkit
- RTX 2000 Ada 16 GB available to CUDA-enabled services
- ROS 2 Jazzy services run in their own container boundary
- 64 GB system RAM
- 4 TB primary NVMe

## Services

| Service | Role |
|---|---|
| `tars-core` | orchestration, state machine, behaviour supervisor |
| `tars-api` | REST/WebSocket management API |
| `tars-memory` | PostgreSQL + pgvector persistent memory |
| `tars-llm` | CUDA local LLM inference |
| `tars-stt` | local speech-to-text |
| `tars-tts` | local text-to-speech |
| `tars-vision` | local CUDA vision/perception |
| `tars-display` | upper display / face UI |
| `tars-ros` | ROS 2 Jazzy bridge and robot state |
| `tars-motion` | gait, pose, kinematics and approved trajectory requests |
| `tars-can` | host-side interface to the deterministic MCU |
| `tars-telemetry` | health, logs and metrics aggregation |
| `nats` | application event bus |
| `watchtower` | automatic GHCR image updates |

The safety MCU is **not** a Docker service. It remains an independent real-time safety boundary.

## First deployment

```bash
git clone https://github.com/scottmeddings/GPTars_v2.git
cd GPTars_v2/software/compose
cp .env.example .env
# edit .env and set passwords / image tags

docker compose pull
docker compose up -d
```

## Update behaviour

The default `main` image tag follows the latest successful build from the repository default branch. Watchtower checks for newer images every five minutes.

For a more controlled robot release, set `GPTARS_TAG` to a commit SHA or release tag instead of `main` and disable automatic updating.

## GPU allocation

Only services that actually require CUDA receive GPU access. The initial CUDA services are:

- `tars-llm`
- `tars-stt` when GPU acceleration is enabled
- `tars-vision`

Other services remain CPU-only by default.

## Persistent state

Persistent data stays outside disposable containers:

```text
/opt/gptars/data/postgres
/opt/gptars/data/models
/opt/gptars/data/memory
/opt/gptars/data/recordings
/opt/gptars/data/telemetry
/opt/gptars/config
```

Containers may be replaced without deleting GP-TARS memories, models or robot configuration.

## Safety rule

Automatic software deployment can never directly enable motion. After a motion-related software update, the robot must remain in a non-motion state until health checks pass and the safety supervisor re-establishes its heartbeat with the dedicated MCU.
