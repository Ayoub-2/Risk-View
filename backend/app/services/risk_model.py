# EBIOS RM Standard Annexes (Catalogs)

EBIOS_ANNEXES = {
    "threat_sources": [
        {"id": "State Actor", "label": "Acteur Étatique / Renseignement", "guidance": "Gouvernements étrangers ou agences de renseignement cherchant à obtenir des avantages stratégiques, politiques ou économiques via l'espionnage (APT)."},
        {"id": "Cybercriminal", "label": "Cybercriminel / Crime Organisé", "guidance": "Groupes motivés par le gain financier utilisant des ransomwares, l'extorsion, ou le vol de données bancaires."},
        {"id": "Hacktivist", "label": "Hacktiviste / Idéologique", "guidance": "Attaquants cherchant à promouvoir une cause politique ou sociale, souvent par des attaques par déni de service (DDoS) ou du défaçage."},
        {"id": "Competitor", "label": "Concurrent / Espionnage Industriel", "guidance": "Entreprises concurrentes cherchant à voler des secrets commerciaux, des listes de clients ou des plans de R&D."},
        {"id": "Internal Malicious", "label": "Employé Interne (Malveillant)", "guidance": "Collaborateur mécontent ou corrompu ayant un accès légitime et l'intention de nuire (sabotage, vol)."},
        {"id": "Internal Accidental", "label": "Employé Interne (Accidentel)", "guidance": "Erreur humaine involontaire conduisant à une fuite de données ou une faille de sécurité (ex. mauvais paramétrage Cloud)."},
        {"id": "Supply Chain", "label": "Sous-traitant / Chaîne Logistique", "guidance": "Compromission indirecte via un prestataire de services ou un fournisseur de logiciels moins bien protégé."}
    ],
    "target_objectives": [
        {"id": "Data Theft", "label": "Vol de Données / Exfiltration", "guidance": "Extraction non autorisée de données sensibles (PII, secrets d'affaires) pour la revente ou l'espionnage."},
        {"id": "Sabotage", "label": "Sabotage / Destruction", "guidance": "Altération volontaire des systèmes pour empêcher le fonctionnement normal de l'entreprise."},
        {"id": "Ransomware", "label": "Ransomware / Extorsion", "guidance": "Chiffrement des données métier avec demande de rançon pour obtenir la clé de déchiffrement."},
        {"id": "Reputation Damage", "label": "Atteinte à la Réputation", "guidance": "Actions visant à détruire la confiance des clients (ex. publication de données volées, défaçage)."},
        {"id": "Fraud", "label": "Fraude / Falsification", "guidance": "Modification illégitime de données (ex. RIB, montants) pour un gain financier direct."},
        {"id": "Service Disruption", "label": "Interruption de Service", "guidance": "Surcharge (DDoS) ou blocage des systèmes rendant le service indisponible pour les utilisateurs légitimes."}
    ],
    "iso_controls": [
        {"id": "A.5.1", "label": "A.5.1 Politiques de sécurité de l'information", "guidance": "Orientation de la direction et soutien à la sécurité de l'information."},
        {"id": "A.5.2", "label": "A.5.2 Rôles et responsabilités", "guidance": "Définition et attribution des responsabilités en matière de sécurité."},
        {"id": "A.5.3", "label": "A.5.3 Séparation des tâches", "guidance": "Réduction du risque de modification non autorisée ou d'abus."},
        {"id": "A.5.4", "label": "A.5.4 Responsabilités de la direction", "guidance": "La direction doit exiger des employés l'application de la sécurité."},
        {"id": "A.5.5", "label": "A.5.5 Contact avec les autorités", "guidance": "Maintien de contacts avec les autorités compétentes."},
        {"id": "A.5.6", "label": "A.5.6 Contact avec des groupes spécialisés", "guidance": "Maintien de contacts avec des groupes d'intérêt spécialisés."},
        {"id": "A.5.7", "label": "A.5.7 Renseignements sur les menaces", "guidance": "Collecte et analyse d'informations relatives aux menaces."},
        {"id": "A.5.8", "label": "A.5.8 Sécurité dans la gestion de projet", "guidance": "Intégration de la sécurité dans la gestion de projet."},
        {"id": "A.5.9", "label": "A.5.9 Inventaire des informations et autres actifs", "guidance": "Identification des actifs et responsabilités."},
        {"id": "A.5.10", "label": "A.5.10 Utilisation acceptable", "guidance": "Règles d'utilisation acceptable des actifs."},
        {"id": "A.5.11", "label": "A.5.11 Restitution des actifs", "guidance": "Processus de restitution des actifs lors d'un départ."},
        {"id": "A.5.12", "label": "A.5.12 Classification des informations", "guidance": "Classification selon leur valeur et criticité."},
        {"id": "A.5.13", "label": "A.5.13 Marquage des informations", "guidance": "Procédures de marquage et manipulation des informations."},
        {"id": "A.5.14", "label": "A.5.14 Transfert d'informations", "guidance": "Règles de sécurité pour les transferts d'information."},
        {"id": "A.5.15", "label": "A.5.15 Contrôle d'accès", "guidance": "Politique de contrôle d'accès pour les utilisateurs et systèmes."},
        {"id": "A.5.16", "label": "A.5.16 Gestion des identités", "guidance": "Gestion du cycle de vie complet des identités."},
        {"id": "A.5.17", "label": "A.5.17 Informations d'authentification", "guidance": "Attribution sécurisée des informations d'authentification."},
        {"id": "A.5.18", "label": "A.5.18 Droits d'accès", "guidance": "Attribution, revue et retrait des droits d'accès."},
        {"id": "A.5.19", "label": "A.5.19 Sécurité dans les relations fournisseurs", "guidance": "Exigences de sécurité dans les accords avec les fournisseurs."},
        {"id": "A.5.20", "label": "A.5.20 Sécurité dans la chaîne d'approvisionnement", "guidance": "Gestion des risques liés à la chaîne d'approvisionnement TIC."},
        {"id": "A.5.21", "label": "A.5.21 Gestion de la sécurité des TIC", "guidance": "Gestion de la sécurité des TIC et de la chaîne d'approvisionnement."},
        {"id": "A.5.22", "label": "A.5.22 Suivi des services fournisseurs", "guidance": "Surveillance et révision des services des fournisseurs."},
        {"id": "A.5.23", "label": "A.5.23 Sécurité du Cloud", "guidance": "Exigences de sécurité pour l'utilisation des services en nuage."},
        {"id": "A.5.24", "label": "A.5.24 Planification et préparation aux incidents", "guidance": "Préparation pour répondre aux incidents de sécurité."},
        {"id": "A.5.25", "label": "A.5.25 Évaluation et décision sur les événements", "guidance": "Évaluation des événements pour les qualifier d'incidents."},
        {"id": "A.5.26", "label": "A.5.26 Réponse aux incidents", "guidance": "Réponse conformément aux procédures établies."},
        {"id": "A.5.27", "label": "A.5.27 Leçons tirées des incidents", "guidance": "Apprentissage pour améliorer la gestion future des incidents."},
        {"id": "A.5.28", "label": "A.5.28 Collecte de preuves", "guidance": "Procédures d'identification, de collecte et de préservation des preuves."},
        {"id": "A.5.29", "label": "A.5.29 Sécurité et continuité d'activité", "guidance": "Intégration de la sécurité dans la continuité d'activité."},
        {"id": "A.5.30", "label": "A.5.30 Préparation des TIC à la continuité", "guidance": "Préparation des TIC pour soutenir la continuité des activités."},
        {"id": "A.5.31", "label": "A.5.31 Exigences légales, statutaires, réglementaires", "guidance": "Identification et documentation de toutes les exigences légales pertinentes."},
        {"id": "A.5.32", "label": "A.5.32 Droits de propriété intellectuelle", "guidance": "Respect des droits de propriété intellectuelle et licences."},
        {"id": "A.5.33", "label": "A.5.33 Protection des dossiers", "guidance": "Protection des dossiers contre la perte, destruction ou falsification."},
        {"id": "A.5.34", "label": "A.5.34 Confidentialité des PII", "guidance": "Confidentialité et protection des données à caractère personnel (RGPD)."},
        {"id": "A.5.35", "label": "A.5.35 Examen indépendant", "guidance": "Examen indépendant de la sécurité de l'information."},
        {"id": "A.5.36", "label": "A.5.36 Conformité aux politiques", "guidance": "Examen de conformité régulier par les gestionnaires de domaine."},
        {"id": "A.5.37", "label": "A.5.37 Procédures de fonctionnement", "guidance": "Procédures documentées pour l'exploitation des systèmes."},
        {"id": "A.6.1", "label": "A.6.1 Sélection du personnel", "guidance": "Vérification des antécédents de tous les candidats."},
        {"id": "A.6.2", "label": "A.6.2 Termes et conditions d'emploi", "guidance": "Obligations de sécurité dans les contrats d'emploi."},
        {"id": "A.6.3", "label": "A.6.3 Sensibilisation, éducation et formation", "guidance": "Formation continue à la sécurité et aux politiques."},
        {"id": "A.6.4", "label": "A.6.4 Processus disciplinaire", "guidance": "Action formelle en cas de violation des politiques de sécurité."},
        {"id": "A.6.5", "label": "A.6.5 Responsabilités après la fin d'emploi", "guidance": "Maintien des obligations de confidentialité post-emploi."},
        {"id": "A.6.6", "label": "A.6.6 Accords de confidentialité", "guidance": "Accords de confidentialité ou de non-divulgation (NDA)."},
        {"id": "A.6.7", "label": "A.6.7 Télétravail", "guidance": "Mesures de sécurité pour le travail à distance."},
        {"id": "A.6.8", "label": "A.6.8 Signalement d'événements", "guidance": "Obligation de signaler tout événement lié à la sécurité."},
        {"id": "A.7.1", "label": "A.7.1 Périmètres de sécurité physique", "guidance": "Définition de périmètres pour protéger les zones de traitement d'information."},
        {"id": "A.7.2", "label": "A.7.2 Contrôles d'entrée physique", "guidance": "Accès restreint aux zones sécurisées (ex: badges, biométrie)."},
        {"id": "A.7.3", "label": "A.7.3 Sécurisation des bureaux et installations", "guidance": "Protection physique des bureaux et locaux."},
        {"id": "A.7.4", "label": "A.7.4 Surveillance physique de sécurité", "guidance": "Utilisation d'alarmes, de gardiens ou de vidéosurveillance (CCTV)."},
        {"id": "A.7.5", "label": "A.7.5 Protection contre les menaces environnementales", "guidance": "Protection contre les incendies, inondations, séismes, etc."},
        {"id": "A.7.6", "label": "A.7.6 Travail dans les zones sécurisées", "guidance": "Règles pour le travail et l'accès dans les zones sécurisées."},
        {"id": "A.7.7", "label": "A.7.7 Bureau propre et écran clair", "guidance": "Politique de rangement des documents papier et verrouillage d'écran."},
        {"id": "A.7.8", "label": "A.7.8 Emplacement et protection du matériel", "guidance": "Protection du matériel pour réduire les risques d'accès non autorisé."},
        {"id": "A.7.9", "label": "A.7.9 Sécurité des biens hors des locaux", "guidance": "Sécurité pour les équipements utilisés en dehors du site."},
        {"id": "A.7.10", "label": "A.7.10 Supports de stockage", "guidance": "Gestion des supports de stockage tout au long de leur cycle de vie."},
        {"id": "A.7.11", "label": "A.7.11 Services de soutien", "guidance": "Protection et redondance des alimentations électriques, climatisation."},
        {"id": "A.7.12", "label": "A.7.12 Sécurité du câblage", "guidance": "Protection des câblages réseau et électrique contre l'interception ou dommages."},
        {"id": "A.7.13", "label": "A.7.13 Maintenance du matériel", "guidance": "Maintenance préventive pour assurer la disponibilité du matériel."},
        {"id": "A.7.14", "label": "A.7.14 Élimination sécurisée", "guidance": "Destruction ou effacement sécurisé des équipements en fin de vie."},
        {"id": "A.8.1", "label": "A.8.1 Appareils Utilisateurs", "guidance": "Sécurisation des postes (MDM, chiffrement, verrouillage)."},
        {"id": "A.8.2", "label": "A.8.2 Droits d'accès privilégiés", "guidance": "Gestion stricte des droits d'accès privilégiés (Admin)."},
        {"id": "A.8.3", "label": "A.8.3 Restriction d'accès à l'information", "guidance": "Restriction aux systèmes selon le principe du moindre privilège."},
        {"id": "A.8.4", "label": "A.8.4 Accès au code source", "guidance": "Protection du code source contre l'accès non autorisé."},
        {"id": "A.8.5", "label": "A.8.5 Authentification sécurisée", "guidance": "Technologies comme la MFA pour l'authentification."},
        {"id": "A.8.6", "label": "A.8.6 Gestion des capacités", "guidance": "Suivi des capacités pour assurer la disponibilité (CPU, RAM, Disque)."},
        {"id": "A.8.7", "label": "A.8.7 Protection contre les codes malveillants", "guidance": "Mise en place d'antivirus/EDR."},
        {"id": "A.8.8", "label": "A.8.8 Gestion des vulnérabilités", "guidance": "Patch management et gestion des correctifs de sécurité."},
        {"id": "A.8.9", "label": "A.8.9 Gestion des configurations", "guidance": "Durcissement (hardening) des configurations (systèmes, réseau)."},
        {"id": "A.8.10", "label": "A.8.10 Suppression d'informations", "guidance": "Suppression des informations lorsqu'elles ne sont plus nécessaires."},
        {"id": "A.8.11", "label": "A.8.11 Masquage des données", "guidance": "Techniques comme l'anonymisation pour protéger les PII."},
        {"id": "A.8.12", "label": "A.8.12 Prévention des fuites de données (DLP)", "guidance": "Mesures appliquées pour empêcher la perte de données sensibles."},
        {"id": "A.8.13", "label": "A.8.13 Sauvegarde des informations", "guidance": "Copies de secours testées et protégées."},
        {"id": "A.8.14", "label": "A.8.14 Redondance", "guidance": "Redondance des installations de traitement d'information (HA)."},
        {"id": "A.8.15", "label": "A.8.15 Journalisation", "guidance": "Production, stockage sécurisé et analyse des journaux d'événements."},
        {"id": "A.8.16", "label": "A.8.16 Outils de surveillance", "guidance": "Utilisation d'outils pour surveiller et alerter sur les anomalies."},
        {"id": "A.8.17", "label": "A.8.17 Synchronisation des horloges", "guidance": "Synchronisation via un temps de référence (NTP) pour la corrélation des logs."},
        {"id": "A.8.18", "label": "A.8.18 Utilisation d'utilitaires système", "guidance": "Restriction de l'accès aux utilitaires système qui pourraient supplanter les contrôles."},
        {"id": "A.8.19", "label": "A.8.19 Installation de logiciels", "guidance": "Règles régissant l'installation de logiciels sur les systèmes."},
        {"id": "A.8.20", "label": "A.8.20 Sécurité des réseaux", "guidance": "Protection des réseaux et segmentation."},
        {"id": "A.8.21", "label": "A.8.21 Sécurité des services réseau", "guidance": "Sécurité garantie dans les services réseau (fournisseurs réseau)."},
        {"id": "A.8.22", "label": "A.8.22 Séparation des réseaux", "guidance": "Ségrégation des groupes de services d'information, d'utilisateurs et de systèmes d'information dans les réseaux (VLAN)."},
        {"id": "A.8.23", "label": "A.8.23 Filtrage Web", "guidance": "Filtrage des accès internet pour réduire l'exposition aux codes malveillants."},
        {"id": "A.8.24", "label": "A.8.24 Utilisation de la cryptographie", "guidance": "Chiffrement et gestion des clés cryptographiques."},
        {"id": "A.8.25", "label": "A.8.25 Cycle de vie de développement sécurisé", "guidance": "Règles pour la sécurité dans le cycle de développement (SDLC)."},
        {"id": "A.8.26", "label": "A.8.26 Exigences de sécurité applicative", "guidance": "Définition des besoins de sécurité pour les nouveaux systèmes ou les améliorations."},
        {"id": "A.8.27", "label": "A.8.27 Principes d'architecture sécurisée", "guidance": "Conception, développement et implémentation de principes d'architecture sécurisée."},
        {"id": "A.8.28", "label": "A.8.28 Codage sécurisé", "guidance": "Pratiques de codage sécurisé appliquées au développement."},
        {"id": "A.8.29", "label": "A.8.29 Tests de sécurité", "guidance": "Tests de sécurité (SAST, DAST, Pentest) dans le cycle de développement."},
        {"id": "A.8.30", "label": "A.8.30 Développement externalisé", "guidance": "Le développement externalisé doit respecter les règles de sécurité de l'organisation."},
        {"id": "A.8.31", "label": "A.8.31 Séparation des environnements", "guidance": "Séparation stricte entre les environnements de développement, test et production."},
        {"id": "A.8.32", "label": "A.8.32 Gestion du changement", "guidance": "Contrôle de tous les changements concernant les TIC, les systèmes d'information, etc."},
        {"id": "A.8.33", "label": "A.8.33 Informations de test", "guidance": "Sélection et protection des données utilisées pour les tests."},
        {"id": "A.8.34", "label": "A.8.34 Protection des systèmes d'information lors d'audit", "guidance": "Limiter l'impact des outils de test et d'audit sur les systèmes en production."}
    ],
    "cis_controls": [
        {"id": "CIS 1", "label": "CIS 1: Inventaire des actifs matériels", "guidance": "Gérer activement (inventorier, suivre et corriger) tous les périphériques matériels sur le réseau."},
        {"id": "CIS 2", "label": "CIS 2: Inventaire des actifs logiciels", "guidance": "Gérer activement tous les logiciels sur le réseau pour que seuls les logiciels autorisés soient installés et exécutés."},
        {"id": "CIS 3", "label": "CIS 3: Protection des données", "guidance": "Processus et techniques pour identifier, classifier et sécuriser les données."},
        {"id": "CIS 4", "label": "CIS 4: Configuration sécurisée", "guidance": "Établir et maintenir une configuration sécurisée des actifs matériels et logiciels (Hardening)."},
        {"id": "CIS 5", "label": "CIS 5: Gestion des comptes", "guidance": "Utiliser des processus et des outils pour assigner et gérer l'autorisation des identifiants (utilisateurs, administrateurs, services)."},
        {"id": "CIS 6", "label": "CIS 6: Gestion des accès", "guidance": "Contrôle strict des accès privilégiés et administratifs (MFA, PAM)."},
        {"id": "CIS 7", "label": "CIS 7: Gestion continue des vulnérabilités", "guidance": "Évaluer en continu et corriger les vulnérabilités pour contrer les menaces (Patch Management)."},
        {"id": "CIS 8", "label": "CIS 8: Gestion des journaux d'audit", "guidance": "Collecter, alerter, analyser et conserver les journaux d'audit (SIEM/Log Management)."},
        {"id": "CIS 9", "label": "CIS 9: Protection de la messagerie et nav web", "guidance": "Améliorer les protections pour prévenir les vecteurs initiaux d'attaque via email et navigateurs web."},
        {"id": "CIS 10", "label": "CIS 10: Défense contre les malwares", "guidance": "Contrôler l'installation et l'exécution de code malveillant aux points d'entrée (Antivirus/EDR)."},
        {"id": "CIS 11", "label": "CIS 11: Restauration des données", "guidance": "Mettre en place des pratiques de sauvegarde et de récupération éprouvées (Backup/DRP)."},
        {"id": "CIS 12", "label": "CIS 12: Gestion de l'infrastructure réseau", "guidance": "Établir, maintenir et gérer activement (suivi, rapports, corrections) les périphériques réseau."},
        {"id": "CIS 13", "label": "CIS 13: Surveillance et défense du réseau", "guidance": "Opérer des processus et des outils pour surveiller le réseau et se défendre contre les menaces (IDS/IPS)."},
        {"id": "CIS 14", "label": "CIS 14: Sensibilisation à la sécurité", "guidance": "Établir un programme de sensibilisation pour influencer le comportement du personnel (Phishing test)."},
        {"id": "CIS 15", "label": "CIS 15: Sécurité des fournisseurs", "guidance": "Développer un processus pour évaluer les fournisseurs de services (Supply Chain/Third Party)."},
        {"id": "CIS 16", "label": "CIS 16: Sécurité applicative", "guidance": "Gérer le cycle de vie de la sécurité de tous les logiciels développés, acquis ou utilisés (AppSec)."},
        {"id": "CIS 17", "label": "CIS 17: Réponse aux incidents", "guidance": "Mettre en place un programme pour détecter, analyser et répondre aux incidents rapidement (CSIRT)."},
        {"id": "CIS 18", "label": "CIS 18: Tests d'intrusion", "guidance": "Tester l'efficacité des contrôles en simulant les objectifs et les actions d'un attaquant (Pentest)."}
    ],
    "likelihood_scale": {
        1: "Minime (Presque impossible)",
        2: "Significative (Plausible)",
        3: "Forte (Très probable)",
        4: "Maximale (Certaine)"
    },
    "impact_scale": {
        1: "Négligeable (Gêne mineure)",
        2: "Limitée (Impact mesurable mais réversible)",
        3: "Importante (Blocage sévère, pertes financières)",
        4: "Critique (Survie de l'organisation menacée)"
    }
}

