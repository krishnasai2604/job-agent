import express from "express";
import cors from "cors";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";
import fetch from "node-fetch";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

const upload = multer({ storage: multer.memoryStorage() });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function extractPdfText(buffer) {
  const mod = await import("pdf-parse");
  const pdfParse = mod.default || mod;
  const data = await pdfParse(buffer);
  return data.text.trim();
}

async function parseResume(text) {
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [{ role: "user", content: `Extract from this resume. Return ONLY raw JSON no markdown:\n{"name":"","title":"most recent job title","skills":["skill1"],"location":"city, state","years_experience":0}\n\nResume:\n${text.slice(0, 4000)}` }]
  });
  const raw = msg.content[0].text;
  try {
    const clean = raw.replace(/^```(?:json)?\s*/im, "").replace(/\s*```\s*$/im, "").trim();
    return JSON.parse(clean);
  } catch {
    const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
    if (s !== -1 && e > s) return JSON.parse(raw.slice(s, e + 1));
    return { name: "Candidate", title: "Software Engineer", skills: [], location: "" };
  }
}

async function scoreJobs(jobs, profile) {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001", max_tokens: 500,
      messages: [{ role: "user", content: `Score each job 0-100 for fit.\nCandidate: ${profile.title}, Skills: ${profile.skills?.join(", ")}\nJobs:\n${jobs.map(j => `${j.id}: ${j.title} at ${j.company}`).join("\n")}\nReturn ONLY JSON array: [{"id":"...","score":85,"reason":"1 sentence"}]` }]
    });
    const raw = msg.content[0].text;
    const scores = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1));
    scores.forEach(({ id, score, reason }) => {
      const j = jobs.find(x => x.id === id);
      if (j) { j.matchScore = score; j.matchReason = reason; }
    });
  } catch {
    jobs.forEach((j, i) => { j.matchScore = 90 - i * 5; });
  }
  return jobs;
}

async function generateCoverLetter(job, resumeText) {
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001", max_tokens: 900,
    messages: [{ role: "user", content: `Write a professional cover letter. Start with "Dear Hiring Manager," no date or address. 3 paragraphs, specific to the role.\n\nResume:\n${resumeText.slice(0, 3000)}\n\nJob: ${job.title} at ${job.company}\n${job.description?.slice(0, 500) || ""}` }]
  });
  return msg.content[0].text;
}

function mockJobs(query, location) {
  const loc = location || "Remote";
  return [
    { id: "m1", title: query, company: "Stripe",     location: loc,      salary: "$140k-$180k", description: "Build payment infrastructure used by millions of businesses worldwide.", applyUrl: "https://stripe.com/jobs",              source: "Indeed" },
    { id: "m2", title: query, company: "Shopify",    location: "Remote", salary: "$130k-$165k", description: "Help power commerce for millions of merchants. Full-stack role.",         applyUrl: "https://www.shopify.com/careers",     source: "Indeed" },
    { id: "m3", title: query, company: "Twilio",     location: "Remote", salary: "$125k-$158k", description: "Build developer-facing APIs and communication tools at scale.",           applyUrl: "https://www.twilio.com/company/jobs", source: "Indeed" },
    { id: "m4", title: query, company: "Datadog",    location: loc,      salary: "$145k-$185k", description: "Work on observability platform used by thousands of engineering teams.",  applyUrl: "https://www.datadoghq.com/jobs",      source: "Dice"   },
    { id: "m5", title: query, company: "HashiCorp",  location: "Remote", salary: "$135k-$170k", description: "Infrastructure automation tools used by Fortune 500 companies.",          applyUrl: "https://www.hashicorp.com/jobs",      source: "Dice"   },
    { id: "m6", title: query, company: "Cloudflare", location: loc,      salary: "$132k-$168k", description: "Work on network infrastructure powering millions of websites.",           applyUrl: "https://www.cloudflare.com/careers",  source: "Indeed" },
  ];
}

app.get("/health", (req, res) => res.json({ status: "ok", anthropic: !!process.env.ANTHROPIC_API_KEY, serpapi: !!process.env.SERPAPI_KEY }));

app.post("/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    console.log(`[parse-resume] ${req.file.originalname}`);
    const text = await extractPdfText(req.file.buffer);
    if (text.length < 50) return res.status(400).json({ error: "Could not extract text from PDF" });
    const profile = await parseResume(text);
    console.log(`[parse-resume] OK: ${profile.name}`);
    res.json({ profile, resumeText: text });
  } catch (e) {
    console.error("[parse-resume]", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/search-jobs", async (req, res) => {
  const { query, location, profile, resumeText } = req.body;
  if (!query) return res.status(400).json({ error: "query required" });
  try {
    console.log(`[search-jobs] "${query}"`);
    let jobs = mockJobs(query, location);
    if (process.env.SERPAPI_KEY) {
      const params = new URLSearchParams({ engine: "indeed", q: query, l: location || "Remote", api_key: process.env.SERPAPI_KEY, num: "10" });
      const r = await fetch(`https://serpapi.com/search?${params}`);
      const d = await r.json();
      if (d.jobs_results?.length) {
        jobs = d.jobs_results.map((j, i) => ({ id: j.job_id || `s${i}`, title: j.title, company: j.company_name, location: j.location, salary: j.salary || "", description: j.description || j.snippet || "", applyUrl: j.related_links?.[0]?.link || `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}`, source: "Indeed", postedAt: j.detected_extensions?.posted_at || "" }));
      }
    }
    if (profile) jobs = await scoreJobs(jobs, profile);
    jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    res.json({ jobs });
  } catch (e) {
    console.error("[search-jobs]", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/cover-letter", async (req, res) => {
  const { job, resumeText } = req.body;
  if (!job || !resumeText) return res.status(400).json({ error: "job and resumeText required" });
  try {
    const letter = await generateCoverLetter(job, resumeText);
    res.json({ letter });
  } catch (e) {
    console.error("[cover-letter]", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ JobAgent server running at http://localhost:${PORT}`);
  console.log(`   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "✓ set" : "✗ missing — edit .env!"}`);
  console.log(`   SERPAPI_KEY:       ${process.env.SERPAPI_KEY ? "✓ set (real Indeed results)" : "✗ not set (mock jobs)"}`);
  console.log(`\n   Open job-agent.html in your browser.\n`);
});
