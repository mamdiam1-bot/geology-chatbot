/*
Simple Node/Express server for Geology Chatbot.
SECURITY: Do NOT put your OpenAI API key in this repo. Set OPENAI_API_KEY as an environment variable on the host.
Run: npm install && node server.js
*/
const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  console.error('ERROR: Please set OPENAI_API_KEY in environment variables.');
  process.exit(1);
}

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.use(rateLimit({ windowMs: 60*1000, max: 60 }));

let faq = [];
try {
  faq = JSON.parse(fs.readFileSync('./kb/faqs.json', 'utf8'));
} catch (e) {
  console.warn('No KB found or failed to parse ./kb/faqs.json');
}

function retrieveRelevantDocs(question) {
  if (!faq || !faq.length) return [];
  const q = question.toLowerCase();
  const words = q.split(/\W+/).filter(Boolean);
  const hits = faq.filter(f => {
    const txt = ((f.q || '') + ' ' + (f.a || '')).toLowerCase();
    return words.some(w => txt.includes(w));
  });
  return hits.slice(0,5);
}

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages missing or wrong format' });
    const last = messages[messages.length-1]?.content || '';
    const docs = retrieveRelevantDocs(last);
    let systemPrompt = "You are a helpful assistant specialized in geology and the content of the geology-info site. Keep answers concise and friendly. If the user asks in Hebrew or Arabic, answer in that language.";

    if (docs.length) {
      systemPrompt += "\\n\\nRelevant facts from the site's local FAQ:\\n" + docs.map(d => `Q: ${d.q}\\nA: ${d.a}`).join('\\n---\\n');
    }

    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 800,
      temperature: 0.2
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('OpenAI error', resp.status, txt);
      return res.status(500).json({ error: 'OpenAI API error', details: txt });
    }
    const data = await resp.json();
    const assistantMessage = data.choices?.[0]?.message || { role: 'assistant', content: '' };
    res.json({ assistant: assistantMessage, usage: data.usage || null });
  } catch (err) {
    console.error('Server error', err);
    res.status(500).json({ error: 'server error' });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));