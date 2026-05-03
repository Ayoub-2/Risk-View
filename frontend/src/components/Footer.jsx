import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ebios-dark text-gray-300 py-8 mt-auto border-t border-ebios-dark-secondary">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
        
        <div className="flex flex-col items-center md:items-start space-y-1">
          <span className="font-bold text-white text-lg tracking-wide">Risk<span className="text-ebios-orange">View</span></span>
          <span>© {currentYear} Plateforme d'Analyse des Risques. Tous droits réservés.</span>
        </div>

        <div className="flex flex-col items-center md:items-end space-y-1 text-center md:text-right">
          <span className="font-semibold text-gray-400">Méthodologies Supportées :</span>
          <div className="flex items-center space-x-3 mt-1">
            <span className="bg-ebios-dark-secondary px-3 py-1 rounded text-xs font-medium border border-gray-700">
              EBIOS Risk Manager (ANSSI)
            </span>
            <span className="bg-ebios-dark-secondary px-3 py-1 rounded text-xs font-medium border border-gray-700">
              ISO/IEC 27005
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
