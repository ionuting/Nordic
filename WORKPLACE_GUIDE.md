# Workplace Feature Guide

## Overview
The **Workplace** tab is a user-centric dashboard providing personal task management, time tracking (pontaje), leave requests, and calendar integration.

## Features

### 📋 Tasks
Personal task management with:
- Task creation, editing, and deletion
- Status tracking: Pending, In Progress, Completed, Cancelled
- Priority levels: Low, Medium, High, Urgent
- Due date management
- Task descriptions and details
- Visual indicators for priority levels
- Real-time synchronization across devices

### ⏱️ Time Tracking (Pontaje)
Daily work hours tracking with:
- Date selection for entries
- Start time and end time input
- Break duration tracking
- Automatic total hours calculation
- Work description notes
- Daily summary of logged hours
- Historical time entry viewing

### 📝 Leave Requests
Employee absence management:
- Request types: Vacation, Sick Leave, Personal, Unpaid
- Date range selection
- Automatic day calculation
- Reason/notes for request
- Status tracking: Pending, Approved, Rejected
- Approval workflow (manager/admin approval)
- Request history and tracking

### 📅 Calendar
Unified view of workplace events (Coming Soon):
- Task deadlines
- Leave requests
- Meetings
- Company holidays
- Personal events

## Database Schema

### `user_tasks` Table
```sql
id UUID PRIMARY KEY
user_id TEXT NOT NULL
title TEXT NOT NULL
description TEXT
order_id TEXT (optional link to order)
status TEXT (pending|in_progress|completed|cancelled)
priority TEXT (low|medium|high|urgent)
due_date DATE NOT NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### `time_entries` Table
```sql
id UUID PRIMARY KEY
user_id TEXT NOT NULL
task_id TEXT (optional)
order_id TEXT (optional)
date DATE NOT NULL
start_time TIME NOT NULL
end_time TIME NOT NULL
break_minutes INTEGER DEFAULT 0
total_hours DECIMAL(5,2) NOT NULL
description TEXT
created_at TIMESTAMPTZ
```

### `leave_requests` Table
```sql
id UUID PRIMARY KEY
user_id TEXT NOT NULL
type TEXT (vacation|sick|personal|unpaid)
start_date DATE NOT NULL
end_date DATE NOT NULL
days INTEGER NOT NULL
reason TEXT
status TEXT (pending|approved|rejected)
approved_by TEXT
approved_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

### `calendar_events` Table
```sql
id UUID PRIMARY KEY
user_id TEXT NOT NULL
title TEXT NOT NULL
date DATE NOT NULL
type TEXT (task|meeting|leave|holiday|other)
created_at TIMESTAMPTZ
```

## Setup Instructions

### 1. Database Setup

Run the SQL setup script in your Supabase SQL Editor:
```bash
# Copy and run the content of:
supabase_workplace_setup.sql
```

This will create:
- All required tables
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates
- Sample data for testing

### 2. Verify Tables

After running the script, verify in Supabase Dashboard → Table Editor:
- ✓ user_tasks
- ✓ time_entries
- ✓ leave_requests
- ✓ calendar_events

### 3. Test the Feature

1. Navigate to the **Workplace** tab in the application
2. The interface will load with 4 sub-sections:
   - Tasks
   - Calendar
   - Time Tracking
   - Requests

### 4. Sample Data

The setup script includes sample data for `user-1`:
- 3 sample tasks with different priorities
- 2 time entries
- 1 pending leave request

## Usage Guide

### Creating a Task
1. Click **Tasks** tab
2. Click **➕ Add Task** button
3. Fill in:
   - Task title
   - Description (optional)
   - Priority level
   - Due date
4. Click **✓ Save**

### Logging Time (Pontaj)
1. Click **Time Tracking** tab
2. Select date (defaults to today)
3. Click **➕ Add Entry**
4. Enter:
   - Start time (e.g., 09:00)
   - End time (e.g., 17:00)
   - Break duration in minutes (e.g., 60)
   - Work description
5. Total hours are calculated automatically

### Submitting Leave Request
1. Click **Requests** tab
2. Click **➕ New Request**
3. Select:
   - Request type (Vacation, Sick, etc.)
   - Start date and end date
   - Reason (optional)
4. Submit and wait for manager approval

## Real-time Features

The Workplace feature uses Supabase real-time subscriptions for:
- **Task Updates**: Changes sync instantly across all user sessions
- **Automatic Refresh**: No manual refresh needed
- **Collaborative**: Multiple users can work simultaneously

## Integration Points

