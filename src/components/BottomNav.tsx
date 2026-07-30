import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 glass-panel border-t-0 flex justify-around items-center h-14 px-6 select-none shadow-[0_-5px_25px_rgba(0,0,0,0.5)]">
      <button
        type="button"
        onClick={() => setActiveTab('terminal')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'terminal'
            ? 'text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.8)] scale-110'
            : 'text-[#849495] scale-90 hover:text-[#7df4ff]'
        }`}
        title="CLI Terminal Interface"
      >
        <span className="material-symbols-outlined text-[22px]">terminal</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('core')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'core'
            ? 'text-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.9)] scale-125'
            : 'text-[#849495] scale-90 hover:text-[#7df4ff]'
        }`}
        title="AI Voice Core Interface"
      >
        <span
          className="material-symbols-outlined text-[28px]"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          blur_on
        </span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('live_display')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'live_display'
            ? 'text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.8)] scale-110'
            : 'text-[#849495] scale-90 hover:text-[#7df4ff]'
        }`}
        title="Live Display Protocol Canvas"
      >
        <span className="material-symbols-outlined text-[22px]">desktop_windows</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('diagnostics')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'diagnostics'
            ? 'text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.8)] scale-110'
            : 'text-[#849495] scale-90 hover:text-[#7df4ff]'
        }`}
        title="System Diagnostics & Controls"
      >
        <span className="material-symbols-outlined text-[22px]">
          settings_input_component
        </span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('tree')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'tree'
            ? 'text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.8)] scale-110'
            : 'text-[#849495] scale-90 hover:text-[#7df4ff]'
        }`}
        title="Neural Architecture Tree"
      >
        <span className="material-symbols-outlined text-[22px]">account_tree</span>
      </button>
    </nav>
  );
};

