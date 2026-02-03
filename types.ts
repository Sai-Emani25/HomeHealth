
export interface VitalSign {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
  history: number[];
}

export interface TelemetryPoint {
  time: string;
  hr: number;
  spO2: number;
  temp: number;
  glucose: number;
  predictedGlucose?: number;
}

export interface SystemAlert {
  id: string;
  type: 'anomaly' | 'threshold' | 'system';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  height: string;
  weight: string;
  medicalHistory: string[];
  currentConditions: string[];
}

export interface MonitorDevice {
  id: string;
  name: string;
  type: 'BLE' | 'WiFi' | 'Zigbee';
  category: 'Heart Rate' | 'Oximeter' | 'Glucose' | 'Thermometer' | 'BP';
  status: 'connected' | 'disconnected' | 'pairing';
  battery: number;
  lastSeen: string;
}

export enum DashboardTab {
  OVERVIEW = 'overview',
  PATIENT_PROFILE = 'patient_profile',
  ANALYTICS = 'analytics',
  EDGE_HUB = 'edge_hub',
  AI_ADVISOR = 'ai_advisor',
  DEPLOYMENT = 'deployment'
}
