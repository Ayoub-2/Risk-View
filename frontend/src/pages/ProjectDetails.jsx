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
      const res = await api.get(`/assessment/${id}/${format}`, { responseType: 'blob' });
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
          <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 flex flex-col md:flex-row gap-8 border border-gray-100">
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
