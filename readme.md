# POYO — Pocket Yoga

POYO is an AI-assisted yoga web app. You pick a pose, turn on your webcam, and the app watches your body in real time: it draws a live skeleton over you, recognizes whether you're actually holding the selected pose, and — when you are — turns the skeleton green, starts a timer, and plays audio feedback. Your best hold times are saved, ranked on a leaderboard, and there's an AI planner that builds a personalized routine plus an admin portal to manage users.

Under the hood it combines a **React** frontend, an **Express + MongoDB** backend with **custom JWT authentication**, **TensorFlow.js** running a pose model in the browser, and a **custom-trained pose classifier** built from an image dataset.

---

## Table of contents

- [Features](#features)
- [How it works (the 10-second version)](#how-it-works-the-10-second-version)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [The classification model (in depth)](#the-classification-model-in-depth)
- [Environment variables](#environment-variables)
- [Local setup](#local-setup)
- [Admin account](#admin-account)
- [Google Sign-In setup](#google-sign-in-setup)
- [AI planner (Groq)](#ai-planner-groq)
- [API reference](#api-reference)
- [Deployment (Vercel + MongoDB Atlas)](#deployment-vercel--mongodb-atlas)
- [Analytics](#analytics)
- [Security notes](#security-notes)

---

## Features

- **Live pose practice** through your webcam with a real-time skeleton overlay.
- **Pose recognition** for Tree, Chair, Cobra, Warrior, Dog, and Shoulderstand.
- **Hold timer + audio feedback** that only runs while you actually hold the pose correctly.
- **Custom email/password auth** (JWT + bcrypt) — sign up, log in, profiles.
- **Google Sign-In** (optional) via Google Identity Services.
- **Personal profile** with cumulative practice time and best time per pose.
- **Leaderboard** per pose.
- **AI yoga planner** that generates a routine from your age, height, weight, and experience.
- **Admin portal** with full user management (create, edit, promote/demote, delete) and usage stats.
- **Offline training pipeline** to (re)build the pose classifier from your own images.

---

## How it works (the 10-second version)

```
Webcam frame
   │
   ▼
MoveNet (TensorFlow.js)  ──►  17 body keypoints (x, y, confidence)
   │
   ▼
Normalize landmarks       ──►  34-number "pose embedding" (position/scale independent)
   │
   ▼
Pose classifier (TF.js)   ──►  probability for each pose class
   │
   ▼
If P(selected pose) > 0.97  ──►  skeleton turns green, timer runs, audio plays
   │
   ▼
On stop: best time is saved to MongoDB (cumulative time, per-pose best, leaderboard)
```

Everything from the webcam to the prediction happens **in the browser** — no video ever leaves your device. Only the final numbers (your best hold time) are sent to the backend.

---

## Tech stack

**Frontend**
- React 18 (Create React App), React Router
- Context-based JWT auth (token stored in `localStorage`)
- TensorFlow.js + `@tensorflow-models/pose-detection` (MoveNet)
- `react-webcam`, Chakra UI, Tailwind CSS, Axios, Chart.js
- Vercel Analytics

**Backend**
- Node.js 20, Express
- MongoDB with Mongoose
- Auth: `jsonwebtoken` (JWT) + `bcryptjs` (password hashing)
- `google-auth-library` (verifies Google sign-in tokens)
- OpenAI SDK pointed at **Groq** (free, OpenAI-compatible) for the AI planner

**Machine learning (offline)**
- Python, TensorFlow / Keras
- MoveNet Thunder (TensorFlow Lite) for keypoint detection
- OpenCV, pandas, NumPy, scikit-learn
- `tensorflowjs` to export the trained model for the browser

---

## Project structure

```text
.
├── backend/
│   ├── server.js              # Express API: auth, user data, leaderboard, admin, AI planner
│   ├── authMiddleware.js      # JWT signing + requireAuth / requireAdmin guards
│   ├── seedAdmin.js           # Creates the first admin (npm run seed:admin)
│   ├── userModel.js           # User schema: email, hashed password, role, googleId
│   ├── bestModel.js           # Per-user best pose times + cumulative time
│   └── performanceModel.js    # Daily per-pose performance
├── frontend/
│   ├── public/
│   │   └── model/             # The trained TF.js classifier served to the browser
│   ├── src/
│   │   ├── components/        # NavBar, ProtectedRoute, GoogleSignInButton, landing, footer
│   │   ├── context/           # AuthContext (login/register/logout state)
│   │   ├── pages/             # Home, Yoga, Profile, About(planner), Login, Signup, Admin
│   │   └── utils/             # apiClient (axios+token), pose math, images, audio
│   └── vercel-note: build is a static bundle
├── classification model/       # Offline ML pipeline (not deployed)
│   ├── yoga_poses/            # Training/test images, one folder per pose class
│   ├── movenet.py            # TFLite MoveNet wrapper (keypoint detection)
│   ├── data.py               # BodyPart enum + shared data types
│   ├── proprocessing.py      # Images ──► keypoint CSVs (train_data.csv / test_data.csv)
│   ├── training.py           # CSVs ──► trained classifier ──► TF.js export
│   ├── train_data.csv        # Extracted keypoints for training
│   ├── test_data.csv         # Extracted keypoints for testing
│   └── movenet_thunder.tflite # The downloaded MoveNet model
├── vercel.json                # Multi-service deploy config (frontend + backend)
└── readme.md
```

---

## The classification model (in depth)

Recognizing a yoga pose directly from raw camera pixels would need a large image model and a lot of data. POYO uses a lighter, more robust **two-stage** approach instead:

1. **Pose estimation** — a pretrained model (MoveNet) finds *where the body is* (17 joints).
2. **Pose classification** — a small custom neural network decides *which yoga pose those joints form*.

The big advantage: stage 2 never sees pixels. It only sees 34 numbers describing body geometry, so it's small, fast, trains on modest data, and generalizes across clothing, lighting, backgrounds, and skin tone.

### Stage 1 — MoveNet keypoint detection

[MoveNet Thunder](https://www.tensorflow.org/hub/tutorials/movenet) (the "Thunder" = higher-accuracy variant) detects **17 body keypoints** in the COCO format. Each keypoint has an `x`, a `y`, and a confidence `score`:

```
0 nose        5 left_shoulder   11 left_hip     15 left_ankle
1 left_eye    6 right_shoulder  12 right_hip    16 right_ankle
2 right_eye   7 left_elbow      13 left_knee
3 left_ear    8 right_elbow     14 right_knee
4 right_ear   9 left_wrist
              10 right_wrist
```

- **Offline (training):** `movenet.py` runs the TFLite model on dataset images.
- **In the browser (live):** the same MoveNet, via `@tensorflow-models/pose-detection` (`SINGLEPOSE_THUNDER`), runs on webcam frames.

Using the same keypoint model in both places is what makes training and live inference line up.

### The dataset

Images live under `classification model/yoga_poses/`, one subfolder per class:

```
yoga_poses/
├── train/
│   ├── chair/  cobra/  dog/  no_pose/  shoudler_stand/  traingle/  tree/  warrior/
└── test/
    └── (same folders)
```

That's **8 classes**, including a `no_pose` "none of the above" class so the model can say *"you're not doing any target pose."* The folder name becomes the label, and folders are sorted alphabetically to assign a class number (chair = 0, cobra = 1, dog = 2, no_pose = 3, shoulderstand = 4, triangle = 5, tree = 6, warrior = 7). The live app surfaces 6 of these poses to users.

### Stage 2a — Preprocessing: images → keypoint CSVs

`proprocessing.py` turns the image folders into two flat tables (`train_data.csv`, `test_data.csv`):

1. Download MoveNet Thunder (TFLite, float16) if it isn't present.
2. For every image, run MoveNet **3 times** — the first detection finds the person, and the next passes re-crop around them to sharpen the keypoints.
3. **Quality filter:** if the *lowest* keypoint confidence in an image is below `0.1`, the image is skipped (bad/occluded detections don't pollute the data). Non-RGB images are skipped too.
4. Write one row per image: the filename, then **51 numbers** = 17 keypoints × (`x`, `y`, `score`), plus the class number and class name.

Each per-class CSV is then merged into one file with named columns like `LEFT_SHOULDER_x`, `LEFT_SHOULDER_y`, `LEFT_SHOULDER_score`, and so on.

### Stage 2b — Landmark normalization (the important trick)

Raw keypoint coordinates depend on *where you stand* and *how big you appear* in the frame — useless for classification. `training.py` converts the 51 raw numbers into a **34-number embedding** that is invariant to position and scale:

1. **Reshape** the 51 values into a `(17, 3)` matrix and keep only `(x, y)` → `(17, 2)`.
2. **Translate:** compute the pose center (midpoint of the two hips) and subtract it from every keypoint, so the body is centered at the origin.
3. **Scale:** compute a `pose_size` and divide every coordinate by it. `pose_size` is the larger of:
   - the torso length (shoulder-center to hip-center) × 2.5, and
   - the maximum distance from the pose center to any keypoint.
4. **Flatten** the normalized `(17, 2)` back into a 34-length vector.

After this, the *same* pose produces (nearly) the *same* 34 numbers whether you're close or far, left or right in the frame. That's what lets a small network learn poses from limited data.

> The browser reproduces this exact math in `frontend/src/pages/Yoga/Yoga.js` (`get_center_point`, `get_pose_size`, `normalize_pose_landmarks`, `landmarks_to_embedding`). Training normalization and live normalization must match, or the model would see different inputs than it trained on.

### Stage 2c — Model architecture

A compact fully-connected network (defined in `training.py`):

```
Input(34)
  → Dense(128, relu6)
  → Dropout(0.5)
  → Dense(64, relu6)
  → Dropout(0.5)
  → Dense(num_classes, softmax)
```

- **`relu6`** is a bounded ReLU (caps activations at 6), which keeps values stable and is friendly to lightweight/quantized deployment.
- **Dropout 0.5** after each hidden layer is heavy regularization — important because the input is tiny (34 features) and easy to overfit.
- **Softmax** output gives a probability per pose class.

### Stage 2d — Training configuration

- **Split:** the training CSV is further split 85% train / 15% validation; the test CSV is held out for final evaluation.
- **Loss / optimizer:** categorical cross-entropy, Adam.
- **Epochs / batch:** up to 200 epochs, batch size 16.
- **Checkpointing:** `ModelCheckpoint` saves the weights with the best validation accuracy to `weights.best.hdf5`.
- **Early stopping:** training halts if validation accuracy doesn't improve for 20 epochs.
- **Evaluation:** the final model is scored on the untouched test set.

### Stage 2e — Export for the browser

After training, `training.py`:
- exports a **TensorFlow.js** model (`model.json` + a weights `.bin`) into `classification model/model/`, and
- saves a Keras copy (`model.keras`).

The TF.js `model/` folder is copied into `frontend/public/model/`, and the frontend loads it at runtime via `REACT_APP_MODEL_URL` (`/model/model.json`).

### Live inference, end to end

In `Yoga.js`, every ~100 ms:
1. MoveNet detects 17 keypoints from the current webcam frame.
2. Low-confidence keypoints are ignored; if too many are missing, the skeleton stays white.
3. The keypoints are normalized into the 34-number embedding (same math as training).
4. The classifier predicts probabilities for all classes.
5. If the **selected** pose's probability exceeds **0.97**, the pose counts as "held": the skeleton turns green, the timer advances, and the count audio plays. Otherwise it resets.

### Retraining the model

```bash
cd "classification model"

# 1) Put labeled images in yoga_poses/train/<pose>/ and yoga_poses/test/<pose>/
# 2) Extract keypoints into CSVs:
python proprocessing.py
# 3) Train + evaluate + export TF.js model:
python training.py
# 4) Copy the fresh model into the frontend:
cp -r model/* ../frontend/public/model/
```

If you change the set of pose classes, also update the class list/`CLASS_NO` map in `frontend/src/pages/Yoga/Yoga.js`.

---

## Environment variables

Both `.env` files are gitignored. Copy the provided `.env.example` files and fill in real values.

### Frontend — `frontend/.env`

```env
REACT_APP_MODEL_URL=/model/model.json
REACT_APP_API_BASE=http://localhost:4000
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

- `REACT_APP_MODEL_URL` — path to the TF.js classifier (served from `public/model/`).
- `REACT_APP_API_BASE` — the single base URL for all backend calls. In production, set it to your deployed URL.
- `REACT_APP_GOOGLE_CLIENT_ID` — enables the Google button (leave as-is to hide it). See [Google Sign-In setup](#google-sign-in-setup).

### Backend — `backend/.env`

```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
CLIENT_ORIGIN=http://localhost:3000
PORT=4000

# Used once by: npm run seed:admin
ADMIN_EMAIL=admin@poyo.com
ADMIN_PASSWORD=ChangeMe123!
```

- `JWT_SECRET` — signs auth tokens; keep it long, random, and private.
- `GROQ_API_KEY` — powers the AI planner (see [AI planner](#ai-planner-groq)).
- `GOOGLE_CLIENT_ID` — the backend verifies Google tokens against this.
- `CLIENT_ORIGIN` — allowed CORS origin (your frontend URL).
- `PORT` — local port. On Vercel/hosts this is provided automatically; don't hard-code it there.

---

## Local setup

**Prerequisites:** Node.js 20, a MongoDB connection string (e.g. MongoDB Atlas free tier).

```bash
# Backend
cd backend
npm install
npm run seed:admin      # create the admin from ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev             # http://localhost:4000

# Frontend (in a second terminal)
cd frontend
npm install
npm start               # http://localhost:3000
```

> Port 4000 is used because macOS occupies port 5000 (AirPlay Receiver).

---

## Admin account

Create/update the admin with the seed script (reads `ADMIN_EMAIL` / `ADMIN_PASSWORD`):

```bash
cd backend
npm run seed:admin
```

Then sign in at **`/admin/login`**. The dashboard lets an admin view usage stats and create, edit, promote/demote, and delete users. Guardrails prevent deleting your own account or removing the last remaining admin. You can change the admin password from the dashboard (edit your row) or by re-running the seed with a new `ADMIN_PASSWORD`.

---

## Google Sign-In setup

Optional — email/password works without it, and the button stays hidden until configured.

1. In the [Google Cloud Console](https://console.cloud.google.com/), create/select a project.
2. **APIs & Services → OAuth consent screen** → set up as *External*, add yourself as a test user (publish it for production).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**.
4. Under **Authorized JavaScript origins**, add your frontend origin(s):
   - `http://localhost:3000` (local)
   - your deployed frontend URL (production, HTTPS)
5. Copy the **Client ID** (`…apps.googleusercontent.com`) into **both** `GOOGLE_CLIENT_ID` (backend) and `REACT_APP_GOOGLE_CLIENT_ID` (frontend).
6. Restart both servers.

Flow: the frontend shows Google's button → Google returns a signed ID token → the frontend posts it to `POST /api/auth/google` → the backend verifies it against `GOOGLE_CLIENT_ID`, then finds or creates the user and issues a normal POYO JWT. A Google email that matches an existing account is linked to it.

---

## AI planner (Groq)

The planner calls a **free, OpenAI-compatible** model on [Groq](https://groq.com). Because the API is OpenAI-compatible, the backend keeps using the OpenAI SDK and just points it at Groq:

```js
new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
// model: 'llama-3.3-70b-versatile'
```

Get a free key at [console.groq.com/keys](https://console.groq.com/keys) and set `GROQ_API_KEY`. The key stays **server-side only** — the browser calls `POST /api/generate-plan`, which proxies Groq, so the key is never shipped to users. (Any OpenAI-compatible provider works by swapping the `baseURL`, key, and model.)

---

## API reference

**Auth**
- `POST /api/auth/register` — create an account, returns a JWT
- `POST /api/auth/login` — sign in, returns a JWT
- `POST /api/auth/google` — verify a Google ID token, find/create user, returns a JWT
- `GET  /api/auth/me` — current user from the token

**User data** (require a valid token; the user is derived from the token)
- `POST /api/update-best-time` — update cumulative time + per-pose best
- `POST /api/update-performance` — update today's per-pose performance
- `GET  /api/profile` — current user's profile + best times
- `GET  /api/best-times` — current user's best-time records
- `GET  /api/get-performance` — current user's performance history
- `GET  /api/leaderboard?pose=PoseName` — leaderboard for a pose

**Admin** (require an admin token)
- `GET    /api/admin/stats` — user counts + total practice time
- `GET    /api/admin/users?search=…` — list/search users
- `GET    /api/admin/users/:id` — one user + their best times
- `POST   /api/admin/users` — create a user
- `PUT    /api/admin/users/:id` — update a user (name, email, role, password)
- `DELETE /api/admin/users/:id` — delete a user + their data

**Other**
- `POST /api/generate-plan` — AI yoga plan via the Groq proxy

---

## Deployment (Vercel + MongoDB Atlas)

The whole app is a **monorepo** deployed to Vercel as **two services under one domain**, described by `vercel.json`:

```json
{
  "services": {
    "frontend": { "root": "frontend", "framework": "create-react-app" },
    "backend":  { "root": "backend", "entrypoint": "server.js" }
  },
  "rewrites": [
    { "source": "/api/(.*)?", "destination": { "type": "service", "service": "backend" } },
    { "source": "/(.*)",       "destination": { "type": "service", "service": "frontend" } }
  ]
}
```

- Requests to `/api/*` go to the Express backend; everything else serves the React app. Because they share one origin, there's no cross-origin/CORS complexity.
- On the Vercel deploy screen: **Root Directory = `./`**, and leave Build/Output/Install commands empty (each service builds from its own folder).
- Set the env vars in Vercel's dashboard (not `.env` files). Point `REACT_APP_API_BASE` and `CLIENT_ORIGIN` at your deployed domain, then redeploy (frontend env vars are baked in at build time). Don't set `PORT`.

**MongoDB Atlas:** because Vercel's backend uses dynamic outbound IPs, set **Network Access → `0.0.0.0/0`** so the deployed backend can connect. The backend also caches its Mongo connection so serverless cold starts reuse a single connection instead of exhausting Atlas's limit.

---

## Analytics

[Vercel Analytics](https://vercel.com/docs/analytics) is enabled via `@vercel/analytics`. `<Analytics />` (mounted in `frontend/src/index.js`) records page views across **all** routes, including the admin pages. The admin dashboard also emits custom events (`admin_user_created`, `admin_user_updated`, `admin_user_deleted`) so administrative actions show up in the Analytics dashboard.

---

## Security notes

- Keep MongoDB, JWT, Google, and Groq secrets out of committed source — the `.env` files are gitignored; set real values in the host's dashboard.
- Passwords are hashed with bcrypt; tokens are signed JWTs (7-day expiry). The password hash is never returned by the API.
- The AI provider key lives only on the backend and is proxied, never exposed to the browser.
- If a secret is ever committed or exposed, rotate it immediately.
