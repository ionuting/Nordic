// Order (Weekly Task) Types - Replicates Godot WeeklyTaskNode structure

import { TeamMemberDisplay } from './teamMember';

// Role types matching the 13 input ports from Godot
export type RoleType =
  | 'Sjakbajs'
  | 'SR/ORS/ORF'
  | 'Thermitsvejser_1'
  | 'Thermitsvejser_2'
  | 'Pålægssvejser'
  | 'Sporteknikker'
  | 'Sidemandsoplærer'
  | 'Håndmand_1'
  | 'Håndmand_2'
  | 'Håndmand_3'
  | 'Chauffør/Maskinfører'
  | 'Køretøjstype_ID'
  | 'Banevogn/Redskab_ID';

export const ROLE_TYPES: { role: RoleType; color: string; label: string }[] = [
  { role: 'Sjakbajs', color: '#8B0000', label: 'Sjakbajs' },
  { role: 'SR/ORS/ORF', color: '#FF8C00', label: 'SR/ORS/ORF' },
  { role: 'Thermitsvejser_1', color: '#FF1493', label: 'Thermitsvejser 1' },
  { role: 'Thermitsvejser_2', color: '#FF1493', label: 'Thermitsvejser 2' },
  { role: 'Pålægssvejser', color: '#87CEEB', label: 'Pålægssvejser' },
  { role: 'Sporteknikker', color: '#FFD700', label: 'Sporteknikker' },
  { role: 'Sidemandsoplærer', color: '#90EE90', label: 'Sidemandsoplærer' },
  { role: 'Håndmand_1', color: '#00CED1', label: 'Håndmand 1' },
  { role: 'Håndmand_2', color: '#00CED1', label: 'Håndmand 2' },
  { role: 'Håndmand_3', color: '#00CED1', label: 'Håndmand 3' },
  { role: 'Chauffør/Maskinfører', color: '#9370DB', label: 'Chauffør/Maskinfører' },
  { role: 'Køretøjstype_ID', color: '#808080', label: 'Køretøjstype ID' },
  { role: 'Banevogn/Redskab_ID', color: '#696969', label: 'Banevogn/Redskab ID' },
];

// Daily schedule for each day of the week
export interface DailySchedule {
  day: string; // Monday, Tuesday, etc.
  enabled: boolean;
  startTime: string; // "06:00"
  endTime: string; // "18:00"
  cirkl: string; // CircWrk field
}

// Role assignment - maps role to assigned team member
export interface RoleAssignment {
  role: RoleType;
  member: TeamMemberDisplay | null;
}

// Main Order interface matching Godot WeeklyTaskNode
export interface Order {
  id: string; // task_id
  orderNumber: string; // order_number (editable)
  weekNumber: number; // 1-52
  location: string;
  locationLatitude: number;
  locationLongitude: number;
  notes: string;
  dailySchedule: DailySchedule[]; // 7 days (Monday-Sunday)
  roleAssignments: RoleAssignment[]; // 13 roles
  createdAt?: string;
  updatedAt?: string;
}

// Supabase database schema for Orders table
export interface OrderDB {
  id: string;
  order_number: string;
  week_number: number;
  location: string;
  location_latitude: number;
  location_longitude: number;
  notes: string;
  daily_schedule: any; // JSON
  role_assignments: any; // JSON
  created_at: string;
  updated_at: string;
}

// Helper to create default daily schedule (Monday-Friday enabled)
export function createDefaultDailySchedule(): DailySchedule[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map((day, index) => ({
    day,
    enabled: index < 5, // Monday-Friday
    startTime: index < 5 ? '06:00' : '',
    endTime: index < 5 ? '18:00' : '',
    cirkl: '',
  }));
}

// Helper to create default role assignments (all empty)
export function createDefaultRoleAssignments(): RoleAssignment[] {
  return ROLE_TYPES.map(({ role }) => ({
    role,
    member: null,
  }));
}

// Create a new empty order
export function createNewOrder(weekNumber: number = 1): Order {
  return {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orderNumber: '',
    weekNumber,
    location: '',
    locationLatitude: 55.6761, // Default: Copenhagen
    locationLongitude: 12.5683,
    notes: '',
    dailySchedule: createDefaultDailySchedule(),
    roleAssignments: createDefaultRoleAssignments(),
  };
}

// Convert Order to DB format
export function orderToDBFormat(order: Order): Partial<OrderDB> {
  return {
    id: order.id,
    order_number: order.orderNumber,
    week_number: order.weekNumber,
    location: order.location,
    location_latitude: order.locationLatitude,
    location_longitude: order.locationLongitude,
    notes: order.notes,
    daily_schedule: order.dailySchedule,
    role_assignments: order.roleAssignments, // Save complete structure
  };
}

// Convert DB format to Order
export function dbFormatToOrder(dbOrder: OrderDB): Order {
  // Parse role assignments and ensure member is null (not undefined) when empty
  let roleAssignments: RoleAssignment[];
  
  if (Array.isArray(dbOrder.role_assignments) && dbOrder.role_assignments.length > 0) {
    roleAssignments = dbOrder.role_assignments.map((ra: any) => ({
      role: ra.role,
      member: ra.member || null, // Ensure null instead of undefined
    }));
  } else {
    roleAssignments = createDefaultRoleAssignments();
  }

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    weekNumber: dbOrder.week_number,
    location: dbOrder.location,
    locationLatitude: dbOrder.location_latitude,
    locationLongitude: dbOrder.location_longitude,
    notes: dbOrder.notes,
    dailySchedule: dbOrder.daily_schedule || createDefaultDailySchedule(),
    roleAssignments,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
  };
}

// Get all assigned member IDs from orders
export function getAssignedMemberIds(orders: Order[]): number[] {
  const memberIds = new Set<number>();
  
  orders.forEach((order) => {
    order.roleAssignments.forEach((assignment) => {
      if (assignment.member) {
        memberIds.add(assignment.member.id);
      }
    });
  });
  
  return Array.from(memberIds);
}
