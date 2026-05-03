import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { email, password });
      onLogin(res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Identifiants invalides");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-center text-ebios-dark">Connexion</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center font-semibold">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Adresse Email</label>
            <input 
              type="email" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Mot de passe</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebios-orange outline-none"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-ebios-orange hover:bg-ebios-orange-dark text-white font-bold py-3 rounded-lg shadow transition"
          >
            Se Connecter
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Pas encore de compte ?{" "}
          <button onClick={() => navigate("/register")} className="text-ebios-orange font-semibold hover:underline">
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
}
