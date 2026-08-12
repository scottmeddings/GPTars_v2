# Compute hardware

## Selected mini PC

Model: **MINISFORUM AI X1 Pro-370 barebone**

| Item | Value |
|---|---|
| Processor | AMD Ryzen AI 9 HX370, 12 cores / 24 threads |
| Integrated GPU | AMD Radeon 890M |
| NPU / total AI performance | Up to 80 TOPS total |
| Memory | **64 GB DDR5-5600, 2 × 32 GB SO-DIMM** |
| Primary storage | **4 TB Lexar NQ780 M.2 2280 PCIe 4.0 NVMe** |
| External GPU link | OCuLink PCIe 4.0 x4 |
| Networking | Two 2.5 GbE ports, Wi-Fi 7, Bluetooth 5.4 |

## Compute configuration baseline

- **MINISFORUM AI X1 Pro-370 / Ryzen AI 9 HX370**
- **64 GB DDR5-5600**
- **4 TB Lexar NQ780 PCIe 4.0 NVMe**
- **NVIDIA RTX 2000 Ada 16 GB through OCuLink — planned later-phase accelerator, not required for initial operation**

Phase 1 is explicitly designed to operate without the RTX 2000 Ada. The HX370 runs the local LLM, speech, memory, orchestration and ROS services, while the selected vision camera performs depth and useful neural inference onboard.

## Selected vision and audio sensors

The GP-TARS V2 perception baseline is now locked as:

- **Vision / depth camera: Luxonis OAK-D Pro W — USB version**
- **Connection: USB 3 to the MINISFORUM**
- **Microphone: ReSpeaker USB 4 Mic Array**
- **Location: removable upper display / face cassette**
- **Software ownership: `tars-vision` and `tars-stt` containers**

The **W (wide-FOV) USB model** is intentionally selected instead of the standard OAK-D Pro and instead of the PoE version. The short internal cable run in GP-TARS makes USB simpler than PoE, while the wide field of view is valuable for a mobile robot that should perceive people and obstacles without constantly rotating its body.

### Luxonis OAK-D Pro W USB

The OAK-D Pro W is the primary GP-TARS perception camera. It combines RGB vision, wide-angle stereo depth, onboard AI processing, active IR depth assistance and an integrated IMU in a compact camera module.

The onboard vision processor is particularly important during Phase 1 because GP-TARS will initially operate **without the RTX 2000 Ada installed**. Basic continuous perception should therefore run on the OAK where practical rather than consuming HX370 resources needed by the local LLM and speech stack.

Target uses:

- person detection and tracking
- face/person recognition where explicitly configured
- stereo distance estimation
- obstacle and free-space perception
- object detection and tracking
- gesture and pose detection
- locating/interacting with a person in the room
- navigation and mapping observations
- low-light / IR-assisted depth perception
- structured spatial observations for the TARS agent

The camera should publish structured observations rather than forcing the LLM to inspect continuous raw video.

Example:

```text
PERSON_DETECTED
track_id: 14
position: left
range_m: 1.82
confidence: 0.96
```

### Phase 1 vision architecture

```text
OAK-D PRO W USB
      |
      +-- RGB
      +-- wide stereo depth
      +-- onboard neural inference
      +-- tracking / spatial data
      |
      +-- USB 3
             |
             v
       tars-vision
             |
             +-- structured observations
             +-- ROS 2 / application events
             |
             v
       TARS CORE / BEHAVIOUR

HX370
  +-- Local LLM
  +-- STT / TTS
  +-- Memory
  +-- TARS agent
  +-- ROS 2
  +-- Robot services

RTX 2000 ADA
  +-- ADD LATER for heavier CUDA vision/LLM workloads
```

When the RTX 2000 Ada is added, heavier face, pose, scene-understanding or multimodal models can move to CUDA while the OAK continues providing depth, tracking and efficient always-on perception.

### Camera mounting

