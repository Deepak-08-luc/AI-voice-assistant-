import React, { useState } from 'react';
import { LiveDisplayCard, SystemMetrics, GPSLocation, VoiceState, ScreenMonitorState, SessionState } from '../types';

interface LiveDisplayProtocolViewProps {
  metrics: SystemMetrics;
  gpsLocation: GPSLocation;
  voiceState: VoiceState;
  screenMonitor: ScreenMonitorState;
  sessionState?: SessionState;
  liveCards: LiveDisplayCard[];
  onSendPrompt: (prompt: string, screenFrameBase64?: string) => Promise<string>;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onAnalyzeScreen: (customPrompt?: string) => void;
  onToggleListening: () => void;
  onSpeakText: (text: string) => void;
  onClearCards: () => void;
  onNewSession?: () => void;
}


const PRESET_QUERIES = [
  { label: '🖥️ Analyze My Active Screen', prompt: 'JARVIS, inspect my current screen frame and tell me what you see.' },
  { label: '❓ Any Doubts / Errors on Screen?', prompt: 'JARVIS, look at my screen and point out any errors, bugs, or things that look incorrect.' },
  { label: '📝 Summarize Visible Screen Content', prompt: 'JARVIS, give me a quick 3-bullet summary of the content visible on my screen.' },
  { label: '☀️ Weather & Orbit', prompt: 'What is the current atmospheric condition and satellite orbit status?' },
  { label: '🌌 Quantum Concept', prompt: 'Explain Quantum Computing casually like I am 5 years old.' },
  { label: '💻 TypeScript Hook', prompt: 'Write a clean TypeScript React hook for speech audio synthesis.' },
];

