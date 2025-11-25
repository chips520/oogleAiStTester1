import React, { useEffect, useRef } from 'react';
import { LogEntry, LogLevel } from '../types';
import { Trash2, Terminal } from 'lucide-react';

interface ConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const Console: React.FC<ConsoleProps> = ({ logs, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.INFO: return 'text-blue-400';
      case LogLevel.WARNING: return 'text-yellow-400';
      case LogLevel.ERROR: return 'text-red-400';
      case LogLevel.SUCCESS: return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-[#3e3e42]">
      <div className="flex items-center justify-between px-4 py-1 bg-[#252526] text-xs uppercase tracking-wider text-gray-400 select-none">
        <div className="flex items-center gap-2">
          <Terminal size={14} />
          <span>Output / Terminal</span>
        </div>
        <button 
          onClick={onClear}
          className="hover:text-white p-1 rounded hover:bg-[#333] transition-colors"
          title="Clear Console"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
        {logs.length === 0 && (
          <div className="text-gray-600 italic px-2">No output yet. Run the script to see results...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 hover:bg-[#2a2d2e] py-0.5 px-2 rounded">
            <span className="text-gray-500 min-w-[80px]">{log.timestamp}</span>
            <span className={`font-bold min-w-[60px] ${getLevelColor(log.level)}`}>[{log.level}]</span>
            <span className="text-[#cccccc] whitespace-pre-wrap break-all">{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};