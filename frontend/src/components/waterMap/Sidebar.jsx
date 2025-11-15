import React from "react";
import CoordinateInputs from "./CoordinateInputs";
import SourceList from "./SourceList";

export default function Sidebar({
  latInput,
  lonInput,
  onLatChange,
  onLonChange,
  onSearch,
  onUseLocation,
  pinMode,
  onTogglePinMode,
  status,
  loading,
  sources,
  selectedIndex,
  onSelectSource,
  onDeleteSource,
  onClearAll,
}) {
  return (
    <aside className="p-5 border-r border-zinc-800">
      <h1 className="text-lg font-semibold text-white m-0">Water Quality Explorer</h1>
      <p className="mt-1.5 text-zinc-400 text-xs">
        Enter coordinates, use location, or pin sources on the map. Data syncs with database.
      </p>

      <CoordinateInputs
        latInput={latInput}
        lonInput={lonInput}
        onLatChange={onLatChange}
        onLonChange={onLonChange}
        onSearch={onSearch}
        onUseLocation={onUseLocation}
        loading={loading}
      />

      <div className="mt-3 flex gap-2 items-center">
        <strong className="text-xs text-white">Clean sources</strong>
        <button 
          onClick={onTogglePinMode} 
          className={`ml-auto px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
            pinMode 
              ? 'bg-white text-black' 
              : 'bg-zinc-950 border border-zinc-700 text-white hover:bg-zinc-800'
          }`}
        >
          {pinMode ? '📍 Pin Active' : '+ Pin Source'}
        </button>
      </div>
      
      <div className="text-xs text-zinc-400 mt-1 min-h-4">{status}</div>

      <SourceList
        sources={sources}
        loading={loading}
        selectedIndex={selectedIndex}
        onSelectSource={onSelectSource}
        onDeleteSource={onDeleteSource}
      />

      {sources.length > 0 && (
        <button 
          onClick={onClearAll}
          disabled={loading}
          className="w-full mt-3 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-400 cursor-pointer text-xs hover:bg-zinc-800 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All Sources
        </button>
      )}

      <div className="mt-3 text-[11px] text-zinc-500">
        Data stored in MongoDB. Uses OSRM for routing.
      </div>
    </aside>
  );
}