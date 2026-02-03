
import React, { useState, useEffect, useMemo } from 'react';
import { VitalSign, TelemetryPoint, DashboardTab, SystemAlert, PatientProfile, MonitorDevice } from './types';
import { ICONS } from './constants';
import VitalCard from './components/VitalCard';
import HealthChart from './components/HealthChart';
import DeploymentDocs from './components/DeploymentDocs';
import { getHealthInsights, ClinicalInsight } from './services/geminiService';

const INITIAL_PATIENTS: PatientProfile[] = [
  {
    id: 'p1',
    name: 'Amit Sharma',
    age: 58,
    gender: 'Male',
    bloodType: 'O+',
    height: '175',
    weight: '82',
    medicalHistory: ['Hypertension (2015)', 'Mild Cardiac Arrhythmia'],
    currentConditions: ['Type 2 Diabetes', 'Post-Op Knee Recovery']
  },
  {
    id: 'p2',
    name: 'Priya Patel',
    age: 42,
    gender: 'Female',
    bloodType: 'A-',
    height: '162',
    weight: '65',
    medicalHistory: ['Asthma (Childhood)', 'Gestational Diabetes (2019)'],
    currentConditions: ['Stable Asthma', 'Annual Health Checkup Pending']
  },
  {
    id: 'p3',
    name: 'Rajiv Menon',
    age: 65,
    gender: 'Male',
    bloodType: 'B+',
    height: '180',
    weight: '90',
    medicalHistory: ['Hyperlipidemia', 'Family history of CAD'],
    currentConditions: ['Pre-diabetic management', 'Physical Therapy']
  }
];

