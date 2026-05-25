import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import ProjectDetails from "./pages/ProjectDetails";

import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return (storedToken && storedToken !== "undefined" && storedToken !== "null") ? storedToken : null;
  });

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const isAuthenticated = token && token !== "undefined" && token !== "null";

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/project/new"
              element={
                isAuthenticated ? (
                  <ProjectDetails isNew={true} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/project/:id"
              element={
                isAuthenticated ? (
                  <ProjectDetails isNew={false} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      </div>
    </Router>
  );
}

export default App;
