import { useState, useEffect, useRef } from 'react';
import { HealthMetrics } from '../types';

export function useHealthData() {
  const [history, setHistory] = useState<HealthMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<HealthMetrics>({
    heartRate: 72,
    spO2: 98.2,
    temperature: 98.6,
    glucose: 110,
    timestamp: new Date().toISOString()
  });

  const historyRef = useRef<HealthMetrics[]>([]);

  useEffect(() => {
    // Pre-populate with 48 hours of simulated data (one reading per hour for baseline)
    const initial = Array.from({ length: 48 }).map((_, i) => {
      const baseGlucose = 100 + Math.sin(i / 4) * 20; // Circadian rhythm simulation
      return {
        heartRate: 65 + Math.random() * 15,
        spO2: 97 + Math.random() * 2.5,
        temperature: 97.8 + Math.random() * 1.2,
        glucose: baseGlucose + Math.random() * 15,
        timestamp: new Date(Date.now() - (48 - i) * 3600000).toISOString()
      };
    });
    setHistory(initial);
    historyRef.current = initial;

    const interval = setInterval(() => {
      // Simulate slow drift and noise
      const time = Date.now() / 10000;
      const newMetric: HealthMetrics = {
        heartRate: 72 + Math.sin(time) * 5 + (Math.random() - 0.5) * 4,
        spO2: Math.min(100, 98 + Math.cos(time / 2) * 1 + (Math.random() - 0.5) * 0.5),
        temperature: 98.4 + Math.sin(time / 3) * 0.3 + (Math.random() - 0.5) * 0.2,
        glucose: 110 + Math.sin(time / 5) * 25 + (Math.random() - 0.5) * 8,
        timestamp: new Date().toISOString()
      };
      
      setCurrentMetrics(newMetric);
      const updatedHistory = [...historyRef.current.slice(-100), newMetric];
      historyRef.current = updatedHistory;
      setHistory(updatedHistory);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return { currentMetrics, history };
}