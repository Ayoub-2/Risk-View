from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.encoders import jsonable_encoder
from jose import jwt, JWTError
from datetime import datetime
from app.core.config import settings
from app.db import database as db
from app.db.schemas import EbiosAssessmentInput
from app.services import risk_model
import json

router = APIRouter()
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
        # Convert record to dict
        return dict(user)
    except JWTError:
        raise credentials_exception

@router.get("/annexes")
async def get_ebios_annexes():
    return risk_model.EBIOS_ANNEXES

@router.post("/assess")
async def create_assessment(data: EbiosAssessmentInput, user: dict = Depends(get_current_user)):
    scenarios = [s.dict() for s in data.scenarios]
    treatments = [t.dict() for t in data.treatments]
    
    risk_results = risk_model.calculate_ebios_risk(scenarios, treatments)

    assessment_data = {
        "context_description": data.context_description,
        "baseline_controls": [c.dict() for c in data.baseline_controls],
        "risk_origins": [ro.dict() for ro in data.risk_origins],
        "scenarios": scenarios,
        "treatments": treatments,
        "average_initial_risk": risk_results["average_initial_risk"],
        "average_residual_risk": risk_results["average_residual_risk"],
        "risk_results": risk_results
    }

    try:
        async with db.db.pool.acquire() as conn:
            row = await conn.fetchrow(
                "INSERT INTO assessments (user_id, system_name, created_at, data) VALUES ($1, $2, $3, $4) RETURNING id",
                user['id'],
                data.system_name,
                datetime.utcnow(),
                assessment_data
            )
            inserted_id = row['id']
            
        return {
            "id": str(inserted_id),
            "average_initial_risk": risk_results["average_initial_risk"],
            "average_residual_risk": risk_results["average_residual_risk"],
            "details": risk_results
        }
    except Exception as e:
        print(f"DB Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while saving assessment")

@router.get("/assessments")
async def get_assessments(user: dict = Depends(get_current_user)):
    try:
        results = []
        async with db.db.pool.acquire() as conn:
            records = await conn.fetch("SELECT id, system_name, created_at, data FROM assessments WHERE user_id = $1 ORDER BY created_at DESC", user['id'])
            
        for record in records:
            doc = dict(record['data'])
            doc["_id"] = str(record['id'])
            doc["system_name"] = record['system_name']
            doc["user_id"] = str(user['id'])
            doc["created_at"] = record['created_at'].isoformat()
            results.append(doc)
            
        return results
    except Exception as e:
        print(f"DB Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while retrieving assessments")

@router.put("/assess/{id}")
async def update_assessment(id: int, data: EbiosAssessmentInput, user: dict = Depends(get_current_user)):
    scenarios = [s.dict() for s in data.scenarios]
    treatments = [t.dict() for t in data.treatments]
    
    risk_results = risk_model.calculate_ebios_risk(scenarios, treatments)

    assessment_data = {
        "context_description": data.context_description,
        "baseline_controls": [c.dict() for c in data.baseline_controls],
        "risk_origins": [ro.dict() for ro in data.risk_origins],
        "scenarios": scenarios,
        "treatments": treatments,
        "average_initial_risk": risk_results["average_initial_risk"],
        "average_residual_risk": risk_results["average_residual_risk"],
        "risk_results": risk_results
    }

    try:
        async with db.db.pool.acquire() as conn:
            existing = await conn.fetchrow("SELECT id FROM assessments WHERE id = $1 AND user_id = $2", id, user['id'])
            if not existing:
                raise HTTPException(status_code=404, detail="Assessment not found or unauthorized")
                
            await conn.execute(
                "UPDATE assessments SET system_name = $1, data = $2 WHERE id = $3",
                data.system_name,
                assessment_data,
                id
            )
            
        return {
            "id": str(id),
            "average_initial_risk": risk_results["average_initial_risk"],
            "average_residual_risk": risk_results["average_residual_risk"],
            "details": risk_results
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"DB Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while updating assessment")

@router.get("/assessments/{id}")
async def get_assessment_by_id(id: int, user: dict = Depends(get_current_user)):
    try:
        async with db.db.pool.acquire() as conn:
            record = await conn.fetchrow("SELECT id, system_name, created_at, data FROM assessments WHERE id = $1 AND user_id = $2", id, user['id'])
            
        if not record:
            raise HTTPException(status_code=404, detail="Assessment not found or unauthorized")
            
        doc = dict(record['data'])
        doc["_id"] = str(record['id'])
        doc["system_name"] = record['system_name']
        doc["user_id"] = str(user['id'])
        doc["created_at"] = record['created_at'].isoformat()
            
        return doc
    except HTTPException:
        raise
    except Exception as e:
        print(f"DB Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while retrieving assessment")
