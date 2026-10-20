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

function openTerminal() {
    if (terminalModal) {
        terminalModal.classList.add('active');
        if (terminalInput) terminalInput.focus();
    }
}

if (btnOpenTerminal) {
    btnOpenTerminal.addEventListener('click', () => {
        openTerminal();
    });
}

if (btnCloseTerminal) {
    btnCloseTerminal.addEventListener('click', () => {
        if (terminalModal) terminalModal.classList.remove('active');
    });
}

// Mobile Slide-Out Navigation Drawer
function toggleMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    if (!drawer) return;
    if (drawer.classList.contains('active')) {
        closeMobileDrawer();
    } else {
        openMobileDrawer();
    }
}

function openMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('drawer-open');
    document.body.style.overflow = 'hidden';
}

function closeMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('drawer-open');
    document.body.style.overflow = '';
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMobileDrawer();
        if (terminalModal) terminalModal.classList.remove('active');
        const embedModal = document.getElementById('embed-modal');
        if (embedModal) embedModal.classList.remove('active');
        const archModal = document.getElementById('arch-modal');
        if (archModal) archModal.classList.remove('active');
        toggleAIChat(false);
    }
});

// Interactive Avatar Headshot Tap / Click Toggle & Reset
const avatarContainer = document.querySelector('.avatar-popout-container');
let isAvatarActive = false;

if (avatarContainer) {
    avatarContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        isAvatarActive = !isAvatarActive;
        if (isAvatarActive) {
            avatarContainer.classList.add('active');
            avatarContainer.classList.remove('force-reset');
        } else {
            avatarContainer.classList.remove('active');
            avatarContainer.classList.add('force-reset');
            avatarContainer.blur();
        }
    });

    document.addEventListener('click', (e) => {
        if (!avatarContainer.contains(e.target)) {
            isAvatarActive = false;
            avatarContainer.classList.remove('active');
            avatarContainer.classList.remove('force-reset');
        }
    });

    avatarContainer.addEventListener('mouseleave', () => {
        isAvatarActive = false;
        avatarContainer.classList.remove('active');
        avatarContainer.classList.remove('force-reset');
    });
}

const commands = {
    help: `Available commands:<br>
  - <b style="color:#00d2ff">about</b>: Display executive bio summary<br>
  - <b style="color:#00d2ff">experience</b>: Career highlights at Google, Netflix, MSFT & Databricks<br>
  - <b style="color:#00d2ff">projects</b>: List active telemetry & AI production systems<br>
  - <b style="color:#00d2ff">stats</b>: View telemetry ingestion metrics & SLA benchmarks<br>
  - <b style="color:#00d2ff">skills</b>: Show technical competence matrix<br>
  - <b style="color:#00d2ff">certifications</b>: View verified GCP & Tableau credentials<br>
  - <b style="color:#00d2ff">education</b>: View academic degrees & universities<br>
  - <b style="color:#00d2ff">share</b>: Share portfolio via native share or copy link<br>
  - <b style="color:#00d2ff">ask &lt;query&gt;</b>: Query Hemanth's AI Assistant on career & architecture<br>
  - <b style="color:#00d2ff">rickroll</b>: Synthesize 8-bit Rick Astley audio easter egg<br>
  - <b style="color:#00d2ff">music</b>: Stream synthesized 8-bit audio telemetry<br>
  - <b style="color:#00d2ff">stop</b>: Stop active audio synthesis<br>
  - <b style="color:#00d2ff">contact</b>: View direct email, phone, and LinkedIn<br>
  - <b style="color:#00d2ff">clear</b>: Clear terminal screen`,
    
    about: `<b>Hemanth Chellam - Senior Data & AI Systems Engineer</b><br>
Senior Analytics & Data Engineer with <b>9+ years of enterprise experience</b> delivering high-throughput ETL pipelines, big data architectures, and AI solutions at scale for industry leaders including <b>Google</b>, <b>Microsoft</b>, <b>Netflix</b>, and <b>Databricks</b>.`,

    experience: `<b>Enterprise Career Milestones:</b><br>
• <b style="color:#00d2ff">Koantek (Databricks Contract)</b>: Spark Structured Streaming on Lakehouse, dbt, Unity Catalog.<br>
• <b style="color:#e50914">Netflix</b>: Real-time telemetry for 'Squid Game: Unleashed', LLM-driven query pipelines, AWS Lakehouse.<br>
• <b style="color:#00e676">Microsoft (Activision/Xbox)</b>: 'Call of Duty' engagement telemetry, BigQuery/Databricks, Airflow DAGs.<br>
• <b style="color:#ffb703">Google (Virtusa/Iconma)</b>: GCP Dataflow, Pub/Sub, Telco Cloud data lakes, Dialogflow bots.<br>
• <b style="color:#00a3e0">State Auto Insurance</b>: Agent telemetry analytics, actuarial modeling & BI (Python, SQL Server, SAS).<br>
• <b style="color:#3a86ff">HCL Technologies</b>: Foundational enterprise data modeling & business analytics (Tableau, SAS, SQL).`,

    projects: `<b>Active Production Systems:</b><br>
1. ⚡ <b style="color:#00d2ff">Algo Trader AI App</b>: Autonomous quant momentum engine & Gemini sentiment audits.<br>
2. 🕊️ <b style="color:#c77dff">The Way Back App</b>: Client-side privacy spiritual sanctuary & GenAI contemplation.<br>
3. 📊 <b style="color:#00e676">LLM Telemetry & SLA Intelligence</b>: 360° Radar & Pareto Frontier observability.<br>
4. 🛡️ <b style="color:#ff5f56">Security Blast-Radius Engine</b>: Directed DAG transitive CVE propagation.`,

    skills: `<b>Technical Competencies:</b><br>
• <b>Data & Streaming</b>: Spark Structured Streaming, Databricks Delta Lake, Apache Beam, Cloud Dataflow, Kafka, dbt, Airflow.<br>
• <b>Cloud & DW</b>: Google Cloud Platform (GCP), AWS, BigQuery, Snowflake, Delta Lake, Unity Catalog.<br>
• <b>Languages & UI</b>: Python, SQL, Next.js / React, Plotly Dash, TypeScript, FastAPI, WebSockets.<br>
• <b>AI & ML</b>: Google Gemini AI, Ollama Local LLMs, Vector Embeddings, Prompt Engineering.`,

    certifications: `<b>Verified Professional Credentials:</b><br>
• 🏆 <b style="color:#00d2ff">Google Cloud Certified: Professional Cloud Architect</b><br>
• 🏆 <b style="color:#00e676">Google Cloud Certified: Professional Data Engineer</b><br>
• 🏆 <b style="color:#ffb703">Google Cloud Certified: Associate Cloud Engineer</b><br>
• 🏆 <b style="color:#c77dff">Tableau Desktop Specialist</b>`,

    education: `<b>Academic Education & Degrees:</b><br>
• 🎓 <b style="color:#00d2ff">MS in Information Systems & Technology</b> — Claremont Graduate University, CA<br>
• 🎓 <b style="color:#00e676">Master of Business Administration (MBA)</b> — Alliance University<br>
• 🎓 <b style="color:#ffb703">B.E. in Mechanical Engineering</b> — BMS College of Engineering, India`,

    stats: `<pre style="font-family: monospace; font-size: 0.82rem; line-height: 1.4; color: #00d2ff; margin: 0.4rem 0;">
+--------------------------+-----------------------+-------------+
| System Telemetry Layer   | Metric / Throughput   | SLA Status  |
+--------------------------+-----------------------+-------------+
| Databricks Lakehouse     | Sub-15 min streaming  | NOMINAL 🟢  |
| Netflix Squid Game Tel.  | 10B+ events/day peak  | 99.99%  🟢  |
| Call of Duty Analytics   | Real-time Airflow DAG | 99.95%  🟢  |
| Google Telco Dataflow    | 70% KPI acceleration  | NOMINAL 🟢  |
| Quant Real-Time WS       | 18ms p99 latency      | ACTIVE  🟢  |
+--------------------------+-----------------------+-------------+
</pre>`,

    contact: `<b>Contact & Connect:</b><br>
• Email: chellamhemanth@gmail.com<br>
• Phone: (408) 896-8641<br>
• LinkedIn: linkedin.com/in/hemanth-chellam-b9285a8a/<br>
• GitHub: github.com/HEMANTH5439`
};

