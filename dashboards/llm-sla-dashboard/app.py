import os
import json
import random
import datetime
import dash
from dash import dcc, html, Input, Output, State
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from local_llm import get_local_llm_insights

# Initialize Dash App with Darkly Bootstrap Theme and FontAwesome icons
app = dash.Dash(
    __name__,
    title="LLM Telemetry & SLA Intelligence",
    external_stylesheets=[
        dbc.themes.DARKLY,
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    ]
)
server = app.server

# Data Loader
def load_dashboard_data():
    if os.path.exists("data/latest_snapshot.json"):
        with open("data/latest_snapshot.json") as f:
            snapshot = json.load(f)
            df_m = pd.DataFrame(snapshot.get("models", []))
            df_l = pd.DataFrame(snapshot.get("logs", []))
            if not df_m.empty and not df_l.empty:
                merged = pd.merge(df_l, df_m, left_on="model_id", right_on="id", suffixes=('', '_dup'))
                if 'name_dup' in merged.columns:
                    merged.drop(columns=['name_dup'], inplace=True)
                return merged

    # Fallback default dataframe
    models = [
        {"id": "meta-llama/llama-3-70b-instruct", "name": "Llama 3 70B", "parameter_size": "70B", "prompt_price_per_1m": 0.59, "completion_price_per_1m": 0.79},
        {"id": "meta-llama/llama-3-8b-instruct", "name": "Llama 3 8B", "parameter_size": "1B-8B", "prompt_price_per_1m": 0.05, "completion_price_per_1m": 0.08},
        {"id": "qwen/qwen-2.5-72b-instruct", "name": "Qwen 2.5 72B", "parameter_size": "70B", "prompt_price_per_1m": 0.40, "completion_price_per_1m": 0.40},
        {"id": "deepseek/deepseek-chat", "name": "DeepSeek V3", "parameter_size": "70B", "prompt_price_per_1m": 0.14, "completion_price_per_1m": 0.28},
        {"id": "google/gemini-3.7-flash", "name": "Google: Gemini 3.7 Flash", "parameter_size": "Other", "prompt_price_per_1m": 0.15, "completion_price_per_1m": 0.60},
        {"id": "anthropic/claude-opus-5", "name": "Claude Opus 5", "parameter_size": "Other", "prompt_price_per_1m": 5.0, "completion_price_per_1m": 25.0}
    ]
    providers = ["Groq", "Together", "DeepInfra", "Fireworks", "Lepton", "Anyscale"]
    
    rows = []
    for m in models:
        for p in providers:
            base_ttft = random.uniform(90, 500) if p in ["Groq", "Lepton"] else random.uniform(250, 800)
            tps = random.uniform(80, 220) if p in ["Groq"] else random.uniform(35, 110)
            rows.append({
                "date": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
                "timestamp": "2026-08-27 12:00",
                "hour": "12:00",
                "model_id": m["id"],
                "name": m["name"],
                "parameter_size": m["parameter_size"],
                "provider": p,
                "ttft_ms": round(base_ttft, 2),
                "tps": round(tps, 2),
                "prompt_price_per_1m": m["prompt_price_per_1m"],
                "completion_price_per_1m": m["completion_price_per_1m"],
                "status_code": 200 if random.random() > 0.04 else 503
            })
    return pd.DataFrame(rows)

df = load_dashboard_data()

# Unique Date Options (Sorted Days)
all_dates = sorted(list(df['date'].unique())) if 'date' in df.columns else [datetime.datetime.utcnow().strftime("%Y-%m-%d")]
num_days = len(all_dates)

# Model and Provider Options
all_model_names = sorted(list(df['name'].unique()))
all_providers = sorted(list(df['provider'].unique()))

# Select Top 5 flagship models in the market as default
flagship_top_5 = [
    "Claude Opus 5",
    "Google: Gemini 3.7 Flash",
    "DeepSeek V4 Flash Latest",
    "OpenAI: GPT-5.6 Luna Pro",
    "SpaceXAI: Grok 4.6"
]
popular_defaults = [m for m in flagship_top_5 if m in all_model_names]
if not popular_defaults:
    popular_defaults = all_model_names[:5]

