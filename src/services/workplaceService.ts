import { supabase } from './supabaseService';
import {
  UserTask,
  TimeEntry,
  LeaveRequest,
  CalendarEvent,
  TaskStatus,
  LeaveType,
  RequestStatus,
} from '../types/workplace';

/**
 * Service for managing user workplace data (tasks, time entries, leave requests)
 */
export class WorkplaceService {
  // ==================== TASKS ====================
  
  /**
   * Get all tasks for a specific user
   */
  static async getUserTasks(userId: string): Promise<UserTask[]> {
    const { data, error } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user tasks:', error);
      return [];
    }

    return data.map(this.mapTaskFromDB);
  }

  /**
   * Create a new task
   */
  static async createTask(task: UserTask): Promise<UserTask | null> {
    const { data, error } = await supabase
      .from('user_tasks')
      .insert([this.mapTaskToDB(task)])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    return this.mapTaskFromDB(data);
  }

  /**
   * Update an existing task
   */
  static async updateTask(taskId: string, updates: Partial<UserTask>): Promise<UserTask | null> {
    const { data, error } = await supabase
      .from('user_tasks')
      .update(this.mapTaskToDB(updates as UserTask))
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return null;
    }

    return this.mapTaskFromDB(data);
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  }

  // ==================== TIME ENTRIES ====================
  
  /**
   * Get time entries for a user within a date range
   */
  static async getTimeEntries(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TimeEntry[]> {
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }

    return data.map(this.mapTimeEntryFromDB);
  }

  /**
   * Create a new time entry
   */
  static async createTimeEntry(entry: TimeEntry): Promise<TimeEntry | null> {
    const { data, error } = await supabase
      .from('time_entries')
      .insert([this.mapTimeEntryToDB(entry)])
      .select()
      .single();

    if (error) {
      console.error('Error creating time entry:', error);
      return null;
    }

    return this.mapTimeEntryFromDB(data);
  }

  /**
   * Update an existing time entry
   */
  static async updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry | null> {
    const { data, error } = await supabase
      .from('time_entries')
      .update(this.mapTimeEntryToDB(updates as TimeEntry))
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating time entry:', error);
      return null;
    }

    return this.mapTimeEntryFromDB(data);
  }

  /**
   * Delete a time entry
   */
  static async deleteTimeEntry(entryId: string): Promise<boolean> {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting time entry:', error);
      return false;
    }

    return true;
  }

  // ==================== LEAVE REQUESTS ====================
  
  /**
   * Get all leave requests for a user
   */
  static async getLeaveRequests(userId: string): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }

    return data.map(this.mapLeaveRequestFromDB);
  }

  /**
   * Create a new leave request
   */
  static async createLeaveRequest(request: LeaveRequest): Promise<LeaveRequest | null> {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert([this.mapLeaveRequestToDB(request)])
      .select()
      .single();

    if (error) {
      console.error('Error creating leave request:', error);
      return null;
    }

    return this.mapLeaveRequestFromDB(data);
  }

  /**
   * Update a leave request (for approval/rejection)
   */
  static async updateLeaveRequest(requestId: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest | null> {
    const { data, error } = await supabase
      .from('leave_requests')
      .update(this.mapLeaveRequestToDB(updates as LeaveRequest))
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating leave request:', error);
      return null;
    }

    return this.mapLeaveRequestFromDB(data);
  }

  /**
   * Delete a leave request
   */
  static async deleteLeaveRequest(requestId: string): Promise<boolean> {
    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error deleting leave request:', error);
      return false;
    }

    return true;
  }

  // ==================== CALENDAR EVENTS ====================
  
  /**
   * Get calendar events for a user within a date range
   */
  static async getCalendarEvents(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CalendarEvent[]> {
    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }

    return data.map(this.mapCalendarEventFromDB);
  }

  // ==================== MAPPING FUNCTIONS ====================

  private static mapTaskFromDB(data: any): UserTask {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      orderId: data.order_id,
      status: data.status as TaskStatus,
      priority: data.priority,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapTaskToDB(task: UserTask): any {
    return {
      id: task.id,
      user_id: task.userId,
      title: task.title,
      description: task.description,
      order_id: task.orderId,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    };
  }

  private static mapTimeEntryFromDB(data: any): TimeEntry {
    return {
      id: data.id,
      userId: data.user_id,
      taskId: data.task_id,
      orderId: data.order_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      breakMinutes: data.break_minutes,
      totalHours: data.total_hours,
      description: data.description,
      createdAt: data.created_at,
    };
  }

  private static mapTimeEntryToDB(entry: TimeEntry): any {
    return {
      id: entry.id,
      user_id: entry.userId,
      task_id: entry.taskId,
      order_id: entry.orderId,
      date: entry.date,
      start_time: entry.startTime,
      end_time: entry.endTime,
      break_minutes: entry.breakMinutes,
      total_hours: entry.totalHours,
      description: entry.description,
    };
  }

  private static mapLeaveRequestFromDB(data: any): LeaveRequest {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type as LeaveType,
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      reason: data.reason,
      status: data.status as RequestStatus,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      createdAt: data.created_at,
    };
  }

  private static mapLeaveRequestToDB(request: LeaveRequest): any {
    return {
      id: request.id,
      user_id: request.userId,
      type: request.type,
      start_date: request.startDate,
      end_date: request.endDate,
      days: request.days,
      reason: request.reason,
      status: request.status,
      approved_by: request.approvedBy,
      approved_at: request.approvedAt,
      created_at: request.createdAt,
    };
  }

  private static mapCalendarEventFromDB(data: any): CalendarEvent {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      date: data.date,
      type: data.type,
      description: data.description,
    };
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Subscribe to real-time changes for user tasks
   */
  static subscribeToTasks(
    userId: string,
    onInsert: (task: UserTask) => void,
    onUpdate: (task: UserTask) => void,
    onDelete: (taskId: string) => void
  ) {
    const channel = supabase
      .channel('user_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onInsert(this.mapTaskFromDB(payload.new))
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onUpdate(this.mapTaskFromDB(payload.new))
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onDelete(payload.old.id)
      )
      .subscribe();

    return channel;
  }
}
