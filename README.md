# 🧠 Spelling-dle

A daily online spelling challenge 
Spell 10 words of increasing difficulty, hear them read aloud, and share your score. Built with **React**, **Vite**, and **Text-to-Speech (TTS)**.


---

## 🚀 Features

- 🎯 10 new words every day with definitions & example sentences
- 🔊 Text-to-Speech integration 
- ✅ Letter-by-letter feedback for correct/incorrect letters
- 📊 Progress bar to track your word streak
- 📋 Shareable results 
- 🗓 Detects if you've already played today
- 🌐 Fully deployable and domain-linked via Render + GoDaddy

---

## 🧱 Tech Stack

- **Frontend:** React + Vite
- **Backend Script:** Node.js + OpenAI (GPT-4o-mini)
- **Hosting:** Render (Static Site + Cron Job)
- **Domain:** GoDaddy
- **TTS:** Web Speech API (`SpeechSynthesisUtterance`)

```
Project Structure

spelling-dle/
├── client/                     # React frontend (Vite)
│   ├── public/
│   │   ├── words/              # Daily word lists (e.g., 2024-03-27.json)
│   │   └── preview.png         # Social share image (optional)
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── ProgressBar.jsx
│   │   │   └── SentenceSpeaker.jsx
│   │   ├── App.jsx             # Main game logic
│   │   ├── styles.css          # App styling
│   │   └── main.jsx            # React app entry point
│   └── vite.config.js          # Vite configuration
├── server/                     # Word generation backend (cron job)
│   ├── generateDailyWords.js   # OpenAI-powered script
│   ├── commitGeneratedWords.js # Git commit + push script
│   └── usedWords.json          # Tracks last 60 days of used words
├── .env                        # Contains OPENAI_API_KEY (not committed)
├── .gitignore                  # Ignores .env, node_modules, etc.
├── README.md                   # Project documentation
├── package.json                # Root Node deps (optional)
└── render.yaml                 # (Optional) Render deploy config
```

## ⚙️ Local Setup

```bash
# Clone the repo
git clone https://github.com/your-username/spelling-dle.git
cd spelling-dle

# Install frontend
cd client
npm install
npm run dev
```

Word generation requires OPENAI API key.

☁️ Deployment (Render)
Frontend: Deployed as a Static Site in /client

Cron Job: Set up as a Background Worker running generateDailyWords.js daily at 6am UTC

Environment Variable: Add OPENAI_API_KEY to your cron job service

🤖 AI Integration
Word generation uses OpenAI (GPT-4o-mini) to create:

15 candidate words daily

Definitions and sample sentences

Deduplicates used words from past 60 days

Ensures unique fresh content every day

📋 License
MIT — feel free to remix and build your own version!

🙌 Acknowledgments
OpenAI

Render

Vite

GoDaddy

Web Speech API