// Centralized AI Knowledge Engine (Option 3 - Unified Hybrid Engine)
let lastFallbackIndex = 0;
function getAIResponse(query) {
    const q = query.toLowerCase().trim();

    if (q.includes("relocat") || q.includes("seattle") || q.includes("bay area") || q.includes("austin") || q.includes("new york") || q.includes("move")) {
        return "Yes, Hemanth is currently based in Dallas, TX and is open to Remote, Hybrid, or relocating to major tech hubs (including Seattle, the Bay Area, Austin, or NYC) for the right Senior, Lead, or Principal opportunity.";
    } else if (q.includes("chief") || q.includes("lead") || q.includes("principal") || q.includes("staff") || q.includes("director") || q.includes("architect role") || q.includes("fit")) {
        return "Hemanth is an strong fit for Staff, Principal, Lead, or Architectural leadership roles—backed by 9+ years designing petabyte-scale Lakehouse and streaming architectures at Google, Netflix, Microsoft, and Databricks, plus an MS in Information Systems (Claremont Graduate University) and an MBA.";
    } else if (q.includes("netflix") || q.includes("squid game") || q.includes("gameplay")) {
        return "At Netflix, I engineered real-time gameplay and cloud infrastructure telemetry pipelines for 'Squid Game: Unleashed' and mobile games. I integrated LLM-driven query assistants translating natural language to SQL/telemetry and modernized AWS big data infrastructure (10B+ daily events).";
    } else if (q.includes("microsoft") || q.includes("xbox") || q.includes("activision") || q.includes("call of duty") || q.includes("cod")) {
        return "At Microsoft (Activision / Xbox Division), I built end-to-end player telemetry pipelines for 'Call of Duty', orchestrating BigQuery and Databricks workflows via automated Airflow DAGs to track live engagement and telemetry for millions of active players.";
    } else if (q.includes("google") || q.includes("telco") || q.includes("dialogflow") || q.includes("dataflow") || q.includes("beam")) {
        return "At Google, I engineered multi-tenant ETL pipelines using Apache Beam, Cloud Dataflow, Pub/Sub, and BigQuery for tier-1 Telco Cloud customers. I automated Dialogflow chatbot analytics and implemented Slowly Changing Dimensions (SCD Type 4).";
    } else if (q.includes("databricks") || q.includes("spark") || q.includes("lakehouse") || q.includes("koantek") || q.includes("delta") || q.includes("unity")) {
        return "At Koantek (Databricks Contract), I designed Spark Structured Streaming on Databricks Lakehouse, slashing ad signal latency from 8 hours to under 15 minutes. Migrating workloads to Photon clusters cut DBU consumption by 30%, and Unity Catalog reduced discrepancies by 65%.";
    } else if (q.includes("state auto") || q.includes("insurance") || q.includes("columbus")) {
        return "At State Auto Insurance (Columbus, OH), I worked as a Data Analyst, mining and analyzing agent network datasets to identify key factors driving policy sales performance using SQL Server, Python, Tableau, and SAS.";
    } else if (q.includes("hcl") || q.includes("technologies") || q.includes("bangalore")) {
        return "At HCL Technologies (Bangalore, India), I started my career as a Business Analyst, collecting, cleaning, and modeling structured and unstructured data for major enterprise client initiatives using Tableau, SAS, SQL, and Excel.";
    } else if (q.includes("cert") || q.includes("gcp") || q.includes("tableau")) {
        return "Hemanth holds multiple verified industry credentials: Dual Google Cloud Certified (Professional Cloud Architect & Professional Data Engineer), Google Associate Cloud Engineer, and Tableau Desktop Specialist.";
    } else if (q.includes("education") || q.includes("degree") || q.includes("university") || q.includes("college") || q.includes("masters") || q.includes("mba") || q.includes("academic") || q.includes("claremont")) {
        return "Academic Degrees: 🎓 MS in Information Systems & Technology from Claremont Graduate University (California), 🎓 Master of Business Administration (MBA) from Alliance University, and 🎓 B.E. in Mechanical Engineering from BMS College of Engineering.";
    } else if (q.includes("algo trader") || q.includes("trading") || q.includes("quant") || q.includes("crypto") || q.includes("stock")) {
        return "Algo Trader AI is an autonomous quantitative momentum engine featuring multi-timeframe RSI/MACD signals, Gemini AI narrative sentiment audits, WebSocket streaming with 18ms p99 latency, and paper-trade simulation.";
    } else if (q.includes("the way back") || q.includes("spiritual") || q.includes("privacy") || q.includes("sanctuary")) {
        return "The Way Back is a privacy-first spiritual sanctuary web app featuring zero-cloud client-side storage, biometric local locking, and offline GenAI contemplative guidance.";
    } else if (q.includes("telemetry") || q.includes("sla") || q.includes("benchmark") || q.includes("radar")) {
        return "The LLM Telemetry & SLA Intelligence dashboard monitors 50+ frontier models with 360° Polar Radar Scorecards, Pareto Frontier speed vs. cost scatter plots, and live OpenRouter ingestion metrics.";
    } else if (q.includes("security") || q.includes("blast") || q.includes("radius") || q.includes("cve") || q.includes("dag")) {
        return "The Security Blast-Radius Engine maps transitive vulnerability propagation across interconnected microservice graphs using directed acyclic graph (DAG) traversal.";
    } else if (q.includes("skill") || q.includes("stack") || q.includes("technolog") || q.includes("language") || q.includes("python") || q.includes("sql")) {
        return "Core Competencies: Spark Structured Streaming, Databricks Delta Lake, Apache Beam, Cloud Dataflow, Kafka, dbt, Airflow, GCP, AWS, BigQuery, Snowflake, Unity Catalog, Python, SQL, Next.js / React, Plotly Dash, and local LLMs (Ollama).";
    } else if (q.includes("available") || q.includes("hire") || q.includes("role") || q.includes("job") || q.includes("salary") || q.includes("location") || q.includes("contact") || q.includes("email") || q.includes("phone")) {
        return "Hemanth is open to full-time Senior/Staff/Lead Data & AI Systems Engineer roles and technical advisory engagements (Dallas, TX / Hybrid / Remote / Open to Relocation). Contact him directly at chellamhemanth@gmail.com or (408) 896-8641.";
    } else if (q.includes("hemanth") || q.includes("about") || q.includes("bio") || q.includes("summary")) {
        return "Hemanth Chellam is a Senior Analytics & Data Engineer with 9+ years of experience delivering high-throughput ETL pipelines, big data architectures, and enterprise AI solutions at scale for Google, Microsoft, Netflix, and Databricks.";
    } else {
        const variedFallbacks = [
            "I'm Hemanth's AI portfolio assistant! Ask me about his engineering work at Netflix, Databricks, Microsoft, or Google, his 4 production AI apps, or his availability for Senior/Lead roles.",
            "Hemanth specializes in real-time telemetry (10B+ daily events at Netflix), Databricks Lakehouse streaming (<15m SLA), and enterprise AI systems. Which project or role would you like to explore?",
            "You can ask me specific questions about Hemanth's tech stack (Spark, Beam, BigQuery, Delta Lake, Gemini AI), his dual GCP Architect/Data Engineer certifications, or how to connect with him directly at chellamhemanth@gmail.com."
        ];
        const chosen = variedFallbacks[lastFallbackIndex % variedFallbacks.length];
        lastFallbackIndex++;
        return chosen;
    }
}

const chatConversationHistory = [];

function recordChatTurn(userQuery, botReply, modelName) {
    chatConversationHistory.push(
        { role: 'user', parts: [{ text: userQuery }] },
        { role: 'model', parts: [{ text: botReply }] }
    );
    if (chatConversationHistory.length > 12) {
        chatConversationHistory.splice(0, chatConversationHistory.length - 12);
    }
    const statusEl = document.querySelector('.ai-drawer-status');
    if (statusEl) {
        statusEl.innerHTML = `<span class="ai-dot-green"></span> Online • Powered by Gemini`;
    }
}

