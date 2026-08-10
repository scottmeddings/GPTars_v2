"""Master parameters for GP-TARS V2 1000.

All linear dimensions are millimetres, torque values are N*m, and voltage is V.
Values marked as placeholders must not be used to release production hardware.
"""

PROJECT_NAME = "GP-TARS V2 1000"

# External reference
ROBOT_HEIGHT = 1000.0
SOURCE_HEIGHT_MEASURED = 250.3969610849432
SOURCE_WIDTH_MEASURED = 240.06000000001737
SOURCE_DEPTH_MEASURED = 65.070011622468
REFERENCE_SCALE_MEASURED = ROBOT_HEIGHT / SOURCE_HEIGHT_MEASURED
ROBOT_WIDTH_REFERENCE = SOURCE_WIDTH_MEASURED * REFERENCE_SCALE_MEASURED
ROBOT_DEPTH_REFERENCE = SOURCE_DEPTH_MEASURED * REFERENCE_SCALE_MEASURED

# Aluminium exterior. Thin formed sheet replaces printed cosmetic panels.
SHELL_WALL = 1.2
SHELL_WALL_MIN = 1.0
SHELL_WALL_MAX = 1.6
SHELL_MATERIAL = "5052-H32 aluminium sheet"
PANEL_EDGE_RETURN = 15.0
PANEL_LOCAL_DOUBLER = 2.0

# Structure
FRAME_PROFILE_SMALL = 20.0
FRAME_PROFILE_LARGE_X = 20.0
FRAME_PROFILE_LARGE_Y = 40.0
STRUCTURAL_MATERIAL = "6061-T6 aluminium"
FRAME_MATERIAL = "6061-T6 aluminium"
JOINT_BULKHEAD_MATERIAL = "6061-T6 aluminium plate"
JOINT_BULKHEAD_THICKNESS = 8.0
ACTUATOR_BRACKET_THICKNESS = 8.0
BATTERY_TRAY_MATERIAL = "5052-H32 aluminium sheet"
BATTERY_TRAY_THICKNESS = 3.0
ELECTRONICS_TRAY_MATERIAL = "5052-H32 aluminium sheet"
ELECTRONICS_TRAY_THICKNESS = 2.0

# Shafts and bearings
MAIN_SHAFT_DIAMETER = 20.0
SECONDARY_SHAFT_DIAMETER = 12.0

# Actuator design targets. Do not freeze until load cases are calculated.
MAIN_ACTUATOR_DIAMETER_MIN = 80.0
MAIN_ACTUATOR_DIAMETER_MAX = 120.0
MAIN_ACTUATOR_LENGTH_MIN = 50.0
MAIN_ACTUATOR_LENGTH_MAX = 100.0
MAIN_ACTUATOR_CONTINUOUS_TORQUE_MIN = 60.0
MAIN_ACTUATOR_PEAK_TORQUE_INITIAL_MIN = 100.0
SECONDARY_ACTUATOR_TORQUE_MIN = 10.0
SECONDARY_ACTUATOR_TORQUE_MAX = 25.0

# Power and clearance
BATTERY_VOLTAGE = 24.0
GROUND_CLEARANCE_MIN = 10.0
GROUND_CLEARANCE_MAX = 25.0

# Installed compute: MINISFORUM AI X1 Pro-370, mounted vertically.
MINI_PC_MODEL = "MINISFORUM AI X1 Pro-370"
MINI_PC_WIDTH = 195.0
MINI_PC_HEIGHT = 195.0
MINI_PC_DEPTH = 47.5
MINI_PC_MASS_KG = 1.5
MINI_PC_ORIENTATION = "Edge-on; board plane parallel to the side panels"
MINI_PC_KEEP_OUT_WIDTH = 100.0
MINI_PC_KEEP_OUT_HEIGHT = 225.0
MINI_PC_KEEP_OUT_DEPTH = 210.0
MINI_PC_POWER_INTERNAL_W = 134.9
MINI_PC_USB4_PD_INPUT_W = 100.0
MINI_PC_USB4_PD_INPUT_V = 20.0

# Required external LLM accelerator. Dimensions remain placeholders until the
# exact GPU, cooler and power supply are selected.
GPU_REQUIRED = True
GPU_ROLE = "Local LLM inference"
GPU_VENDOR_TARGET = "NVIDIA"
GPU_ORIENTATION = "Vertical; the 300 mm card length runs up the body"
GPU_LENGTH = 300.0
GPU_HEIGHT = 130.0
GPU_WIDTH = 60.0
GPU_LATERAL_DEMAND = 130.0
GPU_LINK = "OCuLink PCIe 4.0 x4"
GPU_POWER_SOURCE = "Independent protected supply; TBD"
GPU_PSU_ENVELOPE = None

BATTERY_WIDTH = 200.0
BATTERY_HEIGHT = 150.0
BATTERY_DEPTH = 180.0

# Actuator placeholders, one hip and one knee module per side.
ACTUATOR_HIP_PLACEHOLDER_DIAMETER = 120.0
ACTUATOR_HIP_PLACEHOLDER_LENGTH = 100.0
ACTUATOR_KNEE_PLACEHOLDER_DIAMETER = 70.0
ACTUATOR_KNEE_PLACEHOLDER_LENGTH = 70.0

# Cooling reservation options
FAN_SIZES = (80.0, 92.0, 120.0)

