import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronDown, Search } from 'lucide-react'
import { FeedbackForm } from '@/components/FeedbackForm'

export const Route = createFileRoute('/help')({
  head: () => ({ meta: [{ title: 'Help & Feedback — AIVORA AI' }] }),
  component: HelpPage,
})

const articles: { category: string; q: string; a: string }[] = [
  { category: 'Getting started', q: 'What is AIVORA AI?', a: 'AIVORA AI is an all-in-one assistant. Today you can chat, write, study, code, translate, summarize and brainstorm, with voice input and read-aloud in supported browsers. Image, video, website and app creation, file analysis and web research are on the roadmap and are labelled “Planned” in the app.' },
  { category: 'Getting started', q: 'Do I need an account?', a: 'No. AIVORA currently runs in guest mode. Accounts with synced history are planned for the next release.' },
  { category: 'AI chat', q: 'How do I start a new chat?', a: 'Press “New Chat” in the top bar or sidebar from any screen. You can also type on the home page or pick a suggested prompt.' },
  { category: 'AI chat', q: 'How do I stop, regenerate, copy or edit?', a: 'While an answer is being written, press Stop. Under any answer you can Copy, Regenerate or Read aloud. Under your own message, use the pencil to edit it and resend — the conversation continues from that point.' },
  { category: 'AI chat', q: 'Which tool should I use?', a: 'Each assistant (Writing, Study, Coding, Translation, Summarizer, Ideas) sends the same chat to the AI with specialised instructions. Open one from AI Tools and its chats are labelled with that tool.' },
  { category: 'AI chat', q: 'Can I choose the reply language?', a: 'Yes. Go to Settings → Language & chat → Reply language. “Same as my message” replies in whatever language you write, including Hindi and Hinglish.' },
  { category: 'Chat history', q: 'Where are my chats saved?', a: 'In this browser’s local storage only. They are not uploaded to an AIVORA account. Clearing site data, using private browsing, or switching devices means they won’t be there.' },
  { category: 'Chat history', q: 'How do I search, pin, rename, export or delete chats?', a: 'Open History from the sidebar. Search by keyword, pin chats to keep them in Saved Chats, rename them, export to Markdown, or delete with confirmation. The same actions are in the header of an open chat.' },
  { category: 'Chat history', q: 'Can I turn off history?', a: 'Yes. Settings → Chat history & data → turn off “Save chat history on this device”. You can also export or clear all chats there.' },
  { category: 'Voice', q: 'Voice input doesn’t work', a: 'Voice input uses your browser’s speech recognition. It works in recent Chrome, Edge and Safari. If you see a permission error, allow microphone access in the browser’s site settings and try again. The mic button is hidden when the browser doesn’t support it.' },
  { category: 'Voice', q: 'How do I change the read-aloud voice?', a: 'Settings → Voice. Pick a speech language, a voice installed on your device, and speaking speed.' },
  { category: 'Files & images', q: 'Can I upload images or PDFs?', a: 'Not yet. Uploads, image analysis and document Q&A are planned (milestone 5). Until then, you can paste text into the Text Summarizer.' },
  { category: 'Files & images', q: 'Can AIVORA generate images or videos?', a: 'Not yet. Image generation is planned for milestone 4 and video for milestone 8. We don’t show placeholder images pretending to be generated.' },
  { category: 'Integrations', q: 'How is the AI connected?', a: 'Requests go to AIVORA’s server endpoint, which calls the configured AI provider. On Netlify this uses Netlify AI Gateway automatically, or your own keys set as server environment variables. API keys are never sent to the browser. See the README for setup.' },
  { category: 'Common errors', q: '“Chat is not configured”', a: 'The server has no AI provider available. The site owner needs to enable Netlify AI Gateway or set provider keys — see the README.' },
  { category: 'Common errors', q: '“The conversation is too large”', a: 'Very long chats exceed the request size limit. Start a new chat, optionally pasting a summary of the old one.' },
  { category: 'Common errors', q: 'Network or provider errors', a: 'Check your connection and press Retry under the failed answer. If the provider is busy or rate-limited, wait a moment and retry.' },
  { category: 'Privacy & security', q: 'Who sees my messages?', a: 'Your messages are sent to the AI provider to generate an answer. Don’t share passwords, financial details or other sensitive information. Read the Privacy page for details.' },
]

function HelpPage() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const results = q
    ? articles.filter((a) => `${a.q} ${a.a} ${a.category}`.toLowerCase().includes(q))
    : articles
  const categories = [...new Set(results.map((a) => a.category))]

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Help center</h1>
      <p className="mt-1 text-sm text-muted">Answers about how AIVORA works today.</p>

      <label className="relative mt-6 block">
        <span className="sr-only">Search help articles</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
        <input type="search" className="field !py-3 !pl-10" placeholder="Search help (e.g. voice, history, error)" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>

      {results.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">
          No articles match “{query}”. Try another word, or send us feedback below.
        </p>
      ) : (
        categories.map((cat) => (
          <section key={cat} className="mt-8" aria-labelledby={`cat-${cat}`}>
            <h2 id={`cat-${cat}`} className="mb-2 text-xs font-semibold tracking-[0.12em] text-faint uppercase">{cat}</h2>
            <div className="space-y-2">
              {results.filter((a) => a.category === cat).map((a) => (
                <details key={a.q} className="group rounded-2xl border border-line bg-surface/70 open:border-line-strong" open={Boolean(q)}>
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
                    {a.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-faint transition group-open:rotate-180" />
                  </summary>
                  <p className="px-4 pb-4 text-sm leading-relaxed text-muted">{a.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))
      )}

      <section id="feedback" className="mt-12 rounded-3xl border border-line bg-surface/70 p-5 sm:p-6" aria-labelledby="feedback-h">
        <h2 id="feedback-h" className="font-display text-lg font-semibold">Send feedback</h2>
        <p className="mt-1 mb-4 text-sm text-muted">Report a bug, request a feature, or ask a question.</p>
        <FeedbackForm />
      </section>

      <p className="mt-8 text-center text-xs text-faint">
        <Link to="/privacy" className="hover:text-muted">Privacy Policy</Link> · <Link to="/terms" className="hover:text-muted">Terms of Service</Link>
      </p>
    </div>
  )
}