async function fetchGeminiChatResponse(query) {
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: query,
                history: chatConversationHistory.slice(-10)
            })
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.reply) {
                recordChatTurn(query, data.reply, data.model || 'Gemini AI');
                return { text: data.reply, source: 'gemini', model: data.model };
            }
        }
    } catch (err) {
        console.warn('Backend /api/chat unreachable, falling back to local knowledge engine:', err);
    }

    // Fallback to local verified knowledge base
    const localReply = getAIResponse(query);
    recordChatTurn(query, localReply, null);
    return { text: localReply, source: 'local' };
}

async function answerAIQuery(query, container) {
    trackTelemetryEvent('ai_query', { query_length: query.length, source: 'terminal_ask', topic: query.substring(0, 60) });
    container.innerHTML = `<span style="color:#00d2ff"><i class="fas fa-robot me-1"></i> [Hemanth AI Assistant]:</span> <span style="color:var(--text-muted); font-size:0.85rem;"><i class="fas fa-circle-notch fa-spin"></i> Thinking...</span>`;
    const result = await fetchGeminiChatResponse(query);
    container.innerHTML = `<span style="color:#00d2ff"><i class="fas fa-robot me-1"></i> [Hemanth AI Assistant]:</span> `;
    let idx = 0;
    const typingInterval = setInterval(() => {
        container.innerHTML += result.text[idx];
        idx++;
        if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
        if (idx >= result.text.length) {
            clearInterval(typingInterval);
        }
    }, 10);
}

// Floating Hemanth AI Chat Widget Functions
let isAIChatOpen = false;
let isAITyping = false;

function toggleAIChat(forceState) {
    const drawer = document.getElementById('hemanth-ai-drawer');
    const launcher = document.getElementById('hemanth-ai-launcher');
    const input = document.getElementById('ai-chat-input');
    if (!drawer) return;

    if (forceState !== undefined) {
        isAIChatOpen = forceState;
    } else {
        isAIChatOpen = !isAIChatOpen;
    }

    if (isAIChatOpen) {
        drawer.style.display = 'flex';
        if (launcher) launcher.classList.add('active');
        if (input) setTimeout(() => input.focus(), 150);
        const msgs = document.getElementById('ai-chat-messages');
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
    } else {
        drawer.style.display = 'none';
        if (launcher) launcher.classList.remove('active');
    }
}

function openTerminalFromChat() {
    toggleAIChat(false);
    if (terminalModal) {
        terminalModal.classList.add('active');
        if (terminalInput) terminalInput.focus();
    }
}

function sendQuickPrompt(promptText) {
    trackTelemetryEvent('ai_query', { prompt: promptText, source: 'quick_topic' });
    const input = document.getElementById('ai-chat-input');
    if (input) {
        input.value = promptText;
        handleAIChatSubmit();
    }
}

