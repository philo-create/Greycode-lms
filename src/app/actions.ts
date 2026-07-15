'use server';

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function generateDeepDiveReport(
  studentName: string,
  subjectName: string,
  subjectGrades: any[],
  progressData: any[]
) {
  try {
    const prompt = `You are an elite, highly-paid educational data scientist and master teacher. You are providing a deeply analytical, highly detailed, and ultra-personalized performance diagnostic for a student named ${studentName} for: ${subjectName === 'All Subjects Overview' ? 'their overall academic performance across all subjects' : `the subject of "${subjectName}"`}. 
    
Here are the student's recent manual assessments/marks ${subjectName === 'All Subjects Overview' ? 'across all subjects' : 'in this subject'}:
${JSON.stringify(subjectGrades, null, 2)}

Here is the student's automated digital lesson progress data (if applicable to this subject, else ignore):
${JSON.stringify(progressData, null, 2)}

Your goal is to provide a comprehensive, empathetic, and highly actionable diagnostic report. The parents are paying for a premium service and they want to feel that this AI analysis offers profound insights that a regular teacher simply doesn't have the time to compile. We are going "SUPER MODE" on this.

Use Markdown formatting.

Include these sections:
### 📊 Executive Summary
(A high-level synthesis of their current trajectory)

### 🌟 Strengths & Cognitive Milestones
(What are they excelling at? Connect their marks to cognitive skills)

### 🎯 Hidden Gaps & Areas for Improvement
(What hidden patterns in the data suggest a misunderstanding? Be highly specific)

### 🛠️ Strategic Intervention Plan
* **For the Teacher:** (Specific instructional strategies based on the data)
* **For the Parents at Home:** (Specific, actionable, non-academic ways parents can support this exact gap at home)

### 🚀 Future Trajectory & Encouragement
(A warm, inspiring conclusion)

CRITICAL: Be highly specific based on the data provided. Quote their actual scores and the specific topics they struggled with or excelled in. Avoid all generic advice. Tailor it entirely to the patterns in their data. Make the parents feel they are getting an ultra-premium, deeply considered analysis. Limit to around 500-600 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview", // Use a more capable model for complex reasoning and deep dive
      contents: prompt,
    });
    
    return { success: true, text: response.text };
  } catch (error: any) {
    console.error("Error generating student deep dive report:", error);
    return { success: false, error: error.message || "Failed to generate AI deep dive report" };
  }
}
