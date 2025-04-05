from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from resolvers import auth, register, user, business

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(register.router)
app.include_router(user.router, prefix="/user")
app.include_router(business.router, prefix="/business")

@app.get("/")
async def root():
    return {"message": "Hello World"}

