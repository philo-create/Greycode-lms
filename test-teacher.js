import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const contents = [{ text: "Evaluate this drawing" }];
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents
    });
    console.log("Success!", response.text);
  } catch (e) {
    console.error("Error with contents array:", e.message);
  }
}
test();
