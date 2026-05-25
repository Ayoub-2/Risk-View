import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import EBIOSForm from "../components/EBIOSForm";
import HeatMapComp from "../components/HeatMap";
import ThreatModelTab from "../components/ThreatModelTab";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "react-toastify";

export default function ProjectDetails({ isNew }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(!isNew);

  // Compliance Mode & Justification State
  const [activeMode, setActiveMode] = useState("risk");
  const [soaJustifications, setSoaJustifications] = useState({});
  const [soaFilter, setSoaFilter] = useState("Tout");
  const [annexes, setAnnexes] = useState(null);

  // Sharing states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shares, setShares] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Contributor");

  useEffect(() => {
    if (showShareModal && id) {
      api.get(`/assessments/${id}/shares`)
        .then(res => setShares(res.data))
        .catch(console.error);
    }
  }, [showShareModal, id]);

  const handleAddShare = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await api.post(`/assessments/${id}/share`, { email: inviteEmail, role: inviteRole });
      toast.success("Espace de travail partagé avec succès !");
      setInviteEmail("");
      const res = await api.get(`/assessments/${id}/shares`);
      setShares(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Échec du partage");
    }
  };

  const handleRevokeShare = async (shareId) => {
    try {
      await api.delete(`/assessments/${id}/share/${shareId}`);
      toast.success("Accès collaborateur révoqué.");
      setShares(shares.filter(s => s.id !== shareId));
    } catch (err) {
      toast.error("Échec de la révocation");
    }
  };

  useEffect(() => {
    api.get("/annexes")
      .then(res => setAnnexes(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (project) {
      setSoaJustifications(project.soa_justifications || {});
    }
  }, [project]);

  const handleSaveSoa = async () => {
    const payload = {
      system_name: project.system_name,
      context_description: project.context_description,
      baseline_controls: project.baseline_controls,
      risk_origins: project.risk_origins,
      scenarios: project.scenarios,
      treatments: project.treatments,
      soa_justifications: soaJustifications
    };
    try {
      const res = await api.put(`/assess/${id}`, payload);
      setProject({...project, ...res.data.details, soa_justifications: soaJustifications});
      toast.success("Déclaration d'Applicabilité sauvegardée avec succès !");
    } catch (err) {
      toast.error("Échec de la sauvegarde de la SoA");
    }
  };

  // Dynamic KPI Metric Calculations
  const totalControls = project?.baseline_controls?.length || 0;
  const implementedControls = project?.baseline_controls?.filter(c => c.implemented).length || 0;
  const complianceRate = totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0;

  const totalScenarios = project?.scenarios?.length || 0;
  const criticalRisksCount = project?.risk_results?.scenario_breakdown?.filter(s => s.initial_score >= 12).length || 0;

  const totalInitialScore = project?.risk_results?.scenario_breakdown?.reduce((acc, s) => acc + s.initial_score, 0) || 0;
  const totalResidualScore = project?.risk_results?.scenario_breakdown?.reduce((acc, s) => acc + s.residual_score, 0) || 0;
  const totalReduction = totalInitialScore - totalResidualScore;
  const reductionRate = totalInitialScore > 0 ? Math.round((totalReduction / totalInitialScore) * 100) : 0;

  const chartData = (project?.risk_results?.scenario_breakdown || []).map(s => ({
    name: s.scenario_id,
    "Initial": s.initial_score,
    "Résiduel": s.residual_score,
  }));

  useEffect(() => {
    if (!isNew && id) {
      api.get(`/assessments/${id}`)
        .then(res => {
          setProject(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          toast.error("Erreur lors du chargement des détails du projet");
          navigate("/dashboard");
        });
    }
  }, [id, isNew, navigate]);

  const handleExport = async (format) => {
    try {
      const res = await api.get(`/assessments/${id}/export/${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ebios_report_${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error(`Échec de l'exportation ${format.toUpperCase()}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Chargement du Projet...</div>;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="mb-6 text-ebios-orange font-semibold hover:underline flex items-center gap-2">
          &larr; Retour au Tableau de Bord
        </button>

        <div className="flex justify-between items-center mb-8 bg-ebios-dark p-6 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-white">
            {isNew ? "Créer un Nouveau Projet" : `Projet: ${project?.system_name}`}
          </h1>
          {!isNew && (
            <div className="flex gap-4">
              {project?.role === "Owner" && (
                <button onClick={() => setShowShareModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition font-semibold">👥 Collaborateurs</button>
              )}
              <button onClick={() => handleExport('json')} className="bg-gray-700 text-gray-200 border border-gray-600 px-5 py-2 rounded-lg shadow hover:bg-gray-600 transition font-semibold">Export JSON</button>
              <button onClick={() => handleExport('pdf')} className="bg-ebios-orange text-white px-5 py-2 rounded-lg shadow hover:bg-ebios-orange-dark transition font-semibold">Export PDF</button>
            </div>
          )}
        </div>

        {!isNew && (
          <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto pb-2">
            <button 
              onClick={() => setActiveMode("risk")} 
              className={`px-5 py-3 font-bold rounded-xl transition ${activeMode === "risk" ? 'bg-ebios-orange text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              📊 Analyse des Risques (Dashboard)
            </button>
            <button 
              onClick={() => setActiveMode("soa")} 
              className={`px-5 py-3 font-bold rounded-xl transition ${activeMode === "soa" ? 'bg-ebios-orange text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              🛡️ Déclaration d'Applicabilité (ISO 27001 SoA)
            </button>
            <button 
              onClick={() => setActiveMode("threat_model")} 
              className={`px-5 py-3 font-bold rounded-xl transition ${activeMode === "threat_model" ? 'bg-ebios-orange text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              🤖 Modélisation des Menaces & IA (STRIDE)
            </button>
          </div>
        )}

        {!isNew && project && activeMode === "risk" && (
          <div className="space-y-8 mb-8 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* KPI 1: Socle de Sécurité */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between transition transform hover:-translate-y-1 hover:shadow-xl">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Socle de Sécurité (WS1)</span>
                <div className="flex items-baseline gap-2 my-2">
                  <span className={`text-3xl font-extrabold ${complianceRate >= 80 ? 'text-green-600' : complianceRate >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                    {complianceRate}%
                  </span>
                  <span className="text-xs text-gray-400">conformité</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {implementedControls} sur {totalControls} mesures implémentées
                </p>
              </div>

              {/* KPI 2: Scénarios Évalués */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between transition transform hover:-translate-y-1 hover:shadow-xl">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Scénarios Évalués (WS3/4)</span>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-extrabold text-gray-800">
                    {totalScenarios}
                  </span>
                  <span className="text-xs text-gray-400">scénarios</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Analysés à travers les origines de risques
                </p>
              </div>

              {/* KPI 3: Risques Critiques */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between transition transform hover:-translate-y-1 hover:shadow-xl">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Risques Critiques</span>
                <div className="flex items-baseline gap-2 my-2">
                  <span className={`text-3xl font-extrabold ${criticalRisksCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {criticalRisksCount}
                  </span>
                  <span className="text-xs text-gray-400">majeurs</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {criticalRisksCount > 0 ? "Nécessite un traitement urgent" : "Aucun risque critique détecté"}
                </p>
              </div>

              {/* KPI 4: Taux de Réduction */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between transition transform hover:-translate-y-1 hover:shadow-xl">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Atténuation des Risques</span>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-extrabold text-blue-600">
                    {reductionRate}%
                  </span>
                  <span className="text-xs text-gray-400">réduction</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Taux de réduction global après traitement (WS5)
                </p>
              </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card 1: Comparative Risk Score Bar Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-ebios-dark">Comparaison des Scores de Risque</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Comparaison directe entre le Risque Initial et le Risque Résiduel par Scénario</p>
                </div>
                
                {chartData.length > 0 ? (
                  <div className="h-72 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                        <YAxis domain={[0, 16]} stroke="#6B7280" fontSize={11} tickLine={false} />
                        <Tooltip cursor={{ fill: '#F3F4F6' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Bar dataKey="Initial" fill="#F97316" radius={[4, 4, 0, 0]} barSize={14} />
                        <Bar dataKey="Résiduel" fill="#10B981" radius={[4, 4, 0, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-400 italic">Aucune donnée disponible</div>
                )}
              </div>

              {/* Card 2: Residual Risk Matrix */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-ebios-dark">Matrice des Risques Résiduels</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Cartographie 4x4 standard EBIOS RM (Vraisemblance × Gravité)</p>
                </div>
                <div className="mt-4 flex justify-center">
                  <HeatMapComp scenarios={project.risk_results?.scenario_breakdown || []} />
                </div>
              </div>
            </div>

            {/* ROI and Compliance Overview */}
            {project.risk_results?.scenario_breakdown?.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold mb-4 text-ebios-dark">Priorisation des Traitements (ROI & Conformité)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-3 text-sm font-semibold text-gray-600">Scénario</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Décision</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Cartographie (ISO/CIS)</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Réduction Risque</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Difficulté</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Score ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...(project.risk_results.scenario_breakdown || [])]
                        .sort((a, b) => b.roi - a.roi)
                        .map((s, idx) => {
                          const riskReduction = s.initial_score - s.residual_score;
                          return (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-3 text-sm font-bold">{s.scenario_id}</td>
                              <td className="p-3 text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${s.decision === 'Reduce' ? 'bg-green-100 text-green-800' : s.decision === 'Accept' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {s.decision}
                                </span>
                              </td>
                              <td className="p-3 text-sm text-gray-600">
                                {s.iso_control && <span className="block border border-blue-200 bg-blue-50 text-blue-700 px-2 rounded mb-1 text-xs">{s.iso_control}</span>}
                                {s.cis_control && <span className="block border border-purple-200 bg-purple-50 text-purple-700 px-2 rounded text-xs">{s.cis_control}</span>}
                                {(!s.iso_control && !s.cis_control) && <span className="text-gray-400 italic">Non mappé</span>}
                              </td>
                              <td className="p-3 text-sm text-green-600 font-semibold">-{riskReduction > 0 ? riskReduction : 0}</td>
                              <td className="p-3 text-sm">
                                {s.difficulty === 1 ? '🟢 Faible' : s.difficulty === 2 ? '🟡 Moyenne' : s.difficulty === 3 ? '🔴 Élevée' : 'N/A'}
                              </td>
                              <td className="p-3 text-sm font-bold text-ebios-orange">{s.roi}</td>
                            </tr>
                          );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Component 2: Frontend SoA Interactive Matrix */}
        {!isNew && project && activeMode === "soa" && annexes && (
          <div className="space-y-8 mb-8 animate-fade-in">
            {/* SoA KPI Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* SoA KPI 1: Applicable controls */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
                <span className="text-gray-450 font-bold text-xs uppercase tracking-wider text-gray-400">Contrôles Applicables</span>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-extrabold text-ebios-dark">
                    {annexes.iso_controls.filter(c => {
                      const ws1Matches = project.baseline_controls?.filter(bc => bc.name.toLowerCase().includes(c.id.toLowerCase())) || [];
                      const matchingTreatments = project.treatments?.filter(t => t.iso_control === c.id) || [];
                      return ws1Matches.length > 0 || matchingTreatments.length > 0;
                    }).length}
                  </span>
                  <span className="text-xs text-gray-400">sur {annexes.iso_controls.length}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Contrôles requis pour traiter vos risques</p>
              </div>

              {/* SoA KPI 2: Implemented controls */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
                <span className="text-gray-450 font-bold text-xs uppercase tracking-wider text-gray-400">Contrôles Implémentés</span>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-extrabold text-green-600">
                    {annexes.iso_controls.filter(c => {
                      const ws1Matches = project.baseline_controls?.filter(bc => bc.name.toLowerCase().includes(c.id.toLowerCase())) || [];
                      return ws1Matches.some(m => m.implemented);
                    }).length}
                  </span>
                  <span className="text-xs text-gray-400">sécurisés</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Validés dans le socle de sécurité (WS1)</p>
              </div>

              {/* SoA KPI 3: In Progress controls */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
                <span className="text-gray-450 font-bold text-xs uppercase tracking-wider text-gray-400">Contrôles En Cours</span>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-extrabold text-orange-500">
                    {annexes.iso_controls.filter(c => {
                      const ws1Matches = project.baseline_controls?.filter(bc => bc.name.toLowerCase().includes(c.id.toLowerCase())) || [];
                      const matchingTreatments = project.treatments?.filter(t => t.iso_control === c.id) || [];
                      const isApp = ws1Matches.length > 0 || matchingTreatments.length > 0;
                      const isImp = ws1Matches.some(m => m.implemented);
                      return isApp && !isImp;
                    }).length}
                  </span>
                  <span className="text-xs text-gray-400">à implémenter</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Rattachés aux plans de traitements (WS5)</p>
              </div>

              {/* SoA KPI 4: Exclusion Rate */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
                <span className="text-gray-450 font-bold text-xs uppercase tracking-wider text-gray-400">Taux d'Exclusion</span>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-extrabold text-gray-500">
                    {Math.round((annexes.iso_controls.filter(c => {
                      const ws1Matches = project.baseline_controls?.filter(bc => bc.name.toLowerCase().includes(c.id.toLowerCase())) || [];
                      const matchingTreatments = project.treatments?.filter(t => t.iso_control === c.id) || [];
                      return ws1Matches.length === 0 && matchingTreatments.length === 0;
                    }).length / annexes.iso_controls.length) * 100)}%
                  </span>
                  <span className="text-xs text-gray-400">exclus</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Contrôles hors périmètre justifiés</p>
              </div>
            </div>

            {/* SoA Matrix Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-ebios-dark">Déclaration d'Applicabilité (SoA ISO 27001)</h3>
                  <p className="text-sm text-gray-500 mt-1">Générez et justifiez la conformité de vos 93 contrôles de l'Annexe A.</p>
                </div>
                {project?.role !== "Auditor" ? (
                  <button onClick={handleSaveSoa} className="bg-ebios-orange hover:bg-ebios-orange-dark text-white font-bold px-6 py-3 rounded-xl shadow-md transition transform hover:scale-105">
                    💾 Sauvegarder les Justifications
                  </button>
                ) : (
                  <span className="text-xs text-red-500 font-bold border border-red-200 bg-red-50 px-4 py-2.5 rounded-lg shadow-sm">⚠️ Mode Lecture Seule</span>
                )}
              </div>

              {/* Domain Filters */}
              <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
                {["Tout", "A.5", "A.6", "A.7", "A.8"].map(dom => (
                  <button 
                    key={dom}
                    onClick={() => setSoaFilter(dom)}
                    className={`px-4 py-2 font-semibold rounded-lg text-sm transition ${soaFilter === dom ? 'bg-ebios-dark text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {dom === "Tout" ? "Tout (93)" : dom === "A.5" ? "A.5 Organisationnel (37)" : dom === "A.6" ? "A.6 Humain (8)" : dom === "A.7" ? "A.7 Physique (14)" : "A.8 Technique (34)"}
                  </button>
                ))}
              </div>

              {/* Grid List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {annexes.iso_controls
                  .filter(c => soaFilter === "Tout" || c.id.startsWith(soaFilter))
                  .map(c => {
                    const matchingTreatments = project.treatments?.filter(t => t.iso_control === c.id) || [];
                    const ws1Matches = project.baseline_controls?.filter(bc => bc.name.toLowerCase().includes(c.id.toLowerCase())) || [];
                    const isApp = ws1Matches.length > 0 || matchingTreatments.length > 0;
                    
                    let status = "Excluded";
                    let statusLabel = "Non Applicable";
                    let statusBg = "bg-gray-100 text-gray-600 border-gray-300";
                    let defaultJustification = "Non requis pour le traitement des risques identifiés dans le cadre de cette évaluation.";
                    
                    if (isApp) {
                      const ws1Implemented = ws1Matches.some(m => m.implemented);
                      if (ws1Implemented) {
                        status = "Implemented";
                        statusLabel = "Applicable (Implémenté)";
                        statusBg = "bg-green-100 text-green-800 border-green-300";
                        defaultJustification = `Socle (WS1): ${ws1Matches.find(m => m.implemented)?.evidence || 'Mesure active'}`;
                      } else {
                        status = "In Progress";
                        statusLabel = "Applicable (En cours)";
                        statusBg = "bg-orange-100 text-orange-800 border-orange-300";
                        if (ws1Matches.length > 0) {
                          defaultJustification = `Socle (WS1) - En cours: ${ws1Matches.map(m => m.name).join("; ")}`;
                        } else {
                          defaultJustification = `Traitement (WS5) - Scénario ${matchingTreatments.map(t => t.scenario_id).join(", ")}`;
                        }
                      }
                    }

                    return (
                      <div key={c.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:shadow-md transition">
                        <div className="flex-grow max-w-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-extrabold text-sm text-ebios-orange">{c.id}</span>
                            <span className={`text-xs px-2.5 py-0.5 font-bold rounded-full border ${statusBg}`}>{statusLabel}</span>
                          </div>
                          <h4 className="font-bold text-gray-800 text-sm">{c.label}</h4>
                          <p className="text-xs text-gray-500 italic mt-0.5">💡 {c.guidance}</p>
                        </div>
                        <div className="w-full md:w-80 flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-600">Justification de conformité / d'exclusion :</label>
                          {status === "Excluded" ? (
                            <textarea 
                              placeholder="Justification requise pour l'exclusion..."
                              rows={2} 
                              value={soaJustifications[c.id] || ""} 
                              onChange={(e) => setSoaJustifications({...soaJustifications, [c.id]: e.target.value})} 
                              className="w-full p-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-ebios-orange outline-none bg-white font-medium disabled:bg-gray-100 disabled:text-gray-500"
                              disabled={project?.role === "Auditor"}
                            />
                          ) : (
                            <div className="p-2 bg-gray-150 border border-gray-250 text-xs rounded text-gray-600 font-semibold italic bg-white select-none">
                              {defaultJustification}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* EBIOSForm should only render in risk mode */}
        {activeMode === "risk" && (
          <EBIOSForm 
            initialData={project} 
            isEdit={!isNew}
            readOnly={project?.role === "Auditor"}
            onResult={(res) => {
              if (isNew) {
                navigate(`/project/${res.id}`);
              } else {
                setProject({...project, ...res.details, average_initial_risk: res.average_initial_risk, average_residual_risk: res.average_residual_risk});
                toast.success("Projet mis à jour avec succès !");
                setTimeout(() => window.location.reload(), 1500);
              }
            }} 
          />
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 relative">
              <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
              
              <h3 className="text-2xl font-bold text-ebios-dark mb-2">👥 Collaborateurs du Projet</h3>
              <p className="text-xs text-gray-500 mb-6">Partagez cet espace d'analyse de risques avec d'autres auditeurs ou contributeurs.</p>
              
              {/* Invite Form */}
              <form onSubmit={handleAddShare} className="flex gap-2 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <input 
                  type="email" 
                  placeholder="Adresse e-mail" 
                  value={inviteEmail} 
                  onChange={e=>setInviteEmail(e.target.value)} 
                  className="flex-grow p-2.5 text-sm border border-gray-350 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none bg-white font-medium"
                  required
                />
                <select 
                  value={inviteRole} 
                  onChange={e=>setInviteRole(e.target.value)}
                  className="p-2.5 text-sm border border-gray-350 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none bg-white font-semibold"
                >
                  <option value="Contributor">Contributeur</option>
                  <option value="Auditor">Auditeur</option>
                </select>
                <button type="submit" className="bg-ebios-orange hover:bg-ebios-orange-dark text-white px-4 py-2 rounded-lg font-bold shadow text-sm transition">Inviter</button>
              </form>

              {/* Collaborators List */}
              <h4 className="font-bold text-gray-700 text-sm mb-3">Accès Actifs</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {shares.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">{s.email}</span>
                      <span className={`text-2xs font-extrabold uppercase mt-0.5 ${s.role === 'Contributor' ? 'text-green-600' : 'text-gray-500'}`}>
                        {s.role === 'Contributor' ? 'Contributeur (Lecture & Écriture)' : 'Auditeur (Lecture seule)'}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleRevokeShare(s.id)}
                      className="text-red-555 hover:text-red-700 text-xs font-bold hover:underline"
                    >
                      Révoquer
                    </button>
                  </div>
                ))}
                {shares.length === 0 && (
                  <p className="text-xs text-gray-400 italic text-center py-4">Aucun collaborateur invité sur cet espace.</p>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowShareModal(false)} className="bg-gray-250 text-gray-700 hover:bg-gray-300 font-bold px-5 py-2.5 rounded-lg text-sm transition">Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
