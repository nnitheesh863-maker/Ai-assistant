import React, { useState, useEffect, useRef } from 'react';
import { useDevices } from '../context/DeviceContext';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { ActionCard } from '../components/ActionCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Send,
  Mic,
  MicOff,
  Trash2,
  Sparkles,
  Bot,
  User,
  Radio,
  Volume2,
  VolumeX,
  Laptop,
  Smartphone
} from 'lucide-react';

import { wsClient } from '../services/websocket';

export function ChatPage() {
  const { selectedTarget, setSelectedTarget, showToast } = useDevices();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [confirmCommand, setConfirmCommand] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();

    // Subscribe to live WebSocket command completions
    const unsubscribe = wsClient.subscribe((msg) => {
      if (msg.type === 'COMMAND_COMPLETED') {
        const { commandId, status, result, error } = msg.payload || {};
        setMessages((prev) =>
          prev.map((m) => {
            if (m.executionResult && m.executionResult.commandId === commandId) {
              return {
                ...m,
                executionResult: {
                  ...m.executionResult,
                  status,
                  result,
                  error
                }
              };
            }
            return m;
          })
        );
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const res = await api.getChatHistory();
      if (res.success && res.data.length > 0) {
        setMessages(res.data);
      } else {
        // Initial Greeting
        setMessages([
          {
            id: 'init-1',
            role: 'assistant',
            content: "Hello! I'm your AI Personal Assistant. You can ask me general questions or command your laptop and phone (e.g., 'Open Chrome', 'Open WhatsApp on my phone', 'Open Downloads folder', 'Open YouTube', or 'Check laptop status').",
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const userMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage({
        message: query,
        targetDeviceType: selectedTarget
      });

      if (res.success) {
        const { reply, command, actionResult } = res.data;

        const assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: reply,
          structuredCommand: command,
          executionResult: actionResult,
          timestamp: new Date().toISOString()
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Text to Speech playback if enabled
        if (ttsEnabled && reply) {
          speechService.speak(reply);
        }

        // Sensitive intent confirmation trigger
        if (actionResult?.status === 'AWAITING_CONFIRMATION') {
          setConfirmCommand(actionResult.normalizedCommand);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err.message}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening({
        onResult: ({ final, text }) => {
          setInput(text);
          if (final) {
            setIsListening(false);
            handleSendMessage(final);
          }
        },
        onError: (err) => {
          setIsListening(false);
          showToast(`Microphone error: ${err}`, 'error');
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    }
  };

  const handleConfirmAction = async (command) => {
    try {
      const res = await api.executeCommand({
        ...command,
        confirmed: true
      });
      if (res.success) {
        showToast('Authorized command executed!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear conversation history?')) {
      await api.clearChatHistory();
      setMessages([]);
      loadChatHistory();
    }
  };

  const promptSuggestions = [
    'Open Chrome',
    'Open VS Code',
    'Open Downloads folder',
    'Open WhatsApp on my phone',
    'Open YouTube on laptop',
    'Check laptop status'
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-6 max-w-5xl mx-auto">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-white">AI Assistant Chat</h2>
            <p className="text-xs text-gray-400">Groq LLM with Device Command Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Audio TTS toggle */}
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-all ${
              ttsEnabled
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                : 'bg-dark-700/60 text-gray-400 border-white/5 hover:text-gray-200'
            }`}
            title="Toggle Voice Speech Output"
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Voice TTS</span>
          </button>

          {/* Clear history */}
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-dark-700/60 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 border border-white/5 transition-all"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-primary-600 text-white shadow-md'
                    : 'bg-dark-700 text-primary-400 border border-white/5'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble & Action Card */}
              <div className={`max-w-[78%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-primary-600 text-white rounded-tr-none shadow-lg shadow-primary-600/15'
                      : 'bg-dark-800 text-gray-100 rounded-tl-none border border-white/5 glass-panel'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Render Action Card if structured command was executed */}
                  {!isUser && msg.structuredCommand && (
                    <ActionCard
                      command={msg.structuredCommand}
                      result={msg.executionResult}
                      onConfirm={handleConfirmAction}
                    />
                  )}
                </div>

                <div className={`text-[10px] text-gray-500 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-dark-700 text-primary-400 border border-white/5 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-dark-800 text-gray-400 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center space-x-2 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
              <span>AI is thinking & analyzing command...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="py-2 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {promptSuggestions.map((text, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(text)}
            className="px-3 py-1 rounded-full text-xs bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-primary-300 border border-white/5 whitespace-nowrap transition-all"
          >
            {text}
          </button>
        ))}
      </div>

      {/* Input Box Bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening... Speak your command now'
                : 'Type your message or device command (e.g. Open VS Code)...'
            }
            className="w-full bg-dark-800/90 text-white placeholder-gray-500 rounded-2xl pl-5 pr-28 py-3.5 text-sm border border-white/10 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-xl"
          />

          <div className="absolute right-2 flex items-center space-x-1.5">
            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-cyan hover:from-primary-500 hover:to-accent-cyan text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Security Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(confirmCommand)}
        command={confirmCommand}
        onClose={() => setConfirmCommand(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
