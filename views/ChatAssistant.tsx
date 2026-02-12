
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language, WeatherData } from '../types';
import { translations } from '../i18n';
import { chatWithAssistant, textToSpeech, fileToGenerativePart } from '../services/geminiService';
import { fetchCurrentWeather } from '../services/weatherService';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  grounding?: any[];
  timestamp: number;
}

const ChatAssistant: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome',
      role: 'assistant', 
      content: lang === 'en' 
        ? "Neural Link Active. I am your PondGuard Pro Advisor. How can I assist with your aquaculture operations today?" 
        : "সিস্টেম সক্রিয়। আমি আপনার পন্ডগার্ড প্রো উপদেষ্টা। আজ আপনার খামারের জন্য আমি কীভাবে সাহায্য করতে পারি?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const weather = await fetchCurrentWeather(pos.coords.latitude, pos.coords.longitude, lang);
      setWeatherData(weather);
    });
  }, [lang]);

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    const userQuery = input.trim();
    const file = selectedFile;
    const currentPreview = previewUrl;

    setInput('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setLoading(true);

    const userMsg: Message = { 
      id: Math.random().toString(),
      role: 'user', 
      content: userQuery,
      image: currentPreview || undefined,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      let imagePart = null;
      if (file) imagePart = await fileToGenerativePart(file);

      const response = await chatWithAssistant(userQuery, lang, { 
        useThinking, 
        imagePart, 
        useSearch, 
        weatherData 
      });

      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        content: response.text || "No response received.",
        grounding: response.grounding,
        timestamp: Date.now()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        id: Math.random().toString(),
        role: 'assistant', 
        content: "Neural link error. Re-try requested.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-100px)] glass rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-10 py-8 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-3xl z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-700 to-blue-400 rounded-3xl flex items-center justify-center text-white text-3xl shadow-2xl">
            🤖
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter">PondGuard <span className="text-blue-500 text-sm tracking-widest ml-1">PRO AI</span></h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Active • Gemini 3 Pro</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex gap-4">
           <button onClick={() => setUseThinking(!useThinking)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${useThinking ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 text-slate-400'}`}>
             🧠 Think
           </button>
           <button onClick={() => setUseSearch(!useSearch)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${useSearch ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-white/5 text-slate-400'}`}>
             🌐 Search
           </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-10 py-12 space-y-12 scroll-smooth custom-scrollbar relative">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in`}>
            <div className={`max-w-[85%] md:max-w-[70%]`}>
              <div className={`p-8 rounded-[2.5rem] text-[15px] leading-relaxed transition-all duration-500 ${msg.role === 'user' ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-tr-none shadow-xl shadow-blue-900/20 font-medium' : 'bg-white/[0.04] text-slate-100 rounded-tl-none border border-white/5 hover:bg-white/[0.06]'}`}>
                {msg.image && <img src={msg.image} className="mb-6 rounded-3xl shadow-2xl border border-white/10" alt="Farmer data" />}
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.role === 'assistant' && (
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <button onClick={() => textToSpeech(msg.content)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase text-blue-400">🔊 Voice</button>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="animate-pulse flex items-start gap-6"><div className="w-14 h-14 bg-white/5 rounded-2xl"></div><div className="space-y-3 mt-2"><div className="h-4 w-64 bg-white/5 rounded-full"></div><div className="h-4 w-40 bg-white/[0.02] rounded-full"></div></div></div>}
        <div ref={endRef} />
      </div>

      {/* Input Bar */}
      <div className="p-10 bg-white/[0.01] backdrop-blur-3xl border-t border-white/5 z-10">
        <div className="max-w-4xl mx-auto relative">
          {previewUrl && (
            <div className="absolute -top-32 left-0 w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-2xl animate-in">
              <img src={previewUrl} className="w-full h-full object-cover" alt="Scan" />
              <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[10px]">✕</button>
            </div>
          )}
          <div className="flex items-center gap-4 bg-white/[0.03] p-3 rounded-[3rem] border border-white/10 focus-within:ring-4 ring-blue-500/20 transition-all shadow-2xl">
            <button onClick={() => fileInputRef.current?.click()} className="p-5 text-slate-500 hover:text-blue-400 hover:bg-white/5 rounded-full">📷</button>
            <input type="file" ref={fileInputRef} hidden onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
            }} accept="image/*" />
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder={t.askAssistant} className="flex-1 px-4 py-4 bg-transparent outline-none text-white font-bold placeholder:text-slate-600" />
            <button onClick={() => navigate('/voice')} className="p-5 text-slate-500 hover:text-cyan-400 hover:bg-white/5 rounded-full hidden sm:block">🎙️</button>
            <button onClick={handleSend} disabled={loading || (!input.trim() && !selectedFile)} className={`px-12 py-5 rounded-[2.5rem] font-black text-sm tracking-[0.2em] uppercase transition-all ${loading || (!input.trim() && !selectedFile) ? 'bg-white/5 text-slate-700' : 'bg-brand-600 text-white hover:bg-brand-500 shadow-xl shadow-blue-600/30'}`}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
