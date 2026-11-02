import { useEffect } from 'react'
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import '../styles.css'
import { AppShell } from '@/components/AppShell'
import { Toaster } from '@/components/Toaster'
import { Onboarding } from '@/components/Onboarding'
import { LogoMark } from '@/components/Logo'
import { useSettings } from '@/lib/store'

const siteName = 'AIVORA AI — One AI. Endless Possibilities.'
const siteDescription =
  'AIVORA AI is an all-in-one AI assistant for chat, writing, study, coding, translation and ideas — with image, video, website and app creation on the way.'

// Applies saved theme and font size before first paint to avoid a flash.
const bootScript = `try{var s=JSON.parse(localStorage.getItem('aivora.settings.v1')||'{}');var t=s.theme||'dark';if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.dataset.font=s.fontSize||'md'}catch(e){}`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      { title: siteName },
      { name: 'description', content: siteDescription },
      { name: 'theme-color', content: '#04060f' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: 'AIVORA AI' },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/icon-512.png' },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-font="md" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  const settings = useSettings()

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const theme =
        settings.theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : settings.theme
      root.dataset.theme = theme
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', theme === 'dark' ? '#04060f' : '#f5f7ff')
    }
    apply()
    root.dataset.font = settings.fontSize
    if (settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.theme, settings.fontSize])

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <Onboarding />
      <Toaster />
    </>
  )
}

function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-20 text-center">
      <LogoMark size={56} />
      <h1 className="font-display mt-5 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">
        The page you are looking for doesn’t exist or has moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  )
}
