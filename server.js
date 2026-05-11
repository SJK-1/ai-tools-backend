require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {

    const prompt = req.body.prompt;

    try {

        // GEMINI
        const geminiResponse = await axios.post(

            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,

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

        const geminiText =
            geminiResponse.data
                .candidates[0]
                .content.parts[0]
                .text;

        // DEEPSEEK
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

                    Authorization:
                        `Bearer ${process.env.DEEPSEEK_KEY}`,

                    "Content-Type":
                        "application/json"
                }
            }
        );

        const deepseekText =
            deepseekResponse.data
                .choices[0]
                .message.content;

        // OPENAI (optional)
        let chatgptText =
            "ChatGPT not connected";

        if (process.env.OPENAI_KEY) {

            try {

                const openaiResponse =
                    await axios.post(

                        "https://api.openai.com/v1/chat/completions",

                        {
                            model: "gpt-4.1-mini",

                            messages: [
                                {
                                    role: "user",
                                    content: prompt
                                }
                            ]
                        },

                        {
                            headers: {

                                Authorization:
                                    `Bearer ${process.env.OPENAI_KEY}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                chatgptText =
                    openaiResponse.data
                        .choices[0]
                        .message.content;

            } catch {

                chatgptText =
                    "ChatGPT API error";
            }
        }

        // CLAUDE (optional)
        let claudeText =
            "Claude not connected";

        if (process.env.CLAUDE_KEY) {

            try {

                const claudeResponse =
                    await axios.post(

                        "https://api.anthropic.com/v1/messages",

                        {
                            model:
                                "claude-3-5-sonnet-20241022",

                            max_tokens: 500,

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
                    claudeResponse.data
                        .content[0]
                        .text;

            } catch {

                claudeText =
                    "Claude API error";
            }
        }

        res.json({

            chatgpt: chatgptText,

            gemini: geminiText,

            claude: claudeText,

            deepseek: deepseekText
        });

    } catch (e) {

        console.log(
            e.response?.data || e.message
        );

        res.status(500).json({

            error:
                "Server error"
        });
    }
});

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );
});