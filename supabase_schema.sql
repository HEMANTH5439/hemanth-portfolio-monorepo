-- Supabase PostgreSQL Database Schema
-- Project: Hemanth Chellam Data & AI Telemetry Hub

-- 1. LLM Performance & SLA Telemetry Table
CREATE TABLE IF NOT EXISTS llm_telemetry_logs (
    id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    ttft_ms INT NOT NULL,
    tps_rate FLOAT NOT NULL,
    cost_per_1m FLOAT NOT NULL,
    status_code INT DEFAULT 200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Open-Source Security CVE Blast-Radius Table
CREATE TABLE IF NOT EXISTS cve_blast_cache (
    id BIGSERIAL PRIMARY KEY,
    package_name VARCHAR(100) NOT NULL,
    ecosystem VARCHAR(20) NOT NULL,
    cve_id VARCHAR(30) NOT NULL,
    cvss_score FLOAT NOT NULL,
    transitive_depth INT NOT NULL,
    blast_radius INT NOT NULL,
    recommended_fix VARCHAR(50),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for High-Speed Querying
CREATE INDEX IF NOT EXISTS idx_llm_model ON llm_telemetry_logs(model_name);
CREATE INDEX IF NOT EXISTS idx_cve_package ON cve_blast_cache(package_name);
