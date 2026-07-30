import React, { useState } from 'react';
import { NeuralNode } from '../types';

const INITIAL_NODES: NeuralNode[] = [
  {
    id: 'core-ai',
    label: 'JARVIS AI Core (Gemini 3.6)',
    category: 'core',
    status: 'OPTIMAL',
    loadPercent: 42,
    subModules: ['Server-Side Gemini API Proxy', 'Prompt Context Buffer', 'Streaming Text Engine'],
    description: 'Central AI reasoning model processing voice intent and natural language query requests.',
  },
  {
    id: 'speech-mod',
    label: 'Vocal Perception & TTS',
    category: 'perception',
    status: 'OPTIMAL',
    loadPercent: 18,
    subModules: ['SpeechRecognition API', 'SpeechSynthesis Pitch Shifter', 'Waveform Equalizer'],
    description: 'Manages continuous microphone input capture and synthetic vocal speech output.',
  },
  {
    id: 'telemetry-mod',
    label: 'Orbital Telematics & Satellite',
    category: 'telemetry',
    status: 'SYNCING',
    loadPercent: 65,
    subModules: ['LEO Satellite Link Sector_04', 'Coordinates Telemetry', 'Spectrum Filter Matrix'],
    description: 'Interfaces with orbital satellite array for imagery, GPS sector locks, and environment data.',
  },
  {
    id: 'security-mod',
    label: 'Firewall & DEFCON Manager',
    category: 'security',
    status: 'OPTIMAL',
    loadPercent: 12,
    subModules: ['Packet Inspection Engine', 'DEFCON Level Guard', 'Realtime Threat Logger'],
    description: 'Monitors inbound network traffic and defends against unauthorized neural breaches.',
  },
  {
    id: 'exec-kernel',
    label: 'Neural OS Hardware Kernel',
    category: 'exec',
    status: 'OPTIMAL',
    loadPercent: 38,
    subModules: ['CPU Core Scheduler', 'Liquid Cooling Loop', 'Overclock Turbo Boost'],
    description: 'Executes low-level threads, regulates thermals, and allocates system memory.',
  },
];

export const NeuralTreeView: React.FC = () => {
  const [nodes, setNodes] = useState<NeuralNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<NeuralNode>(INITIAL_NODES[0]);
  const [testLog, setTestLog] = useState<string>('');

  const handleTestModule = (node: NeuralNode) => {
    setTestLog(`Executing self-test on module: ${node.label}...`);
    setTimeout(() => {
      setTestLog(`MODULE TEST SUCCESSFUL: ${node.label} returned code 0 (NOMINAL).`);
      setNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, status: 'OPTIMAL' } : n))
      );
    }, 700);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-16 pb-24 px-4 font-mono select-none">
      <div className="space-y-6">
        
        {/* Title */}
        <div className="flex justify-between items-center border-b border-[#00dbe7]/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00dbe7]">account_tree</span>
            <h2 className="text-[16px] text-[#00f2ff] tracking-widest font-bold uppercase">
              NEURAL_OS_ARCHITECTURE // NODE_TREE
            </h2>
          </div>
          <span className="text-[11px] text-[#74f5ff] bg-[#006a71]/30 border border-[#00dbe7]/40 px-2.5 py-1 rounded">
            NODES: 5 ONLINE
          </span>
        </div>

        {/* Visual Node Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Nodes List */}
          <div className="md:col-span-1 space-y-2.5">
            <div className="text-[11px] text-[#849495] uppercase font-bold mb-1">
              Active Neural Sub-Modules
            </div>
            {nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedNode(node);
                  setTestLog('');
                }}
                className={`p-3 rounded border cursor-pointer transition-all ${
                  selectedNode.id === node.id
                    ? 'bg-[#191c22] border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                    : 'bg-[#10131a] border-[#3a494b] hover:border-[#00dbe7]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold text-[#e1e2eb]">{node.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      node.status === 'OPTIMAL'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#849495] mt-1.5">
                  <span>LOAD: {node.loadPercent}%</span>
                  <span className="text-[#00dbe7]">SELECT &gt;</span>
                </div>
              </div>
            ))}
          </div>

          {/* Node Inspector Detail View */}
          <div className="md:col-span-2 bg-[#191c22] border border-[#00dbe7] p-5 rounded-lg flex flex-col justify-between space-y-4 shadow-lg">
            <div>
              <div className="flex justify-between items-start border-b border-[#3a494b] pb-3 mb-3">
                <div>
                  <span className="text-[10px] text-[#00dbe7] uppercase tracking-wider block">
                    Sub-Module Inspector
                  </span>
                  <h3 className="text-[16px] text-[#00f2ff] font-bold mt-0.5">
                    {selectedNode.label}
                  </h3>
                </div>
                <span className="px-2 py-1 bg-[#10131a] border border-[#00dbe7]/40 text-[#74f5ff] text-[10px] rounded">
                  ID: {selectedNode.id}
                </span>
              </div>

              <p className="text-[12px] text-[#e1e2eb] leading-relaxed mb-4">
                {selectedNode.description}
              </p>

              <div className="space-y-2">
                <span className="text-[11px] text-[#849495] font-bold uppercase block">
                  Registered Internal Services:
                </span>
                <div className="space-y-1.5">
                  {selectedNode.subModules.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-[11px] text-[#74f5ff] bg-[#10131a] p-2 rounded border border-[#3a494b]"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#00dbe7]">
                        check_circle
                      </span>
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Log Display */}
            <div className="border-t border-[#3a494b] pt-3">
              {testLog && (
                <div className="text-[11px] text-amber-300 bg-[#10131a] p-2 rounded border border-amber-500/40 mb-3 animate-fadeIn">
                  {testLog}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleTestModule(selectedNode)}
                  className="px-4 py-2 bg-[#00f2ff] text-[#002022] font-bold text-[11px] rounded hover:bg-[#74f5ff] transition-all"
                >
                  RUN SUB-MODULE TEST
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
