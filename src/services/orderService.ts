import { supabase } from './supabaseService';
import { Order, OrderDB, orderToDBFormat, dbFormatToOrder } from '../types/order';

/**
 * Service for managing Orders (Weekly Tasks) in Supabase
 */
export class OrderService {
  private static tableName = 'Orders';

  /**
   * Fetch all orders from Supabase
   */
  static async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('week_number', { ascending: true });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return (data as OrderDB[]).map(dbFormatToOrder);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return [];
    }
  }

  /**
   * Get a single order by ID
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }

      return data ? dbFormatToOrder(data as OrderDB) : null;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      return null;
    }
  }

  /**
   * Filter orders by week number
   */
  static async getOrdersByWeek(weekNumber: number): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('week_number', weekNumber)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error filtering orders by week:', error);
        throw error;
      }

      return (data as OrderDB[]).map(dbFormatToOrder);
    } catch (error) {
      console.error('Failed to filter orders by week:', error);
      return [];
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(order: Order): Promise<Order | null> {
    try {
      const dbFormat = orderToDBFormat(order);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([dbFormat])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      return data ? dbFormatToOrder(data as OrderDB) : null;
    } catch (error) {
      console.error('Failed to create order:', error);
      return null;
    }
  }

  /**
   * Update an existing order
   */
  static async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order | null> {
    try {
      const dbFormat = orderToDBFormat(updates as Order);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update(dbFormat)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order:', error);
        throw error;
      }

      return data ? dbFormatToOrder(data as OrderDB) : null;
    } catch (error) {
      console.error('Failed to update order:', error);
      return null;
    }
  }

  /**
   * Delete an order
   */
  static async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Error deleting order:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete order:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time changes
   */
  static subscribeToChanges(
    onInsert?: (order: Order) => void,
    onUpdate?: (order: Order) => void,
    onDelete?: (orderId: string) => void
  ) {
    const subscription = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: this.tableName,
        },
        (payload) => {
          if (onInsert) {
            onInsert(dbFormatToOrder(payload.new as OrderDB));
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
            onUpdate(dbFormatToOrder(payload.new as OrderDB));
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
            onDelete((payload.old as OrderDB).id);
          }
        }
      )
      .subscribe();

    return subscription;
  }
}
