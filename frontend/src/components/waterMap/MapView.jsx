import React, { useEffect, useRef } from "react";
import { useLeaflet } from "../../hooks/useLeaflet";
import { createMarkerIcon, escapeHtml } from "../../utils/waterUtils";
import MapControls from "./MapControls";

export default function MapView({
  lat,
  lon,
  sources,
  selectedIndex,
  pinMode,
  onMapClick,
  onMapReady,
}) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);

  const { leaflet, loading: leafletLoading } = useLeaflet();

  // Initialize map
  useEffect(() => {
    if (!leaflet || !mapElRef.current || mapRef.current) return;

    const L = leaflet;
    mapRef.current = L.map(mapElRef.current, {
      center: [lat, lon],
      zoom: 13,
      preferCanvas: true
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { 
      attribution: '© OpenStreetMap contributors, © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapRef.current);

    // Create user marker
    const redIcon = L.icon({
      iconUrl: createMarkerIcon('#ef4444'),
      iconSize: [24, 36],
      iconAnchor: [12, 36],
      popupAnchor: [0, -36]
    });

    userMarkerRef.current = L.marker([lat, lon], {
      icon: redIcon
    }).addTo(mapRef.current).bindPopup('Your location');

    onMapReady(true);

    return () => {
      try { 
        if (mapRef.current) {
          mapRef.current.remove(); 
        }
      } catch (e) {}
      mapRef.current = null;
    };
  }, [leaflet, lat, lon]);

  // Update user marker position
  useEffect(() => {
    if (!leaflet || !userMarkerRef.current) return;
    
    const L = leaflet;
    try { 
      userMarkerRef.current.setLatLng([lat, lon]);
      const redIcon = L.icon({
        iconUrl: createMarkerIcon('#ef4444'),
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36]
      });
      userMarkerRef.current.setIcon(redIcon);
    } catch (e) {}
    
    if (mapRef.current && mapRef.current.setView) { 
      try { mapRef.current.setView([lat, lon], 13); } catch (e) {} 
    }
  }, [lat, lon, leaflet]);

  // Render source markers
  useEffect(() => {
    if (!leaflet || !mapRef.current) return;
    
    const L = leaflet;
    
    // Clear existing markers
    (markersRef.current || []).forEach(m => { 
      try { mapRef.current.removeLayer(m); } catch (e) {} 
    });
    markersRef.current = [];

    // Create blue icon for sources
    const blueIcon = L.icon({
      iconUrl: createMarkerIcon('#3b82f6'),
      iconSize: [24, 36],
      iconAnchor: [12, 36],
      popupAnchor: [0, -36]
    });

    // Add markers for each source
    for (const source of sources) {
      try {
        const marker = L.marker([source.lat, source.lon], { icon: blueIcon })
          .addTo(mapRef.current)
          .bindPopup(`<strong>${escapeHtml(source.name)}</strong><br>${(source.distance_km||0).toFixed(2)} km`);
        markersRef.current.push(marker);
      } catch (e) { 
        console.warn('marker add failed', e); 
      }
    }
  }, [sources, leaflet]);

  // Handle map click for pin mode
  useEffect(() => {
    if (!mapRef.current) return;
    
    const handleClick = (e) => {
      if (pinMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    mapRef.current.on('click', handleClick);

    // Update cursor style
    if (mapElRef.current) {
      mapElRef.current.style.cursor = pinMode ? 'crosshair' : '';
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleClick);
      }
    };
  }, [pinMode, onMapClick]);

  // Compute route when source is selected
  useEffect(() => {
    if (selectedIndex === null || !sources[selectedIndex]) return;
    computeRouteTo(sources[selectedIndex]);
  }, [selectedIndex]);

  async function computeRouteTo(dest) {
    if (!leaflet || !mapRef.current || !dest) return;
    
    const L = leaflet;
    
    // Clear existing route
    if (routeLayerRef.current) { 
      try { mapRef.current.removeLayer(routeLayerRef.current); } catch (e) {} 
      routeLayerRef.current = null; 
    }

    const userPos = userMarkerRef.current && userMarkerRef.current.getLatLng 
      ? userMarkerRef.current.getLatLng() 
      : null;
      
    if (!userPos) return;

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userPos.lng},${userPos.lat};${dest.lon},${dest.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('OSRM error');
      
      const data = await res.json();
      if (data.routes && data.routes.length) {
        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        const poly = L.polyline(coords, { 
          color: '#ffffff', 
          weight: 4, 
          opacity: 0.9 
        }).addTo(mapRef.current);
        
        routeLayerRef.current = poly;
        
        try { 
          mapRef.current.fitBounds(poly.getBounds(), { padding: [40, 40] }); 
        } catch (e) {}
      }
    } catch (e) {
      console.warn('route error', e);
    }
  }

  function handleFit() {
    if (!mapRef.current || !leaflet) return;
    
    try {
      const coords = [];
      if (userMarkerRef.current && userMarkerRef.current.getLatLng) 
        coords.push(userMarkerRef.current.getLatLng());
      
      (markersRef.current || []).forEach(m => { 
        try { coords.push(m.getLatLng()); } catch (e) {} 
      });
      
      if (coords.length && mapRef.current.fitBounds) 
        mapRef.current.fitBounds(coords, { padding: [40, 40] });
    } catch (e) { }
  }

  function handleClearRoute() {
    if (routeLayerRef.current && mapRef.current) { 
      try { mapRef.current.removeLayer(routeLayerRef.current); } catch (e) {} 
      routeLayerRef.current = null; 
    }
  }

  return (
    <main className="relative">
      <div ref={mapElRef} className="h-[72vh] w-full" />
      
      <MapControls 
        onFit={handleFit}
        onClearRoute={handleClearRoute}
      />
    </main>
  );
}