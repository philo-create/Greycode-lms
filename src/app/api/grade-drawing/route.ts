import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageData, word } = body;

    if (!imageData) {
      return NextResponse.json({ isCorrect: false, feedback: "No image provided" }, { status: 400 });
    }

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
      You are an encouraging AI CAPS Tutor grading a Foundation Phase (Grade R/1) learner's drawing.
      The student was asked to draw a picture of: "${word}".
      
      Look at the image provided. Is it a reasonable attempt at drawing a "${word}"?
      Because they are Grade R/1 (5-7 years old), please be EXTREMELY lenient. If there is any squiggle that loosely resembles it, or if they made a genuine attempt, mark it as correct.
      
      Return your response in JSON format matching this schema:
      {
        "isCorrect": boolean,
        "feedback": string,
        "identifiedWord": string
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType: "image/png" } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: {
              type: Type.BOOLEAN,
              description: "Whether the drawing is a reasonable attempt."
            },
            feedback: {
              type: Type.STRING,
              description: "An encouraging, simple, warm message for the student. Max 2 short sentences."
            },
            identifiedWord: {
              type: Type.STRING,
              description: "The word that you think they tried to draw. Default to the target word if you are unsure."
            }
          },
          required: ["isCorrect", "feedback", "identifiedWord"]
        },
        temperature: 0.2
      }
    });

    const resultText = response.text?.trim() || "";
    const parsed = JSON.parse(resultText);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("AI Evaluation error:", error);
    return NextResponse.json({
      isCorrect: true,
      feedback: "Wow! That is a very creative drawing! 🌟",
      identifiedWord: "creative drawing"
    });
  }
}
