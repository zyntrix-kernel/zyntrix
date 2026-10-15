#!/usr/bin/env python3
"""
Zyntrix logo generator — clean Material 3 rebuild of the uploaded reference key visual.
Rebuilds: italic gradient Z + orbit ring + M3 spark + ZYNTRIX wordmark + tagline.
Outputs a full SVG kit (symbol, lockups dark/light, app icon, mono, small-size cut).
All drawing is vectors only: no <text>, no filters, no rasters.
"""
import math, os

OUT = os.path.dirname(os.path.abspath(__file__))

# ------------------------------------------------------------------ palette
SURFACE   = "#06021D"    # deep space indigo (app icon container)
PRIMARY   = "#A855F7"    # vivid violet (reference family #AE49F8)
PRIMARY_D = "#6B1AC9"    # deep violet
LAV       = "#E9DCFF"    # light lavender
LAV_2     = "#C9AFFF"
SPARK_C   = "#F4EEFF"    # spark highlight
INK       = "#241243"    # dark text (light backgrounds)
INK_2     = "#6B5A95"    # dark tagline (light backgrounds)

# dark-lockup text colors
TEXT_ON_DARK  = "#E9E2FF"
TAG_ON_DARK   = "#B3A1E0"

# ------------------------------------------------------------------ helpers
def f(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return s if s else "0"

def rounded_polygon(pts, r_map):
    """Closed polygon path with per-vertex arc rounding. pts clockwise (screen)."""
    n = len(pts)
    d = []
    seg = []
    for i in range(n):
        p0, p1, p2 = pts[(i - 1) % n], pts[i], pts[(i + 1) % n]
        t1 = ((p1[0] - p0[0]), (p1[1] - p0[1]))
        t2 = ((p2[0] - p1[0]), (p2[1] - p1[1]))
        l1 = math.hypot(*t1); l2 = math.hypot(*t2)
        u1 = (t1[0] / l1, t1[1] / l1); u2 = (t2[0] / l2, t2[1] / l2)
        r = r_map[i]
        cosang = max(-1.0, min(1.0, u1[0] * u2[0] + u1[1] * u2[1]))
        theta = math.acos(cosang)
        t = min(r / max(math.tan(theta / 2), 1e-6), l1 * 0.45, l2 * 0.45)
        a = (p1[0] - u1[0] * t, p1[1] - u1[1] * t)
        b = (p1[0] + u2[0] * t, p1[1] + u2[1] * t)
        cross = u1[0] * u2[1] - u1[1] * u2[0]
        sweep = 1 if cross > 0 else 0
        seg.append((a, r, sweep, b, i == 0))
    for a, r, sweep, b, first in seg:
        d.append(("M" if first else "L") + f"{f(a[0])} {f(a[1])}")
        d.append(f"A{f(r)} {f(r)} 0 0 {sweep} {f(b[0])} {f(b[1])}")
    d.append("Z")
    return " ".join(d)

def spark_path(cx, cy, R, k=0.17):
    """M3 four-point spark (concave star)."""
    cx, cy, R = float(cx), float(cy), float(R)
    c = R * k
    return (f"M{f(cx)} {f(cy-R)} Q{f(cx+c)} {f(cy-c)} {f(cx+R)} {f(cy)} "
            f"Q{f(cx+c)} {f(cy+c)} {f(cx)} {f(cy+R)} "
            f"Q{f(cx-c)} {f(cy+c)} {f(cx-R)} {f(cy)} "
            f"Q{f(cx-c)} {f(cy-c)} {f(cx)} {f(cy-R)} Z")

# ------------------------------------------------------------------ symbol geometry
RING = dict(cx=128.0, cy=132.0, rx=118.0, ry=30.0, rot=-18.0, w=7.0)

# Z letterform vertices, clockwise; (vertex, corner radius)  r>3 convex, r small reflex
Z_VERTS = [
    ((80, 50), 7.0), ((216, 50), 7.0), ((216, 90), 7.0), ((126, 170), 2.6),
    ((174, 170), 7.0), ((174, 210), 7.0), ((38, 210), 7.0), ((38, 170), 7.0),
    ((52, 170), 2.6), ((142, 90), 2.6), ((80, 90), 7.0),
]
Z_PATH = rounded_polygon([v for v, _ in Z_VERTS], [r for _, r in Z_VERTS])

SPARK_MAIN = (233.0, 90.0, 19.0)   # anchors the ring break on the upper right, like the reference
SPARK_MINI = (206.0, 36.0, 6.5)

def _arc(t0, t1):
    """SVG arc along the rotated ring ellipse from angle t0 to t1 (degrees)."""
    a, b = _ring_pt(t0), _ring_pt(t1)
    return (f'M{f(a[0])} {f(a[1])} A{f(RING["rx"])} {f(RING["ry"])} {f(RING["rot"])} 0 1 {f(b[0])} {f(b[1])}')

def _ring_pt(t_deg):
    """Parametric point of the rotated ring ellipse (final coordinates)."""
    t = math.radians(t_deg)
    a, b = RING["rx"] * math.cos(t), RING["ry"] * math.sin(t)
    c, s = math.cos(math.radians(RING["rot"])), math.sin(math.radians(RING["rot"]))
    return (RING["cx"] + a * c - b * s, RING["cy"] + a * s + b * c)

def _front_arc_t_range():
    """Ellipse angles where the ring crosses the bottom bar's left corner:
    enters through the bar's TOP edge (y=170, downward), exits through its
    LEFT edge (x=38, moving left). Sampled along increasing parametric t."""
    x_left, y_top = 38.0, 170.0
    t_in = t_out = None
    prev = _ring_pt(0)
    for i in range(1, 7201):
        t = i / 20.0
        p = _ring_pt(t)
        if t_in is None and prev[1] < y_top <= p[1] and x_left < p[0] < 174:
            t_in = t
        if t_in is not None and t_out is None and prev[0] >= x_left > p[0] and p[1] > y_top + 2:
            t_out = t
        prev = p
    return t_in - 6, t_out + 6

T_IN, T_OUT = _front_arc_t_range()

def ring_front_arc():
    """Arc redrawn OVER the Z: ring passes in front of the bottom bar's left corner,
    then continues through the left tip to meet the back arc seamlessly."""
    return _arc(T_IN - 6, 180)

def symbol_body(uid, z_fill, ring_grad, spark_fill, mini_fill, halo=True):
    """The mark: broken orbit ring (back + lower), Z, front crossing, sparks. 256 canvas."""
    # back arc: left tip -> over the top -> ends hidden behind the top bar
    ring_back = _arc(180, 320)
    # lower arc: resumes from behind the main spark, sweeps under the right shoulder,
    # tucks behind the diagonal and meets the bottom bar
    ring_lower = _arc(3, 101)
    parts = []
    parts.append(f'<path d="{ring_back}" fill="none" stroke="{ring_grad}" '
                 f'stroke-width="{f(RING["w"])}" stroke-linecap="round"/>')
    parts.append(f'<path d="{ring_lower}" fill="none" stroke="{ring_grad}" '
                 f'stroke-width="{f(RING["w"])}" stroke-linecap="round"/>')
    parts.append(f'<path d="{Z_PATH}" fill="{z_fill}"/>')
    parts.append(f'<path d="{ring_front_arc()}" fill="none" stroke="{ring_grad}" '
                 f'stroke-width="{f(RING["w"])}" stroke-linecap="round"/>')
    mx, my, mr = SPARK_MAIN
    parts.append(f'<path d="{spark_path(mx, my, mr)}" fill="{spark_fill}"/>')
    nx, ny, nr = SPARK_MINI
    parts.append(f'<path d="{spark_path(nx, ny, nr)}" fill="{mini_fill}"/>')
    return "\n  ".join(parts)

DEFS_DARK = f'''  <defs>
    <linearGradient id="gz" gradientUnits="userSpaceOnUse" x1="64" y1="46" x2="186" y2="214">
      <stop offset="0" stop-color="#EFE5FF"/>
      <stop offset="0.38" stop-color="{PRIMARY}"/>
      <stop offset="0.62" stop-color="#8B2BE2"/>
      <stop offset="1" stop-color="#CDBFFF"/>
    </linearGradient>
    <linearGradient id="gr" gradientUnits="userSpaceOnUse" x1="19" y1="128" x2="233" y2="128">
      <stop offset="0" stop-color="#8B4BF0"/>
      <stop offset="0.5" stop-color="#C084FC"/>
      <stop offset="1" stop-color="#7C2BDB"/>
    </linearGradient>
  </defs>'''

DEFS_LIGHT = f'''  <defs>
    <linearGradient id="gz" gradientUnits="userSpaceOnUse" x1="64" y1="46" x2="186" y2="214">
      <stop offset="0" stop-color="#A366FF"/>
      <stop offset="0.45" stop-color="#8A2BE2"/>
      <stop offset="0.8" stop-color="#5B189B"/>
      <stop offset="1" stop-color="#B08CFF"/>
    </linearGradient>
    <linearGradient id="gr" gradientUnits="userSpaceOnUse" x1="19" y1="128" x2="233" y2="128">
      <stop offset="0" stop-color="#6D28D9"/>
      <stop offset="0.5" stop-color="#9F5BFF"/>
      <stop offset="1" stop-color="#6D28D9"/>
    </linearGradient>
  </defs>'''

def write(name, body, defs=DEFS_DARK, vb="0 0 256 256", w=256, h=256):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" '
           f'width="{w}" height="{h}" role="img" aria-label="Zyntrix logo">\n<title>Zyntrix logo</title>\n'
           + defs + "\n" + body + "\n</svg>\n")
    with open(os.path.join(OUT, name), "w") as fh:
        fh.write(svg)
    print("wrote", name)

