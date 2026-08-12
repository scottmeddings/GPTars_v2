"""Rebuild the GP-TARS V2 assembly from cad/parameters.py.

Run inside Fusion 360. Creates a new design document and generates the whole
model, so the assembly is reproducible rather than a hand-built artifact that
lives or dies with an editing session.

    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "build_model", "/Users/scott/Documents/GPtars/cad/build_model.py")
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    result = m.build(app)

The live document is `GPTars_v4` (90 bodies, 480 x 1000 x 259.9 mm), exported to
`cad/output/GP_TARS_V2_R10.f3d`. Verify the name, body count and extent before
editing or exporting: the archive export takes the ACTIVE document.

Geometry is form and packaging only. No fastener patterns, formed returns,
beads, bearings or joint hardware, and nothing here is releasable.
"""

import importlib.util
import os

import adsk.core
import adsk.fusion

HERE = os.path.dirname(os.path.abspath(__file__))


def load_parameters():
    spec = importlib.util.spec_from_file_location("parameters", os.path.join(HERE, "parameters.py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class Builder:
    """Thin wrapper over TemporaryBRepManager. All inputs are millimetres."""

    def __init__(self, root):
        self.root = root
        self.tbm = adsk.fusion.TemporaryBRepManager.get()
        self._components = {}

    def box(self, x0, y0, z0, dx, dy, dz):
        centre = adsk.core.Point3D.create((x0 + dx / 2) * 0.1, (y0 + dy / 2) * 0.1, (z0 + dz / 2) * 0.1)
        obb = adsk.core.OrientedBoundingBox3D.create(
            centre, adsk.core.Vector3D.create(1, 0, 0), adsk.core.Vector3D.create(0, 1, 0),
            dx * 0.1, dy * 0.1, dz * 0.1)
        return self.tbm.createBox(obb)

    def cyl_x(self, x1, x2, r, y, z=0.0):
        """Cylinder with its axis along X, which is every joint axis on this robot."""
        return self.tbm.createCylinderOrCone(
            adsk.core.Point3D.create(x1 * 0.1, y * 0.1, z * 0.1), r * 0.1,
            adsk.core.Point3D.create(x2 * 0.1, y * 0.1, z * 0.1), r * 0.1)

    def cut(self, target, tool):
        self.tbm.booleanOperation(target, tool, adsk.fusion.BooleanTypes.DifferenceBooleanType)
        return target

    def intersect(self, target, tool):
        self.tbm.booleanOperation(target, tool, adsk.fusion.BooleanTypes.IntersectionBooleanType)
        return target

    def copy(self, body):
        return self.tbm.copy(body)

    def shell(self, x0, y0, z0, dx, dy, dz, t):
        return self.cut(self.box(x0, y0, z0, dx, dy, dz),
                        self.box(x0 + t, y0 + t, z0 + t, dx - 2 * t, dy - 2 * t, dz - 2 * t))

    def tube(self, x0, y0, z0, dx, dy, dz, wall, axis):
        """Hollow section approximating T-slot extrusion.

        Modelling profile as solid bar overstates frame mass by roughly three
        times. A rectangular tube of the right wall thickness lands within a
        few percent of real 20x40 and 20x20 profile, which keeps the mass
        budget honest without modelling every slot.
        """
        outer = self.box(x0, y0, z0, dx, dy, dz)
        if axis == "x":
            inner = self.box(x0 - 1, y0 + wall, z0 + wall, dx + 2, dy - 2 * wall, dz - 2 * wall)
        elif axis == "y":
            inner = self.box(x0 + wall, y0 - 1, z0 + wall, dx - 2 * wall, dy + 2, dz - 2 * wall)
        else:
            inner = self.box(x0 + wall, y0 + wall, z0 - 1, dx - 2 * wall, dy - 2 * wall, dz + 2)
        return self.cut(outer, inner)

    def component(self, name):
        if name not in self._components:
            occ = self.root.occurrences.addNewComponent(adsk.core.Matrix3D.create())
            occ.component.name = name
            self._components[name] = occ.component
        return self._components[name]

    def add(self, component_name, body, body_name):
        comp = self.component(component_name)
        feature = comp.features.baseFeatures.add()
        feature.startEdit()
        comp.bRepBodies.add(body, feature)
        feature.finishEdit()
        comp.bRepBodies.item(comp.bRepBodies.count - 1).name = body_name


def build(app, document=None):
    p = load_parameters()

    if document is None:
        document = app.documents.add(adsk.core.DocumentTypes.FusionDesignDocumentType)
    design = adsk.fusion.Design.cast(document.products.itemByProductType("DesignProductType"))
    b = Builder(design.rootComponent)

    # ---- derived working dimensions -------------------------------------
    H = p.ROBOT_HEIGHT
    HW = p.ROBOT_WIDTH / 2                     # 240
    CHW = p.CENTRAL_CHASSIS_WIDTH / 2          # 120
    HD = p.ROBOT_DEPTH_REFERENCE / 2           # 129.934
    T = p.SHELL_WALL
    GAP = 1.5
    HIP = p.AXLE_LOWER_MAIN_Y
    HIP_GAP = p.PANEL_HIP_BREAK_GAP
    LOW_TOP, UPP_BOT = HIP - HIP_GAP / 2, HIP + HIP_GAP / 2
    PANEL_IN = HD - T
    RAIL_X, RAIL_W = p.FRAME_RAIL_OUTBOARD_X - 20.0, 20.0   # 98.8
    BH_Y0, BH_Y1 = 570.0, 652.0
    CGC = p.CHASSIS_GROUND_CLEARANCE          # body underside clears the floor
    ARM_IN = CHW + p.ARM_CLEARANCE
    ARM_W = HW - ARM_IN

    # ---- 00 reference ---------------------------------------------------
    b.add("00_MASTER_REFERENCE", b.box(-HW, 0, -HD, HW * 2, H, HD * 2), "EXTERNAL_REFERENCE_ENVELOPE")
    b.add("00_MASTER_REFERENCE", b.box(-CHW, 0, -HD, CHW * 2, H, HD * 2), "CENTRAL_CHASSIS_REFERENCE")

    # ---- 01 frame: rails terminate into the hip bulkheads ---------------
    # 20x40 profile at 2.5 mm wall lands near 0.74 kg/m; 20x20 at 2.0 mm near
    # 0.39 kg/m. Both match commercial extrusion closely enough to budget from.
    for i, x0 in ((0, -RAIL_X - RAIL_W), (1, RAIL_X)):
        for j, z0 in ((0, -85.0), (1, 45.0)):
            b.add("01_FRAME", b.tube(x0, 30.0, z0, RAIL_W, BH_Y0 - 30.0, 40.0, 2.5, "y"),
                  f"RAIL_LOWER_{i}_{j}")
            b.add("01_FRAME", b.tube(x0, BH_Y1, z0, RAIL_W, 950.0 - BH_Y1, 40.0, 2.5, "y"),
                  f"RAIL_UPPER_{i}_{j}")
    for k, fy in enumerate((30.0, 205.0, 480.0, 660.0, 930.0)):
        for label, fz in (("FRONT", 65.0), ("REAR", -85.0)):
            b.add("01_FRAME", b.tube(-RAIL_X, fy, fz, RAIL_X * 2, 20.0, 20.0, 2.0, "x"),
                  f"CROSS_{k}_{label}")
        for label, fx in (("PORT", -RAIL_X - RAIL_W), ("STBD", RAIL_X)):
            b.add("01_FRAME", b.tube(fx, fy, -85.0, RAIL_W, 20.0, 170.0, 2.0, "z"),
                  f"DEPTH_{k}_{label}")

    # ---- 02 joints: machined bulkhead carries the bearing and the drive --
    # Pocketed and bored, as a machined part would be, rather than solid billet.
    for side, x0 in (("PORT", -RAIL_X - RAIL_W), ("STARBOARD", RAIL_X)):
        bulkhead = b.box(x0, BH_Y0, -85.0, RAIL_W, BH_Y1 - BH_Y0, 170.0)
        bulkhead = b.cut(bulkhead, b.cyl_x(x0 - 1, x0 + RAIL_W + 1, 21.0, HIP))   # bearing bore
        for z_pocket in (-80.0, 45.0):
            bulkhead = b.cut(bulkhead, b.box(x0 + 5, BH_Y0 + 8, z_pocket, 10.0,
                                             (BH_Y1 - BH_Y0) - 16, 35.0))
        b.add("02_JOINTS", bulkhead, f"HIP_BULKHEAD_{side}")

    # ---- 03 drive, 04 shafts, outer carriers ----------------------------
    for side, s in (("PORT", -1.0), ("STARBOARD", 1.0)):
        def span(a, c):
            return (s * c, s * a) if s < 0 else (a, c)
        a1, a2 = span(5.0, 5.0 + p.ACTUATOR_LENGTH)
        b.add("03_ACTUATORS", b.cyl_x(a1, a2, p.ACTUATOR_DIAMETER / 2, HIP), f"ACTUATOR_HIP_{side}_AK45_10")
        r1, r2 = span(48.0, 48.0 + p.REDUCTION_STAGE2_LENGTH)
        b.add("03_ACTUATORS", b.cyl_x(r1, r2, p.REDUCTION_STAGE2_DIAMETER / 2, HIP),
              f"REDUCTION_HIP_{side}_{int(p.REDUCTION_STAGE2_RATIO)}TO1")
        s1, s2 = span(96.0, 148.0)
        b.add("04_BEARINGS_SHAFTS", b.cyl_x(s1, s2, p.MAIN_SHAFT_DIAMETER / 2, HIP), f"SHAFT_HIP_{side}_D20")
        o1, o2 = span(130.0, 138.0)
        b.add("02_JOINTS", b.box(min(o1, o2), HIP - 55, -55.0, 8.0, 110.0, 110.0),
              f"BEARING_CARRIER_HIP_{side}_OUTER")

    # ---- equipment reservations ----------------------------------------
    b.add("05_BATTERY", b.box(-95.0, 55.0, -105.0, 190.0, 150.0, 210.0), "BATTERY_KEEP_OUT")
    b.add("06_COMPUTE", b.box(5.0, 230.0, -PANEL_IN, 85.0, 225.0, 210.0),
          "MINISFORUM_AI_X1_PRO_SERVICE_KEEP_OUT")
    b.add("06_COMPUTE", b.box(23.0, 245.0, -121.0, p.MINI_PC_DEPTH, p.MINI_PC_HEIGHT, p.MINI_PC_WIDTH),
          "MINISFORUM_AI_X1_PRO_BODY")
    b.add("07_GPU", b.box(-93.0, 220.0, -5.0, 90.0, 200.0, 50.0), "GPU_KEEP_OUT")
    b.add("07_GPU", b.box(-84.0, 235.0, 3.0, 72.0, 170.0, 20.0), "GPU_CARD_RTX_2000_ADA")
    b.add("08_ELECTRONICS", b.box(-35.0, 700.0, -HD, 70.0, 70.0, 50.0), "E_STOP_KEEP_OUT")
    b.add("08_ELECTRONICS", b.box(-45.0, 505.0, -100.0, 90.0, 70.0, 30.0), "RUBIK_LINK_V3_KEEP_OUT")
    # Two 12.8 to 24 V boost modules, one per actuator, stacked in the band
    # between the mini PC and the hip bulkhead. 128 mm each will not sit side by
    # side inside the 197.6 mm clear span.
    for i, by in enumerate((460.0, 510.0)):
        b.add("08_ELECTRONICS",
              b.box(-p.BOOST_MODULE_LENGTH / 2, by, -p.BOOST_MODULE_WIDTH / 2,
                    p.BOOST_MODULE_LENGTH, p.BOOST_MODULE_HEIGHT, p.BOOST_MODULE_WIDTH),
              f"BOOST_CONVERTER_{i}_24V_480W")
    b.add("10_SENSORS", b.box(-60.0, 290.0, 55.0, 40.0, 25.0, 40.0), "IMU_KEEP_OUT")

    # ---- 10 sensors: head cassette, ranging, ground contact ---------------
    # The specification asks for reserved provisions on replaceable plates
    # rather than chosen parts, so these are keep-out volumes. Sizes accept the
    # candidates named in cad/parameters.py.
    #
    # One RGB-D bar covers both the "front RGB camera" and "depth camera" the
    # specification lists separately; a second RGB head would duplicate a sensor
    # this module already carries.
    CAM_H, CAM_W, CAM_D = (p.CAMERA_HEIGHT_RESERVATION, p.CAMERA_WIDTH_RESERVATION,
                           p.CAMERA_DEPTH_RESERVATION)
    CAM_Y0 = p.CAMERA_CENTRE_Y - CAM_H / 2
    CAM_Z1 = PANEL_IN - 2.7                    # clear of the aperture doubler
    CAM_Z0 = CAM_Z1 - CAM_D
    b.add("10_SENSORS", b.box(-CAM_W / 2, CAM_Y0, CAM_Z0, CAM_W, CAM_H, CAM_D),
          "CAMERA_OAK_D_PRO_W_KEEP_OUT")

    # Microphones sit behind the camera and port up through the lid, which keeps
    # them off the display's heat and away from the front panel's drum surface.
    MIC_Z0 = p.MIC_LID_Z0
    MIC_Y0 = (H - T) - p.MIC_DEPTH_RESERVATION
    b.add("10_SENSORS", b.box(-p.MIC_WIDTH_RESERVATION / 2, MIC_Y0, MIC_Z0,
                              p.MIC_WIDTH_RESERVATION, p.MIC_DEPTH_RESERVATION,
                              p.MIC_HEIGHT_RESERVATION),
          "MIC_RESPEAKER_XVF3800_KEEP_OUT")

    # Both come out together as one service cassette, so they share a plate.
    # Starts at 951 rather than backing the whole camera: the front crossmember
    # at Y=930-950 occupies the space behind the camera's lower edge.
    b.add("10_SENSORS", b.box(-CAM_W / 2 - 5.0, CAM_Y0 + 6.0,
                              CAM_Z0 - 5.0 - p.SENSOR_PLATE_THICKNESS,
                              CAM_W + 10.0, CAM_H, p.SENSOR_PLATE_THICKNESS),
          "SENSOR_CASSETTE_PLATE")

    # Time-of-flight pair, below the camera's field of view, watching for step
    # edges and near obstacles the gait state machine has to stop for.
    for side, sx in (("PORT", -p.TOF_SPACING_X / 2), ("STARBOARD", p.TOF_SPACING_X / 2)):
        b.add("10_SENSORS",
              b.box(sx - p.TOF_MODULE_SIZE / 2, p.TOF_CENTRE_Y - p.TOF_MODULE_SIZE / 2,
                    PANEL_IN - p.TOF_MODULE_DEPTH,
                    p.TOF_MODULE_SIZE, p.TOF_MODULE_SIZE, p.TOF_MODULE_DEPTH),
              f"TOF_{side}_KEEP_OUT")

    # Optional LiDAR. Only the mounting pad is modelled: a 360 degree scanner has
    # to sit proud of the lid, and modelling the unit itself would silently push
    # the recorded envelope past 1000 mm. Fitted height is LIDAR_FITTED_HEIGHT_Y.
    b.add("10_SENSORS", b.box(-40.0, (H - T) - p.SENSOR_PLATE_THICKNESS, -80.0,
                              80.0, p.SENSOR_PLATE_THICKNESS, 80.0),
          "LIDAR_MOUNT_PAD_OPTIONAL")

    # Ground contact confirmation, inside the hollow of each shoe.
    S = p.FOOT_CONTACT_SENSOR_SIZE
    for side, sx in (("PORT", -(ARM_IN + ARM_W / 2)), ("STARBOARD", ARM_IN + ARM_W / 2)):
        b.add("10_SENSORS", b.box(sx - S / 2, p.FOOT_HEIGHT - S - 2.0, -S / 2, S, S, S),
              f"FOOT_CONTACT_SENSOR_{side}_KEEP_OUT")

    # ---- 11 bodywork: two front panels either side of the hip break -----
    # The lower front panel carries the two ToF windows.
    front_lower = b.box(-CHW, CGC + GAP / 2, PANEL_IN, CHW * 2, LOW_TOP - CGC - GAP, T)
    for sx in (-p.TOF_SPACING_X / 2, p.TOF_SPACING_X / 2):
        front_lower = b.cut(front_lower, b.box(sx - 10.0, p.TOF_CENTRE_Y - 10.0, PANEL_IN - 1.0,
                                               20.0, 20.0, T + 2))
    b.add("11_BODY_PANELS", front_lower, "PANEL_FRONT_LOWER")

    front_upper = b.box(-CHW, UPP_BOT + GAP / 2, PANEL_IN, CHW * 2, (H - UPP_BOT) - GAP, T)
    front_upper = b.cut(front_upper, b.box(-p.DISPLAY_ACTIVE_WIDTH / 2, p.DISPLAY_ORIGIN_Y, PANEL_IN - 1.0,
                                           p.DISPLAY_ACTIVE_WIDTH, p.DISPLAY_ACTIVE_HEIGHT, T + 2))
    # Camera window, above the display and clear of the aperture doubler.
    front_upper = b.cut(front_upper, b.box(-p.CAMERA_APERTURE_WIDTH / 2,
                                           p.CAMERA_CENTRE_Y - p.CAMERA_APERTURE_HEIGHT / 2,
                                           PANEL_IN - 1.0,
                                           p.CAMERA_APERTURE_WIDTH,
                                           p.CAMERA_APERTURE_HEIGHT, T + 2))
    b.add("11_BODY_PANELS", front_upper, "PANEL_FRONT_DISPLAY")
    for name, y0, y1 in (("PANEL_REAR_BATTERY_ACCESS", CGC, 160.0),
                         ("PANEL_REAR_COMPUTE_ACCESS", 160.0, 410.0),
                         ("PANEL_REAR_GPU_ACCESS", 410.0, LOW_TOP),
                         ("PANEL_REAR_UPPER", UPP_BOT, H)):
        b.add("11_BODY_PANELS", b.box(-CHW, y0 + GAP / 2, -HD, CHW * 2, (y1 - y0) - GAP, T), name)
    for side, x in (("PORT", -CHW), ("STARBOARD", CHW - T)):
        b.add("11_BODY_PANELS", b.box(x, CGC, -HD, T, LOW_TOP - CGC, HD * 2), f"PANEL_SIDE_{side}_LOWER")
        b.add("11_BODY_PANELS", b.box(x, UPP_BOT, -HD, T, H - UPP_BOT, HD * 2), f"PANEL_SIDE_{side}_UPPER")
    # The top lid is ported over the microphone array.
    top_lid = b.box(-CHW + T, H - T, -HD + T, CHW * 2 - 2 * T, T, HD * 2 - 2 * T)
    for i in range(p.MIC_ARRAY_CHANNELS):
        px = -33.0 + i * 22.0
        top_lid = b.cut(top_lid, b.box(px - p.MIC_PORT_DIAMETER / 2, H - T - 1.0,
                                       p.MIC_LID_Z0 + 8.0,
                                       p.MIC_PORT_DIAMETER, T + 2, p.MIC_PORT_DIAMETER))
    b.add("11_BODY_PANELS", top_lid, "PANEL_TOP_LID")
    b.add("11_BODY_PANELS", b.box(-CHW + T, CGC, -HD + T, CHW * 2 - 2 * T, T, HD * 2 - 2 * T), "PANEL_BOTTOM_LID")

    # ---- 13 wiring ------------------------------------------------------
    b.add("13_WIRING", b.box(-95.0, 210.0, -110.0, 20.0, 740.0, 20.0), "HARNESS_PORT_POWER_CAN")
    # Stops at 615, below the display module's 616 bottom edge. Dropping the
    # display to clear the camera brought the module down onto this run; it
    # still reaches the hip at 610.8, which is all it feeds.
    b.add("13_WIRING", b.box(75.0, 210.0, 85.0, 20.0, 405.0, 20.0), "HARNESS_STARBOARD_POWER_CAN")

    # ---- 14 arms and 16 feet -------------------------------------------
    # The gait is a compass walker, so the limb is rigid and has no knee.
    # Clearance comes from the rockered foot instead: R(1 - cos theta) at the
    # swing angle. The foot is a separate part, not a curve cut into the shell,
    # because it carries the whole landing load and wears out.
    R = p.FOOT_ROCKER_RADIUS
    FOOT_H = p.FOOT_HEIGHT
    PAD = p.FOOT_PAD_THICKNESS
    for side, x0 in (("PORT", -HW), ("STARBOARD", ARM_IN)):
        b.add("14_ARMS", b.shell(x0, FOOT_H, -HD, ARM_W, H - FOOT_H, HD * 2, T),
              f"ARM_{side}_RIGID_LIMB")

        blank = b.box(x0, 0, -HD, ARM_W, FOOT_H, HD * 2)
        outer = b.intersect(b.copy(blank), b.cyl_x(x0 - 2, x0 + ARM_W + 2, R, R, 0.0))
        shoe = b.intersect(b.copy(blank), b.cyl_x(x0 - 2, x0 + ARM_W + 2, R - PAD, R, 0.0))
        pad = b.cut(b.copy(outer), b.copy(shoe))

        # The shoe is a formed part, not billet. Left solid it weighs 4.75 kg a
        # side; hollowed to plate it is a fraction of that and still carries the
        # landing load through its rocker face and side walls.
        W = p.FOOT_SHOE_WALL
        void = b.intersect(
            b.box(x0 + W, 0, -HD + W, ARM_W - 2 * W, FOOT_H, HD * 2 - 2 * W),
            b.cyl_x(x0 - 2, x0 + ARM_W + 2, R - PAD - W, R, 0.0))
        shoe = b.cut(shoe, void)

        b.add("16_FEET", shoe, f"FOOT_{side}_SHOE")
        b.add("16_FEET", pad, f"FOOT_{side}_CONTACT_PAD")

    # ---- 15 display insert ---------------------------------------------
    ap_w, ap_h, ap_y = p.DISPLAY_ACTIVE_WIDTH, p.DISPLAY_ACTIVE_HEIGHT, p.DISPLAY_ORIGIN_Y
    FL = p.DISPLAY_DOUBLER_FLANGE
    doubler = b.box(-115.0, ap_y - FL, PANEL_IN - 2.0, 230.0, ap_h + 2 * FL, 2.0)
    doubler = b.cut(doubler, b.box(-ap_w / 2, ap_y, PANEL_IN - 3.0, ap_w, ap_h, 4.0))
    b.add("15_DISPLAY", doubler, "DISPLAY_APERTURE_DOUBLER")
    b.add("15_DISPLAY", b.box(-93.0, ap_y - 6.0, PANEL_IN - 4.0, 186.0, ap_h + 12.0, p.DISPLAY_COVER_THICKNESS),
          "DISPLAY_COVER_LENS")
    b.add("15_DISPLAY", b.box(-p.DISPLAY_MODULE_WIDTH / 2,
                              ap_y - (p.DISPLAY_MODULE_HEIGHT - ap_h) / 2,
                              PANEL_IN - 4.0 - p.DISPLAY_MODULE_THICKNESS,
                              p.DISPLAY_MODULE_WIDTH, p.DISPLAY_MODULE_HEIGHT,
                              p.DISPLAY_MODULE_THICKNESS), "DISPLAY_TV_UNIT")

    # ---- 17 dock --------------------------------------------------------
    # A cradle the robot is placed into. It cannot dock itself: two hip joints
    # give forward walking in one plane, with no turning or reversing. The
    # structure doubles as the fall-arrest fixture the specification requires
    # for early motion testing.
    if getattr(p, "DOCK_PRESENT", False):
        CY = p.DOCK_CONTACT_HEIGHT_Y
        b.add("17_DOCK", b.box(-340.0, -20.0, -200.0, 680.0, 20.0, 360.0), "DOCK_BASE_PLATE")
        b.add("17_DOCK", b.box(-200.0, 0.0, -180.0, 400.0, 900.0, 20.0), "DOCK_BACKBOARD")
        for side, gx in (("PORT", -270.0), ("STARBOARD", 250.0)):
            b.add("17_DOCK", b.box(gx, 0.0, -160.0, 20.0, 350.0, 260.0), f"DOCK_GUIDE_{side}")
        # Contacts stand proud of the backboard to meet the robot's rear panel.
        b.add("17_DOCK", b.box(-60.0, CY, -160.0, 120.0, 80.0, 32.0), "DOCK_CONTACT_BLOCK")
        for side, ux in (("PORT", -340.0), ("STARBOARD", 300.0)):
            b.add("17_DOCK", b.box(ux, 0.0, -180.0, 40.0, p.DOCK_GANTRY_HEIGHT, 40.0),
                  f"DOCK_UPRIGHT_{side}")
        b.add("17_DOCK", b.box(-340.0, p.DOCK_GANTRY_HEIGHT - 40.0, -180.0, 680.0, 40.0, 40.0),
              "DOCK_GANTRY_CROSSBAR")
        # Robot-side mating plate, on the rear panel.
        b.add("08_ELECTRONICS", b.box(-60.0, CY, -HD, 120.0, 80.0, 4.0), "DOCK_CONTACT_PLATE")

    # ---- report ---------------------------------------------------------
    r = design.rootComponent
    mn, mx = [1e9] * 3, [-1e9] * 3
    for occ in r.allOccurrences:
        # The dock is ground support equipment, not part of the robot, and the
        # reference envelopes are transparent volumes rather than parts.
        if occ.component.name == "17_DOCK":
            continue
        for body in occ.bRepBodies:
            if body.name in ("EXTERNAL_REFERENCE_ENVELOPE", "CENTRAL_CHASSIS_REFERENCE"):
                continue
            bb = body.boundingBox
            for k, v in enumerate((bb.minPoint.x, bb.minPoint.y, bb.minPoint.z)):
                mn[k] = min(mn[k], v)
            for k, v in enumerate((bb.maxPoint.x, bb.maxPoint.y, bb.maxPoint.z)):
                mx[k] = max(mx[k], v)

    return {
        "document": document.name,
        "components": sorted({o.component.name for o in r.occurrences}),
        "bodies": sum(o.bRepBodies.count for o in r.allOccurrences),
        "extent_mm": [round((mx[k] - mn[k]) * 10, 1) for k in range(3)],
        "mass": mass_report(design, p),
    }


# Densities in g/cm^3. Only fabricated structure is weighed from geometry;
# purchased items carry their published mass instead, since their keep-outs are
# reservations rather than parts.
DENSITY = {"6061": 2.70, "5052": 2.68, "steel": 7.85}
STRUCTURAL_MATERIAL = {
    "01_FRAME": "6061",
    "02_JOINTS": "6061",
    "04_BEARINGS_SHAFTS": "steel",
    "11_BODY_PANELS": "5052",
    "14_ARMS": "5052",
    "16_FEET": "6061",
}


def mass_report(design, p=None):
    """Mass of the fabricated structure, computed from the solids."""
    if p is None:
        p = load_parameters()
    r = design.rootComponent

    structure = {}
    for occ in r.occurrences:
        material = STRUCTURAL_MATERIAL.get(occ.component.name)
        if not material:
            continue
        kg = sum(body.volume * DENSITY[material] / 1000.0 for body in occ.component.bRepBodies)
        structure[occ.component.name] = round(kg, 2)

    purchased = {
        "actuators": p.ACTUATOR_MASS_KG * p.ACTUATOR_COUNT_SELECTED,
        "reductions": 1.2 * p.ACTUATOR_COUNT_SELECTED,
        "mini_pc": p.MINI_PC_MASS_KG,
        "gpu": 0.5,
        "display": p.DISPLAY_MASS_ESTIMATE_KG,
        "wiring_and_fasteners": 1.5,
        "sensors": p.SENSOR_MASS_ESTIMATE_KG,
    }

    structural = round(sum(structure.values()), 2)
    purchased_total = round(sum(purchased.values()), 2)
    dry = round(structural + purchased_total, 2)

    return {
        "structural_kg": structural,
        "structuralByComponent": structure,
        "purchased_kg": purchased_total,
        "purchasedDetail": {k: round(v, 2) for k, v in purchased.items()},
        "dryMass_kg": dry,
        "withBattery": {
            "LiFePO4_1280Wh": round(dry + 11.0, 1),
            "NMC_1000Wh": round(dry + 5.0, 1),
        },
        "targetClass_kg": "12-25",
    }
