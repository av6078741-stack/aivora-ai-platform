import { Link, createFileRoute } from '@tanstack/react-router'
import { Database, Globe2, Mail, ServerCog } from 'lucide-react'
import { LegalPage } from '@/components/LegalPage'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Privacy — AIVORA AI' }] }),
  component: PrivacyPage,
})

const facts = [
  { icon: Database, title: 'Chat history', text: 'Stored only in your browser (local storage). Not on an AIVORA server.' },
  { icon: ServerCog, title: 'AI processing', text: 'Each message you send, plus the earlier messages in that chat, goes to the AI provider to generate a reply.' },
  { icon: Globe2, title: 'Voice', text: 'Speech recognition is handled by your browser, which may use its own online service.' },
  { icon: Mail, title: 'Feedback', text: 'Feedback form entries (and email, if you add one) are stored by Netlify Forms.' },
]

function PrivacyPage() {
  return (
    <LegalPage title="Privacy & data" updated="19 October 2026">
      <div className="not-prose mb-8 grid gap-3 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.title} className="rounded-2xl border border-line bg-surface/70 p-4">
            <f.icon className="h-5 w-5 text-cyan" />
            <p className="mt-2 text-sm font-semibold text-ink">{f.title}</p>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </div>
        ))}
      </div>

      <h2>What AIVORA stores</h2>
      <p>AIVORA currently has no user accounts. Your conversations and preferences are saved in your browser’s local storage on this device so you can reopen them. Clearing your browser’s site data, using private browsing, or switching devices removes or hides them. You can turn history saving off, export, or delete chats at any time in <Link to="/settings">Settings</Link>.</p>

      <h2>What is sent to the server</h2>
      <p>When you send a message, the conversation so far is sent over HTTPS to AIVORA’s chat endpoint, which forwards it to an external AI provider (through Netlify AI Gateway, or a provider configured by the site owner) to generate a reply. AIVORA’s server does not save the conversation. The AI provider processes it under its own terms and may keep request logs for a limited time for abuse monitoring. Hosting infrastructure (Netlify) may keep standard technical logs.</p>

      <h2>What we don’t do</h2>
      <ul>
        <li>No advertising or tracking cookies.</li>
        <li>Fonts are loaded from Google Fonts, which receives your IP address as part of the request.</li>
        <li>No selling of personal data.</li>
        <li>API keys are kept on the server and never sent to your browser.</li>
      </ul>

      <h2>Please avoid sharing sensitive data</h2>
      <p>Don’t paste passwords, card numbers, government ID numbers or private health details into chats. AI answers can be wrong; check important information.</p>

      <h2>Deleting your data</h2>
      <p>Deleting a chat or clearing history removes it from this browser immediately. Because nothing is kept on an AIVORA server, there is no server copy to delete. Data already processed by the AI provider is handled under that provider’s retention policy. To remove feedback you sent, contact us through the <Link to="/help" hash="feedback">feedback form</Link>.</p>

      <h2>Changes</h2>
      <p>When accounts, file uploads and saved projects are added, this page will be updated to explain exactly what is stored server-side and how to delete it.</p>
    </LegalPage>
  )
}