export const LiveDisplayProtocolView: React.FC<LiveDisplayProtocolViewProps> = ({
  metrics,
  gpsLocation,
  voiceState,
  screenMonitor,
  sessionState,
  liveCards,
  onSendPrompt,
  onStartScreenShare,
  onStopScreenShare,
  onAnalyzeScreen,
  onToggleListening,
  onSpeakText,
  onClearCards,
  onNewSession,
}) => {

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const query = inputText.trim();
    setInputText('');
    setIsLoading(true);
    await onSendPrompt(query);
    setIsLoading(false);
  };

  const handlePresetClick = async (promptText: string) => {
    if (isLoading) return;
    setIsLoading(true);
    if (promptText.includes('screen') || promptText.includes('Screen') || promptText.includes('inspect') || promptText.includes('Errors')) {
      onAnalyzeScreen(promptText);
    } else {
      await onSendPrompt(promptText);
    }
    setIsLoading(false);
  };

  const filteredCards = liveCards.filter((card) => {
    if (selectedCategory === 'ALL') return true;
    return card.category?.toUpperCase() === selectedCategory.toUpperCase();
  });

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-16 pb-24 px-4 sm:px-6 z-10 select-none max-w-6xl mx-auto">
      
      {/* HEADER PROTOCOL TITLE BANNER */}
      <div className="w-full border-[0.5px] border-[#00dbe7] bg-[#191c22]/80 backdrop-blur-md rounded-xl p-4 md:p-6 mb-6 shadow-[0_0_25px_rgba(0,242,255,0.15)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00f2ff] text-[24px]">desktop_windows</span>
            <h1 className="font-sans text-[20px] md:text-[24px] text-[#00f2ff] font-bold tracking-tight">
              LIVE DISPLAY PROTOCOL v2.1
            </h1>
            <span className="px-2 py-0.5 text-[9px] font-mono bg-[#006a71]/50 border border-[#00dbe7] text-[#74f5ff] rounded uppercase tracking-wider">
              REAL-TIME CANVAS & VISION
            </span>
          </div>
          <p className="font-mono text-[#b9cacb] text-[12px] mt-1">
            Ask JARVIS anything casually. Grant live screen vision permissions so JARVIS can view your desktop window, ask doubts & analyze your active screen in real-time.
          </p>
        </div>

        {/* Live HUD System Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#00dbe7] bg-[#10131a] p-2.5 rounded-lg border border-[#3a494b]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>DISPLAY_60FPS</span>
          </div>
          <span className="text-[#3a494b]">|</span>
          <div>SCREEN_VISION: <strong className={screenMonitor.isSharing ? 'text-emerald-400 font-bold' : 'text-[#849495]'}>{screenMonitor.isSharing ? 'GRANTED' : 'STANDBY'}</strong></div>
          <span className="text-[#3a494b]">|</span>
          <div>TOKENS_MAX: <strong className="text-amber-300 font-bold">65,536</strong></div>
        </div>
      </div>

      {/* PRO TIER, CONTEXT COMPRESSION & SESSION RESUMPTION PIPELINE HUD */}
      <div className="w-full bg-[#10141f]/90 border border-[#00dbe7]/40 rounded-xl p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-[18px]">bolt</span>
          <span className="font-bold text-amber-300">PRO HIGH-THROUGHPUT TIER:</span>
          <span className="text-[#e1e2eb]">Max Output Limit: <strong className="text-[#00f2ff]">65,536 Tokens</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#181d28] px-2.5 py-1 rounded border border-[#3a494b] text-[#74f5ff]">
            <span className="material-symbols-outlined text-[14px] text-[#00dbe7]">compress</span>
            <span>CONTEXT COMPRESSION: <strong className="text-[#00f2ff]">{sessionState?.compressionRatio || '84.2% OPTIMIZED'}</strong></span>
          </div>

          <div className="flex items-center gap-1 bg-[#181d28] px-2.5 py-1 rounded border border-[#3a494b] text-[#74f5ff]">
            <span className="material-symbols-outlined text-[14px] text-emerald-400">history_edu</span>
            <span>SESSION: <strong className="text-emerald-300">{sessionState?.isResuming ? 'RESUMED & PERSISTED' : 'ACTIVE_STORED'}</strong></span>
          </div>
        </div>
      </div>


      {/* SCREEN MONITOR PERMISSION & VISION CONTROL BANNER */}
      <div className="w-full border-[0.5px] border-[#00dbe7]/80 bg-[#12161f]/90 rounded-xl p-4 md:p-5 mb-6 shadow-[0_0_20px_rgba(0,242,255,0.1)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 w-full md:w-auto">
          <div className={`p-3 rounded-xl border ${screenMonitor.isSharing ? 'bg-emerald-950/80 border-emerald-400 text-emerald-400 animate-pulse' : 'bg-[#191c22] border-[#00dbe7] text-[#00f2ff]'}`}>
            <span className="material-symbols-outlined text-[28px]">
              {screenMonitor.isSharing ? 'screen_share' : 'stop_screen_share'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-[14px] text-[#00f2ff] font-bold uppercase tracking-wider">
                LIVE SCREEN MONITORING PROTOCOL
              </h2>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${screenMonitor.isSharing ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400' : 'bg-[#1d2026] text-[#849495] border border-[#3a494b]'}`}>
                {screenMonitor.isSharing ? 'PERMISSION GRANTED (LIVE)' : 'PERMISSION NEEDED'}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#b9cacb] mt-0.5">
              {screenMonitor.isSharing
                ? 'JARVIS has live access to your screen window! Click "Analyze Screen" or ask JARVIS any question about your display.'
                : 'Grant JARVIS direct permission to view your screen display so he can answer questions, spot errors, or ask you doubts about what is open.'}
            </p>
            {screenMonitor.errorMessage && (
              <p className="font-mono text-[11px] text-red-400 mt-1">
                ⚠️ {screenMonitor.errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Screen Action Buttons & Thumbnail */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {screenMonitor.isSharing && screenMonitor.lastFrameSnapshotUrl && (
            <div className="relative group w-20 h-12 rounded-lg border border-[#00dbe7] overflow-hidden bg-black shadow-inner">
              <img src={screenMonitor.lastFrameSnapshotUrl} alt="Screen Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#00f2ff]/10 flex items-center justify-center">
                <span className="text-[8px] font-mono font-bold text-[#00f2ff] bg-black/70 px-1 rounded">LIVE</span>
              </div>
            </div>
          )}

          {!screenMonitor.isSharing ? (
            <button
              onClick={onStartScreenShare}
              className="px-4 py-2.5 bg-[#00f2ff] text-[#002022] font-mono font-bold text-[12px] rounded-xl hover:bg-[#74f5ff] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,255,0.4)] active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">screen_share</span>
              <span>GRANT SCREEN PERMISSION</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAnalyzeScreen('JARVIS, inspect my screen frame and tell me what you see, and ask if I have any questions about it.')}
                disabled={isLoading}
                className="px-4 py-2 bg-emerald-500 text-black font-mono font-bold text-[12px] rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                <span>ANALYZE SCREEN NOW</span>
              </button>

              <button
                onClick={onStopScreenShare}
                className="px-3 py-2 bg-red-950/80 border border-red-500/60 text-red-300 font-mono text-[11px] rounded-xl hover:bg-red-900 transition-all flex items-center gap-1"
                title="Revoke JARVIS Screen Permission"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                <span>REVOKE</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QUICK PRESET TOPICS BAR */}
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-2 px-1 font-mono text-[11px] text-[#00dbe7] tracking-wider uppercase">
          <span>&gt; QUICK PROMPTS & SCREEN QUESTIONS (CLICK TO ASK)</span>
          <span className="text-[#849495]">{PRESET_QUERIES.length} SUGGESTIONS</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(preset.prompt)}
              disabled={isLoading}
              className="px-3.5 py-2 bg-[#191c22] border border-[#3a494b] hover:border-[#00dbe7] hover:bg-[#00dbe7]/10 text-[#e1e2eb] hover:text-[#00f2ff] text-[12px] font-mono rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* INTERACTIVE INPUT & VOICE BAR */}
      <div className="w-full mb-8">
        <form onSubmit={handleSubmit} className="relative flex items-center w-full gap-2">
          
          {/* Casual Mic Toggle Button */}
          <button
            type="button"
            onClick={onToggleListening}
            className={`px-4 py-3 rounded-xl border font-mono text-[12px] flex items-center justify-center transition-all shadow-md ${
              voiceState.isListening
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 animate-pulse'
                : 'bg-[#191c22] border-[#00dbe7] text-[#00f2ff] hover:bg-[#00dbe7]/20'
            }`}
            title={voiceState.isListening ? 'Stop Voice Listening' : 'Speak Casually to JARVIS'}
          >
            <span className="material-symbols-outlined text-[22px]">
              {voiceState.isListening ? 'mic' : 'mic_none'}
            </span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              screenMonitor.isSharing
                ? 'Ask JARVIS about your screen... "Do you see any bugs?", "Explain this window", etc.'
                : 'Ask JARVIS anything... "What is quantum physics?", "Write code", "Weather", etc.'
            }
            className="flex-1 bg-[#10131a] border border-[#00dbe7]/60 focus:border-[#00f2ff] text-[#e1e2eb] px-4 py-3 rounded-xl font-mono text-[13px] outline-none shadow-[0_0_15px_rgba(0,242,255,0.1)] placeholder-[#849495]"
          />

          {/* Transmit Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-3 bg-[#00f2ff] text-[#002022] font-mono font-bold text-[13px] rounded-xl hover:bg-[#74f5ff] transition-all flex items-center gap-2 shadow-md disabled:opacity-50 active:scale-95 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <span>ASK JARVIS</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </>
            )}
          </button>
        </form>

        {/* Interim Voice Transcript Feedback */}
        {voiceState.isListening && voiceState.interimTranscript && (
          <div className="mt-2 p-2.5 bg-[#00f2ff]/10 border border-[#00f2ff] rounded-lg font-mono text-[12px] text-[#00f2ff] animate-pulse">
            <span className="font-bold mr-1 text-emerald-400">&gt; LISTENING:</span> "{voiceState.interimTranscript}"
          </div>
        )}
      </div>

      {/* FILTER & HISTORY CATEGORY BAR */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-4 border-b border-[#3a494b] pb-3">
        <div className="flex items-center gap-2 font-mono text-[12px]">
          <span className="text-[#849495]">DISPLAY CATEGORY:</span>
          {['ALL', 'SCREEN', 'GENERAL', 'CODE', 'WEATHER', 'SYSTEM', 'MATH'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-[#00f2ff] text-[#002022] font-bold'
                  : 'bg-[#1d2026] text-[#b9cacb] hover:text-[#00f2ff]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {liveCards.length > 0 && (
          <button
            onClick={onClearCards}
            className="px-3 py-1 bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 font-mono text-[11px] rounded transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
            <span>CLEAR DISPLAY CANVI</span>
          </button>
        )}
      </div>

      {/* LIVE DISPLAY FEED CARDS GRID */}
      <div className="w-full space-y-4">
        {filteredCards.length === 0 ? (
          <div className="w-full border border-dashed border-[#3a494b] rounded-xl p-12 text-center bg-[#191c22]/40 font-mono text-[#849495]">
            <span className="material-symbols-outlined text-[48px] text-[#00dbe7]/40 mb-2">
              tv_options_edit
            </span>
            <p className="text-[14px] text-[#00f2ff]">NO LIVE DISPLAY CARDS YET</p>
            <p className="text-[12px] mt-1">
              Ask JARVIS any question above or grant screen monitoring permissions to project vision outputs onto this Live Display Protocol canvas.
            </p>
          </div>
        ) : (
          filteredCards.map((card) => (
            <div
              key={card.id}
              className="w-full border-[0.5px] border-[#00dbe7] bg-[#191c22]/80 backdrop-blur-md rounded-xl p-5 shadow-[0_0_20px_rgba(0,242,255,0.1)] transition-all hover:border-[#00f2ff] hover:shadow-[0_0_25px_rgba(0,242,255,0.2)]"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#3a494b]/60 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-[#00dbe7]">
                  <span className="material-symbols-outlined text-[16px]">
                    {card.category === 'screen' ? 'screen_search' : 'chat'}
                  </span>
                  <span className="font-bold text-[#00f2ff]">Q: "{card.query}"</span>
                </div>

                <div className="flex items-center gap-3 text-[#849495]">
                  <span className="px-2 py-0.5 bg-[#00363a] text-[#74f5ff] rounded text-[9px] uppercase font-bold border border-[#00dbe7]/40">
                    {card.category || 'GENERAL'}
                  </span>
                  <span>{card.timestamp}</span>
                </div>
              </div>

              {/* Card Main Body */}
              <div className="font-mono text-[13px] text-[#e1e2eb] leading-relaxed whitespace-pre-wrap bg-[#10131a]/90 p-4 rounded-lg border border-[#3a494b]">
                {card.imagePreviewUrl && (
                  <div className="mb-3 p-2 bg-black/60 rounded-lg border border-[#00dbe7]/40">
                    <div className="text-[10px] text-[#74f5ff] mb-1 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">preview</span>
                      <span>SCREEN SNAPSHOT ANALYZED BY JARVIS:</span>
                    </div>
                    <img src={card.imagePreviewUrl} alt="Screen Frame Snapshot" className="max-h-48 rounded border border-[#3a494b] object-contain" />
                  </div>
                )}

                <div className="flex items-start gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#00f2ff] text-[18px]">
                    smart_toy
                  </span>
                  <span className="text-[#00f2ff] font-bold">JARVIS RESPONSE & OBSERVATIONS:</span>
                </div>
                <div className="pl-6 text-[#e1e2eb] mt-1">{card.response}</div>
              </div>

              {/* Card Interactive Footer Controls */}
              <div className="flex flex-wrap justify-between items-center gap-2 mt-3 pt-2 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSpeakText(card.response)}
                    className="px-3 py-1.5 bg-[#00f2ff]/10 border border-[#00f2ff] text-[#00f2ff] hover:bg-[#00f2ff] hover:text-[#002022] rounded-lg transition-all flex items-center gap-1 font-bold"
                    title="Speak this response over voice audio"
                  >
                    <span className="material-symbols-outlined text-[14px]">volume_up</span>
                    <span>SPEAK RESPONSE</span>
                  </button>

                  <button
                    onClick={() => navigator.clipboard.writeText(card.response)}
                    className="px-3 py-1.5 bg-[#1d2026] border border-[#3a494b] text-[#b9cacb] hover:text-[#00f2ff] rounded-lg transition-all flex items-center gap-1"
                    title="Copy response to clipboard"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>COPY</span>
                  </button>
                </div>

                {/* Follow-up Prompts if available */}
                {card.suggestedFollowUps && card.suggestedFollowUps.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#849495] text-[10px]">FOLLOW UP:</span>
                    {card.suggestedFollowUps.map((fu, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePresetClick(fu)}
                        className="px-2 py-1 bg-[#10131a] border border-[#00dbe7]/40 text-[#74f5ff] text-[10px] rounded hover:border-[#00f2ff]"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

