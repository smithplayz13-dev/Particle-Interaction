# Lumina — 3D Particle Playground

Interactive 3D particle system with dual-hand gesture control. Built with **Three.js** + **MediaPipe Hands**.

Live: \index.html\ (GitHub Pages) — open via \https://smithplayz13-dev.github.io/Particle-Interaction/\ after enabling Pages.

## Features
- 35,000 particles morphing between **8 shapes: Tree / Saturn / Heart / Sphere / Cube / Torus / Galaxy / DNA**
- **Dual-hand** tracking: 1-hand fist zoom + 2-hand spread/pinch zoom, averaged rotation
- Smoothed detection (landmark averaging, fist hysteresis, EMA + deadzone, hold on drop)
- Premium glass UI with shape cards, palette, size/speed/smoothing sliders, hand skeleton overlay

## Run locally
\\\powershell
# from this folder
python -m http.server 8000
# then open
http://127.0.0.1:8000/index.html
# or http://127.0.0.1:8000/Particle_Interaction_Dual_Hands.html
\\\
Requires \http://localhost\ or \127.0.0.1\ for camera permission (browsers block \ile://\).

## Files
- \index.html\ — main app (English, dual-hand, smoothed)
- \Particle_Interaction_Dual_Hands.html\ — same as index

## Controls
- **1 hand:** move to rotate • fist + push/pull to zoom
- **2 hands:** midpoint rotates • spread/pinch to zoom
- **Mouse:** drag orbit • scroll zoom • right-drag pan
- **Keys:** \F\ fullscreen, \H\ hide panel, \C\ toggle camera

## Tech
Three.js r128, OrbitControls, MediaPipe Hands + CameraUtils via CDN.
