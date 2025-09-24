import { Navigation } from "@/components/navigation"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          We collect minimal personal information to operate RTI Assistant, including
          your name, email, and optional phone and state. We use cookies for session
          management.
        </p>
        <h2>Data Usage</h2>
        <p>
          Your data is used to provide and improve the service. We do not sell your
          personal information.
        </p>
        <h2>Security</h2>
        <p>
          We take reasonable measures to protect your information. However, no method of
          transmission over the Internet is 100% secure.
        </p>
        <h2>Your Rights</h2>
        <p>
          You may request access, correction, or deletion of your data by contacting us.
        </p>
        <h2>Contact</h2>
        <p>For privacy questions, contact us via the Contact page.</p>
      </main>
    </div>
  )
}


