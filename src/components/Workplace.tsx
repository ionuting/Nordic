import React, { useState, useMemo, useEffect } from 'react';
import {
  UserTask,
  TimeEntry,
  LeaveRequest,
  TaskStatus,
  TaskPriority,
  LeaveType,
  RequestStatus,
  calculateHours,
  createNewTask,
  createNewTimeEntry,
  createNewLeaveRequest,
} from '../types/workplace';
import { WorkplaceService } from '../services/workplaceService';
import './Workplace.css';

type WorkplaceView = 'tasks' | 'calendar' | 'time-tracking' | 'requests';

interface WorkplaceProps {
  userId: string;
  userName: string;
}

const Workplace: React.FC<WorkplaceProps> = ({ userId, userName }) => {
  const [activeView, setActiveView] = useState<WorkplaceView>('tasks');
  const [loading, setLoading] = useState(true);
  
  // State for tasks
  const [tasks, setTasks] = useState<UserTask[]>([]);
  
  // State for time entries
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // State for leave requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  // Load data on mount and subscribe to changes
  useEffect(() => {
    loadAllData();

    // Subscribe to real-time task updates
    const taskSubscription = WorkplaceService.subscribeToTasks(
      userId,
      (newTask) => {
        setTasks((prev) => {
          const exists = prev.some((t) => t.id === newTask.id);
          return exists ? prev : [newTask, ...prev];
        });
      },
      (updatedTask) => {
        setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      },
      (deletedId) => {
        setTasks((prev) => prev.filter((t) => t.id !== deletedId));
      }
    );

    return () => {
      taskSubscription.unsubscribe();
    };
  }, [userId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [tasksData, timeEntriesData, leaveRequestsData] = await Promise.all([
        WorkplaceService.getUserTasks(userId),
        WorkplaceService.getTimeEntries(userId),
        WorkplaceService.getLeaveRequests(userId),
      ]);
      setTasks(tasksData);
      setTimeEntries(timeEntriesData);
      setLeaveRequests(leaveRequestsData);
    } catch (error) {
      console.error('Failed to load workplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for tasks
  const handleAddTask = async () => {
    const newTask = createNewTask(userId);
    const created = await WorkplaceService.createTask(newTask);
    if (created) {
      setTasks([created, ...tasks]);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<UserTask>) => {
    const updated = await WorkplaceService.updateTask(taskId, updates);
    if (updated) {
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      const success = await WorkplaceService.deleteTask(taskId);
      if (success) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    }
  };

  // Handlers for time entries
  const handleAddTimeEntry = async () => {
    const newEntry = createNewTimeEntry(userId, selectedDate);
    const created = await WorkplaceService.createTimeEntry(newEntry);
    if (created) {
      setTimeEntries([created, ...timeEntries]);
    }
  };

  const handleUpdateTimeEntry = async (entryId: string, updates: Partial<TimeEntry>) => {
    // Recalculate hours if times changed
    let finalUpdates = { ...updates };
    const entry = timeEntries.find(e => e.id === entryId);
    if (entry && (updates.startTime || updates.endTime || updates.breakMinutes !== undefined)) {
      const startTime = updates.startTime || entry.startTime;
      const endTime = updates.endTime || entry.endTime;
      const breakMinutes = updates.breakMinutes !== undefined ? updates.breakMinutes : entry.breakMinutes;
      finalUpdates.totalHours = calculateHours(startTime, endTime, breakMinutes);
    }
    
    const updated = await WorkplaceService.updateTimeEntry(entryId, finalUpdates);
    if (updated) {
      setTimeEntries(timeEntries.map(e => e.id === entryId ? updated : e));
    }
  };

  const handleDeleteTimeEntry = async (entryId: string) => {
    if (window.confirm('Delete this time entry?')) {
      const success = await WorkplaceService.deleteTimeEntry(entryId);
      if (success) {
        setTimeEntries(timeEntries.filter(e => e.id !== entryId));
      }
    }
  };

  // Handlers for leave requests
  const handleAddLeaveRequest = async () => {
    const newRequest = createNewLeaveRequest(userId);
    const created = await WorkplaceService.createLeaveRequest(newRequest);
    if (created) {
      setLeaveRequests([created, ...leaveRequests]);
    }
  };

  const handleDeleteLeaveRequest = async (requestId: string) => {
    if (window.confirm('Delete this request?')) {
      const success = await WorkplaceService.deleteLeaveRequest(requestId);
      if (success) {
        setLeaveRequests(leaveRequests.filter(r => r.id !== requestId));
      }
    }
  };

  // Filtered data
  const entriesForSelectedDate = useMemo(
    () => timeEntries.filter(e => e.date === selectedDate),
    [timeEntries, selectedDate]
  );

  const totalHoursForDate = useMemo(
    () => entriesForSelectedDate.reduce((sum, e) => sum + e.totalHours, 0),
    [entriesForSelectedDate]
  );

  const weekTasks = useMemo(() => {
    const today = new Date();
    const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate >= today && dueDate <= weekAhead && t.status !== 'completed';
    });
  }, [tasks]);

  return (
    <div className="workplace-container">
      <div className="workplace-header">
        <div>
          <h1>👤 Workplace</h1>
          <p className="workplace-subtitle">Welcome, {userName}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state" style={{ padding: '60px', textAlign: 'center' }}>
          Loading workplace data...
        </div>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="workplace-nav">
            <button
              className={`nav-btn ${activeView === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveView('tasks')}
            >
              📋 Tasks {weekTasks.length > 0 && <span className="badge">{weekTasks.length}</span>}
            </button>
            <button
              className={`nav-btn ${activeView === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveView('calendar')}
            >
              📅 Calendar
            </button>
            <button
              className={`nav-btn ${activeView === 'time-tracking' ? 'active' : ''}`}
              onClick={() => setActiveView('time-tracking')}
            >
              ⏱️ Time Tracking
            </button>
            <button
              className={`nav-btn ${activeView === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveView('requests')}
            >
              📝 Requests {leaveRequests.filter(r => r.status === 'pending').length > 0 && 
                <span className="badge">{leaveRequests.filter(r => r.status === 'pending').length}</span>}
            </button>
          </div>

      {/* Content Area */}
      <div className="workplace-content">
        {activeView === 'tasks' && (
          <div className="tasks-view">
            <div className="view-header">
              <h2>My Tasks</h2>
              <button className="btn-primary" onClick={handleAddTask}>
                ➕ Add Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-state">
                <p>📋 No tasks yet. Add your first task!</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="calendar-view">
            <div className="view-header">
              <h2>Calendar</h2>
            </div>
            <div className="calendar-placeholder">
              <p>📅 Calendar view coming soon - will display tasks, leave requests, and holidays</p>
            </div>
          </div>
        )}

        {activeView === 'time-tracking' && (
          <div className="time-tracking-view">
            <div className="view-header">
              <h2>Time Tracking (Pontaje)</h2>
              <div className="date-selector">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="date-input"
                />
                <button className="btn-primary" onClick={handleAddTimeEntry}>
                  ➕ Add Entry
                </button>
              </div>
            </div>

            <div className="time-summary">
              <div className="summary-card">
                <span className="summary-label">Total Hours Today:</span>
                <span className="summary-value">{totalHoursForDate.toFixed(2)}h</span>
              </div>
            </div>

            {entriesForSelectedDate.length === 0 ? (
              <div className="empty-state">
                <p>⏱️ No time entries for this date</p>
              </div>
            ) : (
              <div className="time-entries-list">
                {entriesForSelectedDate.map(entry => (
                  <TimeEntryCard
                    key={entry.id}
                    entry={entry}
                    onUpdate={handleUpdateTimeEntry}
                    onDelete={handleDeleteTimeEntry}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'requests' && (
          <div className="requests-view">
            <div className="view-header">
              <h2>Leave Requests</h2>
              <button className="btn-primary" onClick={handleAddLeaveRequest}>
                ➕ New Request
              </button>
            </div>

            {leaveRequests.length === 0 ? (
              <div className="empty-state">
                <p>📝 No leave requests yet</p>
              </div>
            ) : (
              <div className="requests-list">
                {leaveRequests.map(request => (
                  <LeaveRequestCard
                    key={request.id}
                    request={request}
                    onDelete={handleDeleteLeaveRequest}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

// Task Card Component
const TaskCard: React.FC<{
  task: UserTask;
  onUpdate: (id: string, updates: Partial<UserTask>) => void;
  onDelete: (id: string) => void;
}> = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(!task.title);

  const statusColors: Record<TaskStatus, string> = {
    pending: '#ff9800',
    in_progress: '#2196f3',
    completed: '#4caf50',
    cancelled: '#757575',
  };

  const priorityColors: Record<TaskPriority, string> = {
    low: '#9e9e9e',
    medium: '#ff9800',
    high: '#ff5722',
    urgent: '#f44336',
  };

  return (
    <div className="task-card" style={{ borderLeft: `4px solid ${priorityColors[task.priority]}` }}>
      {isEditing ? (
        <div className="task-edit">
          <input
            type="text"
            value={task.title}
            onChange={(e) => onUpdate(task.id, { title: e.target.value })}
            placeholder="Task title"
            className="task-title-input"
          />
          <textarea
            value={task.description}
            onChange={(e) => onUpdate(task.id, { description: e.target.value })}
            placeholder="Description"
            className="task-desc-input"
            rows={3}
          />
          <div className="task-meta-edit">
            <select
              value={task.priority}
              onChange={(e) => onUpdate(task.id, { priority: e.target.value as TaskPriority })}
              className="task-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input
              type="date"
              value={task.dueDate}
              onChange={(e) => onUpdate(task.id, { dueDate: e.target.value })}
              className="task-date-input"
            />
          </div>
          <button className="btn-save" onClick={() => setIsEditing(false)}>
            ✓ Save
          </button>
        </div>
      ) : (
        <>
          <div className="task-header">
            <h3 className="task-title">{task.title}</h3>
            <div className="task-actions">
              <button className="btn-icon" onClick={() => setIsEditing(true)} title="Edit">
                ✏️
              </button>
              <button className="btn-icon" onClick={() => onDelete(task.id)} title="Delete">
                🗑️
              </button>
            </div>
          </div>
          {task.description && <p className="task-description">{task.description}</p>}
          <div className="task-footer">
            <select
              value={task.status}
              onChange={(e) => onUpdate(task.id, { status: e.target.value as TaskStatus })}
              className="status-select"
              style={{ backgroundColor: statusColors[task.status] }}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="task-due">📅 {task.dueDate}</span>
          </div>
        </>
      )}
    </div>
  );
};

// Time Entry Card Component
const TimeEntryCard: React.FC<{
  entry: TimeEntry;
  onUpdate: (id: string, updates: Partial<TimeEntry>) => void;
  onDelete: (id: string) => void;
}> = ({ entry, onUpdate, onDelete }) => {
  return (
    <div className="time-entry-card">
      <div className="time-entry-header">
        <span className="time-hours">{entry.totalHours.toFixed(2)}h</span>
        <button className="btn-icon-sm" onClick={() => onDelete(entry.id)}>
          🗑️
        </button>
      </div>
      <div className="time-entry-body">
        <div className="time-input-group">
          <label>Start:</label>
          <input
            type="time"
            value={entry.startTime}
            onChange={(e) => onUpdate(entry.id, { startTime: e.target.value })}
            className="time-input"
          />
        </div>
        <div className="time-input-group">
          <label>End:</label>
          <input
            type="time"
            value={entry.endTime}
            onChange={(e) => onUpdate(entry.id, { endTime: e.target.value })}
            className="time-input"
          />
        </div>
        <div className="time-input-group">
          <label>Break (min):</label>
          <input
            type="number"
            value={entry.breakMinutes}
            onChange={(e) => onUpdate(entry.id, { breakMinutes: Number(e.target.value) })}
            className="time-input"
            min="0"
          />
        </div>
      </div>
      <textarea
        value={entry.description}
        onChange={(e) => onUpdate(entry.id, { description: e.target.value })}
        placeholder="What did you work on?"
        className="time-description"
        rows={2}
      />
    </div>
  );
};

// Leave Request Card Component
const LeaveRequestCard: React.FC<{
  request: LeaveRequest;
  onDelete: (id: string) => void;
}> = ({ request, onDelete }) => {
  const statusColors: Record<RequestStatus, string> = {
    pending: '#ff9800',
    approved: '#4caf50',
    rejected: '#f44336',
  };

  const typeLabels: Record<LeaveType, string> = {
    vacation: '🏖️ Vacation',
    sick: '🤒 Sick Leave',
    personal: '🏠 Personal',
    unpaid: '📋 Unpaid',
  };

  return (
    <div className="leave-request-card">
      <div className="request-header">
        <span className="request-type">{typeLabels[request.type]}</span>
        <span 
          className="request-status"
          style={{ backgroundColor: statusColors[request.status] }}
        >
          {request.status}
        </span>
        <button className="btn-icon-sm" onClick={() => onDelete(request.id)}>
          🗑️
        </button>
      </div>
      <div className="request-body">
        <div className="request-dates">
          <span>📅 {request.startDate}</span>
          <span>→</span>
          <span>📅 {request.endDate}</span>
          <span className="request-days">({request.days} days)</span>
        </div>
        {request.reason && <p className="request-reason">{request.reason}</p>}
      </div>
    </div>
  );
};

export default Workplace;
