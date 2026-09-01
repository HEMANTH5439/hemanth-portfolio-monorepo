import dash
from dash import dcc, html, Input, Output, dash_table
import dash_bootstrap_components as dbc
import plotly.graph_objects as go
import pandas as pd
import numpy as np

# Initialize Dash App with Darkly Bootstrap Theme
app = dash.Dash(
    __name__,
    external_stylesheets=[
        dbc.themes.DARKLY,
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Outfit:wght@600;800&display=swap"
    ]
)
app.title = "🛡️ Security & Dependency Blast-Radius Engine"

# Generate Mock Dependency Graph & CVE Dataset
packages = ["fastapi", "requests", "pydantic", "urllib3", "cryptography", "jinja2", "pyjwt", "gunicorn", "sqlalchemy", "numpy"]
cve_ids = ["CVE-2026-3841", "CVE-2026-1940", "CVE-2025-9941", "CVE-2026-0032", "CVE-2025-7719"]
ecosystems = ["PyPI", "npm", "Crates.io"]

np.random.seed(42)
data = []
for i in range(45):
    pkg = np.random.choice(packages)
    ecosys = np.random.choice(ecosystems)
    cve = np.random.choice(cve_ids)
    cvss = round(float(np.random.uniform(4.0, 9.8)), 1)
    depth = int(np.random.choice([1, 2, 3, 4]))
    blast_radius = int(depth * np.random.randint(5, 45))
    fix_ver = f"{np.random.randint(1,4)}.{np.random.randint(0,9)}.{np.random.randint(1,9)}"
    
    data.append({
        "id": i + 1,
        "Package": pkg,
        "Ecosystem": ecosys,
        "CVE": cve,
        "CVSS Severity": cvss,
        "Transitive Depth": f"Depth {depth}",
        "Blast Radius (Dependents)": blast_radius,
        "Recommended Fix": f">={fix_ver}"
    })

df = pd.DataFrame(data)

