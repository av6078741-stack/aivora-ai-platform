import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Code2, Languages, Lightbulb, PenLine, Sigma } from 'lucide-react'

import { Composer } from '@/components/Composer'
import { LogoFull } from '@/components/Logo'
import { StatusBadge } from '@/components/StatusBadge'
import { accentClass, getTool } from '@/lib/tools'
import type { AssistantMode } from '@/lib/assistant-modes'

const suggestions: { label: string; prompt: string; mode: AssistantMode; icon: typeof BookOpen }[] = [
  { label: 'Explain a difficult topic', prompt: 'Explain black holes in simple words, with an everyday analogy.', mode: 'study', icon: BookOpen },
  { label: 'Write professional content', prompt: 'Write a professional email asking my manager for a meeting to discuss my project progress.', mode: 'writing', icon: PenLine },
  { label: 'Help me write code', prompt: 'Write a Python script that reads a CSV file and prints the average of a numeric column.', mode: 'coding', icon: Code2 },
  { label: 'Translate a sentence', prompt: 'Translate to Hindi, formal and informal: "Could you please help me with this?"', mode: 'translate', icon: Languages },
  { label: 'Brainstorm a business idea', prompt: 'Brainstorm 8 low-cost online business ideas for a college student, with a first step for each.', mode: 'ideas', icon: Lightbulb },
  { label: 'Solve a maths question', prompt: 'Solve step by step and explain each step: 3x + 7 = 2x − 5', mode: 'study', icon: Sigma },
]

const quickAccess = ['chat', 'image', 'video', 'website', 'app', 'coding', 'study', 'writing', 'docs', 'voice']

function Home() {
  const [input, setInput] = useState('')
  const navigate = useNavigate()

  const start = (text: string, mode: AssistantMode = 'chat') =>
    navigate({ to: '/chat', search: { q: text, mode, new: Date.now() } })

  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div className="grid-faint pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden />

      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-8 pb-10 text-center sm:pt-12">
        <div className="animate-fade-up relative">
          <div className="absolute inset-6 -z-10 rounded-full bg-blue/30 blur-3xl" aria-hidden />
          <LogoFull size={200} eager className="h-[150px] w-[150px] rounded-3xl sm:h-[200px] sm:w-[200px]" />
        </div>

        <h1
          className="font-display animate-fade-up mt-6 text-[2.1rem] leading-[1.1] font-semibold tracking-tight sm:text-5xl"
          style={{ animationDelay: '60ms' }}
        >
          Your Intelligence.
          <br />
          <span className="text-gradient">Your Universe.</span>
        </h1>
        <p
          className="animate-fade-up mt-4 max-w-xl text-base text-muted sm:text-lg"
          style={{ animationDelay: '120ms' }}
        >
          One place for ideas, answers, learning, coding, and creativity.
        </p>

        <div className="animate-fade-up mt-8 w-full text-left" style={{ animationDelay: '180ms' }}>
          <Composer
            value={input}
            onChange={setInput}
            onSubmit={(text) => start(text)}
            large
            autoFocus
            label="Ask AIVORA AI anything"
            placeholder="Ask anything, or describe what you want to create…"
          />
        </div>

        <ul className="animate-fade-up mt-5 flex flex-wrap justify-center gap-2" style={{ animationDelay: '240ms' }} aria-label="Suggested prompts">
          {suggestions.map((s) => (
            <li key={s.label}>
              <button
                onClick={() => start(s.prompt, s.mode)}
                className="flex min-h-10 items-center gap-2 rounded-full border border-line-strong bg-surface/70 px-3.5 text-sm text-muted backdrop-blur transition hover:border-blue/50 hover:text-ink"
              >
                <s.icon className="h-4 w-4 text-cyan" />
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16" aria-labelledby="quick-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="quick-title" className="font-display text-xl font-semibold">
              Create with AIVORA
            </h2>
            <p className="mt-1 text-sm text-muted">
              Live tools work now. Planned tools are on the roadmap and clearly marked.
            </p>
          </div>
          <Link to="/tools" className="hidden shrink-0 items-center gap-1 text-sm text-cyan hover:underline sm:flex">
            All tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickAccess.map((id) => {
            const tool = getTool(id)!
            const label =
              id === 'image' ? 'Create Image' : id === 'video' ? 'Create Video' : id === 'website' ? 'Build Website' : id === 'app' ? 'Build App' : id === 'docs' ? 'PDF Assistant' : tool.name
            return (
              <li key={id}>
                <Link
                  to="/tools/$toolId"
                  params={{ toolId: id }}
                  className="card-hover flex h-full flex-col rounded-2xl border border-line bg-surface/80 p-4 backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${accentClass[tool.accent]}`}>
                      <tool.icon className="h-5 w-5" />
                    </span>
                    <StatusBadge status={tool.status} small />
                  </div>
                  <p className="mt-3 text-sm font-semibold">{label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{tool.tagline}</p>
                </Link>
              </li>
            )
          })}
        </ul>
        <Link to="/tools" className="mt-4 flex items-center justify-center gap-1 text-sm text-cyan sm:hidden">
          See all tools <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
})
