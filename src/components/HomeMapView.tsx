import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Order } from '../types/order';
import { Machine } from '../types/machine';
import { WeatherService, LocationWeather } from '../services/weatherService';
import machinesData from '../data/machines.json';
import './HomeMapView.css';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icon for order markers
const orderIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom icon for weather markers (blue)
const weatherIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
});

// Custom icon for machine/crane markers (orange)
const machineIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface HomeMapViewProps {
  orders: Order[];
  loading: boolean;
}

const HomeMapView: React.FC<HomeMapViewProps> = ({ orders, loading }) => {
  const [weekRangeStart, setWeekRangeStart] = useState<number>(1);
  const [weekRangeEnd, setWeekRangeEnd] = useState<number>(52);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [weatherData, setWeatherData] = useState<Map<string, LocationWeather>>(new Map());
  const [showWeather, setShowWeather] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showMachines, setShowMachines] = useState(false);

  const machines = machinesData as Machine[];

  // Filter orders by week range
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) => order.weekNumber >= weekRangeStart && order.weekNumber <= weekRangeEnd
    );
  }, [orders, weekRangeStart, weekRangeEnd]);

  // Fetch weather data for filtered orders
  useEffect(() => {
    if (filteredOrders.length > 0 && showWeather) {
      setWeatherLoading(true);
      const locations = filteredOrders.map((o) => ({
        latitude: o.locationLatitude,
        longitude: o.locationLongitude,
        id: o.id,
      }));

      WeatherService.getWeatherForMultipleLocations(locations)
        .then(setWeatherData)
        .catch((error) => console.error('Failed to load weather:', error))
        .finally(() => setWeatherLoading(false));
    }
  }, [filteredOrders, showWeather]);

  // Get assigned members count for an order
  const getAssignedMembersCount = (order: Order): number => {
    return order.roleAssignments.filter((a) => a.member !== null).length;
  };

  // Get active days count
  const getActiveDaysCount = (order: Order): number => {
    return order.dailySchedule.filter((d) => d.enabled).length;
  };

  // Denmark center: 56.26°N, 9.50°E
  const denmarkCenter: [number, number] = [56.26, 9.5];

  return (
    <div className="home-map-view">
      {/* Filter Panel */}
      <div className="filter-panel">
        <div className="filter-content">
          <h3>📊 Filter Orders by Week Range</h3>
          <div className="filter-inputs">
            <div className="input-group">
              <label>From Week:</label>
              <input
                type="number"
                min="1"
                max="52"
                value={weekRangeStart}
                onChange={(e) => setWeekRangeStart(Number(e.target.value))}
              />
            </div>
            <span className="range-separator">—</span>
            <div className="input-group">
              <label>To Week:</label>
              <input
                type="number"
                min="1"
                max="52"
                value={weekRangeEnd}
                onChange={(e) => setWeekRangeEnd(Number(e.target.value))}
              />
            </div>
            <div className="filter-stats">
              <span className="stat-badge">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
              </span>
              <button
                className={`weather-toggle-btn ${showWeather ? 'active' : ''}`}
                onClick={() => setShowWeather(!showWeather)}
                title={showWeather ? 'Hide weather' : 'Show weather'}
              >
                {showWeather ? '🌤️ Weather ON' : '🌤️ Weather OFF'}
              </button>
              {weatherLoading && <span className="weather-loading">Loading weather...</span>}
              <button
                className={`machines-toggle-btn ${showMachines ? 'active' : ''}`}
                onClick={() => setShowMachines(!showMachines)}
                title={showMachines ? 'Hide machines' : 'Show machines'}
              >
                🏗️ {showMachines ? 'Machines ON' : 'Machines OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Order Info */}
      {selectedOrder && (
        <div className="selected-order-info">
          <div className="info-header">
            <h4>📋 Order Details</h4>
            <button 
              className="close-info-btn"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>
          </div>
          <div className="info-content">
            <div className="info-row">
              <span className="info-label">Week:</span>
              <span className="info-value">{selectedOrder.weekNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Order #:</span>
              <span className="info-value">{selectedOrder.orderNumber || '---'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-value">{selectedOrder.location || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Coordinates:</span>
              <span className="info-value coords">
                {selectedOrder.locationLatitude.toFixed(6)}, {selectedOrder.locationLongitude.toFixed(6)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Team Members:</span>
              <span className="info-value">{getAssignedMembersCount(selectedOrder)} / 13</span>
            </div>
            <div className="info-row">
              <span className="info-label">Active Days:</span>
              <span className="info-value">{getActiveDaysCount(selectedOrder)} / 7</span>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="map-container">
        {loading ? (
          <div className="map-loading">Loading map...</div>
        ) : (
          <MapContainer
            center={denmarkCenter}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            className="home-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {filteredOrders.map((order) => (
              <Marker
                key={order.id}
                position={[order.locationLatitude, order.locationLongitude]}
                icon={orderIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedOrder(order);
                  },
                }}
              >
                <Popup>
                  <div className="order-popup">
                    <h4>Week {order.weekNumber}</h4>
                    <p><strong>Order:</strong> {order.orderNumber || '---'}</p>
                    <p><strong>Location:</strong> {order.location || 'Not set'}</p>
                    <p><strong>Team:</strong> {getAssignedMembersCount(order)} members</p>
                    <p><strong>Days:</strong> {getActiveDaysCount(order)} active</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Machine Markers */}
            {showMachines && machines.map((machine) => (
              <Marker
                key={machine.id}
                position={[machine.location.latitude, machine.location.longitude]}
                icon={machineIcon}
              >
                <Popup>
                  <div className="machine-popup">
                    <div className="machine-popup-header">
                      <span className="machine-popup-icon">🏗️</span>
                      <h4>{machine.name}</h4>
                    </div>
                    <div className={`machine-status-badge status-${machine.status}`}>
                      {machine.status === 'available' ? '✅ Available' :
                       machine.status === 'in_use' ? '🔄 In Use' : '🔧 Maintenance'}
                    </div>
                    <table className="machine-popup-table">
                      <tbody>
                        <tr><td>ID</td><td>{machine.id}</td></tr>
                        <tr><td>Model</td><td>{machine.model}</td></tr>
                        <tr><td>Year</td><td>{machine.year}</td></tr>
                        <tr><td>Plate</td><td>{machine.plate}</td></tr>
                        <tr><td>Capacity</td><td>{machine.capacity_tons} t</td></tr>
                        <tr><td>City</td><td>{machine.location.city}</td></tr>
                        <tr><td>Address</td><td>{machine.location.address}</td></tr>
                      </tbody>
                    </table>
                    {machine.notes && (
                      <p className="machine-popup-notes">📝 {machine.notes}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Weather Markers Overlay */}
            {showWeather && Array.from(weatherData.values()).map((weather) => (
              <Marker
                key={`weather-${weather.latitude}-${weather.longitude}`}
                position={[weather.latitude, weather.longitude]}
                icon={weatherIcon}
              >
                <Popup>
                  <div className="weather-popup">
                    <h4>{weather.description}</h4>
                    <p><strong>Temperature:</strong> {weather.temperature.toFixed(1)}°C (feels like {weather.feelsLike.toFixed(1)}°C)</p>
                    <p><strong>Humidity:</strong> {weather.humidity}%</p>
                    <p><strong>Wind:</strong> {weather.windSpeed.toFixed(1)} km/h</p>
                    <p><strong>Precipitation:</strong> {weather.precipitation.toFixed(1)} mm</p>
                    <hr style={{ opacity: 0.5 }} />
                    <h5 style={{ marginTop: '8px', marginBottom: '6px' }}>7-Day Forecast:</h5>
                    {weather.forecast.slice(0, 3).map((day, idx) => (
                      <div key={idx} style={{ fontSize: '12px', marginBottom: '4px' }}>
                        <strong>{new Date(day.time).toLocaleDateString('en-US', { weekday: 'short' })}</strong>: {day.description} {day.temperature.toFixed(0)}°C
                      </div>
                    ))}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Stats Footer */}
      <div className="map-footer">
        <div className="footer-stats">
          <span className="stat">
            📍 {filteredOrders.length} locations
          </span>
          <span className="stat">
            📅 Week {weekRangeStart} - {weekRangeEnd}
          </span>
          <span className="stat">
            👥 {filteredOrders.reduce((sum, o) => sum + getAssignedMembersCount(o), 0)} total members assigned
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomeMapView;