# Reconstructed articulation axes.
# Source axis heights are measured in the imported STEP, whose base sits at
# SOURCE_Y_MIN. Height above ground is (Y_source - SOURCE_Y_MIN), then scaled.
# These agree with the axis positions recorded in docs/interference_report.md.
SOURCE_Y_MIN = -10.366961
AXLE_LOWER_MAIN_HEIGHT_SOURCE = 152.951961
AXLE_LOWER_SECONDARY_HEIGHT_SOURCE = 196.826961
AXLE_UPPER_MAIN_HEIGHT_SOURCE = 209.826961
AXLE_UPPER_SECONDARY_HEIGHT_SOURCE = 222.826961

AXLE_LOWER_MAIN_Y = AXLE_LOWER_MAIN_HEIGHT_SOURCE * REFERENCE_SCALE_MEASURED
AXLE_LOWER_SECONDARY_Y = AXLE_LOWER_SECONDARY_HEIGHT_SOURCE * REFERENCE_SCALE_MEASURED
AXLE_UPPER_MAIN_Y = AXLE_UPPER_MAIN_HEIGHT_SOURCE * REFERENCE_SCALE_MEASURED
AXLE_UPPER_SECONDARY_Y = AXLE_UPPER_SECONDARY_HEIGHT_SOURCE * REFERENCE_SCALE_MEASURED

# Body width. The scaled source gives 958.718 mm, but that is a faithful copy of
# the hobby model rather than the screen silhouette, which reads at roughly
# 0.45 x height. The build width is a deliberate departure, set as four equal
# slabs and floored by the 195 mm mini PC. Depth is unchanged.
ROBOT_WIDTH_SOURCE_SCALED = 958.718
ROBOT_WIDTH = 480.0
SLAB_COUNT = 4
SLAB_WIDTH = 120.0
CENTRAL_CHASSIS_WIDTH = 240.0

# Superseded, retained as the source reference only.
CENTRAL_CHASSIS_WIDTH_SOURCE = 133.232
CENTRAL_CHASSIS_WIDTH_SCALED = CENTRAL_CHASSIS_WIDTH_SOURCE * REFERENCE_SCALE_MEASURED

# Upper Lid front face, the only rigid section above the top articulation axis.
UPPER_LID_FRONT_WIDTH = CENTRAL_CHASSIS_WIDTH
UPPER_LID_FRONT_HEIGHT = ROBOT_HEIGHT - AXLE_UPPER_SECONDARY_Y

# Limb articulation. The reference gait shows two rotational degrees of freedom
# per outer slab: a hip at the lower main axis and a knee roughly mid-limb.
# The knee ratio is a design choice and is not taken from the source geometry.
ARM_KNEE_RATIO = 0.5
AXLE_KNEE_Y = AXLE_LOWER_MAIN_Y * ARM_KNEE_RATIO
ARM_CLEARANCE = 4.0
ARM_JOINT_GAP = 2.0
ARM_SLAB_WIDTH = 116.0

# Onboard display, on the main front face of the lower chassis rather than the
# Upper Lid. The lid offers only 110 mm of height; the front face below the hip
# axis offers roughly 600 mm, which admits a full portrait panel.
DISPLAY_PRESENT = True
DISPLAY_LOCATION = "Chassis / front face, below the lower main axis"
DISPLAY_CLASS = "15.4 inch portrait TFT-LED, 12 V"
DISPLAY_ACTIVE_WIDTH = 194.0
DISPLAY_ACTIVE_HEIGHT = 345.0
DISPLAY_ORIGIN_Y = 130.0
DISPLAY_MARGIN_PER_SIDE = 23.0
DISPLAY_DEPTH_RESERVATION = 35.0
# Candidate unit: unbranded 15.4 inch 12 V portable TV, HDMI in, 18 W.
# 360 mm and 28 mm are the listed figures; the 220 mm bezel height is inferred
# and the seller quotes a 10-30 mm measurement tolerance, so all three must be
# measured on the physical unit before the aperture is cut.
DISPLAY_MODULE_WIDTH = 220.0
DISPLAY_MODULE_HEIGHT = 360.0
DISPLAY_MODULE_THICKNESS = 28.0
DISPLAY_MODULE_CLEARANCE_PER_SIDE = 8.8
DISPLAY_MODULE_TOLERANCE_STATED = 30.0
DISPLAY_STACK_DEPTH = 33.2
DISPLAY_SUPPLY_V = 12.0
DISPLAY_POWER_W = 18.0
DISPLAY_AUDIO_W = 2.0
DISPLAY_SPEAKERS = "Two 32 mm, driven over HDMI audio"
DISPLAY_COVER_THICKNESS = 2.0
DISPLAY_DOUBLER_THICKNESS = 2.0
DISPLAY_INTERFACE = "HDMI from the mini PC; both sit in the lower chassis"
DISPLAY_COVER_MATERIAL = "Chemically strengthened glass or bonded polycarbonate"
DISPLAY_MASS_ESTIMATE_KG = 0.8
DISPLAY_LINK = "Direct HDMI from the mini PC; nothing crosses a moving joint"
PANEL_HIP_BREAK_GAP = 6.0

# Compute stack. Units here are GB and counts, not millimetres.
HOST_OS = "Ubuntu 24.04 LTS"
ROS_DISTRO = "Jazzy"
CONTAINER_COUNT = 11
SYSTEM_RAM_GB = 64
SYSTEM_RAM_CONFIG = "2 x 32 GB DDR5-5600 SO-DIMM"
GPU_VRAM_MIN_GB = 16
GPU_VRAM_PREFERRED_GB = 24
NVME_SLOTS_AVAILABLE = 3
NVME_SYSTEM_GB = 1000
NVME_DATA_GB = 2000
