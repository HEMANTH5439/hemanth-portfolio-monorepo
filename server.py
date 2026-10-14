#!/usr/bin/env python3
"""
Python HTTP & Gemini Proxy Server for Hemanth Portfolio
Serves static portfolio files and proxies /api/chat to Google Gemini API
Features dynamic model discovery & self-healing model-hopping (same pattern as The Way Back app)
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get("PORT", 8070))

# Load .env file
def load_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))

load_env()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
ENV_GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "")
ADMIN_SECRET_PIN = os.environ.get("ADMIN_SECRET_PIN", "1919")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
TELEMETRY_FILE = os.path.join(DATA_DIR, "visitor_telemetry.json")

# In-memory model discovery cache (6-hour TTL)
_cached_models = []
_last_fetch_time = 0
CACHE_TTL_SEC = 60 * 60 * 6

FALLBACK_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
]

def get_active_gemini_models(api_key):
    """
    Dynamically discovers currently active Gemini models from Google's REST API.
    Prioritizes low-token flash-lite and flash models.
    Caches results for 6 hours.
    """
    global _cached_models, _last_fetch_time
    now = time.time()

    if _cached_models and (now - _last_fetch_time < CACHE_TTL_SEC):
        if ENV_GEMINI_MODEL:
            return [ENV_GEMINI_MODEL] + [m for m in _cached_models if m != ENV_GEMINI_MODEL]
        return _cached_models

    if not api_key:
        if ENV_GEMINI_MODEL:
            return [ENV_GEMINI_MODEL] + [m for m in FALLBACK_MODELS if m != ENV_GEMINI_MODEL]
        return FALLBACK_MODELS

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        req = urllib.request.Request(url, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            models = data.get("models", [])
            supported = []
            for m in models:
                methods = m.get("supportedGenerationMethods", [])
                if "generateContent" in methods:
                    name = m.get("name", "").replace("models/", "")
                    supported.append(name)

            # Sort to prioritize low-token consumption & low-latency models:
            # 1. flash-lite / lite (highest priority - lowest token cost)
            # 2. flash
            # 3. other models
            def sort_priority(model_name):
                name_lower = model_name.lower()
                if "lite" in name_lower and "flash" in name_lower:
                    return 3
                elif "lite" in name_lower:
                    return 2
                elif "flash" in name_lower:
                    return 1
                return 0

            supported.sort(key=sort_priority, reverse=True)

            if supported:
                _cached_models = supported
                _last_fetch_time = now
                if ENV_GEMINI_MODEL:
                    return [ENV_GEMINI_MODEL] + [m for m in supported if m != ENV_GEMINI_MODEL]
                return supported

    except Exception as e:
        print(f"[Gemini Model Discovery Warning] Failed to query dynamic models: {e}. Using fallback defaults.")

    if ENV_GEMINI_MODEL:
        return [ENV_GEMINI_MODEL] + [m for m in FALLBACK_MODELS if m != ENV_GEMINI_MODEL]
    return FALLBACK_MODELS


SYSTEM_INSTRUCTION = """You are the executive AI Assistant for Hemanth Chellam, a Senior Analytics & Data Engineer with 9+ years of experience delivering high-throughput ETL pipelines, big data architectures, and enterprise AI solutions at scale.
Speak in a professional, technical, direct, yet friendly tone as Hemanth's representative. Keep responses concise (typically 2 to 4 punchy sentences or clear bullet points) unless specifically asked for a deep dive.

