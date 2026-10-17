import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Key,
  Shield,
  Info,
  Layers,
  Database,
} from 'lucide-react';
import { UserSettings } from '../types';
import { storage, DEFAULT_SETTINGS } from '../utils/localStorage';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dataCleared, setDataCleared] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all locally cached trade analyses and quiz scores?')) {
      storage.clearAll();
      setDataCleared(true);
      setTimeout(() => setDataCleared(false), 3000);
    }
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    storage.saveSettings(DEFAULT_SETTINGS);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Settings & Configuration
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
            Local Workspace
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Customize default asset models, contract sizing rules, and local client data persistence.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings successfully saved to local client storage.</span>
        </div>
      )}

      {dataCleared && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-2 animate-fadeIn">
          <Trash2 className="w-4 h-4 text-amber-600" />
          <span>Local simulation logs and quiz cache have been reset.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Defaults Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Default Trade Modeling Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Underlying Index
              </label>
              <select
                value={settings.default_underlying}
                onChange={(e) => setSettings({ ...settings, default_underlying: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="NIFTY">NIFTY 50</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
                <option value="FINNIFTY">FINNIFTY</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Capital Base (₹)
              </label>
              <input
                type="number"
                value={settings.default_capital}
                onChange={(e) =>
                  setSettings({ ...settings, default_capital: parseFloat(e.target.value) || 100000 })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIFTY Lot Size Multiplier
              </label>
              <input
                type="number"
                value={settings.default_nifty_lot}
                onChange={(e) =>
                  setSettings({ ...settings, default_nifty_lot: parseInt(e.target.value) || 50 })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                BANKNIFTY Lot Size Multiplier
              </label>
              <input
                type="number"
                value={settings.default_banknifty_lot}
                onChange={(e) =>
                  setSettings({ ...settings, default_banknifty_lot: parseInt(e.target.value) || 15 })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* UI & Theme Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-teal-600" />
            <span>Interface Mode</span>
          </h2>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="font-semibold text-slate-900">Light High-Contrast Mode (Fintech Standard)</p>
              <p className="text-slate-500">
                Light-first canvas with deep navy typography (#0f172a) calibrated for readability.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200 text-[11px]">
              Active Default
            </span>
          </div>
        </div>

        {/* Advanced API Key Integration */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-teal-600" />
            <span>LLM Risk Explanation API (Optional)</span>
          </h2>

          <div className="space-y-2 text-xs">
            <label className="block font-semibold text-slate-700">
              Custom AI / LLM API Key (Optional Future Enrichment)
            </label>
            <input
              type="password"
              placeholder="sk-..."
              value={settings.api_key || ''}
              onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
            <p className="text-slate-400 text-[11px]">
              RISKWISE executes all options math and heuristics locally in-browser or on your local backend. Third-party LLM key is entirely optional.
            </p>
          </div>
        </div>

        {/* Local Storage & Retention */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" />
            <span>Local Data Retention</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-semibold text-slate-900">Clear Stored Trade Analyses</p>
              <p className="text-slate-500">
                Remove cached scenario runs, history logs, and research participant records.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-semibold self-start sm:self-auto transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Local Data</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* About Section */}
      <div className="p-6 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900">RISKWISE Platform Version</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">v1.0.0-rc</span>
        </div>
        <p>
          React 19 + TypeScript + Vite + Tailwind CSS + Recharts. Built for pre-trade financial intelligence, deterministic downside risk estimation, and behavioral literacy research.
        </p>
      </div>
    </div>
  );
};
