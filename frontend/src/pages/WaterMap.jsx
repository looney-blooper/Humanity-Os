import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { getCoordinates, calculateDistance, transformWaterSource } from "../utils/waterUtils";
import MapView from "../components/watermap/MapView";
import Sidebar from "../components/waterMap/Sidebar";
import AddSourceModal from "../components/waterMap/AddSourceModal.jsx";

export default function WaterMap() {
  const [latInput, setLatInput] = useState('40.7128');
  const [lonInput, setLonInput] = useState('-74.0060');
  const [status, setStatus] = useState('');
  const [sources, setSources] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', lat: 0, lon: 0, tests: {} });
  const [mapReady, setMapReady] = useState(false);

  const { getWaterSources, addWaterSource, deleteWaterSource } = useAuthStore();

  // Initialize: Get user location and load sources
  useEffect(() => {
    async function init() {
      let userLat = 40.7128;
      let userLon = -74.0060;
      
      try {
        const [lng, lat] = await getCoordinates();
        userLat = lat;
        userLon = lng;
        setLatInput(String(lat));
        setLonInput(String(lng));
      } catch (e) {
        console.warn('Geolocation failed, using default location', e);
      }

      await fetchSourcesFromBackend(userLat, userLon);
    }
    init();
  }, []);

  // Fetch sources from backend
  async function fetchSourcesFromBackend(lat, lon, radius = 50) {
    setLoading(true);
    try {
      const result = await getWaterSources(lat, lon, radius);
      if (result.ok && result.data) {
        const transformedSources = result.data.map(source => 
          transformWaterSource(source, lat, lon)
        );
        setSources(transformedSources);
        setStatus(`${transformedSources.length} sources found`);
      } else {
        setStatus('No sources found');
        setSources([]);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
      setStatus('Error loading sources');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    setStatus('searching...');
    const latN = parseFloat(latInput);
    const lonN = parseFloat(lonInput);
    
    if (isNaN(latN) || isNaN(lonN)) { 
      setStatus('Invalid coordinates'); 
      return; 
    }
    
    await fetchSourcesFromBackend(latN, lonN);
  }

  async function handleUseLocation() {
    setStatus('locating...');
    try {
      const [lng, lat] = await getCoordinates();
      setLatInput(String(lat));
      setLonInput(String(lng));
      await fetchSourcesFromBackend(lat, lng);
    } catch (error) {
      setStatus('Geolocation failed');
    }
  }

  function handleTogglePinMode() {
    const newPinMode = !pinMode;
    setPinMode(newPinMode);
    setStatus(newPinMode ? '📍 Click on map to pin a source location' : '');
  }

  function handleMapClick(lat, lon) {
    if (pinMode) {
      setNewSource({ name: '', lat, lon, tests: {} });
      setShowAddModal(true);
      setPinMode(false);
      setStatus('');
    }
  }

  async function handleAddSource(sourceData) {
    setStatus('Adding source...');
    
    const dataToSend = {
      name: sourceData.name,
      source: "User Submitted",
      quality: "Unknown",
      tests: sourceData.tests || {},
      location: {
        type: "Point",
        coordinates: [sourceData.lon, sourceData.lat]
      }
    };

    const result = await addWaterSource(dataToSend);
    
    if (result.ok) {
      setStatus(`✓ Added ${sourceData.name}`);
      setShowAddModal(false);
      setNewSource({ name: '', lat: 0, lon: 0, tests: {} });
      
      const latN = parseFloat(latInput);
      const lonN = parseFloat(lonInput);
      await fetchSourcesFromBackend(latN, lonN);
    } else {
      setStatus(`Error: ${result.error}`);
    }
  }

  async function handleDeleteSource(index) {
    const source = sources[index];
    if (!source._id) {
      alert('Cannot delete: No ID found');
      return;
    }

    if (!confirm(`Delete ${source.name}?`)) return;

    setStatus('Deleting...');
    const result = await deleteWaterSource(source._id);
    
    if (result.ok) {
      setStatus(`Deleted ${source.name}`);
      const latN = parseFloat(latInput);
      const lonN = parseFloat(lonInput);
      await fetchSourcesFromBackend(latN, lonN);
    } else {
      setStatus(`Error: ${result.error}`);
    }
  }

  async function handleClearAll() {
    if (!confirm('This will delete all sources from the database. Continue?')) return;
    
    setStatus('Deleting all sources...');
    
    for (const source of sources) {
      if (source._id) {
        await deleteWaterSource(source._id);
      }
    }
    
    setSources([]);
    setStatus('All sources cleared');
  }

  return (
    <div className="p-4 bg-zinc-950 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
            
            <Sidebar
              latInput={latInput}
              lonInput={lonInput}
              onLatChange={setLatInput}
              onLonChange={setLonInput}
              onSearch={handleSearch}
              onUseLocation={handleUseLocation}
              pinMode={pinMode}
              onTogglePinMode={handleTogglePinMode}
              status={status}
              loading={loading}
              sources={sources}
              selectedIndex={selectedIndex}
              onSelectSource={setSelectedIndex}
              onDeleteSource={handleDeleteSource}
              onClearAll={handleClearAll}
            />

            <MapView
              lat={parseFloat(latInput)}
              lon={parseFloat(lonInput)}
              sources={sources}
              selectedIndex={selectedIndex}
              pinMode={pinMode}
              onMapClick={handleMapClick}
              onMapReady={setMapReady}
            />

          </div>
        </div>
        
        <div className="text-center py-3 text-zinc-500 text-xs">
          Water Quality Explorer • Data synced with MongoDB database
        </div>
      </div>

      <AddSourceModal
        show={showAddModal}
        sourceData={newSource}
        onAdd={handleAddSource}
        onCancel={() => {
          setShowAddModal(false);
          setNewSource({ name: '', lat: 0, lon: 0, tests: {} });
          setStatus('');
        }}
        onUpdate={setNewSource}
      />
    </div>
  );
}