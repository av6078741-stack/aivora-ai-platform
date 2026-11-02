import { useEffect, useState } from 'react'
import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, Clock3, Mic, Volume2, XCircle } from 'lucide-react'

import { Composer } from '@/components/Composer'
import { NewChatButton } from '@/components/NewChatButton'
import { StatusBadge } from '@/components/StatusBadge'
import { accentClass, getTool } from '@/lib/tools'
import type { Tool } from '@/lib/tools'

// While a planned tool is being built, point people at what already works.
const meanwhile: Record<string, { text: string; toolId: string }> = {
  image: { text: 'Use the Writing Assistant to craft a detailed image prompt in the meantime.', toolId: 'writing' },
  video: { text: 'Use the Writing Assistant to write a scene-by-scene video script.', toolId: 'writing' },
  website: { text: 'The Coding Assistant can already draft HTML, CSS and JavaScript for a page.', toolId: 'coding' },
  app: { text: 'The Coding Assistant can plan screens and write React components today.', toolId: 'coding' },
  vision: { text: 'You can describe the image in AI Chat and ask questions about it.', toolId: 'chat' },
  docs: { text: 'Paste document text into the Text Summarizer to get key points now.', toolId: 'summarize' },
  data: { text: 'Paste a small table into AI Chat for a quick explanation (not exact calculations).', toolId: 'chat' },
  research: { text: 'AI Chat answers from its training knowledge — it cannot browse or cite live sources yet.', toolId: 'chat' },
  math: { text: 'The Study Assistant explains maths step by step today.', toolId: 'study' },
}

export const Route = createFileRoute('/tools/$toolId')({
  loader: ({ params }) => {
    const tool = getTool(params.toolId)
    if (!tool) throw notFound()
    return { toolId: tool.id }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${getTool(loaderData?.toolId)?.name ?? 'Tool'} — AIVORA AI` }],
  }),
  component: ToolPage,
})

function ToolPage() {
  const { toolId } = Route.useLoaderData()
  const tool = getTool(toolId)!
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <Link to="/tools" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All tools
      </Link>
      <div className="mt-5 flex items-start gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${accentClass[tool.accent]}`}>
          <tool.icon className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{tool.name}</h1>
            <StatusBadge status={tool.status} />
          </div>
          <p className="mt-2 text-muted">{tool.description}</p>
        </div>
      </div>
      {tool.status === 'live' && <LiveTool tool={tool} />}
      {tool.status === 'browser' && <VoiceTool />}
      {tool.status === 'planned' && <PlannedTool tool={tool} />}
    </div>
  )
}

function LiveTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState('')
  const navigate = useNavigate()
  const go = (q: string) =>
    navigate({ to: '/chat', search: { q, mode: tool.mode, new: Date.now() } })
  return (
    <div className="mt-8">
      <Composer
        value={input}
        onChange={setInput}
        onSubmit={go}
        large
        autoFocus
        label={`Ask the ${tool.name}`}
        placeholder={`What do you need from the ${tool.name}?`}
      />
      {tool.prompts && (
        <>
          <p className="mt-7 mb-2 text-xs font-semibold tracking-[0.12em] text-faint uppercase">Try one of these</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {tool.prompts.map((p) => (
              <li key={p}>
                <button
                  onClick={() => (p.endsWith('\n\n') ? setInput(p) : go(p))}
                  className="card-hover h-full w-full rounded-2xl border border-line bg-surface/70 px-4 py-3 text-left text-sm text-muted hover:text-ink"
                >
                  {p.trim()}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <NewChatButton mode={tool.mode} className="btn-ghost mt-6">
        Open an empty {tool.name} chat
      </NewChatButton>
    </div>
  )
}

function VoiceTool() {
  const [support, setSupport] = useState<{ stt: boolean; tts: boolean } | null>(null)
  useEffect(() => {
    const w = window as any
    setSupport({
      stt: Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition),
      tts: 'speechSynthesis' in window,
    })
  }, [])
  const row = (ok: boolean | undefined, icon: typeof Mic, title: string, detail: string) => {
    const Icon = icon
    return (
      <li className="flex gap-3 rounded-2xl border border-line bg-surface/70 p-4">
        <Icon className="mt-0.5 h-5 w-5 text-cyan" />
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="mt-0.5 text-sm text-muted">{detail}</p>
        </div>
        {ok === undefined ? null : ok ? (
          <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-4 w-4" /> Supported here</span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-danger"><XCircle className="h-4 w-4" /> Not supported here</span>
        )}
      </li>
    )
  }
  return (
    <div className="mt-8">
      <ul className="space-y-3">
        {row(support?.stt, Mic, 'Voice input (speech-to-text)', 'Tap the microphone in any chat box and speak. Your browser will ask for microphone permission. Works best in Chrome, Edge and Safari.')}
        {row(support?.tts, Volume2, 'Read answers aloud (text-to-speech)', 'Use the speaker button under any AI answer, with pause, resume and stop. Choose a voice and speed in Settings.')}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        <NewChatButton className="btn-primary">Start a voice chat</NewChatButton>
        <Link to="/settings" hash="voice" className="btn-ghost">Voice settings</Link>
      </div>
      <p className="mt-4 text-xs text-faint">
        Some browsers send audio to their own speech service to transcribe it. AIVORA only receives the resulting text when you press send.
      </p>
    </div>
  )
}

function PlannedTool({ tool }: { tool: Tool }) {
  const alt = meanwhile[tool.id]
  const altTool = alt ? getTool(alt.toolId) : undefined
  return (
    <div className="mt-8 space-y-4">
      <div className="flex gap-3 rounded-2xl border border-line-strong bg-surface/80 p-5">
        <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-violet" />
        <div>
          <p className="font-semibold">Not available yet</p>
          <p className="mt-1 text-sm text-muted">
            This tool is planned for milestone {tool.milestone} of the AIVORA roadmap. It isn’t simulated —
            it will appear here once it is connected to a real provider and tested.
          </p>
          {tool.requires && (
            <p className="mt-3 text-sm">
              <span className="text-faint">Needs: </span>
              {tool.requires}
            </p>
          )}
        </div>
      </div>
      {alt && altTool && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/60 p-5 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-muted">{alt.text}</p>
          <Link
            to="/tools/$toolId"
            params={{ toolId: altTool.id }}
            className="btn-ghost shrink-0"
          >
            Open {altTool.name}
          </Link>
        </div>
      )}
    </div>
  )
}
