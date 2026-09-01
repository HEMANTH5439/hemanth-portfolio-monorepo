import os
import json
import random
from datetime import datetime, timedelta

def generate_multi_day_history():
    """Generate 7 days of daily historical telemetry logs for Tableau-style Date Range Slider filtering."""
    if os.path.exists("data/latest_snapshot.json"):
        with open("data/latest_snapshot.json") as f:
            snapshot = json.load(f)
            models = snapshot.get("models", [])
    else:
        models = [
            {"id": "meta-llama/llama-3-70b-instruct", "name": "Llama 3 70B", "parameter_size": "70B", "prompt_price_per_1m": 0.59, "completion_price_per_1m": 0.79},
            {"id": "meta-llama/llama-3-8b-instruct", "name": "Llama 3 8B", "parameter_size": "1B-8B", "prompt_price_per_1m": 0.05, "completion_price_per_1m": 0.08},
            {"id": "qwen/qwen-2.5-72b-instruct", "name": "Qwen 2.5 72B", "parameter_size": "70B", "prompt_price_per_1m": 0.40, "completion_price_per_1m": 0.40},
            {"id": "deepseek/deepseek-chat", "name": "DeepSeek V3", "parameter_size": "70B", "prompt_price_per_1m": 0.14, "completion_price_per_1m": 0.28},
            {"id": "anthropic/claude-opus-5", "name": "Claude Opus 5", "parameter_size": "Other", "prompt_price_per_1m": 5.0, "completion_price_per_1m": 25.0},
            {"id": "google/gemini-3.7-flash", "name": "Google: Gemini 3.7 Flash", "parameter_size": "Other", "prompt_price_per_1m": 0.15, "completion_price_per_1m": 0.60}
        ]

    providers = ["Groq", "Together", "DeepInfra", "Fireworks", "Lepton", "Anyscale"]
    today = datetime.utcnow().date()
    
    logs = []
    # Generate 7 days of daily telemetry data (Last 7 Days)
    for day_offset in range(6, -1, -1):
        log_date = today - timedelta(days=day_offset)
        date_str = log_date.strftime("%Y-%m-%d")
        
        # Generate 4 daily checkpoints per day (00:00, 06:00, 12:00, 18:00)
        for hour in [0, 6, 12, 18]:
            timestamp_str = f"{date_str} {hour:02d}:00"
            hour_str = f"{hour:02d}:00"
            
            for m in models:
                base_ttft = random.uniform(110, 450)
                base_tps = random.uniform(40, 160)
                
                for p in random.sample(providers, k=random.randint(3, 5)):
                    noise = random.uniform(0.85, 1.25)
                    # Introduce peak-hour congestion multiplier
                    if hour == 18:
                        noise *= random.uniform(1.2, 1.7)
                    
                    logs.append({
                        "date": date_str,
                        "timestamp": timestamp_str,
                        "hour": hour_str,
                        "model_id": m.get("id"),
                        "name": m.get("name", m.get("id")),
                        "parameter_size": m.get("parameter_size", "Other"),
                        "provider": p,
                        "ttft_ms": round(base_ttft * noise, 2),
                        "tps": round(base_tps / noise, 2),
                        "prompt_price_per_1m": m.get("prompt_price_per_1m", 0.1),
                        "completion_price_per_1m": m.get("completion_price_per_1m", 0.2),
                        "status_code": 200 if random.random() > 0.03 else random.choice([500, 503, 429])
                    })

    os.makedirs("data", exist_ok=True)
    with open("data/latest_snapshot.json", "w") as f:
        json.dump({"models": models, "logs": logs, "updated_at": datetime.utcnow().isoformat()}, f, indent=2)
    print(f"Updated snapshot with 7 days of daily historical telemetry ({logs[0]['date']} to {logs[-1]['date']}).")

if __name__ == "__main__":
    generate_multi_day_history()
