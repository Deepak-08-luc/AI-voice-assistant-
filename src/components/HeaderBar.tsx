import React, { useState, useEffect } from 'react';
import { ActiveTab, SystemMetrics, SessionState } from '../types';


interface HeaderBarProps {
  activeTab: ActiveTab;
  metrics: SystemMetrics;
  isMuted: boolean;
  onToggleMute: () => void;
  sessionState?: SessionState;
  onNewSession?: () => void;
  voiceGender?: 'male' | 'female';
  onToggleVoiceGender?: () => void;
  language?: 'en-US' | 'te-IN';
  onToggleLanguage?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  metrics,
  isMuted,
  onToggleMute,
  sessionState,
  onNewSession,
  voiceGender = 'male',
  onToggleVoiceGender,
  language = 'en-US',
  onToggleLanguage,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTabLabel = () => {
    switch (activeTab) {
      case 'core': return 'VOICE_CORE';
      case 'live_display': return 'LIVE_DISPLAY_PROTOCOL';
      case 'terminal': return 'CLI_TERMINAL';
      case 'diagnostics': return 'SYS_DIAGNOSTICS';
      case 'tree': return 'NEURAL_TREE';
      default: return 'ACTIVE';
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-3 glass-panel border-b-0 shadow-none select-none">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#00dbe9] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          memory
        </span>
        <span className="text-[#e5e2e3] font-semibold tracking-wider text-sm font-sans">
          JARVIS_V1.0
        </span>
        <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono bg-[#006a71]/40 border border-[#00dbe7]/40 text-[#74f5ff] rounded ml-1">
          {getTabLabel()}
        </span>



      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {onNewSession && (
          <button
            onClick={onNewSession}
            title="Start a fresh JARVIS Session"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#1c1b1c] border border-[#00dbe9]/40 hover:bg-[#00dbe9]/20 text-[#00dbe9] font-mono text-[10px] rounded transition-all"
          >
            <span className="material-symbols-outlined text-[13px]">refresh</span>
            <span>NEW SESSION</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00dbe9] shadow-[0_0_8px_rgba(0,219,233,0.8)]"></div>
          <span className="text-[#b9cacb] text-xs opacity-70 font-mono tracking-wider">ONLINE</span>
        </div>

        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Voice Synthesis' : 'Mute Voice Synthesis'}
          className="flex items-center justify-center p-1.5 text-[#00dbe9] hover:text-[#7df4ff] transition-colors rounded hover:bg-[#201f20]"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isMuted ? 'volume_off' : 'volume_up'}
          </span>
        </button>
      </div>
    </header>
  );
};


