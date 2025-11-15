import React from "react";

export default function CoordinateInputs({
  latInput,
  lonInput,
  onLatChange,
  onLonChange,
  onSearch,
  onUseLocation,
  loading,
}) {
  return (
    <div className="mt-3">
      <label className="block text-xs text-zinc-400 mb-1.5">Latitude</label>
      <input 
        type="text" 
        value={latInput} 
        onChange={(e) => onLatChange(e.target.value)} 
        className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-sm focus:outline-none focus:border-zinc-500"
        disabled={loading}
      />

      <label className="block text-xs text-zinc-400 mb-1.5 mt-3">Longitude</label>
      <input 
        type="text" 
        value={lonInput} 
        onChange={(e) => onLonChange(e.target.value)} 
        className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-sm focus:outline-none focus:border-zinc-500"
        disabled={loading}
      />

      <div className="flex gap-2 mt-2.5">
        <button 
          onClick={onSearch} 
          disabled={loading}
          className="flex-1 bg-white text-black px-3 py-2 rounded-lg border-none cursor-pointer font-semibold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
        <button 
          onClick={onUseLocation} 
          disabled={loading}
          className="flex-1 bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg cursor-pointer text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Use Location
        </button>
      </div>
    </div>
  );
}
