import React from "react";

export default function MapControls({ onFit, onClearRoute }) {
  return (
    <div className="absolute right-4 top-4 z-[400] flex gap-2">
      <button 
        onClick={onFit} 
        className="px-3 py-2 rounded-lg bg-white border-none text-black cursor-pointer font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-lg"
      >
        Fit
      </button>
      <button 
        onClick={onClearRoute} 
        className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white cursor-pointer text-sm hover:bg-zinc-800 transition-colors shadow-lg"
      >
        Clear Route
      </button>
    </div>
  );
}