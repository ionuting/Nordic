import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Order } from '../types/order';
import { Machine } from '../types/machine';
import { Team } from '../types/team';
import { TeamMemberDisplay } from '../types/teamMember';
import { WeatherService, LocationWeather } from '../services/weatherService';
import machinesData from '../data/machines.json';
import TeamLibrarySidebar from './TeamLibrarySidebar';
import OrderNode from './OrderNode';
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
  teams: Team[];
  currentWeekNumber: number;
  onAddOrder: () => void;
  onUpdateOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => Promise<boolean>;
  onMemberDrop: (orderId: string, role: string, member: TeamMemberDisplay) => void;
  onMemberRemove: (orderId: string, role: string) => void;
  onTeamDrop?: (orderId: string, team: Team) => void;
}

const HomeMapView: React.FC<HomeMapViewProps> = ({
  orders,
  loading,
  teams,
  currentWeekNumber,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  onMemberDrop,
  onMemberRemove,
  onTeamDrop,
}) => {
  const [weekRangeStart, setWeekRangeStart] = useState<number>(1);
  const [weekRangeEnd, setWeekRangeEnd] = useState<number>(52);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(true);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<Map<string, LocationWeather>>(new Map());
  const [showWeather, setShowWeather] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showMachines, setShowMachines] = useState(false);
  // Track previous orders count to detect a new order being added
  const prevOrderCountRef = useRef<number>(orders.length);
  const pendingSelectNewest = useRef<boolean>(false);

  const machines = machinesData as Machine[];

  // Keep selectedOrder in sync when orders prop updates
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find((o) => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      } else {
        // Order was deleted (e.g. via real-time from another session)
        setSelectedOrder(null);
        setRightPanelOpen(false);
      }
    }
    // After Add Order, auto-select the newest
    if (pendingSelectNewest.current && orders.length > prevOrderCountRef.current) {
      const sorted = [...orders].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      if (sorted[0]) {
        setSelectedOrder(sorted[0]);
        setRightPanelOpen(true);
      }
      pendingSelectNewest.current = false;
    }
    prevOrderCountRef.current = orders.length;
  }, [orders]);

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

  const handleOrderMarkerClick = (order: Order) => {
    setSelectedOrder(order);
    setRightPanelOpen(true);
  };

  const handleAddOrderClick = () => {
    pendingSelectNewest.current = true;
    setLeftPanelOpen(true);
    setRightPanelOpen(true);
    onAddOrder();
  };

  const handleDeleteOrder = async (orderId: string) => {
    const success = await onDeleteOrder(orderId);
    if (success && selectedOrder?.id === orderId) {
      setSelectedOrder(null);
      setRightPanelOpen(false);
    }
  };

  // Denmark center
  const denmarkCenter: [number, number] = [56.26, 9.5];

  return (
    <div className="home-map-view">
      {/* Top Toolbar */}
      <div className="home-toolbar">
        <button
          className={`panel-dock-btn left ${leftPanelOpen ? 'open' : 'closed'}`}
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          title={leftPanelOpen ? 'Hide team panel' : 'Show team panel'}
        >
          {leftPanelOpen ? '◀ Team' : '▶ Team'}
        </button>

        <div className="toolbar-center">
          <span className="toolbar-label">📅 Weeks:</span>
          <input
            type="number" min="1" max="52" value={weekRangeStart}
            onChange={(e) => setWeekRangeStart(Number(e.target.value))}
            className="week-input-sm"
          />
          <span className="toolbar-sep">—</span>
          <input
            type="number" min="1" max="52" value={weekRangeEnd}
            onChange={(e) => setWeekRangeEnd(Number(e.target.value))}
            className="week-input-sm"
          />
          <span className="toolbar-badge">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>

          <button
            className={`toolbar-toggle ${showWeather ? 'active' : ''}`}
            onClick={() => setShowWeather(!showWeather)}
          >
            🌤️ {showWeather ? 'Weather ON' : 'Weather OFF'}
          </button>
          {weatherLoading && <span className="weather-loading-sm">Loading…</span>}

          <button
            className={`toolbar-toggle machines ${showMachines ? 'active' : ''}`}
            onClick={() => setShowMachines(!showMachines)}
          >
            🏗️ {showMachines ? 'Machines ON' : 'Machines OFF'}
          </button>

          <button
            className="add-order-home-btn"
            onClick={handleAddOrderClick}
            disabled={loading}
          >
            ➕ Add Order
          </button>
        </div>

        <button
          className={`panel-dock-btn right ${rightPanelOpen ? 'open' : 'closed'}`}
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          title={rightPanelOpen ? 'Hide order panel' : 'Show order panel'}
        >
          {rightPanelOpen ? 'Order ▶' : 'Order ◀'}
        </button>
      </div>

      {/* Main 3-column area */}
      <div className="home-main">
        {/* LEFT PANEL — Team Library */}
        <div className={`home-side-panel left-panel ${leftPanelOpen ? 'panel-open' : 'panel-closed'}`}>
          {leftPanelOpen && (
            <TeamLibrarySidebar
              onMemberSelect={() => {}}
              currentWeekNumber={currentWeekNumber}
              orders={filteredOrders}
              teams={teams}
            />
          )}
        </div>

        {/* CENTER — Map */}
        <div className="home-map-area">
          {loading ? (
            <div className="map-loading">Loading map…</div>
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
                  eventHandlers={{ click: () => handleOrderMarkerClick(order) }}
                >
                  <Popup>
                    <div className="order-popup">
                      <h4>Week {order.weekNumber}</h4>
                      <p><strong>Order:</strong> {order.orderNumber || '---'}</p>
                      <p><strong>Location:</strong> {order.location || 'Not set'}</p>
                      <p style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
                        Click marker to open properties →
                      </p>
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
                        </tbody>
                      </table>
                      {machine.notes && (
                        <p className="machine-popup-notes">📝 {machine.notes}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Weather Markers */}
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

        {/* RIGHT PANEL — Order Properties */}
        <div className={`home-side-panel right-panel ${rightPanelOpen ? 'panel-open' : 'panel-closed'}`}>
          {rightPanelOpen && (
            <div className="order-properties-panel">
              <div className="order-properties-header">
                <h3>📋 Order Properties</h3>
                <div className="order-properties-header-actions">
                  {selectedOrder && (
                    <button
                      className="delete-order-panel-btn"
                      onClick={() => handleDeleteOrder(selectedOrder.id)}
                      title="Delete this order"
                    >
                      🗑️ Delete
                    </button>
                  )}
                  <button
                    className="close-panel-btn"
                    onClick={() => { setRightPanelOpen(false); setSelectedOrder(null); }}
                    title="Close panel"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="order-properties-content">
                {selectedOrder ? (
                  <OrderNode
                    order={selectedOrder}
                    onUpdate={onUpdateOrder}
                    onDelete={handleDeleteOrder}
                    onMemberDrop={onMemberDrop}
                    onMemberRemove={onMemberRemove}
                    onTeamDrop={onTeamDrop}
                  />
                ) : (
                  <div className="no-order-hint">
                    <div className="no-order-icon">🗺️</div>
                    <p>Click a marker on the map to view and edit order details.</p>
                    <p>Or click <strong>➕ Add Order</strong> to create a new one.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="map-footer">
        <div className="footer-stats">
          <span className="stat">📍 {filteredOrders.length} locations</span>
          <span className="stat">📅 Week {weekRangeStart} – {weekRangeEnd}</span>
          <span className="stat">
            👥 {filteredOrders.reduce((sum, o) => sum + o.roleAssignments.filter((a) => a.member !== null).length, 0)} members assigned
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomeMapView;