# ------------------------------------------------------------------ glyphs (monoline, 100-unit cap height, stroke 12)
GLYPHS = {  # path, advance width
    "Z": ("M6 6 H52 L6 94 H52", 58),
    "Y": ("M6 6 L30 56 M54 6 L30 56 M30 56 V94", 60),
    "N": ("M6 94 V6 L54 94 V6", 60),
    "T": ("M6 6 H50 M28 6 V94", 56),
    "R": ("M6 6 V94 M6 6 H34 A16 16 0 0 1 34 38 H6 M31 40 L52 94", 58),
    "I": ("M6 6 V94", 12),
    "X": ("M4.6 6 L55.4 94 M55.4 6 L4.6 94", 60),
    "B": ("M6 6 V94 M6 6 H28 Q44 6 44 22 Q44 36 26 36 H6 M26 36 Q48 36 48 65 Q48 94 26 94 H6", 56),
    "U": ("M6 6 V62 A23 32 0 0 0 52 62 V6", 58),
    "L": ("M6 6 V94 H38", 44),
    "D": ("M6 6 V94 M6 6 H24 Q50 6 50 50 Q50 94 24 94 H6", 56),
    "C": ("M46 20 Q36 6 26 6 Q6 6 6 50 Q6 94 26 94 Q36 94 46 80", 52),
    "O": ("M6 50 A23 44 0 1 1 52 50 A23 44 0 1 1 6 50", 58),
    "N2": ("M6 94 V6 L54 94 V6", 60),
    "F": ("M40 6 H6 V94 M6 44 H30", 46),
    "G": ("M48 22 Q40 6 26 6 Q6 6 6 50 Q6 94 26 94 Q38 94 44 84 V60 H28", 56),
    "E": ("M42 6 H6 V94 H42 M6 48 H32", 48),
    "P": ("M6 94 V6 M6 6 H26 Q44 6 44 24 Q44 42 24 42 H6", 52),
}
GLYPHS["N"] = GLYPHS["N2"]
del GLYPHS["N2"]
TRACK = 62.0
STROKE_W = 12.0

