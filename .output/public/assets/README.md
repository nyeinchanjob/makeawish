# Festival assets

The app loads these supplied files from the public root:

- `/background.png`: full-screen festival background, preloaded in the document head.
- `/qr-code.png`: QR image in the display's padded white card. Encode the deployed
  `/submit` URL before the event; clicking the card also opens `/submit`.
- `/TCCC-UnityText-Regular.ttf`: preloaded local font, applied globally at line-height 1.6.

No runtime HEAD probes, external font requests or placeholder assets are required.
`/assets/` is reserved for Vite's generated bundles at build time.
