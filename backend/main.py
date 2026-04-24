from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, auth, inferences
from models.database import init_db
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="AI Assistant API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(inferences.router)

@app.get("/")
def read_root():
    return {"message": "AI Assistant Backend is running"}
