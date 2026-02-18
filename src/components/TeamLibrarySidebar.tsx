import React, { useState, useEffect, useMemo } from 'react';
import { TeamMemberDisplay, QUALIFICATIONS } from '../types/teamMember';
import { TeamMemberService } from '../services/supabaseService';
import { Order } from '../types/order';
import { Team } from '../types/team';
import TeamMemberCard from './TeamMemberCard';
import './TeamLibrarySidebar.css';

interface TeamLibrarySidebarProps {
  onMemberSelect?: (member: TeamMemberDisplay) => void;
  currentWeekNumber: number;
  orders?: Order[];
  teams?: Team[];
  showTeamsView?: boolean; // if true, show Teams tab by default
}

const TeamLibrarySidebar: React.FC<TeamLibrarySidebarProps> = ({ 
  onMemberSelect,
  currentWeekNumber,
  orders = [],
  teams = [],
  showTeamsView = false,
}) => {
  const [allMembers, setAllMembers] = useState<TeamMemberDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMemberDisplay | null>(null);
  const [viewMode, setViewMode] = useState<'members' | 'teams'>(showTeamsView ? 'teams' : 'members');

  // Filters
  const [nameFilter, setNameFilter] = useState<string>('');
  const [qualificationFilter, setQualificationFilter] = useState<string>('');
  const [selectedQualification, setSelectedQualification] = useState<string>('all');

  // Load members on component mount
  useEffect(() => {
    loadMembers();
    
    // Subscribe to real-time changes
    const subscription = TeamMemberService.subscribeToChanges(
      (newMember) => {
        setAllMembers((prev) => [...prev, newMember]);
      },
      (updatedMember) => {
        setAllMembers((prev) =>
          prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
        );
      },
      (deletedId) => {
        setAllMembers((prev) => prev.filter((m) => m.id !== deletedId));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load ALL members (we will filter out assigned ones locally based on orders)
      const members = await TeamMemberService.getAllMembers();
      setAllMembers(members);
    } catch (err) {
      setError('Failed to load team members. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Compute set of member IDs already assigned in active orders OR team configs
  const assignedMemberIds = useMemo(() => {
    const ids = new Set<number>();
    orders.forEach((order) => {
      order.roleAssignments.forEach((assignment) => {
        if (assignment.member) ids.add(assignment.member.internal_number);
      });
    });
    teams.forEach((team) => {
      team.roleAssignments.forEach((assignment) => {
        if (assignment.member) ids.add(assignment.member.internal_number);
      });
    });
    return ids;
  }, [orders, teams]);

  // Filter members based on search criteria and exclude already-assigned members
  const filteredMembers = useMemo(() => {
    return allMembers.filter((member) => {
      // Exclude members already assigned to any order
      if (assignedMemberIds.has(member.internal_number)) return false;
      // Filter by name
      const matchesName = nameFilter === '' || 
        member.name.toLowerCase().includes(nameFilter.toLowerCase());

      // Filter by qualification text search (searches in qualification names)
      const matchesQualificationText = qualificationFilter === '' ||
        member.qualifications.some((q) => 
          q.toLowerCase().includes(qualificationFilter.toLowerCase())
        );

      // Filter by specific qualification selection
      const matchesQualificationSelect = selectedQualification === 'all' ||
        member.qualifications.includes(selectedQualification.toUpperCase());

      return matchesName && matchesQualificationText && matchesQualificationSelect;
    });
  }, [allMembers, nameFilter, qualificationFilter, selectedQualification, assignedMemberIds]);

  // Group members by their qualifications
  const groupedMembers = useMemo(() => {
    const groups: { [key: string]: TeamMemberDisplay[] } = {
      'All Members': filteredMembers,
    };

    // Group by each qualification
    QUALIFICATIONS.forEach((qual) => {
      const membersWithQual = filteredMembers.filter((m) =>
        m.qualifications.includes(qual.code.toUpperCase())
      );
      if (membersWithQual.length > 0) {
        groups[qual.name] = membersWithQual;
      }
    });

    return groups;
  }, [filteredMembers]);

  const handleMemberClick = (member: TeamMemberDisplay) => {
    setSelectedMember(member);
    if (onMemberSelect) onMemberSelect(member);
  };

  const handleRefresh = () => loadMembers();

  const handleTeamDragStart = (e: React.DragEvent, team: Team) => {
    e.dataTransfer.setData('application/team-json', JSON.stringify(team));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="team-library-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h2>Library</h2>
        {/* View Mode Toggle */}
        <div className="sidebar-view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'members' ? 'active' : ''}`}
            onClick={() => setViewMode('members')}
          >
            👤 Members
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'teams' ? 'active' : ''}`}
            onClick={() => setViewMode('teams')}
          >
            👥 Teams
          </button>
        </div>
        {viewMode === 'members' && (
          <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
            🔄 {loading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* ── TEAMS VIEW ────────────────────────────────── */}
      {viewMode === 'teams' && (
        <div className="members-section">
          <div className="members-header">
            <h3>Configured Teams ({teams.length})</h3>
            <p className="hint-text">Drag a team onto an order to auto-fill all roles</p>
          </div>

          {teams.length === 0 ? (
            <div className="empty-state">
              No teams configured yet.<br />Go to the <strong>Configure Teams</strong> tab to create teams.
            </div>
          ) : (
            <div className="members-list">
              {teams.map((team) => {
                const filled = team.roleAssignments.filter((a) => a.member !== null).length;
                const total = team.roleAssignments.length;
                return (
                  <div
                    key={team.id}
                    className="team-card-sidebar"
                    draggable
                    onDragStart={(e) => handleTeamDragStart(e, team)}
                  >
                    <div className="team-card-header">
                      <span className="team-card-icon">👥</span>
                      <span className="team-card-name">{team.name}</span>
                      <span className="team-card-badge">{filled}/{total}</span>
                    </div>
                    <div className="team-card-progress">
                      <div
                        className="team-card-progress-fill"
                        style={{ width: `${(filled / total) * 100}%` }}
                      />
                    </div>
                    {filled > 0 && (
                      <div className="team-card-members">
                        {team.roleAssignments
                          .filter((a) => a.member !== null)
                          .slice(0, 5)
                          .map((a) => (
                            <span key={a.role} className="team-card-member-chip">
                              {a.member!.name.split(' ')[0]}
                            </span>
                          ))}
                        {filled > 5 && (
                          <span className="team-card-member-chip more">+{filled - 5}</span>
                        )}
                      </div>
                    )}
                    <p className="team-card-hint">⟵ drag onto order</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERS VIEW ──────────────────────────────── */}
      {viewMode === 'members' && (
        <>
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="name-filter">Filter by Name:</label>
              <input
                id="name-filter"
                type="text"
                placeholder="Enter name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="qualification-text-filter">Search Qualification:</label>
              <input
                id="qualification-text-filter"
                type="text"
                placeholder="Enter qualification..."
                value={qualificationFilter}
                onChange={(e) => setQualificationFilter(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="qualification-select">Qualification Type:</label>
              <select
                id="qualification-select"
                value={selectedQualification}
                onChange={(e) => setSelectedQualification(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Qualifications</option>
                {QUALIFICATIONS.map((qual) => (
                  <option key={qual.code} value={qual.code}>
                    {qual.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="members-section">
            <div className="members-header">
              <h3>Available Members ({filteredMembers.length})</h3>
              <p className="hint-text">Drag to add to canvas</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="loading-state">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="empty-state">No members found matching filters</div>
            ) : (
              <div className="members-list">
                {Object.entries(groupedMembers).map(([groupName, members]) => (
                  members.length > 0 && groupName !== 'All Members' && (
                    <div key={groupName} className="member-group">
                      <h4 className="group-title">{groupName} ({members.length})</h4>
                      {members.map((member) => (
                        <TeamMemberCard
                          key={member.id}
                          member={member}
                          onSelect={handleMemberClick}
                          isSelected={selectedMember?.id === member.id}
                          isDraggable={true}
                        />
                      ))}
                    </div>
                  )
                ))}

                {selectedQualification === 'all' && qualificationFilter === '' && (
                  <div className="member-group">
                    {filteredMembers.map((member) => (
                      <TeamMemberCard
                        key={member.id}
                        member={member}
                        onSelect={handleMemberClick}
                        isSelected={selectedMember?.id === member.id}
                        isDraggable={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TeamLibrarySidebar;
