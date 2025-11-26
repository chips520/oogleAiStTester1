
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, X, Wand2 } from 'lucide-react';
import { ChatMessage, AutomationProject } from '../types';
import { generateAutomationConfig } from '../services/geminiService';

interface AIAssistantProps {
  currentProject: AutomationProject;
  onConfigGenerated: (config: Partial<AutomationProject>) => void;
  visible: boolean;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  currentProject, 
  onConfigGenerated,
  visible,
  onClose
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Hello! I am AutoFlow AI. I can help you design automation systems instantly.\n\nTry asking:\n• "Create a 5x4 Tray for Output Parts"\n• "Add a start button and a status light"\n• "Read register 4001 and show it on a gauge"'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, visible]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        const generatedConfig = await generateAutomationConfig(userMsg.text, currentProject);
        
        const modelMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: `I've designed a solution with ${generatedConfig.logicSteps?.length || 0} logic steps and ${generatedConfig.uiWidgets?.length || 0} UI widgets. Click apply to visualize it.`
        };
        setMessages(prev => [...prev, modelMsg]);
        
        // Save the config to a temporary state or pass it via callback immediately if preferred
        // Here we attach it to the message object conceptually or just handle via UI button
        (modelMsg as any).config = generatedConfig;

    } catch (e) {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "Sorry, I encountered an error generating the automation configuration."
        }]);
    } finally {
        setIsTyping(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="w-80 bg-[#1e1e1e] border-l border-[#3e3e42] flex flex-col h-full shadow-xl z-20">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42] flex justify-between items-center bg-[#252526]">
        <div className="flex items-center gap-2 font-semibold text-sm text-purple-400">
          <Sparkles size={16} />
          <span>AutoFlow AI</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[90%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#2d2d30] text-gray-200 border border-[#3e3e42]'
              }`}
            >
              {msg.text}
            </div>
            
            {/* Apply Button for Generated Configs */}
            {msg.role === 'model' && (msg as any).config && (
               <button 
                onClick={() => onConfigGenerated((msg as any).config)}
                className="mt-2 flex items-center gap-2 bg-purple-900/50 hover:bg-purple-900 border border-purple-500/30 text-purple-200 px-3 py-1.5 rounded text-xs transition-colors"
               >
                 <Wand2 size={12} />
                 Apply generated Logic & UI
               </button>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-1 pl-2">
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#3e3e42] bg-[#252526]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your automation task..."
            className="w-full bg-[#3c3c3c] text-white text-sm rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#555]"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping}
            className="absolute right-2 top-1.5 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
