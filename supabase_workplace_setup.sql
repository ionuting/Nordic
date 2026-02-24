-- ============================================
-- WORKPLACE TABLES SETUP
-- Tables for user tasks, time tracking, leave requests, and calendar
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON public.user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_tasks_due_date ON public.user_tasks(due_date);

-- Enable Row Level Security
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own tasks
CREATE POLICY "Users can view their own tasks" 
ON public.user_tasks FOR SELECT 
USING (true); -- Open for now, add auth.uid() = user_id when authentication is set up

-- RLS Policy: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks" 
ON public.user_tasks FOR INSERT 
WITH CHECK (true); -- Open for now

-- RLS Policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks" 
ON public.user_tasks FOR UPDATE 
USING (true); -- Open for now

-- RLS Policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks" 
ON public.user_tasks FOR DELETE 
USING (true); -- Open for now

-- ============================================
-- TIME ENTRIES TABLE (Pontaje)
-- ============================================
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    task_id TEXT,
    order_id TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER DEFAULT 0,
    total_hours DECIMAL(5,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON public.time_entries(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own time entries" 
ON public.time_entries FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own time entries" 
ON public.time_entries FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own time entries" 
ON public.time_entries FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own time entries" 
ON public.time_entries FOR DELETE 
USING (true);

-- ============================================
-- LEAVE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('vacation', 'sick', 'personal', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON public.leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own leave requests" 
ON public.leave_requests FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own leave requests" 
ON public.leave_requests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own leave requests" 
ON public.leave_requests FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own leave requests" 
ON public.leave_requests FOR DELETE 
USING (true);

-- ============================================
-- CALENDAR EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('task', 'meeting', 'leave', 'holiday', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON public.calendar_events(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own calendar events" 
ON public.calendar_events FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own calendar events" 
ON public.calendar_events FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own calendar events" 
ON public.calendar_events FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own calendar events" 
ON public.calendar_events FOR DELETE 
USING (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_tasks table
DROP TRIGGER IF EXISTS update_user_tasks_updated_at ON public.user_tasks;
CREATE TRIGGER update_user_tasks_updated_at 
    BEFORE UPDATE ON public.user_tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample tasks
INSERT INTO public.user_tasks (user_id, title, description, status, priority, due_date) VALUES
('user-1', 'Complete project documentation', 'Write comprehensive docs for the new feature', 'in_progress', 'high', CURRENT_DATE + INTERVAL '3 days'),
('user-1', 'Review pull requests', 'Review and approve pending PRs', 'pending', 'medium', CURRENT_DATE + INTERVAL '1 day'),
('user-1', 'Team meeting preparation', 'Prepare slides and agenda for weekly team meeting', 'pending', 'low', CURRENT_DATE + INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Insert sample time entries
INSERT INTO public.time_entries (user_id, date, start_time, end_time, break_minutes, total_hours, description) VALUES
('user-1', CURRENT_DATE, '09:00', '17:00', 60, 7.0, 'Working on Nordic app workplace feature'),
('user-1', CURRENT_DATE - INTERVAL '1 day', '09:00', '18:00', 60, 8.0, 'Code review and testing')
ON CONFLICT DO NOTHING;

-- Insert sample leave request
INSERT INTO public.leave_requests (user_id, type, start_date, end_date, days, reason, status) VALUES
('user-1', 'vacation', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '18 days', 5, 'Summer vacation', 'pending')
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT ALL ON public.user_tasks TO authenticated;
GRANT ALL ON public.time_entries TO authenticated;
GRANT ALL ON public.leave_requests TO authenticated;
GRANT ALL ON public.calendar_events TO authenticated;

-- Grant permissions to anon users (for public access if needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_tasks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO anon;