def calculate_ebios_risk(scenarios, treatments):
    """
    Calculates Initial and Residual Risks for EBIOS RM scenarios.
    Also calculates Treatment ROI based on (Initial - Residual) / Difficulty.
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
            difficulty = treatment.get('difficulty', 2) # Default to Medium (2) if missing
        else:
            res_score = initial_score # No treatment applied
            difficulty = 1
            
        total_residual += res_score
        
        # Calculate ROI: Risk reduction divided by difficulty
        # Higher ROI means high impact for low effort
        risk_reduction = initial_score - res_score
        roi = round(risk_reduction / difficulty, 2) if risk_reduction > 0 else 0
        
        results.append({
            "scenario_id": s['id'],
            "name": s['name'],
            "initial_score": initial_score,
            "residual_score": res_score,
            "likelihood": s['likelihood'],
            "impact": s['impact'],
            "residual_likelihood": treatment['residual_likelihood'] if treatment else s['likelihood'],
            "residual_impact": treatment['residual_impact'] if treatment else s['impact'],
            "decision": treatment['decision'] if treatment else "None",
            "iso_control": treatment.get('iso_control', '') if treatment else "",
            "cis_control": treatment.get('cis_control', '') if treatment else "",
            "difficulty": difficulty,
            "roi": roi
        })
        
    avg_initial = round(total_initial / (len(scenarios) or 1), 2)
    avg_residual = round(total_residual / (len(scenarios) or 1), 2)
    
    return {
        "scenario_breakdown": results,
        "average_initial_risk": avg_initial,
        "average_residual_risk": avg_residual
    }

