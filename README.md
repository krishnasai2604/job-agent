# ⚡ JobAgent — AI-Powered Job Application Agent

> Automatically finds real jobs on Indeed & Dice, scores them against your resume, and writes tailored cover letters using Claude AI.

![JobAgent Demo](https://img.shields.io/badge/Status-Active-34d399?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude_AI-Anthropic-cc785c?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🚀 What It Does

Upload your resume PDF → AI reads it → searches real Indeed & Dice job listings → scores each job against your skills → writes a personalized cover letter for every job you want to apply to.

**No more copy-pasting. No more generic cover letters. Just apply.**

---

## ✨ Features

- 📄 **Smart Resume Parsing** — Upload any PDF resume, Claude AI extracts your name, title, skills and location automatically
- 🔍 **Real Job Search** — Searches Indeed and Dice for live current job listings (requires SerpAPI key)
- 🎯 **AI Match Scoring** — Each job is scored 0–100 for fit against your actual resume
- ✍️ **Tailored Cover Letters** — Claude writes a unique, specific cover letter for each job in seconds
- 🔗 **Direct Apply Links** — One-click opens Indeed, Dice and LinkedIn search for each exact job
- 📊 **Application Tracking** — Tracks which jobs you have applied to in the session

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| AI | Anthropic Claude API (claude-haiku-4-5) |
| PDF Parsing | pdf-parse |
| Job Search | SerpAPI (Indeed + Dice) |
| Frontend | Vanilla HTML/CSS/JS |
| Styling | Custom dark UI |

---

## 📦 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/job-agent.git
cd job-agent
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your keys:
```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
SERPAPI_KEY=your-serpapi-key-here
```

### 4. Start the server
```bash
node server.js
```

### 5. Open the app
Open `job-agent.html` in your browser. The header shows **"Server ✓"** when connected.

---

## 🔑 API Keys Required

| Key | Where to get | Cost |
|-----|-------------|------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | ~$0.01 per resume parse |
| `SERPAPI_KEY` | [serpapi.com](https://serpapi.com) | 100 free searches/month |

> **Without SerpAPI key:** App still works but shows curated sample jobs instead of live listings.

---

## 🖥 How It Works

```
┌─────────────────────────────────────────────────────────┐
│                      User Flow                          │
├─────────────────────────────────────────────────────────┤
│  1. Upload PDF Resume                                   │
│     └─> pdf-parse extracts raw text                    │
│         └─> Claude AI parses name, title, skills       │
│                                                         │
│  2. Search Jobs                                         │
│     └─> SerpAPI queries Indeed + Dice                  │
│         └─> Claude scores each job 0-100               │
│             └─> Jobs sorted by match score             │
│                                                         │
│  3. Apply to a Job                                      │
│     └─> Claude writes tailored cover letter            │
│         └─> User reviews and edits                     │
│             └─> Opens Indeed/Dice/LinkedIn search      │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
job-agent/
├── server.js          # Express backend — resume parsing, job search, cover letters
├── job-agent.html     # Frontend — complete single-file UI
├── package.json       # Dependencies
├── .env               # API keys (never commit this!)
├── .env.example       # Template for API keys
└── README.md          # This file
```

---

## 🔒 Environment Variables

```env
# Required
ANTHROPIC_API_KEY=     # Claude AI for resume parsing and cover letters

# Optional — enables real Indeed/Dice job results
SERPAPI_KEY=           # SerpAPI for live job search
```

---

## 🤝 Contributing

Pull requests are welcome! Here are some ideas for improvements:

- [ ] Add LinkedIn job search
- [ ] Save applications to a database
- [ ] Email notifications when new matching jobs appear
- [ ] Chrome extension for one-click apply on job sites
- [ ] Multiple resume profiles support
- [ ] Export cover letters as PDF

---

## 📄 License

MIT License — free to use, modify and distribute.

---

## 👨‍💻 Built With

- [Anthropic Claude](https://anthropic.com) — AI resume parsing and cover letter generation
- [SerpAPI](https://serpapi.com) — Real-time Indeed and Dice job search
- [Express.js](https://expressjs.com) — Backend server
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) — PDF text extraction

---

<div align="center">
  <strong>⚡ Built to make job hunting smarter, faster and less painful.</strong>
</div>
