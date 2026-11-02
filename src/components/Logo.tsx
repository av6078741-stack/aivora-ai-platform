import { Link } from '@tanstack/react-router'

/** Image CDN URL for a brand asset in /public/brand. */
export const brandImage = (file: string, width: number) =>
  `/.netlify/images?url=/brand/${file}&w=${width}&fm=webp&q=85`

/** The official AIVORA "A" orbital mark, cropped from the provided logo. */
export function LogoMark({
  size = 36,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <img
      src={brandImage('aivora-mark.png', size * 2)}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      decoding="async"
      className={`rounded-xl object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

/** Mark + wordmark lockup used in the sidebar and top bars. */
export function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 rounded-xl"
      aria-label="AIVORA AI home"
    >
      <LogoMark size={compact ? 32 : 38} />
      {!compact && (
        <span className="font-display text-[1.05rem] font-semibold tracking-[0.14em]">
          AIVORA <span className="text-gradient">AI</span>
        </span>
      )}
    </Link>
  )
}

/** The full provided logo artwork (mark, wordmark and tagline). */
export function LogoFull({
  size = 320,
  className = '',
  eager = false,
}: {
  size?: number
  className?: string
  eager?: boolean
}) {
  return (
    <img
      src={brandImage('aivora-logo-full.png', size * 2)}
      width={size}
      height={size}
      alt="AIVORA AI — One AI. Endless Possibilities."
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-contain ${className}`}
    />
  )
}
