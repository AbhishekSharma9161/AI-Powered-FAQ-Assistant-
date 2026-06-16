'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import {
  fetchConversations,
  fetchConversationDetails,
  createConversation,
  sendMessage,
  deleteConversation
} from '@/utils/api';

export default function Home() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load conversation list initially
  useEffect(() => {
    loadConversations();
  }, []);

  // Reload conversation list whenever search query changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadConversations(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Load single conversation details when activeId changes
  useEffect(() => {
    if (activeId) {
      loadConversationDetails(activeId);
    } else {
      setActiveConversation(null);
    }
  }, [activeId]);

  const loadConversations = async (search = '') => {
    try {
      const data = await fetchConversations(search);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadConversationDetails = async (id) => {
    try {
      const data = await fetchConversationDetails(id);
      setActiveConversation(data);
    } catch (error) {
      console.error('Failed to load conversation details:', error);
    }
  };

  const handleNewChat = () => {
    setActiveId(null);
  };

  const handleSendMessage = async (text) => {
    let currentId = activeId;

    try {
      setLoading(true);

      // If no active conversation, create one first
      if (!currentId) {
        const newChat = await createConversation(text.slice(0, 30));
        currentId = newChat._id;
        setActiveId(currentId);
        
        // Add temporary item to conversations list
        setConversations(prev => [
          {
            _id: newChat._id,
            title: text.slice(0, 30),
            lastMessage: null,
            updatedAt: newChat.updatedAt,
            messageCount: 0
          },
          ...prev
        ]);
      }

      // Send the message
      const updatedConv = await sendMessage(currentId, text);
      setActiveConversation(updatedConv);

      // Update conversations list with correct title/lastMessage/updatedAt
      setConversations((prev) =>
        prev.map((c) =>
          c._id === currentId
            ? {
                ...c,
                title: updatedConv.title,
                lastMessage: updatedConv.messages[updatedConv.messages.length - 1],
                updatedAt: updatedConv.updatedAt,
                messageCount: updatedConv.messages.length
              }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    } catch (error) {
      alert(error.message || 'Error occurred while communicating with AI.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeId === id) {
        setActiveId(null);
        setActiveConversation(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-violet-500/20 animate-pulse">
            AI
          </div>
          <p className="text-gray-400 text-sm animate-pulse">Loading assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0F19]">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNewChat={handleNewChat}
        onDelete={handleDeleteConversation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <ChatArea
        conversation={activeConversation}
        onSendMessage={handleSendMessage}
        loading={loading}
        activeId={activeId}
      />
    </div>
  );
}
