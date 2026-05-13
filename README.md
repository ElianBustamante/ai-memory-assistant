# Semantic Memory AI Assistant

An intelligent, production-ready AI Assistant that actively learns and remembers facts about you across multiple conversations. Designed with a premium, glassmorphic UI and powered by OpenAI, this application uses a Vector Database to recall relevant past interactions, and background jobs to build a persistent profile of your preferences over time.

---

## Key Features

1. **Long-Term Semantic Memory**: Unlike standard LLM chatbots that forget you after you close the tab, this assistant saves your chat history into **ChromaDB**. It retrieves semantically relevant past messages to maintain deep context across sessions.
2. **Automated Background Inferences**: Once you reach a certain threshold of interaction (e.g., chatting across multiple sessions), a background Python task silently analyzes your recent conversations. It extracts high-confidence facts about you (like your profession, hobbies, or preferences) and stores them permanently.
3. **User Data Isolation**: Built for multi-user scale. Complete JWT-based authentication ensures your chat history, vector collections, and inferences are strictly isolated from other users.
4. **Real-time SSE Streaming**: The assistant responds instantly using Server-Sent Events (SSE), streaming tokens exactly like ChatGPT for a seamless user experience.
5. **Modern, Premium UI**: Built with React and Tailwind CSS, featuring dark mode, glassmorphism, fluid animations, and a sleek Authentication screen.

---

## Architecture & Tech Stack

This project is a modern Full-Stack application split into independent microservices.

### Backend (Python / FastAPI)

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) for high-performance, asynchronous endpoints.
- **Relational Database**: **PostgreSQL** (via SQLAlchemy ORM) for structured data (Users, Conversations, and Extracted Inferences).
- **Vector Database**: **ChromaDB** for semantic search and embedding storage. Collections are automatically namespaced by `user_id`.
- **AI Integration**: OpenAI API (`gpt-4o-mini` and `text-embedding-3-small`).
- **Authentication**: OAuth2 with JWT (JSON Web Tokens) and Bcrypt password hashing.

### Frontend (React / TypeScript)

- **Framework**: React 18 built with **Vite**.
- **Styling**: Tailwind CSS with custom global tokens (`index.css`) for a premium aesthetic.
- **Icons**: Lucide React.
- **State Management**: React Context API for global Authentication state.

### Testing (Backend)

- **Framework**: [pytest](https://docs.pytest.org/) and `pytest-asyncio` for robust, asynchronous unit tests.
- **API Testing**: FastAPI's `TestClient` for endpoint validation.
- **Mocking**: Python's native `unittest.mock` to simulate external dependencies (like OpenAI and ChromaDB).
- **Test Database**: In-memory **SQLite** via SQLAlchemy `StaticPool` to ensure clean, isolated database transactions during tests.

---

## Running with Docker (Recommended)

The easiest way to run the entire application is via Docker Compose. This automatically spins up the Frontend, Backend, PostgreSQL database, and ChromaDB persistent storage without needing local installations.

### Prerequisites

- Docker and Docker Compose installed.
- An [OpenAI API Key](https://platform.openai.com/api-keys).

### Steps

1. Clone the repository.
2. Export your OpenAI API Key as an environment variable in your terminal:

   ```bash
   # On Windows (PowerShell)
   $env:OPENAI_API_KEY="sk-your-openai-key-here"
   
   # On Linux/macOS
   export OPENAI_API_KEY="sk-your-openai-key-here"
   ```

3. Build and start the containers in detached mode:

   ```bash
   docker-compose up --build -d
   ```

4. Access the application:
   - **Frontend UI**: [http://localhost](http://localhost) (Served by Nginx on port 80)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) (Interactive Swagger UI)

To stop the application, run:

```bash
docker-compose down
```

*(Note: To completely wipe the database and memory volumes, run `docker-compose down -v`)*

---

## Manual Local Setup

If you prefer to run the services independently for development purposes:

### 1. Database Setup

Ensure you have a local instance of PostgreSQL running. Create a database named `asistente_memoria`.

### 2. Backend Setup

Navigate to the `backend/` folder and create a `.env` file based on `.env.example`:

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
# Activate virtual environment (e.g., .\myvenv\Scripts\Activate on Windows)
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend Setup

Navigate to the `frontend/` folder. Create a `.env` file (optional, defaults to localhost:8000):

```env
VITE_API_URL=http://localhost:8000
```

Install and run:

```bash
cd frontend
pnpm install
pnpm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173).

---

## Key API Endpoints

- `POST /auth/register` - Create a new user account.
- `POST /auth/login` - Authenticate and receive a JWT token.
- `POST /chat` - Send a message to the AI (Requires Auth). Streams the response and includes the retrieved semantic memories in the first chunk.
- `GET /profile/inferences` - Retrieve all the persistent facts the AI has learned about the current user.
- `DELETE /profile/inferences/{id}` - Forget a specific fact.

---

## 🚀 Future Deployment

The application is fully containerized and production-ready. A cloud deployment strategy is currently being planned to host the application live on the web, taking full advantage of the robust `docker-compose` orchestration for easy scaling and portability.

## License

This project is open-source and available under the MIT License.
