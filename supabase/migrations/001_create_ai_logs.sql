-- Create ai_logs table for tracking generation attempts
CREATE TABLE IF NOT EXISTS ai_logs (
  id BIGSERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  attempt INTEGER NOT NULL,
  raw_response TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying logs by prompt or time
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_prompt ON ai_logs(prompt);
