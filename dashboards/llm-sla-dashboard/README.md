# ⚡ Open-Source LLM Performance, Cost & SLA Intelligence Dashboard

An interactive, operational telemetry dashboard and cloud data pipeline tracking **real-time Latency (TTFT)**, **Throughput (TPS)**, **Token Pricing ($/1M)**, and **Provider SLA Drift** across open-weights LLMs.

![Dashboard Preview](https://img.shields.io/badge/Plotly-Dash-blue?style=for-the-badge&logo=plotly)
![Database](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)
![Hosting](https://img.shields.io/badge/Vercel-Serverless-black?style=for-the-badge&logo=vercel)
![Local AI](https://img.shields.io/badge/Local_LLM-Ollama-orange?style=for-the-badge)

---

## 🌟 Key Highlights & Metrics

- **Pareto Frontier Efficiency Mapping:** Real-time scatter visualization plotting TTFT latency vs prompt/completion costs to instantly locate optimal price-performance models.
- **Provider SLA & Variance Analytics:** Box/Violin distribution comparisons across inference providers (Groq, Together.ai, DeepInfra, Fireworks) for identical models (Llama 3 70B, Qwen 2.5, DeepSeek).
- **Zero-Token Local AI Summarizer:** Integrated with local Ollama model (`llama3.2`) to generate telemetry insights and anomaly reports locally without burning cloud AI credits.
- **PostgreSQL Slicing & Storage:** Powered by Supabase PostgreSQL for rapid time-series filtering by model parameter size (`7B`, `70B`, `400B+`), provider, and context window tiers.

---

## 🛠 Tech Stack Architecture

- **Frontend & Visualizations:** `Dash` / `Plotly`, `Dash Bootstrap Components`
- **Database & Storage:** `Supabase` (PostgreSQL)
- **Data Processing:** `Polars`, `Pandas`, `requests`
- **Deployment & Compute:** `Vercel` Serverless Functions
- **Local AI:** `Ollama` (`llama3.2`)

---

## 🚀 Quickstart & Local Setup

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/llm-sla-dashboard.git
cd llm-sla-dashboard
pip install -r requirements.txt
```

### 2. Configure Environment Variables (Optional for Supabase)
Copy `.env.example` to `.env`:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OLLAMA_HOST=http://localhost:11434/api/generate
```

### 3. Fetch Live Telemetry Data
```bash
python ingest.py
```

### 4. Run Interactive Plotly Dashboard
```bash
python app.py
```
Open `http://localhost:8050` in your browser.

---

## 📊 Database Schema

See [`schema.sql`](file:///Users/chillsyeah/.gemini/antigravity/scratch/llm-sla-dashboard/schema.sql) for PostgreSQL table definitions, indexing strategies, and relational foreign keys.