# Helper function to create cards with info popovers for beginner storytelling
def create_metric_card(card_id, title, value, subtitle, info_text, color_class="text-info"):
    popover_id = f"popover-{card_id}"
    target_id = f"info-target-{card_id}"
    return dbc.Card([
        dbc.CardBody([
            html.Div([
                html.Span(title, className="card-subtitle text-muted me-2 fw-semibold"),
                html.I(className="fas fa-info-circle text-muted style-pointer", id=target_id, style={"cursor": "pointer"}),
                dbc.Popover([
                    dbc.PopoverHeader("💡 What does this metric mean?"),
                    dbc.PopoverBody(info_text)
                ], target=target_id, trigger="legacy", placement="top", id=popover_id)
            ], className="d-flex align-items-center mb-1"),
            html.H3(value, className=f"card-title {color_class} fw-bold mb-0"),
            html.Small(subtitle, className="text-muted")
        ])
    ], color="dark", inverse=True, className="border-secondary mb-4 shadow-sm")

# App Layout
app.layout = dbc.Container([
    # Header Banner & Storytelling Guide
    dbc.Row([
        dbc.Col([
            html.Div([
                html.H2("⚡ Live AI Performance & Cost Telemetry", className="text-light mt-3 mb-1 fw-bold me-3"),
                dbc.Button([
                    html.I(className="fas fa-question-circle me-1"),
                    "How AI Hosting Works?"
                ], id="btn-explain-hosting", color="outline-info", size="sm", className="mt-3"),
                dbc.Modal([
                    dbc.ModalHeader(dbc.ModalTitle("🧠 How AI Model Hosting Works (Beginner's Guide)")),
                    dbc.ModalBody([
                        html.H6("1. What is an Inference Provider?", className="text-info fw-bold mb-1"),
                        html.P("AI creators (like Meta for Llama 3, DeepSeek, or Qwen) publish open-source AI models for free. Third-party cloud companies called 'Inference Providers' (like Groq, Together.ai, DeepInfra, Fireworks) buy GPU server hardware, run these models 24/7, and let developers connect via API."),
                        html.Hr(className="border-secondary"),
                        html.H6("2. What about Google, Claude (Anthropic), & OpenAI?", className="text-warning fw-bold mb-1"),
                        html.P("Tech giants like Google (Gemini), Anthropic (Claude), and OpenAI (GPT-4) build AND host their own exclusive models on their own cloud infrastructure. They act as proprietary gold-standard benchmarks."),
                        html.Hr(className="border-secondary"),
                        html.H6("3. Why does this dashboard matter?", className="text-success fw-bold mb-1"),
                        html.P("The exact same open model (e.g. Llama 3 70B) runs at vastly different speeds, prices, and reliability depending on which provider hosts it! This dashboard helps developers find the fastest and cheapest host in real-time.")
                    ]),
                    dbc.ModalFooter(
                        dbc.Button("Got it!", id="btn-close-explain-hosting", color="primary", className="ms-auto")
                    )
                ], id="modal-explain-hosting", is_open=False, size="lg")
            ], className="d-flex align-items-center flex-wrap"),
            html.P([
                "A beginner-friendly guide comparing response speed, cost, and reliability of AI models across cloud hosting providers.",
                html.Span(" Click 'How AI Hosting Works?' or any ℹ️ icon to learn more!", className="text-warning ms-2 fw-semibold")
            ], className="text-muted mb-4")
        ])
    ]),

    # 4 KPI Cards with Info Popovers
    dbc.Row([
        dbc.Col(create_metric_card(
            "kpi-1", "1. Response Speed (TTFT)", f"{df['ttft_ms'].mean():.1f} ms", "Time To First Token",
            "TTFT (Time To First Token) measures how long you wait in milliseconds after pressing 'Send' for the AI to start typing its first word. Lower is better!",
            "text-info"
        ), width=3),

        dbc.Col(create_metric_card(
            "kpi-2", "2. Output Speed (TPS)", f"{df['tps'].mean():.1f} tok/s", "Tokens Per Second",
            "TPS (Tokens Per Second) measures how fast the AI types out the rest of the answer once it starts. 1 token ≈ 3/4 of a word. Higher is faster!",
            "text-success"
        ), width=3),

        dbc.Col(create_metric_card(
            "kpi-3", "3. Min Token Price", 
            f"${df[df['prompt_price_per_1m'] >= 0]['prompt_price_per_1m'].min():.2f}", 
            "Per 1M Prompt Tokens",
            "The lowest cost to send 1 Million prompt tokens to an AI model across all available providers.",
            "text-warning"
        ), width=3),

        dbc.Col(create_metric_card(
            "kpi-4", "4. Server Uptime (SLA)", f"{((df['status_code'] == 200).sum() / len(df) * 100):.1f}%", "Healthy Route Status",
            "The percentage of API requests that succeeded cleanly (HTTP 200) without failing or getting server queue errors.",
            "text-primary"
        ), width=3),
    ]),

    # Filter Controls with Select All / Clear All Buttons & Date Range Slider
    dbc.Card([
        dbc.CardHeader([
            html.I(className="fas fa-filter me-2 text-info"),
            html.Span("Interactive Filter Controls", className="fw-bold")
        ]),

        dbc.CardBody([
            dbc.Row([
                # Column 1: Model Selection Box
                dbc.Col([
                    html.Div([
                        html.Label("🤖 Select Models:", className="text-light fw-bold me-auto"),
                        dbc.ButtonGroup([
                            dbc.Button("Select All", id="btn-select-all-models", size="sm", color="outline-info", className="me-1 py-0 px-2"),
                            dbc.Button("Clear All", id="btn-clear-models", size="sm", color="outline-secondary", className="py-0 px-2")
                        ])
                    ], className="d-flex align-items-center mb-1"),
                    dcc.Dropdown(
                        id="model-filter",
                        options=[{"label": m, "value": m} for m in all_model_names],
                        value=popular_defaults,
                        multi=True,
                        placeholder="Search and select models...",
                        style={"maxHeight": "180px", "color": "#000"}
                    )
                ], width=5),

                # Column 2: Provider Selection Box
                dbc.Col([
                    html.Div([
                        html.Label("🏭 Select Providers:", className="text-light fw-bold me-auto"),
                        dbc.ButtonGroup([
                            dbc.Button("Select All", id="btn-select-all-providers", size="sm", color="outline-info", className="me-1 py-0 px-2"),
                            dbc.Button("Clear All", id="btn-clear-providers", size="sm", color="outline-secondary", className="py-0 px-2")
                        ])
                    ], className="d-flex align-items-center mb-1"),
                    dcc.Dropdown(
                        id="provider-filter",
                        options=[{"label": p, "value": p} for p in all_providers],
                        value=all_providers,
                        multi=True,
                        placeholder="Select providers...",
                        style={"maxHeight": "180px", "color": "#000"}
                    )
                ], width=3),

                # Column 3: Date Range Filter (Calendar Picker)
                dbc.Col([
                    html.Div([
                        html.Label("📅 Date Range Selector:", className="text-light fw-bold me-1"),
                        html.I(className="fas fa-info-circle text-muted", id="info-date-slider", style={"cursor": "pointer"}),
                        dbc.Popover([
                            dbc.PopoverHeader("💡 Date Range Selector"),
                            dbc.PopoverBody("Select start and end calendar dates to filter telemetry logs.")
                        ], target="info-date-slider", trigger="legacy", placement="top")
                    ], className="d-flex align-items-center mb-1"),
                    
                    html.Div([
                        dcc.DatePickerRange(
                            id="date-range-picker",
                            start_date=all_dates[0],
                            end_date=all_dates[-1],
                            min_date_allowed=all_dates[0],
                            max_date_allowed=all_dates[-1],
                            display_format="YYYY-MM-DD",
                            className="bg-dark text-light border-0"
                        )
                    ], className="pt-1")
                ], width=4),

            ])
        ])
    ], color="dark", inverse=True, className="border-secondary mb-4 shadow-sm"),


    # Row 1: Side-by-Side - Grand 360° Polar Radar Chart & Latency Line Chart
    dbc.Row([
        # Grand 360° Polar Radar Chart
        dbc.Col([
            dbc.Card([
                dbc.CardHeader([
                    html.Span("🕸️ 360° Model Health & Capability Radar Scorecard", className="fw-bold text-warning me-2"),
                    html.I(className="fas fa-info-circle text-muted", id="info-grand-radar", style={"cursor": "pointer"}),
                    dbc.Popover([
                        dbc.PopoverHeader("📖 How to read the 360° Radar Chart:"),
                        dbc.PopoverBody("This 360° circular spider web normalizes 5 core metrics on a 0-100 scale: Speed (Low TTFT), Output Speed (TPS), Uptime (SLA %), Cost Value (Lowest $/1M), and Context Window Size. Larger polygon shapes indicate superior overall model performance!")
                    ], target="info-grand-radar", trigger="legacy", placement="top")
                ], className="d-flex align-items-center"),
                dbc.CardBody(dcc.Graph(id="grand-radar-chart"))
            ], color="dark", inverse=True, className="border-warning mb-4 shadow-lg")
        ], width=6),

        # Latency Over Time Line Chart
        dbc.Col([
            dbc.Card([
                dbc.CardHeader([
                    html.Span("⏱️ How Fast Does Each AI Start Responding? (Latency Over Time)", className="fw-bold text-info me-2"),
                    html.I(className="fas fa-info-circle text-muted", id="info-chart-1", style={"cursor": "pointer"}),
                    dbc.Popover([
                        dbc.PopoverHeader("📖 How to read this chart:"),
                        dbc.PopoverBody("This line chart tracks average response delay (TTFT) across hourly checks. Lines that are lower on the chart mean faster response times!")
                    ], target="info-chart-1", trigger="legacy", placement="top")
                ], className="d-flex align-items-center"),
                dbc.CardBody(dcc.Graph(id="time-series-line-chart"))
            ], color="dark", inverse=True, className="border-secondary mb-4 shadow-sm")
        ], width=6),
    ]),

    # Row 2: Throughput Bar Chart & Traffic Congestion Heatmap
    dbc.Row([
        # Throughput Speed Bar Chart
        dbc.Col([
            dbc.Card([
                dbc.CardHeader([
                    html.Span("⚡ Output Typing Speed (Tokens / Sec)", className="fw-bold text-success me-2"),
                    html.I(className="fas fa-info-circle text-muted", id="info-chart-2", style={"cursor": "pointer"}),
                    dbc.Popover([
                        dbc.PopoverHeader("📖 How to read this chart:"),
                        dbc.PopoverBody("Compares how many tokens (words) per second each provider streams out. Taller bars mean faster typing speeds!")
                    ], target="info-chart-2", trigger="legacy", placement="top")
                ], className="d-flex align-items-center"),
                dbc.CardBody(dcc.Graph(id="throughput-bar-chart"))
            ], color="dark", inverse=True, className="border-secondary mb-4 shadow-sm")
        ], width=6),

        # Traffic Congestion & Queue Spikes Heatmap
        dbc.Col([
            dbc.Card([
                dbc.CardHeader([
                    html.Span("🔥 Peak-Hour Server Traffic & Queue Spikes", className="fw-bold text-danger me-2"),
                    html.I(className="fas fa-info-circle text-muted", id="info-chart-3", style={"cursor": "pointer"}),
                    dbc.Popover([
                        dbc.PopoverHeader("📖 How to read this heatmap:"),
                        dbc.PopoverBody("Shows server queue delays by hour of day (UTC). Dark red squares highlight peak-hour traffic jams when servers are overloaded!")
                    ], target="info-chart-3", trigger="legacy", placement="top")
                ], className="d-flex align-items-center"),
                dbc.CardBody(dcc.Graph(id="congestion-heatmap-chart"))
            ], color="dark", inverse=True, className="border-secondary mb-4 shadow-sm")
        ], width=6),
    ]),

    # Row 3: Cost vs Efficiency Pareto Scatter Plot
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader([
                    html.Span("💰 Price vs Speed - Finding the Sweet Spot (Pareto Frontier)", className="fw-bold text-warning me-2"),
                    html.I(className="fas fa-info-circle text-muted", id="info-chart-4", style={"cursor": "pointer"}),
                    dbc.Popover([
                        dbc.PopoverHeader("📖 How to read this scatter plot:"),
                        dbc.PopoverBody("Plots cost against response delay. The best models sit in the bottom-left corner (cheap and fast!). Bubble size shows output typing speed.")
                    ], target="info-chart-4", trigger="legacy", placement="top")
                ], className="d-flex align-items-center"),
                dbc.CardBody(dcc.Graph(id="pareto-scatter-chart"))
            ], color="dark", inverse=True, className="border-secondary mb-4 shadow-sm")
        ], width=12),
    ]),


    # Local AI Insights Section
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader([
                    html.I(className="fas fa-robot me-2 text-success"),
                    html.Span("Local AI Executive Summary (Zero Token Cost)", className="fw-bold text-success")
                ]),
                dbc.CardBody(dcc.Markdown(id="local-ai-insights-box", className="text-light mb-0"))
            ], color="dark", inverse=True, className="border-success mb-4 shadow-sm")
        ])
    ])
], fluid=True)


