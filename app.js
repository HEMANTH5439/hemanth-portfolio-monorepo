// 1. Canvas Interactive Network Constellation Background
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null, radius: 120 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
        this.color = '#00d2ff';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Mouse repulsion / connection
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
            let angle = Math.atan2(dy, dx);
            let force = (mouse.radius - dist) / mouse.radius;
            this.x -= Math.cos(angle) * force * 3;
            this.y -= Math.sin(angle) * force * 3;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00d2ff';
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    let count = Math.floor((canvas.width * canvas.height) / 14000);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connect nearby particles with glowing lines
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 210, 255, ${1 - dist / 100})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// 2. Interactive Terminal CLI Functionality
const terminalModal = document.getElementById('terminal-modal');
const btnOpenTerminal = document.getElementById('btn-open-terminal');
const btnCloseTerminal = document.getElementById('btn-close-terminal');
const terminalBody = document.getElementById('terminal-body');
const terminalInput = document.getElementById('terminal-input');

if (btnOpenTerminal) {
    btnOpenTerminal.addEventListener('click', () => {
        terminalModal.classList.add('active');
        terminalInput.focus();
    });
}

if (btnCloseTerminal) {
    btnCloseTerminal.addEventListener('click', () => {
        terminalModal.classList.remove('active');
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        terminalModal.classList.remove('active');
        document.getElementById('embed-modal').classList.remove('active');
    }
});

const commands = {
    help: `Available commands:<br>
  - <b style="color:#00d2ff">about</b>: Display professional bio summary<br>
  - <b style="color:#00d2ff">projects</b>: List active telemetry & dashboard systems<br>
  - <b style="color:#00d2ff">skills</b>: Show tech stack matrix<br>
  - <b style="color:#00d2ff">metrics</b>: Fetch real-time system SLA telemetry<br>
  - <b style="color:#00d2ff">contact</b>: View email and social links<br>
  - <b style="color:#00d2ff">clear</b>: Clear terminal screen`,
    
    about: `<b>Hemanth Chellam - Data & AI Systems Engineer</b><br>
Specializing in high-throughput data telemetry pipelines, interactive Plotly web dashboards, PostgreSQL schemas, and zero-cost local LLM offloading.`,

    projects: `<b>Active Portfolio Systems:</b><br>
1. ⚡ <b style="color:#00e676">LLM Telemetry & SLA Intelligence</b> (Plotly Dash, Supabase, Ollama)<br>
2. ⚡ <b style="color:#ffb703">Renewable Grid Carbon Tracker</b> (Plotly Mapbox, Polars, DuckDB)<br>
3. 🚢 <b style="color:#9d4edd">Maritime Freight Logistics Index</b> (Plotly 3D, FastAPI)`,

    skills: `<b>Technical Competencies:</b><br>
• Languages: Python (Polars/Pandas), SQL, HTML5/CSS3/JS<br>
• Dashboards: Plotly Dash, Streamlit, Tableau<br>
• DB & Infra: PostgreSQL (Supabase), DuckDB, Vercel, GitHub Actions, Ollama AI`,

    metrics: `<b style="color:#00e676">LIVE TELEMETRY STATUS:</b><br>
• Monitored Models: 50+ (Claude, Gemini, Llama 3, DeepSeek)<br>
• Mean Response Delay (TTFT): 248 ms<br>
• Output Stream Speed: 142 Tokens/sec<br>
• Telemetry Status: 99.9% SLA Nominal`,

    contact: `<b>Contact & Connect:</b><br>
• Email: chellamhemanth@gmail.com<br>
• LinkedIn: linkedin.com/in/hemanth-chellam-b9285a8a/`
};

if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.trim().toLowerCase();
            terminalInput.value = '';

            const line = document.createElement('div');
            line.innerHTML = `<span style="color:#00d2ff">hemanth@hub:~$</span> ${cmd}`;
            terminalBody.appendChild(line);

            const response = document.createElement('div');
            response.style.marginBottom = '0.8rem';
            response.style.color = '#c77dff';

            if (cmd === 'clear') {
                terminalBody.innerHTML = '';
                return;
            } else if (commands[cmd]) {
                response.innerHTML = commands[cmd];
            } else if (cmd === '') {
                return;
            } else {
                response.innerHTML = `<span style="color:#ff5f56">Command not found: '${cmd}'. Type '<b style="color:#00d2ff">help</b>' for available commands.</span>`;
            }

            terminalBody.appendChild(response);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    });
}

