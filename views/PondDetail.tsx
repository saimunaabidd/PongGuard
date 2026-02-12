
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pond, WaterReading, Language } from '../types';
import { translations } from '../i18n';
import { generateDailyPlan, getLocalInsights } from '../services/geminiService';

interface PondDetailProps {
  ponds: Pond[];
  readings: WaterReading[];
  onAddReading: (reading: WaterReading) => void;
  lang: Language;
}

const PondDetail: React.FC<PondDetailProps> = ({ ponds, readings, onAddReading, lang }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = translations[lang];
  const pond = ponds.find(p => p.id === id);

  const [isReadingModalOpen, setReadingModalOpen] = useState(false);
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const pondReadings = readings
    .filter(r => r.pondId === id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const latestReading = pondReadings[0];

  const fetchPlan = async () => {
    if (!pond) return;
    setLoadingPlan(true);
    try {
      const plan = await generateDailyPlan(pond, latestReading, lang);
      setAiPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(false);
    }
  };

  const fetchInsights = async () => {
    if (!pond) return;
    setLoadingInsights(true);
    try {
      const data = await getLocalInsights(pond, lang);
      setInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (pond) fetchInsights();
  }, [pond]);

  const handleAddReading = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newReading: WaterReading = {
      id: Math.random().toString(36).substr(2, 9),
      pondId: pond!.id,
      timestamp: Date.now(),
      ph: parseFloat(formData.get('ph') as string),
      dissolvedOxygen: parseFloat(formData.get('do') as string),
      temperature: parseFloat(formData.get('temp') as string),
      salinity: parseFloat(formData.get('salinity') as string),
    };
    onAddReading(newReading);
    setReadingModalOpen(false);
  };

  if (!pond) return <div className="p-20 text-center font-black text-slate-700 tracking-widest uppercase">Pond Signal Lost</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-4 glass rounded-2xl hover:bg-white/10 transition-colors">
          <span className="text-xl">←</span>
        </button>
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">{pond.name}</h2>
          <div className="flex gap-3 mt-2">
            <span className="px-4 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">{pond.type}</span>
            <span className="px-4 py-1 bg-white/5 text-slate-400 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{pond.species}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI Plan Card */}
          <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 text-8xl opacity-5">🔮</div>
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-4">
                  <span className="text-3xl">🦾</span> {t.dailyPlan}
                </h3>
                {aiPlan && (
                  <button onClick={fetchPlan} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">Refresh Data</button>
                )}
              </div>
              
              {!aiPlan ? (
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
                  <p className="text-slate-400 font-medium leading-relaxed">
                    Our Pro AI engine is ready to compute a precision plan for your {pond.species} stock based on real-time parameters.
                  </p>
                  <button 
                    onClick={fetchPlan} 
                    disabled={loadingPlan} 
                    className="w-full sm:w-auto px-10 py-5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
                  >
                    {loadingPlan ? 'Neural Computation...' : t.generatePlan}
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiPlan.tasks.map((task: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-all group">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{task.time}</span>
                        <h4 className="text-lg font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">{task.title}</h4>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">{task.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-brand-600/10 p-8 rounded-[2rem] border border-brand-600/20">
                    <p className="text-sm italic font-medium text-blue-200 leading-relaxed">"{aiPlan.summary}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="glass-card rounded-[3rem] overflow-hidden">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-xl font-black text-white tracking-tight">{t.records}</h3>
              <button 
                onClick={() => setReadingModalOpen(true)} 
                className="px-6 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-blue-500/20 transition-all"
              >
                + {t.newReading}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.03] text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                  <tr>
                    <th className="px-10 py-6">Timestamp</th>
                    <th className="px-6 py-6 text-blue-400">pH</th>
                    <th className="px-6 py-6 text-cyan-400">DO</th>
                    <th className="px-6 py-6 text-emerald-400">Temp</th>
                    <th className="px-6 py-6 text-indigo-400">Sal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {pondReadings.map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-10 py-6 text-slate-400 font-bold">{new Date(r.timestamp).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</td>
                      <td className="px-6 py-6 font-black text-blue-200">{r.ph}</td>
                      <td className="px-6 py-6 font-black text-cyan-200">{r.dissolvedOxygen}</td>
                      <td className="px-6 py-6 font-black text-emerald-200">{r.temperature}°</td>
                      <td className="px-6 py-6 font-black text-indigo-200">{r.salinity}</td>
                    </tr>
                  ))}
                  {pondReadings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-10 py-20 text-center text-slate-600 font-bold uppercase tracking-widest">No Telemetry Recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="glass-card p-10 rounded-[3rem] space-y-8">
            <h3 className="text-lg font-black text-white border-b border-white/5 pb-4 tracking-tight uppercase">Coordinates</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{t.address}</p>
                <p className="font-bold text-slate-200 text-sm leading-relaxed">{pond.location?.address || 'Deep Ocean'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{t.latitude}</p>
                  <p className="font-black text-blue-400 text-sm">{pond.location?.lat?.toFixed(4) || '0.0000'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{t.longitude}</p>
                  <p className="font-black text-blue-400 text-sm">{pond.location?.lng?.toFixed(4) || '0.0000'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-10 rounded-[3rem] space-y-6">
             <div className="flex justify-between items-center">
               <h3 className="text-lg font-black text-white uppercase tracking-tight">Regional Sync</h3>
               {loadingInsights && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
             </div>
             
             {insights ? (
               <div className="space-y-6">
                 <p className="text-xs text-slate-400 leading-relaxed font-medium">{insights.text}</p>
                 {insights.links && insights.links.length > 0 && (
                   <div className="flex flex-col gap-2 pt-2">
                     {insights.links.map((chunk: any, i: number) => (
                       chunk.maps && (
                         <a key={i} href={chunk.maps.uri} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                           <span className="text-lg group-hover:scale-110 transition-transform">📍</span>
                           <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{chunk.maps.title}</span>
                         </a>
                       )
                     ))}
                   </div>
                 )}
               </div>
             ) : (
               <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest animate-pulse">Scanning Grid...</p>
             )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isReadingModalOpen && (
        <div className="fixed inset-0 bg-deep-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="glass rounded-[3rem] w-full max-w-xl shadow-2xl border border-white/10 overflow-hidden animate-in">
            <div className="p-10 bg-brand-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black tracking-tighter">{t.newReading}</h3>
                <p className="text-blue-200 font-bold text-xs uppercase tracking-widest mt-1">{pond.name}</p>
              </div>
              <button onClick={() => setReadingModalOpen(false)} className="text-3xl hover:rotate-90 transition-transform duration-300">✕</button>
            </div>
            <form onSubmit={handleAddReading} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { id: 'ph', label: t.ph, def: '7.5', step: '0.1' },
                  { id: 'do', label: 'Oxygen', def: '6.0', step: '0.1' },
                  { id: 'temp', label: 'Celsius', def: '28', step: '0.5' },
                  { id: 'salinity', label: 'Salinity', def: '15', step: '1' }
                ].map(field => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{field.label}</label>
                    <input 
                      name={field.id} 
                      type="number" 
                      step={field.step} 
                      required 
                      className="w-full p-5 bg-white/5 border border-white/5 rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/20 transition-all font-black text-xl text-white" 
                      defaultValue={field.def} 
                    />
                  </div>
                ))}
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setReadingModalOpen(false)} className="flex-1 p-6 rounded-[1.5rem] bg-white/5 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                  {t.cancel}
                </button>
                <button type="submit" className="flex-2 p-6 rounded-[1.5rem] bg-brand-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/30 hover:bg-brand-500 transition-all">
                  Sync Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PondDetail;
