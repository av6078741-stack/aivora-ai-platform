import { Link, createFileRoute } from '@tanstack/react-router'
import { StatusBadge } from '@/components/StatusBadge'
import { accentClass, tools } from '@/lib/tools'
import type { ToolStatus } from '@/lib/tools'

const groups: { status: ToolStatus; title: string; note: string }[] = [
  { status: 'live', title: 'Available now', note: 'Powered by the AIVORA AI chat backend.' },
  { status: 'browser', title: 'Uses your browser', note: 'Runs on built-in browser features; support varies by device.' },
  { status: 'planned', title: 'On the roadmap', note: 'Not available yet — each needs the service listed before it can go live.' },
]

function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">AI Tools</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Every AIVORA tool in one place. We only mark a tool as live when it actually works.
      </p>
      {groups.map((g) => {
        const list = tools.filter((t) => t.status === g.status)
        return (
          <section key={g.status} className="mt-9" aria-labelledby={`group-${g.status}`}>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 id={`group-${g.status}`} className="font-display text-lg font-semibold">{g.title}</h2>
              <p className="text-xs text-faint">{g.note}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((t) => (
                <li key={t.id}>
                  <Link
                    to="/tools/$toolId"
                    params={{ toolId: t.id }}
                    className={`card-hover flex h-full gap-4 rounded-2xl border border-line bg-surface/80 p-4 ${t.status === 'planned' ? 'opacity-90' : ''}`}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${accentClass[t.accent]}`}>
                      <t.icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{t.name}</p>
                        <StatusBadge status={t.status} small />
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{t.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export const Route = createFileRoute('/tools/')({
  head: () => ({ meta: [{ title: 'AI Tools — AIVORA AI' }] }),
  component: ToolsPage,
})
