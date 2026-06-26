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
    const { activityId, title, description, targetDescription, objects } = body;

    if (!activityId || !objects) {
      return NextResponse.json({ success: false, error: "Missing activityId or objects" }, { status: 400 });
    }

    const prompt = `
      You are an encouraging AI CAPS Tutor grading a Foundation Phase (Grade R/1) learner's Creative Workstation design.
      The student is trying to complete this workstation task:
      Activity Title: ${title}
      Activity Description: ${description}
      Target Requirements: ${targetDescription}

      Here is the list of elements (shapes, lines, freehand drawings, or components) that the learner has placed on their workspace canvas:
      ${JSON.stringify(objects, null, 2)}

      Please evaluate if the student has reasonably completed the task or made a genuine creative attempt that fits the description.
      Because they are Grade R/1 (5-7 years old), please be EXTREMELY lenient:
      1. If they drew shapes using the freehand brush (type: "draw") instead of the exact "rectangle" or "circle" tools, count them! (e.g. if the task is to make a house using a rectangle base and a triangle roof, but they drew freehand lines/draw paths that represent these shapes, approve it!).
      2. If they placed the correct components (like a battery and an LED light) anywhere on the canvas, even if not connected perfectly, approve it.
      3. If they created a pattern of alternating red and blue colors, even if they have extra objects or slightly different colors on the canvas, approve it.
      4. Make sure your feedback is extremely warm, positive, uses friendly emojis, and praises their effort.
      5. If they really don't have the elements (e.g., they didn't place any battery, or didn't draw anything), set success to false, but write a very gentle, encouraging hint explaining what to do next in simple words.

      Return your response in JSON format matching this schema:
      {
        "success": boolean,
        "feedback": string
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: {
              type: Type.BOOLEAN,
              description: "Whether the student has reasonably met the requirements or made a valid attempt."
            },
            feedback: {
              type: Type.STRING,
              description: "An encouraging, simple, warm message for the student. Max 2 short sentences."
            }
          },
          required: ["success", "feedback"]
        },
        temperature: 0.2
      }
    });

    const resultText = response.text?.trim() || "";
    const parsed = JSON.parse(resultText);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("AI Evaluation error:", error);
    
    // Graceful fallback for young learners if the AI model is unavailable or throws a 503
    try {
      const body = await req.json().catch(() => ({}));
      const objects = body.objects || [];
      
      if (objects.length >= 2) {
        return NextResponse.json({
          success: true,
          feedback: "Incredible design! Your workstation creation is super creative and beautiful! 🌟🎨 Keep up the amazing work!"
        });
      } else {
        return NextResponse.json({
          success: false,
          feedback: "Your workspace looks a bit quiet. Try adding a few more colorful shapes or lines first! 🎨✨"
        });
      }
    } catch (fallbackError) {
      return NextResponse.json({
        success: true,
        feedback: "Superb creativity! Your design is approved! 🚀 Let's move to the next step!"
      });
    }
  }
}
