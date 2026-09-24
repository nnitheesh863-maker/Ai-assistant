import React from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';

export function VoiceVisualizer({ state, onToggleListen }) {
  // state: 'idle' | 'listening' | 'processing' | 'speaking'
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isSpeaking = state === 'speaking';

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Visualizer Orb with Ripple Rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Glow */}
        {isListening && (
          <>
            <div className="absolute w-44 h-44 rounded-full bg-primary-500/20 animate-ping opacity-75"></div>
            <div className="absolute w-36 h-36 rounded-full bg-cyan-500/25 animate-pulse"></div>
          </>
        )}

        {isSpeaking && (
          <div className="absolute w-40 h-40 rounded-full bg-indigo-500/25 animate-pulse"></div>
        )}

        {/* Center Interactive Button */}
        <button
          onClick={onToggleListen}
          className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 ${
            isListening
              ? 'bg-gradient-to-tr from-rose-500 to-rose-600 shadow-rose-500/40 text-white scale-105'
              : isProcessing
              ? 'bg-gradient-to-tr from-amber-500 to-amber-600 shadow-amber-500/40 text-white animate-spin'
              : isSpeaking
              ? 'bg-gradient-to-tr from-indigo-500 to-primary-600 shadow-indigo-500/40 text-white scale-105'
              : 'bg-gradient-to-tr from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-primary-500/30 text-white'
          }`}
        >
          {isListening ? (
            <Mic className="w-10 h-10 animate-bounce" />
          ) : isProcessing ? (
            <Sparkles className="w-10 h-10" />
          ) : isSpeaking ? (
            <Volume2 className="w-10 h-10 animate-pulse" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>

      {/* Dynamic Soundwave Bars */}
      <div className="flex items-center space-x-1.5 h-8">
        {[40, 70, 30, 90, 60, 100, 50, 80, 45, 65].map((height, idx) => (
          <div
            key={idx}
            style={{
              height: isListening || isSpeaking ? `${height}%` : '20%',
              animationDelay: `${idx * 0.1}s`
            }}
            className={`w-1 rounded-full transition-all duration-200 ${
              isListening
                ? 'bg-rose-400 animate-wave'
                : isSpeaking
                ? 'bg-indigo-400 animate-wave'
                : 'bg-dark-600'
            }`}
          ></div>
        ))}
      </div>

      {/* State Text */}
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold font-heading text-white">
          {isListening
            ? 'Listening to your voice...'
            : isProcessing
            ? 'Thinking & Processing command...'
            : isSpeaking
            ? 'Speaking reply...'
            : 'Click microphone to talk'}
        </p>
        <p className="text-xs text-gray-400">
          Try saying: "Open Chrome on my laptop" or "Open WhatsApp on my phone"
        </p>
      </div>
    </div>
  );
}
