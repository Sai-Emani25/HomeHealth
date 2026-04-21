
export interface HealthMetrics {
  heartRate: number;
  spO2: number;
  temperature: number;
  glucose: number;
  timestamp: string;
}

export interface PredictionInsight {
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  summary: string;
  recommendation: string;
  anomaliesDetected: string[];
}
