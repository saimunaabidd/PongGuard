
import React from 'react';
import { Pond, WaterReading, Language } from '../types';
import { translations } from '../i18n';
import { Link } from 'react-router-dom';

interface DashboardProps {
  ponds: Pond[];
  readings: WaterReading[];
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ ponds, readings, lang }) => {
  const t = translations[lang];

  const getLatestReading = (pondId: string) => {
    return readings
      .filter(r => r.pondId === pondId)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  };

  const totalStock = ponds.reduce((acc, curr) => acc + (curr.stockingDensity * curr.area), 0);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
            Welcome to <span className="text-blue-500">PondGuard</span>
          </h2>
          <p className="text-blue-400/60 font-bold mt-2 tracking-widest uppercase text-xs">
            {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/ponds" className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-blue-600/30 active:scale-95 flex items-center gap-3">
          <span className="text-xl">+</span> {t.addPond}
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-7xl opacity-5 transition-transform group-hover:scale-125 duration-500">🌊</div>
          <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest">{t.activePonds}</p>
          <div className="flex items-baseline gap-2 mt-4">
             <p className="text-6xl font-black text-white tracking-tighter">{ponds.length}</p>
             <span className="text-blue-500/50 font-bold text-sm">TOTAL</span>
          </div>
        </div>
        
        <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-7xl opacity-5 transition-transform group-hover:scale-125 duration-500">🐠</div>
          <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest">{t.totalAnimals}</p>
          <div className="flex items-baseline gap-2 mt-4">
             <p className="text-6xl font-black text-white tracking-tighter">{totalStock.toLocaleString()}</p>
             <span className="text-blue-500/50 font-bold text-sm">STOCK</span>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-7xl opacity-10 animate-pulse">🚨</div>
          <p className="text-red-400/60 text-[10px] font-black uppercase tracking-widest">{t.recentAlerts}</p>
          <div className="mt-5">
            <p className="text-base font-bold text-slate-300">{t.noAlerts}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-2 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <h3 className="text-2xl font-black text-white tracking-tight">{t.waterQuality}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ponds.map(pond => {
            const last = getLatestReading(pond.id);
            return (
              <Link key={pond.id} to={`/ponds/${pond.id}`} className="block">
                <div className="glass-card p-10 rounded-[3rem] relative group border-white/10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h4 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tighter">{pond.name}</h4>
                      <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.25em] mt-2">{pond.species} • {pond.type}</p>
                    </div>
                  </div>
                  
                  {last ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'pH', val: last.ph, color: 'text-blue-400' },
                        { label: 'O2', val: last.dissolvedOxygen, color: 'text-cyan-400' },
                        { label: 'TEMP', val: `${last.temperature}°`, color: 'text-emerald-400' },
                        { label: 'SAL', val: last.salinity, color: 'text-indigo-400' }
                      ].map((p, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                          <p className="text-[10px] font-black text-slate-500 tracking-widest mb-1">{p.label}</p>
                          <p className={`text-2xl font-black ${p.color}`}>{p.val}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] hover:border-blue-500/30 transition-all">
                      <p className="text-slate-500 font-black text-xs uppercase tracking-[0.2em]">{t.newReading}</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
