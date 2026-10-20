import dash
from dash import html, dcc, dash_table, Input, Output, State, ALL
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import os

# Load data
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "top_movies.csv")
df = pd.read_csv(DATA_PATH)

# Initialize app
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.DARKLY, dbc.icons.FONT_AWESOME],
    title="CineMetrics - Top Movies Dashboard",
    suppress_callback_exceptions=True
)

# Extract unique genres
all_genres = sorted(list(set([g.strip() for sublist in df["genre"].dropna().apply(lambda x: x.split(",")) for g in sublist])))
years_min = int(df["year"].min())
years_max = int(df["year"].max())

# App Layout
app.layout = html.Div(id="main-theme-container", children=[
    dbc.Container([
        # Store to track currently selected movie index in spotlight carousel
        dcc.Store(id="spotlight-index-store", data=0),

        # Store to track theme (dark vs light)
        dcc.Store(id="theme-store", data="dark"),

        # Timer interval to automatically rotate spotlight carousel every 7 seconds
        dcc.Interval(id="spotlight-interval", interval=7000, n_intervals=0),

        # Top Header
        dbc.Row([
            dbc.Col([
                html.Div([
                    html.Span("Engineered by ", className="text-secondary small text-uppercase"),
                    html.B("Hemanth Chellam", className="text-primary small text-uppercase ms-1")
                ], className="mb-1 d-flex align-items-center tracking-wider", style={"fontSize": "0.76rem"}),
                html.Div([
                    html.Span(html.I(className="fas fa-film text-warning me-2 fs-2")),
                    html.Span("CINEMETRICS", className="fw-bold fs-3 tracking-wide", id="header-brand"),
                    html.Span(" | Top Movies & Box Office Intelligence (1972–2026)", className="text-secondary ms-2 fs-6 d-none d-md-inline")
                ], className="d-flex align-items-center")
            ], width=12, md=7),
            dbc.Col([
                html.Div([
                    # Theme toggle button
                    dbc.Button(
                        [html.I(className="fas fa-sun me-2", id="theme-btn-icon"), html.Span("Light Mode", id="theme-btn-label")],
                        id="theme-toggle-btn",
                        size="sm",
                        color="secondary",
                        outline=True,
                        className="me-2"
                    ),
                    dbc.Badge("Interactive Analytics", color="warning", className="me-2 text-dark p-2"),
                    dbc.Badge("2026 Updated", color="success", className="p-2")
                ], className="d-flex justify-content-md-end align-items-center h-100 mt-2 mt-md-0")
            ], width=12, md=5)
        ], className="py-3 mb-3 border-bottom border-secondary"),

        # Main Grid (Sidebar Filters + Main Analytics Area)
        dbc.Row([
            # Left Sidebar (Filters & Rotating Movie Spotlight Carousel)
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader(html.H6([html.I(className="fas fa-sliders-h me-2 text-warning"), "Filters & Search"], className="m-0")),
                    dbc.CardBody([
                        html.Label("Search Title or Director:", className="small text-muted fw-bold mb-1"),
                        dbc.Input(id="search-input", placeholder="e.g. Nolan, Matrix, Batman...", type="text", size="sm", className="mb-3 border-secondary"),

                        html.Label("Genres:", className="small text-muted fw-bold mb-1"),
                        dcc.Dropdown(
                            id="genre-dropdown",
                            options=[{"label": g, "value": g} for g in all_genres],
                            multi=True,
                            placeholder="All Genres",
                            className="mb-3 text-dark"
                        ),

                        # Release Year Filter with Display
                        html.Div([
                            html.Label("Release Year Range:", className="small text-muted fw-bold mb-1"),
                            html.Span(id="year-range-display", className="badge bg-secondary ms-2")
                        ], className="d-flex justify-content-between align-items-center"),
                        html.Div([
                            dcc.RangeSlider(
                                id="year-slider",
                                min=years_min,
                                max=years_max,
                                step=1,
                                marks={1970: "'70", 1980: "'80", 1990: "'90", 2000: "'00", 2010: "'10", 2020: "'20", 2026: "'26"},
                                value=[years_min, years_max],
                                allow_direct_input=False
                            )
                        ], className="mb-3 px-1"),

                        # Rating Filter with Display
                        html.Div([
                            html.Label("Minimum IMDb Rating:", className="small text-muted fw-bold mb-1"),
                            html.Span(id="rating-display", className="badge bg-warning text-dark ms-2")
                        ], className="d-flex justify-content-between align-items-center"),
                        html.Div([
                            dcc.Slider(
                                id="rating-slider",
                                min=7.0,
                                max=9.5,
                                step=0.1,
                                value=7.5,
                                marks={7.0: "7.0", 7.5: "7.5", 8.0: "8.0", 8.5: "8.5", 9.0: "9.0", 9.5: "9.5"},
                                allow_direct_input=False
                            )
                        ], className="mb-2 px-1")
                    ])
                ], className="dash-card mb-4"),

                # Rotating Movie Spotlight Carousel Card
                html.Div(id="movie-spotlight-container")
            ], width=12, lg=3),

            # Right Main Content (KPIs + Consolidated Tabs)
            dbc.Col([
                # KPI Summary Bar
                dbc.Row(id="kpi-metrics-row", className="g-3 mb-4"),

                # Consolidated 2-Tab Navigation
                dbc.Tabs(id="analytics-tabs", active_tab="tab-market", className="mb-3", children=[
                    dbc.Tab(label="Market Overview & Financial Intelligence", tab_id="tab-market"),
                    dbc.Tab(label="Critical Acclaim & Industry Trends", tab_id="tab-trends")
                ]),

                # Dynamic Tab Content Area
                html.Div(id="tab-content-area")
            ], width=12, lg=9)
        ], className="g-4")
    ], fluid=True, className="px-4 py-3")
])


