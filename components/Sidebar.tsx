import React from 'react';
import { Folder, FileCode, Settings, Cpu, Play, Square, Wifi } from 'lucide-react';
import { ModbusConfig } from '../types';

interface SidebarProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  config: ModbusConfig;
  onConfigChange: (config: ModbusConfig) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isRunning, 
  onRun, 
  onStop, 
  config, 
  onConfigChange 
}) => {
  return (
    <div className="w-64 bg-[#252526] flex flex-col border-r border-[#3e3e42] h-full">
      {/* Title */}
      <div className="p-3 text-sm font-semibold text-gray-300 flex items-center gap-2 border-b border-[#3e3e42]">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        AutoScript.NET
      </div>

      {/* Actions */}
      <div className="p-3 border-b border-[#3e3e42]">
        <div className="text-xs text-gray-500 font-bold mb-2 uppercase">Execution Control</div>
        <div className="flex gap-2">
          {!isRunning ? (
            <button 
              onClick={onRun}
              className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white py-1.5 px-3 rounded text-sm font-medium transition-colors"
            >
              <Play size={14} fill="currentColor" />
              Run
            </button>
          ) : (
            <button 
              onClick={onStop}
              className="flex-1 flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 text-white py-1.5 px-3 rounded text-sm font-medium transition-colors"
            >
              <Square size={14} fill="currentColor" />
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Explorer */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="text-xs text-gray-500 font-bold mb-2 px-2 uppercase">Solution Explorer</div>
          
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 px-2 py-1 text-gray-300 hover:bg-[#37373d] rounded cursor-pointer">
              <Folder size={16} className="text-yellow-400" />
              <span className="text-sm">MyModbusProject</span>
            </div>
            <div className="pl-4">
               <div className="flex items-center gap-2 px-2 py-1 bg-[#37373d] text-white rounded cursor-pointer border-l-2 border-blue-500">
                <FileCode size={16} className="text-purple-400" />
                <span className="text-sm">Program.cs</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:bg-[#37373d] rounded cursor-pointer">
                <Settings size={16} className="text-gray-400" />
                <span className="text-sm">appsettings.json</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modbus Configuration Panel */}
        <div className="p-4 border-t border-[#3e3e42] mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold mb-4 uppercase">
            <Cpu size={14} />
            Hardware Configuration
          </div>
          
          <div className="space-y-3">
             <div>
              <label className="block text-xs text-gray-400 mb-1">Target IP Address</label>
              <div className="flex items-center bg-[#3c3c3c] rounded border border-[#555] px-2">
                <Wifi size={12} className="text-gray-500 mr-2"/>
                <input 
                  type="text" 
                  value={config.ipAddress}
                  onChange={(e) => onConfigChange({...config, ipAddress: e.target.value})}
                  className="bg-transparent border-none text-white text-xs w-full py-1.5 focus:outline-none"
                />
              </div>
             </div>

             <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Port</label>
                  <input 
                    type="number" 
                    value={config.port}
                    onChange={(e) => onConfigChange({...config, port: parseInt(e.target.value) || 502})}
                    className="bg-[#3c3c3c] border border-[#555] rounded text-white text-xs w-full py-1.5 px-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Slave ID</label>
                  <input 
                    type="number" 
                    value={config.slaveId}
                    onChange={(e) => onConfigChange({...config, slaveId: parseInt(e.target.value) || 1})}
                    className="bg-[#3c3c3c] border border-[#555] rounded text-white text-xs w-full py-1.5 px-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Footer Status */}
      <div className="p-2 bg-[#007acc] text-white text-xs flex justify-between items-center">
        <span>.NET 8.0</span>
        <span>Ready</span>
      </div>
    </div>
  );
};