async function handleAIChatSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (isAITyping) return;

    const input = document.getElementById('ai-chat-input');
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!input || !messagesContainer) return;

    const query = input.value.trim();
    if (!query) return;

    trackTelemetryEvent('ai_query', { query_length: query.length, source: 'ai_chat_widget', topic: query.substring(0, 60) });

    input.value = '';

    // Append User Message Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'ai-bubble ai-bubble-user';
    userBubble.innerHTML = `<div class="ai-bubble-text">${escapeHTML(query)}</div>`;
    messagesContainer.appendChild(userBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Append Bot Message Bubble with avatar & loader
    const botBubble = document.createElement('div');
    botBubble.className = 'ai-bubble ai-bubble-bot';
    botBubble.innerHTML = `
        <div class="ai-bubble-avatar"><i class="fas fa-robot"></i></div>
        <div class="ai-bubble-text"><span class="ai-typing-cursor"><i class="fas fa-circle-notch fa-spin me-1"></i> Thinking...</span></div>
    `;
    messagesContainer.appendChild(botBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    isAITyping = true;
    const botTextElem = botBubble.querySelector('.ai-bubble-text');

    const result = await fetchGeminiChatResponse(query);
    const responseText = result.text;

    botTextElem.innerHTML = '';
    let idx = 0;

    const typingInterval = setInterval(() => {
        botTextElem.innerHTML += responseText[idx];
        idx++;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        if (idx >= responseText.length) {
            clearInterval(typingInterval);
            isAITyping = false;
        }
    }, 10);
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}

function renderAdminTelemetryTable(data) {
    const m = data.metrics || {};
    const d = data.devices || {};
    const r = data.referrers || [];
    const p = data.top_projects || [];
    const recent = data.recent_events || [];

    const deskPct = d.desktop?.pct || 0;
    const mobPct = d.mobile?.pct || 0;
    const tabPct = d.tablet?.pct || 0;

    const makeBar = (pct) => {
        const totalChars = 14;
        const filled = Math.min(totalChars, Math.round((pct / 100) * totalChars));
        return '█'.repeat(filled) + '░'.repeat(totalChars - filled);
    };

    let refRows = r.map((item, idx) => `  ${idx + 1}. ${item.source.padEnd(24)} : ${item.count} hits (${item.pct}%)`).join('\n');
    if (!refRows) refRows = '  (No external referrers logged yet)';

    let projRows = p.map((item, idx) => `  ${idx + 1}. ${item.project.padEnd(28)} : ${item.clicks} interactions`).join('\n');
    if (!projRows) projRows = '  (No project interactions logged yet)';

    let recentRows = recent.slice(0, 5).map(e => {
        const timeStr = e.created_at ? e.created_at.replace('T', ' ').substring(0, 19) : 'Just now';
        const evType = (e.event_type || 'event').padEnd(13);
        const dev = (e.device || 'desktop').padEnd(7);
        const path = (e.path || '/').substring(0, 20);
        return `  [${timeStr}] ${evType} ${dev} ${path}`;
    }).join('\n');
    if (!recentRows) recentRows = '  (No recent events)';

    const engineName = data.storage_engine || 'Supabase PostgreSQL / Local Vault';

    return `
<pre style="font-family: monospace; font-size: 0.82rem; line-height: 1.45; color: #00e676; margin: 0.5rem 0; overflow-x: auto; background: rgba(0,0,0,0.5); padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(0, 230, 118, 0.3);">
╔══════════════════════════════════════════════════════════════════════╗
║      HEMANTH CHELLAM — EXECUTIVE VISITOR & USAGE TELEMETRY HUB       ║
║   Backend: ${engineName.padEnd(58)}║
║   Status: 🟢 AUTHENTICATED • Private Telemetry Feed                  ║
╚══════════════════════════════════════════════════════════════════════╝

📊 <b style="color:#00d2ff">ENGAGEMENT & AUDIENCE METRICS</b>
────────────────────────────────────────────────────────────────────────
• Total Telemetry Events   : <b style="color:#ffffff">${m.total_events || 0}</b>
• Page Impressions (Views) : <b style="color:#ffffff">${m.page_views || 0}</b>
• Unique Visitor Sessions  : <b style="color:#ffffff">${m.unique_sessions || 0}</b>
• Gemini AI Chat Queries   : <b style="color:#ffffff">${m.ai_queries || 0}</b>
• Resume PDF Downloads     : <b style="color:#ffffff">${m.resume_views || 0}</b>
• Social Portfolio Shares  : <b style="color:#ffffff">${m.share_clicks || 0}</b>
• Project Interactions     : <b style="color:#ffffff">${m.project_clicks || 0}</b>
• CLI Terminal Commands    : <b style="color:#ffffff">${m.terminal_cmds || 0}</b>

📱 <b style="color:#00d2ff">DEVICE BREAKDOWN</b>
────────────────────────────────────────────────────────────────────────
• Desktop : ${String(deskPct).padStart(4)}% [${makeBar(deskPct)}] (${d.desktop?.count || 0} visits)
• Mobile  : ${String(mobPct).padStart(4)}% [${makeBar(mobPct)}] (${d.mobile?.count || 0} visits)
• Tablet  : ${String(tabPct).padStart(4)}% [${makeBar(tabPct)}] (${d.tablet?.count || 0} visits)

🌐 <b style="color:#00d2ff">ACQUISITION & REFERRAL CHANNELS</b>
────────────────────────────────────────────────────────────────────────
${refRows}

🔥 <b style="color:#00d2ff">PROJECT ENGAGEMENT LEADERS</b>
────────────────────────────────────────────────────────────────────────
${projRows}

🕒 <b style="color:#00d2ff">LIVE VISITOR EVENT FEED (LAST 5)</b>
────────────────────────────────────────────────────────────────────────
${recentRows}
</pre>
<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.3rem;">
  💡 <i>Tip: Visitor telemetry auto-syncs to Supabase PostgreSQL &amp; local persistent vault. Type <b style="color:#00d2ff">clear</b> to reset terminal.</i>
</div>`;
}

async function executeTerminalCommand(rawCmd) {
    if (!rawCmd || !terminalBody) return;
    const cmd = rawCmd.toLowerCase().trim();
    if (terminalInput) terminalInput.value = '';

    const line = document.createElement('div');
    line.innerHTML = `<span style="color:#00d2ff">hemanth@hub:~$</span> ${escapeHTML(rawCmd)}`;
    terminalBody.appendChild(line);

    const response = document.createElement('div');
    response.style.marginBottom = '0.8rem';
    response.style.color = '#c77dff';

    if (cmd === 'clear') {
        terminalBody.innerHTML = '';
        return;
    }

    // Track terminal telemetry without sensitive pin
    const safeCmd = cmd.startsWith('admin') ? 'admin' : (cmd.startsWith('telemetry') ? 'telemetry' : (cmd.startsWith('metrics') ? 'metrics' : cmd));
    trackTelemetryEvent('terminal_cmd', { command: safeCmd });

    if (cmd === 'share') {
        sharePortfolio();
        response.innerHTML = `<span style="color:#00e676">🔗 Triggered native share sheet / copied portfolio link to clipboard.</span>`;
    } else if (cmd === 'admin' || cmd === 'telemetry' || cmd === 'metrics') {
        response.innerHTML = `
<div style="border-left: 3px solid #ffb703; padding-left: 0.8rem; margin: 0.4rem 0;">
  <b style="color:#ffb703">[ADMIN SECURITY LOCK] Private Telemetry Vault</b><br>
  <span style="color:var(--text-muted)">Visitor impressions, unique sessions, AI queries &amp; usage logs are strictly restricted to Hemanth Chellam.</span><br>
  <span style="color:#e0e0e0">Usage: </span><b style="color:#00d2ff">admin &lt;pin&gt;</b> or <b style="color:#00d2ff">metrics &lt;pin&gt;</b>
</div>`;
    } else if (cmd.startsWith('admin ') || cmd.startsWith('telemetry ') || cmd.startsWith('metrics ')) {
        const parts = rawCmd.split(/\s+/);
        const pin = parts[1] || '';
        response.innerHTML = `<span style="color:#00d2ff">⏳ Authenticating with Telemetry Vault...</span>`;
        terminalBody.appendChild(response);
        terminalBody.scrollTop = terminalBody.scrollHeight;

        try {
            const res = await fetch(`/api/telemetry?pin=${encodeURIComponent(pin)}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                response.innerHTML = `<span style="color:#ff5f56">❌ [ACCESS DENIED] ${escapeHTML(errData.error || 'Invalid administrator PIN.')}</span>`;
            } else {
                const data = await res.json();
                response.innerHTML = renderAdminTelemetryTable(data);
            }
        } catch (fetchErr) {
            response.innerHTML = `<span style="color:#ff5f56">❌ Telemetry Vault unreachable: ${escapeHTML(fetchErr.message)}</span>`;
        }
        terminalBody.scrollTop = terminalBody.scrollHeight;
        return;
    } else if (cmd === 'rickroll' || cmd === 'music' || cmd === 'nevergonnagiveyouup' || cmd === 'song') {
        playRickRollSynth();
        response.innerHTML = `
<div style="background: rgba(0, 0, 0, 0.45); padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid #00d2ff; margin: 0.5rem 0;">
  <span style="color:#00d2ff; font-weight:700;">🎵 [SYSTEM STREAM: HIGH-THROUGHPUT AUDIO SYNTH]</span><br>
  <span style="color:#00e676">▶ Now Synthesizing: Rick Astley — Never Gonna Give You Up (1987)</span><br>
  <pre style="color:#c77dff; margin: 0.4rem 0; font-size: 0.76rem; line-height: 1.2;">
   ┌──────────────────────────────────────────────┐
   │ ♫ █ ▄ █ ▄ ▄ █ ▌ 0:42 / 3:32   [8-BIT SYNTH]  │
   │ "Never gonna give you up,                    │
   │  Never gonna let you down..."                │
   └──────────────────────────────────────────────┘
  </pre>
  <span style="color:var(--text-muted); font-size: 0.82rem;">Latency: <b>0.12ms</b> • Synthesized live via HTML5 Web Audio API. Type '<b style="color:#00d2ff">stop</b>' to halt audio.</span>
</div>`;
    } else if (cmd === 'stop') {
        stopRickRollSynth();
        response.innerHTML = `<span style="color:#ffb703">⏹ Audio stream halted.</span>`;
    } else if (commands[cmd]) {
        response.innerHTML = commands[cmd];
    } else if (cmd === '') {
        return;
    } else {
        response.innerHTML = `<span style="color:#ff5f56">Command not found: '${escapeHTML(cmd)}'. Type '<b style="color:#00d2ff">help</b>' for available commands or try '<b style="color:#00d2ff">ask netflix</b>'.</span>`;
    }

    terminalBody.appendChild(response);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

if (terminalInput) {
    terminalInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const rawCmd = terminalInput.value.trim();
            if (rawCmd) {
                await executeTerminalCommand(rawCmd);
            }
        }
    });
}


// 3. Live Embed Modal Functions with Unique URL Hash Router
function openEmbedModal(url, systemId) {
    const modal = document.getElementById('embed-modal');
    const iframe = document.getElementById('embed-iframe');
    const extLink = document.getElementById('embed-external-link');
    const titleEl = document.getElementById('embed-title');
    
    // Explicit mapped endpoints (Native client-side dashboards inside the portfolio, plus cloud deployments)
    const systemUrls = {
        'llm-sla-telemetry': {
            url: './dashboards/llm-telemetry.html',
            title: '| LLM SLA Telemetry Intelligence'
        },
        'security-blast-radius': {
            url: './dashboards/security-blast.html',
            title: '| Security Blast-Radius Engine'
        },
        'algo-trader': {
            url: 'https://algotraderai.onrender.com/#overview',
            title: '| Algo Trader AI App'
        },
        'the-way-back': {
            url: 'https://thewayback.vercel.app/',
            title: '| The Way Back App'
        },
        'movie-analytics': {
            url: './dashboards/movie-analytics.html',
            title: '| CineMetrics Box Office Intelligence'
        }
    };


    let targetUrl = url;
    let projectName = systemId || url;
    if (systemId && systemUrls[systemId]) {
        targetUrl = systemUrls[systemId].url;
        projectName = systemUrls[systemId].title.replace(/^\|\s*/, '');
        if (titleEl) {
            titleEl.innerText = systemUrls[systemId].title;
        }
    }

    trackTelemetryEvent('project_click', { project: projectName, action: 'open_embed_preview' });

    if (extLink) {
        extLink.href = targetUrl;
    }

    if (iframe && modal) {
        iframe.src = targetUrl;
        modal.classList.add('active');
    } else {
        window.open(targetUrl, '_blank');
    }

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
        titleEl.innerText = '| Algo Trader AI Architecture Pipeline';
        flowEl.innerHTML = `
            <div class="arch-node">
                <i class="fas fa-chart-line text-info"></i>
                <h4>1. Multi-Sector Momentum</h4>
                <p>Calculates SMA breakouts, MACD crossovers, RSI comfort zones & volume surges to score candidate universe.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-brain text-purple"></i>
                <h4>2. Google Gemini AI Audits</h4>
                <p>Queries Gemini in batch prompts to analyze open positions, financial news & generate trade conviction ratings.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-shield-alt text-warning"></i>
                <h4>3. Dynamic Regime Guards</h4>
                <p>Evaluates SPY/QQQ macro trends daily; downshifts to conservative during bear trends and triggers circuit breakers.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-bolt text-success"></i>
                <h4>4. Alpaca Execution & Cockpit</h4>
                <p>Dispatches sub-second bracket orders via Alpaca API with real-time WebSocket feeds & React frosted-glass UI.</p>
            </div>
        `;
    } else if (type === 'wayback') {
        titleEl.innerText = '| The Way Back App Architecture Pipeline';
        flowEl.innerHTML = `
            <div class="arch-node">
                <i class="fas fa-user-shield text-info"></i>
                <h4>1. Client-Side Privacy</h4>
                <p>Zero-server data storage architecture keeps personal reflections and journal entries 100% on-device in LocalStorage.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-dove text-purple"></i>
                <h4>2. Google Generative AI</h4>
                <p>Powers contextual scripture reflection, personalized devotionals, and structured repentance guidance.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-layer-group text-warning"></i>
                <h4>3. Next.js 16 & Material UI</h4>
                <p>Modern React 19 App Router frontend with serene responsive typography, scripture navigation & audio engine.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-cloud text-success"></i>
                <h4>4. Vercel Edge & Supabase</h4>
                <p>Continuous edge delivery via Vercel Speed Insights, telemetry analytics & optional Supabase cloud sync.</p>
            </div>
        `;
    } else if (type === 'cinemetrics') {
        titleEl.innerText = '| CineMetrics Box Office Analytics Pipeline';
        flowEl.innerHTML = `
            <div class="arch-node">
                <i class="fas fa-database text-info"></i>
                <h4>1. Box Office Ingestion</h4>
                <p>Standardizes 1972–2026 worldwide gross, budget, ROI multipliers & release dates into Pandas dataframes.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-images text-purple"></i>
                <h4>2. TMDB Asset CDN</h4>
                <p>Integrates verified high-res poster media URLs & movie metadata with fallback cache handling.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-chart-line text-warning"></i>
                <h4>3. Plotly Statistical Quadrants</h4>
                <p>Visualizes critic vs box office quadrants, genre efficiency violin/box models & inflation-adjusted trends.</p>
            </div>
            <div class="arch-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="arch-node">
                <i class="fas fa-adjust text-success"></i>
                <h4>4. Adaptive Dual Theme UI</h4>
                <p>Dynamically inverts layout contrast between Cinema Dark & Clean Light modes with directional hover tooltips.</p>
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
    trackTelemetryEvent('resume_view', { action: 'open_modal', file: 'Hemanth_Chellam_Senior_Data_Engineer.pdf' });
    document.getElementById('resume-modal').classList.add('active');
}

function closeResumeModal() {
    document.getElementById('resume-modal').classList.remove('active');
}

// Print / PDF Resume Function
function printResume() {
    trackTelemetryEvent('resume_view', { action: 'print_pdf_download', file: 'Hemanth_Chellam_Senior_Data_Engineer.pdf' });
    window.print();
}

// 1-Click ATS Clean Resume Downloader (Greenhouse/Lever/Workday Optimized)
function downloadATSResume() {
    trackTelemetryEvent('resume_view', { action: 'ats_download', format: 'clean_ats_txt' });
    if (typeof playMicroTone === 'function') playMicroTone('command');

    const atsText = `HEMANTH CHELLAM
Senior Analytics & Data Engineer | Cloud Architect
Location: United States | Phone: (408) 896-8641 | Email: chellamhemanth@gmail.com
LinkedIn: https://linkedin.com/in/hemanth-chellam-b9285a8a/
GitHub: https://github.com/HEMANTH5439
Portfolio: https://hemanth-chellam.vercel.app

================================================================================
PROFESSIONAL SUMMARY
================================================================================
Senior Analytics & Data Engineer with 9+ years of experience delivering high-impact 
ETL pipelines, big data architectures, and enterprise AI solutions at scale for 
Google, Microsoft, Netflix, and Databricks. Certified Google Cloud Professional 
Data Engineer and Cloud Architect, specializing in Spark Structured Streaming, 
Databricks Lakehouse, dbt modeling, real-time telemetry, and LLM evaluation.

================================================================================
CORE TECHNICAL COMPETENCIES
================================================================================
• Big Data & Streaming: Apache Spark, Spark Streaming, Databricks Lakehouse, Delta Lake, Photon, Unity Catalog, Apache Kafka, Apache Airflow
• Cloud Infrastructure: Google Cloud Platform (BigQuery, Dataflow, Pub/Sub, Cloud Storage, Looker), AWS (S3, EMR, Athena, Redshift, Lambda), Microsoft Azure
• Data Modeling & Transformations: SQL, dbt, Slowly Changing Dimensions (SCD), Star/Snowflake Schema, Data Observability
• Programming & AI: Python (PySpark, FastAPI, Asyncio, Pandas, NumPy), SQL, R, Google Gemini API, OpenRouter REST API, Ollama Local LLMs, LangChain
• BI & Visualization: Tableau Desktop/Server, Plotly Dash, Looker Studio, PowerBI

================================================================================
PROFESSIONAL EXPERIENCE
================================================================================
KOANTEK (Databricks Contract) | Senior Data Engineer
Jan 2026 – Jul 2026 | Dallas, TX
• Designed programmatic ad signal ingestion using Spark Structured Streaming on Databricks Lakehouse, slashing pipeline latency from 8 hours to under 15 minutes.
• Developed foundational dbt data models tracking Ad Inventory Fill Rates, identifying yield bottlenecks with a projected 12% increase in global ad yield.
• Executed cost optimization audits migrating Spark workloads to Photon-enabled clusters, achieving a 30% reduction in Databricks Unit (DBU) consumption.
• Implemented data observability framework using Unity Catalog and Delta Live Tables, cutting upstream-downstream discrepancies by 65%.

NETFLIX | Senior Analytics Engineer
May 2024 – Dec 2025 | Los Angeles, CA
• Led telemetry and product analytics for Squid Game Mobile/Cloud, delivering actionable insights that directly shaped monetization, retention, and live-ops strategy.
• Engineered scalable cloud data models, GitHub-versioned CI/CD workflows, and robust real-time/batch data processing pipelines on AWS.
• Partnered with data science to evaluate LLM-driven insight pipelines, integrating natural language query frameworks into core analytics workflows.
• Built and maintained interactive Tableau & Looker executive dashboards and implemented ML churn prediction models to maximize long-term player retention.

MICROSOFT (Activision / Xbox Division) | Senior Data Engineer
Feb 2022 – May 2024 | Santa Monica, CA
• Led cross-functional analytics for Call of Duty franchise engagement, defining global player metrics and architecting semantic telemetry layers.
• Utilized SQL across Spark, Databricks, and BigQuery for petabyte-scale gaming data analysis, orchestrating complex ETL pipelines via Python Airflow DAGs.
• Developed strategic ML datasets, predictive analytics models, and visual executive narratives to guide multi-million dollar live-service decisions.

GOOGLE (via Virtusa / Iconma) | GCP Data Engineer / Analyst
Aug 2018 – Feb 2022 | Sunnyvale, CA
• Built and maintained enterprise ETL data pipelines on GCP Dataflow, Pub/Sub, BigQuery, and Hadoop for top US Telco cloud accounts.
• Automated voice and chatbot analytics workflows using Dialogflow and deployed Slowly Changing Dimensions (SCD Type 4) historical tracking.
• Standardized production code repositories and improved telemetry KPI reporting, increasing cross-functional productivity by 70%.

STATE AUTO INSURANCE | Data Analyst (Intern)
Jan 2018 – May 2018 | Columbus, OH
• Analyzed insurance agent network datasets and identified key performance indicators influencing national policy sales performance.
• Mined and modeled data using SQL Server, Python, Tableau, and SAS.

HCL TECHNOLOGIES LIMITED | Business Analyst
Jun 2015 – Mar 2017 | Bangalore, India
• Collected, cleaned, and engineered data models for structured and unstructured enterprise datasets across key digital initiatives.
• Extracted and interpreted transactional data using Tableau, SAS, SQL, and Excel to transform raw metrics into actionable executive business intelligence.

================================================================================
EDUCATION & CERTIFICATIONS
================================================================================
• Master of Science in Information Technology and Management | University of Texas at Dallas
• Bachelor of Technology in Electronics and Communication | Sathyabama University
• Google Cloud Certified Professional Data Engineer (GCP)
• Google Cloud Certified Professional Cloud Architect (GCP)
• Tableau Desktop Certified Specialist
`;

    const blob = new Blob([atsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Hemanth_Chellam_Senior_Data_Engineer_ATS_Resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("✅ Downloaded Clean ATS Resume Summary (.txt)", 3000);
}

// Project Category Filtering
function filterProjects(cat) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(b => b.classList.remove('active'));
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }

    const cards = document.querySelectorAll('.projects-grid .project-card');
    cards.forEach(card => {
        if (cat === 'all') {
            card.classList.remove('filter-hidden');
        } else {
            const categories = card.getAttribute('data-category') || '';
            if (categories.includes(cat)) {
                card.classList.remove('filter-hidden');
            } else {
                card.classList.add('filter-hidden');
            }
        }
    });

    if (window.projectsCarousel) {
        window.projectsCarousel.updateVisibleSlides();
    }
}

// ==========================================
// Projects Interactive Slide Carousel Controller (Option 1)
// ==========================================
class ProjectsCarousel {
    constructor() {
        this.grid = document.getElementById('projects-grid');
        this.wrapper = document.getElementById('projects-carousel-wrapper');
        this.prevBtn = document.getElementById('projects-carousel-prev');
        this.nextBtn = document.getElementById('projects-carousel-next');
        this.indicatorsContainer = document.getElementById('carousel-indicators');
        this.pauseBadge = document.getElementById('carousel-pause-badge');

        if (!this.grid || !this.wrapper) return;

        this.currentIndex = 0;
        this.autoRotateInterval = null;
        this.pauseTimeout = null;
        this.isPaused = false;
        this.autoRotateDelay = 7000; // 7 seconds per slide
        this.pauseDuration = 10000;  // 10 seconds pause on project interaction

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateVisibleSlides();
        this.startAutoRotate();
    }

    getVisibleCards() {
        return Array.from(this.grid.querySelectorAll('.project-card:not(.filter-hidden)'));
    }

    getCardsPerView() {
        return window.innerWidth <= 900 ? 1 : 2;
    }

    getMaxIndex() {
        const visibleCount = this.getVisibleCards().length;
        const perView = this.getCardsPerView();
        return Math.max(0, visibleCount - perView);
    }

    updateVisibleSlides() {
        this.currentIndex = 0;
        this.renderIndicators();
        this.moveToIndex(0, false);
    }

    renderIndicators() {
        if (!this.indicatorsContainer) return;
        this.indicatorsContainer.innerHTML = '';
        const visibleCards = this.getVisibleCards();
        const perView = this.getCardsPerView();
        const totalPages = Math.max(1, visibleCards.length - perView + 1);

        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === this.currentIndex ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => {
                this.pause(this.pauseDuration);
                this.moveToIndex(i);
            });
            this.indicatorsContainer.appendChild(dot);
        }
    }

    moveToIndex(index, animate = true) {
        const maxIdx = this.getMaxIndex();
        if (index < 0) {
            index = maxIdx;
        } else if (index > maxIdx) {
            index = 0;
        }

        this.currentIndex = index;

        const visibleCards = this.getVisibleCards();
        if (visibleCards.length === 0) {
            this.grid.style.transform = `translateX(0px)`;
            return;
        }

        const targetCard = visibleCards[this.currentIndex];
        if (targetCard) {
            const offsetLeft = targetCard.offsetLeft;
            this.grid.style.transition = animate ? 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
            this.grid.style.transform = `translateX(-${offsetLeft}px)`;
        }

        // Update indicator dots
        const dots = this.indicatorsContainer ? this.indicatorsContainer.querySelectorAll('.carousel-dot') : [];
        dots.forEach((dot, idx) => {
            if (idx === this.currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    prev() {
        this.moveToIndex(this.currentIndex - 1);
    }

    next() {
        this.moveToIndex(this.currentIndex + 1);
    }

    startAutoRotate() {
        this.stopAutoRotate();
        this.autoRotateInterval = setInterval(() => {
            if (!this.isPaused) {
                this.next();
            }
        }, this.autoRotateDelay);
    }

    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }

    pause(durationMs = 10000) {
        this.isPaused = true;
        if (this.pauseBadge) {
            this.pauseBadge.style.display = 'inline-flex';
        }

        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
        }

        this.pauseTimeout = setTimeout(() => {
            this.resume();
        }, durationMs);
    }

    resume() {
        this.isPaused = false;
        if (this.pauseBadge) {
            this.pauseBadge.style.display = 'none';
        }
        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
            this.pauseTimeout = null;
        }
    }

    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.pause(this.pauseDuration);
                this.prev();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.pause(this.pauseDuration);
                this.next();
            });
        }

        // Pause for 10s on any click inside cards or interactive links
        this.grid.addEventListener('click', (e) => {
            const interactiveEl = e.target.closest('a, button, .project-card');
            if (interactiveEl) {
                this.pause(this.pauseDuration);
            }
        });

        // Pause on mouse hover
        this.wrapper.addEventListener('mouseenter', () => {
            this.isPaused = true;
        });

        this.wrapper.addEventListener('mouseleave', () => {
            if (!this.pauseTimeout) {
                this.isPaused = false;
            }
        });

        // Responsive resize
        window.addEventListener('resize', () => {
            this.renderIndicators();
            this.moveToIndex(this.currentIndex, false);
        });
    }
}

