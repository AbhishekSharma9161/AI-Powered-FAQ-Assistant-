const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// Get all conversations (with search support)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      // Search conversation titles or message contents
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { 'messages.content': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .select('title messages createdAt updatedAt');
    
    // Format response to include preview of the last message
    const formatted = conversations.map(conv => ({
      _id: conv._id,
      title: conv.title,
      lastMessage: conv.messages[conv.messages.length - 1] || null,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages.length
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get single conversation details
router.get('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation detail:', error);
    res.status(500).json({ error: 'Failed to fetch conversation details' });
  }
});

// Start a new conversation
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const newConversation = new Conversation({
      title: title || 'New Conversation',
      messages: []
    });
    const saved = await newConversation.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Post a new message to a conversation (Interacts with Gemini API)
router.post('/:id/messages', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Add user message to history
    conversation.messages.push({
      role: 'user',
      content: message
    });

    // Update conversation title if it's the first message and still has default title
    if (conversation.messages.filter(m => m.role === 'user').length === 1 && conversation.title === 'New Conversation') {
      // Use the first few words of the user's message as the title
      const words = message.split(' ').slice(0, 5).join(' ');
      conversation.title = words.length > 30 ? words.slice(0, 27) + '...' : words;
    }

    // Call Gemini API
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Return a simulated response if API key is not configured yet
      const fallbackResponse = `This is a simulated AI response. Please configure a valid GEMINI_API_KEY in the server/.env file. You asked: "${message}"`;
      conversation.messages.push({
        role: 'model',
        content: fallbackResponse
      });
      await conversation.save();
      return res.json(conversation);
    }

    // Retrieve chat history to pass to Gemini API for context
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Format chat history for Gemini API API
    // Gemini expects: role: "user" | "model", parts: [{ text: "..." }]
    const contents = conversation.messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Generate content
    const chat = model.startChat({
      history: contents.slice(0, contents.length - 1), // history excluding the latest user message
    });

    const result = await chat.sendMessage(message);
    const aiResponseText = result.response.text();

    // Add AI response to history
    conversation.messages.push({
      role: 'model',
      content: aiResponseText
    });

    await conversation.save();
    res.json(conversation);
  } catch (error) {
    console.error('Error in chat generation:', error);
    res.status(500).json({ error: 'AI generation failed: ' + error.message });
  }
});

// Delete a conversation
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Conversation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

module.exports = router;
