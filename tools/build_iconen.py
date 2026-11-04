"""Maakt het favicon, de app-iconen en de deelafbeelding (og-image) van de site.

Het icoon is het kompas uit de menubalk: wit op het rood van de site.
    python tools/build_iconen.py
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOD = (214, 40, 40)
WIT = (255, 255, 255)
# De ster uit het logo (viewBox 32x32), zie .brand in index.html
STER = [(16, 5), (19.4, 13.6), (28, 16), (19.4, 18.4), (16, 27), (12.6, 18.4), (4, 16), (12.6, 13.6)]

SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect width="32" height="32" rx="7" fill="#d62828"/>
<circle cx="16" cy="16" r="12" fill="none" stroke="#fff" stroke-width="1.8"/>
<path d="M16 6.87L18.82 14.01 25.96 16 18.82 17.99 16 25.13 13.18 17.99 6.04 16 13.18 14.01z" fill="#fff"/>
</svg>
"""


def icoon(px, vol=False):
    """vol=True: rood tot de rand (voor maskable en apple-touch), anders afgeronde hoeken."""
    s = 1024 / 32
    im = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if vol:
        d.rectangle([0, 0, 1024, 1024], fill=ROOD)
        schaal, m = 0.72, 16  # binnen de veilige zone van een maskable icoon
    else:
        d.rounded_rectangle([0, 0, 1023, 1023], radius=7 * s, fill=ROOD)
        schaal, m = 1, 16
    r, w = 12 * s * schaal, 1.8 * s * schaal
    c = m * s
    d.ellipse([c - r - w / 2, c - r - w / 2, c + r + w / 2, c + r + w / 2], outline=WIT, width=round(w))
    # ster iets kleiner dan in het logo, zodat hij binnen de ring past
    ster = [(c + (x - 16) * s * schaal * 0.83, c + (y - 16) * s * schaal * 0.83) for x, y in STER]
    d.polygon(ster, fill=WIT)
    return im.resize((px, px), Image.LANCZOS)


def og_beeld():
    """1200x630: sfeerfoto, rood waas, logo en naam. Voor delen op WhatsApp, LinkedIn, enz."""
    W, H = 1200, 630
    foto = Image.open(os.path.join(SITE, "img", "sfeer", "fiets.jpg")).convert("RGB")
    k = max(W / foto.width, H / foto.height)
    foto = foto.resize((round(foto.width * k), round(foto.height * k)), Image.LANCZOS)
    foto = foto.crop(((foto.width - W) // 2, (foto.height - H) // 2, (foto.width - W) // 2 + W, (foto.height - H) // 2 + H))
    im = foto.filter(ImageFilter.GaussianBlur(1.5))
    # donker verloop van links naar rechts, zodat de tekst leesbaar is
    waas = Image.new("RGBA", (W, H))
    wd = ImageDraw.Draw(waas)
    for x in range(W):
        a = int(235 - 150 * x / W)
        wd.line([(x, 0), (x, H)], fill=(20, 16, 22, a))
    im = Image.alpha_composite(im.convert("RGBA"), waas)
    d = ImageDraw.Draw(im)
    d.rectangle([0, H - 14, W, H], fill=ROOD)
    f = lambda n, g: ImageFont.truetype(os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts", n), g)
    im.alpha_composite(icoon(120), (80, 84))
    d.text((80, 250), "Wat studeer je", font=f("seguibl.ttf", 82), fill=WIT)
    d.text((80, 340), "eigenlijk", font=f("seguibl.ttf", 82), fill=WIT)
    d.text((80 + d.textlength("eigenlijk", font=f("seguibl.ttf", 82)), 340), "?", font=f("seguibl.ttf", 82), fill=(255, 107, 107))
    d.text((82, 462), "Studiekeuze in gewone taal, voor leerlingen én ouders", font=f("segoeui.ttf", 34), fill=(236, 236, 241))
    d.text((82, 516), "watstudeerje.nl", font=f("segoeuib.ttf", 30), fill=(255, 107, 107))
    return im.convert("RGB")


def main():
    open(os.path.join(SITE, "favicon.svg"), "w", encoding="utf-8").write(SVG)
    icoon(256).save(os.path.join(SITE, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    icoon(180, vol=True).convert("RGB").save(os.path.join(SITE, "apple-touch-icon.png"), optimize=True)
    icoon(192).save(os.path.join(SITE, "icon-192.png"), optimize=True)
    icoon(512).save(os.path.join(SITE, "icon-512.png"), optimize=True)
    icoon(512, vol=True).save(os.path.join(SITE, "icon-maskable.png"), optimize=True)
    og_beeld().save(os.path.join(SITE, "og-image.jpg"), quality=86, optimize=True, progressive=True)
    print("iconen en og-image gemaakt")


if __name__ == "__main__":
    main()
