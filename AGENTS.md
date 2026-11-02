# AIVORA AI — agent guide

AIVORA AI is a TanStack Start (React 19) app deployed on Netlify. Milestone 1 (branded UI + working AI chat) is complete. **Continue from [PLAN.md](./PLAN.md)** — pick the next unchecked milestone, and when it ships update `status`/`milestone` in `src/lib/tools.ts`, the Help articles in `src/routes/help.tsx`, and the Privacy page if data storage changes.

## Architecture

- `src/routes/` — file routes. `__root.tsx` (head, theme boot script, AppShell/Onboarding/Toaster), `index.tsx` (home), `chat.tsx` (search params `c`, `q`, `mode`, `new`), `tools/index.tsx`, `tools/$toolId.tsx` (live / browser / planned tool pages), `history.tsx`, `settings.tsx`, `help.tsx`, `privacy.tsx`, `terms.tsx`, `api.chat.ts` (POST endpoint).
- `src/lib/chat.server.ts` — the only place provider keys are read. Validates the AG-UI request with zod, enforces size limits, picks the provider adapter, streams SSE. `forwardedProps` may carry `provider`, `model`, `mode`, `language` — all validated.
- `src/lib/assistant-modes.ts` — server-side system prompts per mode and the reply-language list. The client sends only ids, never prompt text.
- `src/lib/ai-hook.ts` — `useAIChat({ id, mode, language, initialMessages })`; `id` is passed as `threadId` (TanStack AI's client identity — changing it creates a new client).
- `src/lib/store.ts` + `local-store.ts` — localStorage stores for conversations (`aivora.conversations.v1`) and settings (`aivora.settings.v1`) via `useSyncExternalStore`. Milestone 2 should swap conversations to Netlify Database behind the same function names.
- `src/lib/tools.ts` — single registry of every tool (status, milestone, requirements, prompts). Sidebar, home cards and tool pages read from it.
- `src/lib/speech.ts` — Web Speech API voice input, speech synthesis, chime.
- `src/components/` — `AppShell` (sidebar, mobile drawer, top bar), `ChatView`, `Composer`, `Dialog`/`ConfirmDialog` (native `<dialog>`), `Logo`, `Toaster`, `StatusBadge`, `FeedbackForm`, `LegalPage`.
- `public/brand/` — official logo files; served via Netlify Image CDN (`brandImage()` in `Logo.tsx`). `public/feedback-form.html` registers the Netlify form.

## Conventions

- Honesty rules from the product owner: never fake AI output, images, search results, usage counts, or success messages. Planned features must say "Planned" and what they need.
- Theme tokens live in `src/styles.css` (`--bg`, `--cyan`, `--blue`, `--violet`, …) exposed to Tailwind as `bg-bg`, `text-muted`, `border-line`, etc. Use `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.icon-btn`, `.field`, `.badge`.
- Fonts: Sora (`font-display`) for headings, Manrope body, JetBrains Mono code.
- Browser APIs only in effects/handlers; pages reading localStorage render after mount or via the store's server snapshot.
- Touch targets ≥ 40px, visible focus rings, `prefers-reduced-motion` respected, labels on every icon button.
- Keep TypeScript 6 (TS 7 breaks the Netlify adapter build). Don't commit secrets.
