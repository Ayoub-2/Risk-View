from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# EBIOS RM Workshop 1: Context & Baseline
class BaselineControl(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    implemented: bool

# EBIOS RM Workshop 2: Risk Origins & Target Objectives
class RiskOrigin(BaseModel):
    source_type: str = Field(..., min_length=1, max_length=100) # e.g., Cybercriminal, State Actor
    motivation: str = Field(..., max_length=500)
    target_objective: str = Field(..., max_length=500) # e.g., Data Theft, Sabotage

# EBIOS RM Workshop 3 & 4: Strategic & Operational Scenarios
class RiskScenario(BaseModel):
    id: str = Field(..., description="Unique scenario ID")
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=1000)
    risk_origin_idx: int = Field(..., description="Index of the Risk Origin from Workshop 2")
    business_asset: str = Field(..., max_length=200)
    supporting_asset: str = Field(..., max_length=200)
    vulnerability: str = Field(..., max_length=500)
    likelihood: int = Field(..., ge=1, le=4)
    impact: int = Field(..., ge=1, le=4)

# EBIOS RM Workshop 5: Risk Treatment
class RiskTreatment(BaseModel):
    scenario_id: str
    decision: str = Field(..., description="Accept, Reduce, Transfer, Avoid")
    security_measure: str = Field(..., max_length=1000)
    residual_likelihood: int = Field(..., ge=1, le=4)
    residual_impact: int = Field(..., ge=1, le=4)

# Aggregate Assessment Input
class EbiosAssessmentInput(BaseModel):
    system_name: str = Field(..., min_length=1, max_length=255)
    context_description: str = Field(..., max_length=2000)
    baseline_controls: List[BaselineControl] = Field(default_factory=list, max_length=100)
    risk_origins: List[RiskOrigin] = Field(default_factory=list, max_length=50)
    scenarios: List[RiskScenario] = Field(default_factory=list, max_length=100)
    treatments: List[RiskTreatment] = Field(default_factory=list, max_length=100)

# For user registration/login
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

# For token response
class Token(BaseModel):
    access_token: str
    token_type: str
