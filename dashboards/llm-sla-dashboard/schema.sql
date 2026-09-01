-- Supabase PostgreSQL Schema for LLM Performance, Cost & SLA Intelligence Dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Models Catalog & Metadata
CREATE TABLE IF NOT EXISTS public.models (
    id TEXT PRIMARY KEY,                       -- e.g., 'meta-llama/llama-3-70b-instruct'
    name TEXT NOT NULL,                         -- Human readable display name
    architecture TEXT,                          -- Model architecture/family
    parameter_size TEXT,                        -- Parameter tier (e.g. '7B', '70B', '400B+')
    context_length INT DEFAULT 4096,           -- Context window token limit
    prompt_price_per_1m NUMERIC(10, 4),        -- $ USD per 1M prompt tokens
    completion_price_per_1m NUMERIC(10, 4),    -- $ USD per 1M completion tokens
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: Real-time Performance & SLA Logs
CREATE TABLE IF NOT EXISTS public.performance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id TEXT REFERENCES public.models(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,                     -- e.g., 'Groq', 'Together', 'DeepInfra', 'Fireworks'
    ttft_ms NUMERIC(10, 2) NOT NULL,            -- Time To First Token in milliseconds
    tps NUMERIC(10, 2) NOT NULL,                -- Tokens Per Second (Throughput)
    status_code INT DEFAULT 200,               -- HTTP Status Code (200 = Success, 5xx = Error/SLA Incident)
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rapid dynamic slicing & dashboard filtering queries
CREATE INDEX IF NOT EXISTS idx_perf_logs_timestamp ON public.performance_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_perf_logs_model_provider ON public.performance_logs(model_id, provider);
CREATE INDEX IF NOT EXISTS idx_models_param_size ON public.models(parameter_size);
