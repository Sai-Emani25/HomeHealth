
import { GoogleGenAI, Type } from "@google/genai";
import { VitalSign, TelemetryPoint, PatientProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ClinicalInsight {
  status: 'STABLE' | 'ELEVATED RISK' | 'CRITICAL';
  healthScore: number; // 0-100
  summary: string;
  anomalies: string[];
  recommendations: string[];
  clinicalContext: string;
}

export const getHealthInsights = async (patient: PatientProfile, vitals: VitalSign[], history: TelemetryPoint[]): Promise<ClinicalInsight | string> => {
  const vitalsSummary = vitals.map(v => `${v.label}: ${v.value}${v.unit} (${v.status})`).join(', ');
  
  const prompt = `
    Context: HomeHealth Clinical Intelligence System.
    Patient: ${patient.name} (${patient.age}y, ${patient.gender})
    Conditions: ${patient.currentConditions.join(', ')}
    Vitals: ${vitalsSummary}
    
    Task: Perform deep clinical analysis.
    1. Determine healthScore (0-100, where 100 is perfect).
    2. Identify anomalies specific to their conditions.
    3. Provide actionable recommendations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "One of: STABLE, ELEVATED RISK, CRITICAL" },
            healthScore: { type: Type.NUMBER, description: "Numerical score from 0 to 100" },
            summary: { type: Type.STRING, description: "A high-level clinical summary" },
            anomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            clinicalContext: { type: Type.STRING, description: "Correlation with history" }
          },
          required: ["status", "healthScore", "summary", "anomalies", "recommendations", "clinicalContext"]
        },
        thinkingConfig: { thinkingBudget: 2000 },
        temperature: 0.1,
      }
    });
    
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini Insight Error:", error);
    return "Clinical analysis engine experienced a synchronization delay. Continuing baseline monitoring.";
  }
};
