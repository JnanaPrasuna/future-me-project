const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const serverless = require("serverless-http");

// Load Environment Variables
dotenv.config();

const app = express();

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to clean markdown wrappers around JSON responses if any
function cleanJsonString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// Router for serverless functions
const router = express.Router();

/**
 * Route: POST /generate-futureme
 */
router.post("/generate-futureme", async (req, res) => {
  try {
    const { name, age, goal, struggle, oneYearVision, userTimeline, tone } = req.body;
    const timeline = oneYearVision || userTimeline;

    if (!name || !age || !goal || !struggle || !timeline || !tone) {
      return res.status(400).json({
        success: false,
        error: "All fields are required to align your timeline."
      });
    }

    const systemPrompt = `You are FutureMe, the future successful version of the user. You are not a generic motivational coach. You speak with emotional intelligence, clarity, and deep personal understanding. Your job is to help the user see who they are becoming, what they must change, and what they should do next.

Write as if you are the user’s future self speaking directly to their current self.

Tone selected by user: ${tone}
(Adopt this tone:
 - "Motivational" means: warm, inspiring, empowering, supportive.
 - "Brutally Honest" means: direct, sharp, high accountability, unfiltered, no excuses.
 - "Calm Mentor" means: peaceful, wise, grounded, stoic, intentional, expansive, thoughtful.
 - "CEO Mode" means: strategic, focused, execution-heavy, aggressive optimization, hyper-focused on productivity).

User details:
Name: ${name}
Age: ${age}
Goal: ${goal}
Current struggle: ${struggle}
One-year vision: ${timeline}

Return only valid JSON in this exact format:
{
  "message": "A powerful 120-180 word message from the future self.",
  "futureIdentity": "A concise description of who the user is becoming.",
  "nextMoves": ["Action 1", "Action 2", "Action 3"],
  "habit": "One small daily habit they should start today.",
  "warning": "One mistake their future self warns them about.",
  "mantra": "A short memorable line they can repeat daily."
}

Make it specific, emotional, practical, and highly realistic. Avoid generic advice and clichés. Do not return any other text besides the JSON.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    const cleanedText = cleanJsonString(responseText);
    const parsedData = JSON.parse(cleanedText);

    res.json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    console.error("Error generating FutureMe profile:", error);
    res.status(500).json({
      success: false,
      error: "FutureMe could not respond right now. Try again."
    });
  }
});

/**
 * Route: POST /chat-futureme
 */
router.post("/chat-futureme", async (req, res) => {
  try {
    const { userProfile, chatHistory, question } = req.body;

    if (!userProfile || !question) {
      return res.status(400).json({
        success: false,
        error: "User profile and question are required to establish connection."
      });
    }

    const { name, age, goal, struggle, oneYearVision, userTimeline, tone } = userProfile;
    const timeline = oneYearVision || userTimeline;

    let formattedHistory = "";
    if (chatHistory && chatHistory.length > 0) {
      formattedHistory = chatHistory
        .map(chat => {
          const sender = chat.role === "user" ? "Current Self" : "Future Self";
          return `${sender}: ${chat.message || chat.text || ""}`;
        })
        .join("\n");
    } else {
      formattedHistory = "No previous dialog.";
    }

    const systemPrompt = `You are FutureMe, the future version of the user who already achieved their one-year vision. Reply directly to the user’s question. Be personal, sharp, honest, and useful. Do not sound like a normal AI assistant. Do not mention that you are Gemini or an AI model. Speak like the future self.

User profile:
Name: ${name}
Age: ${age}
Goal: ${goal}
Struggle: ${struggle}
One-year vision: ${timeline}
Tone: ${tone}
(Adopt this tone:
 - "Motivational" means: warm, inspiring, empowering, supportive.
 - "Brutally Honest" means: direct, sharp, high accountability, unfiltered, no excuses.
 - "Calm Mentor" means: peaceful, wise, grounded, stoic, intentional, expansive, thoughtful.
 - "CEO Mode" means: strategic, focused, execution-heavy, aggressive optimization, hyper-focused on productivity).

Recent chat history:
${formattedHistory}

Current question from the user:
"${question}"

Reply in 2-5 short paragraphs. Give at least one clear, actionable task the user can perform immediately. Keep the style conversational and reflective of the future self.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite"
    });

    const result = await model.generateContent(systemPrompt);
    const replyText = result.response.text().trim();

    res.json({
      success: true,
      reply: replyText
    });
  } catch (error) {
    console.error("Error in FutureMe chat:", error);
    res.status(500).json({
      success: false,
      error: "FutureMe could not respond right now. Try again."
    });
  }
});

// Mount router on both direct and API paths for reliability
app.use("/.netlify/functions/api", router);
app.use("/api", router);

module.exports.handler = serverless(app);
