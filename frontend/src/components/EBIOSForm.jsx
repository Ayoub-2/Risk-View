import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function EBIOSForm({ onResult, initialData, isEdit }) {
  const [activeTab, setActiveTab] = useState(1);
  const [annexes, setAnnexes] = useState(null);

  // Form State
  const [systemName, setSystemName] = useState("");
  const [contextDesc, setContextDesc] = useState("");
  const [controls, setControls] = useState([{ name: "", implemented: false }]);
  const [origins, setOrigins] = useState([{ source_type: "", motivation: "", target_objective: "" }]);
  const [scenarios, setScenarios] = useState([{ id: "S1", name: "", description: "", risk_origin_idx: 0, business_asset: "", supporting_asset: "", vulnerability: "", likelihood: 1, impact: 1 }]);
  const [treatments, setTreatments] = useState([{ scenario_id: "S1", decision: "Reduce", security_measure: "", residual_likelihood: 1, residual_impact: 1 }]);

  useEffect(() => {
    api.get("/annexes").then((res) => {
      setAnnexes(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialData) {
      setSystemName(initialData.system_name || "");
      setContextDesc(initialData.context_description || "");
      if (initialData.baseline_controls?.length > 0) setControls(initialData.baseline_controls);
      if (initialData.risk_origins?.length > 0) setOrigins(initialData.risk_origins);
      if (initialData.scenarios?.length > 0) setScenarios(initialData.scenarios);
      if (initialData.treatments?.length > 0) setTreatments(initialData.treatments);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      system_name: systemName,
      context_description: contextDesc,
      baseline_controls: controls,
      risk_origins: origins,
      scenarios: scenarios,
      treatments: treatments
    };

    try {
      if (isEdit && initialData?._id) {
        const res = await api.put(`/assess/${initialData._id}`, payload);
        onResult(res.data);
      } else {
        const res = await api.post("/assess", payload);
        onResult(res.data);
      }
    } catch (err) {
      alert("Échec de l'enregistrement de l'évaluation");
    }
  };

  if (!annexes) return <div className="text-center p-8 text-gray-500 font-semibold">Chargement des annexes EBIOS RM...</div>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-ebios-dark">
          {isEdit ? "Modifier les Données du Projet" : "Nouvelle Évaluation des Risques EBIOS RM"}
        </h2>
        <button onClick={handleSubmit} className="px-6 py-2 bg-ebios-orange hover:bg-ebios-orange-dark text-white font-bold rounded-xl shadow transition transform hover:scale-105">
          {isEdit ? "Sauvegarder & Mettre à Jour le Risque" : "Calculer le Risque Final"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab(1)} className={`px-4 py-2 font-semibold rounded-t-lg transition ${activeTab === 1 ? 'bg-orange-50 text-ebios-orange border-b-2 border-ebios-orange' : 'text-gray-500 hover:bg-gray-100'}`}>1. Contexte & Socle</button>
        <button onClick={() => setActiveTab(2)} className={`px-4 py-2 font-semibold rounded-t-lg transition ${activeTab === 2 ? 'bg-orange-50 text-ebios-orange border-b-2 border-ebios-orange' : 'text-gray-500 hover:bg-gray-100'}`}>2. Origines de Risque</button>
        <button onClick={() => setActiveTab(3)} className={`px-4 py-2 font-semibold rounded-t-lg transition ${activeTab === 3 ? 'bg-orange-50 text-ebios-orange border-b-2 border-ebios-orange' : 'text-gray-500 hover:bg-gray-100'}`}>3&4. Scénarios</button>
        <button onClick={() => setActiveTab(4)} className={`px-4 py-2 font-semibold rounded-t-lg transition ${activeTab === 4 ? 'bg-orange-50 text-ebios-orange border-b-2 border-ebios-orange' : 'text-gray-500 hover:bg-gray-100'}`}>5. Traitement du Risque</button>
      </div>
      
      {/* STEP 1: Context & Baseline */}
      {activeTab === 1 && (
        <div className="space-y-4 animate-fade-in">
          <input type="text" placeholder="Nom du Système" value={systemName} onChange={e=>setSystemName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none" />
          <textarea placeholder="Description du Contexte" rows={3} value={contextDesc} onChange={e=>setContextDesc(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none"></textarea>
          
          <h3 className="font-semibold mt-6 text-lg text-ebios-dark">Mesures de Sécurité de Base</h3>
          {controls.map((c, i) => (
             <div key={i} className="flex gap-4 mb-2 items-center">
                <input type="text" placeholder="Nom de la mesure (ex. Chiffrement des données)" value={c.name} onChange={e=>{let nc=[...controls]; nc[i].name=e.target.value; setControls(nc)}} className="border border-gray-300 p-2 rounded-lg flex-grow focus:ring-2 focus:ring-ebios-orange outline-none" />
                <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" className="w-5 h-5 text-ebios-orange accent-ebios-orange" checked={c.implemented} onChange={e=>{let nc=[...controls]; nc[i].implemented=e.target.checked; setControls(nc)}} />
                   Implémentée
                </label>
             </div>
          ))}
          <button onClick={() => setControls([...controls, {name: "", implemented: false}])} className="text-ebios-orange font-semibold hover:underline mt-2">+ Ajouter une Mesure</button>
        </div>
      )}

      {/* STEP 2: Risk Origins */}
      {activeTab === 2 && (
        <div className="space-y-4 animate-fade-in">
          {origins.map((o, i) => (
             <div key={i} className="border border-gray-200 p-4 rounded-xl bg-gray-50 mb-4 space-y-3 relative group">
                <button onClick={() => {let no=[...origins]; no.splice(i,1); setOrigins(no)}} className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 font-bold transition">✕ Supprimer</button>
                <select value={o.source_type} onChange={e=>{let no=[...origins]; no[i].source_type=e.target.value; setOrigins(no)}} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none">
                  <option value="">Sélectionner une Source de Menace...</option>
                  {annexes.threat_sources.map(ts => <option key={ts} value={ts}>{ts}</option>)}
                </select>
                <input type="text" placeholder="Motivation (ex. Gain financier)" value={o.motivation} onChange={e=>{let no=[...origins]; no[i].motivation=e.target.value; setOrigins(no)}} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none" />
                <select value={o.target_objective} onChange={e=>{let no=[...origins]; no[i].target_objective=e.target.value; setOrigins(no)}} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none">
                  <option value="">Sélectionner un Objectif Visé...</option>
                  {annexes.target_objectives.map(to => <option key={to} value={to}>{to}</option>)}
                </select>
             </div>
          ))}
          <button onClick={() => setOrigins([...origins, {source_type: "", motivation: "", target_objective: ""}])} className="text-ebios-orange font-semibold hover:underline">+ Ajouter une Origine de Risque</button>
        </div>
      )}

      {/* STEP 3 & 4: Scenarios */}
      {activeTab === 3 && (
        <div className="space-y-4 animate-fade-in">
          {scenarios.map((s, i) => (
             <div key={i} className="border border-gray-200 p-4 rounded-xl bg-gray-50 mb-4 space-y-3 relative group hover:shadow-md transition">
                <button onClick={() => {let ns=[...scenarios]; ns.splice(i,1); setScenarios(ns)}} className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 font-bold transition">✕ Supprimer</button>
                <div className="flex gap-3">
                   <input type="text" placeholder="ID (ex. S1)" value={s.id} onChange={e=>{let ns=[...scenarios]; ns[i].id=e.target.value; setScenarios(ns)}} className="w-1/4 p-3 border border-gray-300 rounded-lg font-bold focus:ring-2 focus:ring-ebios-orange outline-none" />
                   <input type="text" placeholder="Nom du Scénario" value={s.name} onChange={e=>{let ns=[...scenarios]; ns[i].name=e.target.value; setScenarios(ns)}} className="w-3/4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none" />
                </div>
                <textarea placeholder="Description détaillée du scénario" rows={2} value={s.description} onChange={e=>{let ns=[...scenarios]; ns[i].description=e.target.value; setScenarios(ns)}} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none"></textarea>
                
                <select value={s.risk_origin_idx} onChange={e=>{let ns=[...scenarios]; ns[i].risk_origin_idx=parseInt(e.target.value); setScenarios(ns)}} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none">
                  {origins.map((o, idx) => <option key={idx} value={idx}>Lié à l'Origine: {o.source_type || 'Inconnue'} -> {o.target_objective}</option>)}
                </select>

                <div className="flex gap-3">
                   <input type="text" placeholder="Bien Métier (ex. Base de données clients)" value={s.business_asset} onChange={e=>{let ns=[...scenarios]; ns[i].business_asset=e.target.value; setScenarios(ns)}} className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none" />
                   <input type="text" placeholder="Bien Support (ex. Serveur web)" value={s.supporting_asset} onChange={e=>{let ns=[...scenarios]; ns[i].supporting_asset=e.target.value; setScenarios(ns)}} className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none" />
                </div>
                <input type="text" placeholder="Vulnérabilité exploitée" value={s.vulnerability} onChange={e=>{let ns=[...scenarios]; ns[i].vulnerability=e.target.value; setScenarios(ns)}} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none" />
                
                <div className="flex flex-wrap gap-6 items-center pt-2 border-t border-gray-200">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 font-bold mb-1">Vraisemblance (1-4):</label>
                    <select value={s.likelihood} onChange={e=>{let ns=[...scenarios]; ns[i].likelihood=parseInt(e.target.value); setScenarios(ns)}} className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-ebios-orange outline-none">
                      {[1,2,3,4].map(v => <option key={v} value={v}>{v} - {annexes.likelihood_scale[v]}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 font-bold mb-1">Gravité (1-4):</label>
                    <select value={s.impact} onChange={e=>{let ns=[...scenarios]; ns[i].impact=parseInt(e.target.value); setScenarios(ns)}} className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-ebios-orange outline-none">
                      {[1,2,3,4].map(v => <option key={v} value={v}>{v} - {annexes.impact_scale[v]}</option>)}
                    </select>
                  </div>
                </div>
             </div>
          ))}
          <button onClick={() => setScenarios([...scenarios, {id: `S${scenarios.length+1}`, name: "", description: "", risk_origin_idx: 0, business_asset: "", supporting_asset: "", vulnerability: "", likelihood: 1, impact: 1}])} className="text-ebios-orange font-semibold hover:underline">+ Ajouter un Scénario</button>
        </div>
      )}

      {/* STEP 5: Risk Treatment */}
      {activeTab === 4 && (
        <div className="space-y-4 animate-fade-in">
          {treatments.map((t, i) => (
             <div key={i} className="border border-gray-200 p-4 rounded-xl bg-gray-50 mb-4 space-y-3 relative group hover:shadow-md transition">
                <button onClick={() => {let nt=[...treatments]; nt.splice(i,1); setTreatments(nt)}} className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 font-bold transition">✕ Supprimer</button>
                <select value={t.scenario_id} onChange={e=>{let nt=[...treatments]; nt[i].scenario_id=e.target.value; setTreatments(nt)}} className="w-full p-3 border border-gray-300 rounded-lg font-bold focus:ring-2 focus:ring-ebios-orange outline-none">
                  {scenarios.map(s => <option key={s.id} value={s.id}>Traiter le Scénario: {s.id} ({s.name})</option>)}
                </select>
                
                <select value={t.decision} onChange={e=>{let nt=[...treatments]; nt[i].decision=e.target.value; setTreatments(nt)}} className="w-full p-3 border border-gray-300 rounded-lg text-ebios-dark-secondary font-semibold focus:ring-2 focus:ring-ebios-orange outline-none">
                  <option value="Reduce">Réduire le Risque</option>
                  <option value="Accept">Accepter le Risque</option>
                  <option value="Transfer">Transférer le Risque</option>
                  <option value="Avoid">Éviter le Risque</option>
                </select>

                <textarea placeholder="Mesure de sécurité à mettre en œuvre..." rows={2} value={t.security_measure} onChange={e=>{let nt=[...treatments]; nt[i].security_measure=e.target.value; setTreatments(nt)}} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none"></textarea>

                <div className="flex flex-wrap gap-6 items-center pt-2 border-t border-gray-200">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 font-bold mb-1">Vraisemblance Résiduelle:</label>
                    <input type="number" min="1" max="4" value={t.residual_likelihood} onChange={e=>{let nt=[...treatments]; nt[i].residual_likelihood=parseInt(e.target.value); setTreatments(nt)}} className="p-2 border border-gray-300 rounded-lg w-20 text-center focus:ring-2 focus:ring-ebios-orange outline-none" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 font-bold mb-1">Gravité Résiduelle:</label>
                    <input type="number" min="1" max="4" value={t.residual_impact} onChange={e=>{let nt=[...treatments]; nt[i].residual_impact=parseInt(e.target.value); setTreatments(nt)}} className="p-2 border border-gray-300 rounded-lg w-20 text-center focus:ring-2 focus:ring-ebios-orange outline-none" />
                  </div>
                </div>
             </div>
          ))}
          <button onClick={() => setTreatments([...treatments, {scenario_id: scenarios[0]?.id || "", decision: "Reduce", security_measure: "", residual_likelihood: 1, residual_impact: 1}])} className="text-ebios-orange font-semibold hover:underline">+ Ajouter un Traitement</button>
        </div>
      )}
    </div>
  );
}
