import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const USED_WORDS_FILE = './usedWords.json';
const WORDS_OUTPUT_DIR = '../client/public/words';

const getUsedWords = () => {
  try {
    if (!fs.existsSync(USED_WORDS_FILE)) return [];
    const raw = fs.readFileSync(USED_WORDS_FILE, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn("⚠️ Failed to read usedWords.json — defaulting to empty.");
    return [];
  }
};


const isRecentlyUsed = (word, usedWords, days = 30) => {
  const entry = usedWords.find(w => w.word.toLowerCase() === word.toLowerCase());
  if (!entry) return false;
  const usedDate = new Date(entry.usedOn);
  const now = new Date();
  const diff = (now - usedDate) / (1000 * 60 * 60 * 24);
  return diff <= days;
};

const saveUsedWords = (newWords) => {
  const today = getTodayDateString();
  const current = getUsedWords();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const recent = current.filter(entry => {
    const usedDate = new Date(entry.usedOn);
    return usedDate >= cutoff;
  });

  const todayEntries = newWords.map(word => ({
    word: word.word,
    usedOn: today
  }));

  const combined = [...recent, ...todayEntries];

  fs.writeFileSync(USED_WORDS_FILE, JSON.stringify(combined, null, 2));
  console.log(`✅ Updated usedWords.json with ${todayEntries.length} words. New total: ${combined.length}`);
};

function extractJsonArray(text) {
  try {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    const jsonChunk = text.slice(start, end + 1).trim();
    return JSON.parse(jsonChunk);
  } catch (err) {
    console.error("❌ Failed to extract or parse JSON from LLM content.");
    console.log("🧾 Raw content:\n", text);
    throw err;
  }
}


export async function generateWords() {
  try {
    const usedWords = getUsedWords();
    const today = getTodayDateString();

    // STEP 1: Generate initial candidates
    const initialPrompt = `
Generate a list of 15 English words, increasing in spelling difficulty from easy to hard.
Ramp up difficulty fast but stay around a medium to hard level for a few before going very hard for the last few.
Use more obscure words for the hardest levels. Avoid short words.
For each word, provide:
- the word itself
- a brief definition
- a sentence using the word
Return ONLY a JSON array like this:
[
  { "word": "cat", "definition": "a small domesticated carnivorous mammal", "sentence": "My cat loves the scratching post." },
  ...
]
`;

    const initialResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: initialPrompt }],
      temperature: 0.7,
    });

    let initialWords;
    try {
      initialWords = extractJsonArray(initialResponse.choices[0].message.content);
    } catch {
      throw new Error("⚠️ Failed to parse initial LLM JSON.", initialResponse.choices[0].message.content);
    }

    // STEP 2: Filter out reused words
    const isUsed = (word) => isRecentlyUsed(word.word, usedWords);
    let freshWords = initialWords.filter(w => !isUsed(w));
    const conflicts = initialWords.filter(isUsed);

 // STEP 3–4: Retry loop until we have at least 10 fresh words
 let attempt = 0;
 const maxAttempts = 5;

 while (freshWords.length < 10 && conflicts.length > 0 && attempt < maxAttempts) {
   attempt++;
   const conflictList = conflicts.map(w => w.word).join(', ');

   const fixPrompt = `
The following words have already been used recently in a spelling game and must be replaced:
${conflictList}

Please return a new JSON array of ${conflicts.length} brand new English spelling bee words with increasing difficulty (roughly), along with short definitions and sentences.
Avoid short words and try and make the words uncomon.
Format:
[
{ "word": "newword", "definition": "...", "sentence": "..." },
...
]
`;

   const fixResponse = await openai.chat.completions.create({
     model: "gpt-4o-mini",
     messages: [{ role: "user", content: fixPrompt }],
     temperature: 0.7,
   });

   console.log(`🔁 Replacement attempt ${attempt}:`);
   console.log(fixResponse.choices[0].message.content);

   let replacementWords;
   try {
    replacementWords = extractJsonArray(fixResponse.choices[0].message.content);
   } catch {
     throw new Error(`⚠️ Failed to parse replacement JSON on attempt ${attempt}.`);
   }

   const replacementFiltered = replacementWords.filter(w => !isUsed(w));
   freshWords = [...freshWords, ...replacementFiltered].slice(0, 10);
   conflicts.length = 0; // Clear out conflicts — avoid asking again with the same list
 }

 if (freshWords.length < 10) {
   throw new Error("❌ Still not enough unique words after multiple replacement attempts.");
 }

 // Step 4.5: Delete yesterday's word list if it exists
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];
const yesterdayPath = path.join(WORDS_OUTPUT_DIR, `${yesterdayStr}.json`);

if (fs.existsSync(yesterdayPath)) {
  fs.unlinkSync(yesterdayPath);
  console.log(`🗑️ Deleted yesterday's word list: ${yesterdayPath}`);
}


    // STEP 5: Save final result
    const todayWords = freshWords.slice(0, 10);
    const outputPath = path.join(WORDS_OUTPUT_DIR, `${today}.json`);

    if (!fs.existsSync(WORDS_OUTPUT_DIR)) {
      fs.mkdirSync(WORDS_OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(todayWords, null, 2));
    saveUsedWords(todayWords);
    console.log(`✅ Saved fresh word list to ${outputPath}`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}
// Add this to allow the script to run directly OR be imported
if (process.argv[1] === new URL(import.meta.url).pathname) {
  generateWords();
}

