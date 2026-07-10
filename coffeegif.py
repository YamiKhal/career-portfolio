from PIL import Image, ImageDraw, ImageFont

frames = [
r"""
   ((
    ))
   ((
.........
|       |]
\       /
 \_____/
""",
r"""
    ((
   ((
    ))
.........
|       |]
\       /
 \_____/
""",
r"""
    ))
   ((
   ((
.........
|       |]
\       /
 \_____/
""",
r"""
    ))
    ))
   ((
.........
|       |]
\       /
 \_____/
""",
]

FONT_SIZE = 22
PADDING = 12
FRAME_DURATION = 350

BACKGROUND = (19, 21, 26)          # #13151A
FOREGROUND = (194, 198, 214)       # #C2C6D6
BORDER_TOP_LEFT = (79, 83, 122)    # #4F537A
BORDER_BOTTOM_RIGHT = (114, 120, 181) # #7278B5

font = None
for name in [
    "CascadiaMono.ttf",
    "CascadiaCode.ttf",
    "JetBrainsMono-Regular.ttf",
    "Consola.ttf",
    "DejaVuSansMono.ttf",
]:
    try:
        font = ImageFont.truetype(name, FONT_SIZE)
        break
    except OSError:
        pass

if font is None:
    font = ImageFont.load_default()

dummy = Image.new("RGB", (1, 1))
draw = ImageDraw.Draw(dummy)

clean_frames = [frame.strip("\n") for frame in frames]

max_width = 0
max_height = 0

for frame in clean_frames:
    bbox = draw.multiline_textbbox((0, 0), frame, font=font, spacing=0)
    max_width = max(max_width, bbox[2] - bbox[0])
    max_height = max(max_height, bbox[3] - bbox[1])

images = []

for frame in clean_frames:
    width = max_width + PADDING * 2
    height = max_height + PADDING * 2

    img = Image.new("RGB", (width, height), BACKGROUND)
    draw = ImageDraw.Draw(img)

    BORDER = 2

    # Top
    draw.rectangle((0, 0, width - 1, BORDER - 1), fill=BORDER_TOP_LEFT)

    # Left
    draw.rectangle((0, 0, BORDER - 1, height - 1), fill=BORDER_TOP_LEFT)

    # Bottom
    draw.rectangle((0, height - BORDER, width - 1, height - 1), fill=BORDER_BOTTOM_RIGHT)

    # Right
    draw.rectangle((width - BORDER, 0, width - 1, height - 1), fill=BORDER_BOTTOM_RIGHT)

    draw.multiline_text(
        (PADDING, PADDING),
        frame,
        font=font,
        fill=FOREGROUND,
        spacing=0,
    )

    images.append(img)

images[0].save(
    "coffee.gif",
    save_all=True,
    append_images=images[1:],
    duration=FRAME_DURATION,
    loop=0,
    optimize=True,
)

print("Saved coffee.gif")