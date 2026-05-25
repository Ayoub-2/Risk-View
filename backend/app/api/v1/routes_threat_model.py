from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field
from typing import List, Optional
from app.api.dependencies import get_current_user, get_permitted_assessment_record

router = APIRouter()

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class ThreatModelChatPayload(BaseModel):
    history: List[ChatMessage] = []
    message: str
    threat_model: Optional[dict] = None

@router.post("/assessments/{id}/threat-model/ai-chat")
async def chat_threat_assistant(
    id: int,
    payload: ThreatModelChatPayload,
    user: dict = Depends(get_current_user),
    accept_language: str = Header(None)
):
    # Verify workspace permissions (Contributor or Owner required to interact/view)
    assessment_record, role = await get_permitted_assessment_record(id, user["id"], write_required=False)
    
    # Resolve Dynamic Language Resolution
    lang = "fr"
    if accept_language and "en" in accept_language.lower():
        lang = "en"
        
    query = payload.message.lower()
    threat_model = payload.threat_model or {}
    assets = threat_model.get("assets", [])
    flows = threat_model.get("flows", [])
    
    response_text = ""
    suggestions = []
    
    # Heuristic Engine: Determine if user requests a full STRIDE/PASTA analysis
    if any(k in query for k in ["stride", "analyse", "analys", "generer", "generate", "savoir"]):
        if not assets:
            if lang == "fr":
                response_text = "Je n'ai détecté aucun composant dans votre modèle. Veuillez ajouter des actifs (ex. Base de données, API Gateway) dans le volet de modélisation pour que je puisse lancer l'analyse STRIDE."
            else:
                response_text = "I did not detect any components in your model. Please add assets (e.g., Database, API Gateway) in the modeling panel so that I can initiate the STRIDE threat analysis."
        else:
            # Automate STRIDE Heuristics
            threat_details = []
            suggested_idx = 1
            
            for asset in assets:
                name = asset.get("name", "Asset")
                a_type = asset.get("asset_type", "").lower()
                isolated = asset.get("is_isolated", False)
                
                if "db" in a_type or "databas" in a_type or "donnee" in a_type:
                    # Tampering & Information Disclosure threats on Database
                    t_str = f"- **[T-I] {name} (Database):** "
                    if lang == "fr":
                        t_str += "Exposition à l'Exfiltration d'informations ou à l'Altération non autorisée."
                        if not isolated:
                            t_str += " **Alerte Sécurité:** Ce composant n'est pas isolé! Risque élevé de vol direct en cas de compromission d'une Gateway."
                    else:
                        t_str += "Exposed to Information Exfiltration or Unauthorized Tampering."
                        if not isolated:
                            t_str += " **Security Alert:** This component is not isolated! High risk of direct exfiltration if a Gateway is compromised."
                    threat_details.append(t_str)
                    
                    suggestions.append({
                        "id": f"T{suggested_idx}",
                        "name": f"Exfiltration DB - {name}" if lang == "fr" else f"DB Exfiltration - {name}",
                        "description": f"Exfiltration de données sensibles stockées dans {name} suite à une mauvaise isolation réseau." if lang == "fr" else f"Exfiltration of sensitive data stored in {name} due to poor network isolation.",
                        "business_asset": "Données sensibles / Métier" if lang == "fr" else "Sensitive / Business Data",
                        "supporting_asset": name,
                        "vulnerability": "Absence d'isolation réseau (subnet privé) ou chiffrement au repos" if lang == "fr" else "Lack of network isolation (private subnet) or encryption at rest",
                        "likelihood": 3 if not isolated else 1,
                        "impact": 3
                    })
                    suggested_idx += 1
                    
                elif "api" in a_type or "gate" in a_type or "rout" in a_type:
                    # Spoofing & Denial of Service threats on API/Gateway
                    t_str = f"- **[S-D] {name} (API/Gateway):** "
                    if lang == "fr":
                        t_str += "Risque d'Usurpation d'identité (Spoofing) ou d'Interruption de service (DDoS)."
                    else:
                        t_str += "Risk of Identity Spoofing or Denial of Service (DDoS)."
                    threat_details.append(t_str)
                    
                    suggestions.append({
                        "id": f"T{suggested_idx}",
                        "name": f"Usurpation - {name}" if lang == "fr" else f"Spoofing - {name}",
                        "description": f"Un attaquant contourne les authentifications pour injecter des requêtes sur {name}." if lang == "fr" else f"An attacker bypasses authentication to inject calls on {name}.",
                        "business_asset": "Flux de transactions" if lang == "fr" else "Transaction flows",
                        "supporting_asset": name,
                        "vulnerability": "Absence de validation stricte MFA / Signature JWT" if lang == "fr" else "Absence of strict MFA validation / JWT Signature checking",
                        "likelihood": 2,
                        "impact": 3
                    })
                    suggested_idx += 1
                    
                elif "web" in a_type or "ui" in a_type or "front" in a_type or "app" in a_type:
                    # Spoofing & Elevation of Privilege on Web Interfaces
                    t_str = f"- **[S-E] {name} (WebApp):** "
                    if lang == "fr":
                        t_str += "Vulnérabilités de type Session Hijacking ou Élévation de privilèges."
                    else:
                        t_str += "Vulnerable to Session Hijacking or Elevation of Privilege."
                    threat_details.append(t_str)
                    
                    suggestions.append({
                        "id": f"T{suggested_idx}",
                        "name": f"Élévation de privilèges - {name}" if lang == "fr" else f"Privilege Escalation - {name}",
                        "description": f"Contournement du contrôle d'accès sur l'application {name} pour obtenir des droits administrateur." if lang == "fr" else f"Access control bypass on {name} to obtain administrative privileges.",
                        "business_asset": "Droits administratifs" if lang == "fr" else "Administrative rights",
                        "supporting_asset": name,
                        "vulnerability": "Authentification insuffisante ou contrôle RBAC non vérifié côté serveur" if lang == "fr" else "Insufficient authentication or unverified server-side RBAC control",
                        "likelihood": 2,
                        "impact": 4
                    })
                    suggested_idx += 1
            
            # Analyze boundary crossings
            boundary_flows = [f for f in flows if f.get("crosses_boundary", False)]
            if boundary_flows:
                t_str = ""
                if lang == "fr":
                    t_str = f"\n⚠️ **Analyse de Frontière:** J'ai détecté {len(boundary_flows)} flux traversant une frontière de confiance. Assurez-vous d'implémenter un protocole cryptographique fort (ex. HTTPS/TLS 1.3) pour éliminer le risque d'écoute clandestine (Information Disclosure)."
                else:
                    t_str = f"\n⚠️ **Boundary Alert:** I detected {len(boundary_flows)} data flows crossing a trust boundary. Ensure strong cryptographic protocols (e.g., HTTPS/TLS 1.3) are implemented to block eavesdropping (Information Disclosure)."
                threat_details.append(t_str)
            
            if lang == "fr":
                response_text = f"### 🛡️ Rapport d'Analyse des Menaces STRIDE\n\nBasé sur votre modèle de {len(assets)} actifs et {len(flows)} flux de données, voici mes conclusions d'expert GRC :\n\n"
                response_text += "\n".join(threat_details)
                response_text += "\n\n💡 *Recommandation:* J'ai préparé des suggestions de scénarios EBIOS basés sur cette analyse. Cliquez sur **'Importer'** ci-dessous pour les ajouter à votre Workspace EBIOS RM."
            else:
                response_text = f"### 🛡️ STRIDE Threat Modeling Expert Report\n\nBased on your model of {len(assets)} assets and {len(flows)} flows, here are my GRC expert conclusions:\n\n"
                response_text += "\n".join(threat_details)
                response_text += "\n\n💡 *Recommendation:* I have prepared EBIOS risk scenarios based on this analysis. Click **'Import'** below to instantly map them to your EBIOS RM Workspace."
    
    # Specific custom queries handles
    elif any(k in query for k in ["postgres", "database", "bd"]):
        if lang == "fr":
            response_text = "### 💾 Sécurisation de Base de Données\nPour sécuriser un actif Base de Données (Database) :\n1. **Isolation stricte:** Ne l'exposez jamais publiquement. Placez-la dans un sous-réseau privé.\n2. **Chiffrement au repos (AES-256):** Empêche le vol de disque physique (Mitige le vol de données).\n3. **Gestion des privilèges:** Utilisez des rôles d'accès restreints avec mots de passe robustes (Least Privilege)."
        else:
            response_text = "### 💾 Database Security Hardening\nTo secure a Database asset:\n1. **Strict isolation:** Never expose it publicly. Keep it strictly inside a private subnet.\n2. **Encryption at rest (AES-256):** Blocks physical disk theft vectors (mitigates information leakage).\n3. **Privileges management:** Restrict login rights using minimal permissions (Least Privilege)."
    
    elif any(k in query for k in ["pasta", "method"]):
        if lang == "fr":
            response_text = "### 🍝 Méthodologie PASTA\nLa méthodologie **PASTA** (Process for Attack Simulation and Threat Analysis) est une approche axée sur les risques :\n1. Elle s'aligne parfaitement sur les **Workshops EBIOS RM** en se concentrant sur les objectifs métiers (Workshop 1) et en simulant les attaques contre les biens supports (Workshop 3 & 4).\n2. Elle permet d'identifier l'intention de l'attaquant avant de définir les mesures correctives."
        else:
            response_text = "### 🍝 PASTA Threat Modeling Methodology\n**PASTA** (Process for Attack Simulation and Threat Analysis) is a risk-centric framework:\n1. It maps perfectly to **EBIOS RM Workshops** by focusing on business objectives first (Workshop 1) and simulating technical attacks against supporting assets (Workshops 3 & 4).\n2. It prioritizes understanding threat actor intent before selecting security treatments."

    # General greetings or fallback answers
    else:
        if lang == "fr":
            response_text = "Bonjour! Je suis votre **Assistant IA Modélisation des Menaces**. \n\nJe peux analyser votre diagramme technique d'actifs, y détecter des risques STRIDE, et générer des scénarios d'évaluation EBIOS RM. \n\n*Essayez de me demander :* \n- **'Lancer une analyse STRIDE'**\n- **'Comment sécuriser ma base de données ?'**\n- **'C'est quoi la méthodologie PASTA ?'**"
        else:
            response_text = "Hello! I am your **AI Threat Modeling Assistant**. \n\nI can analyze your asset flows, identify STRIDE threat vectors, and automatically generate corresponding EBIOS RM risk scenarios. \n\n*Try asking me:* \n- **'Run a STRIDE analysis'**\n- **'How to secure my database?'**\n- **'What is the PASTA framework?'**"

    return {
        "role": "assistant",
        "content": response_text,
        "suggestions": suggestions
    }
