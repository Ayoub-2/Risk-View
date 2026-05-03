import React from "react";

export default function HeatMapComp({ scenarios }) {
  // EBIOS RM uses a 4x4 Matrix
  const grid = Array.from({ length: 4 }, () => Array(4).fill(0));
  
  // Count scenarios per cell based on Residual Likelihood & Impact
  const mappedScenarios = [];
  
  if (scenarios && scenarios.length > 0) {
    scenarios.forEach(s => {
      // Assuming 1-4 scale. Array index is 0-3, so subtract 1.
      const l = Math.min(Math.max(s.residual_likelihood - 1, 0), 3);
      const i = Math.min(Math.max(s.residual_impact - 1, 0), 3);
      grid[3 - l][i] += 1; // 3-l because Y axis goes bottom-up
      
      mappedScenarios.push({
        name: s.id,
        x: i,
        y: 3 - l,
        score: s.residual_score
      });
    });
  }

  // Define colors for the 4x4 matrix
  // x: Impact (1 to 4) -> 0 to 3
  // y: Likelihood (4 to 1) -> 0 to 3
  const getColor = (row, col) => {
    const risk = (4 - row) * (col + 1); // Likelihood * Impact
    if (risk >= 12) return "bg-red-500";
    if (risk >= 8) return "bg-orange-400";
    if (risk >= 4) return "bg-yellow-300";
    return "bg-green-400";
  };

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-gray-700 font-bold mb-4">Residual Risk Matrix</h4>
      <div className="flex">
        {/* Y Axis Label */}
        <div className="flex flex-col justify-between items-center mr-4 py-8 h-64 text-sm font-semibold text-gray-600">
          <span>Maximal (4)</span>
          <span className="transform -rotate-90 origin-center whitespace-nowrap -ml-8">Likelihood</span>
          <span>Minimal (1)</span>
        </div>

        {/* 4x4 Grid */}
        <div className="grid grid-cols-4 grid-rows-4 w-64 h-64 border-2 border-gray-800">
          {grid.map((row, rowIndex) => 
            row.map((count, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className={`border border-gray-600 flex items-center justify-center font-bold text-white shadow-inner ${getColor(rowIndex, colIndex)}`}
              >
                {count > 0 ? count : ""}
              </div>
            ))
          )}
        </div>
      </div>

      {/* X Axis Label */}
      <div className="flex justify-between w-64 mt-2 ml-10 text-sm font-semibold text-gray-600">
        <span>Negligible (1)</span>
        <span>Impact</span>
        <span>Critical (4)</span>
      </div>
      
      {/* Legend below the matrix */}
      <div className="mt-6 w-full text-sm text-gray-700 max-w-lg">
         <p className="mb-2 font-semibold">Plotted Scenarios (Residual Risk):</p>
         <ul className="list-disc pl-5">
           {scenarios && scenarios.map(s => (
             <li key={s.scenario_id}>
               <strong>{s.scenario_id}</strong>: L{s.residual_likelihood} x I{s.residual_impact} = {s.residual_score} ({s.decision})
             </li>
           ))}
         </ul>
      </div>
    </div>
  );
}
