# Festival assets

Add the provided Ta Saung Tine background at `background.png` and event QR
image at `qr.png`. The display checks for `/assets/qr.png`; until it exists,
it shows a labeled placeholder instead of a broken image.

No TCCC Unity Text or custom Myanmar font files are currently present. To use
the requested display typeface, add
`fonts/TCCC-UnityText-Regular.woff2` and `fonts/TCCC-UnityText-Bold.woff2`.
The app falls back to Myanmar-compatible system fonts when those files are
missing. A custom Myanmar font can be added at `fonts/myanmar.woff2`.

The local Vite development API reads and updates `src/lib/mock-lanterns.json`.
It is a development prototype only; deployed hosting needs a server API and
company-managed authentication.
