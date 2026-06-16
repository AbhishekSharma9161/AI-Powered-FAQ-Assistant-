# AI-Powered FAQ Assistant

A premium, modern AI Chatbot application built using the MERN stack (Next.js, Node.js, Express, MongoDB) integrated with Google's Gemini AI. The application features user conversation session tracking, search functionalities, fully responsive layouts, and containerized deployment with Docker.

## 🌟 Features

- 💬 **Interactive AI Chat**: Real-time FAQ answers using Google's free-to-use **Gemini 1.5 Flash** model.
- 💾 **Conversation History**: All chats are automatically saved to MongoDB with titles, messages, and timestamps.
- 🔍 **Search Engine**: Instantly search through previous conversations or individual message content.
- 🌗 **Premium Dark Mode**: Built with custom glassmorphic styling, rich space-black backgrounds (`#0B0F19`), and vibrant gradient highlights.
- 📱 **Responsive Design**: Mobile-friendly UI with an interactive sidebar.
- 🐋 **Docker Support**: Run the entire application (including MongoDB) with a single command.

---

## 🛠️ Architecture and Stack Decisions

1. **Frontend: Next.js (App Router)**
   - Utilizes CSS variables and Tailwind CSS v4 for clean, cohesive layout tokens.
   - Built reusable state-driven components (`Sidebar` and `ChatArea`) to manage layout changes dynamically.
   - Local state keeps track of scroll locations, active conversation IDs, and loading animations.

2. **Backend: Node.js & Express.js**
   - Separate Express server allows decoupling of backend business logic from frontend layout rendering.
   - Clean, modular routes manage conversation lifecycle: CRUD operations for `/api/conversations`.

3. **Database: MongoDB (Mongoose)**
   - Used Mongoose schemas to store a nested message history array within a conversation document, enabling proper context retention for Gemini.
   - Pre-save middlewares handle automated `updatedAt` field updates, ensuring search/history lists stay sorted in reverse-chronological order.

4. **AI: Google Gemini AI**
   - Configured using `@google/generative-ai`.
   - Passes the full context array (chat history) during conversation continuation to ensure the model retains conversation memory.

---

## ⚙️ Setup and Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (either local instance running on port 27017 or a MongoDB Atlas URI)
- [Gemini API Key](https://aistudio.google.com/) (Generate a free API key inside Google AI Studio)

### Environment Configuration

Create a file named `.env` in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-chatbot
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🚀 Running the Application

### Option A: Standard Node Local Execution

You can run both client and server concurrently using the root package runner:

1. **Install all dependencies** (at root, server, and client directories):
   ```bash
   npm run install-all
   ```
2. **Start Development Servers** (launches Next.js on port 3000 and Express on port 5000):
   ```bash
   npm run dev
   ```

### Option B: Individual Service Execution

If you prefer running them in separate terminals:

**Backend Server:**
```bash
cd server
npm install
npm run dev
```

**Frontend Client:**
```bash
cd client
npm install
npm run dev
```

---

## 🐋 Option C: Docker Container Setup (Recommended)

To run the entire app (including database setup) without needing Node.js or MongoDB installed locally:

1. Make sure Docker Desktop is running.
2. In the root directory, create a `.env` file containing your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Run the containers:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📊 API Reference

### Conversations

* **Get all conversations**
  `GET /api/conversations?search=query`
  *Returns list of conversations sorted by updatedAt. Optionally filters by title or message content.*

* **Get conversation details**
  `GET /api/conversations/:id`
  *Returns single conversation document with message history.*

* **Start new conversation**
  `POST /api/conversations`
  *Initializes a new empty conversation session.*

* **Send message / Add context**
  `POST /api/conversations/:id/messages`
  *Accepts JSON `{ "message": "your question" }`. Sends history context + new question to Gemini and returns the updated conversation document containing the AI's response.*

* **Delete conversation**
  `DELETE /api/conversations/:id`
  *Deletes a conversation from history.*