// Architecture Pipeline Simulation Function (Interactive Burst Telemetry)
function runPipelineSimulation() {
    const nodes = document.querySelectorAll('#arch-flow-container .arch-node');
    const statusText = document.getElementById('simulation-status-text');
    const btn = document.getElementById('btn-run-simulation');

    const metricRate = document.getElementById('sim-metric-rate');
    const metricLatency = document.getElementById('sim-metric-latency');
    const metricDbu = document.getElementById('sim-metric-dbu');
    const metricSla = document.getElementById('sim-metric-sla');

    if (!nodes || nodes.length === 0) return;

    if (typeof playMicroTone === 'function') playMicroTone('command');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Running Burst Payload...';

    const steps = [
        { text: "Ingesting synthetic streaming event stream from REST API...", rate: "18,400", latency: "6", dbu: "SPARK 3.5" },
        { text: "Validating schema, writing to Postgres Delta lakehouse...", rate: "36,800", latency: "11", dbu: "PHOTON ON" },
        { text: "Computing 360° radar telemetry & Pareto frontier aggregates...", rate: "48,200", latency: "18", dbu: "MAX CLUSTER" },
        { text: "Dispatched sub-second executive AI summaries. 100% SLA ✅", rate: "52,400", latency: "14", dbu: "COMMITTED" }
    ];

    let currentStep = 0;
    nodes.forEach(n => n.classList.remove('node-active-pulse'));

    const interval = setInterval(() => {
        if (currentStep > 0) {
            nodes[currentStep - 1].classList.remove('node-active-pulse');
        }
        if (currentStep < nodes.length) {
            nodes[currentStep].classList.add('node-active-pulse');
            if (typeof playMicroTone === 'function') playMicroTone('tick');

            const currentData = steps[currentStep];
            if (statusText) {
                statusText.innerHTML = `<span style="color:var(--accent-blue)">[Step ${currentStep + 1}/${nodes.length}]</span> ${currentData.text}`;
            }
            if (metricRate) metricRate.innerHTML = `${currentData.rate} <small style="font-size:0.68rem; color:var(--text-muted)">ev/s</small>`;
            if (metricLatency) metricLatency.innerHTML = `${currentData.latency} <small style="font-size:0.68rem; color:var(--text-muted)">ms</small>`;
            if (metricDbu) metricDbu.innerText = currentData.dbu;

            currentStep++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                nodes.forEach(n => n.classList.remove('node-active-pulse'));
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-bolt me-1"></i> Simulate Traffic Burst';
                if (typeof playMicroTone === 'function') playMicroTone('enable');
                if (statusText) {
                    statusText.innerHTML = '<span style="color:var(--accent-green)"><i class="fas fa-check-circle me-1"></i> Traffic burst complete! 52,400 ev/sec committed at 14ms p99 latency (100% SLA).</span>';
                }
            }, 800);
        }
    }, 650);
}

