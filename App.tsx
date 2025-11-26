
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { VisualEditor } from './components/Editor';
import { Console } from './components/Console';
import { AIAssistant } from './components/AIAssistant';
import { ModbusConfig, LogEntry, LogLevel, AutomationProject, LogicStep, StepType, WidgetType } from './types';
import { PanelRightOpen } from 'lucide-react';

const INITIAL_PROJECT: AutomationProject = {
  logicSteps: [
    { 
      id: '1', 
      type: 'MODBUS_READ', 
      name: 'Scan Sensors', 
      params: { address: 4001, count: 20, storeToVar: 'trayData' } 
    },
    {
      id: '2',
      type: 'DELAY',
      name: 'Wait Cycle',
      params: { ms: 1000 }
    }
  ],
  scripts: [
    {
      id: 'scr_fill',
      name: 'FillRandom',
      lastModified: Date.now(),
      content: `// Simulate adding parts to the tray
log("Adding part to tray...");
const tray = variables.trayData;
// Find first empty slot (0)
const emptyIdx = tray.indexOf(0);

if (emptyIdx !== -1) {
  tray[emptyIdx] = 1; // Set to OK
  log("Filled slot " + emptyIdx);
} else {
  log("Tray is full!", "WARNING");
}
variables.trayData = [...tray]; // Trigger React update
`
    },
    {
      id: 'scr_reset',
      name: 'ResetTray',
      lastModified: Date.now(),
      content: `log("Resetting all tray data...");
variables.trayData = Array(20).fill(0);
variables.robotActive = false;
log("Reset Complete", "SUCCESS");
`
    }
  ],
  uiWidgets: [
    { 
      id: 'w1', 
      type: 'TRAY', 
      label: 'Input Tray A', 
      variableName: 'trayData',
      x: 0, y: 0, w: 2, h: 3,
      rows: 5, cols: 4
    },
    {
        id: 'w_btn_add',
        type: 'BUTTON',
        label: 'Add Part (Script)',
        x: 2, y: 0, w: 1, h: 1,
        events: { onClick: 'scr_fill' }
    },
    {
        id: 'w_btn_rst',
        type: 'BUTTON',
        label: 'Reset All (Script)',
        x: 3, y: 0, w: 1, h: 1,
        events: { onClick: 'scr_reset' }
    },
    {
        id: 'w3',
        type: 'INDICATOR',
        label: 'Robot Arm',
        variableName: 'robotActive',
        x: 2, y: 1, w: 1, h: 1
    }
  ],
  variables: {
      trayData: Array(20).fill(0), // 5x4 = 20 slots
      robotActive: false
  }
};

