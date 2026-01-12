import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Sports Mockery',
  description: 'Get in touch with Sports Mockery. Send us tips, feedback, or inquiries.',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">
        Contact Us
      </h1>

      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        Have a question, tip, or feedback? We'd love to hear from you.
        Fill out the form below and we'll get back to you as soon as possible.
      </p>

      <form className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
          >
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="general">General Inquiry</option>
            <option value="tip">News Tip</option>
            <option value="feedback">Feedback</option>
            <option value="advertising">Advertising</option>
            <option value="write">Write for Us</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Your message..."
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Send Message
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Other Ways to Reach Us
        </h2>
        <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
          <p>Email: contact@sportsmockery.com</p>
          <p>Twitter: @sportsmockery</p>
        </div>
      </div>
    </div>
  )
}