### Link Tasks with Orders
Tasks can be linked to specific orders via the `order_id` field:
```typescript
const task: UserTask = {
  ...
  orderId: 'order-uuid-here',  // Links task to order
  ...
};
```

### Link Time Entries with Tasks/Orders
Time entries can track work on specific tasks or orders:
```typescript
const entry: TimeEntry = {
  ...
  taskId: 'task-uuid-here',    // Links to specific task
  orderId: 'order-uuid-here',  // Links to specific order
  ...
};
```

## API Service

The `WorkplaceService` provides:

### Task Methods
```typescript
WorkplaceService.getUserTasks(userId)
WorkplaceService.createTask(task)
WorkplaceService.updateTask(taskId, updates)
WorkplaceService.deleteTask(taskId)
```

### Time Entry Methods
```typescript
WorkplaceService.getTimeEntries(userId, startDate?, endDate?)
WorkplaceService.createTimeEntry(entry)
WorkplaceService.updateTimeEntry(entryId, updates)
WorkplaceService.deleteTimeEntry(entryId)
```

### Leave Request Methods
```typescript
WorkplaceService.getLeaveRequests(userId)
WorkplaceService.createLeaveRequest(request)
WorkplaceService.updateLeaveRequest(requestId, updates)
WorkplaceService.deleteLeaveRequest(requestId)
```

### Calendar Methods
```typescript
WorkplaceService.getCalendarEvents(userId, startDate?, endDate?)
```

### Real-time Subscription
```typescript
const subscription = WorkplaceService.subscribeToTasks(
  userId,
  onInsert,
  onUpdate,
  onDelete
);

// Clean up when component unmounts
subscription.unsubscribe();
```

## Styling

All Workplace styles are in `src/components/Workplace.css`:
- Gradient header with purple theme
- Color-coded priority indicators
- Status badges (pending/approved/rejected)
- Responsive grid layouts
- Mobile-optimized views

## Future Enhancements

- [ ] **Calendar View Implementation**: Visual calendar with event display
- [ ] **Manager Approval Interface**: Dedicated view for approving leave requests
- [ ] **Reports**: Weekly/monthly time tracking reports
- [ ] **Notifications**: Push notifications for task deadlines and approvals
- [ ] **Task Comments**: Collaboration via task comments
- [ ] **File Attachments**: Attach files to tasks and leave requests
- [ ] **Recurring Tasks**: Support for repeating tasks
- [ ] **Team View**: See team members' availability and workload
- [ ] **Export**: Export time entries to CSV/Excel
- [ ] **Statistics**: Personal productivity analytics

## Troubleshooting

### Tasks not loading
1. Check browser console for errors
2. Verify Supabase connection in `supabaseService.ts`
3. Confirm tables exist in Supabase Dashboard
4. Check RLS policies are properly configured

### Real-time not working
1. Verify Supabase project has Realtime enabled
2. Check subscription is properly set up in `useEffect`
3. Ensure cleanup function calls `unsubscribe()`

### Time calculations incorrect
1. Verify time format is HH:MM (24-hour)
2. Check `breakMinutes` is a valid number
3. Use the `calculateHours()` helper function from `types/workplace.ts`

## Security Considerations

### Row Level Security (RLS)
All tables have RLS enabled. Current policies allow all operations for simplicity. For production:

Update policies to use authentication:
```sql
-- Example: Users can only view their own tasks
CREATE POLICY "Users view own tasks" 
ON public.user_tasks FOR SELECT 
USING (auth.uid()::text = user_id);
```

### Authentication Integration
To integrate with Supabase Auth:
1. Replace `userId` prop with `auth.uid()` from Supabase Auth
2. Update RLS policies to check `auth.uid()`
3. Add authentication flow (login/signup)
4. Modify `App.tsx` to get current user from auth context

## Mobile Support

The Workplace feature is fully responsive:
- **Mobile Layout**: Single-column grid
- **Touch-Friendly**: Large tap targets for buttons
- **Fullscreen Panels**: Better mobile viewing experience
- **Date Pickers**: Native mobile date selection
- **Bottom Sheet Navigation**: Tab navigation optimized for mobile

## Performance

Optimization features:
- **Indexed Queries**: Database indexes on frequently queried columns
- **Pagination Ready**: Service methods prepared for pagination
- **Memoized Calculations**: `useMemo` for filtered data
- **Debounced Updates**: Prevent excessive database writes
- **Real-time Filtering**: Client-side filtering reduces server load

---

**Version**: 1.0  
**Last Updated**: 2025  
**Author**: Nordic Software Solutions
