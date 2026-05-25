import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

export default function ThreatModelTab({ initialData, onSave, onImportScenario, lang = "fr" }) {
  // Localized Labels
  const labels = {
    fr: {
      assetsTitle: "🏢 Actifs du Système (Composants)",
      flowsTitle: "🔌 Flux de Données & Communications",
      addAsset: "+ Ajouter un Actif",
      addFlow: "+ Ajouter un Flux",
      assetName: "Nom de l'actif",
      assetType: "Type d'actif",
      isolated: "Isolé (Subnet privé)",
      isolatedYes: "Oui (Sécurisé)",
      isolatedNo: "Non (Exposé)",
      flowSource: "Source",
      flowTarget: "Cible",
      flowProtocol: "Protocole (ex. HTTPS)",
      crossesBoundary: "Traverse Frontière",
      strideTitle: "🛡️ Matrice de Menaces STRIDE Auto-Générée",
      strideHeaders: ["Actif / Flux", "Catégorie STRIDE", "Vecteur de Menace & Guide de Durcissement", "Statut"],
      assistantTitle: "🤖 Assistant IA Modélisation des Menaces",
      assistantInputPlaceholder: "Posez une question sur la sécurité du diagramme...",
      btnSend: "Envoyer",
      btnSaveModel: "Sauvegarder la Modélisation",
      suggestionsTitle: "🎯 Suggestions IA de Scénarios EBIOS à Importer",
      importBtn: "Importer comme scénario EBIOS",
      importSuccess: "Scénario importé avec succès !",
      warningIsolation: "⚠️ Alerte Sécurité: Cet actif n'est pas isolé réseau!",
      warningBoundary: "⚠️ Alerte: Flux non sécurisé traversant une frontière de confiance."
    },
    en: {
      assetsTitle: "🏢 System Assets (Components)",
      flowsTitle: "🔌 Data Flows & Communications",
      addAsset: "+ Add Asset",
      addFlow: "+ Add Flow",
      assetName: "Asset Name",
      assetType: "Asset Type",
      isolated: "Isolated (Private Subnet)",
      isolatedYes: "Yes (Secure)",
      isolatedNo: "No (Exposed)",
      flowSource: "Source",
      flowTarget: "Target",
      flowProtocol: "Protocol (e.g. HTTPS)",
      crossesBoundary: "Crosses Boundary",
      strideTitle: "🛡️ Auto-Generated STRIDE Threat Matrix",
      strideHeaders: ["Asset / Flow", "STRIDE Category", "Threat Vector & Hardening Guide", "Status"],
      assistantTitle: "🤖 AI Threat Modeling Assistant",
      assistantInputPlaceholder: "Ask a question about the diagram's security...",
      btnSend: "Send",
      btnSaveModel: "Save Threat Model",
      suggestionsTitle: "🎯 AI Suggested EBIOS Scenarios for Import",
      importBtn: "Import as EBIOS Scenario",
      importSuccess: "Scenario successfully imported!",
      warningIsolation: "⚠️ Security Alert: This asset has no network isolation!",
      warningBoundary: "⚠️ Alert: Unsecured flow crossing a trust boundary."
    }
  };

  const t = labels[lang] || labels.fr;

  const [assets, setAssets] = useState([]);
  const [flows, setFlows] = useState([]);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (initialData?.threat_model) {
      setAssets(initialData.threat_model.assets || []);
      setFlows(initialData.threat_model.flows || []);
    } else {
      // Default placeholder assets/flows for new diagrams
      setAssets([
        { id: "A1", name: "Client Browser / Web UI", asset_type: "WebApp", is_isolated: false },
        { id: "A2", name: "API Gateway", asset_type: "gateway", is_isolated: true },
        { id: "A3", name: "PostgreSQL Database", asset_type: "Database", is_isolated: false }
      ]);
      setFlows([
        { source: "A1", target: "A2", protocol: "HTTPS", crosses_boundary: true },
        { source: "A2", target: "A3", protocol: "JDBC", crosses_boundary: false }
      ]);
    }
  }, [initialData]);

  // Seed default greetings in chat history based on language
  useEffect(() => {
    setChatHistory([
      {
        role: "assistant",
        content: lang === "fr"
          ? "Bonjour! Je suis votre **Assistant IA Modélisation des Menaces**. \n\nJe peux analyser votre diagramme technique d'actifs, y détecter des risques STRIDE, et générer des scénarios d'évaluation EBIOS RM. \n\n*Essayez de me demander :* \n- **'Lancer une analyse STRIDE'**\n- **'Comment sécuriser ma base de données ?'**\n- **'C'est quoi la méthodologie PASTA ?'**"
          : "Hello! I am your **AI Threat Modeling Assistant**. \n\nI can analyze your asset flows, identify STRIDE threat vectors, and automatically generate corresponding EBIOS RM risk scenarios. \n\n*Try asking me:* \n- **'Run a STRIDE analysis'**\n- **'How to secure my database?'**\n- **'What is the PASTA framework?'**"
      }
    ]);
  }, [lang]);

  const handleAddAsset = () => {
    const nextId = `A${assets.length + 1}`;
    setAssets([...assets, { id: nextId, name: `Asset ${assets.length + 1}`, asset_type: "API", is_isolated: false }]);
  };

  const handleRemoveAsset = (idx) => {
    const newAssets = [...assets];
    const removedId = newAssets[idx].id;
    newAssets.splice(idx, 1);
    setAssets(newAssets);
    
    // Purge linked flows
    const newFlows = flows.filter(f => f.source !== removedId && f.target !== removedId);
    setFlows(newFlows);
  };

  const handleAddFlow = () => {
    if (assets.length < 2) {
      toast.warning(lang === "fr" ? "Veuillez d'abord ajouter au moins 2 actifs." : "Please add at least 2 assets first.");
      return;
    }
    setFlows([...flows, { source: assets[0].id, target: assets[1].id, protocol: "HTTPS", crosses_boundary: false }]);
  };

  const handleSave = () => {
    onSave({ assets, flows });
    toast.success(lang === "fr" ? "Modèle de menaces sauvegardé !" : "Threat model successfully saved!");
  };

  const handleSendChat = async (presetMessage = null) => {
    const textToSend = presetMessage || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = { role: "user", content: textToSend };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    if (!presetMessage) setChatInput("");
    setIsThinking(true);

    try {
      const res = await api.post(`/assessments/${initialData?._id || 0}/threat-model/ai-chat`, {
        history: updatedHistory.slice(-10), // keep history window sane
        message: textToSend,
        threat_model: { assets, flows }
      }, {
        headers: { "Accept-Language": lang }
      });

      setChatHistory([...updatedHistory, { role: "assistant", content: res.data.content }]);
      if (res.data.suggestions && res.data.suggestions.length > 0) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      toast.error(lang === "fr" ? "Échec de connexion avec l'assistant" : "Failed to contact the threat assistant.");
    } finally {
      setIsThinking(false);
    }
  };

  const triggerImport = (scenario) => {
    onImportScenario(scenario);
    toast.success(t.importSuccess);
  };

  // Automated Reactive STRIDE Logic
  const getAutoStrideThreats = () => {
    const strideList = [];
    assets.forEach(a => {
      const name = a.name;
      const type = a.asset_type.toLowerCase();
      
      if (type === "database") {
        strideList.push({
          target: name,
          category: "T / I",
          desc: lang === "fr" 
            ? "Altération de logs ou vol de données confidentielles (Tampering & Information Disclosure)."
            : "Data tampering or exfiltration of sensitive DB columns (Tampering & Information Disclosure).",
          status: a.is_isolated ? "Passed" : "Warning"
        });
      } else if (type === "gateway" || type === "api") {
        strideList.push({
          target: name,
          category: "S / D",
          desc: lang === "fr" 
            ? "Usurpation d'identité d'appelant ou blocage par déni de service (Spoofing & Denial of Service)."
            : "Caller identity spoofing or resource starvation attacks (Spoofing & Denial of Service).",
          status: "Passed"
        });
      } else if (type === "webapp" || type === "external web ui") {
        strideList.push({
          target: name,
          category: "S / E",
          desc: lang === "fr"
            ? "Vol de session utilisateur ou détournement de privilèges (Spoofing & Elevation of Privilege)."
            : "User session hijacking or privilege escalation (Spoofing & Elevation of Privilege).",
          status: "Passed"
        });
      }
    });

    flows.forEach((f, i) => {
      if (f.crosses_boundary) {
        const srcName = assets.find(a => a.id === f.source)?.name || f.source;
        const tgtName = assets.find(a => a.id === f.target)?.name || f.target;
        
        strideList.push({
          target: `${srcName} ➡️ ${tgtName}`,
          category: "I",
          desc: lang === "fr"
            ? f.protocol.toLowerCase().includes("s") || f.protocol.toLowerCase().includes("ssh")
              ? "Transmission traversant une frontière protégée de confiance (Sécurisé)."
              : `Alerte: Transmission en clair via protocole ${f.protocol} traversant la frontière !`
            : f.protocol.toLowerCase().includes("s") || f.protocol.toLowerCase().includes("ssh")
              ? "Protected transmission crossing a trust boundary (Secure)."
              : `Alert: Cleartext transmission via ${f.protocol} crossing a trust boundary!`,
          status: f.protocol.toLowerCase().includes("s") || f.protocol.toLowerCase().includes("ssh") ? "Passed" : "Warning"
        });
      }
    });

    return strideList;
  };

  const reactiveThreats = getAutoStrideThreats();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT & CENTER COLS: Asset configuration and stride matrix */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Assets Configuration Panel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {t.assetsTitle}
            </h3>
            <button onClick={handleAddAsset} className="px-4 py-1.5 bg-ebios-orange hover:bg-ebios-orange-dark text-white font-bold text-sm rounded-lg shadow-sm transition">
              {t.addAsset}
            </button>
          </div>
          
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {assets.map((asset, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 relative group">
                <span className="w-8 h-8 flex items-center justify-center bg-orange-100 text-ebios-orange font-bold rounded-lg text-xs">
                  {asset.id}
                </span>
                
                <input type="text" value={asset.name} onChange={e => {
                  const na = [...assets];
                  na[i].name = e.target.value;
                  setAssets(na);
                }} placeholder={t.assetName} className="flex-1 min-w-[150px] p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-ebios-orange" />
                
                <select value={asset.asset_type} onChange={e => {
                  const na = [...assets];
                  na[i].asset_type = e.target.value;
                  setAssets(na);
                }} className="p-2 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-ebios-orange">
                  <option value="Database">Database / DB</option>
                  <option value="API">API Endpoint</option>
                  <option value="gateway">API Gateway</option>
                  <option value="WebApp">Web Application</option>
                  <option value="AD">Active Directory</option>
                  <option value="Third-party">Third-Party Service</option>
                </select>
                
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                  <input type="checkbox" checked={asset.is_isolated} onChange={e => {
                    const na = [...assets];
                    na[i].is_isolated = e.target.checked;
                    setAssets(na);
                  }} className="w-4 h-4 text-ebios-orange accent-ebios-orange" />
                  {t.isolated}
                </label>
                
                <button onClick={() => handleRemoveAsset(i)} className="p-2 text-red-500 hover:text-red-700 font-bold text-sm ml-auto opacity-0 group-hover:opacity-100 transition">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Flows Configuration Panel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {t.flowsTitle}
            </h3>
            <button onClick={handleAddFlow} className="px-4 py-1.5 bg-ebios-orange hover:bg-ebios-orange-dark text-white font-bold text-sm rounded-lg shadow-sm transition">
              {t.addFlow}
            </button>
          </div>
          
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {flows.map((flow, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 relative group">
                <select value={flow.source} onChange={e => {
                  const nf = [...flows];
                  nf[i].source = e.target.value;
                  setFlows(nf);
                }} className="p-2 text-sm border border-gray-300 rounded-lg bg-white outline-none">
                  {assets.map(a => <option key={a.id} value={a.id}>{a.id} ({a.name})</option>)}
                </select>
                
                <span className="text-gray-400">➡️</span>
                
                <select value={flow.target} onChange={e => {
                  const nf = [...flows];
                  nf[i].target = e.target.value;
                  setFlows(nf);
                }} className="p-2 text-sm border border-gray-300 rounded-lg bg-white outline-none">
                  {assets.map(a => <option key={a.id} value={a.id}>{a.id} ({a.name})</option>)}
                </select>
                
                <input type="text" value={flow.protocol} onChange={e => {
                  const nf = [...flows];
                  nf[i].protocol = e.target.value;
                  setFlows(nf);
                }} placeholder={t.flowProtocol} className="w-32 p-2 text-sm border border-gray-300 rounded-lg outline-none" />
                
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                  <input type="checkbox" checked={flow.crosses_boundary} onChange={e => {
                    const nf = [...flows];
                    nf[i].crosses_boundary = e.target.checked;
                    setFlows(nf);
                  }} className="w-4 h-4 text-ebios-orange accent-ebios-orange" />
                  {t.crossesBoundary}
                </label>
                
                <button onClick={() => {
                  const nf = [...flows];
                  nf.splice(i, 1);
                  setFlows(nf);
                }} className="p-2 text-red-500 hover:text-red-700 font-bold text-sm ml-auto opacity-0 group-hover:opacity-100 transition">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic STRIDE Threats Matrix Table */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
            {t.strideTitle}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                  {t.strideHeaders.map((h, idx) => (
                    <th key={idx} className="pb-3 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reactiveThreats.map((rt, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-2 font-bold text-gray-700">{rt.target}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 bg-orange-50 text-ebios-orange font-bold rounded text-xs border border-orange-100">
                        {rt.category}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-650">{rt.desc}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        rt.status === "Passed" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-700 border border-red-200 animate-pulse"
                      }`}>
                        {rt.status === "Passed" ? t.isolatedYes : t.isolatedNo}
                      </span>
                    </td>
                  </tr>
                ))}
                {reactiveThreats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 font-semibold">
                      Aucune menace identifiée pour le moment. Renseignez des composants pour lancer la simulation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end pt-2">
            <button onClick={handleSave} className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow transition transform hover:scale-[1.02]">
              {t.btnSaveModel}
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COL: Conversational AI assistant */}
      <div className="space-y-6">
        
        {/* Chat Drawer interface */}
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm flex flex-col h-[580px] overflow-hidden">
          
          {/* Header */}
          <div className="bg-gray-900 text-white p-4 flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="font-bold text-sm">{t.assistantTitle}</h3>
              <p className="text-[10px] text-gray-300 font-semibold">STRIDE & EBIOS RM Copilot</p>
            </div>
          </div>
          
          {/* Messages Logs */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                  msg.role === "user" 
                    ? "bg-ebios-orange text-white rounded-tr-none" 
                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-none whitespace-pre-line"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 text-sm flex items-center gap-2 text-gray-500 font-semibold shadow-sm">
                  <span className="w-2 h-2 bg-ebios-orange rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-ebios-orange rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-ebios-orange rounded-full animate-bounce delay-200"></span>
                  Thinking...
                </div>
              </div>
            )}
          </div>
          
          {/* Quick seeded prompts triggers */}
          <div className="p-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button onClick={() => handleSendChat(lang === "fr" ? "Lancer une analyse STRIDE" : "Run a STRIDE analysis")} className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-ebios-orange border border-orange-200 rounded-full text-xs font-bold transition">
              ⚡ STRIDE Analysis
            </button>
            <button onClick={() => handleSendChat(lang === "fr" ? "Comment sécuriser ma base de données ?" : "How to secure my database?")} className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-ebios-orange border border-orange-200 rounded-full text-xs font-bold transition">
              💾 Database Hardening
            </button>
            <button onClick={() => handleSendChat(lang === "fr" ? "C'est quoi la méthodologie PASTA ?" : "What is the PASTA framework?")} className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-ebios-orange border border-orange-200 rounded-full text-xs font-bold transition">
              🍝 PASTA Model
            </button>
          </div>

          {/* Form Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSendChat(); }} placeholder={t.assistantInputPlaceholder} className="flex-1 p-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-ebios-orange" />
            <button onClick={() => handleSendChat()} className="px-4 bg-ebios-orange hover:bg-ebios-orange-dark text-white font-bold rounded-xl shadow-sm text-sm transition">
              {t.btnSend}
            </button>
          </div>

        </div>

        {/* AI Suggested EBIOS Scenarios Import Panel */}
        {suggestions.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4 animate-fade-in">
            <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
              {t.suggestionsTitle}
            </h4>
            
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {suggestions.map((s, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">{s.id} - {s.name}</span>
                    <span className="px-1.5 py-0.5 bg-orange-100 text-ebios-orange rounded font-bold">L:{s.likelihood} I:{s.impact}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{s.description}</p>
                  <div className="flex gap-2 text-[10px] text-gray-400 font-semibold">
                    <span>🏢 Actif Métier: {s.business_asset}</span>
                    <span>•</span>
                    <span>💻 Actif Support: {s.supporting_asset}</span>
                  </div>
                  <button onClick={() => triggerImport(s)} className="w-full mt-1.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-ebios-orange border border-orange-200 font-bold rounded-lg transition">
                    📥 {t.importBtn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
