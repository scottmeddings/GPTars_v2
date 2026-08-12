FROM ros:jazzy-ros-base

ENV DEBIAN_FRONTEND=noninteractive \
    ROS_DOMAIN_ID=42 \
    RMW_IMPLEMENTATION=rmw_cyclonedds_cpp

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip \
    python3-colcon-common-extensions \
    ros-jazzy-rmw-cyclonedds-cpp \
    ros-jazzy-ros2-control \
    ros-jazzy-ros2-controllers \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
COPY software/ros2_ws /workspace/ros2_ws

RUN if [ -d /workspace/ros2_ws/src ] && [ "$(find /workspace/ros2_ws/src -mindepth 1 -maxdepth 1 | wc -l)" -gt 0 ]; then \
      . /opt/ros/jazzy/setup.sh && cd /workspace/ros2_ws && colcon build --symlink-install; \
    else \
      mkdir -p /workspace/ros2_ws/src; \
    fi

COPY software/services/ros/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bash", "-lc", "sleep infinity"]