# Callback to toggle Theme (Dark vs Light)
@app.callback(
    [
        Output("theme-store", "data"),
        Output("theme-btn-icon", "className"),
        Output("theme-btn-label", "children"),
        Output("main-theme-container", "className")
    ],
    [Input("theme-toggle-btn", "n_clicks")],
    [State("theme-store", "data")]
)
def toggle_theme(n_clicks, current_theme):
    if not n_clicks:
        return "dark", "fas fa-sun me-2", "Light Mode", "theme-dark"

    if current_theme == "dark":
        return "light", "fas fa-moon me-2", "Dark Mode", "theme-light"
    else:
        return "dark", "fas fa-sun me-2", "Light Mode", "theme-dark"


# Callback for slider label indicators
@app.callback(
    [Output("year-range-display", "children"), Output("rating-display", "children")],
    [Input("year-slider", "value"), Input("rating-slider", "value")]
)
def update_slider_labels(year_val, rating_val):
    year_str = f"{year_val[0]} – {year_val[1]}" if year_val else ""
    rating_str = f"★ {rating_val:.1f}+" if rating_val else ""
    return year_str, rating_str


# Helper function to filter dataframe
def get_filtered_df(search_query, selected_genres, year_range, min_rating):
    dff = df.copy()
    if search_query:
        query = search_query.strip().lower()
        dff = dff[dff["title"].str.lower().str.contains(query) | dff["director"].str.lower().str.contains(query)]
    if selected_genres:
        pattern = "|".join(selected_genres)
        dff = dff[dff["genre"].str.contains(pattern, case=False, na=False)]
    if year_range:
        dff = dff[(dff["year"] >= year_range[0]) & (dff["year"] <= year_range[1])]
    if min_rating:
        dff = dff[dff["imdb_rating"] >= min_rating]
    return dff


# Core Carousel advancement callback (Uses ONLY permanent layout components)
@app.callback(
    Output("spotlight-index-store", "data"),
    [
        Input("spotlight-interval", "n_intervals"),
        Input("spotlight-prev-btn", "n_clicks"),
        Input("spotlight-next-btn", "n_clicks")
    ],
    [
        State("spotlight-index-store", "data"),
        State("search-input", "value"),
        State("genre-dropdown", "value"),
        State("year-slider", "value"),
        State("rating-slider", "value")
    ],
    prevent_initial_call=True
)
def advance_spotlight_carousel(n_intervals, prev_clicks, next_clicks, current_idx, search_q, genres, yr_range, min_r):
    ctx = dash.callback_context
    if not ctx.triggered:
        return current_idx or 0

    dff = get_filtered_df(search_q, genres, yr_range, min_r)
    n_movies = len(dff)
    if n_movies == 0:
        return 0

    curr = (current_idx or 0) % n_movies
    trigger_id = ctx.triggered[0]["prop_id"].split(".")[0]

    if trigger_id == "spotlight-prev-btn":
        return (curr - 1) % n_movies
    else:
        return (curr + 1) % n_movies


