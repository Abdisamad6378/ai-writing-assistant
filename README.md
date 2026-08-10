# AI Writing Assistant

A full-stack AI content generator that produces blog posts, emails, social media posts, and academic papers from a topic or brief. Users can control the tone and length, regenerate content with the same or different settings, refine results through a multi-turn chat conversation, and save drafts to PostgreSQL for later access.

Powered by Google Gemini (Google GenAI SDK) on the backend with a React + Vite + Tailwind frontend.

## Features

- **Content generation** — Generate blog posts, emails, social media posts, and academic papers from a topic or brief.
- **Tone selection** — Choose from three tones: `formal`, `casual`, or `persuasive`.
- **Length control** — Pick a `short` (150-250 words), `medium` (400-600 words), or `long` (800-1200 words) output.
- **Regenerate** — Re-run generation with the same settings or change tone/length on the fly, reusing the original topic.
- **Conversation history** — Multi-turn refinement: send follow-up messages (e.g. "make it shorter", "add a call-to-action") to iterate on the generated content.
- **Save drafts** — Persist generated content to PostgreSQL and browse, preview, and delete saved drafts at any time.
- **Extras** — Export content as Markdown, copy to clipboard, and track token usage per generation.

## Tech Stack

| Layer      | Technology                                                       |
|------------|------------------------------------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS 4, oxlint                            |
| Backend    | Node.js, Express 5                                                |
| AI         | Google Gemini via `@google/genai`                                 |
| Database   | PostgreSQL 16 (`node-postgres` / `pg`)                            |

## Project Structure

```
.
├── server.js          # Express API: generate, chat, regenerate, drafts
├── llm.js             # Gemini client wrapper (generateResponse)
├── prompts.js         # System prompts, tone descriptions, length config
├── db.js              # PostgreSQL pool + queries for drafts
├── package.json       # Backend dependencies & scripts
├── server/.env        # GEMINI_API_KEY, DATABASE_URL, PORT (gitignored)
└── client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                    # App shell, tabs, state
        └── components/
            ├── GenerateForm.jsx       # Topic / type / tone / length form
            ├── ContentDisplay.jsx     # Output, save draft, regenerate, export
            ├── ChatPanel.jsx          # Multi-turn refinement
            └── DraftList.jsx          # Saved drafts browser
```

## Prerequisites

- Node.js 20+ (built and tested on Node 24)
- PostgreSQL running locally (with an empty database created)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

## Setup

### 1. Install dependencies

```bash
# Backend (project root)
npm install

# Frontend
cd client
npm install
cd ..
```

### 2. Configure environment variables

Create `server/.env` from the sample below:

```
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgres://user:password@localhost:5432/ai_writing
PORT=3001
```

- `GEMINI_API_KEY` — required; the app calls Gemini for all generation.
- `DATABASE_URL` — PostgreSQL connection string. If your database uses a Unix socket, use the socket form, e.g. `postgres://user@/ai_writing?host=/var/run/postgresql`.
- `PORT` — optional, defaults to `3001`.

The `drafts` table is created automatically on first startup via `db.js` (`initDb`).

### 3. Start the servers

```bash
# Terminal 1 — API server (project root)
npm run dev          # or: npm start

# Terminal 2 — frontend (client directory)
cd client
npm run dev
```

- API server: `http://localhost:3001`
- Frontend: `http://localhost:5173` (default Vite port)

Open the frontend URL, enter a topic, pick type/tone/length, and click **Generate Content**.

## API Reference

All endpoints accept JSON and live under `http://localhost:3001`. The frontend calls these directly (CORS is enabled).

### `GET /api/health`

Health check.

```json
{ "status": "ok" }
```

### `POST /api/generate`

Generate content from a topic/brief.

Body:

```json
{
  "topic": "Benefits of mobile banking for small businesses in Kenya",
  "contentType": "blog",
  "tone": "casual",
  "length": "medium",
  "provider": "gemini"
}
```

`contentType`: `blog | email | social | academic` (default `blog`)
`tone`: `formal | casual | persuasive` (default `casual`)
`length`: `short | medium | long` (default `medium`)
`provider`: optional, currently only `gemini` is supported.

Response:

```json
{
  "content": "...",
  "conversationId": "uuid",
  "provider": "gemini",
  "model": "gemini-3.5-flash-lite",
  "usage": { "promptTokens": 0, "completionTokens": 0, "totalTokens": 0 },
  "finished": "...",
  "settings": { "contentType": "blog", "tone": "casual", "length": "medium" }
}
```

### `POST /api/regenerate`

Regenerate content for an existing conversation with the same or different settings. Reuses the conversation's original topic unless `topic` is provided.

Body:

```json
{
  "conversationId": "uuid",
  "tone": "persuasive",
  "length": "long"
}
```

Any of `topic`, `contentType`, `tone`, `length`, `provider` may be omitted to keep the previous value. Response has the same shape as `/api/generate`.

### `POST /api/chat`

Send a follow-up message to refine content in a multi-turn conversation.

Body:

```json
{
  "conversationId": "uuid",
  "message": "Make it shorter and add a call-to-action"
}
```

Conversations are stored in-memory and reset when the server restarts.

### Drafts

Full CRUD using the `drafts` table in PostgreSQL.

| Method   | Endpoint           | Description                          |
|----------|--------------------|--------------------------------------|
| `POST`   | `/api/drafts`      | Save a draft (requires `title`, `content`) |
| `GET`    | `/api/drafts`      | List all drafts, newest first        |
| `GET`    | `/api/drafts/:id`  | Fetch a single draft                 |
| `PATCH`  | `/api/drafts/:id`  | Update a draft's content             |
| `DELETE` | `/api/drafts/:id`  | Delete a draft                       |

Example save:

```json
{
  "title": "Mobile banking blog",
  "content": "...",
  "contentType": "blog",
  "tone": "casual",
  "topic": "Mobile banking",
  "provider": "gemini",
  "model": "gemini-3.5-flash-lite",
  "tokensUsed": 823
}
```

## NPM Scripts

Backend (project root):

| Script      | Description                            |
|-------------|----------------------------------------|
| `npm start` | Run the API server with Node           |
| `npm run dev` | Run with Nodemon for auto-reload     |

Frontend (`client/`):

| Script      | Description                            |
|-------------|----------------------------------------|
| `npm run dev` | Start the Vite dev server            |
| `npm run build` | Build production bundle to `client/dist` |
| `npm run lint` | Run oxlint over the client source     |
| `npm run preview` | Preview the production build        |

## Notes & Limitations

- Only Google Gemini is supported as the provider (see `llm.js`, `DEFAULT_PROVIDER`).
- The default Gemini model is configured in `llm.js` (`DEFAULT_MODELS.gemini`).
- Conversation history is stored in-memory (a `Map` in `server.js`), so it does not survive server restarts. Only drafts are persisted to PostgreSQL.
- The generated output is treated as plain text throughout the UI.

## License

Not specified.