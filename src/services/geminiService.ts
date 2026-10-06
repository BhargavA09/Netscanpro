import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeThreat(content: string): Promise<AnalysisResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following cybersecurity threat information and provide a structured analysis in JSON format.
      
      Content: ${content}
      
      The response must be a JSON object with the following fields:
      - summary: A concise summary of the threat.
      - riskScore: A number from 0 to 100 representing the severity.
      - recommendations: A list of actionable steps to mitigate the threat.
      - relatedTechniques: A list of MITRE ATT&CK techniques related to this threat.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing threat:", error);
    return {
      summary: "Failed to analyze threat. Please try again later.",
      riskScore: 0,
      recommendations: [],
      relatedTechniques: [],
    };
  }
}
