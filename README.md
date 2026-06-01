# FutureMe // Prasanna’s Founder Labs

FutureMe is a premium, AI-powered personal reflection product where you input details about your current life, goals, struggles, and timeline, and receive a powerful, context-aware message from your future self. It features a stunning, Apple-style glassmorphic interface with floating background orbs, dynamic load-state screens, rate-limited execution loops, clipboard copy, and an interactive conversation portal with context memory.

---

## Technical Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js + Express (Local server) & Netlify Serverless Functions (Production deployment)
- **AI Engine**: Gemini API (`gemini-3.1-flash-lite` model) via the `@google/generative-ai` SDK
- **CORS**: Configured to support running the frontend served from Node.js, Netlify Functions, or loaded directly from a local file (`file://`)

---

## Project Structure
```
futureme/
  frontend/
    index.html      # Main interface structure
    style.css       # Premium styling system, typography & custom animations
    script.js       # Core frontend state and API connection logic
  backend/
    server.js       # Node + Express API routing (Local execution)
    package.json    # Project dependencies and startup scripts
    .env.example    # Environment variable template
  netlify/
    functions/
      api.js        # Serverless API routes wrapped in serverless-http
  netlify.toml      # Netlify publish/function directory configurations
  package.json      # Root package file for dependencies
  README.md         # Deployment and walkthrough instructions
```

---

## Local Installation & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Install Dependencies
Navigate to the root directory and install:
```bash
npm install
```

### 3. Add Gemini API Key
Create a `.env` file inside the `backend` folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

### 4. Run the Backend
Start the server in development mode:
```bash
npm start
```
The server will start on `http://localhost:5000`.

### 5. Access the Frontend
- **Option A (Recommended)**: Open your browser and navigate to `http://localhost:5000` (statically served by the Node server).
- **Option B (Direct File)**: Double-click `frontend/index.html` on your computer to open it directly. The script automatically points calls to `http://localhost:5000` when loaded via `file://`.

---

## Deployment with Netlify

We have fully pre-configured this repository for **Netlify Serverless Deployment** via `netlify.toml` and `netlify/functions/api.js`.

### Option A: Deploy via GitHub (Continuous Integration)
1. Initialize git in the root folder and push to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: init futureme"
   # push to your github account...
   ```
2. Log into the [Netlify Dashboard](https://app.netlify.com).
3. Click **"Import from Git"** and connect your GitHub repository.
4. Netlify will automatically detect:
   - **Publish directory**: `frontend`
   - **Functions directory**: `netlify/functions`
5. Go to your Site Settings on Netlify -> **Environment Variables** and add:
   - `GEMINI_API_KEY` = `your_actual_gemini_api_key`
6. Click **Deploy Site**!

### Option B: Deploy via Netlify CLI
1. Install the Netlify CLI globally:
   ```bash
   npm install netlify-cli -g
   ```
2. Log in and initialize:
   ```bash
   netlify login
   netlify init
   ```
3. Set the environment variable in your Netlify site settings dashboard.
4. Deploy to production:
   ```bash
   netlify deploy --prod
   ```

---

## Local API Routes

### 1. Identity Generation
- **Endpoint**: `POST /api/generate-futureme`
- **Request Body**:
```json
{
  "name": "Prasanna",
  "age": "23",
  "goal": "Build a successful AI startup",
  "struggle": "Lack of consistency",
  "oneYearVision": "Running a profitable AI company",
  "tone": "Brutally Honest"
}
```

### 2. Follow-Up Chat
- **Endpoint**: `POST /api/chat-futureme`
- **Request Body**:
```json
{
  "userProfile": { ... },
  "chatHistory": [
    { "role": "user", "message": "Will I make it?" },
    { "role": "futureme", "message": "..." }
  ],
  "question": "What is my focus for tomorrow?"
}
```
