require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.post("/ask", async (req, res) => {

    try {

        const prompt = req.body.prompt;

        // =========================
        // GEMINI
        // =========================

        let geminiText = "Gemini unavailable";

        try {

            const geminiResponse = await axios.post(

                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,

                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                }

            );

            geminiText =
                geminiResponse.data.candidates?.[0]
                    ?.content?.parts?.[0]?.text
                || "No Gemini response";

        } catch (error) {

            console.log("Gemini Error:");

            console.log(
                error.response?.data || error.message
            );

            geminiText =
                "Gemini quota exceeded or unavailable.";
        }

        // =========================
        // CHATGPT
        // =========================

        let chatgptText = "ChatGPT unavailable";

        try {

            const openaiResponse = await axios.post(

                "https://api.openai.com/v1/chat/completions",

                {
                    model: "gpt-3.5-turbo",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                },

                {
                    headers: {
                        "Authorization":
                            `Bearer ${process.env.OPENAI_KEY}`,
                        "Content-Type":
                            "application/json"
                    }
                }
            );

            chatgptText =
                openaiResponse.data.choices?.[0]
                    ?.message?.content
                || "No ChatGPT response";

        } catch (error) {

            console.log("ChatGPT Error:");

            console.log(
                error.response?.data || error.message
            );

            chatgptText =
                "ChatGPT unavailable.";
        }

        // =========================
        // CLAUDE
        // =========================

        let claudeText = "Claude unavailable";

        try {

            const claudeResponse = await axios.post(

                "https://api.anthropic.com/v1/messages",

                {
                    model: "claude-3-haiku-20240307",
                    max_tokens: 300,

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                },

                {
                    headers: {
                        "x-api-key":
                            process.env.CLAUDE_KEY,

                        "anthropic-version":
                            "2023-06-01",

                        "Content-Type":
                            "application/json"
                    }
                }
            );

            claudeText =
                claudeResponse.data.content?.[0]?.text
                || "No Claude response";

        } catch (error) {

            console.log("Claude Error:");

            console.log(
                error.response?.data || error.message
            );

            claudeText =
                "Claude unavailable.";
        }

        // =========================
        // DEEPSEEK
        // =========================

        let deepseekText = "DeepSeek unavailable";

        try {

            const deepseekResponse = await axios.post(

                "https://api.deepseek.com/chat/completions",

                {
                    model: "deepseek-chat",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                },

                {
                    headers: {
                        "Authorization":
                            `Bearer ${process.env.DEEPSEEK_KEY}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );

            deepseekText =
                deepseekResponse.data.choices?.[0]
                    ?.message?.content
                || "No DeepSeek response";

        } catch (error) {

            console.log("DeepSeek Error:");

            console.log(
                error.response?.data || error.message
            );

            deepseekText =
                "DeepSeek unavailable.";
        }

        // =========================
        // FINAL RESPONSE
        // =========================

        res.json({

            chatgpt: chatgptText,

            gemini: geminiText,

            claude: claudeText,

            deepseek: deepseekText
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            error: "Server crashed"
        });
    }
});

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );
});