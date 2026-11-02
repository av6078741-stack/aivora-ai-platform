import type { ToolStatus } from '@/lib/tools'

const labels: Record<ToolStatus, string> = {
  live: 'Live',
  browser: 'Browser',
  planned: 'Planned',
}

const styles: Record<ToolStatus, string> = {
  live: 'bg-success/12 text-success ring-1 ring-success/25',
  browser: 'bg-cyan/10 text-cyan ring-1 ring-cyan/25',
  planned: 'bg-surface-2 text-faint ring-1 ring-line-strong',
}

export function StatusBadge({
  status,
  className = '',
  small = false,
}: {
  status: ToolStatus
  className?: string
  small?: boolean
}) {
  return (
    <span
      className={`badge ${styles[status]} ${small ? '!px-1.5 !text-[0.6rem]' : ''} ${className}`}
      title={
        status === 'planned'
          ? 'On the roadmap — not available yet'
          : status === 'browser'
            ? 'Runs with your browser’s built-in features'
            : 'Available now'
      }
    >
      {status === 'live' && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      )}
      {labels[status]}
    </span>
  )
}
