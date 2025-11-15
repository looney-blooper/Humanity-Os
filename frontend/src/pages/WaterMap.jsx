import React, { useEffect, useRef, useState } from "react";

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

  const demoSources = [
    { name: 'Community Well A', lat: 40.7428, lon: -73.9860, distance_km: 3.1, tests: { Nitrate: 3.0, Lead: 0 } },
    { name: 'Spring C', lat: 40.6928, lon: -73.9660, distance_km: 2.4, tests: { Nitrate: 1.5, 'E. coli': 0 } }
  ];

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
    
    // Dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { 
      attribution: '© OpenStreetMap contributors, © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapRef.current);

    userMarkerRef.current = L.marker([parseFloat(latInput) || 40.7128, parseFloat(lonInput) || -74.0060]).addTo(mapRef.current).bindPopup('Your location');

    renderSources(demoSources);

    return () => {
      try { mapRef.current && mapRef.current.remove(); } catch (e) {}
      mapRef.current = null;
    };
  }, [leafletRef.current]);

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

  function renderSources(list) {
    const L = leafletRef.current;
    if (!mapRef.current || !L) return;
    (markersRef.current || []).forEach(m => { try { mapRef.current.removeLayer(m); } catch (e) {} });
    markersRef.current = [];

    const normalized = normalizeList(list);
    setSources(normalized);
    setSelectedIndex(null);
    setStatus(normalized.length ? `${normalized.length} found` : 'no sources');

    for (const s of normalized) {
      try {
        const m = L.marker([s.lat, s.lon]).addTo(mapRef.current).bindPopup(`<strong>${escapeHtml(s.name)}</strong><br>${(s.distance_km||0).toFixed(2)} km`);
        markersRef.current.push(m);
      } catch (e) { console.warn('marker add failed', e); }
    }
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

  async function fetchBackend(lat, lon) {
    try {
      const res = await fetch('/api/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat, lon }) });
      if (!res.ok) throw new Error('no backend');
      const j = await res.json();
      const list = Array.isArray(j.clean_sources) ? j.clean_sources : [];
      return normalizeList(list);
    } catch (e) {
      console.warn('backend fetch failed', e);
      throw e;
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

    try {
      const backendList = await fetchBackend(latN, lonN);
      if (backendList && backendList.length) renderSources(backendList);
      else renderSources(demoSources);
    } catch (e) {
      renderSources(demoSources);
    } finally { setLoading(false); }
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

  useEffect(() => { if (leafletRef.current && mapRef.current) renderSources(demoSources); }, [leafletRef.current]);

  return (
    <div style={{ padding: 18, background: '#0a0a0a', minHeight: '100vh', fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: '#0b0b0b', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr' }}>

            <aside style={{ padding: 20, borderRight: '1px solid rgba(255,255,255,0.2)' }}>
              <h1 style={{ margin: 0, fontSize: 18, color: '#fff' }}>Water Quality Explorer</h1>
              <p style={{ marginTop: 6, color: '#9ca3af', fontSize: 13 }}>Enter coordinates, upload GeoJSON of sources, or use your location. Pick a source to route to it.</p>

              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af' }}>Latitude</label>
                <input 
                  type="text" 
                  value={latInput} 
                  onChange={(e) => setLatInput(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: 8, 
                    borderRadius: 8, 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    marginTop: 6,
                    background: '#0a0a0a',
                    color: '#fff'
                  }} 
                />

                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginTop: 12 }}>Longitude</label>
                <input 
                  type="text" 
                  value={lonInput} 
                  onChange={(e) => setLonInput(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: 8, 
                    borderRadius: 8, 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    marginTop: 6,
                    background: '#0a0a0a',
                    color: '#fff'
                  }} 
                />

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button 
                    onClick={(e) => { e.preventDefault(); doSearch(); }} 
                    style={{ 
                      flex: 1, 
                      background: '#fff', 
                      color: '#000', 
                      padding: '8px 10px', 
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Search
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); onUseLocation(); }} 
                    style={{ 
                      flex: 1, 
                      background: '#0a0a0a', 
                      border: '1px solid rgba(255,255,255,0.2)', 
                      color: '#fff', 
                      padding: '8px 10px', 
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    Use Location
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af' }}>Upload GeoJSON (optional)</label>
                <input 
                  type="file" 
                  accept="application/geo+json,application/json" 
                  onChange={(e) => handleGeoJSONFile(e.target.files?.[0])} 
                  style={{ 
                    width: '100%', 
                    marginTop: 6,
                    color: '#9ca3af',
                    fontSize: 12
                  }} 
                />
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <strong style={{ fontSize: 12, color: '#fff' }}>Clean sources</strong>
                <div style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>{status}</div>
              </div>

              <div style={{ marginTop: 8, maxHeight: '38vh', overflow: 'auto' }}>
                {loading && <div style={{ color: '#9ca3af' }}>Loading...</div>}
                {!loading && (!sources || sources.length === 0) && <div style={{ color: '#9ca3af' }}>No sources yet — search or upload GeoJSON.</div>}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {sources.map((s, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      <div style={{ 
                        padding: 10, 
                        borderRadius: 8, 
                        background: selectedIndex === i ? 'rgba(255,255,255,0.15)' : '#0a0a0a', 
                        border: `1px solid ${selectedIndex === i ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}`, 
                        display: 'flex', 
                        justifyContent: 'space-between' 
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{s.lat.toFixed(5)}, {s.lon.toFixed(5)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{(s.distance_km || 0).toFixed(2)} km</div>
                          <button 
                            onClick={() => onSelectSource(i)} 
                            style={{ 
                              marginTop: 8, 
                              padding: '6px 12px', 
                              borderRadius: 6, 
                              background: '#fff', 
                              border: 'none',
                              color: '#000',
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            Route
                          </button>
                        </div>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, color: '#9ca3af' }}>
                        {Object.entries(s.tests || {}).slice(0,3).map(([k,v]) => (<span key={String(k)} style={{ marginRight: 8 }}>{k}: {String(v)}</span>))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: '#6b7280' }}>
                Notes: uses public OSRM for routing. For production, provide your own routing service.
              </div>
            </aside>

            <main style={{ position: 'relative' }}>
              <div ref={mapElRef} style={{ height: '72vh', width: '100%' }} />

              <div style={{ position: 'absolute', right: 16, top: 16, zIndex: 400 }}>
                <button 
                  onClick={() => onFit()} 
                  style={{ 
                    marginRight: 8, 
                    padding: '8px 12px', 
                    borderRadius: 8, 
                    background: '#fff', 
                    border: 'none',
                    color: '#000',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Fit
                </button>
                <button 
                  onClick={() => onClearRoute()} 
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: 8, 
                    background: '#0a0a0a', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Clear Route
                </button>
              </div>
            </main>

          </div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, color: '#6b7280', fontSize: 12 }}>
          Water Quality Explorer • Demo UI — expose POST /api/check for live data
        </div>
      </div>
    </div>
  );
}