import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets, 
  ShieldCheck, 
  Bell, 
  Settings, 
  AlertTriangle,
  Zap,
  Cpu,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  History,
  Info,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useHealthData } from './hooks/useHealthData';
import { analyzeHealthTrends } from './services/geminiService';
import { PredictionInsight } from './types';
import MetricCard from './components/MetricCard';

const App: React.FC = () => {
  const { currentMetrics, history } = useHealthData();
  const [insight, setInsight] = useState<PredictionInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'edge'>('overview');
  const lastAnalysisRef = useRef<number>(0);

  const fetchAiInsight = async () => {
    if (history.length < 10 || isAnalyzing) return;
    
    // Throttling: only analyze if 30s has passed since last analysis
    if (Date.now() - lastAnalysisRef.current < 30000) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeHealthTrends(history);
      setInsight(result);
      lastAnalysisRef.current = Date.now();
    } catch (err) {
      console.error("AI Analysis Failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    if (history.length > 10) {
      fetchAiInsight();
    }
    
    // Regular check
    const interval = setInterval(() => {
      fetchAiInsight();
    }, 15000);

    return () => clearInterval(interval);
  }, [history.length]);

  const riskStyles = useMemo(() => {
    switch (insight?.riskLevel) {
      case 'Critical': return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', accent: 'text-rose-500', iconBg: 'bg-rose-500' };
      case 'High': return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', accent: 'text-orange-500', iconBg: 'bg-orange-500' };
      case 'Moderate': return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', accent: 'text-blue-500', iconBg: 'bg-blue-500' };
      default: return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'text-emerald-500', iconBg: 'bg-emerald-500' };
    }
  }, [insight?.riskLevel]);

  return (
    <div className="min-h-screen pb-20 lg:pb-0 lg:pl-72 flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-100 p-8 z-50">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900">Guardian</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Home Health AI</p>
          </div>
        </div>

        <div className="mb-10 p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-xl shadow-slate-200 overflow-hidden transition-transform group-hover:scale-105 duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&q=80&w=200&h=200" 
                  alt="Patient" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg"></div>
            </div>
            <h2 className="font-bold text-slate-900 text-lg">Rajesh Kumar</h2>
            <div className="inline-flex items-center px-2 py-1 bg-white border border-slate-200 rounded-lg mt-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PATIENT #8812</span>
            </div>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'overview', icon: Activity, label: 'Health Feed' },
            { id: 'trends', icon: TrendingUp, label: 'Analytics' },
            { id: 'edge', icon: Cpu, label: 'Edge System' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} strokeWidth={activeTab === item.id ? 3 : 2} />
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={14} className="opacity-60" />}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-100">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
            <Settings size={14} />
            System Control
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 max-w-[1400px] mx-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'overview' ? 'Live Monitoring' : activeTab === 'trends' ? 'Clinical Insights' : 'Edge Nodes'}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Active Edge Hub</span>
              </div>
              <span className="text-slate-300 text-xs font-bold">•</span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Bengaluru DC #04</span>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none relative">
              <button className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:scale-105 transition-all group relative">
                <Bell size={24} className="text-slate-400 group-hover:text-indigo-600" />
                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>
              </button>
            </div>
            <button className="flex-1 md:flex-none flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all">
              <Activity size={18} />
              Manual Sync
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Health Metrics Grid */}
            <div className="xl:col-span-3 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <MetricCard 
                  label="Glucose Level" 
                  value={Math.round(currentMetrics.glucose)} 
                  unit="mg/dL" 
                  color="emerald"
                  hexColor="#10b981"
                  data={history}
                  dataKey="glucose"
                  icon={<Droplets size={24} />}
                />
                <MetricCard 
                  label="Heart Rate" 
                  value={Math.round(currentMetrics.heartRate)} 
                  unit="BPM" 
                  color="rose"
                  hexColor="#f43f5e"
                  data={history}
                  dataKey="heartRate"
                  icon={<Heart size={24} />}
                />
                <MetricCard 
                  label="SpO2 Blood O2" 
                  value={currentMetrics.spO2.toFixed(1)} 
                  unit="%" 
                  color="blue"
                  hexColor="#3b82f6"
                  data={history}
                  dataKey="spO2"
                  icon={<Activity size={24} />}
                />
                <MetricCard 
                  label="Body Temperature" 
                  value={currentMetrics.temperature.toFixed(1)} 
                  unit="°F" 
                  color="amber"
                  hexColor="#f59e0b"
                  data={history}
                  dataKey="temperature"
                  icon={<Thermometer size={24} />}
                />
              </div>

              {/* Central Graph */}
              <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={120} />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Health Trajectory</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} />
                      Continuous 48-Hour Dataset Correlation
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-emerald-700 uppercase">Glucose</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      <span className="text-[10px] font-black text-rose-700 uppercase">Heart Rate</span>
                    </div>
                  </div>
                </div>

                <div className="h-[360px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="#cbd5e1" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '2rem', 
                          border: 'none', 
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                          padding: '20px',
                          fontWeight: '800'
                        }}
                      />
                      <Area yAxisId="left" type="monotone" dataKey="glucose" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorGlucose)" dot={false} />
                      <Area yAxisId="right" type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorHeart)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Insight Panel */}
            <div className="xl:col-span-1 space-y-8">
              <div className={`rounded-[3rem] p-10 border-2 transition-all duration-700 flex flex-col min-h-[500px] shadow-2xl ${riskStyles.bg} ${riskStyles.border} shadow-${riskStyles.accent}/10`}>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white rounded-3xl shadow-sm text-slate-800">
                      <Zap size={24} className={riskStyles.accent} />
                    </div>
                    <div>
                      <h3 className={`font-black uppercase tracking-widest text-[11px] ${riskStyles.text}`}>Guardian AI Agent</h3>
                      <p className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Gemini-3 Engine</p>
                    </div>
                  </div>
                  {isAnalyzing ? (
                    <RefreshCw size={22} className="animate-spin text-slate-400" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  )}
                </div>

                {insight ? (
                  <div className="flex-1 flex flex-col">
                    <div className="mb-8">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Patient Risk Level</div>
                      <div className={`text-4xl font-black flex items-center gap-4 ${riskStyles.text}`}>
                        {insight.riskLevel}
                        {insight.riskLevel !== 'Low' && <AlertTriangle size={36} className="animate-bounce" />}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-white/50 rounded-[2rem] border border-white/40 shadow-sm backdrop-blur-md">
                        <p className={`text-sm leading-relaxed font-bold ${riskStyles.text}`}>
                          {insight.summary}
                        </p>
                      </div>

                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3 flex items-center gap-2">
                          <Activity size={12} />
                          Anomalies Detected
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {insight.anomaliesDetected.length > 0 ? insight.anomaliesDetected.map((a, i) => (
                            <span key={i} className={`px-4 py-2 rounded-2xl bg-white text-[11px] font-black border border-current/10 shadow-sm ${riskStyles.text}`}>{a}</span>
                          )) : <span className="text-xs font-bold italic opacity-60 px-4">Normal baseline maintained</span>}
                        </div>
                      </div>

                      <div className="pt-8 border-t border-current/10 mt-auto">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">AI Intervention</div>
                        <div className={`p-6 rounded-[2rem] border border-white flex gap-4 ${riskStyles.iconBg} text-white shadow-xl shadow-current/10 animate-pulse-soft`}>
                          <Info size={24} className="shrink-0 mt-1" />
                          <p className="text-xs font-extrabold italic leading-relaxed">"{insight.recommendation}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 text-center space-y-6">
                    <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-slate-200">
                      <RefreshCw className="animate-spin text-indigo-400" size={48} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Processing Edge Logs</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Neural analysis in progress...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Log */}
              <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl text-slate-100 min-h-[250px] relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <Activity size={16} className="text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Edge Telemetry Feed</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">LIVE</div>
                </div>
                <div className="space-y-3 font-mono text-[10px] opacity-70">
                  <div className="flex justify-between">
                    <span className="text-emerald-400">[OK]</span>
                    <span>PKT_RECV: glucose={currentMetrics.glucose.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">[DATA]</span>
                    <span>HUB_4412: spO2 sync successful</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400">[WARN]</span>
                    <span>LATENCY: 42ms (Edge Hub)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-400">[PROC]</span>
                    <span>LSTM: anomaly check complete</span>
                  </div>
                  <div className="flex justify-between italic text-slate-500 mt-4">
                    <span>... listening on port 1883</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Weekly Health Correlation</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Cross-modality patient analysis</p>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Export Report</button>
                  <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all">Doctor Sync</button>
                </div>
              </div>
              
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={history.slice(-24)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis stroke="#cbd5e1" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: '800' }}
                    />
                    <Bar dataKey="glucose" fill="#10b981" radius={[10, 10, 0, 0]} barSize={30} />
                    <Bar dataKey="heartRate" fill="#f43f5e" radius={[10, 10, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Sleep Efficiency', val: '92%', icon: Clock, color: 'blue' },
                { label: 'Activity Index', val: '1.4k Step', icon: Activity, color: 'emerald' },
                { label: 'Caloric Balance', val: '-240 kcal', icon: Droplets, color: 'rose' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                  <div className={`p-5 rounded-[1.5rem] bg-${stat.color}-50 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{stat.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'edge' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {[
              { id: '4412-A', type: 'Core Hub', status: 'Online', load: 12, temp: 42, icon: Cpu },
              { id: '4412-B', type: 'Room Sensor', status: 'Online', load: 4, temp: 31, icon: Activity },
              { id: '4412-C', type: 'Wearable Unit', status: 'Syncing', load: 22, temp: 28, icon: Heart }
            ].map((node) => (
              <div key={node.id} className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="p-5 bg-indigo-50 rounded-[1.5rem] text-indigo-600 shadow-lg shadow-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                    <node.icon size={32} />
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${node.status === 'Online' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${node.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    {node.status}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 relative z-10">{node.type}</h3>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em] relative z-10">NODE: #{node.id}</p>
                
                <div className="mt-12 space-y-6 relative z-10">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400 italic">Compute Pressure</span>
                      <span className="text-slate-900">{node.load}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-indigo-500 rounded-full shadow-lg shadow-indigo-200 transition-all duration-1000" style={{ width: `${node.load}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-4 border-t border-slate-50">
                    <span className="text-slate-400">Node Temperature</span>
                    <span className="text-slate-900 px-3 py-1 bg-slate-50 rounded-lg">{node.temp}°C</span>
                  </div>
                </div>
              </div>
            ))}
            
            <button className="bg-slate-50 rounded-[3rem] p-10 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-indigo-300 hover:text-indigo-500 transition-all duration-500 group">
              <div className="p-5 rounded-full bg-white shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <RefreshCw size={32} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Provision New Node</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile Nav Dock */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/80 backdrop-blur-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex justify-around items-center px-4 z-[100]">
        {[
          { id: 'overview', icon: Activity, label: 'Feed' },
          { id: 'trends', icon: TrendingUp, label: 'Analytics' },
          { id: 'edge', icon: Cpu, label: 'Nodes' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 px-4 py-2 rounded-2xl ${activeTab === tab.id ? 'text-indigo-600 bg-indigo-50 scale-110' : 'text-slate-400'}`}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 3 : 2} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;