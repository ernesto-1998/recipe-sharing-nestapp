CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS api_logs (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    context VARCHAR(100), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(24),

    host VARCHAR(100),
    http_method VARCHAR(10),
    full_url TEXT,
    path TEXT,
    ip_address VARCHAR(45), 
    status_code INTEGER,
    protocol VARCHAR(10),              
                 
    trace TEXT                 
);


CREATE INDEX idx_api_logs_created_at ON api_logs (created_at DESC);


CREATE INDEX idx_api_logs_level_status ON api_logs (level, status_code);


CREATE INDEX idx_api_logs_user_id ON api_logs (user_id);
