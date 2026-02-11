import { useState, useEffect } from 'react';
import TeamLibrarySidebar from './components/TeamLibrarySidebar';
import OrderNode from './components/OrderNode';
import HomeMapView from './components/HomeMapView';
import DatabaseView from './components/DatabaseView';
import { TeamMemberDisplay } from './types/teamMember';
import { Order, createNewOrder } from './types/order';
import { OrderService } from './services/orderService';
import { TeamMemberService } from './services/supabaseService';
import './App.css';

type TabType = 'home' | 'planning' | 'database';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load orders on component mount
  useEffect(() => {
    loadOrders();

    // Subscribe to real-time changes
    const subscription = OrderService.subscribeToChanges(
      (newOrder) => {
        // Check if order already exists before adding
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === newOrder.id);
          return exists ? prev : [...prev, newOrder];
        });
      },
      (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        );
      },
      (deletedId) => {
        setOrders((prev) => prev.filter((o) => o.id !== deletedId));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const loadedOrders = await OrderService.getAllOrders();
      setOrders(loadedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = async () => {
    const currentWeek = getCurrentWeekNumber();
    const newOrder = createNewOrder(currentWeek);
    
    // Create in Supabase - real-time subscription will update UI
    await OrderService.createOrder(newOrder);
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    const result = await OrderService.updateOrder(updatedOrder.id, updatedOrder);
    if (result) {
      // Real-time will update, but we can update optimistically
      setOrders((prev) =>
        prev.map((o) => (o.id === result.id ? result : o))
      );
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this order?');
    if (confirmed) {
      const success = await OrderService.deleteOrder(orderId);
      if (success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    }
  };

  const handleMemberDrop = async (orderId: string, role: string, member: TeamMemberDisplay) => {
    // Find the order and its week number
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Assign member to this week in database
    const success = await TeamMemberService.assignMemberToWeek(
      member.internal_number,
      order.weekNumber,
      order.orderNumber
    );

    if (success) {
      // Update order with new assignment
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            const updatedAssignments = o.roleAssignments.map((assignment) =>
              assignment.role === role ? { ...assignment, member } : assignment
            );
            const updatedOrder = { ...o, roleAssignments: updatedAssignments };
            
            // Update in Supabase
            OrderService.updateOrder(orderId, updatedOrder);
            
            return updatedOrder;
          }
          return o;
        })
      );
    }
  };

  const handleMemberRemove = async (orderId: string, role: string) => {
    // Find the order and the member being removed
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const assignment = order.roleAssignments.find((a) => a.role === role);
    if (!assignment?.member) return;

    // Unassign member from this week in database
    const success = await TeamMemberService.unassignMemberFromWeek(
      assignment.member.internal_number,
      order.weekNumber
    );

    if (success) {
      // Update order to remove assignment
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            const updatedAssignments = o.roleAssignments.map((a) =>
              a.role === role ? { ...a, member: null } : a
            );
            const updatedOrder = { ...o, roleAssignments: updatedAssignments };
            
            // Update in Supabase
            OrderService.updateOrder(orderId, updatedOrder);
            
            return updatedOrder;
          }
          return o;
        })
      );
    }
  };

  const handleMemberSelect = (member: TeamMemberDisplay) => {
    console.log('Selected member:', member);
  };

  // Helper to get current week number
  const getCurrentWeekNumber = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Nordic Software Solutions</h1>
        <p className="subtitle">Order Management System | Week {getCurrentWeekNumber()}</p>
      </header>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 Home
        </button>
        <button
          className={`tab-btn ${activeTab === 'planning' ? 'active' : ''}`}
          onClick={() => setActiveTab('planning')}
        >
          📋 Planning
        </button>
        <button
          className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          🗄️ Database
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'home' ? (
        <div className="tab-content tab-content-fixed">
          <HomeMapView orders={orders} loading={loading} />
        </div>
      ) : activeTab === 'database' ? (
        <div className="tab-content tab-content-scrollable">
          <DatabaseView />
        </div>
      ) : (
        <div className="app-content">
          <TeamLibrarySidebar 
            onMemberSelect={handleMemberSelect}
            currentWeekNumber={getCurrentWeekNumber()}
          />
          
          <div className="planning-canvas">
            <div className="canvas-header">
              <h2>Orders Canvas</h2>
              <div className="canvas-actions">
                <button 
                  className="add-order-btn"
                  onClick={handleAddOrder}
                  disabled={loading}
                >
                  ➕ Add New Order
                </button>
                <span className="order-count">
                  {orders.length} order{orders.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="canvas-content">
              {loading ? (
                <div className="loading-state">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="empty-canvas">
                  <p>📋 No orders yet. Click "Add New Order" to start planning!</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <OrderNode
                      key={order.id}
                      order={order}
                      onUpdate={handleUpdateOrder}
                      onDelete={handleDeleteOrder}
                      onMemberDrop={handleMemberDrop}
                      onMemberRemove={handleMemberRemove}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <footer className="app-footer">
        <p>Nordic Software Solutions v1.0 - Powered by Supabase</p>
      </footer>
    </div>
  );
}

export default App;