const App: React.FC = () => {
  const [project, setProject] = useState<AutomationProject>(INITIAL_PROJECT);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showAI, setShowAI] = useState(true);
  
  const [modbusConfig, setModbusConfig] = useState<ModbusConfig>({
    ipAddress: '192.168.1.10',
    port: 502,
    slaveId: 1
  });

  const runnerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLog = (message: string, level: LogLevel = LogLevel.INFO) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  // --- Script Engine ---
  const executeScript = (scriptId: string, contextVars: Record<string, any>) => {
      const script = project.scripts.find(s => s.id === scriptId);
      if (!script) {
          addLog(`Script ID ${scriptId} not found`, LogLevel.ERROR);
          return;
      }

      try {
          // Create a safe-ish function wrapper
          // We pass 'variables' by reference so script can modify them
          const func = new Function('variables', 'log', 'modbus', script.content);
          
          func(
              contextVars, 
              (msg: string, levelStr?: string) => {
                   const lvl = levelStr === 'ERROR' ? LogLevel.ERROR : 
                               levelStr === 'WARNING' ? LogLevel.WARNING : 
                               levelStr === 'SUCCESS' ? LogLevel.SUCCESS : LogLevel.INFO;
                   addLog(msg, lvl);
              },
              { ...modbusConfig } // Mock modbus access
          );
      } catch (e: any) {
          addLog(`Script Error [${script.name}]: ${e.message}`, LogLevel.ERROR);
      }
  };

  // --- Runtime Engine ---
  const executeStep = async (step: LogicStep, vars: Record<string, any>) => {
    switch(step.type) {
      case 'MODBUS_READ':
        // Simulation: Just a placeholder in this version as Scripts are doing the heavy lifting
        break;
      
      case 'MODBUS_WRITE':
        addLog(`[MODBUS] Writing ${step.params.value} to Address ${step.params.address}`, LogLevel.SUCCESS);
        break;

      case 'LOG':
        let msg = step.params.message || '';
        Object.keys(vars).forEach(key => {
            if (typeof vars[key] !== 'object') {
                msg = msg.replace(`{${key}}`, vars[key]);
            }
        });
        addLog(msg, LogLevel.INFO);
        break;

      case 'DELAY':
        await new Promise(r => setTimeout(r, step.params.ms || 500));
        break;

      case 'SCRIPT_CALL':
          if (step.params.scriptId) {
              executeScript(step.params.scriptId, vars);
          }
          break;
    }
  };

  const runEngineLoop = async () => {
    if (!isRunning) return;

    // Execute one full pass of the Logic Steps
    const currentVars = { ...project.variables };
    
    for (const step of project.logicSteps) {
      if (!isRunning) break; // Check interrupt
      await executeStep(step, currentVars);
    }

    // Update Project State with new Variable values (to update UI)
    setProject(prev => ({ ...prev, variables: currentVars }));
    
    // Loop again if still running
    if (isRunning) {
        runnerRef.current = setTimeout(() => runEngineLoop(), 100); 
    }
  };

  // Start/Stop Handler
  useEffect(() => {
    if (isRunning) {
      addLog("System Started.", LogLevel.SUCCESS);
      runEngineLoop();
    } else {
      if (runnerRef.current) clearTimeout(runnerRef.current);
      addLog("System Stopped.", LogLevel.WARNING);
    }
    return () => {
      if (runnerRef.current) clearTimeout(runnerRef.current);
    };
  }, [isRunning]);

  const handleRun = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);

  // Manual Trigger (e.g. from UI Button click)
  const handleManualScriptRun = (scriptId: string) => {
      const currentVars = { ...project.variables };
      executeScript(scriptId, currentVars);
      setProject(prev => ({ ...prev, variables: currentVars }));
  };

  // --- Builder Helpers ---
  const handleAddStep = (type: StepType) => {
    const newStep: LogicStep = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        name: `New ${type}`,
        params: {}
    };
    
    // Set default params
    if (type === 'MODBUS_READ') newStep.params = { address: 0, count: 1, storeToVar: 'var1' };
    if (type === 'DELAY') newStep.params = { ms: 1000 };
    if (type === 'LOG') newStep.params = { message: 'Value is {var1}' };

    setProject(prev => ({
        ...prev,
        logicSteps: [...prev.logicSteps, newStep]
    }));
  };

  const handleAddWidget = (type: WidgetType) => {
      const newWidget: React.ComponentProps<any> = { 
          id: Math.random().toString(36).substr(2, 9),
          type,
          label: `New ${type}`,
          x: 0, y: 0, w: 2, h: 2,
          variableName: ''
      };

      if (type === 'TRAY') {
          newWidget.w = 2;
          newWidget.h = 3;
          newWidget.rows = 5;
          newWidget.cols = 4;
          newWidget.variableName = 'trayData'; // default bind
      }

      setProject(prev => ({
          ...prev,
          uiWidgets: [...prev.uiWidgets, newWidget]
      }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-gray-200">
      <Sidebar 
        isRunning={isRunning} 
        onRun={handleRun} 
        onStop={handleStop}
        config={modbusConfig}
        onConfigChange={setModbusConfig}
        onAddStep={handleAddStep}
        onAddWidget={handleAddWidget}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            {/* Main Visual Editor */}
            <VisualEditor 
              project={project}
              onUpdateProject={(p) => setProject(prev => ({...prev, ...p}))}
              readOnly={isRunning}
              onRunScript={handleManualScriptRun}
            />
            
            <div className="h-[25%] min-h-[150px]">
              <Console logs={logs} onClear={() => setLogs([])} />
            </div>
          </div>

          {!showAI && (
             <button 
                onClick={() => setShowAI(true)}
                className="w-8 border-l border-[#3e3e42] bg-[#252526] flex flex-col items-center py-4 hover:bg-[#333] transition-colors gap-4"
                title="Open AI Assistant"
             >
                <PanelRightOpen size={20} className="text-gray-400" />
                <span className="writing-vertical-lr text-xs text-gray-500 uppercase tracking-widest rotate-180">AI Architect</span>
             </button>
          )}

          <AIAssistant 
            visible={showAI} 
            onClose={() => setShowAI(false)}
            currentProject={project}
            onConfigGenerated={(config) => {
                setProject(prev => ({
                    ...prev,
                    logicSteps: config.logicSteps || prev.logicSteps,
                    scripts: config.scripts ? [...prev.scripts, ...config.scripts] : prev.scripts,
                    uiWidgets: config.uiWidgets || prev.uiWidgets,
                    variables: {
                        ...prev.variables,
                        // Initialize any bound variables for new trays
                        ...(config.uiWidgets || []).reduce((acc, w) => {
                            if (w.type === 'TRAY' && w.variableName) {
                                acc[w.variableName] = Array((w.rows || 3) * (w.cols || 3)).fill(0);
                            }
                            return acc;
                        }, {} as Record<string, any>)
                    }
                }));
            }}
          />
        </div>
      </div>
      
       <div className="fixed bottom-4 right-4 z-50">
        <button 
            onClick={() => (window as any).aistudio?.openSelectKey()}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-all text-xs font-bold"
            title="Configure API Key"
        >
            KEY
        </button>
      </div>
    </div>
  );
};

export default App;