Verified Background:
• Current / Recent Roles:
  - Koantek (Databricks Contract): Senior Data Engineer. Spark Structured Streaming on Databricks Lakehouse, slashed ad signal ingestion latency from 8 hours to <15 mins, migrated workloads to Photon clusters (cut DBU by 30%), implemented Unity Catalog governance (reduced discrepancies by 65%).
  - Netflix: Senior Data Engineer (Contract). Real-time telemetry for 'Squid Game: Unleashed' and mobile titles. Modernized AWS Lakehouse infrastructure handling 10B+ daily events. Built LLM-driven query assistants translating natural language to SQL/telemetry queries.
  - Microsoft (Activision / Xbox Division): Player telemetry pipelines for 'Call of Duty', orchestrating BigQuery and Databricks workflows via automated Airflow DAGs.
  - Google (Virtusa/Iconma): Multi-tenant ETL using Apache Beam, Cloud Dataflow, Pub/Sub, and BigQuery for tier-1 Telco Cloud customers. Automated Dialogflow chatbot analytics and deployed Slowly Changing Dimensions (SCD Type 4).
  - State Auto Insurance: Data Analyst (Columbus, OH). Agent network data mining, policy sales actuarial modeling, SQL Server, Python, Tableau, SAS.
  - HCL Technologies: Business Analyst (Bangalore, India). Data cleaning, enterprise client initiatives, Tableau, SAS, SQL.

• Verified Certifications:
  - Google Cloud Certified: Professional Cloud Architect
  - Google Cloud Certified: Professional Data Engineer
  - Google Cloud Certified: Associate Cloud Engineer
  - Tableau Desktop Specialist

• Academic Education:
  - MS in Information Systems & Technology — Claremont Graduate University (California)
  - Master of Business Administration (MBA) — Alliance University
  - B.E. in Mechanical Engineering — BMS College of Engineering

• Technical Competencies:
  - Data & Streaming: Spark Structured Streaming, Databricks Delta Lake, Apache Beam, Cloud Dataflow, Kafka, dbt, Airflow.
  - Cloud & DW: Google Cloud Platform (GCP), AWS, BigQuery, Snowflake, Delta Lake, Unity Catalog.
  - Languages & Frameworks: Python, SQL, Next.js / React, Plotly Dash, TypeScript, FastAPI, WebSockets.
  - AI & ML: Google Gemini AI, Ollama Local LLMs, Vector Embeddings, Prompt Engineering.

• Contact & Availability:
  - Open to full-time Senior Data & AI Systems Engineer roles and technical advisory engagements (Dallas, TX / Hybrid / Remote).
  - Email: chellamhemanth@gmail.com
  - Phone: (408) 896-8641
  - LinkedIn: linkedin.com/in/hemanth-chellam-b9285a8a/
  - GitHub: github.com/HEMANTH5439"""



def save_telemetry_event(event_data):
    """
    Persists telemetry event to local JSON vault, and syncs to Supabase if configured.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    if "created_at" not in event_data:
        event_data["created_at"] = datetime.now(timezone.utc).isoformat()

    # 1. Local JSON Vault Persistence
    events = []
    if os.path.exists(TELEMETRY_FILE):
        try:
            with open(TELEMETRY_FILE, "r", encoding="utf-8") as f:
                events = json.load(f)
                if not isinstance(events, list):
                    events = []
        except Exception as e:
            print(f"[Telemetry Vault Warning] Failed to read existing telemetry: {e}")
            events = []

    event_data["id"] = len(events) + 1
    events.append(event_data)

    try:
        with open(TELEMETRY_FILE, "w", encoding="utf-8") as f:
            json.dump(events, f, indent=2)
    except Exception as e:
        print(f"[Telemetry Vault Error] Failed to write event to file: {e}")

    # 2. Supabase Cloud Persistence (if credentials present)
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        try:
            supabase_endpoint = f"{SUPABASE_URL}/rest/v1/visitor_telemetry"
            payload = {
                "event_type": str(event_data.get("event_type", "unknown"))[:50],
                "session_id": str(event_data.get("session_id", "anon"))[:64],
                "path": str(event_data.get("path", "/"))[:255],
                "referrer": str(event_data.get("referrer", ""))[:500],
                "device_type": str(event_data.get("device_type", "desktop"))[:50],
                "browser": str(event_data.get("browser", "unknown"))[:100],
                "meta": event_data.get("meta", {}),
                "created_at": event_data.get("created_at")
            }
            req = urllib.request.Request(
                supabase_endpoint,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                }
            )
            urllib.request.urlopen(req, timeout=3)
        except Exception as e:
            print(f"[Supabase Sync Note] Live Supabase write deferred or failed: {e}")

    return True


