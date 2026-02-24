import React, { useState } from 'react';
import styled from 'styled-components';
import { RoleAssignment, RoleType, ROLE_TYPES } from '../types/order';
import { TeamMemberDisplay } from '../types/teamMember';
import { TeamMembersSingleSelectDock } from './TeamMembersSingleSelectDock';

interface RoleSlotProps {
  roleAssignment: RoleAssignment;
  onAssignMember: (role: RoleType, member: TeamMemberDisplay | null) => void;
  teamMembers: TeamMemberDisplay[];
  color?: string;
}

export const RoleSlot: React.FC<RoleSlotProps> = ({
  roleAssignment,
  onAssignMember,
  teamMembers,
  color,
}) => {
  const [isDockOpen, setIsDockOpen] = useState(false);
  const roleConfig = ROLE_TYPES.find((r) => r.role === roleAssignment.role);
  const slotColor = color || roleConfig?.color || '#cccccc';

  const handleSelectMember = (member: TeamMemberDisplay | null) => {
    onAssignMember(roleAssignment.role, member);
  };

  return (
    <>
      <SlotContainer onClick={() => setIsDockOpen(true)} backgroundColor={slotColor}>
        <SlotHeader>
          <RoleLabel>{roleConfig?.label || roleAssignment.role}</RoleLabel>
          <RemoveButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onAssignMember(roleAssignment.role, null);
            }}
            $hasAssignment={!!roleAssignment.member}
          >
            {roleAssignment.member ? '✕' : '+'}
          </RemoveButton>
        </SlotHeader>

        <SlotContent>
          {roleAssignment.member ? (
            <MemberInfo>
              <MemberName>{roleAssignment.member.name}</MemberName>
              <MemberPhone>{roleAssignment.member.phone}</MemberPhone>
            </MemberInfo>
          ) : (
            <EmptySlot>Click to assign</EmptySlot>
          )}
        </SlotContent>
      </SlotContainer>

      <TeamMembersSingleSelectDock
        isOpen={isDockOpen}
        onClose={() => setIsDockOpen(false)}
        onSelect={handleSelectMember}
        teamMembers={teamMembers}
        currentSelection={roleAssignment.member}
        roleLabel={roleConfig?.label || roleAssignment.role}
      />
    </>
  );
};

// Styling
const SlotContainer = styled.div<{ backgroundColor: string }>`
  background: ${(props: any) => props.backgroundColor}20;
  border: 2px solid ${(props: any) => props.backgroundColor};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props: any) => props.backgroundColor}30;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const SlotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const RoleLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #333;
  letter-spacing: 0.5px;
`;

const RemoveButton = styled.button<{ $hasAssignment: boolean }>`
  background: ${(props: any) => (props.$hasAssignment ? '#ff6b6b' : '#2196F3')};
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: ${(props: any) => (props.$hasAssignment ? '#ff5252' : '#1976D2')};
  }
`;

const SlotContent = styled.div`
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
  width: 100%;
`;

const MemberName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MemberPhone = styled.span`
  font-size: 11px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptySlot = styled.span`
  font-size: 12px;
  color: #999;
  font-style: italic;
`;
