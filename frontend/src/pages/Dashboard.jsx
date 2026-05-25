import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard({ onLogout }) {
  const [history, setHistory] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/assessments");
        setHistory(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'historique:", err);
      }
    };
    fetchHistory();
  }, []);

  const filtered = useMemo(() => {
    return [...history].sort((a, b) => {
      if (sortBy === "risk") return b.average_initial_risk - a.average_initial_risk;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [history, sortBy]);

  return (
    <div className="p-8 relative">
      <button
        onClick={() => {
          onLogout?.();
          navigate("/login");
        }}
        className="absolute top-4 right-4 bg-gray-200 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-300 transition"
      >
        Se déconnecter
      </button>

      <div className="max-w-6xl mx-auto mt-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-ebios-dark">Mes Projets</h1>
          <button 
            onClick={() => navigate("/project/new")}
            className="bg-ebios-orange hover:bg-ebios-orange-dark text-white font-bold py-3 px-6 rounded-xl shadow-xl transition transform hover:scale-105"
          >
            + Créer un Nouveau Projet
          </button>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-700">Liste des Projets</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ebios-orange outline-none"
            >
              <option value="date">Plus récents d'abord</option>
              <option value="risk">Risque Initial le plus élevé</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-md">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 border-r border-gray-200 text-left font-semibold">Nom du Système</th>
                  <th className="p-4 border-r border-gray-200 text-left font-semibold">Contexte</th>
                  <th className="p-4 border-r border-gray-200 text-center font-semibold">Risque Initial Moyen</th>
                  <th className="p-4 border-r border-gray-200 text-center font-semibold">Risque Résiduel Moyen</th>
                  <th className="p-4 border-r border-gray-200 text-center font-semibold">Créé le</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-orange-50 transition border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-bold cursor-pointer" onClick={() => navigate(`/project/${item._id}`)}>
                      <div className="flex items-center gap-2">
                        <span className="text-ebios-orange hover:underline">{item.system_name}</span>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                          item.role === 'Owner' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                          item.role === 'Contributor' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {item.role === 'Owner' ? 'Propriétaire' : item.role === 'Contributor' ? 'Contributeur' : 'Auditeur'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 border-r border-gray-200 truncate max-w-xs">{item.context_description}</td>
                    <td className="p-4 border-r border-gray-200 text-red-600 font-bold text-center">{item.average_initial_risk}</td>
                    <td className="p-4 border-r border-gray-200 text-green-600 font-bold text-center">{item.average_residual_risk}</td>
                    <td className="p-4 border-r border-gray-200 text-center text-gray-500">
                      {new Date(item.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => navigate(`/project/${item._id}`)}
                        className="bg-ebios-dark text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                      >
                        Ouvrir l'Espace
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 italic">Aucun projet trouvé. Cliquez sur "Créer un Nouveau Projet" pour commencer.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
