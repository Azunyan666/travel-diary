"""生成行迹的 PWA 图标：暖纸底 + 林绿圆 + 白色定位针 + 赤陶圆点。

用法：python scripts/make-icons.py
依赖：Pillow
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

PAPER = (247, 243, 234, 255)
FOREST = (47, 93, 80, 255)
CLAY = (222, 106, 62, 255)


def draw_icon(size: int, *, background: tuple, disc: bool, pin: tuple, dot: tuple) -> Image.Image:
    ss = 4
    w = size * ss
    img = Image.new("RGBA", (w, w), background)
    d = ImageDraw.Draw(img)

    cx = cy = w / 2

    if disc:
        r = w * 0.36
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=FOREST)

    pr = w * 0.15
    pcx, pcy = cx, cy - w * 0.05
    d.ellipse([pcx - pr, pcy - pr, pcx + pr, pcy + pr], fill=pin)
    d.polygon(
        [
            (pcx - pr * 0.84, pcy + pr * 0.45),
            (pcx + pr * 0.84, pcy + pr * 0.45),
            (pcx, cy + w * 0.205),
        ],
        fill=pin,
    )

    dr = w * 0.052
    d.ellipse([pcx - dr, pcy - dr, pcx + dr, pcy + dr], fill=dot)

    return img.resize((size, size), Image.LANCZOS)


icons = {
    "icon-192.png": draw_icon(192, background=PAPER, disc=True, pin=PAPER, dot=CLAY),
    "icon-512.png": draw_icon(512, background=PAPER, disc=True, pin=PAPER, dot=CLAY),
    "icon-maskable-512.png": draw_icon(512, background=FOREST, disc=False, pin=PAPER, dot=CLAY),
    "apple-touch-icon.png": draw_icon(180, background=PAPER, disc=True, pin=PAPER, dot=CLAY),
}

for name, image in icons.items():
    image.save(OUT / name, "PNG", optimize=True)
    print(name, image.size)
