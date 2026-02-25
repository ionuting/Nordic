import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPicker.css';
import { usePlatform } from '../hooks/usePlatform';

// Fix Leaflet default marker icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onClose: () => void;
}

// Component for handling map clicks
function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: [number, number] | null; 
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const MapPicker: React.FC<MapPickerProps> = ({
  initialLat = 55.6761,
  initialLng = 12.5683,
  onLocationSelect,
  onClose,
}) => {
  const { isMobile } = usePlatform();
  const [position, setPosition] = useState<[number, number] | null>([initialLat, initialLng]);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(!isMobile); // Collapsed by default on mobile

  // Reverse geocoding to get address from coordinates
  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch address when position changes
  useEffect(() => {
    if (position) {
      fetchAddress(position[0], position[1]);
    }
  }, [position]);

  const handleConfirm = () => {
    if (position) {
      onLocationSelect(position[0], position[1], address);
    }
  };

  return (
    <div className="map-picker-overlay">
      <div className="map-picker-container">
        <div className="map-picker-header">
          <h3>📍 Select Location</h3>
          <button className="map-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className={`map-picker-info ${infoExpanded ? 'expanded' : 'collapsed'}`}>
          <button 
            className="info-toggle-btn"
            onClick={() => setInfoExpanded(!infoExpanded)}
            title={infoExpanded ? 'Hide details' : 'Show details'}
          >
            <span className="toggle-icon">{infoExpanded ? '▲' : '▼'}</span>
            <span className="toggle-text">
              {infoExpanded ? 'Hide Details' : 'Show Details'}
            </span>
          </button>
          {position && infoExpanded && (
            <div className="coordinates-display">
              <strong>Coordinates:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
              <br />
              <strong>Address:</strong> {isLoading ? 'Loading...' : address}
            </div>
          )}
          {!infoExpanded && position && (
            <div className="coordinates-compact">
              {position[0].toFixed(4)}, {position[1].toFixed(4)}
            </div>
          )}
        </div>

        <div className="map-wrapper">
          <MapContainer
            center={[initialLat, initialLng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        <div className="map-picker-actions">
          <button className="map-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="map-confirm-btn" 
            onClick={handleConfirm}
            disabled={!position}
          >
            ✓ Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
