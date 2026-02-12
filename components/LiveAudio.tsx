

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { translations } from '../i18n';
import { Language } from '../types';

interface LiveAudioProps {
  lang: Language;
}

const LiveAudio: React.FC<LiveAudioProps> = ({ lang }) => {
  const t = translations[lang];
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const sessionRef = useRef<any>(null);
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const startSession = async () => {
    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
    outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsActive(true);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            // Using deprecated ScriptProcessorNode for simplicity in this example.
            // For production, consider AudioWorkletNode.
            const processor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              if (sessionRef.current) { // Ensure session is active before sending
                const input = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(input.length);
                for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
                sessionRef.current.sendRealtimeInput({
                  media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
                });
              }
            };
            source.connect(processor);
            processor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio && outputAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              const buffer = await decodeAudioData(decode(audio), outputAudioContextRef.current, 24000);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContextRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: (e) => {
            console.error("Live session error:", e);
            setStatus('idle');
            setIsActive(false);
          },
          onclose: () => {
            setStatus('idle');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are PondGuard Voice Assistant. Help farmers with pond management advice in ${lang === 'en' ? 'English' : 'Bangla'}.`
        }
      });
  
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error("Failed to start live session or get media devices:", error);
      setStatus('idle');
      setIsActive(false);
      // Potentially show a user-friendly error message about microphone access
    }
  };

  const endSession = () => {
    sessionRef.current?.close();
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setStatus('idle');
    setIsActive(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md mx-auto text-center space-y-6">
      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl transition-all duration-500 ${status === 'active' ? 'bg-teal-500 text-white animate-pulse scale-110 shadow-lg shadow-teal-200' : 'bg-slate-100 text-slate-400'}`}>
        {status === 'active' ? '🎙️' : '📞'}
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-slate-800">{t.liveCall}</h3>
        <p className="text-slate-500 text-sm mt-1">
          {status === 'idle' ? 'Start a real-time conversation' : status === 'connecting' ? 'Connecting...' : t.listening}
        </p>
      </div>

      <div className="pt-4">
        {status === 'idle' ? (
          <button onClick={startSession} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-lg transition-all duration-200 active:scale-95">
            {t.connect}
          </button>
        ) : (
          <button onClick={endSession} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg transition-all duration-200 active:scale-95">
            {t.disconnect}
          </button>
        )}
      </div>
      
      {status === 'active' && (
        <div className="flex justify-center gap-1 mt-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`w-1.5 h-5 bg-teal-500 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveAudio;