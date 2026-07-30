import React, { useState } from 'react';
import { SystemMetrics } from '../types';

interface TemperatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: SystemMetrics;
}

export const TemperatureModal: React.FC<TemperatureModalProps> = ({
  isOpen,
  onClose,
  metrics,
}) => {
  const [coolingMode, setCoolingMode] = useState<'CRYOGENIC' | 'LIQUID' | 'PASSIVE'>('LIQUID');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#191c22] border border-[#00dbe7] rounded-lg p-5 shadow-[0_0_30px_rgba(0,242,255,0.2)] font-mono text-[#e1e2eb]">
        <div className="flex justify-between items-center border-b border-[#00dbe7]/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00dbe7]">partly_cloudy_day</span>
            <h3 className="text-[14px] text-[#00f2ff] tracking-widest font-bold">
              ENVIRONMENTAL_SENSORS // TELEMETRY
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
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#272a31] border border-[#3a494b] p-3 rounded">
              <div className="text-[10px] text-[#849495] uppercase">Ambient Temperature</div>
              <div className="text-[22px] font-bold text-[#00f2ff] mt-1">
                {metrics.tempCelsius.toFixed(1)}°C
              </div>
              <div className="text-[10px] text-[#00dbe7] mt-1">STATUS: STABLE_NOMINAL</div>
            </div>

            <div className="bg-[#272a31] border border-[#3a494b] p-3 rounded">
              <div className="text-[10px] text-[#849495] uppercase">Core Neural Thermal</div>
              <div className="text-[22px] font-bold text-amber-400 mt-1">
                {(metrics.tempCelsius + 14.2).toFixed(1)}°C
              </div>
              <div className="text-[10px] text-amber-300 mt-1">THERMAL HEADROOM: 38%</div>
            </div>
          </div>

          {/* Environmental Readouts */}
          <div className="bg-[#10131a] border border-[#3a494b] p-3 rounded space-y-2 text-[11px]">
            <div className="flex justify-between items-center border-b border-[#3a494b]/40 pb-1.5">
              <span className="text-[#849495]">SENSOR_CLUSTER:</span>
              <span className="text-[#74f5ff]">X4_ATMOSPHERIC_ARRAY</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#3a494b]/40 pb-1.5">
              <span className="text-[#849495]">HUMIDITY / PRESSURE:</span>
              <span className="text-[#74f5ff]">42% | 1013.2 hPa</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#3a494b]/40 pb-1.5">
              <span className="text-[#849495]">AIR QUALITY INDEX:</span>
              <span className="text-emerald-400">98 / 100 (OPTIMAL)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#849495]">ACTIVE COOLING PROTOCOL:</span>
              <span className="text-[#00f2ff] font-bold">{coolingMode}</span>
            </div>
          </div>

          {/* Cooling Mode Selector */}
          <div>
            <label className="text-[10px] text-[#849495] block mb-1 uppercase">
              Cooling Protocol
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['PASSIVE', 'LIQUID', 'CRYOGENIC'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCoolingMode(mode)}
                  className={`py-1.5 text-[10px] border rounded transition-all font-bold ${
                    coolingMode === mode
                      ? 'bg-[#00f2ff] text-[#002022] border-[#00f2ff]'
                      : 'bg-[#10131a] text-[#849495] border-[#3a494b] hover:text-[#e1e2eb]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-[11px] bg-[#00f2ff] text-[#002022] font-bold rounded hover:bg-[#74f5ff]"
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
