// Load environment variables from .env file
require('dotenv').config();

import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Log the API key to ensure it's loaded correctly
console.log("API Key:", process.env.GOOGLE_GENERATIVE_AI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a chatbot for the startup software tech company Headstarter. Use a friendly, supportive, and encouraging tone. Ensure explanations are clear and easy to understand",
});

async function startChat(history) {
    return model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 100,
            // responseMimeType: "application/json"
        },
    });
}

export async function POST(req) {
    const history = await req.json();
    const userMsg = history[history.length - 1];

    try {
        const chat = await startChat(history);
        const result = await chat.sendMessage(userMsg.parts[0].text);
        const response = await result.response;
        const output = await response.text();  // Added await here to properly resolve the promise
        console.log(output); 
        return NextResponse.json(output);
    } catch (e) {
        console.error(e);
        return NextResponse.json("error, check console");
    }
}
