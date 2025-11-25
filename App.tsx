import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Console } from './components/Console';
import { AIAssistant } from './components/AIAssistant';
import { ModbusConfig, LogEntry, LogLevel } from './types';
import { PanelRightOpen } from 'lucide-react';

const INITIAL_CODE = `using System;
using System.Net.Sockets;
using NModbus;

namespace AutoScript
{
    class Program
    {
        static void Main(string[] args)
        {
            try 
            {
                // Configure connection
                using (TcpClient client = new TcpClient("127.0.0.1", 502))
                {
                    var factory = new ModbusFactory();
                    IModbusMaster master = factory.CreateMaster(client);
                    
                    Console.WriteLine("Connected to Modbus Slave...");

                    // Read Holding Registers (Start Addr: 100, Count: 5)
                    ushort startAddress = 100;
                    ushort numInputs = 5;
                    ushort[] inputs = master.ReadHoldingRegisters(1, startAddress, numInputs);

                    for (int i = 0; i < numInputs; i++)
                    {
                        Console.WriteLine($"Register {startAddress + i}: {inputs[i]}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }
    }
}`;

const App: React.FC = () => {
  const [code, setCode] = useState(INITIAL_CODE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showAI, setShowAI] = useState(true);
  
  const [modbusConfig, setModbusConfig] = useState<ModbusConfig>({
    ipAddress: '192.168.1.10',
    port: 502,
    slaveId: 1
  });

  const addLog = (message: string, level: LogLevel = LogLevel.INFO) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]); // Clear previous logs
    
    addLog("Build started...", LogLevel.INFO);
    
    // Check API Key for AI features (optional but good practice to show integration)
    if (window.aistudio) {
        window.aistudio.hasSelectedApiKey().then(hasKey => {
            if(!hasKey) {
                addLog("Warning: No AI Studio API Key selected. AI features disabled.", LogLevel.WARNING);
            }
        });
    }

    setTimeout(() => {
        addLog("Build succeeded. Starting runtime...", LogLevel.SUCCESS);
        addLog(`Connecting to ${modbusConfig.ipAddress}:${modbusConfig.port} (Slave ID: ${modbusConfig.slaveId})...`, LogLevel.INFO);
        
        // Simulation Logic
        setTimeout(() => {
            // Randomly succeed or fail based on config "simulation"
            if (Math.random() > 0.1) {
                addLog("Connection established.", LogLevel.SUCCESS);
                addLog("Reading Holding Registers [Start: 100, Count: 5]...", LogLevel.INFO);
                
                // Simulate data
                for(let i=0; i<5; i++) {
                    const val = Math.floor(Math.random() * 65535);
                    addLog(`Register ${100 + i}: ${val}`, LogLevel.INFO);
                }
                addLog("Execution finished successfully.", LogLevel.SUCCESS);
            } else {
                addLog("Connection timed out. Target machine actively refused connection.", LogLevel.ERROR);
            }
            setIsRunning(false);
        }, 1500);

    }, 800);
  };

  const handleStop = () => {
    if (!isRunning) return;
    addLog("Execution terminated by user.", LogLevel.WARNING);
    setIsRunning(false);
  };

  // Helper to open API key selector if needed
  useEffect(() => {
    const checkKey = async () => {
        if(window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if(!hasKey) {
                // Don't force open, just leave a button or hint
            }
        }
    }
    checkKey();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden text-gray-200">
      {/* Sidebar */}
      <Sidebar 
        isRunning={isRunning} 
        onRun={handleRun} 
        onStop={handleStop}
        config={modbusConfig}
        onConfigChange={setModbusConfig}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar for Main Area (Optional: Breadcrumbs or Tabs) */}
        
        {/* Workspace Split (Editor + AI/Tools) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Editor Container */}
          <div className="flex-1 flex flex-col min-w-0">
            <Editor 
              code={code} 
              onChange={setCode} 
              fileName="Program.cs"
            />
            {/* Console Panel (Bottom 30%) */}
            <div className="h-[30%] min-h-[150px]">
              <Console logs={logs} onClear={() => setLogs([])} />
            </div>
          </div>

          {/* AI Assistant Toggle Button (if hidden) */}
          {!showAI && (
             <button 
                onClick={() => setShowAI(true)}
                className="w-8 border-l border-[#3e3e42] bg-[#252526] flex flex-col items-center py-4 hover:bg-[#333] transition-colors gap-4"
                title="Open AI Assistant"
             >
                <PanelRightOpen size={20} className="text-gray-400" />
                <span className="writing-vertical-lr text-xs text-gray-500 uppercase tracking-widest rotate-180">AI Copilot</span>
             </button>
          )}

          {/* AI Panel */}
          <AIAssistant 
            visible={showAI} 
            onClose={() => setShowAI(false)}
            currentCode={code}
            onCodeGenerated={(newCode) => {
                // Clean up markdown block if present
                let cleanCode = newCode.replace(/```csharp/g, '').replace(/```/g, '').trim();
                setCode(cleanCode);
            }}
          />
        </div>
      </div>
      
      {/* Floating Action Button for API Key (if necessary, though usually handled by browser extension context, adding explicit button per instructions) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
            onClick={() => window.aistudio?.openSelectKey()}
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