# Callback 0: Toggle AI Hosting Explanation Modal
@app.callback(
    Output("modal-explain-hosting", "is_open"),
    [Input("btn-explain-hosting", "n_clicks"),
     Input("btn-close-explain-hosting", "n_clicks")],
    [State("modal-explain-hosting", "is_open")]
)
def toggle_modal(n1, n2, is_open):
    if n1 or n2:
        return not is_open
    return is_open


# Callback 1: Tableau-style "Select All" and "Clear All" for Models
@app.callback(
    Output("model-filter", "value"),
    [Input("btn-select-all-models", "n_clicks"),
     Input("btn-clear-models", "n_clicks")],
    prevent_initial_call=True
)
def handle_model_select_all(all_clicks, clear_clicks):
    ctx = dash.callback_context
    if not ctx.triggered:
        return popular_defaults
    button_id = ctx.triggered[0]["prop_id"].split(".")[0]
    if button_id == "btn-select-all-models":
        return all_model_names
    elif button_id == "btn-clear-models":
        return []
    return popular_defaults


# Callback 2: Tableau-style "Select All" and "Clear All" for Providers
@app.callback(
    Output("provider-filter", "value"),
    [Input("btn-select-all-providers", "n_clicks"),
     Input("btn-clear-providers", "n_clicks")],
    prevent_initial_call=True
)
def handle_provider_select_all(all_clicks, clear_clicks):
    ctx = dash.callback_context
    if not ctx.triggered:
        return all_providers
    button_id = ctx.triggered[0]["prop_id"].split(".")[0]
    if button_id == "btn-select-all-providers":
        return all_providers
    elif button_id == "btn-clear-providers":
        return []
    return all_providers


