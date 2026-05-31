# POYO - Pocket Yoga

POYO is an AI-assisted yoga web application that helps users learn yoga poses, practice with live webcam feedback, generate a personalized yoga plan, and track their pose performance over time.

The project combines a React frontend, an Express/MongoDB backend, Clerk authentication, TensorFlow.js pose detection, and a custom yoga pose classifier trained from image datasets.

## Features

- Live yoga pose practice through webcam input.
- Real-time skeleton overlay powered by TensorFlow.js MoveNet.
- Pose classification for Tree, Chair, Cobra, Warrior, Dog, and Shoulderstand.
- Audio feedback while the selected pose is held correctly.
- Clerk authentication for user login, signup, and profile access.
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
- Clerk React
- TensorFlow.js
- `@tensorflow-models/pose-detection`
- React Webcam
- Chakra UI
- Tailwind CSS
- Axios
- Chart.js
- OpenAI JavaScript SDK

### Backend

- Node.js 20
- Express
- MongoDB with Mongoose
- Clerk webhooks through Svix
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
|   |-- server.js                 # Express API, MongoDB connection, Clerk webhook, leaderboard and performance routes
|   |-- userModel.js              # User schema linked to Clerk user IDs
|   |-- bestModel.js              # Best pose time and cumulative time schema
|   |-- performanceModel.js       # Daily per-pose performance schema
|   `-- package.json
|-- frontend/
|   |-- public/                   # Static assets and app shell
|   |-- src/
|   |   |-- components/           # Navbar, landing page, sliders, instructions, footer
|   |   |-- pages/                # Home, Yoga, Profile, AI planner, Yoga class and pose detail pages
|   |   |-- utils/                # Pose data, drawing helpers, images and audio
|   |   |-- App.js                # Route definitions
|   |   `-- index.js              # React entry point with Clerk provider
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

Create `frontend/.env`:

```env
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
REACT_APP_MODEL_URL=your_tensorflowjs_model_json_url
```

`REACT_APP_MODEL_URL` should point to the TensorFlow.js `model.json` file exported from the pose classifier.

### Backend

Create `backend/.env`:

```env
MONGODB_URL=your_mongodb_connection_string
CLERK_WEBHOOK_SECRET_KEY=your_clerk_webhook_secret
PORT=80
```

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
http://localhost:80
```

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
- `/yoga` - Live webcam yoga session
- `/profile` - Authenticated profile, best times, total time, and leaderboard
- `/about` - AI yoga planner
- `/yogaclass` - Yoga class pose list
- `/yoga-pose/1` to `/yoga-pose/8` - Individual pose detail pages
- `/sign-in/*` - Clerk sign in
- `/sign-up/*` - Clerk sign up

### Backend API

- `POST /api/webhooks` - Clerk webhook receiver
- `POST /api/update-best-time` - Updates cumulative pose time and best pose field
- `GET /api/best-times/:userId` - Gets best time records for a user
- `GET /api/user-profile/:userId` - Gets user profile data with stored performance fields
- `GET /api/leaderboard?pose=PoseName` - Gets leaderboard data for a selected pose
- `POST /api/update-performance` - Updates daily performance for a pose
- `GET /api/get-performance/:clerkid` - Gets transformed performance data for charts or profile views

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

- The frontend currently uses both local and deployed backend URLs. `Profile.js` reads from `http://localhost:80`, while `Yoga.js` posts to the deployed Render backend. For a clean deployment, move the API base URL into one shared environment variable.
- The backend CORS origin is hardcoded to `http://localhost:3000`. Add the production frontend URL before deploying.
- The AI planner should use an environment variable or backend proxy for OpenAI requests. Do not expose private API keys in browser code.
- The backend currently has no `/api/update-pose-time` route, although `Profile.js` contains a helper that references it.
- Camera access requires HTTPS in most deployed browser environments, except localhost.

## Security Notes

- Keep MongoDB, Clerk, and OpenAI secrets out of committed source files.
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
npm run dev     # Start backend with nodemon
npm start       # Start backend with nodemon server.js
npm test        # Placeholder test script
```

## Project Goal

POYO is designed to make yoga practice more interactive and measurable by combining guided pose content, AI-generated planning, real-time pose recognition, and personal performance tracking in one web application.