def text_w(letters, scale, track=TRACK):
    return (sum(GLYPHS[ch][1] for ch in letters) + track * (len(letters) - 1)) * scale

def emit_word(letters, x, baseline, scale, fill, track=TRACK):
    """Inline stroked paths for a run of letters. Returns (svg, end_x)."""
    out = [f'<g fill="none" stroke="{fill}" stroke-width="{STROKE_W}" '
           f'stroke-linecap="round" stroke-linejoin="round">']
    cx = x
    for ch in letters:
        d = GLYPHS[ch][0]
        out.append(f'<path transform="translate({f(cx)} {f(baseline - 100 * scale)}) '
                   f'scale({f(scale)})" d="{d}"/>')
        cx += (GLYPHS[ch][1] + track) * scale
    out.append("</g>")
    return "\n".join(out), cx - track * scale

def tagline_block(x, baseline, scale, fill, sep_fill):
    """BUILD <spark> CONFIGURE <spark> EXPLORE with mini-spark separators."""
    words = ["BUILD", "CONFIGURE", "EXPLORE"]
    gap = 44 * scale          # space on each side of a separator
    sep_w = 14 * scale        # separator slot
    total = sum(text_w(wd, scale) for wd in words) + 2 * (gap * 2 + sep_w)
    parts = []
    cx = x
    for wi, wd in enumerate(words):
        blk, end_x = emit_word(wd, cx, baseline, scale, fill)
        parts.append(blk)
        cx = end_x
        if wi < 2:
            scx = cx + gap + sep_w / 2
            scy = baseline - 50 * scale
            R = 6.4 * scale
            parts.append(f'<path d="{spark_path(scx, scy, R)}" fill="{sep_fill}"/>')
            cx += gap * 2 + sep_w
    return "\n".join(parts), total

