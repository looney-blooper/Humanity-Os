import React from "react";
import { formatTestResults } from "../../utils/waterUtils";

export default function SourceListItem({
  source,
  index,
  isSelected,
  onSelect,
  onDelete,
}) {
  return (
    <li className="mb-2">
      <div className={`p-2.5 rounded-lg flex justify-between ${
        isSelected 
          ? 'bg-white/15 border border-white/40' 
          : 'bg-zinc-950 border border-zinc-700'
      }`}>
        <div className="flex-1">
          <div className="font-semibold text-white text-sm">{source.name}</div>
          <div className="text-xs text-zinc-400">
            {source.lat.toFixed(5)}, {source.lon.toFixed(5)}
          </div>
        </div>
        
        <div className="text-right flex flex-col gap-1">
          <div className="text-xs text-zinc-400">
            {(source.distance_km || 0).toFixed(2)} km
          </div>
          <div className="flex gap-1">
            <button 
              onClick={onSelect} 
              className="px-3 py-1.5 rounded-md bg-white border-none text-black cursor-pointer text-xs font-semibold hover:bg-zinc-200 transition-colors"
            >
              Route
            </button>
            <button 
              onClick={onDelete} 
              className="px-2 py-1.5 rounded-md bg-zinc-950 border border-zinc-700 text-red-400 cursor-pointer text-xs hover:bg-zinc-800 hover:text-red-300 transition-colors"
              title="Delete source"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
      
      {source.tests && Object.keys(source.tests).length > 0 && (
        <div className="mt-1.5 text-xs text-zinc-400">
          {formatTestResults(source.tests, 3)}
        </div>
      )}
    </li>
  );
}