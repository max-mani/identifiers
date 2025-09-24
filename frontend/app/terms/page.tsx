import { Navigation } from "@/components/navigation"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert">
        <h1>Terms of Service</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          By using RTI Assistant, you agree to these Terms of Service. This product is
          provided to help draft RTI applications. It does not provide legal advice.
        </p>
        <h2>Use of Service</h2>
        <p>
          You agree to use the service responsibly and comply with applicable laws. Do not
          submit content that is unlawful, harmful, or violates others&apos; rights.
        </p>
        <h2>Accounts</h2>
        <p>
          You are responsible for safeguarding your account and promptly notifying us of any
          unauthorized use.
        </p>
        <h2>Limitation of Liability</h2>
        <p>
          RTI Assistant is provided &quot;as is&quot; without warranties. We are not liable for any
          indirect or consequential damages.
        </p>
        <h2>Contact</h2>
        <p>For questions, contact us via the Contact page.</p>
      </main>
    </div>
  )
}


