import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeamMember, TeamMemberDisplay, toTeamMemberDisplay } from '../types/teamMember';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Database service for Team Members
export class TeamMemberService {
  private static tableName = 'Qualifications';

  /**
   * Fetch all team members from Supabase
   */
  static async getAllMembers(): Promise<TeamMemberDisplay[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }

      return (data as TeamMember[]).map(toTeamMemberDisplay);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      return [];
    }
  }

  /**
   * Get a single team member by internal number
   */
  static async getMemberById(internalNumber: number): Promise<TeamMemberDisplay | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('internal_number', internalNumber)
        .single();

      if (error) {
        console.error('Error fetching team member:', error);
        throw error;
      }

      return data ? toTeamMemberDisplay(data as TeamMember) : null;
    } catch (error) {
      console.error('Failed to fetch team member:', error);
      return null;
    }
  }

  /**
   * Filter members by name
   */
  static async filterMembersByName(nameQuery: string): Promise<TeamMemberDisplay[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .ilike('name', `%${nameQuery}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error filtering team members:', error);
        throw error;
      }

      return (data as TeamMember[]).map(toTeamMemberDisplay);
    } catch (error) {
      console.error('Failed to filter team members:', error);
      return [];
    }
  }

  /**
   * Filter members by qualification
   * @param qualification - One of: sr1, sr2, orf, mf, ts, ps, st, hm
   */
  static async filterMembersByQualification(qualification: string): Promise<TeamMemberDisplay[]> {
    try {
      const validQualifications = ['sr1', 'sr2', 'orf', 'mf', 'ts', 'ps', 'st', 'hm'];
      
      if (!validQualifications.includes(qualification.toLowerCase())) {
        console.error('Invalid qualification:', qualification);
        return [];
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq(qualification.toLowerCase(), true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error filtering by qualification:', error);
        throw error;
      }

      return (data as TeamMember[]).map(toTeamMemberDisplay);
    } catch (error) {
      console.error('Failed to filter by qualification:', error);
      return [];
    }
  }

  /**
   * Create a new team member
   */
  static async createMember(memberData: Partial<TeamMember>): Promise<TeamMemberDisplay | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([memberData])
        .select()
        .single();

      if (error) {
        console.error('Error creating team member:', error);
        throw error;
      }

      return data ? toTeamMemberDisplay(data as TeamMember) : null;
    } catch (error) {
      console.error('Failed to create team member:', error);
      return null;
    }
  }

  /**
   * Update an existing team member
   */
  static async updateMember(
    internalNumber: number,
    updates: Partial<TeamMember>
  ): Promise<TeamMemberDisplay | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('internal_number', internalNumber)
        .select()
        .single();

      if (error) {
        console.error('Error updating team member:', error);
        throw error;
      }

      return data ? toTeamMemberDisplay(data as TeamMember) : null;
    } catch (error) {
      console.error('Failed to update team member:', error);
      return null;
    }
  }

  /**
   * Delete a team member
   */
  static async deleteMember(internalNumber: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('internal_number', internalNumber);

      if (error) {
        console.error('Error deleting team member:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete team member:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time changes
   */
  static subscribeToChanges(
    onInsert?: (member: TeamMemberDisplay) => void,
    onUpdate?: (member: TeamMemberDisplay) => void,
    onDelete?: (internalNumber: number) => void
  ) {
    const subscription = supabase
      .channel('qualifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: this.tableName,
        },
        (payload) => {
          if (onInsert) {
            onInsert(toTeamMemberDisplay(payload.new as TeamMember, undefined));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: this.tableName,
        },
        (payload) => {
          if (onUpdate) {
            onUpdate(toTeamMemberDisplay(payload.new as TeamMember, undefined));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: this.tableName,
        },
        (payload) => {
          if (onDelete && payload.old) {
            onDelete((payload.old as TeamMember).internal_number);
          }
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * Assign a team member to an order for a specific week
   */
  static async assignMemberToWeek(
    internalNumber: number,
    weekNumber: number,
    orderNumber: string
  ): Promise<boolean> {
    try {
      const weekColumn = `week_${weekNumber}`;
      const { error } = await supabase
        .from(this.tableName)
        .update({ [weekColumn]: orderNumber })
        .eq('internal_number', internalNumber);

      if (error) {
        console.error('Error assigning member to week:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to assign member to week:', error);
      return false;
    }
  }

  /**
   * Unassign a team member from a specific week
   */
  static async unassignMemberFromWeek(
    internalNumber: number,
    weekNumber: number
  ): Promise<boolean> {
    try {
      const weekColumn = `week_${weekNumber}`;
      const { error } = await supabase
        .from(this.tableName)
        .update({ [weekColumn]: null })
        .eq('internal_number', internalNumber);

      if (error) {
        console.error('Error unassigning member from week:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to unassign member from week:', error);
      return false;
    }
  }

  /**
   * Get all members available for a specific week (not assigned)
   */
  static async getAvailableMembersForWeek(weekNumber: number): Promise<TeamMemberDisplay[]> {
    try {
      const weekColumn = `week_${weekNumber}`;
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .is(weekColumn, null)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error getting available members for week:', error);
        throw error;
      }

      return (data as TeamMember[]).map((m) => toTeamMemberDisplay(m, weekNumber));
    } catch (error) {
      console.error('Failed to get available members for week:', error);
      return [];
    }
  }
}
