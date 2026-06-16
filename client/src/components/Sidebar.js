'use client';

import { useState } from 'react';
import { Plus, Search, Trash2, MessageSquare, Menu, X } from 'lucide-react';

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  searchQuery,
  setSearchQuery,
  isOpen,
  setIsOpen
}) {
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1E293B] text-gray-200 rounded-lg border border-gray-700 shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0F172A] border-r border-[#1E293B] flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:h-screen`}
      >
        {/* Header / New Chat */}
        <div className="p-4 flex flex-col gap-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-violet-500/20">
              AI
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              FAQ Assistant
            </span>
          </div>

          <button
            onClick={() => {
              onNewChat();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-violet-600/15 hover:shadow-violet-600/30 border border-violet-500/30"
          >
            <Plus size={18} />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1E293B]/50 hover:bg-[#1E293B]/80 focus:bg-[#1E293B] text-gray-200 placeholder-gray-400 border border-[#2D3748] focus:border-violet-500 rounded-xl outline-none transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 py-2 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm px-4">
              No conversations found.
            </div>
          ) : (
            conversations.map((chat) => {
              const isActive = chat._id === activeId;
              return (
                <div
                  key={chat._id}
                  className={`group relative flex items-center justify-between rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 text-white font-medium'
                      : 'text-gray-400 hover:bg-[#1E293B]/40 hover:text-gray-200 border border-transparent'
                  }`}
                  onClick={() => {
                    onSelect(chat._id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden pr-8">
                    <MessageSquare
                      size={18}
                      className={isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-400'}
                    />
                    <div className="truncate text-sm">
                      {chat.title}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(chat._id);
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gray-500 transition-all duration-150"
                    title="Delete Chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E293B] text-xs text-gray-500 flex justify-between items-center bg-[#0B0F19]">
          <span>MERN Chatbot v1.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
}
