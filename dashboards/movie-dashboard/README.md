# CineMetrics - Top Movies Dashboard

An interactive analytical dashboard built with **Plotly Dash** and styled like an executive financial terminal, focused on curated top movies to watch.

## Features
- **Executive KPI Cards**: Real-time summary cards for Top Rated Film, Box Office Leader, Average ROI Multiple, and Total Gross.
- **Interactive Multi-Filter Sidebar**: Filter by Title/Director search, multi-select Genre, Year range slider, and Minimum IMDb rating.
- **Dynamic Spotlight Card**: Click "View Details" on any poster card to preview high-res thumbnails, synopsis, director, stars, and streaming platforms.
- **Tabs Breakdown**:
  - **Overview & Gallery**: Rating vs. Box Office bubble chart + Poster card gallery.
  - **Financials & ROI**: Budget vs. Gross comparisons, Profitability multiplier ($x$), and sortable financial data table.
  - **Critics vs. Audience**: Metascore vs. IMDb ratings scatter quadrant with Oscar nominations & wins.
  - **Cinema Trends & Genres**: Donut distribution and decade runtime evolution trends.

## Quick Start

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application:
   ```bash
   python3 app.py
   ```

3. Open your browser and navigate to:
   ```text
   http://127.0.0.1:8050/
   ```