# Dedicated bubble click callback for Tab 1
@app.callback(
    Output("spotlight-index-store", "data", allow_duplicate=True),
    [Input("bubble-scatter-chart", "clickData")],
    [
        State("search-input", "value"),
        State("genre-dropdown", "value"),
        State("year-slider", "value"),
        State("rating-slider", "value")
    ],
    prevent_initial_call=True
)
def select_from_tab1_bubble(click_data, search_q, genres, yr_range, min_r):
    if not click_data or "points" not in click_data or len(click_data["points"]) == 0:
        return dash.no_update
    cdata = click_data["points"][0].get("customdata")
    if not cdata:
        return dash.no_update
    title = cdata[0]
    dff = get_filtered_df(search_q, genres, yr_range, min_r)
    matched = dff.index[dff["title"] == title].tolist()
    if matched:
        return dff.index.get_loc(matched[0])
    return dash.no_update


# Dedicated bubble click callback for Tab 2
@app.callback(
    Output("spotlight-index-store", "data", allow_duplicate=True),
    [Input("critics-scatter-chart", "clickData")],
    [
        State("search-input", "value"),
        State("genre-dropdown", "value"),
        State("year-slider", "value"),
        State("rating-slider", "value")
    ],
    prevent_initial_call=True
)
def select_from_tab2_bubble(click_data, search_q, genres, yr_range, min_r):
    if not click_data or "points" not in click_data or len(click_data["points"]) == 0:
        return dash.no_update
    cdata = click_data["points"][0].get("customdata")
    if not cdata:
        return dash.no_update
    title = cdata[0]
    dff = get_filtered_df(search_q, genres, yr_range, min_r)
    matched = dff.index[dff["title"] == title].tolist()
    if matched:
        return dff.index.get_loc(matched[0])
    return dash.no_update


