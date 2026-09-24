# Lumina — Spatial Particle Engine

An interactive 3D particle playground controlled with hand gestures, mouse input, and real-time sculpting tools. Lumina renders 35,000 particles inside a futuristic command interface built with Three.js, MediaPipe Hands, and Anime.js.

## Live demo

**[Launch Lumina on Vercel](https://particle-interaction-pi.vercel.app/)**

Allow camera access to use gesture controls. A desktop browser is recommended for the complete experience.

## Preview

[![Lumina desktop command interface](docs/screenshots/lumina-desktop.png)](https://particle-interaction-pi.vercel.app/)

<p align="center">
  <img src="docs/screenshots/lumina-mobile.png" alt="Lumina mobile particle interface" width="320">
</p>

## Highlights

- **35,000 real-time particles** with smooth transitions between models.
- **16 particle shapes:** Tree, Saturn, Heart, Sphere, Cube, Torus, Galaxy, DNA, Black Hole, Mobius Strip, Atom, Infinity Knot, Vortex Tunnel, Butterfly, Lotus, and Fire Tornado.
- **Dual-hand tracking** powered by MediaPipe Hands.
- **Gesture controls** for rotation, zooming, scaling, and particle grabbing.
- **Sculpt tools** with attract, repel, and drag modes.
- **Mouse controls** for orbiting, zooming, panning, and sculpting.
- **Visual controls** for particle color, size, morph speed, hand smoothing, and automatic rotation.
- **Futuristic command UI** with animated tabs, system telemetry, model filtering, a gesture-sensor monitor, and a built-in interaction guide.
- **Responsive layout** for desktop, tablet, and mobile screens.
- **Reduced-motion support** and keyboard-accessible controls.

## Particle models

| Classic models | Advanced models |
| --- | --- |
| Tree | Black Hole |
| Saturn | Mobius Strip |
| Heart | Atom |
| Sphere | Infinity Knot |
| Cube | Vortex Tunnel |
| Torus | Butterfly |
| Galaxy | Lotus |
| DNA | Fire Tornado |

Every model is generated mathematically in the browser. No external 3D model files are required.

## Gesture controls

| Gesture | Action |
| --- | --- |
| Move one open hand | Rotate the particle model |
| Make a fist and move toward or away from the camera | Zoom the model |
| Move two hands apart or together | Increase or decrease model scale |
| Pinch thumb and index finger while Sculpt Field is enabled | Grab and sculpt nearby particles |

Hand landmarks are smoothed across frames, while exponential averaging, dead zones, and fist hysteresis reduce jitter and accidental gesture changes.

## Mouse controls

| Input | Action |
| --- | --- |
| Left-drag | Orbit the camera |
| Scroll | Zoom |
| Right-drag | Pan |
| Left-drag with Sculpt Field enabled | Apply the selected sculpt tool |

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `F` | Toggle fullscreen |
| `H` | Collapse or expand the control dock |
| `C` | Pause or resume camera tracking |
| `V` | Hide or show the gesture-sensor monitor |
| `G` | Toggle Sculpt Field |
| `1` | Open the Matrix tab |
| `2` | Open the Visual tab |
| `3` | Open the Control tab |
| `Esc` | Close the system guide or cancel an active grab |

## Run locally

No build step or package installation is required. Serve the project through a local HTTP server so the browser can request camera permission.

```powershell
git clone https://github.com/smithplayz13-dev/Particle-Interaction.git
cd Particle-Interaction
python -m http.server 8000
```

Then open [http://127.0.0.1:8000/](http://127.0.0.1:8000/) in your browser.

> Camera access normally requires HTTPS or a trusted local origin such as `localhost` or `127.0.0.1`. Opening the HTML file directly with `file://` may prevent gesture tracking.

## Tech stack

- [Three.js](https://threejs.org/) r128 and OrbitControls for 3D rendering and camera movement.
- [MediaPipe Hands](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) and CameraUtils for hand landmark tracking.
- [Anime.js](https://animejs.com/) 3.2.2 for interface transitions and the boot sequence.
- Vanilla HTML, CSS, and JavaScript with no build system.

The required browser libraries and fonts are loaded from CDNs, so an internet connection is needed when running the project locally.

## Project structure

```text
.
├── index.html                           # Main Vercel entry point
├── Particle_Interaction_Dual_Hands.html # Standalone mirror of index.html
├── favicon.ico
├── favicon.svg
├── favicon.png
├── favicon-192.png
├── favicon-512.png
├── docs/
│   └── screenshots/                     # Desktop and mobile README previews
└── README.md
```

`index.html` and `Particle_Interaction_Dual_Hands.html` intentionally contain the same application and should remain synchronized.

## Deployment

The project is deployed as a static site on Vercel:

**https://particle-interaction-pi.vercel.app/**

Pushing changes to the connected production branch triggers a new deployment.

## Performance notes

- Particle target positions are generated once during initialization.
- The renderer caps device pixel ratio to reduce GPU load on high-density screens.
- Camera processing is throttled to a target of 30 FPS.
- Interface state polling is kept outside the Three.js render loop.
- UI animation uses transform and opacity where possible and respects `prefers-reduced-motion`.

## License

No license has been added yet. Until one is provided, the source remains under the repository owner's default copyright.