// 3. Live Embed Modal Functions with Unique URL Hash Router
function openEmbedModal(url, systemId) {
    const modal = document.getElementById('embed-modal');
    const iframe = document.getElementById('embed-iframe');
    iframe.src = url;
    modal.classList.add('active');
    if (systemId) {
        window.location.hash = `preview/${systemId}`;
    }
}

function closeEmbedModal() {
    const modal = document.getElementById('embed-modal');
    const iframe = document.getElementById('embed-iframe');
    iframe.src = '';
    modal.classList.remove('active');
    if (window.location.hash.startsWith('#preview/')) {
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
}


// 4. Live AI Sandbox Simulation Stream Function
function runLiveAISandbox() {
    const textEl = document.getElementById('ai-sandbox-text');
    textEl.innerHTML = '<span style="color:#00d2ff"><i class="fas fa-spinner fa-spin me-1"></i> Connecting to Ollama Local Telemetry Engine...</span>';

    const fullText = `[EXECUTIVE SUMMARY] Analyzed 52 LLM provider endpoints over 7 days.\n` +
                     `• Fastest Overall Response (TTFT): DeepSeek V4 Flash Latest (Avg: 185 ms).\n` +
                     `• Highest Throughput (TPS): Groq Cloud (Streaming Avg: 195 Tokens/sec).\n` +
                     `• Cost Efficiency Leader: Google Gemini 3.7 Flash ($0.05 / 1M Tokens).\n` +
                     `• SLA Status: 0 Critical Outages detected in last 24h. Operational Score: 99.9%.`;

    let index = 0;
    setTimeout(() => {
        textEl.innerHTML = '';
        const interval = setInterval(() => {
            textEl.innerHTML += fullText[index];
            index++;
            if (index >= fullText.length) {
                clearInterval(interval);
            }
        }, 18);
    }, 600);
}

// 5. Architecture & Resume Modal Triggers
function openArchModal(type) {
    const titleEl = document.getElementById('arch-title');
    const flowEl = document.getElementById('arch-flow-container');

    if (type === 'trader') {
        titleEl.innerText = '| Quantitative AI Trading Engine Pipeline';
        flowEl.innerHTML = `
            <div class="arch-node">
                <i class="fas fa-stream text-info"></i>
                <h4>1. Real-Time Market Feeds</h4>
                <p>Ingests low-latency WebSocket tick data & order book streams across exchange pairs.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-brain text-purple"></i>
                <h4>2. AI Sentiment & Signals</h4>
                <p>Runs Local AI NLP on news & statistical arbitrage models to generate trading confidence scores.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-shield-alt text-warning"></i>
                <h4>3. Risk Manager & Backtester</h4>
                <p>Enforces dynamic stop-loss, Max Drawdown controls & VaR risk parameters before order dispatch.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-chart-line text-success"></i>
                <h4>4. Plotly Execution UI</h4>
                <p>Displays live candlestick graphs, orderbook depth charts & automated trade execution logs.</p>
            </div>
        `;
    } else if (type === 'wayback') {
        titleEl.innerText = '| Web Archive Temporal Intelligence Engine';
        flowEl.innerHTML = `
            <div class="arch-node">
                <i class="fas fa-globe text-info"></i>
                <h4>1. Wayback REST API</h4>
                <p>Queries Wayback Machine CDX server indexes for historical domain snapshot timestamps.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-laptop-code text-warning"></i>
                <h4>2. Async DOM Diff Parser</h4>
                <p>Fetches archived HTML snapshots in parallel with Python Asyncio & computes DOM structural deltas.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-database text-purple"></i>
                <h4>3. DuckDB Archival Index</h4>
                <p>Indexes snapshot metadata into lightweight DuckDB columnar files for instant querying.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-history text-success"></i>
                <h4>4. Dash Time Machine UI</h4>
                <p>Renders side-by-side visual webpage diffs and interactive historical timeline sliders.</p>
            </div>
        `;
    } else if (type === 'security') {
        titleEl.innerText = '| Open-Source Vulnerability Blast-Radius Engine';
        flowEl.innerHTML = `
            <div class="arch-node">
                <i class="fas fa-box-open text-info"></i>
                <h4>1. Package SBOM Ingestion</h4>
                <p>Parses lockfiles (requirements.txt, package-lock.json, Cargo.lock) into directed acyclic dependency graphs.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-bug text-warning"></i>
                <h4>2. OSV.dev CVE Ingestion</h4>
                <p>Queries OSV.dev REST API asynchronously to resolve CVEs, CVSS v4.0 scores & vulnerable version ranges.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-project-diagram text-purple"></i>
                <h4>3. NetworkX Blast Evaluator</h4>
                <p>Computes transitive propagation paths & blast radius reachability vectors across application components.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-shield-alt text-success"></i>
                <h4>4. Plotly 3D Graph UI</h4>
                <p>Renders 3D interactive dependency trees, blast-radius severity heatmaps & automated upgrade advice.</p>
            </div>
        `;
    } else {

        titleEl.innerText = '| End-to-End Data Telemetry Pipeline';
        flowEl.innerHTML = `
            <div class="arch-node">
                <i class="fas fa-cloud-download-alt text-info"></i>
                <h4>1. Live API Ingestion</h4>
                <p>Fetches real-time model specs, pricing & base TTFT/TPS from OpenRouter Public REST API.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-database text-warning"></i>
                <h4>2. Supabase PostgreSQL</h4>
                <p>Stores 7 to 90 day historical telemetry logs with server status codes & traffic queue flags.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-chart-pie text-success"></i>
                <h4>3. Plotly / Dash UI</h4>
                <p>Renders 360° Polar Radar Scorecards, Pareto Frontier scatter plots & hourly congestion heatmaps.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-robot text-purple"></i>
                <h4>4. Ollama Local AI</h4>
                <p>Runs offline local LLMs to generate executive telemetry summaries at zero cloud token cost.</p>
            </div>
        `;
    }
    document.getElementById('arch-modal').classList.add('active');
}

function closeArchModal() {
    document.getElementById('arch-modal').classList.remove('active');
}


function openResumeModal() {
    document.getElementById('resume-modal').classList.add('active');
}

function closeResumeModal() {
    document.getElementById('resume-modal').classList.remove('active');
}

// 6. Copy to Clipboard Function & Toast Notification
function copyContact(text, msg) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(msg);
    });
}

