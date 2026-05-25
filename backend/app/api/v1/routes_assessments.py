from fastapi import APIRouter, Depends, HTTPException, Header
from datetime import datetime
from app.db import database as db
from app.db.schemas import EbiosAssessmentInput, WorkspaceShareInput
from app.api.dependencies import get_current_user, get_owned_assessment_record, serialize_assessment_record, get_permitted_assessment_record
from app.services import risk_model

router = APIRouter()

@router.get("/annexes")
async def get_ebios_annexes(lang: str = None, accept_language: str = Header(None)):
    resolved_lang = "fr"
    if lang:
        resolved_lang = lang.lower()
    elif accept_language:
        if "en" in accept_language.lower():
            resolved_lang = "en"
    return risk_model.get_localized_annexes(resolved_lang)

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
        "risk_results": risk_results,
        "soa_justifications": data.soa_justifications or {}
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
            records = await conn.fetch(
                """
                SELECT a.id, a.user_id, a.system_name, a.created_at, a.data,
                       CASE 
                           WHEN a.user_id = $1 THEN 'Owner'
                           ELSE s.role
                       END as active_role
                FROM assessments a
                LEFT JOIN workspace_shares s ON a.id = s.assessment_id AND s.user_id = $1
                WHERE a.user_id = $1 OR s.user_id = $1
                ORDER BY a.created_at DESC
                """,
                user['id']
            )
            
        for record in records:
            results.append(serialize_assessment_record(record, role=record["active_role"]))
            
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
        "risk_results": risk_results,
        "soa_justifications": data.soa_justifications or {}
    }

    try:
        # Check permissions using our new helper with write_required=True
        await get_permitted_assessment_record(id, user['id'], write_required=True)

        async with db.db.pool.acquire() as conn:
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
        record, role = await get_permitted_assessment_record(id, user['id'], write_required=False)
        return serialize_assessment_record(record, role=role)
    except HTTPException:
        raise
    except Exception as e:
        print(f"DB Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while retrieving assessment")

@router.get("/assessments/{id}/shares")
async def get_assessment_shares(id: int, user: dict = Depends(get_current_user)):
    try:
        await get_owned_assessment_record(id, user['id'])
        
        async with db.db.pool.acquire() as conn:
            shares = await conn.fetch(
                """
                SELECT s.id, s.user_id, u.email, s.role
                FROM workspace_shares s
                JOIN users u ON s.user_id = u.id
                WHERE s.assessment_id = $1
                """,
                id
            )
            
        return [
            {
                "id": s["id"],
                "user_id": s["user_id"],
                "email": s["email"],
                "role": s["role"]
            }
            for s in shares
        ]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Share fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching shares")

@router.post("/assessments/{id}/share")
async def share_assessment(id: int, share_data: WorkspaceShareInput, user: dict = Depends(get_current_user)):
    try:
        await get_owned_assessment_record(id, user['id'])
        
        async with db.db.pool.acquire() as conn:
            target_user = await conn.fetchrow("SELECT id FROM users WHERE email = $1", share_data.email)
            if not target_user:
                raise HTTPException(status_code=404, detail="Utilisateur avec cet e-mail introuvable.")
                
            target_user_id = target_user["id"]
            
            if target_user_id == user['id']:
                raise HTTPException(status_code=400, detail="Vous ne pouvez pas partager le projet avec vous-même.")
                
            await conn.execute(
                """
                INSERT INTO workspace_shares (assessment_id, user_id, role)
                VALUES ($1, $2, $3)
                ON CONFLICT (assessment_id, user_id)
                DO UPDATE SET role = EXCLUDED.role
                """,
                id,
                target_user_id,
                share_data.role
            )
            
        return {"status": "success", "message": f"Projet partagé avec {share_data.email} ({share_data.role})"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Share error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while sharing workspace")

@router.delete("/assessments/{id}/share/{share_id}")
async def revoke_assessment_share(id: int, share_id: int, user: dict = Depends(get_current_user)):
    try:
        await get_owned_assessment_record(id, user['id'])
        
        async with db.db.pool.acquire() as conn:
            await conn.execute(
                "DELETE FROM workspace_shares WHERE id = $1 AND assessment_id = $2",
                share_id,
                id
            )
            
        return {"status": "success", "message": "Accès collaborateur révoqué avec succès."}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Share revoke error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while revoking share")
