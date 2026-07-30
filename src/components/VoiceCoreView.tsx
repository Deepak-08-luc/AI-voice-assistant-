import React, { useState } from 'react';
import { SystemMetrics, ScheduleEvent, VoiceState, GPSLocation, ScreenMonitorState } from '../types';
import { OrbShaderCanvas } from './OrbShaderCanvas';
import { ScheduleModal } from './ScheduleModal';
import { TemperatureModal } from './TemperatureModal';
import { SecurityModal } from './SecurityModal';
import { SatelliteMapModal } from './SatelliteMapModal';

interface VoiceCoreViewProps {
  metrics: SystemMetrics;
  voiceState: VoiceState;
  gpsLocation: GPSLocation;
  screenMonitor: ScreenMonitorState;
  onRequestGPS: () => void;
  onSendPrompt: (prompt: string, screenFrameBase64?: string) => void;
  onToggleListening: () => void;
  onOpenLiveDisplay: () => void;
  onStartScreenShare: () => void;
  onAnalyzeScreen: (customPrompt?: string) => void;
  isMuted: boolean;
  onToggleVoiceGender?: () => void;
  autoTriggerEnabled?: boolean;
  onToggleAutoTrigger?: () => void;
}

export const VoiceCoreView: React.FC<VoiceCoreViewProps> = ({
  metrics,
  voiceState,
  gpsLocation,
  screenMonitor,
  onRequestGPS,
  onSendPrompt,
  onToggleListening,
  onOpenLiveDisplay,
  onStartScreenShare,
  onAnalyzeScreen,
  onToggleVoiceGender,
  autoTriggerEnabled = true,
  onToggleAutoTrigger,
}) => {
  const [inputText, setInputText] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState<'schedule' | 'temp' | 'security' | 'satellite' | null>(
    null
  );

  // Scheduled events list
  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: 'ev-1',
      title: 'Project Synthesis',
      time: '14:00',
      location: 'SECTOR_04',
      type: 'synthesis',
      priority: 'HIGH',
    },
    {
      id: 'ev-2',
      title: 'Neural Core Diagnostics',
      time: '16:30',
      location: 'LAB_ALPHA',
      type: 'meeting',
      priority: 'NOMINAL',
    },
  ]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendPrompt(inputText.trim());
    setInputText('');
  };

  const handleAddEvent = (newEvent: Omit<ScheduleEvent, 'id'>) => {
    setEvents((prev) => [...prev, { ...newEvent, id: `ev-${Date.now()}` }]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 pt-20 pb-36 select-none z-10">
      
      {/* Top Action Badges (Voice Mic & Automated Trigger) */}
      <div className="flex flex-wrap justify-center items-center gap-2 mb-2 z-10 font-mono text-[11px]">
        <button
          onClick={onToggleListening}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold transition-all shadow-md ${
            voiceState.isListening
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 animate-pulse'
              : voiceState.micPermissionState === 'denied'
              ? 'bg-red-950/90 text-red-400 border-red-500 hover:bg-red-900'
              : 'bg-[#1c1b1c] text-[#00f2ff] border-[#00dbe9]/60 hover:bg-[#00dbe9]/20'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {voiceState.isListening ? 'mic' : 'mic_off'}
          </span>
          <span>
            {voiceState.isListening
              ? 'MIC ACTIVE (LISTENING...)'
              : voiceState.micPermissionState === 'denied'
              ? 'MIC DENIED (CLICK TO GRANT)'
              : 'ACTIVATE VOICE MIC'}
          </span>
        </button>

        {onToggleAutoTrigger && (
          <button
            onClick={onToggleAutoTrigger}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold transition-all shadow-md ${
              autoTriggerEnabled
                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,219,233,0.35)]'
                : 'bg-[#1c1b1c] text-[#849495] border-gray-600 hover:text-white'
            }`}
            title="Click to toggle Automated Hands-Free Listening (Auto-Trigger Mode)"
          >
            <span className="material-symbols-outlined text-[16px]">
              {autoTriggerEnabled ? 'bolt' : 'power_settings_new'}
            </span>
            <span>
              {autoTriggerEnabled ? 'AUTO-TRIGGER ACTIVE' : 'AUTO-TRIGGER PAUSED'}
            </span>
          </button>
        )}
      </div>

      {/* Main Center Area with Orb Shader Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center relative w-full my-4 z-10">
        <div className="orb-container cursor-pointer" onClick={onToggleListening} title="Click to Toggle Mic Listening">
          <div className="orb-wrapper rounded-full overflow-hidden flex items-center justify-center relative">
            <div className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-95">
              <OrbShaderCanvas isSpeaking={voiceState.isSpeaking} isListening={voiceState.isListening} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0e0e0f]/40 to-[#201f20]/20 rounded-full pointer-events-none"></div>
          </div>
        </div>

        {/* Greeting & Voice Status Output */}
        <div className="mt-8 text-center max-w-2xl px-4">
          <h1 className="text-3xl md:text-4xl font-light text-[#e5e2e3] mb-2 tracking-tight font-sans">
            {voiceState.isSpeaking
              ? 'JARVIS is speaking...'
              : voiceState.isListening
              ? 'Listening to your prompt...'
              : 'Hello, how can I assist you today?'}
          </h1>

          <p className="font-mono text-[#00dbe9] tracking-widest uppercase text-[11px] mt-1 opacity-90">
            {voiceState.synthesisStatusText}
          </p>

          {/* Live Interim Speech Transcript */}
          {voiceState.isListening && voiceState.interimTranscript && (
            <div className="mt-3 p-3 glass-panel rounded-xl font-mono text-[13px] text-[#00f0ff] shadow-lg animate-pulse">
              <span className="font-bold mr-2 text-emerald-400">&gt; HEARING:</span>
              "{voiceState.interimTranscript}"
            </div>
          )}

          {/* AI Output Response Box */}
          {voiceState.lastResponse && (
            <div className="mt-4 p-4 glass-panel rounded-xl text-left font-mono text-[13px] text-[#e5e2e3] shadow-xl leading-relaxed max-h-48 overflow-y-auto">
              <span className="text-[#00f0ff] font-bold mr-2">&gt; JARVIS:</span>
              {voiceState.lastResponse}
            </div>
          )}
        </div>
      </main>

      {/* Main Center Area with Orb Shader Canvas */}

      {/* Bottom Glass Footer with Mic, Audio Wave Visualizer & Text Input Bar */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex flex-col items-center justify-center pb-5 pt-3 px-4 glass-panel border-t-0 rounded-t-2xl">
        <form onSubmit={handleFormSubmit} className="flex flex-col items-center w-full max-w-xl gap-2">
          <div className="glass-panel rounded-full px-5 py-2.5 flex items-center justify-between w-full shadow-[0_0_20px_rgba(0,0,0,0.6)] border border-white/10">
            <button
              type="button"
              onClick={onToggleListening}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
                voiceState.isListening ? 'text-emerald-400 animate-pulse bg-emerald-950/50' : 'text-[#b9cacb] hover:text-[#00dbe9]'
              }`}
              title={voiceState.isListening ? 'Stop Listening' : 'Activate Voice Mic'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {voiceState.isListening ? 'mic' : 'mic_none'}
              </span>
            </button>

            {/* Audio Wave Visualizer */}
            <div className="audio-wave px-3 flex-grow justify-center">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={voiceState.isListening ? 'Listening to voice...' : 'Type or speak prompt...'}
              className="bg-transparent border-none text-[#e5e2e3] placeholder-[#849495] px-3 font-sans text-sm outline-none w-full max-w-xs"
            />

            <button
              type="submit"
              className="p-1.5 text-[#00dbe9] hover:text-[#7df4ff] transition-colors flex items-center justify-center"
              title="Transmit Prompt"
            >
              <span className="material-symbols-outlined text-[20px]">keyboard_voice</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#b9cacb] opacity-80 tracking-wider flex items-center gap-2">
            <span>
              {voiceState.isListening
                ? 'LISTENING TO SPEECH...'
                : autoTriggerEnabled
                ? '⚡ AUTOMATED HANDS-FREE TRIGGER ACTIVE'
                : 'JARVIS_V1.0 READY'}
            </span>
          </div>
        </form>
      </footer>

      {/* Modals */}
      <ScheduleModal
        isOpen={activeModal === 'schedule'}
        onClose={() => setActiveModal(null)}
        events={events}
        onAddEvent={handleAddEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      <TemperatureModal
        isOpen={activeModal === 'temp'}
        onClose={() => setActiveModal(null)}
        metrics={metrics}
      />

      <SecurityModal
        isOpen={activeModal === 'security'}
        onClose={() => setActiveModal(null)}
      />

      <SatelliteMapModal
        isOpen={activeModal === 'satellite'}
        onClose={() => setActiveModal(null)}
        gpsLocation={gpsLocation}
        onRequestGPS={onRequestGPS}
      />
    </div>
  );
};


