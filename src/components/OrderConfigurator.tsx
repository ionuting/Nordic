import React, { useState } from 'react';
import styled from 'styled-components';
import { Order, RoleType, RoleAssignment } from '../types/order';
import { TeamMemberDisplay } from '../types/teamMember';
import { RoleSlot } from './RoleSlot';
import { usePlatform } from '../hooks/usePlatform';

interface OrderConfiguratorProps {
  order: Order;
  teamMembers: TeamMemberDisplay[];
  onSave: (order: Order) => void;
  onCancel: () => void;
}

export const OrderConfigurator: React.FC<OrderConfiguratorProps> = ({
  order,
  teamMembers,
  onSave,
  onCancel,
}) => {
  const { isMobile } = usePlatform();
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>(
    order.roleAssignments
  );

  const handleAssignMember = (
    role: RoleType,
    member: TeamMemberDisplay | null
  ) => {
    setRoleAssignments((prev) =>
      prev.map((assignment) =>
        assignment.role === role
          ? { ...assignment, member }
          : assignment
      )
    );
  };

  const handleSave = () => {
    const updatedOrder: Order = {
      ...order,
      roleAssignments,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedOrder);
  };

  // Get assigned member IDs to filter them from other slots
  const assignedMemberIds = roleAssignments
    .filter((a) => a.member)
    .map((a) => a.member?.internal_number);

  const availableMembers = teamMembers.filter(
    (m) => !assignedMemberIds.includes(m.internal_number)
  );

  return (
    <ConfiguratorContainer isMobile={isMobile}>
      <Header>
        <Title>Configure Order #{order.orderNumber}</Title>
        <CloseButton onClick={onCancel}>✕</CloseButton>
      </Header>

      <Content>
        <Section>
          <SectionTitle>Assign Team Members to Roles</SectionTitle>
          <SectionSubtitle>
            {roleAssignments.filter((a) => a.member).length} /{' '}
            {roleAssignments.length} roles assigned
          </SectionSubtitle>

          <RolesGrid>
            {roleAssignments.map((assignment) => (
              <RoleSlot
                key={assignment.role}
                roleAssignment={assignment}
                onAssignMember={handleAssignMember}
                teamMembers={
                  assignment.member
                    ? [...availableMembers, assignment.member]
                    : availableMembers
                }
              />
            ))}
          </RolesGrid>
        </Section>

        <Section>
          <SectionTitle>Order Details</SectionTitle>
          <DetailsList>
            <DetailItem>
              <DetailLabel>Week:</DetailLabel>
              <DetailValue>{order.weekNumber}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Location:</DetailLabel>
              <DetailValue>{order.location}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Notes:</DetailLabel>
              <DetailValue>{order.notes || '—'}</DetailValue>
            </DetailItem>
          </DetailsList>
        </Section>
      </Content>

      <Footer>
        <CancelButton onClick={onCancel}>Cancel</CancelButton>
        <SaveButton onClick={handleSave}>
          Save Order
        </SaveButton>
      </Footer>
    </ConfiguratorContainer>
  );
};

// Styling
const ConfiguratorContainer = styled.div<{ isMobile: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 2000;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    position: absolute;
    bottom: auto;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    max-width: 90vw;
    max-height: 90vh;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;
  flex-shrink: 0;

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #efefef;
    border-radius: 50%;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const SectionSubtitle = styled.p`
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #999;
  font-weight: 500;
`;

const RolesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
`;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #efefef;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #666;
  min-width: 80px;
  font-size: 13px;
`;

const DetailValue = styled.span`
  color: #333;
  font-size: 13px;
  flex: 1;
`;

const Footer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
  flex-shrink: 0;

  @media (min-width: 768px) {
    padding: 16px 20px;
    gap: 10px;
  }
`;

const CancelButton = styled.button`
  padding: 12px;
  background: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #e0e0e0;
  }

  @media (min-width: 768px) {
    padding: 10px;
  }
`;

const SaveButton = styled.button`
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #45a049;
  }

  @media (min-width: 768px) {
    padding: 10px;
  }
`;
