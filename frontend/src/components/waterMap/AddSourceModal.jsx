import React from "react";
import { parseTestResults } from "../../utils/waterUtils";

export default function AddSourceModal({
  show,
  sourceData,
  onAdd,
  onCancel,
  onUpdate,
}) {
  if (!show) return null;

  function handleNameChange(e) {
    onUpdate({ ...sourceData, name: e.target.value });
  }

  function handleTestsChange(e) {
    const tests = parseTestResults(e.target.value);
    onUpdate({ ...sourceData, tests });
  }

  function handleSubmit() {
    if (!sourceData.name.trim()) {
      alert('Please enter a source name');
      return;
    }
    onAdd(sourceData);
  }

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[9999]">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[90%] max-w-md shadow-2xl">
        <h2 className="text-lg font-semibold text-white m-0">
          Add Clean Water Source
        </h2>
        <p className="mt-1.5 text-zinc-400 text-sm">
          📍 Location: {sourceData.lat.toFixed(5)}, {sourceData.lon.toFixed(5)}
        </p>

        <div className="mt-4">
          <label className="block text-xs text-zinc-400 mb-1.5">
            Source Name *
          </label>
          <input 
            type="text" 
            value={sourceData.name} 
            onChange={handleNameChange} 
            placeholder="e.g. Community Well B"
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs text-zinc-400 mb-1">
            Water Quality Test Results (optional)
          </label>
          <div className="text-[11px] text-zinc-500 mb-1.5">
            Enter test results as key-value pairs, one per line
          </div>
          <textarea 
            placeholder="Nitrate: 2.5&#10;Lead: 0&#10;E. coli: 0&#10;pH: 7.2"
            onChange={handleTestsChange}
            className="w-full px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-950 text-white min-h-[100px] font-mono text-xs resize-y focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="mt-5 flex gap-2.5">
          <button 
            onClick={handleSubmit} 
            className="flex-1 bg-white text-black px-4 py-3 rounded-lg border-none cursor-pointer font-semibold text-sm hover:bg-zinc-200 transition-colors"
          >
            Add Source
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-lg cursor-pointer text-sm hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}