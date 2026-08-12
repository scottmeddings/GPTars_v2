"""Generate the front-page hero: a three-quarter view of GP-TARS V2 wearing its decals.

The Fusion screenshot this replaces was flat grey, and its front face was
foreshortened so hard that a decal on it would have read as a sliver. Here the
camera is ours, so the front face is the one that faces the reader and every
decal sits at the millimetre position recorded in docs/aluminium_architecture.md.

Geometry comes from cad/parameters.py, so the hero cannot drift from the model.
Run:  python3 cad/render_hero.py
"""

from __future__ import annotations

import math
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from cad import parameters as p  # noqa: E402

OUT = pathlib.Path(__file__).resolve().parent.parent / "website/public/images/gptars-hero-decals.svg"

# ---------------------------------------------------------------- envelope

W = p.ROBOT_WIDTH                       # 480 across
H = p.ROBOT_HEIGHT                      # 1000 tall
D = p.ROBOT_DEPTH_REFERENCE             # ~259.9 deep
SLAB = p.SLAB_WIDTH                     # 120; outer two slabs are the limbs
CHASSIS_X0, CHASSIS_X1 = SLAB, W - SLAB
FOOT_H = p.FOOT_HEIGHT
CLEAR = p.CHASSIS_GROUND_CLEARANCE      # only the feet reach Y=0
HIP_Y = p.AXLE_LOWER_MAIN_Y             # 610.8
GAP = p.PANEL_HIP_BREAK_GAP

DISP_W, DISP_H = p.DISPLAY_ACTIVE_WIDTH, p.DISPLAY_ACTIVE_HEIGHT
DISP_X0 = (W - DISP_W) / 2
DISP_Y0 = p.DISPLAY_ORIGIN_Y

# ---------------------------------------------------------------- camera

CANVAS_W, CANVAS_H = 1400, 1360
AZIMUTH = math.radians(34.0)    # swing right so the +X side face reads as depth
ELEVATION = math.radians(11.0)  # slightly above eye line
DISTANCE = 4200.0
FOCAL = 3050.0

_target = (W / 2, H * 0.50, D / 2)
_eye = (
    _target[0] + DISTANCE * math.sin(AZIMUTH) * math.cos(ELEVATION),
    _target[1] + DISTANCE * math.sin(ELEVATION),
    _target[2] + DISTANCE * math.cos(AZIMUTH) * math.cos(ELEVATION),
)


def _sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def _cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def _norm(v):
    m = math.sqrt(sum(c * c for c in v))
    return (v[0] / m, v[1] / m, v[2] / m)


_fwd = _norm(_sub(_target, _eye))
_right = _norm(_cross(_fwd, (0.0, 1.0, 0.0)))
_up = _cross(_right, _fwd)

_fit_scale = 1.0
_fit_dx = 0.0
_fit_dy = 0.0


def project(pt):
    """World millimetres -> canvas pixels."""
    r = _sub(pt, _eye)
    x = r[0] * _right[0] + r[1] * _right[1] + r[2] * _right[2]
    y = r[0] * _up[0] + r[1] * _up[1] + r[2] * _up[2]
    z = r[0] * _fwd[0] + r[1] * _fwd[1] + r[2] * _fwd[2]
    z = max(z, 1e-6)
    return (FOCAL * x / z * _fit_scale + _fit_dx, -FOCAL * y / z * _fit_scale + _fit_dy)


def _fit():
    """Centre and scale the body inside the canvas."""
    global _fit_scale, _fit_dx, _fit_dy
    corners = [(x, y, z) for x in (0, W) for y in (0, H) for z in (0, D)]
    pts = [project(c) for c in corners]
    xs = [q[0] for q in pts]
    ys = [q[1] for q in pts]
    span_x, span_y = max(xs) - min(xs), max(ys) - min(ys)
    _fit_scale = min((CANVAS_W - 210) / span_x, (CANVAS_H - 190) / span_y)
    pts = [project(c) for c in corners]
    xs = [q[0] for q in pts]
    ys = [q[1] for q in pts]
    _fit_dx = CANVAS_W / 2 - (min(xs) + max(xs)) / 2
    _fit_dy = CANVAS_H / 2 - (min(ys) + max(ys)) / 2 + 18


_fit()


# ---------------------------------------------------------------- face frames


