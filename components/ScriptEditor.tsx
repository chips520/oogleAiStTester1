
import React, { useState } from 'react';
import { Script } from '../types';
import { FileCode, Plus, Trash2, Save, Play } from 'lucide-react';

interface ScriptEditorProps {
  scripts: Script[];
  onUpdateScripts: (scripts: Script[]) => void;
  onRunScript: (scriptId: string) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ scripts, onUpdateScripts, onRunScript }) => {
  const [activeScriptId, setActiveScriptId] = useState<string | null>(scripts.length > 0 ? scripts[0].id : null);

  const activeScript = scripts.find(s => s.id === activeScriptId);

  const handleUpdateContent = (content: string) => {
    if (!activeScript) return;
    const updated = scripts.map(s => s.id === activeScriptId ? { ...s, content } : s);
    onUpdateScripts(updated);
  };

  const handleUpdateName = (name: string) => {
    if (!activeScript) return;
    const updated = scripts.map(s => s.id === activeScriptId ? { ...s, name } : s);
    onUpdateScripts(updated);
  };

  const handleNewScript = () => {
    const newScript: Script = {
      id: Math.random().toString(36).substr(2, 9),
      name: `script_${scripts.length + 1}`,
      content: '// Access variables using: variables.myVar\n// Log output using: log("message")\n\nlog("Script started...");\n',
      lastModified: Date.now()
    };
    onUpdateScripts([...scripts, newScript]);
    setActiveScriptId(newScript.id);
  };

  const handleDeleteScript = (id: string) => {
    const updated = scripts.filter(s => s.id !== id);
    onUpdateScripts(updated);
    if (activeScriptId === id) {
      setActiveScriptId(updated.length > 0 ? updated[0].id : null);
    }
  };

  return (
    <div className="flex h-full bg-[#1e1e1e] text-[#d4d4d4]">
      {/* Script Explorer Sidebar */}
      <div className="w-48 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
        <div className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
          <span>Explorer</span>
          <button onClick={handleNewScript} className="hover:text-white" title="New Script">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {scripts.map(script => (
            <div 
              key={script.id}
              onClick={() => setActiveScriptId(script.id)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm group ${activeScriptId === script.id ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e]'}`}
            >
              <FileCode size={14} className="text-yellow-500 shrink-0" />
              <span className="truncate flex-1">{script.name}.js</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteScript(script.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {scripts.length === 0 && (
            <div className="p-4 text-xs text-gray-500 text-center">
              No scripts. Click + to create one.
            </div>
          )}
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        {activeScript ? (
          <>
            {/* Toolbar */}
            <div className="h-10 border-b border-[#3e3e42] flex items-center justify-between px-4 bg-[#1e1e1e]">
              <div className="flex items-center gap-2">
                <FileCode size={14} className="text-yellow-500" />
                <input 
                  value={activeScript.name}
                  onChange={(e) => handleUpdateName(e.target.value)}
                  className="bg-transparent border-none text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                />
                <span className="text-gray-500 text-xs">.js</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onRunScript(activeScript.id)}
                  className="flex items-center gap-1.5 text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
                >
                  <Play size={12} /> Run Script
                </button>
              </div>
            </div>

            {/* Editor Input */}
            <div className="flex-1 relative">
              <textarea
                value={activeScript.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
              />
            </div>
            
            {/* Footer / Helper */}
            <div className="px-4 py-1 bg-[#007acc] text-white text-[10px] font-mono flex gap-4">
              <span>Context Available: variables, log(msg), modbus</span>
              <span>Lines: {activeScript.content.split('\n').length}</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <FileCode size={48} className="mb-4 opacity-20" />
            <p>Select or create a script to edit logic.</p>
          </div>
        )}
      </div>
    </div>
  );
};
