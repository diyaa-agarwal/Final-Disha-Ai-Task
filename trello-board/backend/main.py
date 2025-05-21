from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import tasks

app = FastAPI()

# Enable CORS for your React app (change origin to your frontend URL or localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://127.0.0.1:5173",
                   "http://localhost:3000",
                   "http://localhost:5174"],  # or wherever your frontend runs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router, prefix="/api")
