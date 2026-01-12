import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Sports Mockery',
  description: 'Sports Mockery privacy policy and data handling practices.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">
        Privacy Policy
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-zinc-600 dark:text-zinc-400">
          Last updated: January 2026
        </p>

        <h2>Introduction</h2>
        <p>
          Sports Mockery ("we", "our", or "us") is committed to protecting your
          privacy. This Privacy Policy explains how we collect, use, and safeguard
          your information when you visit our website.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We may collect information about you in various ways, including:
        </p>
        <ul>
          <li>
            <strong>Personal Data:</strong> Name, email address, and other contact
            information you voluntarily provide when contacting us or subscribing
            to our newsletter.
          </li>
          <li>
            <strong>Usage Data:</strong> Information about how you access and use
            our website, including your IP address, browser type, pages visited,
            and time spent on pages.
          </li>
          <li>
            <strong>Cookies:</strong> We use cookies and similar tracking technologies
            to enhance your experience on our site.
          </li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Provide and maintain our website</li>
          <li>Improve and personalize your experience</li>
          <li>Send you newsletters and updates (if you've subscribed)</li>
          <li>Respond to your inquiries and support requests</li>
          <li>Analyze usage patterns to improve our content</li>
        </ul>

        <h2>Third-Party Services</h2>
        <p>
          We may use third-party services that collect, monitor, and analyze data
          to improve our service. These third parties have their own privacy policies
          addressing how they use such information.
        </p>

        <h2>Advertising</h2>
        <p>
          We may use third-party advertising companies to serve ads when you visit
          our website. These companies may use information about your visits to
          provide relevant advertisements.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal
          information. However, no method of transmission over the Internet is
          100% secure, and we cannot guarantee absolute security.
        </p>

        <h2>Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your personal information</li>
          <li>Opt out of marketing communications</li>
        </ul>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and updating
          the "Last updated" date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{' '}
          <a href="/contact" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            our contact page
          </a>{' '}
          or email us at privacy@sportsmockery.com.
        </p>
      </div>
    </div>
  )
}
