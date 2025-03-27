# 🧠 Spelling-dle

A daily online spelling challenge 
Spell 10 words of increasing difficulty, hear them read aloud, and share your score. Built with **React**, **Vite**, and **Text-to-Speech (TTS)**.

![screenshot](public/preview.png) <!-- Optional: add a screenshot to public folder -->

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

---

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
