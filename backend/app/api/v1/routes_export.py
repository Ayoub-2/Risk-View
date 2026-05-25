from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfgen import canvas
from app.api.dependencies import get_current_user, get_owned_assessment_record, serialize_assessment_record, get_permitted_assessment_record
from app.services import risk_model

router = APIRouter()

# ✅ JSON EXPORT
@router.get("/assessments/{id}/export/json")
async def export_json(id: int, user: dict = Depends(get_current_user)):
    try:
        record, role = await get_permitted_assessment_record(id, user["id"])
        assessment = serialize_assessment_record(record, role=role)
        return JSONResponse(content=assessment)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Export Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during export")


# ✅ DYNAMIC NUMBERED CANVAS (Page X sur Y + Headers/Footers)
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        # We do not draw headers or footers on the cover page (Page 1)
        if self._pageNumber == 1:
            return
            
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#4B5563"))
        
        # Header (Top)
        self.setStrokeColor(colors.HexColor("#E5E7EB"))
        self.setLineWidth(0.5)
        self.line(54, 795, 541, 795)
        self.drawString(54, 802, "RAPPORT D'ÉVALUATION DES RISQUES SÉCURITÉ")
        
        # Footer (Bottom)
        self.line(54, 50, 541, 50)
        self.setFont("Helvetica", 8)
        self.drawString(54, 38, "Méthodologie EBIOS Risk Manager (ANSSI) | Conforme ISO/IEC 27005")
        
        # Right-aligned Page Number
        page_text = f"Page {self._pageNumber} sur {page_count}"
        self.drawRightString(541, 38, page_text)
        self.restoreState()


