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
FRAME_JOINING = "TIG welded"
FRAME_SECTION_RAIL = "20 x 40 x 2.5 wall"
FRAME_SECTION_MEMBER = "20 x 20 x 2.0 wall"
# Welding anneals 6061-T6 locally. Design to the welded allowable, not the
# parent T6 figure: yield falls from about 276 to 145 MPa in the heat-affected
# zone, roughly 47 per cent. The HAZ reaches about 25 mm each side of a weld,
# which on 20 mm members means most of a joint region is affected.
FRAME_PARENT_YIELD_MPA = 276.0
FRAME_WELDED_YIELD_MPA = 145.0
FRAME_HAZ_EXTENT = 25.0
FRAME_FILLER = "4043 or 5356; 5356 for higher joint strength"
FRAME_JIG_REQUIRED = True
BEARING_BORES_MACHINED_AFTER_WELD = True
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

# Selected drive: CubeMars AK45-10 V3.0, two off, at the hips.
ACTUATOR_MODEL = "CubeMars AK45-10 V3.0"
ACTUATOR_COUNT_SELECTED = 2
ACTUATOR_NOMINAL_V = 24.0

# Actuators run at 24 V from a boost stage off the 12.8 V bus. Duty cycle is
# low, so the conversion loss costs little energy, and it recovers the walking
# speed the 12.8 V bus had halved.
ACTUATOR_SUPPLY_VIA_BOOST = True
BOOST_INPUT_V = 12.8
BOOST_OUTPUT_V = 24.0
BOOST_COUNT = 2                  # one per actuator, so a fault takes one leg
BOOST_MODULE_RATING_W = 480.0
BOOST_MODULE_OUTPUT_A = 20.0
BOOST_MODULE_INPUT_A = 41.7      # at full rating, 90% efficiency
BOOST_TOTAL_INPUT_A = 83.3       # both at full rating
BOOST_INGRESS = "IP68"
BOOST_CONTINUOUS_W = 400.0
BOOST_PEAK_W = 800.0
# Dimensions estimated from the module class. Measure before the bay is frozen.
BOOST_MODULE_LENGTH = 128.0
BOOST_MODULE_WIDTH = 98.0
BOOST_MODULE_HEIGHT = 40.0
BOOST_MODULE_MASS_KG = 0.6
BOOST_RAILS_INDEPENDENT = True   # do not parallel outputs without current sharing
BOOST_BULK_CAPACITANCE_REQUIRED = True
BRAKE_CHOPPER_REQUIRED = True
BRAKE_CHOPPER_COUNT = 2          # one per independent 24 V rail
BRAKE_CHOPPER_NOTE = "Gait is a controlled fall; a unidirectional boost gives regeneration no path back"
ACTUATOR_RATED_TORQUE = 2.5
ACTUATOR_PEAK_TORQUE = 7.0
ACTUATOR_INTERNAL_RATIO = 10.0
ACTUATOR_DIAMETER = 53.0
ACTUATOR_LENGTH = 43.0
ACTUATOR_MASS_KG = 0.26

# The actuator alone is far short of the hip requirement, so a second stage
# sits between it and the joint. 32:1 gives 68 N*m after efficiency against
# the 53.3 N*m needed to hold a 20 degree splay at 33 kg, a 28% margin.
# A cycloidal drive changes ratio by lobe and pin count rather than size, so
# this is the same envelope as the 24:1 it replaces.
REDUCTION_STAGE2_RATIO = 32.0
REDUCTION_TOTAL_RATIO = ACTUATOR_INTERNAL_RATIO * REDUCTION_STAGE2_RATIO
REDUCTION_STAGE2_TYPE = "Cycloidal or two-stage planetary; partially backdrivable"
REDUCTION_STAGE2_EFFICIENCY = 0.85
REDUCTION_STAGE2_DIAMETER = 90.0
REDUCTION_STAGE2_LENGTH = 50.0

JOINT_CONTINUOUS_TORQUE = ACTUATOR_RATED_TORQUE * REDUCTION_STAGE2_RATIO
JOINT_PEAK_TORQUE = ACTUATOR_PEAK_TORQUE * REDUCTION_STAGE2_RATIO

# Retained as requirements, not selections.
MAIN_ACTUATOR_CONTINUOUS_TORQUE_MIN = 60.0
MAIN_ACTUATOR_PEAK_TORQUE_INITIAL_MIN = 100.0

# CAN hub for the two actuators. Bench tool: see docs for why it must not
# become the flight motion path.
CAN_HUB_MODEL = "CubeMars Rubik Link V3.0"
CAN_HUB_ROLE = "Bench bring-up only; flight CAN runs from the deterministic MCU"

