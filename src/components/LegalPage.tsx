import type { ReactNode } from 'react'

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-1 text-xs text-faint">Last updated {updated}</p>
      <div className="prose-aivora mt-6 text-[0.95rem] text-muted [&_h2]:text-ink">{children}</div>
    </article>
  )
}