class Face:
    """A planar face with local millimetre coordinates, v measured downward.

    Decals are authored in the same (u, v) millimetres the decal schedule uses,
    then projected, so nothing is positioned by eye.
    """

    def __init__(self, origin, u_dir, v_dir):
        self.o = origin
        self.u = u_dir
        self.v = v_dir

    def at(self, u, v):
        return (
            self.o[0] + self.u[0] * u + self.v[0] * v,
            self.o[1] + self.u[1] * u + self.v[1] * v,
            self.o[2] + self.u[2] * u + self.v[2] * v,
        )

    def pt(self, u, v):
        return project(self.at(u, v))

    def quad(self, u0, v0, u1, v1):
        return [self.pt(u0, v0), self.pt(u1, v0), self.pt(u1, v1), self.pt(u0, v1)]

    def affine(self, u, v, e=10.0):
        """Local affine at (u, v). A homography is locally affine, and every
        decal is small against the 480 mm face, so this is exact enough that
        text sits on the panel rather than floating over it."""
        a = self.pt(u, v)
        b = self.pt(u + e, v)
        c = self.pt(u, v + e)
        return (
            (b[0] - a[0]) / e, (b[1] - a[1]) / e,
            (c[0] - a[0]) / e, (c[1] - a[1]) / e,
            a[0], a[1],
        )


# Front face sits at z = D. Local origin is its top-left as seen by the reader.
FRONT = Face((0.0, H, D), (1.0, 0.0, 0.0), (0.0, -1.0, 0.0))
# Right side face at x = W, u running from the front edge toward the back.
SIDE = Face((W, H, D), (0.0, 0.0, -1.0), (0.0, -1.0, 0.0))
# Top face, u across the width, v running back.
TOP = Face((0.0, H, D), (1.0, 0.0, 0.0), (0.0, 0.0, -1.0))


def poly(points):
    return " ".join(f"{q[0]:.2f},{q[1]:.2f}" for q in points)


def mat(m):
    return f"matrix({m[0]:.5f},{m[1]:.5f},{m[2]:.5f},{m[3]:.5f},{m[4]:.3f},{m[5]:.3f})"


# ---------------------------------------------------------------- drawing

out: list[str] = []
add = out.append

# v measured down from Y=H
def vy(y_mm):
    return H - y_mm


C_FRONT = "#3c444b"
C_SIDE = "#525c64"
C_TOP = "#68737b"
C_EDGE = "#79858e"
ORANGE = "#d97b19"

add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS_W} {CANVAS_H}" '
    f'width="{CANVAS_W}" height="{CANVAS_H}" '
    f'font-family="ui-monospace, \'SF Mono\', Menlo, Consolas, monospace">')
add('<title>GP-TARS V2 with applied decals, three-quarter view</title>')
add('<desc>Three-quarter view of the 480 x 1000 x 260 mm GP-TARS V2 showing the '
    'applied decal set: rotated TARS wordmark with dot matrix, hip and limb '
    'pinch stripes, crush and starts-without-warning hazard triangles, display '
    'surround and panel index marks. Generated from cad/parameters.py.</desc>')

add('<defs>'
    '<pattern id="hz" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
    '<rect width="8" height="16" fill="#f2c200"/><rect x="8" width="8" height="16" fill="#1a1a1a"/></pattern>'
    '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="#161c22"/><stop offset="1" stop-color="#0e1319"/></linearGradient>'
    '<pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">'
    '<path d="M46 0H0V46" fill="none" stroke="#28323a" stroke-width="1"/></pattern>'
    '<radialGradient id="shadow"><stop offset="0" stop-color="#000" stop-opacity="0.55"/>'
    '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'
    '<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">'
    '<stop offset="0" stop-color="#16202a"/><stop offset="1" stop-color="#0a0e12"/></linearGradient>'
    '</defs>')

add(f'<rect width="{CANVAS_W}" height="{CANVAS_H}" fill="url(#bg)"/>')
add(f'<rect width="{CANVAS_W}" height="{CANVAS_H}" fill="url(#grid)" opacity="0.5"/>')

# ground shadow, an ellipse under the projected footprint
_foot_pts = [project((x, 0.0, z)) for x in (0, W) for z in (0, D)]
_cx = sum(q[0] for q in _foot_pts) / 4
_cy = sum(q[1] for q in _foot_pts) / 4
_rx = (max(q[0] for q in _foot_pts) - min(q[0] for q in _foot_pts)) * 0.78
_ry = (max(q[1] for q in _foot_pts) - min(q[1] for q in _foot_pts)) * 1.15
add(f'<ellipse cx="{_cx:.1f}" cy="{_cy + 14:.1f}" rx="{_rx:.1f}" ry="{_ry:.1f}" fill="url(#shadow)"/>')

