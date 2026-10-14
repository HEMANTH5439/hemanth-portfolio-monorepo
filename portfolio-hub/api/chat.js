// Vercel Serverless Function: Google Gemini Chatbot Proxy
// Features Dynamic Model Discovery & Self-Healing Model-Hopping (The Way Back pattern)

let cachedModels = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

const FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

async function getActiveGeminiModels(apiKey) {
  const envModel = process.env.GEMINI_MODEL;
  const now = Date.now();

  if (cachedModels && cachedModels.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return envModel ? [envModel, ...cachedModels.filter(m => m !== envModel)] : cachedModels;
  }

  if (!apiKey) {
    return envModel ? [envModel, ...FALLBACK_MODELS.filter(m => m !== envModel)] : FALLBACK_MODELS;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const supported = data.models
          .filter(m => 
            Array.isArray(m.supportedGenerationMethods) && 
            m.supportedGenerationMethods.includes("generateContent")
          )
          .map(m => String(m.name || '').replace(/^models\//, ''))
          // Prioritize low-token flash-lite models, then flash models
          .sort((a, b) => {
            const getPriority = (name) => {
              const lower = name.toLowerCase();
              if (lower.includes('lite') && lower.includes('flash')) return 3;
              if (lower.includes('lite')) return 2;
              if (lower.includes('flash')) return 1;
              return 0;
            };
            return getPriority(b) - getPriority(a);
          });

        if (supported.length > 0) {
          cachedModels = supported;
          lastFetchTime = now;
          return envModel ? [envModel, ...supported.filter(m => m !== envModel)] : supported;
        }
      }
    }
  } catch (err) {
    console.warn("[Gemini Model Discovery Warning] Failed to query dynamic models:", err);
  }

  return envModel ? [envModel, ...FALLBACK_MODELS.filter(m => m !== envModel)] : FALLBACK_MODELS;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Valid "message" string is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server' });
  }

  const systemInstruction = `You are the executive AI Assistant for Hemanth Chellam, a Senior Analytics & Data Engineer with 9+ years of experience delivering high-throughput ETL pipelines, big data architectures, and AI solutions at scale.
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
  - GitHub: github.com/HEMANTH5439`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      { parts: [{ text: message }] }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 350
    }
  };

  // Discover candidate models dynamically
  const candidateModels = await getActiveGeminiModels(apiKey);
  let replyText = null;
  let chosenModel = null;
  let lastErrorDetails = "";

  // Self-healing model-hopping loop
  for (const modelName of candidateModels.slice(0, 6)) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          replyText = candidate.trim();
          chosenModel = modelName;
          break;
        }
      } else {
        const errText = await response.text();
        console.warn(`[Model-Hopping] Model ${modelName} returned status ${response.status}: ${errText.slice(0, 100)}... Hopping to next model.`);
        lastErrorDetails = `Status ${response.status}: ${errText.slice(0, 100)}`;
      }
    } catch (err) {
      console.warn(`[Model-Hopping] Model ${modelName} fetch error: ${err.message}. Hopping to next model.`);
      lastErrorDetails = err.message;
    }
  }

  if (replyText && chosenModel) {
    return res.status(200).json({
      reply: replyText,
      model: chosenModel,
      source: 'gemini'
    });
  }

  return res.status(502).json({
    error: 'All discovered Gemini models failed or timed out',
    details: lastErrorDetails
  });
}
