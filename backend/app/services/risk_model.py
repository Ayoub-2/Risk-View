# EBIOS RM Standard Annexes (Catalogs)

EBIOS_ANNEXES = {
    "threat_sources": [
        "State Actor / Intelligence",
        "Cybercriminal / Organized Crime",
        "Hacktivist / Ideological",
        "Competitor / Corporate Espionage",
        "Internal Employee (Malicious)",
        "Internal Employee (Accidental)",
        "Internal Employee (Negligent)",
        "Supply Chain Compromise / Third Party"
    ],
    "target_objectives": [
        "Data Theft / Exfiltration",
        "Sabotage / Destruction",
        "Ransomware / Financial Extortion",
        "Defacement / Reputation Damage",
        "Fraud / Alteration",
        "Service Disruption / Downtime"
    ],
    "likelihood_scale": {
        1: "Minimal (Almost impossible)",
        2: "Significant (Plausible)",
        3: "Strong (Very likely)",
        4: "Maximal (Certain)"
    },
    "impact_scale": {
        1: "Negligible (Minor internal disruption)",
        2: "Limited (Noticeable but recoverable)",
        3: "Significant (Severe business disruption)",
        4: "Critical (Survival of organization threatened)"
    }
}

def calculate_ebios_risk(scenarios, treatments):
    """
    Calculates Initial and Residual Risks for EBIOS RM scenarios.
    """
    results = []
    
    # Map treatments by scenario_id
    treatment_map = {t['scenario_id']: t for t in treatments}
    
    total_initial = 0
    total_residual = 0
    
    for s in scenarios:
        initial_score = s['likelihood'] * s['impact']
        total_initial += initial_score
        
        # Determine residual based on treatment
        treatment = treatment_map.get(s['id'])
        if treatment:
            res_score = treatment['residual_likelihood'] * treatment['residual_impact']
        else:
            res_score = initial_score # No treatment applied
            
        total_residual += res_score
        
        results.append({
            "scenario_id": s['id'],
            "name": s['name'],
            "initial_score": initial_score,
            "residual_score": res_score,
            "likelihood": s['likelihood'],
            "impact": s['impact'],
            "residual_likelihood": treatment['residual_likelihood'] if treatment else s['likelihood'],
            "residual_impact": treatment['residual_impact'] if treatment else s['impact'],
            "decision": treatment['decision'] if treatment else "None"
        })
        
    avg_initial = round(total_initial / (len(scenarios) or 1), 2)
    avg_residual = round(total_residual / (len(scenarios) or 1), 2)
    
    return {
        "scenario_breakdown": results,
        "average_initial_risk": avg_initial,
        "average_residual_risk": avg_residual
    }

