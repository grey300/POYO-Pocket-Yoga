# POYO - Pocket Yoga

POYO is an AI-assisted yoga web application that helps users learn yoga poses, practice with live webcam feedback, generate a personalized yoga plan, and track their pose performance over time.

The project combines a React frontend, an Express/MongoDB backend, custom JWT authentication, TensorFlow.js pose detection, and a custom yoga pose classifier trained from image datasets.

## Features

- Live yoga pose practice through webcam input.
- Real-time skeleton overlay powered by TensorFlow.js MoveNet.
- Pose classification for Tree, Chair, Cobra, Warrior, Dog, and Shoulderstand.
- Audio feedback while the selected pose is held correctly.
- Custom email/password authentication (JWT + bcrypt) for signup, login, and profile access.
- Role-based access with a separate admin portal and full user management (create, edit, promote/demote, delete).
- User profile with cumulative practice time and best pose times.
- Pose-specific leaderboard.
- Yoga class pages with pose details and instructions.
- AI yoga planner that generates a plan from age, height, weight, and experience level.
- Offline model training and preprocessing scripts for yoga pose classification.

## Tech Stack

### Frontend

- React 18
- Create React App
- React Router
- Context-based JWT auth (token in `localStorage`)
- TensorFlow.js
- `@tensorflow-models/pose-detection`
- React Webcam
- Chakra UI
- Tailwind CSS
- Axios
- Chart.js

### Backend

- Node.js 20
- Express
- MongoDB with Mongoose
- JWT auth (`jsonwebtoken`) with `bcryptjs` password hashing
- OpenAI SDK (server-side proxy for the AI planner)
- CORS
- dotenv

### Machine Learning

- Python
- TensorFlow / Keras
- TensorFlow Lite MoveNet Thunder
- TensorFlow.js model export
- OpenCV, pandas, NumPy, scikit-learn

## Project Structure

```text
.
|-- backend/
|   |-- server.js                 # Express API: auth, user data, leaderboard, admin, AI planner routes
|   |-- authMiddleware.js         # JWT signing + requireAuth / requireAdmin guards
|   |-- seedAdmin.js              # Creates the first admin from env (npm run seed:admin)
|   |-- userModel.js              # User schema: email, hashed password, role
|   |-- bestModel.js              # Best pose time and cumulative time schema
|   |-- performanceModel.js       # Daily per-pose performance schema
|   `-- package.json
|-- frontend/
|   |-- public/                   # Static assets, app shell, served TF.js model
|   |-- src/
|   |   |-- components/           # Navbar, ProtectedRoute, landing, sliders, footer
|   |   |-- context/             # AuthContext (login/register/logout state)
|   |   |-- pages/                # Home, Yoga, Profile, AI planner, Login, Signup, Admin
|   |   |-- utils/                # apiClient (axios+token), pose data, helpers, images, audio
|   |   |-- App.js                # Landing page
|   |   `-- index.js              # React entry point with AuthProvider + routes
|   `-- package.json
|-- classification model/
|   |-- yoga_poses/               # Train/test image dataset
|   |-- proprocessing.py          # Extracts MoveNet landmarks into CSV files
|   |-- training.py               # Trains the pose classification model
|   |-- movenet.py                # TFLite MoveNet wrapper
|   |-- data.py                   # Pose data types and helpers
|   |-- train_data.csv
|   |-- test_data.csv
|   |-- FNN_model.keras
|   |-- CNN_model.keras
|   `-- movenet_thunder.tflite
`-- readme.md
```

## How It Works

1. The user selects a yoga pose in the live session page.
2. The browser opens the webcam through `react-webcam`.
3. TensorFlow.js MoveNet detects 17 body keypoints from each video frame.
4. The app normalizes the detected landmarks and passes them into the trained pose classifier.
5. If the classifier confidence for the selected pose is high enough, the skeleton turns green, the timer increases, and audio feedback plays.
6. When the session stops, the frontend sends the best held time to the backend.
7. The backend stores cumulative time, best pose time, daily performance, and leaderboard data in MongoDB.

## Environment Variables

Create environment files locally before running the app.

### Frontend

Copy `frontend/.env.example` to `frontend/.env`:

```env
REACT_APP_MODEL_URL=/model/model.json
REACT_APP_API_BASE=http://localhost:4000
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

