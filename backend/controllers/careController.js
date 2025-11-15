import fs from "fs";
const AI_API_URI = "http://localhost:8000";

const getQuestions = async (req, res) => {
  try {
    const questions = await fetch(`${AI_API_URI}/emotion/questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!questions.ok) {
      return res.status(500).json({ error: "Failed to fetch questions" });
    }
    const data = await questions.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch questions" });
  }
};

const submitAnswers = async (req, res) => {
  try {
    const { answers } = req.body;
    const file = req.file;

    let base64File = null;

    // Convert file to base64 if exists
    if (file) {
      const fileBuffer = fs.readFileSync(file.path);
      base64File = fileBuffer.toString("base64");
    }

    const response = await fetch(`${AI_API_URI}/emotion/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answers,
        file: base64File   // <--- Send Base64 string here
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to analyze answers" });
    }

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not submit answers" });
  }
};


export { getQuestions, submitAnswers };