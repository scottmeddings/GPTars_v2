# GP-TARS V2 deployment and update architecture

## Goal

A clean Ubuntu Server host should be able to deploy GP-TARS from GitHub with a small, repeatable set of commands. Updates should be delivered from GitHub without SSHing into individual containers or editing running containers by hand.

## Source of truth

GitHub repository:

- `scottmeddings/GPTars_v2`

Runtime artifacts:

- source code: GitHub
- built images: GitHub Container Registry (GHCR)
- deployment definition: `software/compose/docker-compose.yml`
- host configuration: `/opt/gptars/config`
- persistent state: `/opt/gptars/data`

## Update pipeline

```text
GitHub source commit
        |
        v
GitHub Actions
        |
        +-- build service image
        +-- run future tests
        +-- tag :main
        +-- tag :<commit-sha>
        |
        v
GitHub Container Registry
        |
        v
GP-TARS Watchtower service
        |
        +-- detect changed approved images
        +-- pull image
        +-- rolling restart changed service
        +-- remove obsolete image
```

Application containers do not execute `git pull`. They are disposable runtime instances created from immutable images.

## Why this design

This provides:

- one source of truth in GitHub;
- automatic deployment after a successful image build;
- per-service updates rather than restarting the complete robot stack;
- rollback by image tag;
- reproducible builds;
- persistent memories and configuration outside the image;
- clear separation between application updates and safety authority.

## Release modes

### Development mode

Set:

```text
GPTARS_TAG=main
```

Watchtower follows the latest successful `main` image. This is suitable while GP-TARS is being developed on a stand or otherwise unable to move freely.

### Controlled robot mode

Set `GPTARS_TAG` to a release tag or commit SHA and disable automatic updates.

This is preferred once locomotion is enabled. New software is first deployed to a bench/test profile, validated, and then promoted to the robot.

## Motion-update safety

An automatic update must never automatically arm the motors.

After any update affecting `tars-core`, `tars-motion`, `tars-can`, `tars-ros` or the behaviour/safety boundary:

1. motion remains disabled;
2. containers pass health checks;
3. ROS state is valid;
4. the host establishes a valid MCU heartbeat;
5. actuator state and limits are read successfully;
6. an explicit safety-ready state is achieved;
7. only then may the operator or approved startup state machine allow motor enable.

The dedicated MCU remains authoritative regardless of container state.

## GHCR authentication

If GP-TARS packages are private, log the Ubuntu host into GHCR using a GitHub token with the minimum package-read permission required. Docker stores the registry credential in the host Docker configuration used by Compose/Watchtower.

Do not embed GitHub personal access tokens in images or commit them to the repository.

## Persistent directories

Recommended host layout:

```text
/opt/gptars/
├── config/
│   ├── ros/
│   ├── personality/
│   ├── devices/
│   └── secrets/
└── data/
    ├── postgres/
    ├── models/
    ├── memory/
    ├── audio/
    ├── recordings/
    ├── telemetry/
    └── nats/
```

Back up persistent state independently of Docker images.

## Initial deployment

```bash
sudo mkdir -p /opt/gptars/{config,data}
sudo chown -R $USER:$USER /opt/gptars

git clone https://github.com/scottmeddings/GPTars_v2.git
cd GPTars_v2/software/compose
cp .env.example .env
# edit secrets/settings in .env

docker compose pull
docker compose up -d
```

## Validation

Initial deployment is not complete until these pass:

```bash
docker compose ps
docker compose logs --tail=100 tars-core
nvidia-smi
docker run --rm --gpus all nvidia/cuda:13.0.0-base-ubuntu24.04 nvidia-smi
```

Then validate:

- NATS health;
- PostgreSQL/pgvector health;
- local LLM health endpoint;
- API health endpoint;
- display health endpoint;
- STT/TTS audio path;
- camera path;
- ROS 2 discovery;
- CAN adapter visibility;
- MCU heartbeat with motors disabled.

## Rollback

Every GitHub build publishes a commit-SHA image tag. To roll back, set `GPTARS_TAG` to a previously known-good SHA and run:

```bash
docker compose pull
docker compose up -d
```

Persistent user memory and configuration are not rolled back with the image unless a database/schema migration explicitly requires it.

## Future hardening

Before autonomous locomotion, add:

- CI unit/integration tests before GHCR publication;
- staging deployment profile;
- signed release images / provenance verification;
- database migration tooling and backups;
- health-gated update scripts for motion services;
- operator notification after deployment;
- immutable release tags;
- documented disaster-recovery procedure.
