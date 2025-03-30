// server/commitGeneratedWords.js
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WORDS_DIR = path.join(ROOT, 'client', 'public', 'words');

const runCommand = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

async function run() {
  const dateStr = getTodayDateString();
  const filename = `${dateStr}.json`;
  const filepath = path.join(WORDS_DIR, filename);

  // Step 1: Generate today's words
  console.log('📦 Running generateDailyWords...');
  const { generateWords } = await import('./generateDailyWords.js');
  await generateWords();

  // Step 2: Check if file was created
  if (!fs.existsSync(filepath)) {
    console.error(`❌ File not found: ${filepath}`);
    process.exit(1);
  }

  // Step 3: Git commit + push
  runCommand('git pull');
  runCommand(`git add -A ${filepath} ${path.join(__dirname, 'usedWords.json')}`);
  runCommand(`git commit -m "📅 Add daily word list for ${dateStr}"`);
  runCommand(`git push https://${process.env.GH_PAT}@github.com/${process.env.GH_REPO}.git main`);
}

run().catch(err => {
  console.error("❌ Script failed:", err);
});
