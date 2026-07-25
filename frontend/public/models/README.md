# Hero 3D model

The homepage hero (`src/components/YogaHero3D.js`) loads a real 3D figure from
this folder. Drop a file here and it auto-centers, auto-scales, and plays any
embedded animation. Until a file exists, the hero shows an ambient glowing ring.

Accepted (first one found wins):

- `yoga.fbx` — a Mixamo export (preferred: carries the animation), **or**
- `yoga.glb` — any glTF-binary model.

## Getting a model from Mixamo (free, royalty-free)

1. Go to https://www.mixamo.com and sign in (free Adobe account).
2. **Characters** tab → pick a female character (e.g. *Michelle*, *Kaya*, *Sophie*).
3. **Animations** tab → search `seated`, `yoga`, `meditat`, or `sitting`.
   Pick one you like (e.g. *Seated Idle*). Tick **In Place** if offered.
4. **Download** with: Format **FBX Binary (.fbx)**, Skin **With Skin**,
   30 fps, no keyframe reduction.
5. Rename the download to **`yoga.fbx`** and put it in this folder.
6. Commit + push (the file must be in the repo for Vercel to serve it).

Keep the file under ~15 MB if you can.

## Tuning knobs (top of YogaHero3D.js)

- `TARGET_HEIGHT` — overall size on the ring.
- `MODEL_Y_OFFSET` — nudge up/down if the figure floats or sinks.
- `INITIAL_ROTATION_Y` — set to `Math.PI` if the model faces away from camera.