# ------------------------------------------------------------------ 1. symbol (dark-optimized, transparent)
write("zyntrix-symbol.svg",
      symbol_body("d", "url(#gz)", "url(#gr)", SPARK_C, LAV_2),
      defs=DEFS_DARK)

# ------------------------------------------------------------------ 2. symbol (light-optimized)
write("zyntrix-symbol-light.svg",
      symbol_body("l", "url(#gz)", "url(#gr)", "#7C22CE", "#B78CFF"),
      defs=DEFS_LIGHT)

# ------------------------------------------------------------------ 3. app icon (M3 squircle container)
icon_body = (
    '<path d="M0 58 A58 58 0 0 1 58 0 H198 A58 58 0 0 1 256 58 V198 '
    'A58 58 0 0 1 198 256 H58 A58 58 0 0 1 0 198 Z" fill="' + SURFACE + '"/>\n  '
    + symbol_body("i", "url(#gz)", "url(#gr)", SPARK_C, LAV_2)
      .replace("<path", "<path", 1)
)
# scale mark into icon safe area
icon_body = icon_body.replace(symbol_body("i", "url(#gz)", "url(#gr)", SPARK_C, LAV_2),
    '<g transform="translate(30.7 30.7) scale(0.76)">\n  '
    + symbol_body("i", "url(#gz)", "url(#gr)", SPARK_C, LAV_2) + "\n</g>")
write("zyntrix-app-icon.svg", icon_body)

# ------------------------------------------------------------------ 4. mono variants
MONO_BLACK = ('  <linearGradient id="gz"><stop offset="0" stop-color="#111118"/></linearGradient>'
              '<linearGradient id="gr"><stop offset="0" stop-color="#111118"/></linearGradient>')
MONO_WHITE = ('  <linearGradient id="gz"><stop offset="0" stop-color="#FFFFFF"/></linearGradient>'
              '<linearGradient id="gr"><stop offset="0" stop-color="#FFFFFF"/></linearGradient>')
write("zyntrix-symbol-mono-black.svg",
      symbol_body("mb", "url(#gz)", "url(#gr)", "#111118", "#111118", halo=False),
      defs=MONO_BLACK)
write("zyntrix-symbol-mono-white.svg",
      symbol_body("mw", "url(#gz)", "url(#gr)", "#FFFFFF", "#FFFFFF", halo=False),
      defs=MONO_WHITE)

# ------------------------------------------------------------------ 5. small-size cut (Z only) for favicon
zc = dict(x=128, y=130, s=1.22)
fav_body = (f'<g transform="translate({f(zc["x"])} {f(zc["y"])}) scale({f(zc["s"])}) '
            f'translate({f(-zc["x"])} {f(-zc["y"])})">'
            f'<path d="{Z_PATH}" fill="url(#gz)"/></g>')