// 10. Interactive Timeline Accordion Functions
function toggleTimelineCard(headerElement) {
    const card = headerElement.closest('.timeline-card');
    if (card) {
        card.classList.toggle('expanded');
        updateGlobalTimelineButtonText();
    }
}

function toggleAllTimelineCards() {
    const cards = document.querySelectorAll('.experience-timeline .timeline-card');
    const allExpanded = Array.from(cards).every(c => c.classList.contains('expanded'));
    cards.forEach(c => {
        if (allExpanded) {
            c.classList.remove('expanded');
        } else {
            c.classList.add('expanded');
        }
    });
    updateGlobalTimelineButtonText();
}

function updateGlobalTimelineButtonText() {
    const btn = document.getElementById('btn-toggle-timeline');
    if (!btn) return;
    const cards = document.querySelectorAll('.experience-timeline .timeline-card');
    const allExpanded = Array.from(cards).every(c => c.classList.contains('expanded'));
    if (allExpanded) {
        btn.innerHTML = '<i class="fas fa-compress-alt me-1"></i> Collapse All Roles';
    } else {
        btn.innerHTML = '<i class="fas fa-expand-alt me-1"></i> Expand All Roles';
    }
}

// Global modal dismiss on backdrop click or ESC key
window.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('embed-modal')) {
        e.target.classList.remove('active');
        const iframe = e.target.querySelector('iframe');
        if (iframe) iframe.src = '';
        if (window.location.hash.startsWith('#preview/')) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.embed-modal.active').forEach(modal => {
            modal.classList.remove('active');
            const iframe = modal.querySelector('iframe');
            if (iframe) iframe.src = '';
        });
        if (window.location.hash.startsWith('#preview/')) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    }
});

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