# Callback: Update Filtered Data, KPIs, Tab Content, and Spotlight Carousel
@app.callback(
    [
        Output("kpi-metrics-row", "children"),
        Output("tab-content-area", "children"),
        Output("movie-spotlight-container", "children")
    ],
    [
        Input("search-input", "value"),
        Input("genre-dropdown", "value"),
        Input("year-slider", "value"),
        Input("rating-slider", "value"),
        Input("analytics-tabs", "active_tab"),
        Input("spotlight-index-store", "data"),
        Input("theme-store", "data")
    ]
)
def update_dashboard(search_query, selected_genres, year_range, min_rating, active_tab, spotlight_idx, current_theme):
    dff = get_filtered_df(search_query, selected_genres, year_range, min_rating)
    is_light = (current_theme == "light")

    if dff.empty:
        empty_kpi = dbc.Col(dbc.Alert("No movies match the current filter criteria.", color="warning"), width=12)
        empty_content = html.Div([
            html.P("Try loosening your search filters in the sidebar.", className="text-secondary text-center py-5")
        ])
        empty_spotlight = dbc.Card(dbc.CardBody("No movies match the active filter."), className="dash-card")
        return [empty_kpi], empty_content, empty_spotlight

    # Calculate KPIs
    top_movie = dff.loc[dff["imdb_rating"].idxmax()]
    box_office_champ = dff.loc[dff["box_office_m"].idxmax()]
    avg_roi = dff["roi_multiplier"].mean()
    total_box_office = dff["box_office_m"].sum()

    kpi_cards = [
        dbc.Col(dbc.Card([
            html.Div("Top Rated Movie", className="kpi-label"),
            html.Div(f"{top_movie['title']}", className="kpi-value fs-5 text-truncate"),
            html.Div(f"⭐ {top_movie['imdb_rating']}/10 ({top_movie['year']})", className="kpi-subtext text-warning")
        ], className="dash-card kpi-card h-100"), width=6, md=3),

        dbc.Col(dbc.Card([
            html.Div("Box Office Leader", className="kpi-label"),
            html.Div(f"{box_office_champ['title']}", className="kpi-value fs-5 text-truncate"),
            html.Div(f"${box_office_champ['box_office_m']:,.1f}M Worldwide", className="kpi-subtext text-info")
        ], className="dash-card kpi-card-cyan h-100"), width=6, md=3),

        dbc.Col(dbc.Card([
            html.Div("Average ROI Multiple", className="kpi-label"),
            html.Div(f"{avg_roi:.1f}x", className="kpi-value"),
            html.Div("Gross-to-Budget Ratio", className="kpi-subtext text-success")
        ], className="dash-card kpi-card-green h-100"), width=6, md=3),

        dbc.Col(dbc.Card([
            html.Div("Total Pool Gross", className="kpi-label"),
            html.Div(f"${total_box_office/1000:.2f}B", className="kpi-value"),
            html.Div(f"{len(dff)} Qualifying Films", className="kpi-subtext text-secondary")
        ], className="dash-card kpi-card-purple h-100"), width=6, md=3),
    ]

    # Carousel Spotlight Selection
    n_qualifying = len(dff)
    valid_idx = (spotlight_idx or 0) % n_qualifying
    spotlight_movie = dff.iloc[valid_idx]

    # Spotlight Carousel Card
    spotlight_component = dbc.Card([
        dbc.CardHeader([
            html.Div([
                html.Span([html.I(className="fas fa-play-circle me-2 text-warning"), "Movie Spotlight"], className="fw-bold"),
                html.Div([
                    dbc.Button(html.I(className="fas fa-chevron-left"), id="spotlight-prev-btn", size="sm", color="dark" if not is_light else "light", className="p-1 px-2 me-1 border-secondary"),
                    html.Span(f"{valid_idx + 1} / {n_qualifying}", className="small text-muted me-1 align-self-center"),
                    dbc.Button(html.I(className="fas fa-chevron-right"), id="spotlight-next-btn", size="sm", color="dark" if not is_light else "light", className="p-1 px-2 border-secondary")
                ], className="d-flex align-items-center")
            ], className="d-flex justify-content-between align-items-center")
        ], className="py-2"),

        html.Div([
            html.Img(src=spotlight_movie["poster_url"], className="w-100", style={"height": "320px", "objectFit": "cover"})
        ], style={"position": "relative", "backgroundColor": "#0f172a" if not is_light else "#e2e8f0"}),

        dbc.CardBody([
            html.H5(spotlight_movie["title"], className="card-title fw-bold mb-1"),
            html.Div([
                dbc.Badge(f"⭐ {spotlight_movie['imdb_rating']}", color="warning", className="text-dark me-2"),
                dbc.Badge(f"Meta: {spotlight_movie['metascore']}%", color="info", className="me-2"),
                dbc.Badge(f"{spotlight_movie['year']}", color="secondary", className="me-2"),
                dbc.Badge(f"{spotlight_movie['runtime_min']}m", color="dark")
            ], className="mb-2"),
            html.P(spotlight_movie["synopsis"], className="card-text small text-muted mb-2"),
            html.Hr(className="border-secondary my-2"),
            html.Div([
                html.Span("Director: ", className="text-muted small fw-bold"),
                html.Span(spotlight_movie["director"], className="small")
            ]),
            html.Div([
                html.Span("Stars: ", className="text-muted small fw-bold"),
                html.Span(spotlight_movie["cast"], className="small")
            ]),
            html.Div([
                html.Span("Watch on: ", className="text-muted small fw-bold"),
                html.Span(spotlight_movie["streaming"], className="text-info small fw-bold")
            ], className="mt-1")
        ])
    ], className="dash-card")

    # Adaptive Plotly Theme (Dark vs Light)
    CHART_HEIGHT = 360
    font_color = "#1e293b" if is_light else "#cbd5e1"
    grid_color = "rgba(0, 0, 0, 0.06)" if is_light else "rgba(255, 255, 255, 0.05)"
    zero_color = "rgba(0, 0, 0, 0.12)" if is_light else "rgba(255, 255, 255, 0.1)"

    plotly_layout_theme = dict(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color=font_color, size=11),
        margin=dict(l=60, r=25, t=50, b=45),
        xaxis=dict(
            gridcolor=grid_color,
            zerolinecolor=zero_color,
            tickfont=dict(color=font_color)
        ),
        yaxis=dict(
            gridcolor=grid_color,
            zerolinecolor=zero_color,
            tickfont=dict(color=font_color)
        ),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            font=dict(size=10, color=font_color)
        )
    )

    if active_tab == "tab-market":
        # 1. Bubble Chart with custom_data and Pin-Point SVG Callout Annotations (Approach A)
        def is_market_milestone(row):
            return (
                row["imdb_rating"] >= 9.0 or
                row["box_office_m"] >= 1800 or
                row["box_office_m"] >= 950 or
                row["roi_multiplier"] >= 40.0
            )

        market_annotations = []
        for _, row in dff.iterrows():
            if is_market_milestone(row):
                ax, ay = 30, -20
                if row["imdb_rating"] >= 9.2: ax, ay = 0, -28
                elif row["box_office_m"] >= 2000: ax, ay = -45, 25
                elif row["box_office_m"] >= 900: ax, ay = -40, -22
                elif row["roi_multiplier"] >= 40.0: ax, ay = 35, 15

                short_t = row["title"] if len(row["title"]) <= 20 else row["title"][:18] + "…"
                market_annotations.append(dict(
                    x=row["box_office_m"],
                    y=row["imdb_rating"],
                    text=short_t,
                    showarrow=True,
                    arrowhead=0,
                    arrowwidth=1,
                    arrowcolor="rgba(71, 85, 105, 0.45)" if is_light else "rgba(255, 255, 255, 0.35)",
                    ax=ax,
                    ay=ay,
                    font=dict(size=9, family="Inter, sans-serif", color="#0f172a" if is_light else "#f8fafc"),
                    bgcolor="rgba(255, 255, 255, 0.88)" if is_light else "rgba(15, 23, 42, 0.8)",
                    bordercolor="rgba(0, 0, 0, 0.12)" if is_light else "rgba(255, 255, 255, 0.15)",
                    borderwidth=1,
                    borderpad=2
                ))

        fig_scatter = px.scatter(
            dff,
            x="box_office_m",
            y="imdb_rating",
            size="budget_m",
            color="imdb_rating",
            color_continuous_scale="Viridis",
            custom_data=["title", "year", "director", "budget_m", "box_office_m", "imdb_rating", "poster_url"],
            labels={"box_office_m": "Worldwide Box Office ($ Millions)", "imdb_rating": "IMDb Rating", "budget_m": "Budget ($M)"},
            title="Rating vs. Box Office (Bubble Size = Budget, Color = Rating)"
        )
        fig_scatter.update_traces(
            mode="markers",
            hoverinfo="none",
            hovertemplate=None
        )
        market_layout = {**plotly_layout_theme, "height": CHART_HEIGHT, "coloraxis_showscale": False, "annotations": market_annotations}
        fig_scatter.update_layout(market_layout)

        # 2. Horizontal Budget vs Gross
        top_by_gross = dff.sort_values(by="box_office_m", ascending=False).head(5)
        fig_compare = go.Figure()
        fig_compare.add_trace(go.Bar(
            name="Budget ($M)",
            y=top_by_gross["title"],
            x=top_by_gross["budget_m"],
            orientation="h",
            marker_color="#d97706" if is_light else "#f59e0b"
        ))
        fig_compare.add_trace(go.Bar(
            name="Gross ($M)",
            y=top_by_gross["title"],
            x=top_by_gross["box_office_m"],
            orientation="h",
            marker_color="#0284c7" if is_light else "#00d2ff"
        ))
        fig_compare.update_layout(
            plotly_layout_theme,
            barmode="group",
            height=CHART_HEIGHT,
            title="Top 5 Grossing: Budget vs. Global Gross",
            yaxis=dict(autorange="reversed")
        )

        # 3. Horizontal ROI Multiplier bar chart
        sorted_roi = dff.sort_values(by="roi_multiplier", ascending=False).head(6)
        fig_roi = px.bar(
            sorted_roi,
            x="roi_multiplier",
            y="title",
            orientation="h",
            color="roi_multiplier",
            color_continuous_scale="Purples",
            labels={"roi_multiplier": "ROI (Gross / Budget Multiple)", "title": ""},
            title="Top Profit Multipliers (ROI Multiple)"
        )
        fig_roi.update_layout(plotly_layout_theme, height=CHART_HEIGHT, yaxis=dict(autorange="reversed"), coloraxis_showscale=False)

        tab_content = html.Div([
            # Top Row: 7/5 Grid with generous whitespace
            dbc.Row([
                dbc.Col(
                    dbc.Card(
                        dbc.CardBody(
                            html.Div([
                                dcc.Graph(
                                    id="bubble-scatter-chart",
                                    figure=fig_scatter,
                                    clear_on_unhover=True,
                                    config={"displayModeBar": False}
                                ),
                                dcc.Tooltip(
                                    id="bubble-poster-tooltip",
                                    zindex=9999
                                )
                            ], style={"position": "relative"})
                        ),
                        className="dash-card h-100"
                    ),
                    width=12, lg=7
                ),
                dbc.Col(
                    dbc.Card(
                        dbc.CardBody(dcc.Graph(figure=fig_compare, config={"displayModeBar": False})),
                        className="dash-card h-100"
                    ),
                    width=12, lg=5
                ),
            ], className="g-4 mb-4"),

            # Bottom Row: 5/7 Grid with aligned table
            dbc.Row([
                dbc.Col(
                    dbc.Card(
                        dbc.CardBody(dcc.Graph(figure=fig_roi, config={"displayModeBar": False})),
                        className="dash-card h-100"
                    ),
                    width=12, lg=5
                ),
                dbc.Col(
                    dbc.Card([
                        dbc.CardHeader(html.H6([html.I(className="fas fa-table me-2 text-info"), "Financial Breakdown Data Table"], className="m-0 small")),
                        dbc.CardBody([
                            dash_table.DataTable(
                                id="financial-datatable",
                                data=dff[["title", "year", "budget_m", "box_office_m", "roi_multiplier", "streaming"]].to_dict("records"),
                                columns=[
                                    {"name": "Movie Title", "id": "title"},
                                    {"name": "Year", "id": "year"},
                                    {"name": "Budget ($M)", "id": "budget_m", "type": "numeric", "format": {"specifier": "$,.1f"}},
                                    {"name": "Gross ($M)", "id": "box_office_m", "type": "numeric", "format": {"specifier": "$,.1f"}},
                                    {"name": "ROI Multiplier", "id": "roi_multiplier", "type": "numeric", "format": {"specifier": ".1f"}},
                                    {"name": "Where to Stream", "id": "streaming"},
                                ],
                                sort_action="native",
                                page_size=7,
                                style_table={"height": "320px", "overflowY": "auto", "overflowX": "auto"},
                            )
                        ], className="d-flex flex-column justify-content-between h-100")
                    ], className="dash-card h-100"),
                    width=12, lg=7
                )
            ], className="g-4")
        ])

    elif active_tab == "tab-trends":
        # 1. Critic vs Audience Scatter with Pin-Point SVG Callout Annotations (Approach A)
        def is_critics_milestone(row):
            return (
                row["metascore"] >= 96 or
                row["oscars_won"] >= 6 or
                row["imdb_rating"] >= 9.2
            )

        critics_annotations = []
        for _, row in dff.iterrows():
            if is_critics_milestone(row):
                ax, ay = 32, -20
                if row["metascore"] >= 96: ax, ay = -40, -18
                elif row["imdb_rating"] >= 9.2: ax, ay = 0, -28
                elif row["oscars_won"] >= 6: ax, ay = 35, 20

                short_t = row["title"] if len(row["title"]) <= 20 else row["title"][:18] + "…"
                critics_annotations.append(dict(
                    x=row["metascore"],
                    y=row["imdb_rating"],
                    text=short_t,
                    showarrow=True,
                    arrowhead=0,
                    arrowwidth=1,
                    arrowcolor="rgba(71, 85, 105, 0.45)" if is_light else "rgba(255, 255, 255, 0.35)",
                    ax=ax,
                    ay=ay,
                    font=dict(size=9, family="Inter, sans-serif", color="#0f172a" if is_light else "#f8fafc"),
                    bgcolor="rgba(255, 255, 255, 0.88)" if is_light else "rgba(15, 23, 42, 0.8)",
                    bordercolor="rgba(0, 0, 0, 0.12)" if is_light else "rgba(255, 255, 255, 0.15)",
                    borderwidth=1,
                    borderpad=2
                ))

        fig_critics = px.scatter(
            dff,
            x="metascore",
            y="imdb_rating",
            size="oscars_won",
            color="oscars_won",
            color_continuous_scale="Plasma",
            custom_data=["title", "year", "director", "budget_m", "box_office_m", "imdb_rating", "poster_url"],
            labels={"metascore": "Critic Metascore (out of 100)", "imdb_rating": "Audience IMDb Rating (out of 10)", "oscars_won": "Oscars Won"},
            title="Critic Metascore vs. Audience IMDb Rating (Hover for poster, click to spotlight)"
        )
        fig_critics.update_traces(
            mode="markers",
            hoverinfo="none",
            hovertemplate=None
        )
        critics_layout = {**plotly_layout_theme, "height": CHART_HEIGHT, "coloraxis_showscale": False, "annotations": critics_annotations}
        fig_critics.update_layout(critics_layout)

        # 2. Academy Awards
        top_oscars = dff.sort_values(by="oscar_noms", ascending=False).head(5)
        fig_oscars = go.Figure()
        fig_oscars.add_trace(go.Bar(
            name="Nominations",
            y=top_oscars["title"],
            x=top_oscars["oscar_noms"],
            orientation="h",
            marker_color="#64748b" if is_light else "#94a3b8"
        ))
        fig_oscars.add_trace(go.Bar(
            name="Wins",
            y=top_oscars["title"],
            x=top_oscars["oscars_won"],
            orientation="h",
            marker_color="#d97706" if is_light else "#f5c518"
        ))
        fig_oscars.update_layout(
            plotly_layout_theme,
            barmode="group",
            height=CHART_HEIGHT,
            title="Academy Awards: Top 5 Nominated & Wins",
            yaxis=dict(autorange="reversed")
        )

        # 3. Genre Donut
        genre_series = dff["genre"].apply(lambda x: [g.strip() for g in x.split(",")]).explode()
        top_genres = genre_series.value_counts()
        if len(top_genres) > 5:
            main_genres = top_genres.head(5)
            other_count = top_genres.iloc[5:].sum()
            genre_df = pd.concat([main_genres, pd.Series({"Other": other_count})]).reset_index()
        else:
            genre_df = top_genres.reset_index()
        genre_df.columns = ["genre", "count"]

        fig_genres = px.pie(
            genre_df,
            values="count",
            names="genre",
            hole=0.55,
            title="Top Genre Distribution",
            color_discrete_sequence=px.colors.sequential.Plasma
        )
        fig_genres.update_traces(textposition="inside", textinfo="percent+label")
        fig_genres.update_layout(
            plotly_layout_theme,
            height=CHART_HEIGHT,
            showlegend=False
        )

        # 4. Average Runtime Line Chart with clean trendline and markers
        dff["decade"] = (dff["year"] // 10) * 10
        decade_summary = dff.groupby("decade").agg({"runtime_min": "mean", "imdb_rating": "mean"}).reset_index()

        fig_runtime = px.line(
            decade_summary,
            x="decade",
            y="runtime_min",
            markers=True,
            title="Average Movie Runtime (Minutes) by Decade",
            labels={"decade": "Release Decade", "runtime_min": "Avg Runtime (min)"}
        )
        fig_runtime.update_traces(
            line=dict(color="#0284c7" if is_light else "#00d2ff", width=3),
            marker=dict(size=8, color="#d97706" if is_light else "#f5c518")
        )
        fig_runtime.update_layout(plotly_layout_theme, height=CHART_HEIGHT)

        tab_content = html.Div([
            # Top Row: 7/5 Grid with matched height & Tooltip wrapper
            dbc.Row([
                dbc.Col(
                    dbc.Card(
                        dbc.CardBody(
                            html.Div([
                                dcc.Graph(
                                    id="critics-scatter-chart",
                                    figure=fig_critics,
                                    clear_on_unhover=True,
                                    config={"displayModeBar": False}
                                ),
                                dcc.Tooltip(
                                    id="critics-poster-tooltip",
                                    zindex=9999
                                )
                            ], style={"position": "relative"})
                        ),
                        className="dash-card h-100"
                    ),
                    width=12, lg=7
                ),
                dbc.Col(
                    dbc.Card(
                        dbc.CardBody(dcc.Graph(figure=fig_oscars, config={"displayModeBar": False})),
                        className="dash-card h-100"
                    ),
                    width=12, lg=5
                ),
            ], className="g-4 mb-4"),

            # Bottom Row: 6/6 Grid with matched height
            dbc.Row([
                dbc.Col(
                    dbc.Card(
                        dbc.CardBody(dcc.Graph(figure=fig_genres, config={"displayModeBar": False})),
                        className="dash-card h-100"
                    ),
                    width=12, lg=6
                ),
                dbc.Col(
                    dbc.Card(
                        dbc.CardBody(dcc.Graph(figure=fig_runtime, config={"displayModeBar": False})),
                        className="dash-card h-100"
                    ),
                    width=12, lg=6
                ),
            ], className="g-4")
        ])

    return kpi_cards, tab_content, spotlight_component


# Helper to build poster tooltip card
def build_tooltip_card(cdata, is_light):
    title = cdata[0]
    year = cdata[1]
    director = cdata[2]
    budget_m = cdata[3]
    box_office_m = cdata[4]
    rating = cdata[5]
    poster_url = cdata[6]

    bg_color = "rgba(255, 255, 255, 0.98)" if is_light else "rgba(15, 23, 42, 0.96)"
    text_title_color = "#0f172a" if is_light else "#f8fafc"
    border_color = "rgba(0, 0, 0, 0.15)" if is_light else "rgba(255, 255, 255, 0.22)"

    return html.Div([
        html.Div([
            html.Img(src=poster_url, style={"width": "115px", "height": "160px", "objectFit": "cover", "borderRadius": "4px", "display": "block", "margin": "0 auto"})
        ], style={"textAlign": "center", "marginBottom": "4px"}),
        html.H6(f"{title} ({year})", style={"fontSize": "0.76rem", "color": text_title_color, "fontWeight": "bold", "textAlign": "center", "marginBottom": "2px", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}),
        html.Div([
            html.Span(f"⭐ {rating}", className="badge bg-warning text-dark me-1", style={"fontSize": "0.68rem"}),
            html.Span(f"${box_office_m:,.0f}M", className="badge bg-info text-dark", style={"fontSize": "0.68rem"})
        ], className="d-flex justify-content-center mb-1"),
        html.Div(f"{director}", className="text-muted text-truncate text-center", style={"fontSize": "0.66rem"})
    ], style={
        "padding": "6px",
        "width": "130px",
        "backgroundColor": bg_color,
        "border": f"1px solid {border_color}",
        "borderRadius": "6px",
        "boxShadow": "0 8px 24px rgba(0,0,0,0.3)" if is_light else "0 8px 24px rgba(0,0,0,0.9)",
        "pointerEvents": "none"
    })


# Callback: Hover over Bubble in Tab 1 (Rating vs Box Office)
@app.callback(
    [
        Output("bubble-poster-tooltip", "show"),
        Output("bubble-poster-tooltip", "bbox"),
        Output("bubble-poster-tooltip", "direction"),
        Output("bubble-poster-tooltip", "children")
    ],
    [Input("bubble-scatter-chart", "hoverData")],
    [State("theme-store", "data")]
)
def display_bubble_hover_tab1(hoverData, theme):
    if hoverData is None:
        return False, None, "top", None
    pt = hoverData["points"][0]
    bbox = pt.get("bbox")
    cdata = pt.get("customdata")
    if not cdata or not bbox:
        return False, None, "top", None

    y0 = bbox.get("y0", 180)
    x0 = bbox.get("x0", 200)
    direction = "top" if y0 > 140 else "right" if x0 < 100 else "left" if x0 > 400 else "bottom"
    return True, bbox, direction, build_tooltip_card(cdata, theme == "light")


# Callback: Hover over Bubble in Tab 2 (Critic Metascore vs Audience IMDb)
@app.callback(
    [
        Output("critics-poster-tooltip", "show"),
        Output("critics-poster-tooltip", "bbox"),
        Output("critics-poster-tooltip", "direction"),
        Output("critics-poster-tooltip", "children")
    ],
    [Input("critics-scatter-chart", "hoverData")],
    [State("theme-store", "data")]
)
def display_bubble_hover_tab2(hoverData, theme):
    if hoverData is None:
        return False, None, "top", None
    pt = hoverData["points"][0]
    bbox = pt.get("bbox")
    cdata = pt.get("customdata")
    if not cdata or not bbox:
        return False, None, "top", None

    y0 = bbox.get("y0", 180)
    x0 = bbox.get("x0", 200)
    direction = "top" if y0 > 140 else "right" if x0 < 100 else "left" if x0 > 400 else "bottom"
    return True, bbox, direction, build_tooltip_card(cdata, theme == "light")


# Clientside callback to sync [data-theme] on <html> and <body>
app.clientside_callback(
    """
    function(theme) {
        if (!theme) return window.dash_clientside.no_update;
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        return window.dash_clientside.no_update;
    }
    """,
    Output("main-theme-container", "id"),
    Input("theme-store", "data")
)


if __name__ == "__main__":
    app.run(debug=True, port=8050)
