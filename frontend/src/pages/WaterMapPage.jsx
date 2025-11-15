// WaterMapPage.jsx - COMPLETE VERSION WITH ALL FEATURES
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import axios from 'axios';
import '../WaterMapPage.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Set axios base URL
const API_BASE_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

const WaterMapPage = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const tempMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  
  const [mapInitialized, setMapInitialized] = useState(false);
  const [waterSources, setWaterSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestCleanSource, setNearestCleanSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    clean: 0,
    polluted: 0,
    avgPurity: 0
  });
  const [filters, setFilters] = useState({
    minPurity: 0,
    maxSeverity: 10,
    waterType: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [reportData, setReportData] = useState({
    reportType: 'new_source',
    description: '',
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
    observations: {
      waterColor: '',
      odor: '',
      visiblePollution: false,
      pollutionType: [],
      estimatedPurity: 50,
      waterType: 'stream'
    }
  });

  // Initialize map
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        try {
          const map = L.map(mapRef.current, {
            center: [20.5937, 78.9629],
            zoom: 5,
            zoomControl: true,
            scrollWheelZoom: true,
            preferCanvas: true // Better performance
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map);

          mapInstanceRef.current = map;
          setMapInitialized(true);

          console.log('✅ Map initialized successfully');

          getUserLocation(map);

          // Add map click handler
          map.on('click', handleMapClick);

        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapInitialized(false);
      }
    };
  }, []);

  // Handle map click for location selection
  const handleMapClick = (e) => {
    if (!isSelectingLocation) return;

    const { lat, lng } = e.latlng;

    // Remove previous temp marker
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
    }

    // Add temporary marker at clicked location
    tempMarkerRef.current = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(mapInstanceRef.current);

    tempMarkerRef.current.bindPopup('📍 Selected Location<br/>Click "Confirm Location" to continue').openPopup();

    // Update report data
    setReportData(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    }));
  };

  // Start location selection mode
  const startLocationSelection = () => {
    setIsSelectingLocation(true);
    alert('Click anywhere on the map to select the water source location');
  };

  // Confirm location and open modal
  const confirmLocation = () => {
    if (reportData.location.coordinates[0] === 0) {
      alert('Please click on the map to select a location first');
      return;
    }
    setIsSelectingLocation(false);
    setShowReportModal(true);
  };

  // Cancel location selection
  const cancelLocationSelection = () => {
    setIsSelectingLocation(false);
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
    setReportData(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [0, 0]
      }
    }));
  };

  // Get user location
  const getUserLocation = (map) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          map.setView([latitude, longitude], 10);
          
          const userMarker = L.marker([latitude, longitude], {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          }).addTo(map);
          
          userMarker.bindPopup('<strong>📍 Your Location</strong>');

          console.log('✅ User location:', latitude, longitude);

          loadWaterSources(latitude, longitude);
          loadAlerts(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          loadWaterSources(20.5937, 78.9629);
        }
      );
    }
  };

  // Calculate statistics
  const calculateStats = (sources) => {
    if (sources.length === 0) {
      setStats({ total: 0, clean: 0, polluted: 0, avgPurity: 0 });
      return;
    }

    const total = sources.length;
    const clean = sources.filter(s => s.qualityMetrics.purityScore >= 80).length;
    const polluted = sources.filter(s => s.qualityMetrics.purityScore < 40).length;
    const avgPurity = (sources.reduce((acc, s) => acc + s.qualityMetrics.purityScore, 0) / total).toFixed(1);

    setStats({ total, clean, polluted, avgPurity });
  };

  // Load water sources with filters
  const loadWaterSources = async (lat, lng, radius = 50000) => {
    setLoading(true);
    try {
      const params = { lat, lng, radius };
      
      if (filters.minPurity > 0) params.minPurity = filters.minPurity;
      if (filters.maxSeverity < 10) params.maxSeverity = filters.maxSeverity;
      if (filters.waterType !== 'all') params.type = filters.waterType;

      const response = await axios.get('/water/sources', { params });

      console.log('Water sources response:', response.data);

      if (response.data.success) {
        setWaterSources(response.data.data);
        calculateStats(response.data.data);
        if (mapInitialized) {
          renderMarkers(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error loading water sources:', error);
      if (error.response?.status === 404) {
        console.log('No water sources found - database might be empty');
        setWaterSources([]);
        calculateStats([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Render markers with clustering
  const renderMarkers = (sources) => {
    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        if (marker.clearLayers) {
          marker.clearLayers();
        }
        marker.remove();
      } catch (e) {
        console.error('Error removing marker:', e);
      }
    });
    markersRef.current = [];

    const map = mapInstanceRef.current;
    if (!map) return;

    // Create marker cluster group
    const markers = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function(cluster) {
        const childCount = cluster.getChildCount();
        let c = ' marker-cluster-';
        if (childCount < 10) {
          c += 'small';
        } else if (childCount < 100) {
          c += 'medium';
        } else {
          c += 'large';
        }
        return new L.DivIcon({ 
          html: '<div><span>' + childCount + '</span></div>', 
          className: 'marker-cluster' + c, 
          iconSize: new L.Point(40, 40) 
        });
      }
    });

    sources.forEach(source => {
      try {
        const [lng, lat] = source.location.coordinates;
        const { purityScore, pollutionLevel, severityScore } = source.qualityMetrics;

        let markerColor = 'red';
        if (purityScore >= 80) markerColor = 'green';
        else if (purityScore >= 60) markerColor = 'yellow';
        else if (purityScore >= 40) markerColor = 'orange';

        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        });

        const popupContent = `
          <div class="water-popup">
            <h3>${source.name}</h3>
            <p><strong>Type:</strong> ${source.type}</p>
            <p><strong>Purity Score:</strong> <span class="score-${markerColor}">${purityScore.toFixed(1)}/100</span></p>
            <p><strong>Pollution Level:</strong> ${pollutionLevel}</p>
            <p><strong>Severity:</strong> ${severityScore}/10</p>
            <p><strong>Safe for Use:</strong> ${source.isSafeForUse ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Last Updated:</strong> ${new Date(source.lastUpdated).toLocaleDateString()}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedSource(source));

        markers.addLayer(marker);
      } catch (error) {
        console.error('Error rendering marker:', error);
      }
    });

    map.addLayer(markers);
    markersRef.current.push(markers);
  };

  // Find nearest clean water source
  const findNearestClean = async () => {
    if (!userLocation) {
      alert('Location not available');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/water/nearest-clean', {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          minPurity: 70
        }
      });

      if (response.data.success) {
        const source = response.data.data;
        setNearestCleanSource(source);

        const map = mapInstanceRef.current;
        if (map) {
          const [lng, lat] = source.location.coordinates;
          
          // Remove old polyline
          if (polylineRef.current) {
            polylineRef.current.remove();
          }

          // Add polyline
          polylineRef.current = L.polyline([
            [userLocation.lat, userLocation.lng],
            [lat, lng]
          ], {
            color: 'blue',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
          }).addTo(map);

          map.fitBounds(polylineRef.current.getBounds());

          L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [35, 51],
              iconAnchor: [17, 51],
              popupAnchor: [1, -44],
              shadowSize: [51, 51]
            })
          }).addTo(map).bindPopup(`
            <strong>Nearest Clean Source</strong><br/>
            ${source.name}<br/>
            Distance: ${source.distance.toFixed(2)} km
          `).openPopup();
        }

        alert(`Nearest clean water source: ${source.name}\nDistance: ${source.distance.toFixed(2)} km`);
      }
    } catch (error) {
      console.error('Error finding nearest clean source:', error);
      alert('No clean water source found nearby');
    } finally {
      setLoading(false);
    }
  };

  // Submit user report
  const submitReport = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      console.log('Submitting report:', reportData);
      
      const response = await axios.post('/water/report', reportData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Report response:', response.data);

      if (response.data.success) {
        alert('Report submitted successfully! Thank you for contributing.');
        setShowReportModal(false);
        
        // Clean up temp marker
        if (tempMarkerRef.current) {
          tempMarkerRef.current.remove();
          tempMarkerRef.current = null;
        }
        
        // Reload water sources
        if (userLocation) {
          loadWaterSources(userLocation.lat, userLocation.lng);
        }
        
        // Reset form
        setReportData({
          reportType: 'new_source',
          description: '',
          location: {
            type: 'Point',
            coordinates: [0, 0]
          },
          observations: {
            waterColor: '',
            odor: '',
            visiblePollution: false,
            pollutionType: [],
            estimatedPurity: 50,
            waterType: 'stream'
          }
        });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      
      if (error.response?.status === 401) {
        alert('Please login to submit a report');
      } else if (error.response?.status === 404) {
        alert('API endpoint not found. Make sure the backend server is running on http://localhost:5000');
      } else {
        alert('Error submitting report: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Load alerts
  const loadAlerts = async (lat, lng) => {
    try {
      const response = await axios.get('/water/alerts', {
        params: { lat, lng, radius: 20000 }
      });

      if (response.data.success) {
        setAlerts(response.data.data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  // Fetch API data
  const fetchAPIData = async () => {
    if (!userLocation) {
      alert('Location not available');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/water/fetch-data', {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 25
        }
      });

      if (response.data.success) {
        alert(`Fetched ${response.data.count} water sources from API`);
        loadWaterSources(userLocation.lat, userLocation.lng);
      }
    } catch (error) {
      console.error('Error fetching API data:', error);
      alert('Error fetching water quality data');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    if (userLocation) {
      loadWaterSources(userLocation.lat, userLocation.lng);
    }
  };

  return (
    <div className="water-map-container">
      {/* Header */}
      <div className="map-header">
        <h1>🌊 Water Quality Tracker</h1>
        <div className="header-actions">
          <button onClick={findNearestClean} disabled={loading || !userLocation}>
            📍 Find Nearest Clean Water
          </button>
          <button onClick={fetchAPIData} disabled={loading || !userLocation}>
            🔄 Fetch Real-Time Data
          </button>
          <button onClick={startLocationSelection} disabled={isSelectingLocation}>
            ➕ Report Water Source
          </button>
          <button onClick={() => setShowFilters(!showFilters)}>
            🔍 {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Location Selection Banner */}
      {isSelectingLocation && (
        <div className="location-selection-banner">
          <p>📍 Click on the map to select water source location</p>
          <div className="banner-actions">
            <button onClick={confirmLocation} className="confirm-btn">
              ✓ Confirm Location
            </button>
            <button onClick={cancelLocationSelection} className="cancel-btn">
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <h4>{stats.total}</h4>
          <p>Total Sources</p>
        </div>
        <div className="stat-card green">
          <h4>{stats.clean}</h4>
          <p>Clean Sources</p>
        </div>
        <div className="stat-card red">
          <h4>{stats.polluted}</h4>
          <p>Polluted Sources</p>
        </div>
        <div className="stat-card blue">
          <h4>{stats.avgPurity}</h4>
          <p>Avg Purity Score</p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <h3>🔍 Filters</h3>
          
          <div className="filter-group">
            <label>Min Purity Score: {filters.minPurity}</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={filters.minPurity}
              onChange={(e) => setFilters({...filters, minPurity: parseInt(e.target.value)})}
            />
          </div>

          <div className="filter-group">
            <label>Max Severity: {filters.maxSeverity}</label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={filters.maxSeverity}
              onChange={(e) => setFilters({...filters, maxSeverity: parseInt(e.target.value)})}
            />
          </div>

          <div className="filter-group">
            <label>Water Type:</label>
            <select 
              value={filters.waterType}
              onChange={(e) => setFilters({...filters, waterType: e.target.value})}
            >
              <option value="all">All Types</option>
              <option value="river">River</option>
              <option value="lake">Lake</option>
              <option value="ocean">Ocean</option>
              <option value="reservoir">Reservoir</option>
              <option value="pond">Pond</option>
              <option value="well">Well</option>
              <option value="stream">Stream</option>
            </select>
          </div>

          <button className="apply-filters-btn" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      )}

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className="alerts-panel">
          <h3>⚠️ Active Alerts</h3>
          {alerts.slice(0, 3).map(alert => (
            <div key={alert._id} className={`alert alert-${alert.severity}`}>
              <strong>{alert.alertType.replace('_', ' ').toUpperCase()}</strong>
              <p>{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className={`map-display ${isSelectingLocation ? 'selecting-location' : ''}`}
        style={{ 
          width: '100%', 
          height: 'calc(100vh - 220px)',
          position: 'relative',
          zIndex: 1,
          cursor: isSelectingLocation ? 'crosshair' : 'grab'
        }}
      ></div>

      {/* Legend */}
      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-item">
          <span className="marker-green">●</span> Clean (80-100)
        </div>
        <div className="legend-item">
          <span className="marker-yellow">●</span> Moderate (60-79)
        </div>
        <div className="legend-item">
          <span className="marker-orange">●</span> Polluted (40-59)
        </div>
        <div className="legend-item">
          <span className="marker-red">●</span> Severe (0-39)
        </div>
        <div className="legend-item">
          <span className="marker-blue">●</span> Your Location
        </div>
      </div>

      {/* Selected Source Details */}
      {selectedSource && (
        <div className="details-panel">
          <div className="details-header">
            <h2>{selectedSource.name}</h2>
            <button onClick={() => setSelectedSource(null)}>✕</button>
          </div>
          <div className="details-content">
            <div className="detail-row">
              <label>Type:</label>
              <span>{selectedSource.type}</span>
            </div>
            <div className="detail-row">
              <label>Purity Score:</label>
              <span className="score-large">{selectedSource.qualityMetrics.purityScore.toFixed(1)}/100</span>
            </div>
            <div className="detail-row">
              <label>Pollution Level:</label>
              <span className={`badge ${selectedSource.qualityMetrics.pollutionLevel}`}>
                {selectedSource.qualityMetrics.pollutionLevel}
              </span>
            </div>
            <div className="detail-row">
              <label>Severity Score:</label>
              <span>{selectedSource.qualityMetrics.severityScore}/10</span>
            </div>
            
            {(selectedSource.qualityMetrics.pH || 
              selectedSource.qualityMetrics.dissolvedOxygen ||
              selectedSource.qualityMetrics.turbidity ||
              selectedSource.qualityMetrics.temperature) && (
              <>
                <h3>Parameters</h3>
                {selectedSource.qualityMetrics.pH && (
                  <div className="detail-row">
                    <label>pH:</label>
                    <span>{selectedSource.qualityMetrics.pH}</span>
                  </div>
                )}
                {selectedSource.qualityMetrics.dissolvedOxygen && (
                  <div className="detail-row">
                    <label>Dissolved Oxygen:</label>
                    <span>{selectedSource.qualityMetrics.dissolvedOxygen} mg/L</span>
                  </div>
                )}
                {selectedSource.qualityMetrics.turbidity && (
                  <div className="detail-row">
                    <label>Turbidity:</label>
                    <span>{selectedSource.qualityMetrics.turbidity} NTU</span>
                  </div>
                )}
                {selectedSource.qualityMetrics.temperature && (
                  <div className="detail-row">
                    <label>Temperature:</label>
                    <span>{selectedSource.qualityMetrics.temperature}°C</span>
                  </div>
                )}
              </>
            )}
            
            <div className="detail-row">
              <label>Reports:</label>
              <span>{selectedSource.reportsCount} community reports</span>
            </div>
            <div className="detail-row">
              <label>Last Updated:</label>
              <span>{new Date(selectedSource.lastUpdated).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => {
          setShowReportModal(false);
          if (tempMarkerRef.current) {
            tempMarkerRef.current.remove();
            tempMarkerRef.current = null;
          }
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Water Source</h2>
              <button onClick={() => {
                setShowReportModal(false);
                if (tempMarkerRef.current) {
                  tempMarkerRef.current.remove();
                  tempMarkerRef.current = null;
                }
              }}>✕</button>
            </div>
            
            <form onSubmit={submitReport}>
              <div className="form-group">
                <label>Report Type:</label>
                <select
                  value={reportData.reportType}
                  onChange={(e) => setReportData({...reportData, reportType: e.target.value})}
                >
                  <option value="new_source">New Water Source</option>
                  <option value="quality_update">Quality Update</option>
                  <option value="pollution_alert">Pollution Alert</option>
                  <option value="cleanup_update">Cleanup Update</option>
                </select>
              </div>

              <div className="form-group">
                <label>Water Type:</label>
                <select
                  value={reportData.observations.waterType}
                  onChange={(e) => setReportData({
                    ...reportData,
                    observations: {...reportData.observations, waterType: e.target.value}
                  })}
                >
                  <option value="river">River</option>
                  <option value="lake">Lake</option>
                  <option value="ocean">Ocean</option>
                  <option value="reservoir">Reservoir</option>
                  <option value="pond">Pond</option>
                  <option value="well">Well</option>
                  <option value="stream">Stream</option>
                </select>
              </div>

              <div className="form-group">
                <label>Water Color:</label>
                <input
                  type="text"
                  placeholder="e.g., Clear, Brown, Green"
                  value={reportData.observations.waterColor}
                  onChange={(e) => setReportData({
                    ...reportData,
                    observations: {...reportData.observations, waterColor: e.target.value}
                  })}
                />
              </div>

              <div className="form-group">
                <label>Odor:</label>
                <input
                  type="text"
                  placeholder="e.g., None, Chemical, Sewage"
                  value={reportData.observations.odor}
                  onChange={(e) => setReportData({
                    ...reportData,
                    observations: {...reportData.observations, odor: e.target.value}
                  })}
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={reportData.observations.visiblePollution}
                    onChange={(e) => setReportData({
                      ...reportData,
                      observations: {...reportData.observations, visiblePollution: e.target.checked}
                    })}
                  />
                  Visible Pollution
                </label>
              </div>

              <div className="form-group">
                <label>Estimated Purity (0-100): {reportData.observations.estimatedPurity}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reportData.observations.estimatedPurity}
                  onChange={(e) => setReportData({
                    ...reportData,
                    observations: {...reportData.observations, estimatedPurity: parseInt(e.target.value)}
                  })}
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe the water source and your observations..."
                  value={reportData.description}
                  onChange={(e) => setReportData({...reportData, description: e.target.value})}
                />
              </div>

              {reportData.location.coordinates[0] !== 0 && (
                <div className="form-group">
                  <label>Selected Location:</label>
                  <p style={{fontSize: '0.9rem', color: '#666'}}>
                    📍 Lat: {reportData.location.coordinates[1].toFixed(6)}, 
                    Lng: {reportData.location.coordinates[0].toFixed(6)}
                  </p>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowReportModal(false);
                  if (tempMarkerRef.current) {
                    tempMarkerRef.current.remove();
                    tempMarkerRef.current = null;
                  }
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default WaterMapPage;