// 6.1 Native Web Share API (The Way Back Pattern) with Clipboard Fallback
async function sharePortfolio() {
    const shareUrl = window.location.origin ? (window.location.origin + window.location.pathname) : window.location.href.split('#')[0];
    const shareData = {
        title: "Hemanth Chellam | Senior Data & AI Systems Engineer",
        text: "Explore the enterprise Data & AI engineering portfolio of Hemanth Chellam — high-throughput pipelines & AI architectures at Google, Netflix, MSFT, and Databricks.",
        url: shareUrl
    };

    trackTelemetryEvent('share_click', { action: 'share_initiated' });

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast("Portfolio shared successfully!");
            trackTelemetryEvent('share_click', { method: 'navigator.share', status: 'success' });
            return;
        } catch (err) {
            if (err.name === 'AbortError') {
                return; // User cancelled share sheet
            }
            console.log("Web Share fallback to clipboard:", err);
        }
    }

    // Fallback: Copy URL to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast("🔗 Portfolio link copied to clipboard!");
            trackTelemetryEvent('share_click', { method: 'clipboard_fallback', status: 'success' });
        }).catch(() => {
            execCommandCopyFallback(shareUrl);
        });
    } else {
        execCommandCopyFallback(shareUrl);
    }
}

function execCommandCopyFallback(text) {
    try {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast("🔗 Portfolio link copied to clipboard!");
        trackTelemetryEvent('share_click', { method: 'execCommand_fallback', status: 'success' });
    } catch (e) {
        showToast("🔗 Share URL: " + text);
    }
}

// 6.2 Visitor & Usage Telemetry Engine (Supabase PostgreSQL + Local JSON Vault)
function getOrCreateSessionId() {
    try {
        let sid = sessionStorage.getItem('hemanth_sess_id');
        if (!sid) {
            sid = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
            sessionStorage.setItem('hemanth_sess_id', sid);
        }
        return sid;
    } catch (e) {
        return 'sess_fallback_' + Date.now();
    }
}

function getDeviceType() {
    const ua = navigator.userAgent || '';
    const width = window.innerWidth || screen.width || 1200;
    if (/Mobi|Android|iPhone|iPod/i.test(ua) || width < 700) {
        return 'mobile';
    } else if (/iPad|Tablet/i.test(ua) || (width >= 700 && width <= 1024)) {
        return 'tablet';
    }
    return 'desktop';
}

function getBrowserName() {
    const ua = navigator.userAgent || '';
    if (ua.includes('Chrome') && !ua.includes('Edg/')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    return 'Other';
}

function trackTelemetryEvent(eventType, meta = {}) {
    try {
        const payload = {
            event_type: eventType,
            session_id: getOrCreateSessionId(),
            path: window.location.pathname + (window.location.hash || ''),
            referrer: document.referrer || 'direct',
            device_type: getDeviceType(),
            browser: getBrowserName(),
            meta: meta,
            created_at: new Date().toISOString()
        };

        const jsonStr = JSON.stringify(payload);
        if (navigator.sendBeacon) {
            const blob = new Blob([jsonStr], { type: 'application/json' });
            navigator.sendBeacon('/api/telemetry', blob);
        } else {
            fetch('/api/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: jsonStr,
                keepalive: true
            }).catch(() => {});
        }
    } catch (err) {
        // Silently catch telemetry errors to avoid interrupting UX
    }
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
        openEmbedModal('', 'llm-sla-telemetry');
    } else if (hash === '#preview/security-blast-radius') {
        openEmbedModal('', 'security-blast-radius');
    } else if (hash === '#preview/algo-trader') {
        openEmbedModal('', 'algo-trader');
    } else if (hash === '#preview/the-way-back') {
        openEmbedModal('', 'the-way-back');
    } else if (hash === '#preview/movie-analytics') {
        openEmbedModal('', 'movie-analytics');
    } else if (hash && !hash.startsWith('#preview')) {
        // Strip section hash (#projects, #experience, etc.) so URL stays clean
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
}

// Clean Section Navigation: Smooth scroll without mutating URL address bar with #section
function initCleanSectionNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetHash = this.getAttribute('href');
            if (!targetHash || targetHash === '#' || targetHash.startsWith('#preview')) return;

            const targetEl = document.querySelector(targetHash);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });

                // Ensure URL remains cleanly at root without #projects or #experience
                if (window.location.hash) {
                    history.replaceState(null, document.title, window.location.pathname + window.location.search);
                }
            }
        });
    });
}

window.addEventListener('hashchange', handleHashRouting);
window.addEventListener('DOMContentLoaded', () => {
    handleHashRouting();
    initCleanSectionNavigation();

    // Log initial visitor page view
    trackTelemetryEvent('page_view', {
        title: document.title,
        screen_size: `${window.innerWidth}x${window.innerHeight}`
    });

    // Delegate clicks on project card actions
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (!target) return;

        const projectCard = target.closest('.project-card');
        if (projectCard) {
            const projectTitle = projectCard.querySelector('.project-title')?.innerText || 'Project';
            const actionText = target.innerText.trim();
            if (actionText.includes('Preview') || actionText.includes('Explore') || actionText.includes('Dashboard') || actionText.includes('Architecture')) {
                trackTelemetryEvent('project_click', {
                    project: projectTitle.trim(),
                    action: actionText
                });
            }
        }
    });
});

// 6. Mobile Innovation Handlers (Arch Inspection, Scroll Utils)
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function inspectArchNode(el) {
    if (!el) return;
    document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('inspecting'));
    el.classList.add('inspecting');
    const nodeTitle = el.querySelector('h4')?.innerText || 'Architecture Node';
    showToast(`⚡ Inspected: ${nodeTitle} • 99.99% Lakehouse SLA`, 3000);
}

/* ==========================================================
   Harmonized Animation Suite Handlers
   ========================================================== */

// 1. Dynamic Hero Specialization Title Cycler
function initHeroTitleCycler() {
    const cyclerEl = document.getElementById('hero-title-cycler');
    if (!cyclerEl) return;

    const titles = [
        "Senior Data & AI Systems Engineer",
        "Lakehouse & Streaming Architect",
        "Real-Time Telemetry Specialist"
    ];

    let currentIndex = 0;

    setInterval(() => {
        cyclerEl.classList.add('switching-out');
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % titles.length;
            cyclerEl.innerText = titles[currentIndex];
            cyclerEl.classList.remove('switching-out');
            cyclerEl.classList.add('switching-in');
            
            // Force reflow and transition in
            void cyclerEl.offsetWidth;
            cyclerEl.classList.remove('switching-in');
        }, 400);
    }, 3800);
}

