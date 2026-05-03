import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/register", { email, password });
      alert("Inscription réussie, vous pouvez maintenant vous connecter.");
      navigate("/login");
    } catch (err) {
      setError("L'email existe déjà ou la saisie est invalide.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-center text-ebios-dark">Inscription</h2>
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
            className="w-full bg-ebios-dark hover:bg-gray-800 text-white font-bold py-3 rounded-lg shadow transition"
          >
            S'inscrire
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Vous avez déjà un compte ?{" "}
          <button onClick={() => navigate("/login")} className="text-ebios-orange font-semibold hover:underline">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
