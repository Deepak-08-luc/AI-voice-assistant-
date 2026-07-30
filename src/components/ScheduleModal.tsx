import React, { useState } from 'react';
import { ScheduleEvent } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: ScheduleEvent[];
  onAddEvent: (newEvent: Omit<ScheduleEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  events,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('15:00');
  const [location, setLocation] = useState('SECTOR_04');
  const [priority, setPriority] = useState<'HIGH' | 'NOMINAL' | 'CRITICAL'>('NOMINAL');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddEvent({
      title,
      time,
      location,
      type: 'synthesis',
      priority,
    });
    setTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#191c22] border border-[#00dbe7] rounded-lg p-5 shadow-[0_0_30px_rgba(0,242,255,0.2)] font-mono text-[#e1e2eb]">
        <div className="flex justify-between items-center border-b border-[#00dbe7]/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00dbe7]">schedule</span>
            <h3 className="text-[14px] text-[#00f2ff] tracking-widest font-bold">
              SCHEDULED_EVENTS // SCHEDULER
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#849495] hover:text-[#00f2ff] transition-colors text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Existing Events List */}
        <div className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-1">
          {events.length === 0 ? (
            <p className="text-[12px] text-[#849495] italic">No active events scheduled.</p>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="flex justify-between items-center bg-[#272a31] border border-[#3a494b] p-2.5 rounded hover:border-[#00dbe7] transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-[#74f5ff]">{ev.title}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded border ${
                        ev.priority === 'CRITICAL'
                          ? 'bg-red-950/80 text-red-400 border-red-500'
                          : ev.priority === 'HIGH'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                          : 'bg-[#006a71]/40 text-[#74f5ff] border-[#00dbe7]/40'
                      }`}
                    >
                      {ev.priority}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#849495] mt-1">
                    TIME: {ev.time} | LOC: {ev.location}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteEvent(ev.id)}
                  className="text-red-400 hover:text-red-300 text-[11px] px-2 py-1 bg-red-950/30 rounded border border-red-900/50"
                  title="Purge event"
                >
                  PURGE
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Event Form */}
        <form onSubmit={handleSubmit} className="border-t border-[#3a494b] pt-4 space-y-3">
          <div className="text-[11px] text-[#00dbe7] font-bold uppercase tracking-wider">
            + Schedule New Neural Task
          </div>
          <input
            type="text"
            placeholder="Task / Event Description"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#10131a] border border-[#3a494b] focus:border-[#00dbe7] text-[12px] p-2 rounded outline-none text-[#e1e2eb]"
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-[#849495] block mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#10131a] border border-[#3a494b] text-[12px] p-1.5 rounded outline-none text-[#e1e2eb]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#849495] block mb-1">Sector</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#10131a] border border-[#3a494b] text-[12px] p-1.5 rounded outline-none text-[#e1e2eb]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#849495] block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full bg-[#10131a] border border-[#3a494b] text-[11px] p-1.5 rounded outline-none text-[#e1e2eb]"
              >
                <option value="NOMINAL">NOMINAL</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[11px] border border-[#3a494b] rounded text-[#849495] hover:text-[#e1e2eb]"
            >
              CLOSE
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-[11px] bg-[#00f2ff] text-[#002022] font-bold rounded hover:bg-[#74f5ff] transition-all"
            >
              COMMIT TASK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
