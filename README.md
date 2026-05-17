# JobAgent — Real Job Application Tool

Upload your resume → AI parses it → searches real Indeed + Dice listings → generates tailored cover letters → opens apply page.

## Setup (5 minutes)

### 1. Install Node.js
Download from https://nodejs.org (v18 or higher)

### 2. Install dependencies
```bash
cd job-agent-real
npm install
```

### 3. Set your API keys
Edit the `.env` file:

```
ANTHROPIC_API_KEY=sk-ant-...    # Required — https://console.anthropic.com
SERPAPI_KEY=...                  # Optional — https://serpapi.com (100 free searches/month)
```

**Without SERPAPI_KEY:** App works but shows curated sample jobs instead of live Indeed results.
**With SERPAPI_KEY:** Shows real current Indeed + Dice job listings.

### 4. Start the server
```bash
node server.js
# or with auto-restart on changes:
node --watch server.js
```

You'll see:
```
✅ JobAgent server running at http://localhost:3001
   ANTHROPIC_API_KEY: ✓ set
   SERPAPI_KEY:       ✓ set (real Indeed results)
```

### 5. Open the app
Open `job-agent.html` in your browser (Chrome/Safari/Firefox).

The header will show **"Server + SerpAPI ✓"** when everything is connected.

---

## How it works

1. **Upload PDF** → server extracts text using pdf.js, Claude parses name/title/skills
2. **Search** → hits Indeed and Dice via SerpAPI, returns real listings
3. **AI scoring** → Claude scores each job 0–100 against your resume
4. **Apply** → Claude writes a tailored cover letter, you review/edit, click Submit
5. **Auto-open** → clicking Submit opens the real job listing in a new tab

## Getting a free SerpAPI key

1. Go to https://serpapi.com
2. Sign up (free tier = 100 searches/month)
3. Copy your API key from the dashboard
4. Paste it in `.env`

## Troubleshooting

**"Server offline" in the app**
→ Make sure you ran `node server.js` and it shows the green ✅ message

**"No file uploaded" error**  
→ Make sure the file is a real PDF (not a scanned image PDF)

**Jobs not showing real Indeed listings**
→ Add SERPAPI_KEY to your .env file and restart the server
