import React from 'react';

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  fileName: string;
}

export const Editor: React.FC<EditorProps> = ({ code, onChange, fileName }) => {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4]">
      {/* Tab Header */}
      <div className="flex bg-[#252526] border-b border-[#3e3e42]">
        <div className="px-4 py-2 bg-[#1e1e1e] border-t-2 border-blue-500 text-sm flex items-center gap-2">
          <span className="text-blue-400">#</span>
          {fileName}
          <span className="ml-2 hover:bg-[#333] rounded-full p-0.5 cursor-pointer text-gray-400">×</span>
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full p-4 bg-transparent text-sm font-mono leading-6 resize-none outline-none border-none z-10 text-transparent caret-white"
          spellCheck={false}
          style={{ 
            color: 'transparent', 
            caretColor: 'white',
            background: 'transparent'
          }}
        />
        {/* Syntax Highlighting Simulation (Background Layer) */}
        <pre 
          className="absolute inset-0 w-full h-full p-4 bg-[#1e1e1e] text-sm font-mono leading-6 pointer-events-none whitespace-pre-wrap break-all"
          aria-hidden="true"
        >
          {code.split('\n').map((line, i) => (
            <div key={i} className="w-full">
              {/* Simple heuristic coloring */}
              {line.split(' ').map((word, j) => {
                 let color = '#d4d4d4'; // Default
                 if (['using', 'namespace', 'public', 'class', 'static', 'void', 'string', 'int', 'var', 'async', 'await', 'return'].includes(word)) color = '#569cd6';
                 else if (word.startsWith('//')) color = '#6a9955';
                 else if (word.includes('"')) color = '#ce9178';
                 else if (['Console', 'ModbusClient', 'TcpClient'].some(c => word.includes(c))) color = '#4ec9b0';
                 else if (['Connect', 'ReadHoldingRegisters', 'WriteSingleRegister', 'WriteLine'].some(f => word.includes(f))) color = '#dcdcaa';
                 
                 // Handle comment rest of line roughly
                 if (line.trim().startsWith('//')) color = '#6a9955';

                 return <span key={j} style={{ color }}>{word} </span>;
              })}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};