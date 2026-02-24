// Workplace Types - User-specific tasks, requests, and time tracking

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// User Task
export interface UserTask {
  id: string;
  userId: string;
  title: string;
  description: string;
  orderId?: string; // Link to order if task is from an order
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// Time Entry (Pontaj)
export interface TimeEntry {
  id: string;
  userId: string;
  taskId?: string;
  orderId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  breakMinutes: number;
  totalHours: number;
  description: string;
  createdAt: string;
}

// Leave Request Types
export type LeaveType = 'vacation' | 'sick' | 'personal' | 'unpaid';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: RequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

// Calendar Event
export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'task' | 'meeting' | 'leave' | 'holiday' | 'other';
  color?: string;
}

// Helper functions
export function calculateHours(startTime: string, endTime: string, breakMinutes: number): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  const totalMinutes = endMinutes - startMinutes - breakMinutes;
  return Math.max(0, totalMinutes / 60);
}

export function createNewTask(userId: string): UserTask {
  return {
    id: crypto.randomUUID(),
    userId,
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createNewTimeEntry(userId: string, date: string): TimeEntry {
  return {
    id: crypto.randomUUID(),
    userId,
    date,
    startTime: '08:00',
    endTime: '16:00',
    breakMinutes: 30,
    totalHours: 7.5,
    description: '',
    createdAt: new Date().toISOString(),
  };
}

export function createNewLeaveRequest(userId: string): LeaveRequest {
  return {
    id: crypto.randomUUID(),
    userId,
    type: 'vacation',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    days: 1,
    reason: '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}
