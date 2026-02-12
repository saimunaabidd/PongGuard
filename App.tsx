
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Pond, WaterReading, Language } from './types';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import PondList from './views/PondList';
import PondDetail from './views/PondDetail';
import ChatAssistant from './views/ChatAssistant';
import LiveAudio from './components/LiveAudio';
import Settings from './views/Settings';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('pondguard_lang');
    return (saved as Language) || 'en';
  });

  const [ponds, setPonds] = useState<Pond[]>(() => {
    const saved = localStorage.getItem('pondguard_ponds');
    return saved ? JSON.parse(saved) : [
      {
        id: 'p1',
        name: 'Main South Pond',
        type: 'shrimp',
        species: 'Vannamei',
        area: 800,
        depth: 1.6,
        stockingDate: '2025-01-10',
        stockingDensity: 55,
        location: { address: 'Khulna, Bangladesh', lat: 22.8456, lng: 89.5403 }
      }
    ];
  });

  const [readings, setReadings] = useState<WaterReading[]>(() => {
    const saved = localStorage.getItem('pondguard_readings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => localStorage.setItem('pondguard_lang', lang), [lang]);
  useEffect(() => localStorage.setItem('pondguard_ponds', JSON.stringify(ponds)), [ponds]);
  useEffect(() => localStorage.setItem('pondguard_readings', JSON.stringify(readings)), [readings]);

  const resetData = () => {
    localStorage.clear();
    setPonds([]);
    setReadings([]);
    setLang('en');
    window.location.reload();
  };

  return (
    <HashRouter>
      <Layout lang={lang} setLang={setLang}>
        <Routes>
          <Route path="/" element={<Dashboard ponds={ponds} readings={readings} lang={lang} />} />
          <Route path="/ponds" element={<PondList ponds={ponds} onAddPond={p => setPonds([...ponds, p])} lang={lang} />} />
          <Route path="/ponds/:id" element={<PondDetail ponds={ponds} readings={readings} onAddReading={r => setReadings([...readings, r])} lang={lang} />} />
          <Route path="/assistant" element={<ChatAssistant lang={lang} />} />
          <Route path="/voice" element={<div className="flex items-center justify-center min-h-[70vh]"><LiveAudio lang={lang} /></div>} />
          <Route path="/settings" element={<Settings lang={lang} setLang={setLang} onResetData={resetData} />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