# ---- solid faces -------------------------------------------------------

add('<g stroke="' + C_EDGE + '" stroke-width="1.5" stroke-linejoin="round">')

# top
add(f'<polygon points="{poly(TOP.quad(0, 0, W, D))}" fill="{C_TOP}"/>')

# right side face: limb column full height, stepping in at the foot
add(f'<polygon points="{poly(SIDE.quad(0, vy(H), D, vy(FOOT_H)))}" fill="{C_SIDE}"/>')
add(f'<polygon points="{poly(SIDE.quad(0, vy(FOOT_H), D, vy(0)))}" fill="#454e55"/>')

# front face, slab by slab
for x0 in (0.0, CHASSIS_X0, CHASSIS_X1):
    x1 = x0 + (SLAB if x0 != CHASSIS_X0 else W - 2 * SLAB)
    is_limb = x0 != CHASSIS_X0
    bottom = 0.0 if is_limb else CLEAR
    add(f'<polygon points="{poly(FRONT.quad(x0, vy(H), x1, vy(bottom)))}" fill="{C_FRONT}"/>')

add('</g>')

# panel joints and the hip break
add('<g fill="none" stroke="#232a30" stroke-width="2.2" stroke-linecap="round">')
for x in (CHASSIS_X0, CHASSIS_X1):
    a, b = FRONT.pt(x, vy(H)), FRONT.pt(x, vy(0))
    add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>')
# hip break across the whole body, front and side
a, b = FRONT.pt(0, vy(HIP_Y + GAP / 2)), FRONT.pt(W, vy(HIP_Y + GAP / 2))
add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>')
a, b = SIDE.pt(0, vy(HIP_Y + GAP / 2)), SIDE.pt(D, vy(HIP_Y + GAP / 2))
add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>')
# foot line
a, b = FRONT.pt(0, vy(FOOT_H)), FRONT.pt(SLAB, vy(FOOT_H))
add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>')
a, b = FRONT.pt(CHASSIS_X1, vy(FOOT_H)), FRONT.pt(W, vy(FOOT_H))
add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>')
add('</g>')

# ---- display ------------------------------------------------------------

add(f'<polygon points="{poly(FRONT.quad(DISP_X0, vy(DISP_Y0 + DISP_H), DISP_X0 + DISP_W, vy(DISP_Y0)))}" '
    f'fill="url(#glass)" stroke="#0a0e12" stroke-width="2"/>')
# orange bezel: the display surround decal
add(f'<polygon points="{poly(FRONT.quad(DISP_X0 - 7, vy(DISP_Y0 + DISP_H + 7), DISP_X0 + DISP_W + 7, vy(DISP_Y0 - 7)))}" '
    f'fill="none" stroke="{ORANGE}" stroke-width="2.6" opacity="0.92"/>')

# ---- decals: front face -------------------------------------------------

# Pinch stripes. Hip gap runs the full chassis width; limb leading edges run
# the outboard 14 mm of each limb from the foot to the hip.
STRIPE = 14.0
add(f'<polygon points="{poly(FRONT.quad(CHASSIS_X0, vy(HIP_Y + STRIPE / 2 + 8), CHASSIS_X1, vy(HIP_Y - STRIPE / 2 + 8)))}" fill="url(#hz)"/>')
for x0 in (2.0, W - STRIPE - 2.0):
    add(f'<polygon points="{poly(FRONT.quad(x0, vy(HIP_Y - 30), x0 + STRIPE, vy(FOOT_H)))}" fill="url(#hz)"/>')

# TARS wordmark: 52 x 250, rotated to read bottom-to-top, base at Y 350.
WM_W, WM_H = 52.0, 250.0
WM_X, WM_Y = 150.0, 350.0
m = FRONT.affine(WM_X + WM_W / 2, vy(WM_Y + WM_H / 2))
add(f'<g transform="{mat(m)}">'
    f'<text x="0" y="0" transform="rotate(-90)" text-anchor="middle" dominant-baseline="central" '
    f'font-size="46" font-weight="700" letter-spacing="9" fill="{ORANGE}">TARS</text></g>')

