import { useState, useEffect } from 'react';
import { TeamMemberService } from '../services/supabaseService';
import { OrderService } from '../services/orderService';
import { TeamMemberDisplay } from '../types/teamMember';
import { Order } from '../types/order';
import './DatabaseView.css';

type TableType = 'members' | 'orders';

function DatabaseView() {
  const [activeTable, setActiveTable] = useState<TableType>('members');
  const [members, setMembers] = useState<TeamMemberDisplay[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editing state
  const [editingMember, setEditingMember] = useState<Partial<TeamMemberDisplay> | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTable]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTable === 'members') {
        const data = await TeamMemberService.getAllMembers();
        setMembers(data);
      } else {
        const data = await OrderService.getAllOrders();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (internalNumber: number) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    
    try {
      const success = await TeamMemberService.deleteMember(internalNumber);
      if (success) {
        setMembers(prev => prev.filter(m => m.internal_number !== internalNumber));
      }
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('Failed to delete member. Check console for details.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const success = await OrderService.deleteOrder(orderId);
      if (success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Check console for details.');
    }
  };

  const handleEditMember = (member: TeamMemberDisplay) => {
    setEditingMember({
      internal_number: member.internal_number,
      name: member.name,
      phone: member.phone,
      sr1: member.sr1,
      sr2: member.sr2,
      orf: member.orf,
      mf: member.mf,
      ts: member.ts,
      ps: member.ps,
      st: member.st,
      hm: member.hm,
    });
  };

  const handleSaveMember = async () => {
    if (!editingMember || !editingMember.internal_number) return;
    
    try {
      const updated = await TeamMemberService.updateMember(
        editingMember.internal_number,
        editingMember
      );
      
      if (updated) {
        setMembers(prev => 
          prev.map(m => m.internal_number === updated.internal_number ? updated : m)
        );
        setEditingMember(null);
      }
    } catch (error) {
      console.error('Failed to update member:', error);
      alert('Failed to update member. Check console for details.');
    }
  };

  const handleAddMember = async () => {
    if (!editingMember) return;
    
    try {
      const newMember = await TeamMemberService.createMember(editingMember);
      if (newMember) {
        setMembers(prev => [...prev, newMember]);
        setEditingMember(null);
        setShowAddMemberForm(false);
      }
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member. Check console for details.');
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="database-view">
      <div className="database-header">
        <h2>🗄️ Database Administration</h2>
        <div className="table-selector">
          <button
            className={`table-btn ${activeTable === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTable('members')}
          >
            👥 Team Members ({members.length})
          </button>
          <button
            className={`table-btn ${activeTable === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTable('orders')}
          >
            📦 Orders ({orders.length})
          </button>
        </div>
      </div>

      <div className="database-controls">
        <input
          type="text"
          className="search-input"
          placeholder={`Search ${activeTable}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {activeTable === 'members' && (
          <button 
            className="add-btn"
            onClick={() => {
              setShowAddMemberForm(true);
              setEditingMember({
                internal_number: Date.now(), // Temporary ID
                name: '',
                phone: '',
                sr1: false,
                sr2: false,
                orf: false,
                mf: false,
                ts: false,
                ps: false,
                st: false,
                hm: false,
              });
            }}
          >
            ➕ Add New Member
          </button>
        )}
        
        <button className="refresh-btn" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading data...</div>
      ) : (
        <div className="table-container">
          {activeTable === 'members' ? (
            <>
              {/* Add/Edit Form */}
              {(editingMember || showAddMemberForm) && (
                <div className="edit-modal">
                  <div className="edit-form">
                    <h3>{showAddMemberForm ? '➕ Add New Member' : '✏️ Edit Member'}</h3>
                    
                    <div className="form-group">
                      <label>Internal Number:</label>
                      <input
                        type="number"
                        value={editingMember?.internal_number || ''}
                        onChange={(e) => setEditingMember(prev => prev ? 
                          {...prev, internal_number: parseInt(e.target.value)} : null
                        )}
                        disabled={!showAddMemberForm}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Name:</label>
                      <input
                        type="text"
                        value={editingMember?.name || ''}
                        onChange={(e) => setEditingMember(prev => prev ? 
                          {...prev, name: e.target.value} : null
                        )}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Phone:</label>
                      <input
                        type="text"
                        value={editingMember?.phone || ''}
                        onChange={(e) => setEditingMember(prev => prev ? 
                          {...prev, phone: e.target.value} : null
                        )}
                      />
                    </div>
                    
                    <div className="qualifications-grid">
                      <h4>Qualifications:</h4>
                      {['sr1', 'sr2', 'orf', 'mf', 'ts', 'ps', 'st', 'hm'].map(qual => (
                        <label key={qual} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={(editingMember?.[qual as keyof TeamMemberDisplay] as boolean) || false}
                            onChange={(e) => setEditingMember(prev => prev ? 
                              {...prev, [qual]: e.target.checked} : null
                            )}
                          />
                          <span>{qual.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        className="save-btn"
                        onClick={showAddMemberForm ? handleAddMember : handleSaveMember}
                      >
                        💾 {showAddMemberForm ? 'Create' : 'Save'}
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => {
                          setEditingMember(null);
                          setShowAddMemberForm(false);
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Members Table */}
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Qualifications</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.internal_number}>
                      <td>{member.internal_number}</td>
                      <td>{member.name}</td>
                      <td>{member.phone}</td>
                      <td>
                        <div className="badges">
                          {member.qualifications.map(q => (
                            <span key={q} className="badge">{q}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn-small"
                            onClick={() => handleEditMember(member)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn-small"
                            onClick={() => handleDeleteMember(member.internal_number)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            /* Orders Table */
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Week</th>
                  <th>Location</th>
                  <th>Coordinates</th>
                  <th>Assigned</th>
                  <th>Schedule</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>{order.orderNumber}</strong></td>
                    <td>Week {order.weekNumber}</td>
                    <td>{order.location}</td>
                    <td className="coordinates">
                      {order.locationLatitude && order.locationLongitude
                        ? `${order.locationLatitude.toFixed(4)}, ${order.locationLongitude.toFixed(4)}`
                        : 'Not set'
                      }
                    </td>
                    <td>
                      {order.roleAssignments.filter(a => a.member).length} / {order.roleAssignments.length}
                    </td>
                    <td className="schedule-cell">
                      {order.dailySchedule.filter(s => s.startTime && s.endTime).map((schedule) => (
                        <div key={schedule.day} className="schedule-item">
                          {schedule.day}: {schedule.startTime}-{schedule.endTime}
                        </div>
                      ))}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="delete-btn-small"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default DatabaseView;
