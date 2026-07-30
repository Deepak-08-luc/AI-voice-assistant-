import React, { useState } from 'react';
import { FirewallLog } from '../types';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockLogs: FirewallLog[] = [
  {
    id: 'log-1',
    timestamp: '10:28:42',
    sourceIp: '192.168.1.104',
    action: 'ALLOWED',
    threatLevel: 'LOW',
    protocol: 'HTTPS/2',
  },
  {
    id: 'log-2',
    timestamp: '10:25:12',
    sourceIp: '45.132.18.9',
    action: 'BLOCKED',
    threatLevel: 'HIGH',
    protocol: 'SYN_FLOOD',
  },
  {
    id: 'log-3',
    timestamp: '10:21:05',
    sourceIp: '108.61.22.184',
    action: 'INSPECTED',
    threatLevel: 'MED',
    protocol: 'UDP_PROBE',
  },
  {
    id: 'log-4',
    timestamp: '10:15:33',
    sourceIp: '10.0.0.1',
    action: 'ALLOWED',
    threatLevel: 'LOW',
    protocol: 'WEBSOCKET',
  },
];

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<FirewallLog[]>(mockLogs);
  const [secLevel, setSecLevel] = useState<'DEFCON 4' | 'DEFCON 3' | 'DEFCON 1'>('DEFCON 4');

  if (!isOpen) return null;

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#191c22] border border-[#00dbe7] rounded-lg p-5 shadow-[0_0_30px_rgba(0,242,255,0.2)] font-mono text-[#e1e2eb]">
        <div className="flex justify-between items-center border-b border-[#00dbe7]/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00dbe7]">security</span>
            <h3 className="text-[14px] text-[#00f2ff] tracking-widest font-bold">
              FIREWALL_INTEGRITY // SEC_LEV_4
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#849495] hover:text-[#00f2ff] transition-colors text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#272a31] border border-[#3a494b] p-3 rounded">
            <div>
              <div className="text-[10px] text-[#849495] uppercase">Firewall Subsystem</div>
              <div className="text-[14px] font-bold text-emerald-400 mt-0.5">
                ACTIVE & OPTIMAL
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#849495]">ACTIVE SEC LEVEL</div>
              <select
                value={secLevel}
                onChange={(e: any) => setSecLevel(e.target.value)}
                className="bg-[#10131a] border border-[#3a494b] text-[11px] text-[#00f2ff] p-1 rounded mt-1 font-bold outline-none"
              >
                <option value="DEFCON 4">DEFCON 4 (STANDARD)</option>
                <option value="DEFCON 3">DEFCON 3 (ENHANCED)</option>
                <option value="DEFCON 1">DEFCON 1 (MAX LOCKDOWN)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-[#00dbe7] font-bold uppercase">
                Threat Inspection Telemetry
              </span>
              <button
                onClick={handleClearLogs}
                className="text-[10px] text-[#849495] hover:text-red-400 transition-colors"
              >
                CLEAR LOGS
              </button>
            </div>

            <div className="bg-[#10131a] border border-[#3a494b] rounded p-2 max-h-48 overflow-y-auto space-y-1.5 text-[11px]">
              {logs.length === 0 ? (
                <div className="text-[#849495] italic p-2 text-center">
                  No active threat logs detected.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center border-b border-[#3a494b]/30 pb-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#849495]">{log.timestamp}</span>
                      <span className="text-[#e1e2eb]">{log.sourceIp}</span>
                      <span className="text-[9px] text-[#849495]">({log.protocol})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          log.action === 'BLOCKED'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : log.action === 'INSPECTED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-[11px] bg-[#00f2ff] text-[#002022] font-bold rounded hover:bg-[#74f5ff]"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
