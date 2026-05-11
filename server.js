const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {

    const prompt = req.body.prompt;

    res.json({

        chatgpt:
            "ChatGPT answer for: " + prompt,

        gemini:
            "Gemini answer for: " + prompt,

        claude:
            "Claude answer for: " + prompt,

        deepseek:
            "DeepSeek answer for: " + prompt
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});