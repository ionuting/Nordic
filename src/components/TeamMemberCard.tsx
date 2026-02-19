import React, { useState } from 'react';
import { TeamMemberDisplay } from '../types/teamMember';
import './TeamMemberCard.css';

interface TeamMemberCardProps {
  member: TeamMemberDisplay;
  onSelect?: (member: TeamMemberDisplay) => void;
  isSelected?: boolean;
  isDraggable?: boolean;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onSelect,
  isSelected = false,
  isDraggable = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (onSelect) onSelect(member);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isDraggable) {
      e.dataTransfer.setData('application/json', JSON.stringify(member));
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className={`team-member-card ${isSelected ? 'selected' : ''} ${member.isAvailable ? 'available' : 'unavailable'}`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      {/* Compact row — always visible */}
      <div className="member-row">
        <span className={`status-dot ${member.isAvailable ? 'available' : 'unavailable'}`} />
        <span className="member-name">{member.name}</span>
        <button
          className={`expand-btn ${expanded ? 'open' : ''}`}
          onClick={toggleExpand}
          title={expanded ? 'Hide details' : 'Show details'}
        >
          ▾
        </button>
      </div>

      {/* Collapsible details */}
      {expanded && (
        <div className="member-details">
          <div className="detail-row">
            <span className="detail-label">ID:</span>
            <span className="detail-value">{member.internal_number}</span>
          </div>
          {member.phone && (
            <div className="detail-row">
              <span className="detail-label">📞</span>
              <span className="detail-value">{member.phone}</span>
            </div>
          )}
          {member.qualifications.length > 0 && (
            <div className="qualifications-list">
              {member.qualifications.map((qual) => (
                <span key={qual} className="qualification-badge">{qual}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard;