const INITIAL_DEVICES: MonitorDevice[] = [
  { id: 'dev-1', name: 'Polar H10 Chest Strap', type: 'BLE', category: 'Heart Rate', status: 'connected', battery: 85, lastSeen: 'Just now' },
  { id: 'dev-2', name: 'Oxiline Pulse 9 Pro', type: 'BLE', category: 'Oximeter', status: 'connected', battery: 42, lastSeen: 'Just now' },
  { id: 'dev-3', name: 'Dexcom G7 Node', type: 'WiFi', category: 'Glucose', status: 'connected', battery: 100, lastSeen: '2 mins ago' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.OVERVIEW);
  const [patients, setPatients] = useState<PatientProfile[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>(INITIAL_PATIENTS[0].id);
  const [devices, setDevices] = useState<MonitorDevice[]>(INITIAL_DEVICES);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  
  const [vitals, setVitals] = useState<VitalSign[]>([
    { id: '1', label: 'Heart Rate', value: 72, unit: 'BPM', status: 'normal', trend: 'stable', timestamp: new Date().toISOString(), history: Array(20).fill(72) },
    { id: '2', label: 'Blood Glucose', value: 110, unit: 'mg/dL', status: 'normal', trend: 'up', timestamp: new Date().toISOString(), history: Array(20).fill(110) },
    { id: '3', label: 'SpO2', value: 98, unit: '%', status: 'normal', trend: 'stable', timestamp: new Date().toISOString(), history: Array(20).fill(98) },
    { id: '4', label: 'Body Temp', value: 98.6, unit: '°F', status: 'normal', trend: 'stable', timestamp: new Date().toISOString(), history: Array(20).fill(98.6) },
  ]);

  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [clinicalInsight, setClinicalInsight] = useState<ClinicalInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const activePatient = useMemo(() => 
    patients.find(p => p.id === activePatientId) || patients[0]
  , [patients, activePatientId]);

  const [editProfile, setEditProfile] = useState<PatientProfile>(activePatient);

  useEffect(() => {
    setEditProfile(activePatient);
    setClinicalInsight(null);
  }, [activePatientId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setVitals(prev => prev.map(v => {
        let newVal = v.value;
        let trend: 'up' | 'down' | 'stable' = v.trend;
        
        if (v.label === 'Heart Rate') {
            const diff = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3);
            newVal = Math.max(60, Math.min(180, Math.round(v.value + diff)));
            trend = diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : 'stable';
        } else if (v.label === 'Blood Glucose') {
            const diff = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 1.5);
            newVal = Math.max(70, Math.min(250, Math.round(v.value + diff)));
            trend = diff > 0.2 ? 'up' : diff < -0.2 ? 'down' : 'stable';
        } else if (v.label === 'SpO2') {
            newVal = Math.random() > 0.95 ? 97 : 98 + Math.floor(Math.random() * 2);
        } else {
            newVal = parseFloat((98.2 + Math.random() * 0.8).toFixed(1));
        }
        
        return {
          ...v,
          value: newVal,
          trend,
          history: [...v.history.slice(1), newVal],
          status: v.label === 'Heart Rate' && newVal > 145 ? 'critical' : 
                  v.label === 'Heart Rate' && newVal > 120 ? 'warning' :
                  v.label === 'Blood Glucose' && (newVal > 200 || newVal < 70) ? 'critical' : 'normal'
        };
      }));

      setTelemetry(prev => {
        const last = prev[prev.length - 1];
        const newPoint: TelemetryPoint = {
          time,
          hr: last ? last.hr + (Math.random() * 4 - 2) : 72,
          spO2: 97 + Math.floor(Math.random() * 3),
          temp: 98.4 + (Math.random() * 0.4),
          glucose: last ? last.glucose + (Math.random() * 2 - 1) : 110,
          predictedGlucose: 115 + Math.floor(Math.random() * 10)
        };
        return [...prev.slice(-19), newPoint];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activePatientId]);

  const fetchInsights = async () => {
    setIsAiLoading(true);
    const result = await getHealthInsights(activePatient, vitals, telemetry);
    if (typeof result !== 'string') {
      setClinicalInsight(result);
    }
    setIsAiLoading(false);
  };

  const saveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setPatients(prev => prev.map(p => p.id === editProfile.id ? editProfile : p));
      setIsSaving(false);
      setAlerts(prev => [{
        id: Date.now().toString(),
        type: 'system',
        severity: 'low',
        message: `Profile updated for ${editProfile.name}.`,
        timestamp: new Date().toISOString(),
        isRead: false
      }, ...prev]);
    }, 800);
  };

  const handleEditChange = (field: keyof PatientProfile, value: any) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

  const addSimulatedDevice = () => {
    setIsAddingDevice(true);
    setTimeout(() => {
      const newDev: MonitorDevice = {
        id: `dev-${Date.now()}`,
        name: 'Simulated Biosensor X',
        type: 'BLE',
        category: 'Heart Rate',
        status: 'connected',
        battery: 100,
        lastSeen: 'Just now'
      };
      setDevices(prev => [...prev, newDev]);
      setIsAddingDevice(false);
      setAlerts(prev => [{
        id: Date.now().toString(),
        type: 'system',
        severity: 'low',
        message: `New Hardware Detected: ${newDev.name} paired successfully.`,
        timestamp: new Date().toISOString(),
        isRead: false
      }, ...prev]);
    }, 2000);
  };

  const removeDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const isAnyDeviceConnected = devices.length > 0;

  const renderPatientProfile = () => (
    <div className="max-w-5xl mx-auto space-y-10 pb-24">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-[80px] -z-10"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <ICONS.Shield className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Clinical Record</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Patient ID: {activePatient.id.toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={saveProfile}
            disabled={isSaving}
            className={`px-10 py-4 rounded-[1.5rem] font-black text-sm tracking-tight transition-all active:scale-95 shadow-xl ${isSaving ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'}`}
          >
            {isSaving ? 'SYNCING CHANGES...' : 'SAVE & SYNC HUB'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
              <input 
                type="text" 
                value={editProfile.name} 
                onChange={(e) => handleEditChange('name', e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[1.5rem] p-6 text-slate-800 font-bold outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Age</label>
                <input 
                  type="number" 
                  value={editProfile.age} 
                  onChange={(e) => handleEditChange('age', parseInt(e.target.value))}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[1.5rem] p-6 text-slate-800 font-bold outline-none transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Gender</label>
                <select 
                  value={editProfile.gender}
                  onChange={(e) => handleEditChange('gender', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[1.5rem] p-6 text-slate-800 font-bold outline-none transition-all appearance-none"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Blood Group</label>
              <input 
                type="text" 
                value={editProfile.bloodType} 
                onChange={(e) => handleEditChange('bloodType', e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[1.5rem] p-6 text-slate-800 font-bold outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Height (cm)</label>
                <input 
                  type="text" 
                  value={editProfile.height} 
                  onChange={(e) => handleEditChange('height', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[1.5rem] p-6 text-slate-800 font-bold outline-none transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Weight (kg)</label>
                <input 
                  type="text" 
                  value={editProfile.weight} 
                  onChange={(e) => handleEditChange('weight', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[1.5rem] p-6 text-slate-800 font-bold outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEdgeHub = () => (
    <div className="space-y-16">
      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-50/50 rounded-full blur-[120px]"></div>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-inner border border-blue-100/50">
              <ICONS.Cpu className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tighter text-slate-900 italic">BLR-EDGE-HUB-01</h3>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Bengaluru Healthcare Cluster Node</p>
            </div>
          </div>
          <button 
            onClick={addSimulatedDevice}
            disabled={isAddingDevice}
            className={`px-10 py-5 bg-[#05090f] text-white rounded-[1.75rem] font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl ${isAddingDevice ? 'animate-pulse opacity-50' : ''}`}
          >
            {isAddingDevice ? 'Scanning for Hardware...' : 'Add Monitor Hardware'}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 relative z-10">
          {[
            { label: 'CPU Temp', value: '44.2°C', detail: 'Optimal' },
            { label: 'MQTT Lag', value: '14ms', detail: 'Real-time' },
            { label: 'Uptime', value: '28.5 Days', detail: 'Stable' },
            { label: 'Active BLE', value: `${devices.length} Devices`, detail: 'Secure Mesh' }
          ].map((stat, i) => (
            <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-4 group-hover:text-blue-500 transition-colors">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 ml-4">Connected Biometric Monitors</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {devices.map((device) => (
              <div key={device.id} className="group relative bg-[#05090f] text-white p-8 rounded-[3rem] border border-white/5 hover:border-blue-500/30 transition-all overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] group-hover:bg-blue-600/10 transition-all"></div>
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl ${device.category === 'Glucose' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'} border border-white/10`}>
                    {device.category === 'Heart Rate' ? <ICONS.Heart className="w-6 h-6" /> : 
                     device.category === 'Oximeter' ? <ICONS.Activity className="w-6 h-6" /> : 
                     <ICONS.Droplet className="w-6 h-6" />}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'connected' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 pulse-emerald' : 'bg-slate-500'}`}></span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{device.status}</span>
                  </div>
                </div>
                <div className="space-y-1 mb-8">
                  <h5 className="font-black text-xl tracking-tight">{device.name}</h5>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{device.type} PROTOCOL</p>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 bg-white/10 rounded-sm p-0.5 relative">
                      <div className={`h-full bg-emerald-500 rounded-[1px]`} style={{ width: `${device.battery}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black tabular-nums text-slate-400">{device.battery}%</span>
                  </div>
                  <button 
                    onClick={() => removeDevice(device.id)}
                    className="text-[9px] font-black text-rose-500/50 hover:text-rose-500 uppercase tracking-widest transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAiAdvisor = () => (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-24">
      <div className="bg-[#05090f] p-16 rounded-[4.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col min-h-[800px]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[180px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[120px]"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-20 relative z-10">
          <div className="flex items-center gap-6">
            <div className={`p-6 rounded-3xl bg-white/5 border border-white/10 ${isAiLoading ? 'animate-pulse text-blue-400 shadow-blue-500/20' : 'text-blue-500 shadow-blue-500/10'} shadow-2xl`}>
              <ICONS.Cpu className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tighter italic">AI Clinical Diagnostic Hub</h3>
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[11px] mt-1">Autonomous Biometric Analysis Instance</p>
            </div>
          </div>
          <button 
            onClick={fetchInsights}
            disabled={isAiLoading}
            className="w-full lg:w-auto px-12 py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-blue-600/30 active:scale-95"
          >
            {isAiLoading ? 'PROCESSING CLINICAL TELEMETRY...' : 'INITIATE DEEP DIAGNOSTIC SCAN'}
          </button>
        </div>

        {clinicalInsight ? (
          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="xl:col-span-4 space-y-10">
              <div className="p-10 bg-white/5 rounded-[3.5rem] border border-white/10 flex flex-col items-center text-center">
                <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Patient Health Index</p>
                <div className="relative w-48 h-48 flex items-center justify-center">
                   <svg className="w-full h-full -rotate-90">
                     <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                     <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
                       strokeDasharray={2 * Math.PI * 80}
                       strokeDashoffset={2 * Math.PI * 80 * (1 - clinicalInsight.healthScore / 100)}
                       className={`transition-all duration-1000 ${clinicalInsight.healthScore > 80 ? 'text-emerald-500' : clinicalInsight.healthScore > 50 ? 'text-amber-400' : 'text-rose-500'}`}
                       strokeLinecap="round"
                     />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <p className={`text-6xl font-black tracking-tighter ${clinicalInsight.healthScore > 80 ? 'text-emerald-400' : clinicalInsight.healthScore > 50 ? 'text-amber-400' : 'text-rose-500'}`}>
                        {clinicalInsight.healthScore}
                     </p>
                     <p className="text-xs font-black text-slate-500 mt-1">/ 100</p>
                   </div>
                </div>
                <div className={`mt-8 px-8 py-3 rounded-full text-xs font-black border ${clinicalInsight.status === 'STABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {clinicalInsight.status} CLINICAL STATE
                </div>
              </div>

              <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 space-y-6">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                   <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                   Diagnostic Context
                </h4>
                <p className="text-sm font-medium leading-relaxed text-slate-300 italic">
                  "{clinicalInsight.clinicalContext}"
                </p>
              </div>
            </div>

            <div className="xl:col-span-8 space-y-12">
              <div className="space-y-4">
                <h4 className="text-[12px] font-black text-blue-400 uppercase tracking-[0.3em] ml-2">Executive Summary</h4>
                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10">
                  <p className="text-xl font-medium leading-relaxed text-slate-100">{clinicalInsight.summary}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <p className="text-[12px] font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
                     <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                     Observed Anomalies
                  </p>
                  <div className="space-y-4">
                    {clinicalInsight.anomalies.map((a, i) => (
                      <div key={i} className="text-sm text-slate-300 bg-white/5 p-6 rounded-[2rem] border border-white/5 font-medium leading-relaxed group hover:border-rose-500/30 transition-all">
                        {a}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                     Targeted Recommendations
                  </p>
                  <div className="space-y-4">
                    {clinicalInsight.recommendations.map((r, i) => (
                      <div key={i} className="flex gap-5 text-sm text-slate-200 bg-white/5 p-6 rounded-[2rem] border border-white/5 group hover:border-emerald-500/30 transition-all">
                        <span className="text-emerald-500 font-black text-lg">›</span>
                        <span className="font-medium leading-relaxed">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-50 space-y-10">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/20 blur-[50px] rounded-full"></div>
              <div className="w-32 h-32 bg-slate-800 rounded-[2.5rem] flex items-center justify-center relative z-10 border border-white/10 animate-bounce duration-[3000ms]">
                <ICONS.Activity className="w-14 h-14 text-slate-600" />
              </div>
            </div>
            <div className="max-w-md space-y-4">
              <h4 className="text-2xl font-black text-white tracking-tight">System Ready for Scanning</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">The clinical analysis engine is currently connected to the patient stream. Initiate a deep scan to generate HIPAA-compliant biometric intelligence.</p>
            </div>
          </div>
        )}

        <div className="mt-auto pt-16 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
            <div className="flex -space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-[#05090f] shadow-lg"></div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-[#05090f] shadow-lg"></div>
            </div>
            Clinical Engine Secured
          </div>
          <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/5">
            Latency: 142ms | Node: BLR-GATE-01
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-900 bg-[#f8f9fb]">
      <aside className="w-full md:w-[340px] bg-[#05090f] text-white p-10 flex flex-col h-auto md:h-screen sticky top-0 overflow-y-auto z-50 border-r border-white/5">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40">
            <ICONS.Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-black text-3xl tracking-tighter italic">Home<span className="text-blue-500 not-italic">Health</span></h1>
        </div>

        <div className="mb-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 px-4">Active Patients</p>
          <div className="space-y-3">
            {patients.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePatientId(p.id)}
                className={`w-full flex items-center gap-5 p-4 rounded-[1.75rem] transition-all group ${activePatientId === p.id ? 'bg-blue-600 shadow-2xl shadow-blue-600/30' : 'hover:bg-white/5'}`}
              >
                <div className={`w-11 h-11 rounded-[1.1rem] flex items-center justify-center font-black text-lg transition-all ${activePatientId === p.id ? 'bg-white text-blue-600 scale-105' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'}`}>
                  {p.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className={`font-black text-sm tracking-tight ${activePatientId === p.id ? 'text-white' : 'text-slate-300'}`}>{p.name}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${activePatientId === p.id ? 'text-blue-100' : 'text-slate-600'}`}>Patient ID: {p.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 mt-auto">
          <nav className="space-y-2">
            {[
              { id: DashboardTab.OVERVIEW, icon: <ICONS.Activity /> },
              { id: DashboardTab.PATIENT_PROFILE, icon: <ICONS.Shield /> },
              { id: DashboardTab.AI_ADVISOR, icon: <ICONS.Cpu /> },
              { id: DashboardTab.EDGE_HUB, icon: <ICONS.Cpu /> }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all capitalize text-sm font-black tracking-tight ${activeTab === item.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <div className="w-5 h-5 opacity-90">{item.icon}</div>
                {item.id.replace('_', ' ')}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-14 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-slate-900 capitalize tracking-tighter tabular-nums">
              {activeTab === DashboardTab.OVERVIEW ? activePatient.name : activeTab.replace('_', ' ')}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full shadow-sm">
                <span className={`flex h-2.5 w-2.5 rounded-full ${isAnyDeviceConnected ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' : 'bg-rose-500 shadow-lg shadow-rose-500/50'}`}></span>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isAnyDeviceConnected ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {isAnyDeviceConnected ? 'HARDWARE CONNECTED' : 'SYSTEM OFFLINE'}
                </p>
                <span className="w-px h-4 bg-slate-200 mx-2"></span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ENCRYPTED STREAM</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
             {alerts.length > 0 && (
               <div className="flex items-center gap-3 px-6 py-2.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600">
                  <ICONS.Activity className="w-4 h-4 animate-bounce" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Active Alerts: {alerts.length}</p>
               </div>
             )}
          </div>
        </header>

        {activeTab === DashboardTab.OVERVIEW && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10">
              <VitalCard vital={vitals[0]} icon={<ICONS.Heart className="w-5 h-5" />} />
              <VitalCard vital={vitals[1]} icon={<ICONS.Droplet className="w-5 h-5" />} />
              <VitalCard vital={vitals[2]} icon={<ICONS.Activity className="w-5 h-5" />} />
              <VitalCard vital={vitals[3]} icon={<ICONS.Thermometer className="w-5 h-5" />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="bg-white p-14 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                    <h3 className="font-black text-2xl text-slate-900 tracking-tight">Heart Rate Telemetry</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Real-time Biometric Pulse</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ICONS.Heart className="w-5 h-5" />
                  </div>
                </div>
                <HealthChart data={telemetry} metric="hr" color="#3b82f6" />
              </div>

              <div className="bg-white p-14 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                    <h3 className="font-black text-2xl text-slate-900 tracking-tight">Predicted Glucose Levels</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Edge-based LSTM Inference</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ICONS.Droplet className="w-5 h-5" />
                  </div>
                </div>
                <HealthChart data={telemetry} metric="glucose" color="#f59e0b" />
              </div>
            </div>

            {/* Compact System Alerts section below graphs if desired, or skip to remove deadspace */}
            {alerts.length > 0 && (
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Critical Events Log</h4>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className={`p-6 rounded-[2rem] border-2 transition-all ${alert.severity === 'high' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-50'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{alert.type}</span>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === DashboardTab.PATIENT_PROFILE && renderPatientProfile()}
        {activeTab === DashboardTab.AI_ADVISOR && renderAiAdvisor()}
        {activeTab === DashboardTab.EDGE_HUB && renderEdgeHub()}
      </main>
    </div>
  );
};

export default App;
