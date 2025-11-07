# 🧠 Omniscient - Universal AI Knowledge Base

A powerful AI-powered knowledge base that lets you upload documents, process them with AI, and query them using natural language.

## 🚀 Features

- **Multi-format Support**: PDF, DOCX, TXT, MD, CSV, XLSX, PPTX, Images
- **AI-Powered Search**: Natural language queries with Gemini 2.5 Flash/Pro
- **Semantic Search** (Phase 2): Vector embeddings for intelligent document matching
- **Source Citations**: Every answer includes source documents
- **Smart Chunking**: Documents are intelligently split for better retrieval
- **Real-time Processing**: Background document processing with status updates
- **Modern UI**: Beautiful, responsive interface with drag-and-drop upload

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (for database and storage)
- Google Gemini API key

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
# Install all dependencies
npm run install:all
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `database/schema.sql`
3. Get your Supabase URL and API keys from Settings > API

### 3. Environment Configuration

**Backend** (`backend/.env`):
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
ENABLE_EMBEDDINGS=false
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

**Model Options:**
- `GEMINI_MODEL`: `gemini-2.5-flash` (fast, recommended), `gemini-2.5-pro` (more powerful), or `gemini-2.0-flash`
- `GEMINI_EMBEDDING_MODEL`: `text-embedding-004` (recommended), `gemini-embedding-001`, or `embedding-gecko-001`
- `ENABLE_EMBEDDINGS`: Set to `true` to enable semantic search (requires running `database/embeddings_setup.sql`)

**Frontend**: No environment variables needed (uses proxy to backend)

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `backend/.env`

### 5. Create Upload Directory

```bash
mkdir backend/uploads
```

### 6. Run the Application

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

## 📁 Project Structure

```
knowledgebaseAI/
├── backend/
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── uploads/         # Uploaded files (gitignored)
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   └── App.jsx      # Main app
│   └── vite.config.js
├── database/
│   └── schema.sql       # Database schema
└── README.md
```

## 🎯 Current Phase: Phase 1 (MVP) + Phase 2 (Semantic Search)

✅ **Completed:**
- File upload with drag-and-drop
- Text extraction (PDF, DOCX, TXT, MD)
- Document storage and listing
- Basic keyword search
- AI chat interface with Gemini 2.5 Flash/Pro
- Source citations
- **Semantic search with embeddings** (Phase 2 - optional)
- **Vector similarity search** (Phase 2 - optional)

🚧 **Coming in Phase 3:**
- Excel/CSV data extraction and querying
- PowerPoint slide extraction
- Image OCR and vision analysis
- Code file parsing with syntax awareness

## 🔧 API Endpoints

- `POST /api/upload` - Upload a document
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete a document
- `POST /api/chat` - Send a chat message
- `GET /api/health` - Health check

## 📝 Usage

1. **Upload Documents**: Drag and drop files or click "Upload"
2. **Wait for Processing**: Documents are processed in the background
3. **Select Documents** (optional): Click documents to include in queries
4. **Ask Questions**: Type natural language questions in the chat
5. **View Sources**: Click on source citations to see where answers came from

## 🐛 Troubleshooting

**Upload fails:**
- Check file size (max 50MB default)
- Verify file type is supported
- Check backend logs for errors

**Processing stuck:**
- Check Supabase connection
- Verify Gemini API key is valid
- Check backend console for errors

**No search results:**
- Ensure documents are processed (green checkmark)
- Try different keywords
- Check if document has extractable text

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with React, Express, Supabase, and Google Gemini AI
- Inspired by the need for intelligent document management

