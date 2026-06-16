'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Terminal, ChevronRight } from 'lucide-react';

// Simple helper to render bold text, paragraphs, and code blocks in AI responses
function renderContent(content) {
  if (!content) return null;

  // Split by code blocks ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const lines = part.slice(3, -3).trim().split('\n');
      const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
      const code = language ? lines.slice(1).join('\n') : lines.join('\n');

      return (
        <div key={index} className="my-4 rounded-xl overflow-hidden border border-[#2D3748] bg-[#0F172A] shadow-lg font-mono text-sm">
          {language && (
            <div className="bg-[#1E293B] px-4 py-1.5 flex justify-between items-center text-xs text-gray-400 border-b border-[#2D3748]">
              <div className="flex items-center gap-1.5">
                <Terminal size={12} className="text-violet-400" />
                <span>{language}</span>
              </div>
            </div>
          )}
          <pre className="p-4 overflow-x-auto text-gray-300">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // Split by inline code `
    const inlineParts = part.split(/(`[^`]+`)/g);
    const inlineFormatted = inlineParts.map((ip, ipIndex) => {
      if (ip.startsWith('`') && ip.endsWith('`')) {
        return (
          <code key={ipIndex} className="px-1.5 py-0.5 bg-[#1E293B] text-violet-300 rounded font-mono text-xs border border-[#2D3748]">
            {ip.slice(1, -1)}
          </code>
        );
      }

      // Split by bold **
      const boldParts = ip.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, bpIndex) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return <strong key={bpIndex} className="text-white font-semibold">{bp.slice(2, -2)}</strong>;
        }
        return bp;
      });
    });

    return (
      <p key={index} className="leading-relaxed whitespace-pre-wrap mb-2">
        {inlineFormatted}
      </p>
    );
  });
}

const SUGGESTIONS = [
  { text: "What is an API, and how does it work?", category: "General" },
  { text: "Explain the difference between SQL and NoSQL databases.", category: "Databases" },
  { text: "How do I implement JWT authentication in Express.js?", category: "Security" },
  { text: "What are React Server Components?", category: "Frontend" }
];

export default function ChatArea({
  conversation,
  onSendMessage,
  loading,
  activeId
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0B0F19] text-gray-200 relative h-screen md:h-auto">
      {/* Top Bar */}
      <div className="h-16 border-b border-[#1E293B] px-6 flex items-center justify-between bg-[#0F172A]/70 backdrop-blur-md sticky top-0 z-10 pl-16 md:pl-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-violet-400" size={20} />
          <h1 className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-xl">
            {conversation ? conversation.title : 'Welcome Assistant'}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#1E293B] px-2.5 py-1 rounded-full border border-gray-700">
          <Sparkles size={12} className="text-yellow-400" />
          <span>Gemini AI Active</span>
        </div>
      </div>

      {/* Messages / Welcome View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        {!conversation || conversation.messages.length === 0 ? (
          <div className="max-w-2xl mx-auto py-12 flex flex-col justify-center items-center text-center h-full">
            {/* Header Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-violet-600/30 blur-2xl rounded-full w-24 h-24 -translate-x-4"></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg relative border border-violet-500/30">
                <Bot size={32} className="text-white animate-pulse" />
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-white mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              How can I help you today?
            </h2>
            <p className="text-gray-400 mb-8 max-w-md text-sm">
              Ask anything about web development, APIs, databases, or software engineering. Your conversation will be securely stored.
            </p>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {SUGGESTIONS.map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => onSendMessage(sug.text)}
                  className="p-4 bg-[#1E293B]/40 hover:bg-[#1E293B]/70 border border-[#2D3748] hover:border-violet-500/40 rounded-xl cursor-pointer transition-all duration-200 group flex justify-between items-center"
                >
                  <div>
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider block mb-1">
                      {sug.category}
                    </span>
                    <p className="text-sm text-gray-300 font-medium group-hover:text-white">
                      {sug.text}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-500 group-hover:text-violet-400 transition-colors ml-2 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {conversation.messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg._id || index}
                  className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Bot Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center border border-violet-500/30 shadow-md shadow-violet-500/10 flex-shrink-0 mt-1">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md border text-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-500/20'
                        : 'bg-[#1E293B]/50 text-gray-200 border-[#2D3748]'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      renderContent(msg.content)
                    )}
                    <span
                      className={`text-[10px] block mt-1.5 text-right ${
                        isUser ? 'text-violet-200' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-[#2D3748] flex items-center justify-center border border-gray-600 flex-shrink-0 mt-1">
                      <User size={16} className="text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Loading State */}
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center border border-violet-500/30 flex-shrink-0 mt-1">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-[#1E293B]/50 border border-[#2D3748] rounded-2xl px-5 py-4 shadow-md flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 sm:p-6 border-t border-[#1E293B] bg-[#0F172A]/70 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your question here..."
            disabled={loading}
            className="w-full pl-4 pr-12 py-3 bg-[#1E293B]/70 focus:bg-[#1E293B] text-gray-200 placeholder-gray-400 border border-[#2D3748] focus:border-violet-500 rounded-xl outline-none transition-all duration-200 resize-none max-h-36 shadow-inner text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow shadow-violet-500/20"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-500 mt-2">
          Responses powered by Gemini 2.5 Flash. All FAQ chats are automatically saved.
        </p>
      </div>
    </div>
  );
}
