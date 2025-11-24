from fastapi import FastAPI, APIRouter
from data import data_router
from data import postmark_router
from operations_router import operations_router
from fastapi.middleware.cors import CORSMiddleware

# Load .env (if present) so os.getenv can read local env vars during development
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://localhost:5173/",
]

any_port_localhost_regex = r"^http:\/\/localhost:\d+$" 

app.add_middleware(
    CORSMiddleware,
    # allow_origins=origins,
    allow_origin_regex=any_port_localhost_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(data_router.data_router)
app.include_router(postmark_router.postmark_router)
app.include_router(operations_router)

@app.get("/operations/checked-in-users")
async def get_checked_in_users():
    # This wrapper function is defined in index.py
    from index import get_all_checked_in_users
    return {"checked_in_ids": get_all_checked_in_users()}