# Power and clearance
BATTERY_VOLTAGE = 12.8   # 12.8 V LiFePO4 main bus, per docs/design_assumptions.md
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
GPU_MODEL = "NVIDIA RTX 2000 Ada Generation"
GPU_VRAM_GB = 16
GPU_TDP_W = 70.0
GPU_AUX_POWER_CONNECTOR = False
GPU_ORIENTATION = "Vertical, single slot; the 168 mm card length runs up the body"
GPU_LENGTH = 168.0
GPU_HEIGHT = 69.0
GPU_WIDTH = 17.6
GPU_LATERAL_DEMAND = 90.0
GPU_LINK = "OCuLink PCIe 4.0 x4"
GPU_POWER_SOURCE = "Slot power only, 70 W; no separate GPU PSU required"
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
DISPLAY_LOCATION = "Chassis / upper front face, above the hip axis"
DISPLAY_CLASS = "14 inch portrait TFT-LED, 12 V"
DISPLAY_ACTIVE_WIDTH = 174.0
DISPLAY_ACTIVE_HEIGHT = 310.0
DISPLAY_ORIGIN_Y = 655.0
DISPLAY_MARGIN_PER_SIDE = 33.0
DISPLAY_CENTRE_Y = 810.0
UPPER_CHASSIS_ASSUMED_RIGID = True
DISPLAY_DEPTH_RESERVATION = 35.0
# Candidate unit: unbranded 15.4 inch 12 V portable TV, HDMI in, 18 W.
# 360 mm and 28 mm are the listed figures; the 220 mm bezel height is inferred
# and the seller quotes a 10-30 mm measurement tolerance, so all three must be
# measured on the physical unit before the aperture is cut.
DISPLAY_MODULE_WIDTH = 215.0
DISPLAY_MODULE_HEIGHT = 328.0
DISPLAY_MODULE_THICKNESS = 28.0
DISPLAY_MODULE_CLEARANCE_PER_SIDE = 11.3
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
SYSTEM_RAM_GB = 32   # upgradeable to 64 or 128
SYSTEM_RAM_CONFIG = "2 x 16 GB DDR5-5600 SO-DIMM; upgradeable"
GPU_VRAM_MIN_GB = 16
GPU_VRAM_PREFERRED_GB = 24
NVME_SLOTS_AVAILABLE = 3
NVME_SYSTEM_GB = 1000
NVME_DATA_GB = 2000

# Power budget. See docs/power_budget.md for the mode breakdown.
POWER_MODE_SLEEP_W = 8.0
POWER_MODE_ATTENTIVE_W = 39.0
POWER_MODE_CONVERSATION_W = 160.0
POWER_MODE_WALKING_W = 300.0
POWER_PEAK_OVERLAP_W = 460.0
POWER_PEAK_CURRENT_A = 36.0
GPU_POWER_GATED = True
GPU_GATING_METHOD = "Driver runtime suspend; hard isolation only in deep sleep"
BATTERY_USABLE_FRACTION = 0.9
BATTERY_CHEMISTRY = "LiFePO4"
BATTERY_MODEL = "WattCycle 12.8 V 100 Ah Mini LiFePO4"
BATTERY_ENERGY_WH = 1280.0
BATTERY_CAPACITY_AH = 100.0
ACTUATOR_BRAKES_REQUIRED = True

# Frame rails sit against the side panels so the clear span between them can
# take the GPU and mini PC side by side.
FRAME_RAIL_OUTBOARD_X = 118.8
FRAME_CLEAR_SPAN = 197.6

# Gait: compass walker, two rigid limbs on a shared hip axis. No knees.
# See docs/gait.md. Speed is set by joint angular velocity alone, not by
# splay angle, because step length and swing time both scale with it.
GAIT_TYPE = "Compass walker, sagittal plane"
GAIT_DOF = 2
LIMB_RIGID = True
LEG_LENGTH = AXLE_LOWER_MAIN_Y
GAIT_SPLAY_HALF_ANGLE_DEG = 20.0
GAIT_STEP_LENGTH = 418.0
GAIT_SWING_TIME_S = 1.16
GAIT_SPEED_MS = 0.36
JOINT_ANGULAR_VELOCITY_RAD_S = 0.6
# Rocker radius must exceed the centre-of-mass height or the robot is a rocking
# chair: mass above the centre of curvature tips rather than self-rights.
# Clearance is (LEG_LENGTH - R)(1 - cos theta), so a larger radius buys
# stability at the cost of swing clearance. 400 sits just above the estimated
# 381 mm centre of mass.
FOOT_ROCKER_RADIUS = 400.0
CENTRE_OF_MASS_HEIGHT_EST = 381.0
FOOT_HEIGHT = 80.0
FOOT_PAD_THICKNESS = 6.0
FOOT_SHOE_WALL = 3.0
FOOT_SHOE_MATERIAL = "6061-T6 aluminium"
FOOT_PAD_MATERIAL = "Elastomer contact pad, replaceable"
FOOT_SWING_CLEARANCE = 12.7
FOOT_ROCKER_SAGITTA = 21.7

# Charge and support dock. Two hip joints give forward walking only, so the
# robot cannot turn, reverse or align itself: this is a cradle it is placed
# into, not a station it returns to. See docs/power_budget.md.
DOCK_PRESENT = True
DOCK_AUTONOMOUS_DOCKING = False
DOCK_CHARGE_CURRENT_A = 30.0
DOCK_CHARGE_POWER_W = 384.0
DOCK_CHARGE_TIME_H = 3.3
DOCK_CONTACT_TYPE = "Blade or brush, 30 A rated; pogo pins will not carry it"
DOCK_INTERLOCK = "Detect pin closes the contactor only when seated"
DOCK_CONTACT_HEIGHT_Y = 470.0
DOCK_GANTRY_HEIGHT = 1400.0
DOCK_SERVES = "Charging, fall-arrest during motion testing, mains for the GPU"
