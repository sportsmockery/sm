import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Sports Mockery',
  description: 'Learn about Sports Mockery, your source for Chicago sports news and commentary.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">
        About Sports Mockery
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p>
          Sports Mockery is Chicago's premier destination for sports news, analysis,
          and commentary. We cover all the teams you love: the Bears, Bulls, Cubs,
          White Sox, and Blackhawks.
        </p>

        <h2>Our Mission</h2>
        <p>
          We're passionate fans just like you. Our mission is to provide insightful,
          entertaining, and honest coverage of Chicago sports. We don't sugarcoat the
          truth, and we're not afraid to call it like we see it.
        </p>

        <h2>Our Team</h2>
        <p>
          Our writers are lifelong Chicago sports fans with decades of combined
          experience covering the teams we love. From game recaps to trade rumors
          to in-depth analysis, we've got you covered.
        </p>

        <h2>Contact Us</h2>
        <p>
          Have a tip? Want to write for us? Just want to chat about the Bears'
          latest draft pick? We'd love to hear from you. Head over to our{' '}
          <a href="/contact" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            contact page
          </a>{' '}
          to get in touch.
        </p>
      </div>
    </div>
  )
}
