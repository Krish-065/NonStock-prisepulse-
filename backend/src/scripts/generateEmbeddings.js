const fs = require('fs');
const path = require('path');

// Load environment variables from backend root directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY is not defined in your environment variables (.env).');
  process.exit(1);
}

const kbPath = path.join(__dirname, '../knowledge_base/trading_kb.json');
const storePath = path.join(__dirname, '../knowledge_base/vector_store.json');

// Check if kb exists
if (!fs.existsSync(kbPath)) {
  console.error(`❌ Error: Knowledge base file not found at: ${kbPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(kbPath, 'utf8');
const kbItems = JSON.parse(rawData);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getEmbedding(text) {
  if (!GEMINI_API_KEY) {
    throw new Error('No API Key');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: {
        parts: [{ text: text }]
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const vector = data?.embedding?.values;
  if (!vector || !Array.isArray(vector)) {
    throw new Error(`Invalid embedding response structure`);
  }
  return vector;
}

async function run() {
  console.log(`🚀 Starting pre-computation of vector embeddings for ${kbItems.length} trading articles...`);
  const vectorStore = [];
  let useFallback = false;

  for (let i = 0; i < kbItems.length; i++) {
    const item = kbItems[i];
    const textToEmbed = `Title: ${item.title}\nCategory: ${item.category}\nContent: ${item.content}`;
    
    if (useFallback) {
      vectorStore.push({ ...item, embedding: [] });
      continue;
    }

    console.log(`[${i + 1}/${kbItems.length}] Embedding: "${item.title}"...`);
    
    try {
      const embedding = await getEmbedding(textToEmbed);
      vectorStore.push({
        ...item,
        embedding: embedding
      });
      // Small sleep to respect rate limits
      await sleep(400);
    } catch (err) {
      console.warn(`\n⚠️ Warning: Failed to generate embedding for "${item.title}":`, err.message);
      console.warn(`👉 Switching to fallback mode. Writing vector_store.json with placeholder empty embeddings. The backend will use keyword similarity matching at runtime.\n`);
      useFallback = true;
      vectorStore.push({ ...item, embedding: [] });
    }
  }

  console.log(`💾 Saving generated vector store containing ${vectorStore.length} items to: ${storePath}`);
  fs.writeFileSync(storePath, JSON.stringify(vectorStore, null, 2), 'utf8');
  console.log('✅ Embeddings generation script finished!');
}

run().catch(err => {
  console.error('❌ Critical script execution error:', err);
  process.exit(1);
});
