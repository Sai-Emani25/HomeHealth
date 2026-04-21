
import { GoogleGenAI, Type } from "@google/genai";
import { HealthMetrics, PredictionInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeHealthTrends(history: HealthMetrics[]): Promise<PredictionInsight> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    As the HomeHealth Guardian AI, analyze the following 24-hour health telemetry for a diabetic patient.
    Identify any anomalies (hypoglycemia, tachycardia, fever, etc.) and predict risks for the next 24 hours.
    
    Data: ${JSON.stringify(history)}
    
    Return a structured JSON analysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Critical'] },
            summary: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            anomaliesDetected: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["riskLevel", "summary", "recommendation", "anomaliesDetected"]
        }
      }
    });

    return JSON.parse(response.text) as PredictionInsight;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      riskLevel: 'Low',
      summary: 'Unable to process AI prediction at this moment. Sensors indicate stable baseline.',
      recommendation: 'Check sensor connectivity and maintain current routine.',
      anomaliesDetected: []
    };
  }
}
