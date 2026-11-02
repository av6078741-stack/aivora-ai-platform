# AIVORA AI — Product roadmap

AIVORA AI is a large, multi-part platform. It is being delivered in small, self-contained milestones so each piece is real and tested before it's labelled live. Tools that aren't ready yet are visibly marked **Planned** in the app (driven by `status`/`milestone` in `src/lib/tools.ts`). Update that file whenever a milestone ships.

## ✅ Milestone 1 — Branded product surface + core chat (done)

- Official AIVORA logo throughout (sidebar, top bar, home hero, onboarding, chat avatar, favicon, PWA icons).
- Home: headline, large prompt box, suggested prompts, quick-access tool cards.
- AI Chat with streaming, stop, regenerate from any answer, edit & resend, copy, read-aloud, timestamps, retry on error, Markdown/tables/code blocks.
- Assistant modes with server-side prompts: Writing, Study, Coding, Translation, Summarizer, Ideas. Reply-language preference.
- Local (browser) history: search, pin/saved, rename, delete with confirmation, Markdown/JSON export, clear all, history on/off.
- Voice input (Web Speech API) and text-to-speech with voice/speed/language settings.
- Settings (theme, text size, language, Enter-to-send, sounds, voice, data), searchable Help center with Netlify Forms feedback, Privacy and Terms pages, first-run onboarding, PWA manifest.

## Milestone 2 — Accounts and synced history

- Netlify Identity: sign up, sign in, sign out, password reset, profile, account deletion.
- Netlify Database tables: `conversations`, `messages` scoped by user id; migrate local chats on first sign-in (with consent).
- Server endpoints that check the session and only return the caller's data.
- Update Privacy page to describe server storage and deletion.

## Milestone 3 — Abuse protection, usage and plans

- Per-IP and per-user rate limiting on `/api/chat` (Netlify rate-limit rules or a counter in the database), with clear 429 messages.
- Usage dashboard: requests used / remaining / reset time from real counters.
- Free vs Premium plan comparison + upgrade screen (no payments until a real provider such as Stripe is connected and verified).
- Model picker showing only models the server actually allows (default, fast, reasoning, coding, vision, creative), validated server-side.

## Milestone 4 — Image Generator

- Gemini image model via Netlify AI Gateway in a server route.
- Prompt, supported sizes/styles, preview, download, regenerate, prompt editing, history (Netlify Blobs for files + DB rows), delete.

## Milestone 5 — Uploads: Image Analysis, PDF/Document Assistant, Data Analysis

- Upload UI with type/size validation, progress and user-initiated upload; files in Netlify Blobs scoped per user.
- Vision Q&A and OCR via a vision-capable model.
- Server-side PDF/DOCX text extraction, document Q&A, notes.
- CSV/Excel parsing with real calculations, table preview, charts, exportable reports.

## Milestone 6 — Web Research and Math tools

- Research mode with a real search API (requires key, e.g. Brave/Tavily); cite only retrieved sources with links and dates.
- Deterministic calculator, percentage and unit conversion; step-by-step explanations by the model.

## Milestone 7 — Workspace, projects, custom assistants, memory

- Projects with their own chats, notes, files and project instructions (opt-in context).
- Custom assistants (name, icon, instructions, style, model) + example assistants.
- Saved outputs, document creation and export (TXT, MD, PDF, DOCX, CSV, XLSX).
- Optional long-term memory with review/edit/delete and an off switch.
- Website and App Builder: structured multi-file generation, code editor with file explorer, sandboxed preview iframe, ZIP export.

## Milestone 8 — Video generation, admin, offline

- Video generation via a paid external provider with background jobs and real status polling.
- Protected admin panel: usage, errors, rate-limit hits, provider configuration status.
- Service worker with an offline screen (UI only — AI requires a connection).
