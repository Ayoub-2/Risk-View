from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings
from app.db import database as db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception

        async with db.db.pool.acquire() as conn:
            user = await conn.fetchrow("SELECT * FROM users WHERE email = $1", email)

        if user is None:
            raise credentials_exception

        return dict(user)
    except JWTError:
        raise credentials_exception


async def get_owned_assessment_record(assessment_id: int, user_id: int):
    async with db.db.pool.acquire() as conn:
        record = await conn.fetchrow(
            "SELECT id, user_id, system_name, created_at, data FROM assessments WHERE id = $1 AND user_id = $2",
            assessment_id,
            user_id,
        )

    if not record:
        raise HTTPException(status_code=404, detail="Assessment not found or unauthorized")

    return record


async def get_permitted_assessment_record(assessment_id: int, user_id: int, write_required: bool = False):
    async with db.db.pool.acquire() as conn:
        record = await conn.fetchrow(
            "SELECT id, user_id, system_name, created_at, data FROM assessments WHERE id = $1",
            assessment_id
        )
        
        if not record:
            raise HTTPException(status_code=404, detail="Assessment not found")
            
        if record["user_id"] == user_id:
            return record, "Owner"
            
        share = await conn.fetchrow(
            "SELECT role FROM workspace_shares WHERE assessment_id = $1 AND user_id = $2",
            assessment_id,
            user_id
        )
        
        if not share:
            raise HTTPException(status_code=404, detail="Assessment not found or unauthorized")
            
        role = share["role"]
        
        if write_required and role == "Auditor":
            raise HTTPException(status_code=403, detail="Forbidden: Read-only auditor cannot modify this assessment")
            
        return record, role


def serialize_assessment_record(record, role="Owner"):
    doc = dict(record["data"])
    doc["_id"] = str(record["id"])
    doc["user_id"] = str(record["user_id"])
    doc["system_name"] = record["system_name"]
    doc["created_at"] = record["created_at"].isoformat()
    doc["role"] = role
    return doc