def get_aggregated_telemetry():
    """
    Computes executive metrics from the telemetry storage.
    """
    events = []
    if os.path.exists(TELEMETRY_FILE):
        try:
            with open(TELEMETRY_FILE, "r", encoding="utf-8") as f:
                events = json.load(f)
                if not isinstance(events, list):
                    events = []
        except Exception:
            events = []

    total_events = len(events)
    page_views = sum(1 for e in events if e.get("event_type") == "page_view")
    sessions = set(e.get("session_id") for e in events if e.get("session_id"))
    unique_sessions = len(sessions)
    ai_queries = sum(1 for e in events if e.get("event_type") == "ai_query")
    resume_views = sum(1 for e in events if e.get("event_type") == "resume_view")
    share_clicks = sum(1 for e in events if e.get("event_type") == "share_click")
    project_clicks = sum(1 for e in events if e.get("event_type") == "project_click")
    terminal_cmds = sum(1 for e in events if e.get("event_type") == "terminal_cmd")

    # Devices
    device_counts = {"desktop": 0, "mobile": 0, "tablet": 0}
    for e in events:
        dev = str(e.get("device_type", "desktop")).lower()
        if "mobile" in dev or "phone" in dev:
            device_counts["mobile"] += 1
        elif "tablet" in dev or "ipad" in dev:
            device_counts["tablet"] += 1
        else:
            device_counts["desktop"] += 1

    total_dev = sum(device_counts.values()) or 1
    device_breakdown = {
        k: {
            "count": v,
            "pct": round((v / total_dev) * 100, 1)
        } for k, v in device_counts.items()
    }

    # Referrers
    referrer_counts = {"LinkedIn": 0, "GitHub": 0, "Direct / Resume": 0, "Search Engines": 0, "Other": 0}
    for e in events:
        ref = str(e.get("referrer", "")).lower()
        if "linkedin" in ref:
            referrer_counts["LinkedIn"] += 1
        elif "github" in ref:
            referrer_counts["GitHub"] += 1
        elif not ref or "direct" in ref or "localhost" in ref:
            referrer_counts["Direct / Resume"] += 1
        elif "google" in ref or "bing" in ref or "duckduckgo" in ref:
            referrer_counts["Search Engines"] += 1
        else:
            referrer_counts["Other"] += 1

    total_ref = sum(referrer_counts.values()) or 1
    referrers_summary = [
        {"source": k, "count": v, "pct": round((v / total_ref) * 100, 1)}
        for k, v in sorted(referrer_counts.items(), key=lambda item: item[1], reverse=True)
        if v > 0
    ]

    # Project click breakdown
    project_counts = {}
    for e in events:
        if e.get("event_type") == "project_click":
            pname = e.get("meta", {}).get("project", "General Project")
            project_counts[pname] = project_counts.get(pname, 0) + 1

    projects_summary = [
        {"project": k, "clicks": v}
        for k, v in sorted(project_counts.items(), key=lambda item: item[1], reverse=True)
    ]

    # Recent 10 events
    recent = []
    for e in reversed(events[-10:]):
        recent.append({
            "created_at": e.get("created_at", ""),
            "event_type": e.get("event_type", ""),
            "device": e.get("device_type", "desktop"),
            "path": e.get("path", "/"),
            "meta": e.get("meta", {})
        })

    storage_engine = "Supabase PostgreSQL (Cloud Active)" if (SUPABASE_URL and SUPABASE_ANON_KEY) else "Local JSON Vault (data/visitor_telemetry.json)"

    return {
        "status": "authorized",
        "storage_engine": storage_engine,
        "metrics": {
            "total_events": total_events,
            "page_views": page_views,
            "unique_sessions": unique_sessions,
            "ai_queries": ai_queries,
            "resume_views": resume_views,
            "share_clicks": share_clicks,
            "project_clicks": project_clicks,
            "terminal_cmds": terminal_cmds
        },
        "devices": device_breakdown,
        "referrers": referrers_summary,
        "top_projects": projects_summary,
        "recent_events": recent
    }


class PortfolioHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/telemetry":
            query_params = urllib.parse.parse_qs(parsed.query)
            pin = query_params.get("pin", [""])[0].strip()

            if not pin or pin != ADMIN_SECRET_PIN:
                self.send_response(401)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Access Denied: Invalid or missing administrator PIN.",
                    "hint": "Usage in CLI: admin <pin>"
                }).encode("utf-8"))
                return

            telemetry_data = get_aggregated_telemetry()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(telemetry_data).encode("utf-8"))
            return

        super().do_GET()

    def do_POST(self):
        if self.path == "/api/telemetry":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)
            try:
                event_data = json.loads(post_body.decode("utf-8"))
            except Exception:
                event_data = {}

            if not event_data or not isinstance(event_data, dict):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Valid JSON telemetry payload required"}).encode("utf-8"))
                return

            save_telemetry_event(event_data)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "recorded", "ok": True}).encode("utf-8"))
            return

        elif self.path == "/api/chat":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)

            try:
                data = json.loads(post_body.decode("utf-8"))
            except Exception:
                data = {}

            message = data.get("message", "").strip()
            if not message:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Message is required"}).encode("utf-8"))
                return

            if not GEMINI_API_KEY:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "GEMINI_API_KEY not configured"}).encode("utf-8"))
                return

            # Discover active models dynamically (The Way Back self-healing pattern)
            candidate_models = get_active_gemini_models(GEMINI_API_KEY)

            gemini_payload = {
                "system_instruction": {
                    "parts": [{"text": SYSTEM_INSTRUCTION}]
                },
                "contents": [
                    {"parts": [{"text": message}]}
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 350
                }
            }

            reply_text = None
            chosen_model = None
            last_err_msg = ""

            # Model-hopping loop: try models in order of priority (lite -> flash)
            for model_name in candidate_models[:6]:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
                req = urllib.request.Request(
                    url,
                    data=json.dumps(gemini_payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                try:
                    with urllib.request.urlopen(req, timeout=10) as response:
                        res_body = response.read().decode("utf-8")
                        gemini_res = json.loads(res_body)
                        candidate = gemini_res.get("candidates", [{}])[0]
                        candidate_parts = candidate.get("content", {}).get("parts", [{}])
                        text_val = candidate_parts[0].get("text", "")
                        if text_val:
                            reply_text = text_val.strip()
                            chosen_model = model_name
                            break
                except urllib.error.HTTPError as e:
                    err_details = e.read().decode("utf-8", errors="ignore")
                    print(f"[Model-Hopping] Model {model_name} failed with HTTP {e.code}. Hopping to next active model...")
                    last_err_msg = f"HTTP {e.code}: {err_details[:100]}"
                    continue
                except Exception as e:
                    print(f"[Model-Hopping] Model {model_name} request failed: {e}. Hopping to next active model...")
                    last_err_msg = str(e)
                    continue

            if reply_text and chosen_model:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "reply": reply_text,
                    "model": chosen_model,
                    "source": "gemini"
                }).encode("utf-8"))
            else:
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "All discovered Gemini models failed or timed out",
                    "details": last_err_msg
                }).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()



def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, PortfolioHandler)
    models = get_active_gemini_models(GEMINI_API_KEY)
    print(f"🚀 Serving Hemanth Portfolio with Dynamic Gemini Model Discovery on http://localhost:{PORT}")
    print(f"   Active Models Discovered: {models[:4]} (Total: {len(models)})")
    print(f"   API Key configured: {'YES' if GEMINI_API_KEY else 'NO'}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
