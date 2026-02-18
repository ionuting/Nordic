import React, { useState } from 'react';
import { ROLE_TYPES } from '../types/order';
import { TeamMemberDisplay } from '../types/teamMember';
import { Team } from '../types/team';
import './TeamNode.css';

interface TeamNodeProps {
  team: Team;
  onUpdate: (team: Team) => void;
  onDelete: (teamId: string) => void;
  onMemberDrop: (teamId: string, role: string, member: TeamMemberDisplay) => void;
  onMemberRemove: (teamId: string, role: string) => void;
}

const TeamNode: React.FC<TeamNodeProps> = ({
  team,
  onUpdate,
  onDelete,
  onMemberDrop,
  onMemberRemove,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(team.name);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (nameValue.trim() !== team.name) {
      onUpdate({ ...team, name: nameValue.trim() || 'New Team' });
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
    if (e.key === 'Escape') {
      setNameValue(team.name);
      setIsEditingName(false);
    }
  };

  const handleDrop = (e: React.DragEvent, role: string) => {
    e.preventDefault();
    e.stopPropagation();
    const memberData = e.dataTransfer.getData('application/json');
    if (memberData) {
      try {
        const member: TeamMemberDisplay = JSON.parse(memberData);
        onMemberDrop(team.id, role, member);
      } catch (error) {
        console.error('Error parsing dropped member:', error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const getMemberForRole = (role: string): TeamMemberDisplay | null => {
    const assignment = team.roleAssignments.find((a) => a.role === role);
    return assignment?.member || null;
  };

  const assignedCount = team.roleAssignments.filter((a) => a.member !== null).length;
  const totalRoles = team.roleAssignments.length;

  return (
    <div className="team-node">
      {/* Header */}
      <div className="team-header">
        <div className="team-title-row">
          <div className="team-title-area">
            <span className="team-icon">👥</span>
            {isEditingName ? (
              <input
                className="team-name-input"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                autoFocus
              />
            ) : (
              <h3
                className="team-name"
                onClick={() => setIsEditingName(true)}
                title="Click to rename"
              >
                {team.name}
              </h3>
            )}
            <span className="team-fill-badge">
              {assignedCount}/{totalRoles}
            </span>
          </div>
          <div className="team-actions">
            <button
              className="toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '−' : '+'}
            </button>
            <button
              className="delete-btn"
              onClick={() => onDelete(team.id)}
              title="Delete team"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Fill progress bar */}
        <div className="team-progress-bar">
          <div
            className="team-progress-fill"
            style={{ width: `${(assignedCount / totalRoles) * 100}%` }}
          />
        </div>
      </div>

      {/* Role Assignments */}
      {isExpanded && (
        <div className="team-content">
          <div className="role-slots">
            <h4 className="roles-title">Team Assignments (Drag &amp; Drop):</h4>
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
                        onClick={() => onMemberRemove(team.id, role)}
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
    </div>
  );
};

export default TeamNode;
