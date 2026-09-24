import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevices } from '../context/DeviceContext';
import { speechService } from '../services/speechService';
import {
  Settings,
  Sparkles,
  Volume2,
  Shield,
  Server,
  User,
  Check,
  Save,
  Radio
} from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useDevices();
  const [testSpeechText, setTestSpeechText] = useState('Hello! Speech synthesis is operating normally.');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTestSpeech = () => {
    setIsSpeaking(true);
    speechService.speak(testSpeechText, {
      onEnd: () => setIsSpeaking(false)
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-white tracking-tight flex items-center space-x-2">
          <Settings className="w-6 h-6 text-primary-400" />
          <span>System Settings</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure AI inference model, speech synthesis preferences, and security controls.
        </p>
      </div>

      <div className="space-y-6">
        {/* User Account Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-base">User Profile</h3>
              <p className="text-xs text-gray-400">Authenticated user identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 space-y-1">
              <span className="text-gray-400">Name</span>
              <p className="font-semibold text-white">{user?.name}</p>
            </div>
            <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 space-y-1">
              <span className="text-gray-400">Email Address</span>
              <p className="font-semibold text-white">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* AI & Groq Engine Information */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-base">AI Inference Engine</h3>
              <p className="text-xs text-gray-400">Groq API &amp; Local NLP fallback configuration</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-dark-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-medium text-white block">LLM Model</span>
                <span className="text-gray-400 text-[11px]">llama-3.3-70b-versatile (Groq Cloud)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                JSON Mode Enabled
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900/60 border border-white/5 text-gray-400 text-[11px] leading-relaxed">
              💡 To update or configure your free Groq API key, set <code className="text-primary-400">GROQ_API_KEY=gsk_...</code> in <code className="text-gray-200">backend/.env</code>. When no key is provided, the engine runs in zero-dependency offline NLP fallback mode.
            </div>
          </div>
        </div>

        {/* Voice & Speech Synthesis */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-base">Speech Synthesis &amp; Voice Output</h3>
              <p className="text-xs text-gray-400">Web Speech API testing</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={testSpeechText}
                onChange={(e) => setTestSpeechText(e.target.value)}
                className="flex-1 bg-dark-900 text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-primary-500"
              />
              <button
                onClick={handleTestSpeech}
                disabled={isSpeaking}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50"
              >
                {isSpeaking ? 'Speaking...' : 'Test Voice'}
              </button>
            </div>
          </div>
        </div>

        {/* Security & Whitelist Safeguards */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-base">Security &amp; Command Safeguards</h3>
              <p className="text-xs text-gray-400">Strict command execution boundaries</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 space-y-1">
              <span className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Command Allowlisting</span>
              </span>
              <p className="text-gray-400 text-[11px]">
                Only pre-authorized applications and known user folders can be launched.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 space-y-1">
              <span className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Human-In-The-Loop</span>
              </span>
              <p className="text-gray-400 text-[11px]">
                Sensitive actions (locking device, messaging) strictly mandate explicit modal approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
