import bcrypt
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

# Create database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Registration API")

# Allow the Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://authbridge.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def get_user_or_404(user_id: int, db: Session) -> models.User:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@app.get("/")
def root():
    return {"message": "Registration API is running"}


# ── AUTH ─────────────────────────────────────────────────────────────────────

@app.post("/api/login", response_model=schemas.UserResponse)
def login_user(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not bcrypt.checkpw(credentials.password.encode(), user.hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return user


# ── CREATE ──────────────────────────────────────────────────────────────────

@app.post("/api/register", response_model=schemas.UserResponse, status_code=201)
def register_user(user: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hash_password(user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ── READ ─────────────────────────────────────────────────────────────────────

@app.get("/api/users", response_model=list[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


@app.get("/api/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return get_user_or_404(user_id, db)


# ── FULL UPDATE (PUT) ─────────────────────────────────────────────────────────

@app.put("/api/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, data: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = get_user_or_404(user_id, db)

    existing = db.query(models.User).filter(
        models.User.email == data.email, models.User.id != user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already in use.")

    user.full_name = data.full_name
    user.email = data.email
    db.commit()
    db.refresh(user)
    return user


# ── PARTIAL UPDATE (PATCH) ───────────────────────────────────────────────────

@app.patch("/api/users/{user_id}", response_model=schemas.UserResponse)
def partial_update_user(user_id: int, data: schemas.UserPartialUpdate, db: Session = Depends(get_db)):
    user = get_user_or_404(user_id, db)

    if data.email and data.email != user.email:
        existing = db.query(models.User).filter(
            models.User.email == data.email
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already in use.")

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.email is not None:
        user.email = data.email
    if data.password is not None:
        user.hashed_password = hash_password(data.password)

    db.commit()
    db.refresh(user)
    return user


# ── DELETE ────────────────────────────────────────────────────────────────────

@app.delete("/api/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_or_404(user_id, db)
    db.delete(user)
    db.commit()


# ── TEST ENDPOINTS (learning / dev only) ─────────────────────────────────────

@app.get("/api/test-error")
def test_500():
    raise Exception("Deliberate test error — used to verify 500 handling.")
