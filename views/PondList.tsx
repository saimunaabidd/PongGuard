
import React, { useState } from 'react';
import { Pond, Language } from '../types';
import { translations } from '../i18n';
import { Link } from 'react-router-dom';

interface PondListProps {
  ponds: Pond[];
  onAddPond: (pond: Pond) => void;
  lang: Language;
}

const PondList: React.FC<PondListProps> = ({ ponds, onAddPond, lang }) => {
  const t = translations[lang];
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'shrimp' | 'fish'>('shrimp');

  const speciesOptions = {
    shrimp: [
      { id: 'Bagda', label: t.spBagda },
      { id: 'Galda', label: t.spGalda },
      { id: 'Vannamei', label: t.spVannamei },
    ],
    fish: [
      { id: 'Rui', label: t.spRui },
      { id: 'Katla', label: t.spKatla },
      { id: 'Mrigal', label: t.spMrigal },
      { id: 'Pangas', label: t.spPangas },
      { id: 'Tilapia', label: t.spTilapia },
      { id: 'Koi', label: t.spKoi },
      { id: 'Pabda', label: t.spPabda },
      { id: 'Shing', label: t.spShing },
    ]
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPond: Pond = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      type: formData.get('type') as 'shrimp' | 'fish',
      species: formData.get('species') as string,
      area: parseFloat(formData.get('area') as string),
      depth: parseFloat(formData.get('depth') as string),
      stockingDate: formData.get('date') as string,
      stockingDensity: parseFloat(formData.get('density') as string),
      location: {
        address: formData.get('address') as string,
        lat: parseFloat(formData.get('lat') as string || '0'),
        lng: parseFloat(formData.get('lng') as string || '0'),
      }
    };
    onAddPond(newPond);
    setModalOpen(false);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">{t.ponds}</h2>
          <p className="text-blue-500/60 font-bold text-[10px] uppercase tracking-widest mt-2">Fleet Operations</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
        >
          Deploy Pond
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ponds.map(pond => (
          <Link key={pond.id} to={`/ponds/${pond.id}`} className="group">
            <div className="glass-card p-10 rounded-[3rem] relative group border-white/5">
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 glass rounded-[1.5rem] flex items-center justify-center text-2xl">
                  {pond.type === 'shrimp' ? '🦐' : '🐟'}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  pond.type === 'shrimp' ? 'bg-blue-500/10 text-blue-400' : 'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {pond.type}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">{pond.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{pond.species}</span>
                   <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{pond.area} m²</span>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                   Incepted: {new Date(pond.stockingDate).toLocaleDateString()}
                </div>
                <span className="text-blue-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">Inspect →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-deep-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="glass rounded-[3rem] w-full max-w-2xl shadow-2xl border border-white/10 overflow-hidden animate-in">
            <div className="p-10 bg-brand-700 text-white">
              <h3 className="text-3xl font-black tracking-tighter uppercase">{t.addPond}</h3>
              <p className="text-blue-300 font-bold text-[10px] uppercase tracking-widest mt-2">Strategic Deployment Protocol</p>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.pondName}</label>
                <input name="name" required placeholder="e.g. South Sector 1" className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-white font-bold outline-none focus:ring-4 ring-blue-500/20 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.pondType}</label>
                  <select 
                    name="type" 
                    onChange={(e) => setSelectedType(e.target.value as 'shrimp' | 'fish')}
                    className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-white font-bold outline-none focus:ring-4 ring-blue-500/20 transition-all appearance-none"
                  >
                    <option value="shrimp">Shrimp (চিংড়ি)</option>
                    <option value="fish">Fish (মাছ)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.selectSpecies}</label>
                  <select name="species" className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-white font-bold outline-none focus:ring-4 ring-blue-500/20 transition-all appearance-none">
                    {speciesOptions[selectedType].map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                    <option value="Other">Other Species</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Geolocation</label>
                </div>
                <input name="address" placeholder="e.g. Khulna, Bangladesh" className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-white font-bold outline-none focus:ring-4 ring-blue-500/20 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                {[
                  { label: t.area, name: 'area', unit: 'sqm' },
                  { label: 'Stocking Date', name: 'date', type: 'date' },
                  { label: t.depth, name: 'depth', unit: 'm' },
                  { label: 'Density (/m²)', name: 'density', unit: '/m²' }
                ].map(f => (
                  <div key={f.name} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.label}</label>
                    <input 
                      name={f.name} 
                      type={f.type || 'number'} 
                      required 
                      className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-white font-bold outline-none focus:ring-4 ring-blue-500/20 transition-all" 
                      defaultValue={f.type === 'date' ? new Date().toISOString().split('T')[0] : ''}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-10 flex gap-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 p-6 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-xs">
                  {t.cancel}
                </button>
                <button type="submit" className="flex-2 p-6 rounded-2xl bg-brand-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/30 hover:bg-brand-500 transition-all">
                  Initialize Pond
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PondList;
