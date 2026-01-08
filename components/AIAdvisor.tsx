import React, { useState, useEffect, useRef } from 'react';
import { generateBeautyAdvice } from '../services/geminiService';
import { ChatMessage, Product } from '../types';
import { getSystemInstruction } from '../constants';

interface AIAdvisorProps {
  products: Product[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ products }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello, beautiful! I'm Rumi, your personal beauty advisor. Whether you're looking for the perfect shade or skincare tips, I'm here to help. What can I do for you today?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Create a placeholder for the AI response
    const responseId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: responseId,
      role: 'model',
      text: '',
      isStreaming: true
    }]);

    const systemInstruction = getSystemInstruction(products);

    try {
      await generateBeautyAdvice(
        messages.map(m => ({ role: m.role, text: m.text })),
        userMessage.text,
        systemInstruction,
        (streamedText) => {
          setMessages(prev => prev.map(msg => 
            msg.id === responseId 
              ? { ...msg, text: streamedText }
              : msg
          ));
        }
      );
      
      // Mark streaming as done
      setMessages(prev => prev.map(msg => 
        msg.id === responseId 
          ? { ...msg, isStreaming: false }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === responseId 
          ? { ...msg, text: "I'm having a little trouble connecting to my beauty knowledge right now. Please try again in a moment!", isStreaming: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto bg-white shadow-xl rounded-b-xl overflow-hidden border-x border-b border-stone-100">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-rumi-100 to-white p-6 border-b border-stone-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-rumi-200 flex items-center justify-center border-2 border-white shadow-sm">
          <i className="fa-solid fa-wand-magic-sparkles text-rumi-600 text-xl"></i>
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-900">Rumi Beauty Advisor</h2>
          <p className="text-sm text-stone-500">Powered by Gemini AI</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-stone-900 text-white rounded-br-none' 
                  : 'bg-white text-stone-800 rounded-bl-none border border-stone-100'
              }`}
            >
              {msg.role === 'model' && msg.text === '' && msg.isStreaming ? (
                 <div className="flex space-x-1 items-center h-6">
                    <div className="w-2 h-2 bg-rumi-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-rumi-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-rumi-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed prose-sm prose-p:my-1">
                  {msg.text}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-100">
        <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about shades, ingredients, or application tips..."
              className="w-full pl-4 pr-12 py-4 rounded-xl border border-stone-200 focus:border-rumi-500 focus:ring-1 focus:ring-rumi-500 focus:outline-none resize-none bg-stone-50 min-h-[60px] max-h-[120px]"
              rows={1}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className={`h-[60px] w-[60px] flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isLoading || !inputText.trim() 
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                : 'bg-rumi-600 text-white hover:bg-rumi-700 shadow-md'
            }`}
          >
            {isLoading ? (
               <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
               <i className="fa-solid fa-paper-plane"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};