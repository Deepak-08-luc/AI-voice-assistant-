import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GPSLocation } from '../types';

interface SatelliteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  gpsLocation: GPSLocation;
  onRequestGPS: () => void;
}

const PRESET_LOCATIONS = [
  { name: 'NEW YORK (SECTOR_04)', lat: 40.7128, lng: -74.0060 },
  { name: 'LONDON (SECTOR_01)', lat: 51.5074, lng: -0.1278 },
  { name: 'TOKYO (SECTOR_09)', lat: 35.6762, lng: 139.6503 },
  { name: 'GENEVA (LAB_CORE)', lat: 46.2044, lng: 6.1432 },
  { name: 'SINGAPORE (DATA_HUB)', lat: 1.3521, lng: 103.8198 },
];

export const SatelliteMapModal: React.FC<SatelliteMapModalProps> = ({
  isOpen,
  onClose,
  gpsLocation,
  onRequestGPS,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);

  const [viewMode, setViewMode] = useState<'SATELLITE' | 'HYBRID' | 'STREETS' | 'THERMAL' | 'RADAR'>('SATELLITE');
  const [selectedLat, setSelectedLat] = useState<number>(gpsLocation.lat);
  const [selectedLng, setSelectedLng] = useState<number>(gpsLocation.lng);
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Sync selected position when GPS location updates or locks
  useEffect(() => {
    if (gpsLocation.status === 'LOCKED') {
      setSelectedLat(gpsLocation.lat);
      setSelectedLng(gpsLocation.lng);
    }
  }, [gpsLocation]);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [selectedLat, selectedLng],
        zoom: zoomLevel,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      // Update state when map is zoomed
      map.on('zoomend', () => {
        setZoomLevel(map.getZoom());
      });
    }

    const map = mapInstanceRef.current;
    map.setView([selectedLat, selectedLng], zoomLevel);

    // Remove existing tile layers
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
    }

    // Set map tiles based on selected view mode
    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = 'Esri, Maxar, Earthstar Geographics';

    if (viewMode === 'STREETS') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution,
    });
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Add labels layer for Satellite & Hybrid views
    if ((viewMode === 'SATELLITE' || viewMode === 'HYBRID') && showLabels) {
      const labelsLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );
      labelsLayer.addTo(map);
      labelsLayerRef.current = labelsLayer;
    }

    // Custom Cybernetic Targeting Icon
    const cyberIcon = L.divIcon({
      className: 'custom-cyber-marker',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10">
          <div class="absolute w-10 h-10 rounded-full border-2 border-[#00f2ff] animate-ping opacity-75"></div>
          <div class="absolute w-6 h-6 rounded-full border border-[#00f2ff] bg-[#00f2ff]/30 shadow-[0_0_15px_#00f2ff]"></div>
          <div class="w-2.5 h-2.5 bg-[#00f2ff] rounded-full"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Update marker
    if (markerRef.current) {
      markerRef.current.setLatLng([selectedLat, selectedLng]);
    } else {
      const marker = L.marker([selectedLat, selectedLng], { icon: cyberIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: monospace; color: #002022; font-size: 11px;">
          <strong>TARGET_LOCK GPS</strong><br/>
          Lat: ${selectedLat.toFixed(6)}°<br/>
          Lng: ${selectedLng.toFixed(6)}°
        </div>
      `);
      markerRef.current = marker;
    }

    // Add accuracy circle if user GPS is locked
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }

    if (gpsLocation.status === 'LOCKED' && gpsLocation.accuracy) {
      const circle = L.circle([selectedLat, selectedLng], {
        color: '#00f2ff',
        fillColor: '#00f2ff',
        fillOpacity: 0.15,
        radius: Math.max(20, gpsLocation.accuracy),
      }).addTo(map);
      circleRef.current = circle;
    }

    // Invalidate map size after animation render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [isOpen, selectedLat, selectedLng, viewMode, showLabels, gpsLocation.status, gpsLocation.accuracy]);

  // Clean up Leaflet on modal close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
      tileLayerRef.current = null;
      labelsLayerRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (loc: typeof PRESET_LOCATIONS[0]) => {
    setSelectedLat(loc.lat);
    setSelectedLng(loc.lng);
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl bg-[#191c22] border border-[#00dbe7] rounded-lg overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,242,255,0.35)] font-mono text-[#e1e2eb] max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-[#10131a] px-4 py-3 border-b border-[#00dbe7]/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00dbe7] text-[20px]">satellite_alt</span>
            <span className="text-[13px] text-[#00f2ff] tracking-widest font-bold uppercase">
              EXACT_ORBITAL_SATELLITE_GPS // TELEMETRY
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRequestGPS}
              className={`flex items-center gap-1.5 text-[11px] px-3 py-1 rounded font-bold transition-all border ${
                gpsLocation.status === 'LOCKED'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500 hover:bg-emerald-900'
                  : gpsLocation.status === 'REQUESTING'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500 animate-pulse'
                  : 'bg-[#00f2ff] text-[#002022] border-[#00f2ff] hover:bg-[#74f5ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">my_location</span>
              <span>
                {gpsLocation.status === 'LOCKED'
                  ? 'GPS_LOCKED (CLICK TO RE-LOCK)'
                  : gpsLocation.status === 'REQUESTING'
                  ? 'ACQUIRING GPS...'
                  : 'REQUEST GPS PERMISSION'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="text-[#849495] hover:text-[#00f2ff] text-xl font-bold ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* GPS Permission / Status Warning Banner if needed */}
        {gpsLocation.status !== 'LOCKED' && (
          <div className="bg-[#10131a]/95 border-b border-amber-500/40 px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-[11px] gap-2">
            <div className="flex items-center gap-2 text-amber-300">
              <span className="material-symbols-outlined text-[18px]">location_searching</span>
              <span>
                {gpsLocation.status === 'DENIED'
                  ? 'GPS Permission was denied or blocked by browser settings. Click "REQUEST GPS PERMISSION" above to try again.'
                  : gpsLocation.status === 'ERROR'
                  ? `GPS Error: ${gpsLocation.errorMessage || 'Unable to retrieve location.'}`
                  : 'Click "REQUEST GPS PERMISSION" to ask your browser for exact real-time GPS coordinates.'}
              </span>
            </div>
            <button
              onClick={onRequestGPS}
              className="px-3 py-1 bg-amber-400 text-black font-bold text-[10px] rounded hover:bg-amber-300 whitespace-nowrap"
            >
              GRANT GPS PERMISSION
            </button>
          </div>
        )}

        {/* Map Display Canvas */}
        <div className="relative flex-1 bg-black min-h-[380px] md:min-h-[460px] overflow-hidden group">
          
          {/* Leaflet Map DOM Container */}
          <div
            ref={mapContainerRef}
            className={`w-full h-full min-h-[380px] md:min-h-[460px] z-0 transition-all duration-300 ${
              viewMode === 'THERMAL'
                ? 'hue-rotate-180 invert brightness-125 saturate-200'
                : viewMode === 'RADAR'
                ? 'hue-rotate-90 contrast-200 brightness-90'
                : ''
            }`}
          />

          {/* Cyber HUD Grid Lines overlay */}
          <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none z-10"></div>

          {/* Top-Left Telemetry Coordinates Box */}
          <div className="absolute top-4 left-4 bg-[#10131a]/90 border border-[#00dbe7]/60 p-3 rounded-md text-[11px] backdrop-blur-md z-20 space-y-1 shadow-lg font-mono">
            <div className="flex items-center gap-1.5 text-[#00f2ff] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-ping"></span>
              <span>EXACT_COORDINATES</span>
            </div>
            <div className="text-[#e1e2eb]">LAT: <strong className="text-[#00f2ff]">{selectedLat.toFixed(6)}° N</strong></div>
            <div className="text-[#e1e2eb]">LNG: <strong className="text-[#00f2ff]">{selectedLng.toFixed(6)}° E</strong></div>
            
            {gpsLocation.status === 'LOCKED' && (
              <div className="border-t border-[#3a494b] pt-1 mt-1 text-[10px] space-y-0.5 text-[#849495]">
                <div>ACCURACY: <span className="text-emerald-400">±{gpsLocation.accuracy ? Math.round(gpsLocation.accuracy) : 10} m</span></div>
                {gpsLocation.altitude && <div>ALTITUDE: {Math.round(gpsLocation.altitude)} m</div>}
                <div>STATUS: <span className="text-emerald-400 font-bold">EXACT GPS LOCKED</span></div>
              </div>
            )}
          </div>

          {/* Top-Right Map Control Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            <button
              onClick={handleZoomIn}
              className="w-9 h-9 bg-[#10131a]/90 border border-[#00dbe7] text-[#00f2ff] font-bold rounded flex items-center justify-center hover:bg-[#00f2ff] hover:text-[#002022] shadow-lg"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="w-9 h-9 bg-[#10131a]/90 border border-[#00dbe7] text-[#00f2ff] font-bold rounded flex items-center justify-center hover:bg-[#00f2ff] hover:text-[#002022] shadow-lg"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`w-9 h-9 border text-[11px] font-bold rounded flex items-center justify-center transition-all shadow-lg ${
                showLabels
                  ? 'bg-[#00f2ff] text-[#002022] border-[#00f2ff]'
                  : 'bg-[#10131a]/90 border-[#3a494b] text-[#849495]'
              }`}
              title="Toggle Street / Place Labels"
            >
              <span className="material-symbols-outlined text-[18px]">layers</span>
            </button>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center bg-[#10131a]/90 border border-[#3a494b] p-2 px-3 rounded text-[10px] backdrop-blur-md z-20">
            <div className="flex gap-4 items-center">
              <span className="text-[#849495]">VIEW_FILTER: <strong className="text-[#00f2ff]">{viewMode}</strong></span>
              <span className="text-[#849495]">GPS_SOURCE: <strong className={gpsLocation.status === 'LOCKED' ? 'text-emerald-400' : 'text-amber-400'}>{gpsLocation.status === 'LOCKED' ? 'REAL_TIME_DEVICE' : 'PRESET/SIMULATED'}</strong></span>
            </div>
            <div className="text-[#74f5ff]">ZOOM: {zoomLevel}X</div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#10131a] border-t border-[#3a494b] flex flex-col md:flex-row justify-between gap-3 items-center text-[11px]">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[#849495] mr-1 uppercase font-bold">Map Filters:</span>
            {(['SATELLITE', 'HYBRID', 'STREETS', 'THERMAL', 'RADAR'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-[10px] rounded border font-bold transition-all ${
                  viewMode === mode
                    ? 'bg-[#00f2ff] text-[#002022] border-[#00f2ff]'
                    : 'bg-[#191c22] border-[#3a494b] text-[#849495] hover:text-[#e1e2eb]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#849495]">GLOBAL PRESETS:</span>
            <select
              onChange={(e) => {
                const loc = PRESET_LOCATIONS.find((p) => p.name === e.target.value);
                if (loc) handlePresetSelect(loc);
              }}
              className="bg-[#191c22] border border-[#3a494b] text-[#00f2ff] p-1.5 rounded outline-none text-[10px] font-bold"
            >
              <option value="">-- Jump To Sector --</option>
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
