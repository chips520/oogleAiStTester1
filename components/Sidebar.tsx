
import React from 'react';
import { Settings, Cpu, Play, Square, Wifi, Plus, Box, Workflow, Grid3X3 } from 'lucide-react';
import { ModbusConfig, StepType, WidgetType } from '../types';

interface SidebarProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  config: ModbusConfig;
  onConfigChange: (config: ModbusConfig) => void;
  onAddStep: (type: StepType) => void;
  onAddWidget: (type: WidgetType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isRunning, 
  onRun, 
  onStop, 
  config, 
  onConfigChange,
  onAddStep,
  onAddWidget
}) => {
  return (
    <div className="w-64 bg-[#252526] flex flex-col border-r border-[#3e3e42] h-full">
      {/* Title */}
      <div className="p-3 text-sm font-semibold text-gray-300 flex items-center gap-2 border-b border-[#3e3e42]">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        AutoFlow Studio
      </div>

      {/* Actions */}
      <div className="p-3 border-b border-[#3e3e42]">
        <div className="text-xs text-gray-500 font-bold mb-2 uppercase">System Control</div>
        <div className="flex gap-2">
          {!isRunning ? (
            <button 
              onClick={onRun}
              className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors shadow-lg shadow-green-900/20"
            >
              <Play size={14} fill="currentColor" />
              Simulate
            </button>
          ) : (
            <button 
              onClick={onStop}
              className="flex-1 flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors animate-pulse"
            >
              <Square size={14} fill="currentColor" />
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Toolbox */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Logic Toolbox */}
        <div className="p-3 border-b border-[#3e3e42]">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold mb-3 uppercase">
                <Workflow size={14} />
                Logic Blocks
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onAddStep('MODBUS_READ')} className="flex flex-col items-center justify-center p-2 bg-[#333] hover:bg-[#444] rounded border border-[#444] hover:border-blue-500 transition-all">
                    <span className="text-blue-400 font-bold text-xs">READ</span>
                    <span className="text-[10px] text-gray-400">Modbus</span>
                </button>
                <button onClick={() => onAddStep('MODBUS_WRITE')} className="flex flex-col items-center justify-center p-2 bg-[#333] hover:bg-[#444] rounded border border-[#444] hover:border-orange-500 transition-all">
                    <span className="text-orange-400 font-bold text-xs">WRITE</span>
                    <span className="text-[10px] text-gray-400">Modbus</span>
                </button>
                <button onClick={() => onAddStep('DELAY')} className="flex flex-col items-center justify-center p-2 bg-[#333] hover:bg-[#444] rounded border border-[#444] hover:border-yellow-500 transition-all">
                    <span className="text-yellow-400 font-bold text-xs">DELAY</span>
                    <span className="text-[10px] text-gray-400">Wait</span>
                </button>
                <button onClick={() => onAddStep('LOG')} className="flex flex-col items-center justify-center p-2 bg-[#333] hover:bg-[#444] rounded border border-[#444] hover:border-gray-500 transition-all">
                    <span className="text-gray-300 font-bold text-xs">LOG</span>
                    <span className="text-[10px] text-gray-400">Print</span>
                </button>
            </div>
        </div>

        {/* UI Toolbox */}
        <div className="p-3 border-b border-[#3e3e42]">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold mb-3 uppercase">
                <Box size={14} />
                UI Widgets
            </div>
            <div className="space-y-1">
                <button onClick={() => onAddWidget('TRAY')} className="w-full text-left px-3 py-2 text-xs text-gray-300 bg-[#2d2d30] hover:bg-[#333] rounded flex items-center gap-2 border border-[#3e3e42] hover:border-green-500 transition-colors">
                    <Grid3X3 size={14} className="text-green-500"/> Tray / Pallet
                </button>
                <button onClick={() => onAddWidget('BUTTON')} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#333] rounded flex items-center gap-2">
                    <Plus size={10} /> Button
                </button>
                <button onClick={() => onAddWidget('INDICATOR')} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#333] rounded flex items-center gap-2">
                    <Plus size={10} /> Status Light
                </button>
                <button onClick={() => onAddWidget('GAUGE')} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#333] rounded flex items-center gap-2">
                    <Plus size={10} /> Digital Gauge
                </button>
                <button onClick={() => onAddWidget('LABEL')} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#333] rounded flex items-center gap-2">
                    <Plus size={10} /> Text Label
                </button>
            </div>
        </div>

        {/* Modbus Configuration Panel */}
        <div className="p-4 mt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold mb-4 uppercase">
            <Cpu size={14} />
            Global Connection
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
        <span>v2.1 Tray View</span>
        <div className="flex items-center gap-1">
            <Settings size={10} />
            <span>Settings</span>
        </div>
      </div>
    </div>
  );
};
