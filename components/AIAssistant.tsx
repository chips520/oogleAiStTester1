import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { ChatMessage } from '../types';
import { generateCodeAssistance } from '../services/geminiService';

interface AIAssistantProps {
  currentCode: string;
  onCodeGenerated: (code: string) => void;
  visible: boolean;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  currentCode, 
  onCodeGenerated,
  visible,
  onClose
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Hello! I am your Modbus .NET expert. I can help you write code to read registers, write coils, or handle connection logic. What do you need?'
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

    // Call API
    const responseText = await generateCodeAssistance(userMsg.text, currentCode);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);
  };

  if (!visible) return null;

  return (
    <div className="w-80 bg-[#1e1e1e] border-l border-[#3e3e42] flex flex-col h-full shadow-xl z-20">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42] flex justify-between items-center bg-[#252526]">
        <div className="flex items-center gap-2 font-semibold text-sm text-purple-400">
          <Sparkles size={16} />
          <span>Gemini Copilot</span>
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
            {msg.role === 'model' && msg.text.includes('class') && (
               <button 
                onClick={() => onCodeGenerated(msg.text)} // Simple approach: just replace code or append
                className="mt-2 text-xs text-green-400 hover:text-green-300 underline cursor-pointer"
               >
                 Insert Code to Editor
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
            placeholder="Ask for Modbus logic..."
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