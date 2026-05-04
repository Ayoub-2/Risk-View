from fastapi import APIRouter, HTTPException

from app.db import database as db
from app.db.schemas import UserCreate, UserLogin, Token
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

# --- Register Endpoint ---

@router.post("/register")
async def register(data: UserCreate):
    try:
        async with db.db.pool.acquire() as conn:
            existing = await conn.fetchrow("SELECT * FROM users WHERE email = $1", data.email)
            if existing:
                raise HTTPException(status_code=400, detail="User already exists")

            hashed_pw = hash_password(data.password)
            await conn.execute("INSERT INTO users (email, hashed_password) VALUES ($1, $2)", data.email, hashed_pw)
        return {"msg": "User registered successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"DB Error: {str(e)}") # Log securely without exposing to user
        raise HTTPException(status_code=500, detail="Internal server error")

# --- Login Endpoint ---

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    try:
        async with db.db.pool.acquire() as conn:
            user_in_db = await conn.fetchrow("SELECT * FROM users WHERE email = $1", user.email)
        
        # Prevent timing attacks by always hashing something if user doesn't exist
        if not user_in_db:
            hash_password(user.password)
            raise HTTPException(status_code=400, detail="Invalid credentials")
            
        if not verify_password(user.password, user_in_db['hashed_password']):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        token = create_access_token({"sub": user.email})
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"DB Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
