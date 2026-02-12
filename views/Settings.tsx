
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface SettingsProps {
  lang: Language;
  setLang: (l: Language) => void;
  onResetData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ lang, setLang, onResetData }) => {
  const t = translations[lang];
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">{t.settings}</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t.language}</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLang('en')}
              className={`p-4 rounded-2xl font-bold transition-all border ${
                lang === 'en' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('bn')}
              className={`p-4 rounded-2xl font-bold transition-all border ${
                lang === 'bn' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t.resetData}</h3>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors"
            >
              ⚠️ {t.resetData}
            </button>
          ) : (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-200 space-y-4">
              <p className="text-red-700 text-sm">{t.resetWarning}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 p-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => {
                    onResetData();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 p-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-600/20"
                >
                  {t.confirmReset}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.aboutApp}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Name</span>
            <span className="font-bold text-slate-800">PondGuard</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Version</span>
            <span className="font-bold text-slate-800">{t.appVersion}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Package ID</span>
            <span className="font-bold text-slate-800">{t.packageID}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.privacyPolicy}</h3>
        <div className="text-xs text-slate-600 leading-relaxed space-y-4">
          <p>
            PondGuard respects your privacy. All your data (farm names, locations, and water readings) is stored locally on your device.
          </p>
          <p>
            When AI features are enabled, minimal context is sent to Google Gemini APIs to provide specialized aquaculture advice. No personal identifiable information is shared with third parties.
          </p>
          <p>
            Users can delete all data at any time using the Reset button above or by uninstalling the application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