# Dot matrix beside the wordmark, as on the reference machine.
DOT_X, DOT_Y = 214.0, 360.0
# A fixed bitmap rather than a modulo rule: the modulo version read as scatter.
MATRIX = ["111", "101", "111", "010", "111", "011", "110", "111", "101", "111", "010"]
dots = [
    (DOT_X + col * 11, DOT_Y + row * 19)
    for row, bits in enumerate(MATRIX)
    for col, bit in enumerate(bits)
    if bit == "1"
]
m = FRONT.affine(DOT_X, vy(DOT_Y + 200))
add(f'<g transform="{mat(m)}" fill="{ORANGE}">' + "".join(
    f'<circle cx="{(dx - DOT_X):.1f}" cy="{(200 - (dy - DOT_Y)):.1f}" r="3.1"/>' for dx, dy in dots
) + '</g>')

# Hazard triangles, each at the hazard it warns about.
TRI = ('<path d="M22,0 L44,40 L0,40 Z" fill="#f2c200" stroke="#1a1a1a" '
       'stroke-width="1.6" stroke-linejoin="round"/>')
CRUSH = TRI + ('<rect x="16" y="14" width="12" height="3.4" fill="#1a1a1a"/>'
               '<rect x="16" y="24" width="12" height="3.4" fill="#1a1a1a"/>')
STARTS = TRI + ('<rect x="14" y="20" width="7" height="13" fill="#1a1a1a"/>'
                '<rect x="23" y="20" width="7" height="13" fill="#1a1a1a"/>'
                '<path d="M12,17 h20" stroke="#1a1a1a" stroke-width="2.2"/>')

# Crush goes on the limb beside the hip axis, which is where the shear actually
# is. Y 700 put it inside the display aperture; the chassis above the hip is
# display, so the warning belongs on the limb.
for art, (tx, ty) in ((CRUSH, (46.0, 700.0)), (STARTS, (272.0, 190.0))):
    m = FRONT.affine(tx, vy(ty))
    add(f'<g transform="{mat(m)}">{art}</g>')

# Panel index marks: return each panel to the opening it came from.
for label, (tx, ty) in (("P1", (300.0, 120.0)), ("P2", (40.0, 120.0))):
    m = FRONT.affine(tx, vy(ty))
    add(f'<g transform="{mat(m)}">'
        f'<rect width="26" height="26" fill="#9aa7b0" fill-opacity="0.62"/>'
        f'<text x="13" y="18" font-size="12" font-weight="700" fill="#161c22" '
        f'text-anchor="middle">{label}</text></g>')

# ---- decals: right side face -------------------------------------------

# The limb leading-edge stripe wraps onto the side, and one index mark rides
# the side panel so the set reads from either approach.
add(f'<polygon points="{poly(SIDE.quad(2.0, vy(HIP_Y - 30), 2.0 + STRIPE, vy(FOOT_H)))}" fill="url(#hz)"/>')
m = SIDE.affine(150.0, vy(120.0))
add(f'<g transform="{mat(m)}">'
    f'<rect width="26" height="26" fill="#9aa7b0" fill-opacity="0.62"/>'
    f'<text x="13" y="18" font-size="12" font-weight="700" fill="#161c22" text-anchor="middle">P4</text></g>')

# Data plate lives on the rear, but the side carries the small build stamp.
m = SIDE.affine(80.0, vy(430.0))
add(f'<g transform="{mat(m)}">'
    f'<rect width="120" height="52" fill="#12171c" stroke="#2c353c" stroke-width="1"/>'
    f'<text x="8" y="16" font-size="10.5" font-weight="700" fill="#cfd6da">GP-TARS V2 1000</text>'
    f'<line x1="8" y1="21" x2="112" y2="21" stroke="{ORANGE}" stroke-width="0.9"/>'
    f'<text x="8" y="34" font-size="8" fill="#8b98a2">BUS</text>'
    f'<text x="58" y="34" font-size="8" fill="#cfd6da">{p.BATTERY_VOLTAGE} V DC</text>'
    f'<text x="8" y="45" font-size="8" fill="#8b98a2">UNIT</text>'
    f'<text x="58" y="45" font-size="8" fill="#cfd6da">001</text></g>')

# ---- caption ------------------------------------------------------------

add(f'<g font-size="15" fill="#7d8992">'
    f'<text x="34" y="{CANVAS_H - 46}" font-weight="700" fill="#9aa7b0">GP-TARS V2 · DECALS APPLIED</text>'
    f'<text x="34" y="{CANVAS_H - 24}">{W:.0f} × {H:.0f} × {D:.0f} mm · decal positions per '
    f'docs/aluminium_architecture.md · generated from cad/parameters.py</text></g>')

add('</svg>')

svg = "\n".join(out)
OUT.write_text(svg)
print(f"wrote {OUT.relative_to(pathlib.Path(__file__).resolve().parent.parent)} ({len(svg)} bytes)")
