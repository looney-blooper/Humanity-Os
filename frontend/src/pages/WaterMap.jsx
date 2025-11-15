import React, { useEffect, useRef, useState } from "react";
import {getCoordinates} from "../utils/getCoordinates.js";

export default function WaterQualityFrontendWrapper() {
  const mapElRef = useRef(null);
  const leafletRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);

  const [latInput, setLatInput] = useState('40.7128');
  const [lonInput, setLonInput] = useState('-74.0060');
  const [status, setStatus] = useState('');
  const [sources, setSources] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', lat: 0, lon: 0, tests: {} });

  const STORAGE_KEY = 'waterQualitySources';

  const demoSources = [
    { name: 'Community Well A', lat: 29.7428, lon: 74.9860, distance_km: 3.1, tests: { Nitrate: 3.0, Lead: 0 } },
    { name: 'Spring C', lat: 40.6928, lon: -73.9660, distance_km: 2.4, tests: { Nitrate: 1.5, 'E. coli': 0 } }
  ];

  // Load sources from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSources(parsed);
        }
      }
      const coordsPromise = getCoordinates();
      coordsPromise.then(([lng, lat]) => {
        setLatInput(String(lat));
        setLonInput(String(lng));
      }).catch((e) => {
        console.warn('Geolocation failed', e);
      });
    } catch (e) {
      console.warn('Failed to load from localStorage', e);
    }
  }, []);

  // Save sources to localStorage whenever they change
  useEffect(() => {
    if (sources.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
    }
  }, [sources]);

  useEffect(() => {
    let cancelled = false;
    async function loadLeaflet() {
      if (typeof window === 'undefined') return;
      if (window.L) {
        leafletRef.current = window.L;
        return;
      }
      const cssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      if (!document.querySelector(`link[href="${cssHref}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssHref;
        document.head.appendChild(link);
      }
      if (!document.querySelector('script[data-leaflet]')) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          s.async = true;
          s.setAttribute('data-leaflet', '1');
          s.onload = () => res();
          s.onerror = () => rej(new Error('Failed to load Leaflet'));
          document.body.appendChild(s);
        }).catch((e) => {
          console.warn('Leaflet load failed', e);
        });
      }
      if (window.L && !cancelled) leafletRef.current = window.L;
    }
    loadLeaflet();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapElRef.current) return;
    if (mapRef.current) return;

    mapRef.current = L.map(mapElRef.current, {
      center: [parseFloat(latInput) || 40.7128, parseFloat(lonInput) || -74.0060],
      zoom: 13,
      preferCanvas: true
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { 
      attribution: '© OpenStreetMap contributors, © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapRef.current);

    userMarkerRef.current = L.marker([parseFloat(latInput) || 40.7128, parseFloat(lonInput) || -74.0060]).addTo(mapRef.current).bindPopup('Your location');

    mapRef.current.on('click', (e) => {
      if (pinMode) {
        setNewSource({ name: '', lat: e.latlng.lat, lon: e.latlng.lng, tests: {} });
        setShowAddModal(true);
        setPinMode(false);
        setStatus('');
      }
    });

    // Render existing sources if any
    if (sources.length > 0) {
      renderSourcesOnMap(sources);
    } else {
      renderSourcesOnMap(demoSources);
      setSources(demoSources);
    }

    return () => {
      try { mapRef.current && mapRef.current.remove(); } catch (e) {}
      mapRef.current = null;
    };
  }, [leafletRef.current]);

  useEffect(() => {
    if (mapRef.current && mapElRef.current) {
      mapElRef.current.style.cursor = pinMode ? 'crosshair' : '';
    }
  }, [pinMode]);

  function parseNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function normalizeList(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (const s of list) {
      if (!s) continue;
      const name = s.name || (s.properties && s.properties.name) || s.id || 'unknown';
      const lat = parseNum(s.lat ?? s.latitude ?? (s.geometry && s.geometry.coordinates && s.geometry.coordinates[1]) ?? s.properties?.lat ?? null);
      const lon = parseNum(s.lon ?? s.longitude ?? (s.geometry && s.geometry.coordinates && s.geometry.coordinates[0]) ?? s.properties?.lon ?? null);
      if (lat === null || lon === null) continue;
      const distance_km = parseNum(s.distance_km ?? s.distance) ?? 0;
      const tests = s.tests || s.properties?.tests || {};
      out.push({ name, lat, lon, distance_km, tests });
    }
    return out;
  }

  function renderSourcesOnMap(list) {
    const L = leafletRef.current;
    if (!mapRef.current || !L) return;
    (markersRef.current || []).forEach(m => { try { mapRef.current.removeLayer(m); } catch (e) {} });
    markersRef.current = [];

    for (const s of list) {
      try {
        const m = L.marker([s.lat, s.lon]).addTo(mapRef.current).bindPopup(`<strong>${escapeHtml(s.name)}</strong><br>${(s.distance_km||0).toFixed(2)} km`);
        markersRef.current.push(m);
      } catch (e) { console.warn('marker add failed', e); }
    }
  }

  function renderSources(list) {
    const normalized = normalizeList(list);
    setSources(normalized);
    setSelectedIndex(null);
    setStatus(normalized.length ? `${normalized.length} found` : 'no sources');
    renderSourcesOnMap(normalized);
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function computeRouteTo(dest) {
    const L = leafletRef.current;
    if (!mapRef.current || !L || !dest) return;
    if (routeLayerRef.current) { try { mapRef.current.removeLayer(routeLayerRef.current); } catch (e) {} routeLayerRef.current = null; }

    const userPos = userMarkerRef.current && userMarkerRef.current.getLatLng ? userMarkerRef.current.getLatLng() : null;
    if (!userPos) return;
    setStatus('routing...');
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userPos.lng},${userPos.lat};${dest.lon},${dest.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('OSRM error');
      const j = await res.json();
      if (j.routes && j.routes.length) {
        const coords = j.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        const poly = L.polyline(coords, { color: '#ffffff', weight: 4, opacity: 0.9 }).addTo(mapRef.current);
        routeLayerRef.current = poly;
        try { mapRef.current.fitBounds(poly.getBounds(), { padding: [40, 40] }); } catch (e) {}
        setStatus('route shown');
      } else setStatus('no route');
    } catch (e) {
      console.warn('route error', e);
      setStatus('routing failed');
    }
  }

  async function doSearch() {
    setStatus('searching...');
    setLoading(true);
    if (routeLayerRef.current) { try { mapRef.current.removeLayer(routeLayerRef.current); } catch (e) {} routeLayerRef.current = null; }
    const latN = parseNum(latInput);
    const lonN = parseNum(lonInput);
    if (latN === null || lonN === null) { setStatus('invalid coords'); setLoading(false); return; }
    if (userMarkerRef.current && userMarkerRef.current.setLatLng) {
      try { userMarkerRef.current.setLatLng([latN, lonN]); } catch (e) {}
    }
    if (mapRef.current && mapRef.current.setView) { try { mapRef.current.setView([latN, lonN], 13); } catch (e) {} }

    // Recalculate distances for existing sources
    const updatedSources = sources.map(s => ({
      ...s,
      distance_km: calculateDistance(latN, lonN, s.lat, s.lon)
    }));
    
    renderSources(updatedSources);
    setLoading(false);
  }

  function onUseLocation() {
    setStatus('locating...');
    if (!navigator.geolocation) { setStatus('no geolocation'); return; }
    navigator.geolocation.getCurrentPosition((p) => {
      const latN = p.coords.latitude; const lonN = p.coords.longitude;
      setLatInput(String(latN)); setLonInput(String(lonN));
      if (userMarkerRef.current && userMarkerRef.current.setLatLng) try { userMarkerRef.current.setLatLng([latN, lonN]); } catch (e) {}
      if (mapRef.current && mapRef.current.setView) try { mapRef.current.setView([latN, lonN], 13); } catch (e) {}
      doSearch();
    }, (err) => { setStatus('geolocation failed'); });
  }

  function handleGeoJSONFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const json = JSON.parse(ev.target.result);
        const feats = json.type === 'FeatureCollection' ? (json.features || []) : (json.features ? json.features : []);
        const parsed = feats.map(f => ({ name: f.properties?.name || f.id || 'unknown', geometry: f.geometry, properties: f.properties || {} }));
        const list = parsed.map(p => ({ name: p.name, lat: p.geometry.coordinates[1], lon: p.geometry.coordinates[0], distance_km: 0, tests: p.properties.tests || {} }));
        renderSources(list);
      } catch (e) { setStatus('invalid geojson'); }
    };
    reader.readAsText(file);
  }

  function onSelectSource(i) {
    setSelectedIndex(i);
    const s = sources[i];
    if (s) computeRouteTo(s);
  }

  function onFit() {
    try {
      const coords = [];
      if (userMarkerRef.current && userMarkerRef.current.getLatLng) coords.push(userMarkerRef.current.getLatLng());
      (markersRef.current || []).forEach(m => { try { coords.push(m.getLatLng()); } catch (e) {} });
      if (coords.length && mapRef.current && mapRef.current.fitBounds) mapRef.current.fitBounds(coords, { padding: [40, 40] });
    } catch (e) { }
  }

  function onClearRoute() {
    if (routeLayerRef.current) { try { mapRef.current.removeLayer(routeLayerRef.current); } catch (e) {} routeLayerRef.current = null; }
    setSelectedIndex(null);
    setStatus('');
  }

  function onTogglePinMode() {
    const newPinMode = !pinMode;
    setPinMode(newPinMode);
    setStatus(newPinMode ? '📍 Click on map to pin a source location' : '');
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  function onAddSource() {
    if (!newSource.name.trim()) {
      alert('Please enter a source name');
      return;
    }
    const userPos = userMarkerRef.current && userMarkerRef.current.getLatLng ? userMarkerRef.current.getLatLng() : { lat: parseFloat(latInput), lng: parseFloat(lonInput) };
    const distance = calculateDistance(userPos.lat, userPos.lng, newSource.lat, newSource.lon);
    const sourceToAdd = { ...newSource, distance_km: distance };
    const updatedSources = [...sources, sourceToAdd];
    setSources(updatedSources);
    renderSourcesOnMap(updatedSources);
    setShowAddModal(false);
    setNewSource({ name: '', lat: 0, lon: 0, tests: {} });
    setStatus(`✓ Added ${sourceToAdd.name}`);
  }

  function onDeleteSource(i) {
    const deleted = sources[i];
    const updated = sources.filter((_, idx) => idx !== i);
    setSources(updated);
    renderSourcesOnMap(updated);
    setStatus(`Deleted ${deleted.name}`);
  }

  function onClearAll() {
    if (confirm('Clear all sources from storage?')) {
      setSources([]);
      renderSourcesOnMap([]);
      localStorage.removeItem(STORAGE_KEY);
      setStatus('All sources cleared');
    }
  }

  return (
    <div className="p-4 bg-zinc-950 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">

            <aside className="p-5 border-r border-zinc-800">
              <h1 className="text-lg font-semibold text-white m-0">Water Quality Explorer</h1>
              <p className="mt-1.5 text-zinc-400 text-xs">Enter coordinates, upload GeoJSON, use location, or pin sources on the map.</p>

              <div className="mt-3">
                <label className="block text-xs text-zinc-400 mb-1.5">Latitude</label>
                <input 
                  type="text" 
                  value={latInput} 
                  onChange={(e) => setLatInput(e.target.value)} 
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-sm focus:outline-none focus:border-zinc-500"
                />

                <label className="block text-xs text-zinc-400 mb-1.5 mt-3">Longitude</label>
                <input 
                  type="text" 
                  value={lonInput} 
                  onChange={(e) => setLonInput(e.target.value)} 
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-sm focus:outline-none focus:border-zinc-500"
                />

                <div className="flex gap-2 mt-2.5">
                  <button 
                    onClick={doSearch} 
                    className="flex-1 bg-white text-black px-3 py-2 rounded-lg border-none cursor-pointer font-semibold text-sm hover:bg-zinc-200 transition-colors"
                  >
                    Search
                  </button>
                  <button 
                    onClick={onUseLocation} 
                    className="flex-1 bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg cursor-pointer text-sm hover:bg-zinc-800 transition-colors"
                  >
                    Use Location
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs text-zinc-400 mb-1.5">Upload GeoJSON (optional)</label>
                <input 
                  type="file" 
                  accept="application/geo+json,application/json" 
                  onChange={(e) => handleGeoJSONFile(e.target.files?.[0])} 
                  className="w-full text-zinc-400 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 file:cursor-pointer"
                />
              </div>

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

              <div className="mt-2 max-h-[35vh] overflow-auto">
                {loading && <div className="text-zinc-400 text-sm">Loading...</div>}
                {!loading && sources.length === 0 && <div className="text-zinc-400 text-sm">No sources yet — search, upload GeoJSON, or pin on map.</div>}
                <ul className="list-none p-0 m-0">
                  {sources.map((s, i) => (
                    <li key={i} className="mb-2">
                      <div className={`p-2.5 rounded-lg flex justify-between ${
                        selectedIndex === i 
                          ? 'bg-white/15 border border-white/40' 
                          : 'bg-zinc-950 border border-zinc-700'
                      }`}>
                        <div className="flex-1">
                          <div className="font-semibold text-white text-sm">{s.name}</div>
                          <div className="text-xs text-zinc-400">{s.lat.toFixed(5)}, {s.lon.toFixed(5)}</div>
                        </div>
                        <div className="text-right flex flex-col gap-1">
                          <div className="text-xs text-zinc-400">{(s.distance_km || 0).toFixed(2)} km</div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => onSelectSource(i)} 
                              className="px-3 py-1.5 rounded-md bg-white border-none text-black cursor-pointer text-xs font-semibold hover:bg-zinc-200 transition-colors"
                            >
                              Route
                            </button>
                            <button 
                              onClick={() => onDeleteSource(i)} 
                              className="px-2 py-1.5 rounded-md bg-zinc-950 border border-zinc-700 text-red-400 cursor-pointer text-xs hover:bg-zinc-800 hover:text-red-300 transition-colors"
                              title="Delete source"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-1.5 text-xs text-zinc-400">
                        {Object.entries(s.tests || {}).slice(0,3).map(([k,v]) => (
                          <span key={String(k)} className="mr-2">{k}: {String(v)}</span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {sources.length > 0 && (
                <button 
                  onClick={onClearAll}
                  className="w-full mt-3 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-400 cursor-pointer text-xs hover:bg-zinc-800 hover:text-red-400 transition-colors"
                >
                  Clear All Sources
                </button>
              )}

              <div className="mt-3 text-[11px] text-zinc-500">
                Notes: Data persists in browser localStorage. Uses public OSRM for routing.
              </div>
            </aside>

            <main className="relative">
              <div ref={mapElRef} className="h-[72vh] w-full" />

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
            </main>

          </div>
        </div>
        <div className="text-center py-3 text-zinc-500 text-xs">
          Water Quality Explorer • Data stored locally in browser
        </div>
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[9999]">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[90%] max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-white m-0">Add Clean Water Source</h2>
            <p className="mt-1.5 text-zinc-400 text-sm">
              📍 Location: {newSource.lat.toFixed(5)}, {newSource.lon.toFixed(5)}
            </p>

            <div className="mt-4">
              <label className="block text-xs text-zinc-400 mb-1.5">Source Name *</label>
              <input 
                type="text" 
                value={newSource.name} 
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} 
                placeholder="e.g. Community Well B"
                autoFocus
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs text-zinc-400 mb-1">Water Quality Test Results (optional)</label>
              <div className="text-[11px] text-zinc-500 mb-1.5">
                Enter test results as key-value pairs, one per line
              </div>
              <textarea 
                placeholder="Nitrate: 2.5&#10;Lead: 0&#10;E. coli: 0&#10;pH: 7.2"
                onChange={(e) => {
                  const lines = e.target.value.split('\n');
                  const tests = {};
                  lines.forEach(line => {
                    const [key, val] = line.split(':').map(s => s.trim());
                    if (key && val) tests[key] = isNaN(Number(val)) ? val : Number(val);
                  });
                  setNewSource({ ...newSource, tests });
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-950 text-white min-h-[100px] font-mono text-xs resize-y focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="mt-5 flex gap-2.5">
              <button 
                onClick={onAddSource} 
                className="flex-1 bg-white text-black px-4 py-3 rounded-lg border-none cursor-pointer font-semibold text-sm hover:bg-zinc-200 transition-colors"
              >
                Add Source
              </button>
              <button 
                onClick={() => { 
                  setShowAddModal(false); 
                  setNewSource({ name: '', lat: 0, lon: 0, tests: {} }); 
                  setStatus('');
                }} 
                className="flex-1 bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-lg cursor-pointer text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}