from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
import io
from fpdf import FPDF
from app.api.dependencies import get_current_user, get_owned_assessment_record, serialize_assessment_record

router = APIRouter()

# ✅ JSON EXPORT
@router.get("/assessments/{id}/export/json")
async def export_json(id: int, user: dict = Depends(get_current_user)):
    try:
        record = await get_owned_assessment_record(id, user["id"])
        assessment = serialize_assessment_record(record)
        return JSONResponse(content=assessment)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Export Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during export")

# ✅ PDF EXPORT
@router.get("/assessments/{id}/export/pdf")
async def export_pdf(id: int, user: dict = Depends(get_current_user)):
    try:
        record = await get_owned_assessment_record(id, user["id"])
        assessment = serialize_assessment_record(record)

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, txt="EBIOS RM Security Risk Assessment Report", ln=True, align="C")
        pdf.ln(5)
        
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, txt=f"System: {assessment.get('system_name', 'N/A')}", ln=True)
        pdf.set_font("Arial", '', 10)
        pdf.cell(0, 10, txt=f"Date: {assessment.get('created_at', 'N/A')}", ln=True)
        pdf.ln(5)

        # Workshop 1
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, txt="Workshop 1: Context & Security Baseline", ln=True)
        pdf.set_font("Arial", '', 10)
        pdf.multi_cell(0, 10, f"Context: {assessment.get('context_description', '')}")
        for c in assessment.get('baseline_controls', []):
            status = "Implemented" if c.get('implemented') else "Not Implemented"
            pdf.cell(0, 8, txt=f"- {c.get('name')}: {status}", ln=True)
        pdf.ln(5)

        # Workshop 2
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, txt="Workshop 2: Risk Origins & Target Objectives", ln=True)
        pdf.set_font("Arial", '', 10)
        for ro in assessment.get('risk_origins', []):
            pdf.multi_cell(0, 8, f"Source: {ro.get('source_type')} | Motivation: {ro.get('motivation')} | Target: {ro.get('target_objective')}")
        pdf.ln(5)

        # Workshop 3 & 4
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, txt="Workshops 3 & 4: Scenarios", ln=True)
        pdf.set_font("Arial", '', 10)
        for s in assessment.get('scenarios', []):
            pdf.multi_cell(0, 8, f"Scenario: {s.get('name')} (Likelihood: {s.get('likelihood')}, Impact: {s.get('impact')})")
            pdf.multi_cell(0, 8, f"  Asset: {s.get('business_asset')} | Supporting: {s.get('supporting_asset')} | Vuln: {s.get('vulnerability')}")
        pdf.ln(5)
        
        # Workshop 5
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, txt="Workshop 5: Risk Treatment", ln=True)
        pdf.set_font("Arial", '', 10)
        for t in assessment.get('treatments', []):
            pdf.multi_cell(0, 8, f"Scenario ID: {t.get('scenario_id')} -> Decision: {t.get('decision')}")
            pdf.multi_cell(0, 8, f"  Measure: {t.get('security_measure')} | Residual L: {t.get('residual_likelihood')}, Residual I: {t.get('residual_impact')}")

        buffer = io.BytesIO()
        pdf_bytes = pdf.output(dest='S').encode('latin1', 'replace')
        buffer.write(pdf_bytes)
        buffer.seek(0)

        return StreamingResponse(buffer, media_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=ebios_report.pdf"
        })
    except HTTPException:
        raise
    except Exception as e:
        print(f"Export Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during PDF generation")
