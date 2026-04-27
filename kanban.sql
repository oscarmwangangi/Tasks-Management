CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user', -- admin or user
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member'
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,

  status TEXT CHECK (
    status IN ('backlog','todo','in_progress','active','review','done')
  ) DEFAULT 'backlog',

  priority TEXT CHECK (
    priority IN ('low','medium','high')
  ) DEFAULT 'medium',

  due_date DATE,
  start_date DATE, -- for Gantt chart
  end_date DATE,   -- for Gantt chart

  is_favorite BOOLEAN DEFAULT FALSE,

  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),

  message TEXT,
  type TEXT CHECK (type IN ('reminder','system','info')) DEFAULT 'reminder',

  is_read BOOLEAN DEFAULT FALSE,

  send_at TIMESTAMP, -- when reminder should trigger
  created_at TIMESTAMP DEFAULT NOW()
);