write("zyntrix-z-small.svg", fav_body, defs=DEFS_DARK, vb="14 28 226 204", w=226, h=204)
write("zyntrix-favicon.svg", fav_body, defs=DEFS_DARK)  # square 256 canvas for icon exports

# ------------------------------------------------------------------ 6. stacked lockup (dark)
def lockup_stacked(text_col, tag_col, sep_col, defs, fname):
    W = 560.0
    mark_tx, mark_ty = 152.0, 8.0
    s_word = 0.63
    wm = "ZYNTRIX"
    ww = text_w(wm, s_word)
    wx = (W - ww) / 2
    wm_baseline = 296 + 100 * s_word
    s_tag = 0.155
    tag, tw = tagline_block(0, 0, s_tag, tag_col, sep_col)
    tx = (W - tw) / 2
    tag_baseline = wm_baseline + 30 + 100 * s_tag
    H = round(tag_baseline + 22)
    tag_baseline = H - 22
    body = ("\n".join(DEFS_DARK.splitlines()[1:-1]) if False else "")
    body = (f'<g transform="translate({f(mark_tx)} {f(mark_ty)})">'
            + symbol_body("s", "url(#gz)", "url(#gr)", SPARK_C, LAV_2) + "</g>\n"
            + emit_word(wm, wx, wm_baseline, s_word, text_col)[0] + "\n"
            + tagline_block(tx, tag_baseline, s_tag, tag_col, sep_col)[0])
    # rebuild defs with unique canvas
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(W)} {f(H)}" '
           f'width="{f(W)}" height="{f(H)}" role="img" aria-label="Zyntrix">\n<title>Zyntrix logo</title>\n'
           + defs + "\n" + body + "\n</svg>\n")
    with open(os.path.join(OUT, fname), "w") as fh:
        fh.write(svg)
    print("wrote", fname, f"(H={f(H)})")

lockup_stacked(TEXT_ON_DARK, TAG_ON_DARK, LAV_2, DEFS_DARK, "zyntrix-lockup-stacked.svg")
lockup_stacked(INK, INK_2, "#8A2BE2", DEFS_LIGHT, "zyntrix-lockup-stacked-light.svg")

# ------------------------------------------------------------------ 7. horizontal lockup (dark)
def lockup_horizontal(text_col, tag_col, sep_col, defs, fname):
    H = 256.0
    s_mark = 0.84
    mark_tx, mark_ty = 12.0, (H - 256 * s_mark) / 2
    s_word = 0.60
    wm = "ZYNTRIX"
    ww = text_w(wm, s_word)
    wx = mark_tx + 256 * s_mark + 34
    s_tag = 0.148
    tag, tw = tagline_block(0, 0, s_tag, tag_col, sep_col)
    block_h = 100 * s_word + 26 + 100 * s_tag
    top = (H - block_h) / 2
    wm_baseline = top + 100 * s_word
    tag_baseline = wm_baseline + 26 + 100 * s_tag
    W = wx + max(ww, tw) + 20
    body = (f'<g transform="translate({f(mark_tx)} {f(mark_ty)}) scale({f(s_mark)})">'
            + symbol_body("h", "url(#gz)", "url(#gr)", SPARK_C, LAV_2) + "</g>\n"
            + emit_word(wm, wx, wm_baseline, s_word, text_col)[0] + "\n"
            + tagline_block(wx, tag_baseline, s_tag, tag_col, sep_col)[0])
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(W)} {f(H)}" '
           f'width="{f(W)}" height="{f(H)}" role="img" aria-label="Zyntrix">\n<title>Zyntrix logo</title>\n'
           + defs + "\n" + body + "\n</svg>\n")
    with open(os.path.join(OUT, fname), "w") as fh:
        fh.write(svg)
    print("wrote", fname, f"(W={f(W)})")

lockup_horizontal(TEXT_ON_DARK, TAG_ON_DARK, LAV_2, DEFS_DARK, "zyntrix-lockup-horizontal.svg")
lockup_horizontal(INK, INK_2, "#8A2BE2", DEFS_LIGHT, "zyntrix-lockup-horizontal-light.svg")

print("done.")
