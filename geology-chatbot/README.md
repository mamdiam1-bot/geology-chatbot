# Geology-chatbot (ready-to-deploy)

This package contains a minimal Node.js server and an embeddable widget to add a multilingual (Hebrew/English/Arabic) geology chatbot to your Google Site.

## What's included
- `server.js` - Express server that forwards chat messages to OpenAI and performs simple local FAQ retrieval.
- `public/embed.html` - embeddable chat iframe (the chat UI).
- `public/bubble.html` - floating bubble page: embed this page (or iframe it) and it will show a floating chat bubble that opens the chat.
- `kb/faqs.json` - small multilingual FAQ used for retrieval.
- `package.json` - dependencies and start script.

## Important security note
**Do NOT put your OpenAI API key in the code or commit it to GitHub.**
Set the environment variable `OPENAI_API_KEY` on your host (Render, Railway, etc).

## Quick deployment to Render.com (recommended)
1. Create a new GitHub repo and push the project, OR upload the project folder to Render via their web UI.
2. On Render: New -> Web Service -> Connect your repo.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add env var:
   - `OPENAI_API_KEY` = (your secret key from OpenAI)
   - (optional) `OPENAI_MODEL` = e.g. `gpt-4o-mini`
6. Deploy. You will get a URL like `https://your-app.onrender.com`.

## How to embed in your Google Site
Option A — Floating bubble (recommended):
1. Host the site files on Render so `bubble.html` is available at `https://your-app.onrender.com/bubble.html`.
2. In Google Sites: Insert -> Embed -> Embed code -> paste:
   <iframe src="https://your-app.onrender.com/bubble.html" width="360" height="600"></iframe>

Option B — Fixed chat window:
1. Use `embed.html` directly:
   <iframe src="https://your-app.onrender.com/embed.html" width="100%" height="520"></iframe>

## Where to put the API key
On Render (or similar hosts) there is a section for Environment Variables — set `OPENAI_API_KEY` there. Do not paste it into client HTML.

## Next steps I can do for you (choose one)
- Add indexing of your Google Site pages and semantic search (embeddings + Pinecone) for more accurate site-specific answers.
- Implement conversation history per visitor (cookie-based).
- Customize the assistant prompt to match your site's tone and curriculum.