`REACT_APP_GOOGLE_CLIENT_ID` enables the "Sign in with Google" button (see [Google Sign-In setup](#google-sign-in-setup)). Leave the placeholder to hide the button.

`REACT_APP_MODEL_URL` points to the TensorFlow.js `model.json` served by the frontend (a copy lives in `frontend/public/model/`). `REACT_APP_API_BASE` is the single base URL for all backend requests (set it to your deployed backend in production).

### Backend

Copy `backend/.env.example` to `backend/.env`:

```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=change_me_to_a_long_random_string
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
CLIENT_ORIGIN=http://localhost:3000
PORT=4000

# Admin seed (used by: npm run seed:admin)
ADMIN_EMAIL=admin@poyo.com
ADMIN_PASSWORD=ChangeMe123!
```

`JWT_SECRET` signs auth tokens — use a long random string and keep it private. The OpenAI key lives only on the backend — the AI planner calls `POST /api/generate-plan`, which proxies OpenAI so the key is never shipped to the browser. `CLIENT_ORIGIN` sets the allowed CORS origin. `ADMIN_EMAIL`/`ADMIN_PASSWORD` are used once to seed the first admin.

## Installation

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

The backend defaults to:

```text
http://localhost:4000
```

### Create the first admin

With the backend `.env` filled in (including `ADMIN_EMAIL` / `ADMIN_PASSWORD`), seed the admin account:

```bash
cd backend
npm run seed:admin
```

This creates (or promotes) the admin. Sign in to the admin portal at `/admin/login`.

### Google Sign-In setup

The "Sign in with Google" button on the login and signup pages needs a Google OAuth **Client ID**. It is optional — email/password auth works without it, and the button stays hidden until it is configured.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create (or pick) a project.
2. Open **APIs & Services -> OAuth consent screen**, configure it as **External**, and add your email as a test user.
3. Open **APIs & Services -> Credentials -> Create Credentials -> OAuth client ID**.
4. Application type: **Web application**.
5. Under **Authorized JavaScript origins** add:
   - `http://localhost:3000`
6. Click create and copy the **Client ID** (looks like `xx….apps.googleusercontent.com`).
7. Put the same Client ID in both env files:
   - `backend/.env` -> `GOOGLE_CLIENT_ID=...`
   - `frontend/.env` -> `REACT_APP_GOOGLE_CLIENT_ID=...`
8. Restart both servers (frontend env vars are read at build/start time).

The frontend renders Google's button, receives a signed ID token, and posts it to `POST /api/auth/google`. The backend verifies the token against `GOOGLE_CLIENT_ID`, then finds or creates the user and issues a normal POYO JWT. If a Google email matches an existing email/password account, the Google identity is linked to it.

Start the frontend:

```bash
cd frontend
npm start
```

The frontend runs at:

```text
http://localhost:3000
```

## Available Routes

### Frontend Pages

- `/` - Home page
- `/login` - Sign in
- `/signup` - Create an account
- `/yoga` - Live webcam yoga session (requires login)
- `/profile` - Profile, best times, total time, and leaderboard (requires login)
- `/about` - AI yoga planner
- `/yogaclass` - Yoga class pose list
- `/yoga-pose/1` to `/yoga-pose/8` - Individual pose detail pages
- `/admin/login` - Admin portal sign in
- `/admin` - Admin dashboard with user management (requires admin role)

### Backend API

Auth:

- `POST /api/auth/register` - Create an account, returns a JWT
- `POST /api/auth/login` - Sign in, returns a JWT
- `POST /api/auth/google` - Verify a Google ID token, find/create the user, returns a JWT
- `GET /api/auth/me` - Current user from the token

User data (require a valid token; the user is derived from the token):

- `POST /api/update-best-time` - Updates cumulative pose time and best pose field
- `POST /api/update-performance` - Updates daily performance for a pose
- `GET /api/profile` - Current user's profile plus best times
- `GET /api/best-times` - Current user's best time records
- `GET /api/get-performance` - Current user's transformed performance data
- `GET /api/leaderboard?pose=PoseName` - Leaderboard for a selected pose

Admin (require an admin token):

- `GET /api/admin/stats` - User counts and total practice time
- `GET /api/admin/users?search=...` - List/search users
- `GET /api/admin/users/:id` - Single user with their best times
- `POST /api/admin/users` - Create a user
- `PUT /api/admin/users/:id` - Update a user (name, email, role, password)
- `DELETE /api/admin/users/:id` - Delete a user and their practice data

Other:

- `POST /api/generate-plan` - Generates an AI yoga plan via a server-side OpenAI proxy

## Model Training Workflow

The model training files live in `classification model/`.

1. Put pose images inside:

```text
classification model/yoga_poses/train/
classification model/yoga_poses/test/
```

2. Run preprocessing to detect MoveNet landmarks and generate CSV files:

```bash
cd "classification model"
python proprocessing.py
```

3. Train the classifier:

```bash
python training.py
```

The training script builds a dense neural network from normalized landmark embeddings, evaluates it, saves a Keras model, and exports a TensorFlow.js model folder.

## Current Implementation Notes

- All frontend backend calls now go through a single `REACT_APP_API_BASE` (see `frontend/src/utils/api.js`).
- The backend CORS origin is configurable via `CLIENT_ORIGIN`. Set it to the production frontend URL before deploying.
- The AI planner calls the backend `POST /api/generate-plan` proxy, so the OpenAI key stays server-side and is never shipped to the browser.
- Camera access requires HTTPS in most deployed browser environments, except localhost.

## Security Notes

- Keep MongoDB, JWT, and OpenAI secrets out of committed source files.
- If a secret has ever been committed or exposed in frontend code, rotate it immediately.
- Prefer calling OpenAI from the backend instead of the browser so the API key is never shipped to users.

## Scripts

### Frontend

```bash
npm start       # Start CRA development server
npm run build   # Build production frontend
npm test        # Run CRA test watcher
```

### Backend

```bash
npm run dev         # Start backend with nodemon
npm start           # Start backend with nodemon server.js
npm run seed:admin  # Create/promote the admin from ADMIN_EMAIL/ADMIN_PASSWORD
npm test            # Placeholder test script
```

## Project Goal

POYO is designed to make yoga practice more interactive and measurable by combining guided pose content, AI-generated planning, real-time pose recognition, and personal performance tracking in one web application.
