import React, { useState, useEffect, useMemo } from 'react';
import { TeamMemberDisplay, QUALIFICATIONS } from '../types/teamMember';
import { TeamMemberService } from '../services/supabaseService';
import TeamMemberCard from './TeamMemberCard';
import './TeamLibrarySidebar.css';

interface TeamLibrarySidebarProps {
  onMemberSelect?: (member: TeamMemberDisplay) => void;
  currentWeekNumber: number; // Filter members by week availability
}

const TeamLibrarySidebar: React.FC<TeamLibrarySidebarProps> = ({ 
  onMemberSelect,
  currentWeekNumber
}) => {
  const [allMembers, setAllMembers] = useState<TeamMemberDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMemberDisplay | null>(null);
  
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
      // Load only members available for current week
      const members = await TeamMemberService.getAvailableMembersForWeek(currentWeekNumber);
      setAllMembers(members);
    } catch (err) {
      setError('Failed to load team members. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter members based on search criteria
  const filteredMembers = useMemo(() => {
    return allMembers.filter((member) => {
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
  }, [allMembers, nameFilter, qualificationFilter, selectedQualification]);

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
    if (onMemberSelect) {
      onMemberSelect(member);
    }
  };

  const handleRefresh = () => {
    loadMembers();
  };

  return (
    <div className="team-library-sidebar">
      <div className="sidebar-header">
        <h2>Team Members Library</h2>
        <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
          🔄 {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

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
          <p className="hint-text">Double-click or drag to add to canvas</p>
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
            
            {/* Show ungrouped if no qualification filter */}
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
    </div>
  );
};

export default TeamLibrarySidebar;
