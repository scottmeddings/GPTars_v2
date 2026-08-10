# GP-TARS V2 software architecture

Status: proposed architecture, revision Software V1, 2026-08-10.

## Core decision

Use TARS-AI V3 for character, speech, memory, vision and user interfaces. Replace its hobby-servo motion layer with a ROS 2 control stack and a separate real-time safety/motion controller.

The operating principle is:

> TARS-AI supplies the character. ROS 2 supplies the robot. A dedicated MCU supplies deterministic motion and safety.

## Layered system

1. **Independent safety:** hardwired E-stop loop, motor contactor, power isolation and hard limits.
2. **Real-time motion:** dedicated MCU connected by CAN/CAN-FD; encoder monitoring, actuator commands, brakes, joint limits, watchdog and safe stop.
3. **Robot control:** ROS 2 Jazzy on Ubuntu 24.04 LTS; URDF/Xacro model, ros2_control hardware interface, trajectories, state estimation and diagnostics.
4. **Behaviour supervisor:** validates high-level intent against mode, robot state, balance, limits, active faults and operator permission.
5. **TARS-AI experience:** personality, wake word, STT, TTS, memory/RAG, vision, dashboard and skills.

The MINISFORUM AI X1 Pro runs the non-real-time layers. It must not perform motor commutation or be the only path to a safe shutdown.

## Community software reuse

| Subsystem | Decision | Treatment |
|---|---|---|
| Character/persona system | Reuse | Preserve TARS character and response behaviour |
| Wake word, STT and barge-in | Reuse | Retain modular speech pipeline |
| Piper TTS | Reuse | Local, low-latency speech |
| Memory/RAG and message router | Reuse | Place behind stable service boundaries |
| Vision and web dashboard | Adapt | Run heavy work on the mini PC and external GPU |
| Movement skill registry | Adapt | Emit restricted ROS actions only |
| PCA9685 servo controller | Replace | Not suitable for full-scale walking loads |
| Threaded direct movement calls | Replace | Use supervised, cancellable and monitored trajectories |

Primary references:

- TARS-AI V3: https://github.com/TARS-AI-Community/TARS-AI
- Original GPTARS Interstellar project: https://github.com/poboisvert/GPTARS_Interstellar
- ROS 2 interfaces: https://docs.ros.org/en/jazzy/How-To-Guides/Topics-Services-Actions.html
- ros2_control joint trajectory controller: https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/userdoc.html
- llama.cpp: https://github.com/ggml-org/llama.cpp

## Operating stack

| Layer | Selection |
|---|---|
| Host OS | Ubuntu 24.04 LTS |
| Robot framework | ROS 2 Jazzy |
| Motion framework | ros2_control with a custom CAN hardware interface |
| LLM runtime | CUDA-enabled llama.cpp server with an OpenAI-style API |
| Real-time layer | Dedicated MCU with CAN/CAN-FD and watchdog |
| Simulation | URDF/Xacro plus ROS 2 mock hardware; dynamic simulation to follow |

## LLM command boundary

The LLM may request only named high-level actions, for example:

```text
perform_gesture("wave_right")
walk_relative(distance=0.30, speed=0.05)
turn_relative(angle_degrees=15)
stop_motion()
return_to_neutral()
```

The LLM must never receive an interface for raw PWM, motor current, direct torque, unchecked joint angles, disabled limits or safety bypass.

The behaviour supervisor must approve every motion request. ROS actions provide execution feedback and cancellation. The real-time MCU independently rejects stale, malformed or out-of-limit commands.

## Proposed repository structure

```text
software/
├── ros2_ws/src/
│   ├── gptars_description/
│   ├── gptars_interfaces/
│   ├── gptars_hardware/
│   ├── gptars_control/
│   ├── gptars_safety/
│   ├── gptars_behaviors/
│   ├── gptars_state/
│   └── tars_ai_bridge/
├── firmware/
│   └── motion_controller/
├── simulation/
├── ai/
├── dashboard/
├── config/
└── tests/
```

## ROS communication model

- **Topics:** continuous joint state, IMU, temperature, battery, fault and diagnostic streams.
- **Services:** short request/response operations such as reading configuration, entering maintenance mode or requesting an approved fault reset.
- **Actions:** cancellable walking, turning, homing, recovery and gesture sequences with progress feedback and results.
- **Hardwired:** E-stop, motor contactor and final power removal remain independent of ROS and the LLM.

## Development sequence

1. Create URDF/Xacro from the verified Fusion joint layout and run all joints with mock hardware.
2. Implement the MCU/CAN protocol and test a single restrained actuator with encoder feedback, limits and watchdog.
3. Add the safety supervisor, E-stop state, contactor control, faults and deterministic safe stopping.
4. Run neutral poses and gestures while the robot is supported by an independent fall-arrest fixture.
5. Develop monitored step, turn, stop and recovery actions before enabling voice motion.
6. Connect TARS-AI personality, speech, memory and vision through the restricted behaviour bridge.
7. Run the local LLM server on the external NVIDIA GPU and measure latency, VRAM, heat and electrical load.

## Safety release gate

Voice- or LLM-triggered movement remains disabled until the physical E-stop, contactor removal, communications watchdog, joint limits, fault handling and restrained trajectory tests have all passed.
