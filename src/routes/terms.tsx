import { Link, createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '@/components/LegalPage'

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: 'Terms of Service — AIVORA AI' }] }),
  component: TermsPage,
})

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="19 October 2026">
      <p>By using AIVORA AI you agree to these terms. If you don’t agree, please don’t use the service.</p>
      <h2>The service</h2>
      <p>AIVORA AI provides AI-generated text through an external AI provider. Features marked “Planned” are not yet available. The service is offered free of charge, as is, and may change or be unavailable at times.</p>
      <h2>AI output</h2>
      <p>Answers are generated automatically and can be inaccurate, incomplete or outdated. They are not professional legal, medical, financial or safety advice. Check important information yourself. AIVORA has not run or tested code it writes for you.</p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Don’t use AIVORA for anything illegal, harmful, harassing or deceptive.</li>
        <li>Don’t attempt to overload, probe, or bypass limits on the service.</li>
        <li>Don’t submit content you don’t have the right to share.</li>
      </ul>
      <h2>Your content</h2>
      <p>You keep ownership of what you write. Content you send is processed by the AI provider to generate replies, as described in the <Link to="/privacy">Privacy page</Link>.</p>
      <h2>Limits</h2>
      <p>To keep the service fair, request sizes are limited and usage limits may be applied.</p>
      <h2>Contact</h2>
      <p>Questions about these terms? Use the <Link to="/help" hash="feedback">feedback form</Link>.</p>
    </LegalPage>
  )
}
