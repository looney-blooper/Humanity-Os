import React from "react";
import SourceListItem from "./SourceListItem";

export default function SourceList({
  sources,
  loading,
  selectedIndex,
  onSelectSource,
  onDeleteSource,
}) {
  return (
    <div className="mt-2 max-h-[35vh] overflow-auto">
      {loading && (
        <div className="text-zinc-400 text-sm">Loading from database...</div>
      )}
      
      {!loading && sources.length === 0 && (
        <div className="text-zinc-400 text-sm">
          No sources found. Search, or pin on map to add.
        </div>
      )}
      
      <ul className="list-none p-0 m-0">
        {sources.map((source, index) => (
          <SourceListItem
            key={source._id || index}
            source={source}
            index={index}
            isSelected={selectedIndex === index}
            onSelect={() => onSelectSource(index)}
            onDelete={() => onDeleteSource(index)}
          />
        ))}
      </ul>
    </div>
  );
}