import React, { useState, useEffect } from 'react';
import { useDevices } from '../context/DeviceContext';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { VoiceVisualizer } from '../components/VoiceVisualizer';
import { ActionCard } from '../components/ActionCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Mic, MicOff, Volume2, Sparkles, Smartphone, Laptop, Radio } from 'lucide-react';

export function VoicePage() {
  const { selectedTarget, setSelectedTarget, showToast } = useDevices();
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState(null);
  const [confirmCommand, setConfirmCommand] = useState(null);

  useEffect(() => {
    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, []);

  const handleToggleListening = () => {
    if (voiceState === 'listening') {
      speechService.stopListening();
      setVoiceState('idle');
    } else {
      speechService.stopSpeaking();
      setVoiceState('listening');
      setTranscript('');

      speechService.startListening({
        onResult: ({ final, text }) => {
          setTranscript(text);
          if (final) {
            processVoiceCommand(final);
          }
        },
        onError: (err) => {
          setVoiceState('idle');
          showToast(`Microphone error: ${err}`, 'error');
        },
        onEnd: () => {
          if (voiceState === 'listening') {
            setVoiceState('idle');
          }
        }
      });
    }
  };

  const processVoiceCommand = async (spokenText) => {
    setVoiceState('processing');
    try {
      const res = await api.sendChatMessage({
        message: spokenText,
        targetDeviceType: selectedTarget
      });

      if (res.success) {
        const { reply, command, actionResult } = res.data;
        setLastResponse({ reply, command, actionResult });

        // Speak reply out loud
        setVoiceState('speaking');
        speechService.speak(reply, {
          onEnd: () => setVoiceState('idle'),
          onStart: () => setVoiceState('speaking')
        });

        if (actionResult?.status === 'AWAITING_CONFIRMATION') {
          setConfirmCommand(actionResult.normalizedCommand);
        }
      } else {
        setVoiceState('idle');
      }
    } catch (err) {
      showToast(err.message || 'Error processing voice command', 'error');
      setVoiceState('idle');
    }
  };

  const handleConfirmAction = async (command) => {
    try {
      const res = await api.executeCommand({
        ...command,
        confirmed: true
      });
      if (res.success) {
        showToast('Authorized voice action executed!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-between p-8 max-w-4xl mx-auto">
      {/* Top Device Target Select */}
      <div className="flex items-center space-x-3 bg-dark-800/80 p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => setSelectedTarget('all')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedTarget === 'all'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Auto Device</span>
        </button>
        <button
          onClick={() => setSelectedTarget('laptop')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedTarget === 'laptop'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Laptop Only</span>
        </button>
        <button
          onClick={() => setSelectedTarget('phone')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedTarget === 'phone'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Phone Only</span>
        </button>
      </div>

      {/* Main Center Voice Orb */}
      <div className="w-full flex flex-col items-center justify-center space-y-6">
        <VoiceVisualizer state={voiceState} onToggleListen={handleToggleListening} />

        {/* Live Transcript / Speech Bubble */}
        {transcript && (
          <div className="w-full max-w-lg p-4 rounded-2xl bg-dark-800 border border-white/10 text-center shadow-xl animate-fadeIn">
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">
              You Said
            </p>
            <p className="text-base text-white font-medium">"{transcript}"</p>
          </div>
        )}

        {/* Assistant Response Bubble */}
        {lastResponse && (
          <div className="w-full max-w-lg p-5 rounded-2xl glass-panel space-y-3 animate-fadeIn">
            <div className="flex items-center space-x-2 text-xs font-semibold text-primary-400">
              <Sparkles className="w-4 h-4" />
              <span>Aether AI Response</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{lastResponse.reply}</p>

            {lastResponse.command && (
              <ActionCard
                command={lastResponse.command}
                result={lastResponse.actionResult}
                onConfirm={handleConfirmAction}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Voice Command Tips */}
      <div className="text-center space-y-2 pb-2">
        <p className="text-xs text-gray-500">
          Supported voice triggers: "Open Chrome", "Open WhatsApp on my phone", "Open Downloads folder", "Open YouTube"
        </p>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(confirmCommand)}
        command={confirmCommand}
        onClose={() => setConfirmCommand(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
