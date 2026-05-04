import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import EBIOSForm from "../components/EBIOSForm";
import HeatMapComp from "../components/HeatMap";

export default function ProjectDetails({ isNew }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew && id) {
      api.get(`/assessments/${id}`)
        .then(res => {
          setProject(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          alert("Erreur lors du chargement des détails du projet");
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
      alert(`Échec de l'exportation ${format.toUpperCase()}`);
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
            <div className="space-x-4">
              <button onClick={() => handleExport('json')} className="bg-gray-700 text-gray-200 border border-gray-600 px-5 py-2 rounded-lg shadow hover:bg-gray-600 transition font-semibold">Export JSON</button>
              <button onClick={() => handleExport('pdf')} className="bg-ebios-orange text-white px-5 py-2 rounded-lg shadow hover:bg-ebios-orange-dark transition font-semibold">Export PDF</button>
            </div>
          )}
        </div>

        {!isNew && project && (
          <div className="space-y-8 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-8 border border-gray-100">
              <div className="flex-1 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-ebios-dark">Aperçu des Risques</h2>
                <div className="space-y-4">
                   <p className="text-lg flex justify-between">
                     <span className="text-gray-600">Risque Initial Moyen:</span> 
                     <span className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-md">{project.average_initial_risk}</span>
                   </p>
                   <p className="text-lg flex justify-between">
                     <span className="text-gray-600">Risque Résiduel Moyen:</span> 
                     <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-md">{project.average_residual_risk}</span>
                   </p>
                </div>
              </div>
              <div className="flex-1">
                <HeatMapComp scenarios={project.risk_results?.scenario_breakdown || []} />
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

        <EBIOSForm 
          initialData={project} 
          isEdit={!isNew}
          onResult={(res) => {
            if (isNew) {
              navigate(`/project/${res.id}`);
            } else {
              setProject({...project, ...res.details, average_initial_risk: res.average_initial_risk, average_residual_risk: res.average_residual_risk});
              alert("Projet mis à jour avec succès !");
              window.location.reload();
            }
          }} 
        />
      </div>
    </div>
  );
}
