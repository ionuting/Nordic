import React, { useState } from 'react';
import styled from 'styled-components';
import { TeamMemberDisplay } from '../types/teamMember';
import { usePlatform } from '../hooks/usePlatform';

interface TeamMembersSingleSelectDockProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (member: TeamMemberDisplay | null) => void;
  teamMembers: TeamMemberDisplay[];
  currentSelection?: TeamMemberDisplay | null;
  roleLabel: string;
}

export const TeamMembersSingleSelectDock: React.FC<
  TeamMembersSingleSelectDockProps
> = ({
  isOpen,
  onClose,
  onSelect,
  teamMembers,
  currentSelection,
  roleLabel,
}) => {
  const { isMobile } = usePlatform();
  const [selectedId, setSelectedId] = useState<string | null>(
    currentSelection?.internal_number?.toString() || null
  );

  const handleSelectMember = (member: TeamMemberDisplay) => {
    setSelectedId(member.internal_number?.toString() || null);
    onSelect(member);
    onClose();
  };

  const handleClear = () => {
    setSelectedId(null);
    onSelect(null);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <Overlay onClick={onClose} />}

      {/* Dock Container */}
      <DockContainer isOpen={isOpen} isMobile={isMobile}>
        <DockHeader>
          <h3>Select Member for {roleLabel}</h3>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </DockHeader>

        <DockContent>
          {/* Clear button */}
          <ClearButton onClick={handleClear}>
            ✕ Clear Selection
          </ClearButton>

          {/* Members list */}
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <MemberItem
                key={member.internal_number}
                onClick={() => handleSelectMember(member)}
                isSelected={
                  selectedId === member.internal_number?.toString()
                }
              >
                <RadioButton
                  isSelected={
                    selectedId === member.internal_number?.toString()
                  }
                />
                <MemberInfo>
                  <MemberName>{member.name}</MemberName>
                  <MemberPhone>{member.phone}</MemberPhone>
                </MemberInfo>
              </MemberItem>
            ))
          ) : (
            <EmptyState>No team members available</EmptyState>
          )}
        </DockContent>
      </DockContainer>
    </>
  );
};

// Styling
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const DockContainer = styled.div<{ isOpen: boolean; isMobile: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
  z-index: 1000;
  transform: translateY(${(props: any) => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    max-height: 70vh;
    border-radius: 12px;
    position: absolute;
    bottom: auto;
    right: 20px;
    left: auto;
    width: 300px;
    transform: translateX(${(props: any) => props.isOpen ? '0' : '130%'});
  }
`;

const DockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #efefef;
    border-radius: 50%;
  }
`;

const DockContent = styled.div`
  overflow-y: auto;
  max-height: calc(80vh - 120px);
  padding: 8px 0;

  @media (min-width: 768px) {
    max-height: calc(70vh - 120px);
  }
`;

const ClearButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: #ffebee;
  border: none;
  color: #c62828;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid #efefef;
  transition: background 0.2s;

  &:hover {
    background: #ffcdd2;
  }
`;

const MemberItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${(props: any) => (props.isSelected ? '#e3f2fd' : 'transparent')};
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #efefef;

  &:hover {
    background: ${(props: any) => (props.isSelected ? '#bbdefb' : '#f5f5f5')};
  }
`;

const RadioButton = styled.div<{ isSelected: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${(props: any) => (props.isSelected ? '#2196F3' : '#ccc')};
  border-radius: 50%;
  background: ${(props: any) => (props.isSelected ? '#2196F3' : 'white')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: ${(props: any) => (props.isSelected ? "'●'" : "''")};
    color: white;
    font-size: 12px;
  }
`;

const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const MemberName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const MemberPhone = styled.span`
  font-size: 12px;
  color: #999;
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
`;