- Mount directly above or immediately adjacent to the upper display.
- Preserve the full wide field of view; no bezel or decorative panel may obscure the stereo cameras or IR system.
- Prefer a fixed-focus configuration for vibration robustness where the selected SKU permits.
- Use a short, high-quality USB 3 cable with strain relief.
- If the host USB power budget proves insufficient with IR illumination enabled, provide the camera with the manufacturer-supported external-power/Y-cable arrangement from the regulated accessory supply.
- Final mounting holes and connector cut-outs must be based on the purchased camera or authoritative mechanical drawing.
- Provide at least 10 mm service/cable clearance around connector faces until final CAD is verified.

### ReSpeaker USB 4 Mic Array

The ReSpeaker USB 4 Mic Array remains the preferred initial far-field microphone system.

Required capabilities include four-microphone capture, far-field pickup, beamforming, direction-of-arrival information where available, voice activity detection, noise suppression, acoustic echo cancellation where supported, and standard USB audio operation under Ubuntu Linux.

The microphone array feeds `tars-stt` for wake-word detection, speech capture and local speech-to-text. Direction information can be combined with OAK vision tracking so TARS can associate a voice with a visible person.

### Upper sensor cassette

```text
TOP OF TARS

+--------------------------------+
|       OAK-D PRO W USB           |
|    wide RGB + stereo depth      |
|                                |
|          DISPLAY               |
|      TARS face / status        |
|                                |
|    RESPEAKER 4-MIC ARRAY       |
+--------------------------------+
```

The complete camera/display/microphone assembly should be removable as one service cassette. The microphone array should use compliant/vibration isolation and be kept away from fan exhaust, speakers and actuator vibration paths.

Audio must be validated with fans, speakers and actuators running. The final speech pipeline should support acoustic echo cancellation and barge-in so a person can naturally interrupt TARS while it is speaking.

## Storage allocation

- **Primary M.2:** 4 TB Lexar NQ780 — Ubuntu, Docker, active AI models, databases and applications
- **Second M.2:** reserved for future model/data expansion
- **Third M.2:** reserved for telemetry, logs, recordings, cache or backup workloads

## CAD / vertical layout

```text
TOP OF ROBOT

OAK-D PRO W USB
DISPLAY / FACE
RESPEAKER MICROPHONE ARRAY

MINISFORUM HX370
RTX 2000 ADA + OCuLink DOCK (LATER PHASE)

POWER DISTRIBUTION / CONTROLLERS

12.8 V LiFePO4 BATTERY

LOWER BODY / WALKING STRUCTURE
```

The battery remains low and central. Compute stays near the middle of the body. Display and perception sensors remain high for interaction and field of view.

## Selected robot power architecture

GP-TARS V2 uses a **12.8 V nominal LiFePO4 main battery bus**. The preferred current battery is the WattCycle **12.8 V 100 Ah Mini LiFePO4**, approximately **1,280 Wh** installed energy.

Power domains remain separated:

```text
12.8 V LiFePO4 MAIN BUS
      |
      +-- MOTION CONTACTOR / E-STOP --> motion conversion / actuators
      +-- COMPUTE FUSE --> mini PC power conversion
      +-- FUTURE GPU FUSE --> RTX 2000 Ada / OCuLink dock
      +-- AUX FUSE --> regulated accessory rail --> display/audio/camera/fans
      +-- SAFETY SUPPLY --> safety MCU / contactor supervision
```

The physical E-stop removes actuator power immediately while leaving the safety controller and, where practical, compute/perception powered.

## Thermal and integration requirements

- Do not block mini-PC inlet/exhaust.
- Preserve clear airflow for the future RTX 2000 Ada.
- Cool the 4 TB NVMe for sustained Docker/model/database workloads.
- Keep display heat away from camera and microphone electronics where practical.
- Isolate microphone mounting from structure-borne walking vibration.
- Provide strain relief for OAK USB and ReSpeaker USB cables.
- Do not make the upper sensor cassette a primary structural load path.
