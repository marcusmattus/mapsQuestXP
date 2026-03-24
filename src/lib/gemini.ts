import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getGeminiResponse = async (prompt: string, modelName: string = "gemini-3-flash-preview") => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });
  return response.text;
};

export const chatWithGemini = async (messages: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are MapQuest Assistant, a helpful guide for a gamified map app. Help users find places, understand XP, and stay motivated."
    }
  });
  
  // We need to send the history correctly. 
  // The sendMessage only takes the message string.
  // For simplicity in this app, we'll just send the last message.
  const lastMessage = messages[messages.length - 1].parts[0].text;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text;
};
