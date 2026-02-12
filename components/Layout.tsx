
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { translations } from '../i18n';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  setLang: (l: Language) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, lang, setLang }) => {
  const location = useLocation();
  const t = translations[lang];

  const navItems = [
    { path: '/', label: t.dashboard, icon: '🏠' },
    { path: '/ponds', label: t.ponds, icon: '🌊' },
    { path: '/assistant', label: t.assistant, icon: '🧠' },
    { path: '/voice', label: t.voice, icon: '🎙️' },
    { path: '/settings', label: t.settings, icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent text-slate-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-72 flex-col glass border-r border-white/10 sticky top-0 h-screen z-50">
        <div className="p-8 border-b border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-blue-400 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/30">
            P
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tighter text-white">PondGuard</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">Pro Advisor</p>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                location.pathname === item.path
                  ? 'bg-brand-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="font-semibold tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6">
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all duration-300"
          >
            🌐 {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 glass rounded-[2.5rem] px-4 flex justify-around items-center z-[100] border border-white/20 shadow-2xl">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${
              location.pathname === item.path ? 'text-blue-400 scale-110' : 'text-slate-500'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto pb-32 md:pb-0">
        <header className="md:hidden glass px-8 py-6 border-b border-white/10 flex justify-between items-center sticky top-0 z-40">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
             <h1 className="text-xl font-black text-white tracking-tighter">PondGuard</h1>
           </div>
           <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
             {lang === 'en' ? 'BN' : 'EN'}
           </button>
        </header>
        <div className="max-w-6xl mx-auto p-6 md:p-12 animate-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
