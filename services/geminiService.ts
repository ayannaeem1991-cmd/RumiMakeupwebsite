import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBeautyAdvice = async (
  history: { role: 'user' | 'model'; text: string }[],
  currentMessage: string,
  systemInstruction: string,
  onStream: (text: string) => void
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessageStream({ message: currentMessage });

    let fullText = '';
    for await (const chunk of result) {
      const chunkText = (chunk as GenerateContentResponse).text;
      if (chunkText) {
        fullText += chunkText;
        onStream(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Error generating beauty advice:", error);
    throw error;
  }
};