# ✅ PREMIUM PDF EXPORT (ReportLab platypus flowables)
@router.get("/assessments/{id}/export/pdf")
async def export_pdf(id: int, user: dict = Depends(get_current_user)):
    try:
        record, role = await get_permitted_assessment_record(id, user["id"])
        assessment = serialize_assessment_record(record, role=role)

        # Setup in-memory byte buffer
        buffer = io.BytesIO()
        
        # Document Setup (A4: 595.27 x 841.89 points, 54pt margins = 0.75-inch)
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=54
        )

        # Printable width: 595.27 - 108 = 487.27 pt (Round to 487 pt)
        col_width_487 = 487
        
        # Styles Setup
        styles = getSampleStyleSheet()
        
        # Custom Typography Alignments
        title_style = ParagraphStyle(
            'CoverTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=colors.HexColor('#111827'),
            spaceAfter=15
        )
        
        subtitle_style = ParagraphStyle(
            'CoverSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#F97316'),
            spaceAfter=30
        )
        
        h1_style = ParagraphStyle(
            'CustomH1',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=18,
            textColor=colors.HexColor('#111827'),
            spaceBefore=18,
            spaceAfter=10,
            keepWithNext=True
        )
        
        h2_style = ParagraphStyle(
            'CustomH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#F97316'),
            spaceBefore=12,
            spaceAfter=6,
            keepWithNext=True
        )
        
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#374151'),
            spaceAfter=8
        )
        
        meta_label_style = ParagraphStyle(
            'MetaLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#111827')
        )
        
        meta_val_style = ParagraphStyle(
            'MetaValue',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#4B5563')
        )
        
        th_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.white
        )
        
        td_style = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#1F2937')
        )
        
        td_bold_style = ParagraphStyle(
            'TableCellBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#111827')
        )

        story = []

        # =========================================================================
        # 📘 PAGE 1: COVER PAGE
        # =========================================================================
        story.append(Spacer(1, 40))
        
        # Color bar indicator (EBIOS Orange)
        orange_banner = Table([['']], colWidths=[col_width_487], rowHeights=[6])
        orange_banner.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F97316')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(orange_banner)
        story.append(Spacer(1, 25))

        story.append(Paragraph("RAPPORT D'ÉVALUATION DES RISQUES SÉCURITÉ", title_style))
        story.append(Paragraph("ÉVALUATION CONFORME À LA MÉTHODOLOGIE ANSSI EBIOS RISK MANAGER", subtitle_style))
        
        story.append(Spacer(1, 60))

        # Metadata Card (Single cell styled table)
        meta_data = [
            [Paragraph("Système Évalué :", meta_label_style), Paragraph(assessment.get('system_name', 'N/A'), meta_val_style)],
            [Paragraph("Date du Rapport :", meta_label_style), Paragraph(datetime.now().strftime("%d/%m/%Y à %H:%M"), meta_val_style)],
            [Paragraph("Auteur / Auditeur :", meta_label_style), Paragraph(user.get('email', 'N/A'), meta_val_style)],
            [Paragraph("Statut Global :", meta_label_style), Paragraph("Évaluation Finale", meta_val_style)],
        ]
        
        meta_table = Table(meta_data, colWidths=[130, 317])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F9FAFB')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 16),
            ('RIGHTPADDING', (0,0), (-1,-1), 16),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E5E7EB')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F3F4F6')),
        ]))
        story.append(meta_table)

        story.append(Spacer(1, 140))
        
        # Methodology compliance note
        compliance_text = """<b>Notice Méthodologique :</b> Ce document constitue un livrable d'analyse de risques structurel. 
        Les formules mathématiques de calculs de criticité (Risque Initial et Risque Résiduel) respectent les critères 
        d'évaluation de la vraisemblance (1 à 4) et de la gravité des impacts (1 à 4) recommandés par l'ANSSI (EBIOS RM) 
        et les lignes directrices de la norme internationale ISO/IEC 27005."""
        story.append(Paragraph(compliance_text, body_style))
        
        story.append(PageBreak())

        # =========================================================================
        # 🛠️ WORKSHOP 1: CONTEXT & SECURITY BASELINE
        # =========================================================================
        story.append(Paragraph("Atelier 1 : Cadrage du Contexte & Socle de Sécurité", h1_style))
        story.append(Paragraph("Cet atelier définit le périmètre d'analyse ainsi que les mesures de sécurité de base déjà appliquées ou en cours de déploiement (Socle de Sécurité).", body_style))
        story.append(Spacer(1, 6))

        # System Context description
        story.append(Paragraph("<b>Description du Contexte :</b>", h2_style))
        story.append(Paragraph(assessment.get('context_description', 'Aucune description fournie.'), body_style))
        story.append(Spacer(1, 10))

        story.append(Paragraph("<b>Mesures de Sécurité du Socle (WS1) :</b>", h2_style))
        
        # Workshop 1 Table
        # Cols: Mesure (267), Statut (80), Preuves (140) = 487 pt
        w1_headers = [Paragraph("Mesure de Sécurité", th_style), Paragraph("Statut", th_style), Paragraph("Preuves d'Implémentation", th_style)]
        w1_rows = [w1_headers]
        
        for c in assessment.get('baseline_controls', []):
            status_text = "🟢 Implémentée" if c.get('implemented') else "🔴 Non Implémentée"
            w1_rows.append([
                Paragraph(c.get('name', 'N/A'), td_bold_style),
                Paragraph(status_text, td_style),
                Paragraph(c.get('evidence', 'Aucune preuve fournie') or 'Aucune preuve fournie', td_style)
            ])
            
        w1_table = Table(w1_rows, colWidths=[247, 100, 140])
        w1_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111827')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
        ]))
        story.append(w1_table)
        story.append(Spacer(1, 20))

        # =========================================================================
        # 👥 WORKSHOP 2: RISK ORIGINS & TARGET OBJECTIVES
        # =========================================================================
        story.append(Paragraph("Atelier 2 : Origines du Risque & Objectifs Visés", h1_style))
        story.append(Paragraph("Identification des sources de menaces (acteurs) pouvant cibler le système d'information et caractérisation de leurs motivations stratégiques.", body_style))
        story.append(Spacer(1, 6))

        # Workshop 2 Table
        # Cols: Source (150), Objectif (150), Motivation (187) = 487 pt
        w2_headers = [Paragraph("Source de Menace", th_style), Paragraph("Objectif Visé", th_style), Paragraph("Motivation / Rationale", th_style)]
        w2_rows = [w2_headers]
        
        for ro in assessment.get('risk_origins', []):
            # Translate Threat ID to beautiful label
            source_label = next((ts["label"] for ts in risk_model.EBIOS_ANNEXES["threat_sources"] if ts["id"] == ro.get("source_type")), ro.get("source_type"))
            target_label = next((to["label"] for to in risk_model.EBIOS_ANNEXES["target_objectives"] if to["id"] == ro.get("target_objective")), ro.get("target_objective"))
            
            w2_rows.append([
                Paragraph(source_label, td_bold_style),
                Paragraph(target_label, td_style),
                Paragraph(ro.get('motivation', 'N/A'), td_style)
            ])
            
        w2_table = Table(w2_rows, colWidths=[150, 150, 187])
        w2_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111827')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
        ]))
        story.append(w2_table)
        story.append(Spacer(1, 20))

        # =========================================================================
        # 📊 WORKSHOPS 3 & 4: SCENARIOS & CRITICITY
        # =========================================================================
        story.append(Paragraph("Ateliers 3 & 4 : Scénarios Opérationnels & Risques Initiaux", h1_style))
        story.append(Paragraph("Scénarios d'attaques modélisés à travers les biens supports et actifs métiers, évalués sur une échelle de vraisemblance (V) et de gravité (G) de 1 à 4.", body_style))
        story.append(Spacer(1, 6))

        # Workshop 3/4 Table
        # Cols: ID/Nom (130), Assets/Vuln (237), V (40), G (40), Score (40) = 487 pt
        w3_headers = [
            Paragraph("Scénario / ID", th_style), 
            Paragraph("Biens & Vulnérabilité Exploitée", th_style), 
            Paragraph("V (1-4)", th_style), 
            Paragraph("G (1-4)", th_style), 
            Paragraph("Score Initial", th_style)
        ]
        w3_rows = [w3_headers]
        
        scenarios = assessment.get('scenarios', [])
        for s in scenarios:
            asset_info = f"<b>Bien Métier:</b> {s.get('business_asset')}<br/><b>Support:</b> {s.get('supporting_asset')}<br/><b>Vulnérabilité:</b> {s.get('vulnerability')}"
            initial_score = s.get('likelihood', 1) * s.get('impact', 1)
            
            w3_rows.append([
                Paragraph(f"<b>{s.get('id')}</b>: {s.get('name')}", td_bold_style),
                Paragraph(asset_info, td_style),
                Paragraph(str(s.get('likelihood')), td_style),
                Paragraph(str(s.get('impact')), td_style),
                Paragraph(str(initial_score), td_bold_style)
            ])
            
        w3_table = Table(w3_rows, colWidths=[130, 237, 40, 40, 40])
        
        # Color coding initial risk rows
        w3_style = TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111827')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ])
        
        for idx, s in enumerate(scenarios, start=1):
            score = s.get('likelihood', 1) * s.get('impact', 1)
            if score >= 12:
                # Soft Crimson Red for Critical Risks
                w3_style.add('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#FEE2E2'))
            elif score >= 8:
                # Soft Amber Orange for High/Medium
                w3_style.add('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#FFEDD5'))
            else:
                # Soft Emerald Green for Low/Acceptable
                w3_style.add('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#D1FAE5'))
                
        w3_table.setStyle(w3_style)
        story.append(w3_table)
        story.append(Spacer(1, 20))

        # =========================================================================
        # 🛡️ WORKSHOP 5: RISK TREATMENT & RESIDUAL RISK
        # =========================================================================
        story.append(Paragraph("Atelier 5 : Traitement du Risque & Risque Résiduel", h1_style))
        story.append(Paragraph("Mesures d'atténuation prévues pour réduire l'impact ou la vraisemblance, permettant de recalculer l'exposition résiduelle finale.", body_style))
        story.append(Spacer(1, 6))

        # Workshop 5 Table
        # Cols: ID (30), Décision (55), Mesure/Contrôles (212), Preuves (90), Difficulté (30), R (30), Score (30) = 487 pt
        w5_headers = [
            Paragraph("ID", th_style), 
            Paragraph("Décision", th_style), 
            Paragraph("Mesure de Sécurité & Cartographie", th_style), 
            Paragraph("Preuves Attendues", th_style), 
            Paragraph("Diff.", th_style), 
            Paragraph("G. Rés.", th_style),
            Paragraph("Score Rés.", th_style)
        ]
        w5_rows = [w5_headers]
        
        treatments = assessment.get('treatments', [])
        for t in treatments:
            # Map labels
            iso_label = next((c["label"] for c in risk_model.EBIOS_ANNEXES["iso_controls"] if c["id"] == t.get("iso_control")), t.get("iso_control", ""))
            cis_label = next((c["label"] for c in risk_model.EBIOS_ANNEXES["cis_controls"] if c["id"] == t.get("cis_control")), t.get("cis_control", ""))
            
            mapping_info = ""
            if t.get('iso_control'):
                mapping_info += f"<br/><b>ISO:</b> {iso_label}"
            if t.get('cis_control'):
                mapping_info += f"<br/><b>CIS:</b> {cis_label}"
                
            measure_text = f"<b>Mesure:</b> {t.get('security_measure')}{mapping_info}"
            res_score = t.get('residual_likelihood', 1) * t.get('residual_impact', 1)
            
            w5_rows.append([
                Paragraph(t.get('scenario_id', 'N/A'), td_bold_style),
                Paragraph(t.get('decision', 'Reduce'), td_style),
                Paragraph(measure_text, td_style),
                Paragraph(t.get('evidence', 'Aucune preuve exigée') or 'Aucune preuve exigée', td_style),
                Paragraph(str(t.get('difficulty', 2)), td_style),
                Paragraph(f"L{t.get('residual_likelihood')} x I{t.get('residual_impact')}", td_style),
                Paragraph(str(res_score), td_bold_style)
            ])
            
        w5_table = Table(w5_rows, colWidths=[30, 50, 207, 85, 30, 50, 35])
        
        w5_style = TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111827')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ])
        
        for idx, t in enumerate(treatments, start=1):
            res_score = t.get('residual_likelihood', 1) * t.get('residual_impact', 1)
            if res_score >= 12:
                w5_style.add('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#FEE2E2'))
            elif res_score >= 8:
                w5_style.add('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#FFEDD5'))
            else:
                w5_style.add('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#D1FAE5'))
                
        w5_table.setStyle(w5_style)
        story.append(w5_table)
        story.append(Spacer(1, 25))

        # =========================================================================
        # 📈 EXECUTIVE ANALYTICS SUMMARY
        # =========================================================================
        # Keep together to prevent layout orphan breaks
        summary_flowables = []
        summary_flowables.append(Paragraph("Synthèse & Métriques Générales", h1_style))
        
        # Calculate summary rates
        avg_init = assessment.get('average_initial_risk', 0)
        avg_res = assessment.get('average_residual_risk', 0)
        
        sum_rows = [
            [Paragraph("<b>Indicateur Clé</b>", th_style), Paragraph("<b>Score / Évaluation</b>", th_style)],
            [Paragraph("Risque Initial Moyen (V × G)", td_bold_style), Paragraph(str(avg_init), td_style)],
            [Paragraph("Risque Résiduel Moyen (V × G)", td_bold_style), Paragraph(str(avg_res), td_style)],
            [Paragraph("Objectif de Conformité du Socle (WS1)", td_bold_style), Paragraph(f"{len(assessment.get('baseline_controls', []))} contrôles identifiés", td_style)],
            [Paragraph("Nombre de Scénarios Actifs (WS3/4)", td_bold_style), Paragraph(f"{len(scenarios)} scénarios modélisés", td_style)],
        ]
        
        sum_table = Table(sum_rows, colWidths=[240, 247])
        sum_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111827')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
        ]))
        summary_flowables.append(sum_table)
        
        story.append(KeepTogether(summary_flowables))

        # =========================================================================
        # 🛡️ STATEMENT OF APPLICABILITY (SoA ISO 27001) ANNEX
        # =========================================================================
        story.append(PageBreak())
        
        # Section Title
        story.append(Paragraph("Annexe : Déclaration d'Applicabilité (ISO/IEC 27001:2022)", h1_style))
        story.append(Paragraph(
            "Cette annexe présente l'applicabilité et l'état de conformité des 93 contrôles de l'Annexe A de la norme ISO/IEC 27001:2022. "
            "Les statuts sont déterminés dynamiquement par rapport aux ateliers EBIOS RM en associant les mesures du Socle de Sécurité (Atelier 1) "
            "et les plans de Traitement du Risque (Atelier 5).",
            body_style
        ))
        story.append(Spacer(1, 10))
        
        # Calculate SoA KPI rates
        iso_controls = risk_model.EBIOS_ANNEXES.get("iso_controls", [])
        baseline_controls = assessment.get('baseline_controls', [])
        treatments = assessment.get('treatments', [])
        soa_justifications = assessment.get('soa_justifications', {})
        
        soa_applicable = 0
        soa_implemented = 0
        soa_in_progress = 0
        soa_excluded = 0
        
        for c in iso_controls:
            c_id = c["id"]
            ws1_matches = [bc for bc in baseline_controls if c_id.lower() in bc.get("name", "").lower()]
            matching_treatments = [t for t in treatments if t.get("iso_control") == c_id]
            is_app = len(ws1_matches) > 0 or len(matching_treatments) > 0
            if is_app:
                soa_applicable += 1
                if any(m.get("implemented") for m in ws1_matches):
                    soa_implemented += 1
                else:
                    soa_in_progress += 1
            else:
                soa_excluded += 1
                
        exclusion_rate = round((soa_excluded / len(iso_controls)) * 100) if iso_controls else 0
        
        # Render a beautiful KPI Summary Box
        soa_kpi_data = [
            [
                Paragraph("<b>Contrôles Applicables</b>", td_style),
                Paragraph("<b>Contrôles Implémentés</b>", td_style),
                Paragraph("<b>Contrôles En Cours</b>", td_style),
                Paragraph("<b>Taux d'Exclusion</b>", td_style)
            ],
            [
                Paragraph(f"<font size=12><b>{soa_applicable}</b> / {len(iso_controls)}</font>", td_bold_style),
                Paragraph(f"<font size=12 color='#16A34A'><b>{soa_implemented}</b></font>", td_bold_style),
                Paragraph(f"<font size=12 color='#EA580C'><b>{soa_in_progress}</b></font>", td_bold_style),
                Paragraph(f"<font size=12 color='#4B5563'><b>{exclusion_rate}%</b></font>", td_bold_style)
            ]
        ]
        
        soa_kpi_table = Table(soa_kpi_data, colWidths=[121, 122, 122, 122])
        soa_kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F9FAFB')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E5E7EB')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F3F4F6')),
        ]))
        story.append(soa_kpi_table)
        story.append(Spacer(1, 15))
        
        # Build the SoA table rows
        status_implemented_style = ParagraphStyle(
            'StatusImplemented',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7,
            leading=9,
            textColor=colors.HexColor('#16A34A')
        )
        
        status_inprogress_style = ParagraphStyle(
            'StatusInProgress',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7,
            leading=9,
            textColor=colors.HexColor('#EA580C')
        )
        
        status_excluded_style = ParagraphStyle(
            'StatusExcluded',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=7,
            leading=9,
            textColor=colors.HexColor('#4B5563')
        )
        
        soa_headers = [
            Paragraph("Réf", th_style),
            Paragraph("Intitulé du Contrôle (ISO 27001:2022)", th_style),
            Paragraph("Statut", th_style),
            Paragraph("Justification / Preuves EBIOS RM", th_style)
        ]
        
        soa_rows = [soa_headers]
        soa_table_style = TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111827')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ])
        
        for idx, c in enumerate(iso_controls, start=1):
            c_id = c["id"]
            ws1_matches = [bc for bc in baseline_controls if c_id.lower() in bc.get("name", "").lower()]
            matching_treatments = [t for t in treatments if t.get("iso_control") == c_id]
            is_app = len(ws1_matches) > 0 or len(matching_treatments) > 0
            
            if is_app:
                ws1_implemented = any(m.get("implemented") for m in ws1_matches)
                if ws1_implemented:
                    status_label = "Applicable (Implémenté)"
                    status_p_style = status_implemented_style
                    soa_table_style.add('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#F0FDF4'))
                    first_match = next((m for m in ws1_matches if m.get("implemented")), None)
                    evidence_text = first_match.get("evidence", "Mesure active") if first_match else "Mesure active"
                    justification_text = f"Socle (WS1): {evidence_text}"
                else:
                    status_label = "Applicable (En cours)"
                    status_p_style = status_inprogress_style
                    soa_table_style.add('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#FFF7ED'))
                    if ws1_matches:
                        names = "; ".join([bc.get("name", "") for bc in ws1_matches])
                        justification_text = f"Socle (WS1) - En cours: {names}"
                    else:
                        scenarios_list = ", ".join([t.get("scenario_id", "") for t in matching_treatments])
                        justification_text = f"Traitement (WS5) - Scénario {scenarios_list}"
            else:
                status_label = "Non Applicable"
                status_p_style = status_excluded_style
                soa_table_style.add('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#F9FAFB'))
                justification_text = soa_justifications.get(c_id) or "Non requis pour le traitement des risques identifiés dans le cadre de cette évaluation."
            
            label_text = f"<b>{c['label']}</b><br/><font size=7 color='#6B7280'>💡 {c['guidance']}</font>"
            
            soa_rows.append([
                Paragraph(c_id, td_bold_style),
                Paragraph(label_text, td_style),
                Paragraph(status_label, status_p_style),
                Paragraph(justification_text, td_style)
            ])
            
        soa_main_table = Table(soa_rows, colWidths=[35, 140, 85, 227])
        soa_main_table.setStyle(soa_table_style)
        story.append(soa_main_table)
        story.append(Spacer(1, 20))

        # Build document flow
        doc.build(story, canvasmaker=NumberedCanvas)
        
        # Fetch PDF byte data from buffer
        buffer.seek(0)
        pdf_data = buffer.getvalue()
        buffer.close()

        # Stream binary PDF attachment
        return StreamingResponse(io.BytesIO(pdf_data), media_type="application/pdf", headers={
            "Content-Disposition": f"attachment; filename=ebios_report_{id}.pdf"
        })
    except HTTPException:
        raise
    except Exception as e:
        print(f"Export Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during PDF generation")
