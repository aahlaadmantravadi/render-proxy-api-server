// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
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
