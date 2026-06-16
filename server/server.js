const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables at the very beginning
dotenv.config({ path: path.resolve(__dirname, '.env') });

const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Routes
app.use('/api/conversations', chatRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'AI-Powered FAQ Assistant API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      conversations: '/api/conversations'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-chatbot';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connection established successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    console.log('Server is starting anyway (API key or database might be configured later).');
    
    // Start server anyway so the user can access frontend and we can configure details
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (Database disconnected)`);
    });
  }
};

startServer();
