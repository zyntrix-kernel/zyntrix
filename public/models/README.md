# Zyntrix — real 3D model assets

Production-grade GLTF models woven into the scroll-film
(`src/lib/cinema/objects/props.ts`). All files are served locally — no
third-party CDN at runtime. DRACO-compressed assets decode in-process via
the bundled decoder in `public/models/draco/` (Google Draco, Apache-2.0,
from the three.js project).

| File                   | Used in              | Source                                      |
| ---------------------- | -------------------- | ------------------------------------------- |
| `gears.glb`            | Ch. 02 — theme engine (machined gear train) | three.js examples (`mrdoob/three.js`, `examples/models/gltf`) |
| `ShaderBall.glb`       | Ch. 03 — instrument chamber (calibration ball; backdrop re-bound to the live surface role) | three.js examples |
| `steampunk_camera.glb` | Ch. 05 — product film (vintage cinema camera on an authored tripod) | three.js examples |
| `IridescenceLamp.glb`  | Ch. 08 — the reveal (desk lamp with transmission + thin-film iridescence glass) | three.js examples |

The three.js example assets are distributed through the three.js repository
(MIT-licensed project; individual models carry their own permissive
upstream licenses — CC0/CC-BY/Apache per the three.js asset manifests) and
are widely reused in three.js demos. No model here is used as branding or
redistributed as a standalone asset pack; they appear as scene props inside
this application only.

All theme-reactive colors (accent rings, gear steel tone, the chrome ball,
lamp light) are resolved through the M3 ThemeBinder — nothing hardcodes a
palette color.
