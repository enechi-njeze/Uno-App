# Unö — brand assets

Wordmark: "Unö" — the two umlaut dots over the **ö** are the brand's signature,
in red. Dots are centered on the o.

## Palette
| Token        | Hex       | Use                                   |
|--------------|-----------|---------------------------------------|
| Unö Green    | `#0B3D2E` | Primary letters, app bg, brand colour |
| Umlaut Red   | `#D7263D` | The two ö dots (accent only)          |
| Off-white    | `#F5F6F5` | App background, light surfaces         |
| Ink          | `#111111` | Mono/print                            |
| White        | `#FFFFFF` | Reversed / knockout                   |

## Files
- `uno-wordmark-<palette>.svg` + `-256/-512/-1024.png` — scalable wordmark.
  Palettes: `primary` (green+red), `white` (white+red), `mono-green`,
  `mono-black`, `mono-white`.
- `uno-icon-<variant>.svg` + `-1024/-512/-192/-180.png` — app icon.
  Variants: `green` (primary), `white`, `black`, `red`.
- `uno-icon-foreground.png` — Android adaptive-icon foreground.
- `uno-splash.png` — launch screen (white wordmark on green).
- Convenience aliases: `uno-wordmark.svg/png` (= primary), `uno-icon.svg/png`
  (= green), used by `app.json`.

SVGs are the source of truth — scale to any size. Regenerate PNGs with
`/tmp/build-brand.js` (kept in the commit history) if palettes change.

Note: current typeface is a bold grotesque (DejaVu Sans Bold fallback). Swap
for a licensed display face when one is chosen; positions are font-relative and
would be re-measured.
