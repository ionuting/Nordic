import { TeamMemberDisplay } from './teamMember';
import { RoleType, ROLE_TYPES } from './order';

export interface TeamRoleAssignment {
  role: RoleType;
  member: TeamMemberDisplay | null;
}

export interface Team {
  id: string;
  name: string;
  roleAssignments: TeamRoleAssignment[];
  createdAt?: string;
}

export function createNewTeam(): Team {
  return {
    id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: 'New Team',
    roleAssignments: ROLE_TYPES.map(({ role }) => ({ role, member: null })),
    createdAt: new Date().toISOString(),
  };
}
