
import React, { useState } from 'react';
import { LogicStep, UIWidget, StepType, Script, AutomationProject } from '../types';
import { Layers, Workflow, Activity, Clock, FileText, ToggleLeft, Gauge, Type, Grid3X3, Code, FileCode } from 'lucide-react';
import { ScriptEditor } from './ScriptEditor';

interface VisualEditorProps {
  project: AutomationProject;
  onUpdateProject: (p: AutomationProject) => void;
  readOnly?: boolean;
  onRunScript: (id: string) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ project, onUpdateProject, readOnly, onRunScript }) => {
  const [activeTab, setActiveTab] = useState<'logic' | 'ui' | 'script'>('ui');

  const getStepIcon = (type: StepType) => {
    switch(type) {
      case 'MODBUS_READ': return <Activity className="text-blue-400" size={18} />;
      case 'MODBUS_WRITE': return <ToggleLeft className="text-orange-400" size={18} />;
      case 'DELAY': return <Clock className="text-yellow-400" size={18} />;
      case 'LOG': return <FileText className="text-gray-400" size={18} />;
      case 'SCRIPT_CALL': return <FileCode className="text-pink-400" size={18} />;
      default: return <Activity size={18} />;
    }
  };

  const getWidgetIcon = (type: string) => {
     switch(type) {
         case 'GAUGE': return <Gauge className="text-purple-400" size={14} />;
         case 'BUTTON': return <ToggleLeft className="text-blue-400" size={14} />;
         case 'TRAY': return <Grid3X3 className="text-green-400" size={14} />;
         default: return <Type className="text-gray-400" size={14} />;
     }
  };

  const deleteStep = (index: number) => {
      const newSteps = [...project.logicSteps];
      newSteps.splice(index, 1);
      onUpdateProject({ ...project, logicSteps: newSteps });
  };

  const deleteWidget = (index: number) => {
      const newWidgets = [...project.uiWidgets];
      newWidgets.splice(index, 1);
      onUpdateProject({ ...project, uiWidgets: newWidgets });
  };

  // Helper to render Tray slots
  const renderTray = (widget: UIWidget) => {
      const rows = widget.rows || 3;
      const cols = widget.cols || 3;
      // Get data from bound variable, default to empty array if not found
      const data = (widget.variableName && project.variables[widget.variableName]) 
        ? project.variables[widget.variableName] 
        : Array(rows * cols).fill(0);

      const slots = [];
      for (let i = 0; i < rows * cols; i++) {
          const status = data[i] || 0;
          let colorClass = "bg-[#333] border-[#444]"; // 0: Empty
          if (status === 1) colorClass = "bg-green-600 border-green-500 shadow-[0_0_5px_rgba(22,163,74,0.5)]"; // 1: OK
          if (status === 2) colorClass = "bg-red-600 border-red-500";     // 2: NG
          if (status === 3) colorClass = "bg-yellow-600 border-yellow-500 animate-pulse"; // 3: Processing

          slots.push(
              <div key={i} className={`rounded-sm border ${colorClass} transition-all duration-300 relative group`}>
                   <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-[8px] font-mono bg-black/50 text-white pointer-events-none">
                       {i}
                   </div>
              </div>
          );
      }

      return (
          <div 
            className="w-full h-full p-2 grid gap-1 bg-[#1e1e1e] rounded border border-[#333]"
            style={{ 
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`
            }}
          >
              {slots}
          </div>
      );
  };

  const handleWidgetClick = (widget: UIWidget) => {
      // In readOnly mode (Simulation Running), clicks trigger events
      // In edit mode, clicks usually select the widget (not implemented here for brevity)
      if (widget.events?.onClick) {
          onRunScript(widget.events.onClick);
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4]">
      {/* Tab Switcher */}
      <div className="flex bg-[#252526] border-b border-[#3e3e42]">
        <button 
          onClick={() => setActiveTab('ui')}
          className={`px-6 py-3 text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'ui' ? 'border-purple-500 text-white bg-[#1e1e1e]' : 'border-transparent text-gray-400 hover:bg-[#2d2d30]'}`}
        >
          <Layers size={16} />
          HMI Designer
        </button>
        <button 
          onClick={() => setActiveTab('logic')}
          className={`px-6 py-3 text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'logic' ? 'border-blue-500 text-white bg-[#1e1e1e]' : 'border-transparent text-gray-400 hover:bg-[#2d2d30]'}`}
        >
          <Workflow size={16} />
          Flow Logic
        </button>
        <button 
          onClick={() => setActiveTab('script')}
          className={`px-6 py-3 text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'script' ? 'border-yellow-500 text-white bg-[#1e1e1e]' : 'border-transparent text-gray-400 hover:bg-[#2d2d30]'}`}
        >
          <Code size={16} />
          Scripting
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'script' && (
          <ScriptEditor 
            scripts={project.scripts} 
            onUpdateScripts={(scripts) => onUpdateProject({...project, scripts})}
            onRunScript={onRunScript}
          />
        )}

        {activeTab === 'logic' && (
          <div className="h-full overflow-y-auto p-6 bg-[#1e1e1e]">
            <div className="max-w-3xl mx-auto space-y-4">
            {project.logicSteps.length === 0 && (
                <div className="text-center py-20 text-gray-600 border-2 border-dashed border-[#333] rounded-xl">
                    <p>No logic defined.</p>
                    <p className="text-sm">Use the Toolbox or AI Assistant to add steps.</p>
                </div>
            )}
            
            {project.logicSteps.map((step, idx) => (
              <div key={step.id} className="group relative flex items-start gap-4 p-4 bg-[#252526] border border-[#3e3e42] rounded-lg shadow-sm hover:border-blue-500/50 transition-all">
                {/* Step Number Line */}
                <div className="flex flex-col items-center pt-1 gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#333] text-xs flex items-center justify-center font-mono text-gray-500">{idx + 1}</div>
                    {idx < project.logicSteps.length - 1 && <div className="w-0.5 h-12 bg-[#333]"></div>}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {getStepIcon(step.type)}
                        <span className="font-semibold text-gray-200">{step.name}</span>
                        <span className="text-[10px] uppercase tracking-wider bg-[#333] px-1.5 py-0.5 rounded text-gray-400">{step.type}</span>
                    </div>
                    {!readOnly && (
                        <button onClick={() => deleteStep(idx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-[#333] p-1 rounded">
                            <span className="sr-only">Delete</span>×
                        </button>
                    )}
                  </div>
                  
                  {/* Parameter Display */}
                  <div className="bg-[#1e1e1e] p-2 rounded text-xs font-mono text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(step.params).map(([key, val]) => (
                          <div key={key} className="flex gap-2">
                              <span className="text-blue-400">{key}:</span>
                              <span className="text-[#ce9178] truncate">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </span>
                          </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
        
        {activeTab === 'ui' && (
          <div className="h-full w-full bg-[#1e1e1e] overflow-y-auto p-6 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
                 {project.uiWidgets.map((widget, idx) => (
                    <div 
                        key={widget.id} 
                        onClick={() => handleWidgetClick(widget)}
                        className={`relative bg-[#2d2d30] border border-[#3e3e42] rounded-lg p-4 shadow-lg hover:border-purple-500 group flex flex-col ${!readOnly ? 'cursor-move' : 'cursor-pointer'} ${widget.type === 'BUTTON' ? 'active:scale-95 transition-transform' : ''}`}
                        style={{ gridColumn: `span ${widget.w}`, gridRow: `span ${widget.h}` }}
                    >
                        <div className="flex justify-between items-center mb-2 shrink-0">
                             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                                 {getWidgetIcon(widget.type)}
                                 {widget.label}
                                 {widget.events?.onClick && (
                                   <span className="text-[9px] bg-yellow-900/50 text-yellow-500 px-1 rounded ml-2">SCRIPT</span>
                                 )}
                             </div>
                             {!readOnly && (
                                <button onClick={(e) => { e.stopPropagation(); deleteWidget(idx); }} className="text-gray-500 hover:text-red-400">×</button>
                             )}
                        </div>
                        
                        {/* Render Specific Widget Type */}
                        <div className="flex-1 flex items-center justify-center min-h-0 pointer-events-none">
                            {widget.type === 'GAUGE' && (
                                <div className="text-center">
                                    <div className="text-2xl font-mono text-blue-400">
                                        {(widget.variableName && project.variables[widget.variableName]) || 0}
                                    </div>
                                    <div className="text-[10px] text-gray-500">{widget.variableName || 'No Var'}</div>
                                </div>
                            )}
                            {widget.type === 'BUTTON' && (
                                <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white text-sm shadow transition-colors w-full h-full flex items-center justify-center">
                                    {widget.events?.onClick ? 'Click to Run' : 'Action'}
                                </button>
                            )}
                            {widget.type === 'INDICATOR' && (
                                <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                                    (widget.variableName && project.variables[widget.variableName]) 
                                    ? 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(0,255,0,0.5)]' 
                                    : 'bg-red-900 border-red-700'
                                }`}></div>
                            )}
                             {widget.type === 'LABEL' && (
                                <div className="text-lg text-gray-300 font-medium text-center">
                                    {(widget.variableName && project.variables[widget.variableName]) || widget.label}
                                </div>
                            )}
                            {widget.type === 'TRAY' && renderTray(widget)}
                        </div>
                    </div>
                 ))}
                 
                 {project.uiWidgets.length === 0 && (
                     <div className="col-span-4 flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#333] rounded-xl text-gray-600">
                         <Layers size={48} className="mb-4 opacity-20" />
                         <p>Canvas Empty</p>
                         <p className="text-sm">Ask AI to "Add a temperature gauge" or use Toolbox</p>
                     </div>
                 )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
