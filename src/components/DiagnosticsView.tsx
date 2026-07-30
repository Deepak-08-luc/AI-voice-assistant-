import React, { useState } from 'react';
import { SystemMetrics, SessionState } from '../types';
import { getWebSocketUrl } from '../utils/websocket';

interface DiagnosticsViewProps {
  metrics: SystemMetrics;
  voiceRate: number;
  setVoiceRate: (rate: number) => void;
  voicePitch: number;
  setVoicePitch: (pitch: number) => void;
  voiceVolume: number;
  setVoiceVolume: (volume: number) => void;
  sessionState?: SessionState;
  voiceGender?: 'male' | 'female';
  setVoiceGender?: (gender: 'male' | 'female') => void;
  language?: 'en-US' | 'te-IN';
  setLanguage?: (lang: 'en-US' | 'te-IN') => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  metrics,
  voiceRate,
  setVoiceRate,
  voicePitch,
  setVoicePitch,
  voiceVolume,
  setVoiceVolume,
  sessionState,
  voiceGender = 'male',
  setVoiceGender,
  language = 'en-US',
  setLanguage,
}) => {
  const [isOverclocked, setIsOverclocked] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('PURGED / FRESH');
  const [logMessages, setLogMessages] = useState<string[]>([
    'PRO_TIER: High Throughput Capacity active (65,536 max tokens/query).',
    'COMPRESSION_ENGINE: Context Window Compression active (84.2% ratio).',
    'SESSION_RESUME: LocalStorage state persistence synchronized.',
    'SYS_CHECK: All 8 Neural Core threads running at nominal clock.',
    'VOLTAGE: 1.18V (STABLE)',
  ]);


  const handlePurgeCache = () => {
    setCacheStatus('PURGING...');
    setTimeout(() => {
      setCacheStatus('PURGED / FRESH');
      setLogMessages((prev) => [
        `CACHE_FLUSH: Cleared 412 MB of neural buffer at ${new Date().toLocaleTimeString()}`,
        ...prev,
      ]);
    }, 600);
  };

  const toggleOverclock = () => {
    setIsOverclocked(!isOverclocked);
    setLogMessages((prev) => [
      `OVERCLOCK_STATE: Changed to ${!isOverclocked ? 'BOOST (4.8 GHz)' : 'NOMINAL (3.6 GHz)'}`,
      ...prev,
    ]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-16 pb-24 px-4 font-mono select-none">
      <div className="space-y-6">
        
        {/* Title */}
        <div className="flex justify-between items-center border-b border-[#00dbe7]/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00dbe7]">
              settings_input_component
            </span>
            <h2 className="text-[16px] text-[#00f2ff] tracking-widest font-bold uppercase">
              SYSTEM_DIAGNOSTICS // HARDWARE_TELEMETRY
            </h2>
          </div>
          <span className="text-[11px] text-[#849495] bg-[#191c22] border border-[#3a494b] px-2.5 py-1 rounded">
            KERNEL_STATUS: NOMINAL
          </span>
        </div>

        {/* Real-time Hardware Meters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* CPU Gauge */}
          <div className="bg-[#191c22] border border-[#00dbe7]/50 p-4 rounded-lg flex flex-col items-center text-center">
            <span className="text-[10px] text-[#849495] uppercase font-bold">CPU Core Load</span>
            <div className="relative my-3 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="38" stroke="#3a494b" strokeWidth="8" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#00f2ff"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={238}
                  strokeDashoffset={238 - (238 * (metrics.cpuLoad + (isOverclocked ? 15 : 0))) / 100}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute text-[16px] font-bold text-[#00f2ff]">
                {Math.min(100, metrics.cpuLoad + (isOverclocked ? 15 : 0))}%
              </span>
            </div>
            <span className="text-[10px] text-[#00dbe7]">
              {isOverclocked ? '4.8 GHz BOOST' : '3.6 GHz NOMINAL'}
            </span>
          </div>

          {/* Memory Allocation */}
          <div className="bg-[#191c22] border border-[#3a494b] p-4 rounded-lg flex flex-col items-center text-center hover:border-[#00dbe7] transition-all">
            <span className="text-[10px] text-[#849495] uppercase font-bold">RAM Allocation</span>
            <div className="relative my-3 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="38" stroke="#3a494b" strokeWidth="8" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#74f5ff"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={238}
                  strokeDashoffset={238 - (238 * metrics.memoryUsage) / 100}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute text-[16px] font-bold text-[#74f5ff]">
                {metrics.memoryUsage}%
              </span>
            </div>
            <span className="text-[10px] text-[#849495]">18.2 GB / 32.0 GB</span>
          </div>

          {/* GPU Compute */}
          <div className="bg-[#191c22] border border-[#3a494b] p-4 rounded-lg flex flex-col items-center text-center hover:border-[#00dbe7] transition-all">
            <span className="text-[10px] text-[#849495] uppercase font-bold">GPU Neural Tensor</span>
            <div className="relative my-3 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="38" stroke="#3a494b" strokeWidth="8" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#e8c423"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={238}
                  strokeDashoffset={238 - (238 * metrics.gpuUsage) / 100}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute text-[16px] font-bold text-[#e8c423]">
                {metrics.gpuUsage}%
              </span>
            </div>
            <span className="text-[10px] text-amber-400">FP16 TENSOR UNITS</span>
          </div>

          {/* Thermal Headroom */}
          <div className="bg-[#191c22] border border-[#3a494b] p-4 rounded-lg flex flex-col items-center text-center hover:border-[#00dbe7] transition-all">
            <span className="text-[10px] text-[#849495] uppercase font-bold">Thermal Headroom</span>
            <div className="relative my-3 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="38" stroke="#3a494b" strokeWidth="8" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#00dbe7"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={238}
                  strokeDashoffset={238 - (238 * (metrics.tempCelsius / 80)) * 100}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute text-[16px] font-bold text-[#00dbe7]">
                {metrics.tempCelsius.toFixed(0)}°C
              </span>
            </div>
            <span className="text-[10px] text-[#00dbe7]">MAX SAFE: 85°C</span>
          </div>

        </div>

        {/* Voice & Hardware Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* JARVIS Speech Customization Controls */}
          <div className="bg-[#191c22] border border-[#00dbe7]/40 p-4 rounded-lg space-y-4">
            <div className="text-[12px] text-[#00f2ff] font-bold uppercase tracking-wider border-b border-[#3a494b] pb-2">
              JARVIS Vocal Engine Controls
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-[#849495] mb-1.5">
                <span>Acoustic Voice Gender (Voice Command Compatible)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVoiceGender && setVoiceGender('male')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded border flex items-center justify-center gap-1.5 transition-all ${
                    voiceGender === 'male'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,219,231,0.3)]'
                      : 'bg-[#10131a] text-[#849495] border-[#3a494b] hover:text-[#e1e2eb]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">male</span>
                  <span>MALE VOICE ♂</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceGender && setVoiceGender('female')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded border flex items-center justify-center gap-1.5 transition-all ${
                    voiceGender === 'female'
                      ? 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.3)]'
                      : 'bg-[#10131a] text-[#849495] border-[#3a494b] hover:text-[#e1e2eb]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">female</span>
                  <span>FEMALE VOICE ♀</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-[#849495] mb-1.5">
                <span>Active Language Engine (Telugu te-IN / English en-US)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage && setLanguage('en-US')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded border flex items-center justify-center gap-1.5 transition-all ${
                    language === 'en-US'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,219,231,0.3)]'
                      : 'bg-[#10131a] text-[#849495] border-[#3a494b] hover:text-[#e1e2eb]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">translate</span>
                  <span>ENGLISH (en-US)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage && setLanguage('te-IN')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded border flex items-center justify-center gap-1.5 transition-all ${
                    language === 'te-IN'
                      ? 'bg-amber-950 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-[#10131a] text-[#849495] border-[#3a494b] hover:text-[#e1e2eb]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">language</span>
                  <span>TELUGU (తెలుగు te-IN)</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-[#849495] mb-1">
                <span>Speech Speed Rate ({voiceRate.toFixed(1)}x)</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-full accent-[#00f2ff]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-[#849495] mb-1">
                <span>Speech Pitch Modulation ({voicePitch.toFixed(1)})</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full accent-[#00f2ff]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-[#849495] mb-1">
                <span>Output Volume ({Math.round(voiceVolume * 100)}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={voiceVolume}
                onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                className="w-full accent-[#00f2ff]"
              />
            </div>
          </div>

          {/* Core Hardware Toggles */}
          <div className="bg-[#191c22] border border-[#3a494b] p-4 rounded-lg space-y-4">
            <div className="text-[12px] text-[#00f2ff] font-bold uppercase tracking-wider border-b border-[#3a494b] pb-2">
              System Tuning & Overclocking
            </div>

            <div className="flex justify-between items-center bg-[#10131a] p-3 rounded border border-[#3a494b]">
              <div>
                <div className="text-[12px] text-[#e1e2eb] font-bold">Neural Overclocking</div>
                <div className="text-[10px] text-[#849495]">Boosts CPU & GPU clock speed by 20%</div>
              </div>
              <button
                onClick={toggleOverclock}
                className={`px-3 py-1.5 text-[10px] font-bold rounded border transition-all ${
                  isOverclocked
                    ? 'bg-[#00f2ff] text-[#002022] border-[#00f2ff]'
                    : 'bg-[#191c22] text-[#849495] border-[#3a494b] hover:text-[#e1e2eb]'
                }`}
              >
                {isOverclocked ? 'BOOST_ON' : 'OFF'}
              </button>
            </div>

            <div className="flex justify-between items-center bg-[#10131a] p-3 rounded border border-[#3a494b]">
              <div>
                <div className="text-[12px] text-[#e1e2eb] font-bold">Neural Cache Buffer</div>
                <div className="text-[10px] text-[#849495]">Status: {cacheStatus}</div>
              </div>
              <button
                onClick={handlePurgeCache}
                className="px-3 py-1.5 text-[10px] bg-[#006a71]/40 border border-[#00dbe7]/40 text-[#74f5ff] font-bold rounded hover:bg-[#00dbe7] hover:text-[#002022]"
              >
                PURGE
              </button>
            </div>
          </div>

        </div>

          {/* Live Diagnostics Log Stream */}
        <div className="bg-[#10131a] border border-[#00dbe7]/50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#3a494b] pb-2">
            <span className="text-[12px] text-[#00f2ff] font-bold uppercase tracking-wider">
              PRO CAPACITY & SESSION PIPELINE ENGINE
            </span>
            <span className="px-2 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400 font-bold rounded">
              UPGRADED TIER ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
            <div className="bg-[#181d28] p-3 rounded border border-[#3a494b]">
              <div className="text-[#849495] font-bold">TEXT STREAMING ENGINE</div>
              <div className="text-cyan-300 font-mono text-[14px] font-bold mt-1">REAL-TIME CHUNKS</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">✓ Eliminates voice lag</div>
            </div>

            <div className="bg-[#181d28] p-3 rounded border border-[#3a494b]">
              <div className="text-[#849495] font-bold">MAX OUTPUT LIMIT</div>
              <div className="text-[#00f2ff] font-mono text-[14px] font-bold mt-1">65,536 TOKENS</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">✓ High throughput</div>
            </div>

            <div className="bg-[#181d28] p-3 rounded border border-[#3a494b]">
              <div className="text-[#849495] font-bold">SLIDING WINDOW MEMORY</div>
              <div className="text-amber-300 font-mono text-[14px] font-bold mt-1">
                LAST 4 TURNS CAP
              </div>
              <div className="text-[10px] text-[#00dbe7] mt-0.5">✓ Prevents token bloat</div>
            </div>

            <div className="bg-[#181d28] p-3 rounded border border-[#3a494b]">
              <div className="text-[#849495] font-bold">CONTEXT COMPRESSION</div>
              <div className="text-emerald-300 font-mono text-[14px] font-bold mt-1">
                {sessionState?.compressionRatio || '84.2% COMPRESSED'}
              </div>
              <div className="text-[10px] text-[#74f5ff] mt-0.5">✓ Auto-condenses context</div>
            </div>
          </div>
        </div>

        {/* WEBSOCKET PROXY INTERCEPTOR VERIFIER */}
        <div className="bg-[#10131a] border border-[#00dbe7]/60 p-4 rounded-lg space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#3a494b] pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00f2ff] text-[18px]">hub</span>
              <span className="text-[12px] text-[#00f2ff] font-bold uppercase tracking-wider">
                WEBSOCKET PROXY INTERCEPTOR & CONNECTION ROUTER
              </span>
            </div>
            <span className="px-2 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-bold rounded">
              NO DOUBLE SLASH GUARANTEE
            </span>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#181d28] p-2.5 rounded border border-[#3a494b] gap-2">
              <span className="text-[#849495]">PROXY ENDPOINT STRING:</span>
              <span className="text-[#00f2ff] bg-[#0c0e14] px-2 py-1 rounded border border-[#00dbe7]/30 break-all">
                {getWebSocketUrl('/api/ws/telemetry')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#181d28] p-2.5 rounded border border-[#3a494b] gap-2">
              <span className="text-[#849495]">STREAM INTERCEPTOR ROUTE:</span>
              <span className="text-emerald-300 bg-[#0c0e14] px-2 py-1 rounded border border-emerald-400/30 break-all">
                {getWebSocketUrl('/proxy/live-stream', { queryParams: { token: 'jarvis_session_v2' } })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-500/30">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>All double slashes (e.g. wss://domain.com//ws) are automatically intercepted and normalized to single slashes.</span>
            </div>
          </div>
        </div>

        {/* Live Diagnostics Log Stream */}
        <div className="bg-[#10131a] border border-[#3a494b] p-4 rounded-lg">

          <div className="text-[11px] text-[#00dbe7] font-bold uppercase mb-2">
            Hardware Diagnostic Log Stream
          </div>
          <div className="space-y-1 text-[11px] text-[#849495] max-h-32 overflow-y-auto">
            {logMessages.map((msg, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-[#00f2ff]">&gt;</span>
                <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
