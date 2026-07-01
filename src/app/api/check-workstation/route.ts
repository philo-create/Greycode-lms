import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { activityId, title, description, targetDescription, objects, imageData } = body;

  if (!activityId || !objects) {
    return NextResponse.json({ success: false, error: "Missing activityId or objects" }, { status: 400 });
  }

  try {

    const prompt = activityId === 'R-T1-W7-bracelet' ? `
      You are an encouraging AI CAPS Tutor performing the FINAL GRADING on a Foundation Phase (Grade R/1) learner's Beaded Bracelet Design.
      This is a certified activity (not practice), so your grade and feedback will be final and the design will be locked!
      
      The student's task:
      Activity Title: Beaded Bracelet Design (R-T1-W7)
      Activity Description: Draw circular beads on your canvas, and create a repeating pattern using exactly TWO alternating colors (e.g. Red, Blue, Red, Blue).

      Here is the list of shapes/drawings on the canvas:
      ${JSON.stringify(objects, null, 2)}

      Please visually examine the attached image and the objects:
      1. Verify they have drawn round/circular beads (using the circle tool, or freehand drawing that looks like circles or round beads).
      2. Verify they have used exactly TWO colors (or very close colors, like Red and Blue, or Orange and Yellow).
      3. Verify the colors are alternating in a row or circular sequence (like Red, Blue, Red, Blue).
      
      Grading Rubric for "score" (stars earned, must be an integer between 1 and 10):
      - 9 to 10 Stars (Excellent!): Drawn circular beads in a perfect repeating pattern alternating exactly TWO colors (e.g., Red, Blue, Red, Blue). Must have at least 3 beads.
      - 6 to 8 Stars (Very Good!): Created an alternating color pattern but didn't use circular beads (or circular shapes), OR used circular beads but forgot to alternate the colors, or has minor pattern flaws.
      - 3 to 5 Stars (Good Attempt!): Placed some circular beads but no pattern, or only 2 beads.
      - 1 to 2 Stars (Basic Design): Placed some random lines or single-color drawings on the canvas but has no pattern or circular beads, or just a few scribbles.
      
      Be extremely lenient because the student is only 5-6 years old (Grade R), but evaluate honestly to award between 1 and 10 stars.
      Set "success" to true if they earned 3 or more stars. Set it to false ONLY if they got 1 or 2 stars (no real pattern or beads).
      
      Write a warm, excited final feedback message (1-2 sentences maximum, e.g. "🎉 Brilliant bracelet! Your colors alternate so beautifully, you are a master designer! ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐").

      Return your response in JSON format matching this schema:
      {
        "success": boolean,
        "score": number, // must be between 1 and 10 based on the rubric above
        "feedback": string
      }
    ` : `
      You are an encouraging AI CAPS Tutor grading a Foundation Phase (Grade R/1) learner's Creative Workstation design.
      The student is trying to complete this workstation task:
      Activity Title: ${title}
      Activity Description: ${description}
      Target Requirements: ${targetDescription}

      Here is the list of elements (shapes, lines, freehand drawings, or components) that the learner has placed on their workspace canvas:
      ${JSON.stringify(objects, null, 2)}

      If an image is attached, please look at it visually to see what they drew (e.g., if they drew a house with a rectangle base and a triangle roof, or structured an alternating pattern, or created a circuit).
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

    const parts: any[] = [{ text: prompt }];
    if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: {
              type: Type.BOOLEAN,
              description: "Whether the student has reasonably met the requirements or made a valid attempt."
            },
            score: {
              type: Type.INTEGER,
              description: "The final grade score between 1 and 10 stars based on the rubric."
            },
            feedback: {
              type: Type.STRING,
              description: "An encouraging, simple, warm message for the student. Max 2 short sentences."
            }
          },
          required: ["success", "score", "feedback"]
        },
        temperature: 0.2
      }
    });

    const resultText = response.text?.trim() || "";
    const parsed = JSON.parse(resultText);

    return NextResponse.json(parsed);
  } catch (error: any) {
    // AI feature gracefully unavailable
    return NextResponse.json({
      success: false,
      feedback: "AI feature not available. Please try again later."
    });
  }
}