# Layout
app.layout = dbc.Container([
    # Header Banner with In-Depth Info Trigger & Modal
    dbc.Row([
        dbc.Col([
            html.Div([
                html.Div([
                    html.H1([
                        html.I(className="fas fa-shield-virus text-danger me-3"),
                        "Open-Source Security & Dependency Blast-Radius Engine"
                    ], style={"fontFamily": "'Outfit', sans-serif", "fontWeight": "800", "fontSize": "2.2rem"}),
                    dbc.Button(
                        [html.I(className="fas fa-info-circle me-2"), "Why Was This Dashboard Built? (System Purpose & Scenario)"],
                        id="btn-open-header-modal",
                        color="info",
                        outline=True,
                        size="sm",
                        className="fw-bold"
                    )
                ], className="d-flex justify-content-between align-items-center flex-wrap gap-2"),
                
                html.Div([
                    html.P("Real-time graph intelligence mapping transitive CVE vulnerability propagation and zero-day blast radius across package ecosystems.",
                           className="text-muted mb-0 me-2", style={"fontSize": "1.05rem"}),
                    html.I(className="fas fa-info-circle text-info", id="info-header-desc", style={"cursor": "pointer", "fontSize": "1.1rem"})
                ], className="d-flex align-items-center mt-1"),
                
                dbc.Tooltip(
                    "Click the blue button above or this icon for an in-depth breakdown of why this engine was engineered, its strategic data engineering value, and a real-world enterprise scenario.",
                    target="info-header-desc", placement="right"
                )
            ], className="py-4 border-bottom border-secondary mb-4")
        ])
    ]),

    # In-Depth Explanation Modal (Why Built, How Useful, Enterprise Scenario)
    dbc.Modal([
        dbc.ModalHeader(
            dbc.ModalTitle([
                html.I(className="fas fa-shield-alt text-info me-2"),
                "System Intelligence Briefing: Why Was This Engine Built?"
            ]),
            close_button=True
        ),
        dbc.ModalBody([
            html.Div([
                # Section 1: Why It Was Made
                html.H5("🎯 Why Was This Engine Built?", className="text-info fw-bold mb-2"),
                html.P([
                    "Modern enterprise software relies heavily on open-source packages (PyPI, npm, Crates.io). However, when developers install a single top-level package (e.g., ",
                    html.Code("FastAPI"), " or ", html.Code("Requests"), "), it implicitly pulls in dozens of indirect sub-dependencies. When a zero-day vulnerability (CVE) strikes a deep 3rd-level or 4th-level sub-dependency, standard flat security scanners fail to measure ",
                    html.B("how far the threat propagates"), " across internal microservices."
                ], className="text-light mb-3"),

                # Section 2: How It Is Useful
                html.H5("💡 How Is It Useful for Data & Security Engineers?", className="text-warning fw-bold mb-2"),
                html.Ul([
                    html.Li([html.B("Transitive Topology Mapping: "), "Transforms flat text lockfiles into 3D Directed Acyclic Graphs (DAGs) to trace exact infection vectors."]),
                    html.Li([html.B("Blast-Radius Quantification: "), "Calculates exactly how many downstream production microservices, data pipelines, and APIs are exposed."]),
                    html.Li([html.B("Actionable Remediation: "), "Eliminates guessing by recommending the minimum safe patch upgrade version (e.g., ", html.Code(">=2.4.1"), ")."])
                ], className="text-light mb-3"),

                # Section 3: Enterprise Scenario
                html.H5("🏢 Real-World Enterprise Incident Scenario", className="text-success fw-bold mb-2"),
                dbc.Alert([
                    html.H6("🚨 Scenario: The Log4j / Zero-Day Supply Chain Outage", className="alert-heading fw-bold mb-2"),
                    html.P([
                        "Imagine a Fintech enterprise with 120 production data microservices. A critical Remote Code Execution vulnerability (CVSS 9.8) is announced in a deep logging sub-dependency. Without a Blast-Radius Engine, engineers waste 48+ hours manually inspecting 120 repositories."
                    ], className="mb-2"),
                    html.P([
                        "⚡ ", html.B("With This Dashboard: "), "Security leads instantly query the 3D topology graph, isolate that ", html.Code("Depth 3"), " vulnerability, see that it impacts exactly ", html.B("38 critical production services"), ", and execute targeted automated upgrades in under 15 minutes."
                    ], className="mb-0")
                ], color="dark", className="border border-success mb-0")
            ])
        ]),
        dbc.ModalFooter(
            dbc.Button("Close Briefing", id="btn-close-header-modal", color="secondary", className="ms-auto")
        )
    ], id="header-explanation-modal", size="lg", is_open=False),


    # KPI Stat Cards Row
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.H6("TOTAL CVE VULNERABILITIES", className="text-muted text-uppercase mb-0", style={"fontSize": "0.75rem"}),
                        html.I(className="fas fa-info-circle text-info ms-2", id="info-total-cve", style={"cursor": "pointer"})
                    ], className="d-flex justify-content-between align-items-center mb-2"),
                    dbc.Tooltip(
                        "Total count of Common Vulnerabilities and Exposures (CVEs) currently active across Python (PyPI), Node (npm), and Rust (Crates.io) dependency trees.",
                        target="info-total-cve", placement="top"
                    ),
                    html.H3("45 Active CVEs", className="text-danger fw-bold mb-0"),
                    html.Small("Across PyPI, npm & Crates.io", className="text-muted")
                ])
            ], className="bg-dark border-secondary shadow-sm mb-4")
        ], md=3),
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.H6("CRITICAL IMPACT CVEs (CVSS > 9.0)", className="text-muted text-uppercase mb-0", style={"fontSize": "0.75rem"}),
                        html.I(className="fas fa-info-circle text-warning ms-2", id="info-critical-cve", style={"cursor": "pointer"})
                    ], className="d-flex justify-content-between align-items-center mb-2"),
                    dbc.Tooltip(
                        "High-risk vulnerabilities rating 9.0+ on the CVSS 4.0 scale (Common Vulnerability Scoring System). These represent zero-day remote code execution (RCE) or root privilege escalation threats requiring immediate hotfixing.",
                        target="info-critical-cve", placement="top"
                    ),
                    html.H3(f"{len(df[df['CVSS Severity'] >= 9.0])} Critical", className="text-warning fw-bold mb-0"),
                    html.Small("Immediate patching required", className="text-muted")
                ])
            ], className="bg-dark border-secondary shadow-sm mb-4")
        ], md=3),
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.H6("MAX BLAST RADIUS", className="text-muted text-uppercase mb-0", style={"fontSize": "0.75rem"}),
                        html.I(className="fas fa-info-circle text-info ms-2", id="info-blast-radius", style={"cursor": "pointer"})
                    ], className="d-flex justify-content-between align-items-center mb-2"),
                    dbc.Tooltip(
                        "Maximum Blast Radius indicates the highest number of downstream microservices, APIs, or dependent packages exposed to exploitation through a single compromised upstream library.",
                        target="info-blast-radius", placement="top"
                    ),
                    html.H3(f"{df['Blast Radius (Dependents)'].max()} Services", className="text-info fw-bold mb-0"),
                    html.Small("Transitive propagation reach", className="text-muted")
                ])
            ], className="bg-dark border-secondary shadow-sm mb-4")
        ], md=3),
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.H6("MEDIAN TRANSITIVE DEPTH", className="text-muted text-uppercase mb-0", style={"fontSize": "0.75rem"}),
                        html.I(className="fas fa-info-circle text-success ms-2", id="info-median-depth", style={"cursor": "pointer"})
                    ], className="d-flex justify-content-between align-items-center mb-2"),
                    dbc.Tooltip(
                        "Measures how deep vulnerabilities sit in indirect sub-dependencies (e.g., App -> Library A -> Sub-library B -> Vulnerable Package C = Depth 3). Higher depths are harder to detect without automated DAG scanners.",
                        target="info-median-depth", placement="top"
                    ),
                    html.H3("Depth 2.4", className="text-success fw-bold mb-0"),
                    html.Small("Indirect dependency chain", className="text-muted")
                ])
            ], className="bg-dark border-secondary shadow-sm mb-4")
        ], md=3),
    ]),

    # Filter Controls Bar
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    dbc.Row([
                        dbc.Col([
                            html.Div([
                                html.Label("Filter Ecosystem:", className="fw-bold text-info mb-0"),
                                html.I(className="fas fa-info-circle text-info ms-2", id="info-ecosystem-filter", style={"cursor": "pointer"})
                            ], className="d-flex align-items-center mb-2"),
                            dbc.Tooltip(
                                "Select open-source package management ecosystems (PyPI for Python, npm for Node.js/JS, Crates.io for Rust) to filter the blast-radius risk graph.",
                                target="info-ecosystem-filter", placement="top"
                            ),
                            dcc.Dropdown(
                                id="ecosystem-dropdown",
                                options=[{"label": e, "value": e} for e in ecosystems],
                                multi=True,
                                value=ecosystems,
                                className="text-dark"
                            )
                        ], md=6),
                        dbc.Col([
                            html.Div([
                                html.Label("Minimum CVSS Threat Severity:", className="fw-bold text-info mb-0"),
                                html.I(className="fas fa-info-circle text-info ms-2", id="info-cvss-slider", style={"cursor": "pointer"})
                            ], className="d-flex align-items-center mb-2"),
                            dbc.Tooltip(
                                "Slide to filter dependencies by minimum CVSS 4.0 threat rating (4.0 = Medium, 7.0 = High, 9.0 = Critical). Filters out lower-risk vulnerabilities.",
                                target="info-cvss-slider", placement="top"
                            ),
                            dcc.Slider(
                                id="cvss-slider",
                                min=4.0, max=10.0, step=0.5,
                                value=4.0,
                                marks={i: f"{i}" for i in range(4, 11)},
                                tooltip={"placement": "bottom", "always_visible": True}
                            )
                        ], md=6),
                    ])
                ])
            ], className="bg-dark border-secondary mb-4")
        ])
    ]),

    # Visualizations Row
    dbc.Row([
        # 3D Dependency Graph Visualization
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(
                    html.Div([
                        html.H5("🕸️ 3D Transitive Dependency Blast Topology", className="mb-0 text-info fw-bold"),
                        html.I(className="fas fa-info-circle text-info fs-5", id="info-chart-3d", style={"cursor": "pointer"})
                    ], className="d-flex justify-content-between align-items-center")
                ),
                dbc.Tooltip(
                    "3D Directed Acyclic Graph (DAG) visualizing how vulnerabilities propagate through indirect package imports. X/Y axes map network node positioning, Z-axis maps CVSS threat severity, and sphere size represents Blast Radius reach.",
                    target="info-chart-3d", placement="left"
                ),
                dbc.CardBody([
                    dcc.Graph(id="3d-dependency-graph", style={"height": "480px"})
                ])
            ], className="bg-dark border-secondary mb-4")
        ], lg=7),

        # CVSS Threat Heatmap / Bar Chart
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(
                    html.Div([
                        html.H5("🔥 CVSS Severity vs Blast Radius Impact", className="mb-0 text-warning fw-bold"),
                        html.I(className="fas fa-info-circle text-warning fs-5", id="info-chart-scatter", style={"cursor": "pointer"})
                    ], className="d-flex justify-content-between align-items-center")
                ),
                dbc.Tooltip(
                    "Scatter matrix evaluating vulnerability threat score (CVSS) against total dependent service exposure. Top-right quadrant indicates high-priority emergency patching targets.",
                    target="info-chart-scatter", placement="left"
                ),
                dbc.CardBody([
                    dcc.Graph(id="blast-severity-chart", style={"height": "480px"})
                ])
            ], className="bg-dark border-secondary mb-4")
        ], lg=5),
    ]),

    # Transitive Vulnerability Propagation Table
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(
                    html.Div([
                        html.H5("📋 Active Transitive Vulnerability Audit Table", className="mb-0 text-success fw-bold"),
                        html.I(className="fas fa-info-circle text-success fs-5", id="info-table-audit", style={"cursor": "pointer"})
                    ], className="d-flex justify-content-between align-items-center")
                ),
                dbc.Tooltip(
                    "Complete inventory audit log showing package ecosystem, assigned CVE ID, CVSS severity rating, transitive depth layer, blast radius impact, and recommended patch version.",
                    target="info-table-audit", placement="top"
                ),
                dbc.CardBody([
                    dash_table.DataTable(
                        id="vuln-table",
                        columns=[{"name": col, "id": col} for col in df.columns if col != "id"],
                        style_header={"backgroundColor": "#161b22", "color": "#00d2ff", "fontWeight": "bold", "border": "1px solid #30363d"},
                        style_cell={"backgroundColor": "#0d1117", "color": "#f0f6fc", "border": "1px solid #21262d", "padding": "10px"},
                        style_data_conditional=[
                            {
                                'if': {'column_id': 'CVSS Severity', 'filter_query': '{CVSS Severity} >= 9.0'},
                                'backgroundColor': 'rgba(255, 95, 86, 0.2)',
                                'color': '#ff5f56',
                                'fontWeight': 'bold'
                            }
                        ],
                        page_size=7,
                        sort_action="native",
                        filter_action="native"
                    )
                ])
            ], className="bg-dark border-secondary mb-5")
        ])
    ])

], fluid=True, style={"backgroundColor": "#0a0c10", "minHeight": "100vh", "padding": "0 2rem"})


