// Team Member Types based on Supabase Qualifications table

export interface TeamMember {
  internal_number: number;
  name: string;
  phone: string;
  // Qualifications (boolean flags)
  sr1: boolean;
  sr2: boolean;
  orf: boolean;
  mf: boolean;
  ts: boolean;
  ps: boolean;
  st: boolean;
  hm: boolean;
  // Week assignments (week_1 to week_52 columns store order_number)
  [key: `week_${number}`]: string | null | undefined;
}

export interface TeamMemberDisplay extends TeamMember {
  id: number; // Alias for internal_number
  qualifications: string[]; // Derived from boolean flags
  isAvailable: boolean; // For future extension
  assignedToWeek?: number; // Current week assignment
  assignedOrderNumber?: string; // Order number for current week
}

export interface QualificationType {
  code: string;
  name: string;
  description?: string;
}

export const QUALIFICATIONS: QualificationType[] = [
  { code: 'sr1', name: 'SR1', description: 'Qualification SR1' },
  { code: 'sr2', name: 'SR2', description: 'Qualification SR2' },
  { code: 'orf', name: 'ORF', description: 'Qualification ORF' },
  { code: 'mf', name: 'MF', description: 'Qualification MF' },
  { code: 'ts', name: 'TS', description: 'Qualification TS' },
  { code: 'ps', name: 'PS', description: 'Qualification PS' },
  { code: 'st', name: 'ST', description: 'Qualification ST' },
  { code: 'hm', name: 'HM', description: 'Qualification HM' },
];

// Utility function to get qualifications from boolean flags
export function getQualificationsFromMember(member: TeamMember): string[] {
  const qualifications: string[] = [];
  
  if (member.sr1) qualifications.push('SR1');
  if (member.sr2) qualifications.push('SR2');
  if (member.orf) qualifications.push('ORF');
  if (member.mf) qualifications.push('MF');
  if (member.ts) qualifications.push('TS');
  if (member.ps) qualifications.push('PS');
  if (member.st) qualifications.push('ST');
  if (member.hm) qualifications.push('HM');
  
  return qualifications;
}

// Convert TeamMember to TeamMemberDisplay
export function toTeamMemberDisplay(member: TeamMember, currentWeek?: number): TeamMemberDisplay {
  let assignedToWeek: number | undefined;
  let assignedOrderNumber: string | undefined;

  // Check if member is assigned to current week
  if (currentWeek) {
    const weekKey = `week_${currentWeek}` as `week_${number}`;
    const assignment = member[weekKey];
    if (assignment) {
      assignedToWeek = currentWeek;
      assignedOrderNumber = assignment;
    }
  }

  return {
    ...member,
    id: member.internal_number,
    qualifications: getQualificationsFromMember(member),
    isAvailable: !assignedOrderNumber, // Available if not assigned to current week
    assignedToWeek,
    assignedOrderNumber,
  };
}

// Helper to check if member is available for a specific week
export function isMemberAvailableForWeek(member: TeamMember, weekNumber: number): boolean {
  const weekKey = `week_${weekNumber}` as `week_${number}`;
  const assignment = member[weekKey];
  return !assignment; // Available if no assignment
}