function showToast(msgText) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<i class="fas fa-check-circle me-1"></i> ${msgText}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// 7. Accent Color Theme Switcher Function
function setAccentTheme(theme) {
    const root = document.documentElement;
    if (theme === 'cyan') {
        root.style.setProperty('--accent-blue', '#00d2ff');
        showToast('Accent Theme: Electric Cyan');
    } else if (theme === 'purple') {
        root.style.setProperty('--accent-blue', '#9d4edd');
        showToast('Accent Theme: Neon Purple');
    } else if (theme === 'green') {
        root.style.setProperty('--accent-blue', '#00e676');
        showToast('Accent Theme: Emerald Green');
    }
}

// 8. Projects Horizontal Carousel Slider Controls
const sliderWrapper = document.querySelector('.projects-slider-wrapper');
const prevBtn = document.getElementById('carousel-prev-btn');
const nextBtn = document.getElementById('carousel-next-btn');

if (sliderWrapper && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        sliderWrapper.scrollBy({ left: -380, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        sliderWrapper.scrollBy({ left: 380, behavior: 'smooth' });
    });
}


// 9. Deep-Link URL Router for Dashboard Previews
function handleHashRouting() {
    const hash = window.location.hash;
    if (hash === '#preview/llm-sla-telemetry') {
        openEmbedModal('http://127.0.0.1:8060/', 'llm-sla-telemetry');
    } else if (hash === '#preview/security-blast-radius') {
        openEmbedModal('http://127.0.0.1:8065/', 'security-blast-radius');
    }
}


window.addEventListener('hashchange', handleHashRouting);
window.addEventListener('DOMContentLoaded', handleHashRouting);






