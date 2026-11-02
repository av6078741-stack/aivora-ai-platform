# AIVORA AI

**One AI. Endless Possibilities.**

AIVORA AI is an all-in-one AI assistant with a premium, mobile-first interface. This release includes a working streaming AI chat with specialised assistants (writing, study, coding, translation, summarizing, ideas), voice input and read-aloud, local chat history, settings, help, and privacy pages. Image/video generation, website and app builders, file analysis, web research, accounts and more are on the roadmap in [PLAN.md](./PLAN.md) and are clearly marked **Planned** in the app.

## What works today

| Feature | Status | Needs |
| --- | --- | --- |
| AI Chat + Writing / Study / Coding / Translation / Summarizer / Ideas assistants | Live | An AI provider (Netlify AI Gateway works automatically on Netlify) |
| Streaming, stop, regenerate, edit & resend, copy, retry, Markdown & code blocks | Live | — |
| Chat history: search, pin, rename, delete, export (Markdown/JSON), clear | Live (this browser only) | — |
| Voice input (speech-to-text) | Browser | A browser with Web Speech API (Chrome, Edge, Safari) + mic permission |
| Read aloud (text-to-speech) | Browser | Browser speech synthesis |
| Settings, onboarding, help center, privacy, terms | Live | — |
| Feedback form | Live on Netlify | Netlify Forms (enabled) |
| Accounts, image/video generation, builders, uploads, research | Planned | See PLAN.md |

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routes, SSR) + Vite
- [TanStack AI](https://tanstack.com/ai) for provider-agnostic streaming chat (Anthropic, OpenAI, Gemini, Ollama)
- Tailwind CSS v4, lucide-react icons, Streamdown for safe Markdown rendering
- Netlify: AI Gateway, Image CDN (logo delivery), Forms (feedback)

## Run locally

```bash
pnpm install          # or npm install
netlify link          # link to your Netlify site so AI Gateway works locally
netlify dev           # http://localhost:8888
```

Without a linked site or provider keys, the app runs but chat shows a clear "not configured" message.

## Deploy to Netlify

1. Push this repository to GitHub/GitLab and import it in Netlify (or use `netlify deploy`).
2. Build settings come from `netlify.toml`: build command `vite build`, publish `dist/client`.
3. AI: Netlify AI Gateway is used automatically — no keys required. To use your own provider instead, set **server-side** environment variables in *Site configuration → Environment variables* (never in code or `netlify.toml`):

| Variable | Purpose |
| --- | --- |
| `AI_PROVIDER` | Optional: `anthropic`, `openai`, `gemini` or `ollama` |
| `AI_MODEL` | Optional model id (must be supported by the provider adapter) |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_BASE_URL` | Anthropic key / custom endpoint |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` | OpenAI (or OpenAI-compatible) key / endpoint |
| `GEMINI_API_KEY` / `GOOGLE_GEMINI_BASE_URL` | Google Gemini key / endpoint |
| `OLLAMA_HOST` | Self-hosted Ollama URL (with `AI_PROVIDER=ollama`) |

Keys are only read on the server (`src/lib/chat.server.ts`) and are never sent to the browser.

## Testing checklist (deployed site)

- [ ] Home loads with the AIVORA logo; favicon shows the logo mark.
- [ ] Send a prompt from home → chat streams a reply; Stop works mid-answer.
- [ ] Regenerate, Copy, Edit & resend, Read aloud (pause/resume/stop) work.
- [ ] Reload the page — the chat is still in Recent/History; rename, pin, export and delete (with confirmation) work.
- [ ] Each live tool (Writing, Study, Coding, Translation, Summarizer, Ideas) answers in its style.
- [ ] Planned tools show "Not available yet" with what they need — no fake output.
- [ ] Settings: theme, text size, reply language and voice persist after reload; Clear history works.
- [ ] Mic button: permission prompt appears; denying shows a clear error.
- [ ] Help search filters articles; feedback form submits and appears under *Forms* in Netlify.
- [ ] Mobile (≈360px): no horizontal scroll, menu slides out and closes with ✕ or Esc.
- [ ] Browser console has no errors.

## Replacing the logo

The provided artwork is in `public/brand/aivora-logo-full.png`; the cropped "A" mark is `public/brand/aivora-mark.png`, and app icons are `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`, `public/favicon.png`. Replace these files (same names) to update the branding everywhere.

## Roadmap

See [PLAN.md](./PLAN.md): accounts & synced history → rate limits, usage & plans → image generation → uploads (vision, PDFs, data) → research & math → workspace, assistants & builders → video, admin & offline.