// 2. Executive Impact Scroll Counters
function initMetricCounters() {
    const metricElements = document.querySelectorAll('.metric-value[data-target]');
    if (!metricElements.length) return;

    let hasCounted = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounted) {
                hasCounted = true;
                metricElements.forEach(el => {
                    const target = parseInt(el.getAttribute('data-target'), 10);
                    const suffix = el.getAttribute('data-suffix') || '';
                    if (isNaN(target)) return;

                    let current = 0;
                    const duration = 1600; // ms
                    const stepTime = Math.max(Math.floor(duration / target), 35);
                    const increment = target > 50 ? Math.ceil(target / 40) : 1;

                    el.classList.add('counting');

                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                            el.innerText = `${current}${suffix}`;
                            setTimeout(() => el.classList.remove('counting'), 400);
                        } else {
                            el.innerText = `${current}${suffix}`;
                        }
                    }, stepTime);
                });
            }
        });
    }, { threshold: 0.35 });

    const impactStrip = document.querySelector('.metrics-impact-strip');
    if (impactStrip) {
        observer.observe(impactStrip);
    }
}

// 3. Apple-Style Viewport Scroll Reveals
function initScrollReveals() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// Global invocation when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initHeroTitleCycler();
        initMetricCounters();
        initScrollReveals();
        initSoundFX();
        window.projectsCarousel = new ProjectsCarousel();
    });
} else {
    initHeroTitleCycler();
    initMetricCounters();
    initScrollReveals();
    initSoundFX();
    window.projectsCarousel = new ProjectsCarousel();
}

/* ==========================================================
   Zero-Payload Web Audio API Micro-Synthesizer Engine
   ========================================================== */
let audioCtx = null;
let soundFXEnabled = false;

function initSoundFX() {
    // Restore preference if user previously opted in
    soundFXEnabled = localStorage.getItem('hemanth_sound_fx') === 'true';
    updateSoundUI();

    // Attach subtle acoustic feedback to key interactive controls
    document.addEventListener('click', (e) => {
        if (!soundFXEnabled) return;
        const target = e.target.closest('button, .filter-btn, .timeline-header, .theme-dot, .ai-chip-btn');
        if (target) {
            // Avoid double sound on sound toggle itself
            if (target.id === 'btn-sound-toggle' || target.classList.contains('btn-drawer-audio')) return;
            playMicroTone('click');
        }
    });

    // Keystroke sound in terminal CLI
    const termInput = document.getElementById('terminal-input');
    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (!soundFXEnabled) return;
            if (e.key === 'Enter') {
                playMicroTone('command');
            } else if (e.key.length === 1) {
                playMicroTone('tick');
            }
        });
    }
}

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function toggleAudioFX() {
    const ctx = getAudioContext();
    soundFXEnabled = !soundFXEnabled;
    localStorage.setItem('hemanth_sound_fx', soundFXEnabled ? 'true' : 'false');
    updateSoundUI();

    if (soundFXEnabled) {
        playMicroTone('enable');
        showToast("🔊 Audio FX Enabled (Linear/Raycast Synth)", 2500);
    } else {
        showToast("🔈 Audio FX Muted", 2000);
    }
}

function updateSoundUI() {
    const btn = document.getElementById('btn-sound-toggle');
    const drawerIcon = document.getElementById('drawer-sound-icon');
    const drawerLabel = document.getElementById('drawer-sound-label');
    const drawerBtn = document.querySelector('.btn-drawer-audio');

    if (soundFXEnabled) {
        if (btn) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-volume-up"></i> <span class="nav-btn-text">Audio</span>';
            btn.title = "Audio FX Enabled (Click to Mute)";
        }
        if (drawerIcon) drawerIcon.className = 'fas fa-volume-up';
        if (drawerLabel) drawerLabel.innerText = 'Audio Effects (On)';
        if (drawerBtn) drawerBtn.classList.add('active');
    } else {
        if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fas fa-volume-mute"></i> <span class="nav-btn-text">Audio</span>';
            btn.title = "Audio FX Muted (Click to Enable)";
        }
        if (drawerIcon) drawerIcon.className = 'fas fa-volume-mute';
        if (drawerLabel) drawerLabel.innerText = 'Audio Effects (Off)';
        if (drawerBtn) drawerBtn.classList.remove('active');
    }
}

function playMicroTone(type) {
    if (!soundFXEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'click') {
            // Soft modern UI blip (Linear style)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);
            gain.gain.setValueAtTime(0.045, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
            osc.start(now);
            osc.stop(now + 0.035);
        } else if (type === 'open') {
            // Futuristic modal activation sweep
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.065);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
            osc.start(now);
            osc.stop(now + 0.065);
        } else if (type === 'close') {
            // Subtle dismiss tone
            osc.type = 'sine';
            osc.frequency.setValueAtTime(540, now);
            osc.frequency.exponentialRampToValueAtTime(260, now + 0.045);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
            osc.start(now);
            osc.stop(now + 0.045);
        } else if (type === 'enable') {
            // Ascending major chord activation
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc.type = 'sine';
            osc2.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
            gain2.gain.setValueAtTime(0.06, now + 0.05);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

            osc.start(now);
            osc.stop(now + 0.12);
            osc2.start(now + 0.05);
            osc2.stop(now + 0.15);
        } else if (type === 'tick') {
            // Mechanical terminal keystroke tick
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(900, now);
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
            osc.start(now);
            osc.stop(now + 0.015);
        } else if (type === 'command') {
            // Terminal execute success chime
            osc.type = 'sine';
            osc.frequency.setValueAtTime(700, now);
            osc.frequency.exponentialRampToValueAtTime(1050, now + 0.05);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        }
    } catch (e) {
        console.warn('Audio tone error:', e);
    }
}

// 8-bit Web Audio Synthesizer: "Never Gonna Give You Up"
let rickrollTimeouts = [];

function stopRickRollSynth() {
    rickrollTimeouts.forEach(t => clearTimeout(t));
    rickrollTimeouts = [];
}

function playRickRollSynth() {
    const ctx = getAudioContext();
    if (!ctx) return;
    stopRickRollSynth();

    // Ensure audio is enabled and UI reflects active sound
    soundFXEnabled = true;
    localStorage.setItem('hemanth_sound_fx', 'true');
    updateSoundUI();

    // Notes: [Frequency, Duration in sec, Note Name]
    // Famous signature riff: "Never gonna give you up, never gonna let you down..."
    const notes = [
        // Intro hook
        { f: 392.00, d: 0.16 }, // G4
        { f: 440.00, d: 0.16 }, // A4
        { f: 523.25, d: 0.22 }, // C5
        { f: 440.00, d: 0.16 }, // A4
        { f: 659.25, d: 0.36 }, // E5
        { f: 659.25, d: 0.30 }, // E5
        { f: 587.33, d: 0.44 }, // D5 (Never gonna give you up)

        { f: 392.00, d: 0.16 }, // G4
        { f: 440.00, d: 0.16 }, // A4
        { f: 523.25, d: 0.22 }, // C5
        { f: 440.00, d: 0.16 }, // A4
        { f: 587.33, d: 0.36 }, // D5
        { f: 587.33, d: 0.30 }, // D5
        { f: 523.25, d: 0.22 }, // C5
        { f: 493.88, d: 0.22 }, // B4
        { f: 440.00, d: 0.44 }, // A4 (Never gonna let you down)

        { f: 392.00, d: 0.16 }, // G4
        { f: 440.00, d: 0.16 }, // A4
        { f: 523.25, d: 0.22 }, // C5
        { f: 440.00, d: 0.16 }, // A4
        { f: 523.25, d: 0.30 }, // C5
        { f: 587.33, d: 0.22 }, // D5
        { f: 493.88, d: 0.32 }, // B4
        { f: 440.00, d: 0.24 }, // A4
        { f: 392.00, d: 0.30 }, // G4
        { f: 392.00, d: 0.20 }, // G4
        { f: 587.33, d: 0.32 }, // D5
        { f: 523.25, d: 0.55 }, // C5 (Never gonna run around and desert you)
    ];

    let delay = 0;
    notes.forEach((n) => {
        const timeout = setTimeout(() => {
            try {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                // Warm chiptune synth wave
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(n.f, now);

                // Attack and Decay envelope
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + n.d - 0.02);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + n.d);
            } catch (err) {
                console.warn(err);
            }
        }, delay * 1000);

        rickrollTimeouts.push(timeout);
        delay += n.d + 0.035;
    });
}








