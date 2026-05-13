# Semantic Memory AI Assistant

A full-stack, containerized AI assistant that learns from conversations using semantic memory. It extracts user preferences in the background and retrieves relevant past interactions to maintain long-term context.

---

## Key Features

- **Long-Term Memory**: Saves chat history into ChromaDB and retrieves relevant past context via vector search.
- **Automated Inferences**: A background task analyzes conversations to extract and permanently store user preferences and facts.
- **Data Isolation**: JWT-based authentication ensures each user's data and memories are strictly segregated.
- **Real-Time Streaming**: Server-Sent Events (SSE) provide instant, ChatGPT-like token streaming.
- **Dockerized**: Fully containerized setup (Frontend, Backend, Postgres, ChromaDB) via `docker-compose`.

---

## Tech Stack

### Backend

- **FastAPI** (Python)
- **PostgreSQL** & **SQLAlchemy** (User data and conversations)
- **ChromaDB** (Vector database for semantic memory)
- **OpenAI API** (`gpt-4o-mini` & `text-embedding-3-small`)
- **JWT Authentication** & **Bcrypt**

### Frontend

- **React 18** & **TypeScript** (built with Vite)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)

### Testing

- **pytest** & **pytest-asyncio**
- **FastAPI TestClient**
- **In-memory SQLite** (for isolated db testing)

---

## Running with Docker (Recommended)

### Prerequisites

- Docker and Docker Compose
- [OpenAI API Key](https://platform.openai.com/api-keys)

### Setup

1. Clone the repository and navigate to the root directory.
2. Export your OpenAI API Key:

   ```bash
   # Windows (PowerShell)
   $env:OPENAI_API_KEY="sk-your-openai-key-here"
   
   # Linux/macOS
   export OPENAI_API_KEY="sk-your-openai-key-here"
   ```

3. Build and start the containers:

   ```bash
   docker-compose up --build -d
   ```

**Access the application:**

- **Frontend UI**: [http://localhost](http://localhost)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

To stop the application: `docker-compose down`

---

## Manual Local Setup

### 1. Database

Ensure PostgreSQL is running locally and create a database named `asistente_memoria`.

### 2. Backend

Navigate to `backend/` and create a `.env` file:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/asistente_memoria
OPENAI_API_KEY=sk-your-openai-key-here
SECRET_KEY=your-secure-jwt-secret-key
CHROMA_PERSIST_DIR=./chroma_data
```

Install dependencies and run:

```bash
cd backend
python -m venv myvenv
# Activate virtual environment
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend

Navigate to `frontend/`. Create a `.env` file if your API runs on a different port:

```env
VITE_API_URL=http://localhost:8000
```

Install and run:

```bash
cd frontend
pnpm install
pnpm run dev
```

---

## Key API Endpoints

- `POST /auth/register` - Create an account.
- `POST /auth/login` - Authenticate and get JWT.
- `POST /chat` - Stream AI response with injected semantic memory.
- `GET /profile/inferences` - Fetch extracted user facts.
- `DELETE /profile/inferences/{id}` - Delete a specific fact.

---

## Future Deployment

The application is fully containerized and production-ready. A cloud deployment strategy is currently being planned to host the application live on the web, taking full advantage of the robust `docker-compose` orchestration for easy scaling and portability.

## License

This project is open-source and available under the MIT License.