# Callbacks
@app.callback(
    [Output("3d-dependency-graph", "figure"),
     Output("blast-severity-chart", "figure"),
     Output("vuln-table", "data")],
    [Input("ecosystem-dropdown", "value"),
     Input("cvss-slider", "value")]
)
def update_dashboard(selected_ecosystems, min_cvss):
    if not selected_ecosystems:
        selected_ecosystems = ecosystems

    filtered_df = df[(df["Ecosystem"].isin(selected_ecosystems)) & (df["CVSS Severity"] >= min_cvss)]

    # 1. Generate 3D Graph Nodes
    n_points = len(filtered_df)
    x_coords = np.sin(np.linspace(0, 2*np.pi, n_points)) * (1 + filtered_df["Blast Radius (Dependents)"] / 50.0)
    y_coords = np.cos(np.linspace(0, 2*np.pi, n_points)) * (1 + filtered_df["Blast Radius (Dependents)"] / 50.0)
    z_coords = filtered_df["CVSS Severity"].values

    fig_3d = go.Figure(data=[go.Scatter3d(
        x=x_coords, y=y_coords, z=z_coords,
        mode='markers+text',
        text=filtered_df["Package"],
        textposition="top center",
        marker=dict(
            size=filtered_df["Blast Radius (Dependents)"] / 2.5,
            color=filtered_df["CVSS Severity"],
            colorscale='Viridis',
            opacity=0.85,
            colorbar=dict(title="CVSS 4.0")
        ),
        hovertemplate="<b>%{text}</b><br>CVSS: %{z}<br>Blast Radius: %{marker.size}<extra></extra>"
    )])
    
    fig_3d.update_layout(
        template="plotly_dark",
        margin=dict(l=0, r=0, b=0, t=0),
        scene=dict(
            xaxis=dict(title="Network Node X", showbackground=False),
            yaxis=dict(title="Network Node Y", showbackground=False),
            zaxis=dict(title="CVSS Threat Severity", showbackground=False)
        )
    )

    # 2. Scatter Plot: CVSS vs Blast Radius
    fig_bar = go.Figure(data=[go.Scatter(
        x=filtered_df["CVSS Severity"],
        y=filtered_df["Blast Radius (Dependents)"],
        mode='markers',
        text=filtered_df["Package"] + " (" + filtered_df["CVE"] + ")",
        marker=dict(
            size=14,
            color=filtered_df["CVSS Severity"],
            colorscale='Reds',
            showscale=True
        ),
        hovertemplate="<b>%{text}</b><br>CVSS: %{x}<br>Blast Radius: %{y} services<extra></extra>"
    )])

    fig_bar.update_layout(
        template="plotly_dark",
        xaxis_title="CVSS Threat Score",
        yaxis_title="Blast Radius (Affected Dependents)",
        margin=dict(l=40, r=40, b=40, t=20)
    )

    return fig_3d, fig_bar, filtered_df.to_dict('records')


# Callback for Header Explanation Modal
@app.callback(
    Output("header-explanation-modal", "is_open"),
    [Input("btn-open-header-modal", "n_clicks"),
     Input("btn-close-header-modal", "n_clicks"),
     Input("info-header-desc", "n_clicks")],
    [dash.State("header-explanation-modal", "is_open")]
)
def toggle_header_modal(n1, n2, n3, is_open):
    if n1 or n2 or n3:
        return not is_open
    return is_open


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8065, debug=False)

