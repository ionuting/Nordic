import React from 'react';
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
  const handleClick = () => {
    if (onSelect) {
      onSelect(member);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isDraggable) {
      e.dataTransfer.setData('application/json', JSON.stringify(member));
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  return (
    <div
      className={`team-member-card ${isSelected ? 'selected' : ''} ${member.isAvailable ? 'available' : 'unavailable'}`}
      onClick={handleClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <div className="member-header">
        <h3 className="member-name">{member.name}</h3>
        <span className={`status-badge ${member.isAvailable ? 'available' : 'unavailable'}`}>
          {member.isAvailable ? '✓' : '✗'}
        </span>
      </div>
      
      <div className="member-details">
        <div className="detail-row">
          <span className="detail-label">ID:</span>
          <span className="detail-value">{member.internal_number}</span>
        </div>
        
        {member.phone && (
          <div className="detail-row">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{member.phone}</span>
          </div>
        )}
        
        <div className="qualifications-section">
          <span className="detail-label">Qualifications:</span>
          <div className="qualifications-list">
            {member.qualifications.length > 0 ? (
              member.qualifications.map((qual) => (
                <span key={qual} className="qualification-badge">
                  {qual}
                </span>
              ))
            ) : (
              <span className="no-qualifications">No qualifications</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
