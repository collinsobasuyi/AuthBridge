from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext

import models
import schemas
from database import engine, get_db

# Create database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Registration API")

# Allow the Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@app.get("/")
def root():
    return {"message": "Registration API is running"}


@app.post("/api/register", response_model=schemas.UserResponse, status_code=201)
def register_user(user: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Hash the password before storing it
    hashed_password = pwd_context.hash(user.password)

    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