# Callback 3: Update all Visualizations (including Grand Radar Chart) & Insights
@app.callback(
    [Output("grand-radar-chart", "figure"),
     Output("time-series-line-chart", "figure"),
     Output("throughput-bar-chart", "figure"),
     Output("congestion-heatmap-chart", "figure"),
     Output("pareto-scatter-chart", "figure"),
     Output("local-ai-insights-box", "children")],
    [Input("model-filter", "value"),
     Input("provider-filter", "value"),
     Input("date-range-picker", "start_date"),
     Input("date-range-picker", "end_date")]
)
def update_dashboard(selected_models, selected_providers, start_date, end_date):
    if start_date and end_date and 'date' in df.columns:
        date_mask = (df['date'] >= start_date) & (df['date'] <= end_date)
    else:
        date_mask = True

    filtered_df = df[
        (df["name"].isin(selected_models or [])) &
        (df["provider"].isin(selected_providers or [])) &
        date_mask
    ]

    if filtered_df.empty:
        filtered_df = df




    # --- 1. Grand 360° Polar Radar Chart ---
    radar_categories = ["Speed (Low TTFT)", "Output Speed (TPS)", "Server Uptime (%)", "Cost Value ($/1M)", "Context Window"]
    fig_radar = go.Figure()

    model_summary = filtered_df.groupby("name").agg({
        "ttft_ms": "mean",
        "tps": "mean",
        "prompt_price_per_1m": "first",
        "status_code": lambda s: (s == 200).sum() / len(s) * 100,
        "context_length": "first" if "context_length" in filtered_df.columns else lambda s: 128000
    }).reset_index()

    # Max limits for 0-100 normalization
    max_ttft = max(model_summary["ttft_ms"].max(), 600)
    max_tps = max(model_summary["tps"].max(), 200)
    max_context = 1000000

    for _, row in model_summary.iterrows():
        # Score normalization (0 - 100)
        speed_score = max(0, 100 - (row["ttft_ms"] / max_ttft * 100))
        tps_score = min(100, (row["tps"] / max_tps * 100))
        uptime_score = row["status_code"]
        price = max(0, row["prompt_price_per_1m"])
        cost_value_score = max(0, 100 - min(100, (price / 5.0 * 100)))
        ctx_len = row["context_length"] if "context_length" in row and pd.notnull(row["context_length"]) else 128000
        context_score = min(100, (ctx_len / max_context * 100))

        scores = [speed_score, tps_score, uptime_score, cost_value_score, context_score]

        fig_radar.add_trace(go.Scatterpolar(
            r=scores + [scores[0]],
            theta=radar_categories + [radar_categories[0]],
            fill='toself',
            name=row["name"],
            opacity=0.6
        ))

    fig_radar.update_layout(
        polar=dict(
            radialaxis=dict(visible=True, range=[0, 100], showticklabels=False),
            bgcolor="#1e1e1e"
        ),
        template="plotly_dark",
        height=400,
        margin=dict(l=40, r=40, t=30, b=30),
        legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5)
    )

    # --- 2. Latency Over Time (TTFT Line Chart) ---
    ts_agg = filtered_df.groupby(["timestamp", "name"])["ttft_ms"].mean().reset_index()
    fig_ts = px.line(
        ts_agg,
        x="timestamp",
        y="ttft_ms",
        color="name",
        markers=True,
        labels={"timestamp": "Telemetry Timestamp", "ttft_ms": "Response Delay (TTFT in ms)", "name": "Model"},
        template="plotly_dark",
        height=400
    )
    fig_ts.update_layout(hovermode="x unified", margin=dict(l=20, r=20, t=30, b=20))


    # --- 3. Throughput (TPS) Bar Chart by Provider ---
    tps_agg = filtered_df.groupby(["provider", "name"])["tps"].mean().reset_index()
    fig_tps = px.bar(
        tps_agg,
        x="provider",
        y="tps",
        color="name",
        barmode="group",
        labels={"provider": "Inference Host Provider", "tps": "Typing Speed (Tokens / Sec)", "name": "Model"},
        template="plotly_dark",
        height=360
    )
    fig_tps.update_layout(margin=dict(l=20, r=20, t=30, b=20))

    # --- 4. Hourly Traffic Spikes & Congestion Heatmap ---
    heatmap_df = filtered_df.pivot_table(index="provider", columns="hour", values="ttft_ms", aggfunc="mean").fillna(0)
    fig_heat = px.imshow(
        heatmap_df,
        labels=dict(x="Hour of Day (UTC)", y="Provider", color="Queue Delay (ms)"),
        color_continuous_scale="Reds",
        template="plotly_dark",
        height=360
    )
    fig_heat.update_layout(margin=dict(l=20, r=20, t=30, b=20))

    # --- 5. Pareto Frontier Scatter Plot ---
    latest_df = filtered_df[filtered_df["prompt_price_per_1m"] >= 0].groupby(["model_id", "provider"]).first().reset_index()
    fig_pareto = px.scatter(
        latest_df,
        x="ttft_ms",
        y="prompt_price_per_1m",
        size="tps",
        color="provider",
        hover_name="name",
        labels={
            "ttft_ms": "Response Delay (TTFT in ms) - Lower is Faster",
            "prompt_price_per_1m": "Prompt Price ($ / 1M Tokens)",
            "tps": "Tokens/sec"
        },
        template="plotly_dark",
        height=360
    )
    fig_pareto.update_layout(margin=dict(l=20, r=20, t=30, b=20))

    # Local AI Summary Insights
    summary_payload = {
        "avg_ttft": filtered_df["ttft_ms"].mean(),
        "top_provider": filtered_df.groupby("provider")["ttft_ms"].mean().idxmin(),
        "best_val_model": filtered_df.loc[filtered_df[filtered_df["prompt_price_per_1m"] >= 0]["prompt_price_per_1m"].idxmin()]["name"]
    }
    insights = get_local_llm_insights(summary_payload)

    return fig_radar, fig_ts, fig_tps, fig_heat, fig_pareto, insights

if __name__ == "__main__":
    app.run(debug=True, port=8060)
