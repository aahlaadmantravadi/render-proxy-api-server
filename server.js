// server.js (UPDATED WITH RATE LIMITING)
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const rateLimit = require("express-rate-limit"); // Import the package
const app = express();

// Apply a rate limiter to all requests
// This allows 10 requests per minute from a single IP.
// This is generous for a portfolio but protects against spam bots.
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false, 
  message: { error: "Too many requests, please try again after a minute." }
});

app.use(limiter); // Use the rate limiter
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  // ... rest of your server code remains the same
  const userPrompt = req.body.prompt;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "API key is not configured on the server." });
  }
  if (!userPrompt) {
    return res.status(400).json({ error: "A 'prompt' is required in the request body." });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: userPrompt }] }] }),
    });
    
    const responseData = await apiResponse.json();
    if (!apiResponse.ok) {
      console.error("Google API Error:", responseData);
      return res.status(apiResponse.status).json(responseData);
    }
    res.json(responseData);
  } catch (error) {
    console.error("Proxy Server Error:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
