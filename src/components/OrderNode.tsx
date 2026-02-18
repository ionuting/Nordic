import React, { useState } from 'react';
import { Order, ROLE_TYPES, OrderStatus } from '../types/order';
import { TeamMemberDisplay } from '../types/teamMember';
import { Team } from '../types/team';
import MapPicker from './MapPicker';
import './OrderNode.css';

interface OrderNodeProps {
  order: Order;
  onUpdate: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onMemberDrop: (orderId: string, role: string, member: TeamMemberDisplay) => void;
  onMemberRemove: (orderId: string, role: string) => void;
  onTeamDrop?: (orderId: string, team: Team) => void;
}

const OrderNode: React.FC<OrderNodeProps> = ({
  order,
  onUpdate,
  onDelete,
  onMemberDrop,
  onMemberRemove,
  onTeamDrop,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [orderNumber, setOrderNumber] = useState(order.orderNumber);
  const [location, setLocation] = useState(order.location);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [teamDropHover, setTeamDropHover] = useState(false);

  const handleOrderNumberChange = (value: string) => {
    setOrderNumber(value);
    onUpdate({ ...order, orderNumber: value });
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    onUpdate({ ...order, location: value });
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLocation(address);
    onUpdate({ 
      ...order, 
      location: address,
      locationLatitude: lat,
      locationLongitude: lng
    });
    setShowMapPicker(false);
  };

  const handleDayToggle = (dayIndex: number) => {
    const updatedSchedule = [...order.dailySchedule];
    updatedSchedule[dayIndex].enabled = !updatedSchedule[dayIndex].enabled;
    onUpdate({ ...order, dailySchedule: updatedSchedule });
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updatedSchedule = [...order.dailySchedule];
    updatedSchedule[dayIndex][field] = value;
    onUpdate({ ...order, dailySchedule: updatedSchedule });
  };

  const handleDrop = (e: React.DragEvent, role: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const memberData = e.dataTransfer.getData('application/json');
    if (memberData) {
      try {
        const member: TeamMemberDisplay = JSON.parse(memberData);
        onMemberDrop(order.id, role, member);
      } catch (error) {
        console.error('Error parsing dropped member:', error);
      }
    }
  };

  const handleTeamZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTeamDropHover(false);
    const teamData = e.dataTransfer.getData('application/team-json');
    if (teamData && onTeamDrop) {
      try {
        const team: Team = JSON.parse(teamData);
        onTeamDrop(order.id, team);
      } catch (error) {
        console.error('Error parsing dropped team:', error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleRemoveMember = (role: string) => {
    onMemberRemove(order.id, role);
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    // Toggle off if clicking the active one
    const status = order.status === newStatus ? null : newStatus;
    onUpdate({ ...order, status });
  };

  const statusBorderClass =
    order.status === 'to_start' ? 'status-to-start' :
    order.status === 'in_progress' ? 'status-in-progress' :
    order.status === 'finished' ? 'status-finished' : '';

  const getMemberForRole = (role: string): TeamMemberDisplay | null => {
    const assignment = order.roleAssignments.find((a) => a.role === role);
    return assignment?.member || null;
  };

  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className={`order-node ${statusBorderClass}`}>
      {/* Header */}
      <div className="order-header">
        <div className="order-title-row">
          <h3 className="order-title">📅 Week {order.weekNumber}</h3>
          <div className="order-actions">
            <button
              className="toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '−' : '+'}
            </button>
            <button
              className="delete-btn"
              onClick={() => onDelete(order.id)}
              title="Delete order"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="order-content">
          {/* Order Number */}
          <div className="order-field">
            <label>📋 Ordre:</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => handleOrderNumberChange(e.target.value)}
              placeholder="---"
              className="order-input"
            />
          </div>

          {/* Location */}
          <div className="order-field">
            <label>📍 Location:</label>
            <div className="location-controls">
              <input
                type="text"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="Set location..."
                className="order-input location-input"
              />
              <button
                className="map-btn"
                onClick={() => setShowMapPicker(true)}
                title="Select location on map"
              >
                🗺️ Map
              </button>
            </div>
          </div>

          {/* Coordinates */}
          <div className="order-coords">
            <span className="coords-label">Coords:</span>
            <span className="coords-value">
              {order.locationLatitude.toFixed(6)}, {order.locationLongitude.toFixed(6)}
            </span>
          </div>

          <div className="order-separator"></div>

          {/* Status */}
          <div className="order-status">
            <span className="status-title">Status:</span>
            <label className={`status-checkbox to-start ${order.status === 'to_start' ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={order.status === 'to_start'}
                onChange={() => handleStatusChange('to_start')}
              />
              To Start
            </label>
            <label className={`status-checkbox in-progress ${order.status === 'in_progress' ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={order.status === 'in_progress'}
                onChange={() => handleStatusChange('in_progress')}
              />
              In Progress
            </label>
            <label className={`status-checkbox finished ${order.status === 'finished' ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={order.status === 'finished'}
                onChange={() => handleStatusChange('finished')}
              />
              Finished
            </label>
          </div>

          <div className="order-separator"></div>

          {/* Daily Schedule */}
          <div className="daily-schedule">
            <h4 className="schedule-title">Daily Schedule:</h4>
            {order.dailySchedule.map((day, index) => (
              <div key={day.day} className="day-row">
                <label className="day-checkbox">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={() => handleDayToggle(index)}
                  />
                  <span className="day-name">{shortDays[index]}</span>
                </label>
                <input
                  type="text"
                  value={day.startTime}
                  onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                  placeholder="06:00"
                  className="time-input"
                  disabled={!day.enabled}
                />
                <span className="time-separator">-</span>
                <input
                  type="text"
                  value={day.endTime}
                  onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                  placeholder="18:00"
                  className="time-input"
                  disabled={!day.enabled}
                />
              </div>
            ))}
          </div>

          <div className="order-separator"></div>

          {/* Role Slots - Drag & Drop */}
          <div className="role-slots">
            <h4 className="roles-title">Team Assignments (Drag &amp; Drop):</h4>

            {/* Team drop zone */}
            {onTeamDrop && (
              <div
                className={`team-drop-zone ${teamDropHover ? 'hover' : ''}`}
                onDrop={handleTeamZoneDrop}
                onDragOver={(e) => { e.preventDefault(); setTeamDropHover(true); }}
                onDragLeave={() => setTeamDropHover(false)}
              >
                {teamDropHover ? '✅ Release to apply team' : '👥 Drop a team here to auto-fill all roles'}
              </div>
            )}
            {ROLE_TYPES.map(({ role, color, label }) => {
              const assignedMember = getMemberForRole(role);
              
              return (
                <div
                  key={role}
                  className={`role-slot ${assignedMember ? 'filled' : 'empty'}`}
                  style={{ borderColor: color }}
                  onDrop={(e) => handleDrop(e, role)}
                  onDragOver={handleDragOver}
                >
                  <div className="role-label" style={{ color }}>
                    ◀ {label}
                  </div>
                  {assignedMember ? (
                    <div className="assigned-member">
                      <span className="member-name">{assignedMember.name}</span>
                      <button
                        className="remove-member-btn"
                        onClick={() => handleRemoveMember(role)}
                        title="Remove member"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="drop-zone">Drop member here</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          initialLat={order.locationLatitude}
          initialLng={order.locationLongitude}
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
};

export default OrderNode;
