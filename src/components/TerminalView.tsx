import React, { useState, useRef, useEffect } from 'react';
import { TerminalEntry, SystemMetrics } from '../types';
import { getWebSocketUrl } from '../utils/websocket';

interface TerminalViewProps {
  metrics: SystemMetrics;
  onSendAiQuery: (prompt: string) => Promise<string>;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ metrics, onSendAiQuery }) => {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      id: 'init-1',
      timestamp: '10:30:00',
      type: 'system',
      text: 'NEURAL_OS_V2.1 [KERNEL_BOOT_COMPLETE]',
    },
    {
      id: 'init-2',
      timestamp: '10:30:01',
      type: 'system',
      text: 'JARVIS CLI Shell initialized. Type "help" or "query <prompt>" to communicate with the AI Core.',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const addEntry = (type: TerminalEntry['type'], text: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setEntries((prev) => [...prev, { id: `entry-${Date.now()}-${Math.random()}`, timestamp: time, type, text }]);
  };

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addEntry('input', `> ${trimmed}`);
    setInputVal('');

    const parts = trimmed.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (mainCmd) {
      case 'help':
      case '?':
        addEntry(
          'output',
          `AVAILABLE NEURAL CLI COMMANDS:
- query <prompt>    : Query Gemini AI Core for analysis or voice synthesis
- status            : Print real-time system metrics & hardware telematics
- ws / websocket    : Inspect normalized WebSocket connection string & proxy route
- scan              : Execute deep neural diagnostic self-test
- satellite         : Print orbital telematics & GPS sector lock
- clear / cls       : Wipe the terminal buffer
- help              : Display this command manifest`
        );
        break;

      case 'ws':
      case 'websocket':
        addEntry(
          'output',
          `WEBSOCKET PROXY INTERCEPTOR URL INSPECTION:
---------------------------------------------
PROTOCOL SCHEME : ${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}
TARGET ENDPOINT : ${getWebSocketUrl('/api/ws/telemetry')}
PROXIED STREAM  : ${getWebSocketUrl('/proxy/live-stream')}
NORMALIZATION   : PASSED (0 Double Slashes Detected)`
        );
        break;

      case 'query':
      case 'ai':
      case 'ask':
        if (!args) {
          addEntry('error', 'Error: Query argument required. Usage: query <your question>');
          return;
        }
        setIsProcessing(true);
        addEntry('system', 'Transmitting query to Gemini AI Core...');
        try {
          const aiReply = await onSendAiQuery(args);
          addEntry('ai', `[JARVIS_AI_CORE]: ${aiReply}`);
        } catch (err) {
          addEntry('error', 'Error: Failed to reach AI model server.');
        } finally {
          setIsProcessing(false);
        }
        break;

      case 'status':
      case 'telemetry':
        addEntry(
          'output',
          `SYSTEM TELEMETRY READOUT:
---------------------------------------------
CPU LOAD       : ${metrics.cpuLoad}%
MEMORY USAGE   : ${metrics.memoryUsage}% (ALLOCATED)
TEMPERATURE    : ${metrics.tempCelsius.toFixed(1)}°C [OPTIMAL]
FIREWALL       : ${metrics.firewallStatus}
SATELLITE SYNC : ${metrics.satelliteSignal}
LATENCY        : ${metrics.uplinkLatencyMs} ms
GPU CORE       : ${metrics.gpuUsage}% LOAD`
        );
        break;

      case 'scan':
        setIsProcessing(true);
        addEntry('system', 'Initiating Neural Diagnostic Scan sequence...');
        setTimeout(() => addEntry('system', '[01/03] Memory Heap Integrity: 100% OK'), 400);
        setTimeout(() => addEntry('system', '[02/03] Gemini API Gateway: SECURE & CONNECTED'), 800);
        setTimeout(() => {
          addEntry('system', '[03/03] Thermal & Voltage Regulation: STABLE');
          addEntry('output', 'NEURAL DIAGNOSTICS COMPLETE. All 12 core sub-routines operational.');
          setIsProcessing(false);
        }, 1200);
        break;

      case 'satellite':
        addEntry(
          'output',
          `ORBITAL SATELLITE TELEMETRY:
---------------------------------------------
ORBITAL SLOT   : SECTOR_04 (LEO)
ALTITUDE       : 420.8 KM
COORDINATES    : LAT: 40.7128° N | LONG: 74.0060° W
SIGNAL MARGIN  : +24 dB (OPTIMAL)
TELEMETRY MODE : LIVE_REALTIME_STREAM`
        );
        break;

      case 'clear':
      case 'cls':
        setEntries([]);
        break;

      default:
        // Default: treated as an AI query if user typed a sentence
        setIsProcessing(true);
        addEntry('system', `Implicit command detected. Sending to Gemini AI: "${trimmed}"`);
        try {
          const aiReply = await onSendAiQuery(trimmed);
          addEntry('ai', `[JARVIS_AI_CORE]: ${aiReply}`);
        } catch (err) {
          addEntry('error', 'Error processing implicit query.');
        } finally {
          setIsProcessing(false);
        }
        break;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-16 pb-24 px-4 font-mono select-text">
      <div className="bg-[#10131a] border border-[#00dbe7] rounded-lg shadow-[0_0_30px_rgba(0,242,255,0.15)] overflow-hidden flex flex-col h-[calc(100vh-10rem)]">
        
        {/* Terminal Title Bar */}
        <div className="bg-[#191c22] border-b border-[#00dbe7]/40 px-4 py-2.5 flex justify-between items-center text-[12px] select-none">
          <div className="flex items-center gap-2 text-[#00f2ff]">
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            <span className="font-bold tracking-widest uppercase">JARVIS_CLI_SHELL // NEURAL_OS_V2.1</span>
          </div>
          <div className="flex items-center gap-2 text-[#849495] text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>PORT_3000_ACTIVE</span>
          </div>
        </div>

        {/* Terminal Output Log Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2 text-[12px] sm:text-[13px] leading-relaxed">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`whitespace-pre-wrap ${
                entry.type === 'input'
                  ? 'text-[#00f2ff] font-bold'
                  : entry.type === 'ai'
                  ? 'text-[#74f5ff] bg-[#006a71]/20 p-2 rounded border border-[#00dbe7]/30'
                  : entry.type === 'system'
                  ? 'text-amber-300 italic'
                  : entry.type === 'error'
                  ? 'text-red-400 bg-red-950/30 p-1.5 rounded border border-red-900/50'
                  : 'text-[#e1e2eb]'
              }`}
            >
              <span className="text-[#849495] text-[10px] mr-2">[{entry.timestamp}]</span>
              {entry.text}
            </div>
          ))}

          {isProcessing && (
            <div className="text-amber-300 text-[12px] animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Processing neural query...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* CLI Input Line */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(inputVal);
          }}
          className="bg-[#191c22] border-t border-[#3a494b] p-3 flex items-center gap-2 text-[13px]"
        >
          <span className="text-[#00f2ff] font-bold">&gt;</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isProcessing}
            placeholder='Type command or query (e.g. "query summary of quantum computing", "status", "help")...'
            className="flex-1 bg-transparent text-[#e1e2eb] outline-none font-mono text-[13px]"
            autoFocus
          />
          <button
            type="submit"
            disabled={isProcessing || !inputVal.trim()}
            className="px-3 py-1 bg-[#00f2ff] text-[#002022] font-bold text-[11px] rounded hover:bg-[#74f5ff] disabled:opacity-40"
          >
            EXEC
          </button>
        </form>
      </div>
    </div>
  );
};
