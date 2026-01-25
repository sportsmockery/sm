import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Untold Chicago Stories',
  description: 'Untold Chicago is a long-form podcast and video series giving former Chicago athletes the space to tell their story the way it was actually lived.',
  openGraph: {
    title: 'Untold Chicago Stories',
    description: 'The stories behind Chicago\'s legends. Coming soon.',
    images: ['/images/untold/untld-logo.svg'],
  },
};

export default function UntoldChicagoStoriesPage() {
  return (
    <main className="bg-[#050608] text-white min-h-screen">
      {/* Hero Section with Logo */}
      <section className="w-full bg-black py-10 md:py-16">
        <div className="relative w-full max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto aspect-[3/1]">
          <Image
            src="/images/untold/untld-logo.svg"
            alt="Untold Chicago Stories"
            fill
            priority
            className="object-contain"
          />
        </div>
      </section>

      {/* Title and Tagline Section */}
      <section className="py-8 sm:py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            UNTOLD CHICAGO
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-semibold text-[#bc0000]">
            The stories behind Chicago&apos;s legends.
          </p>
        </div>
      </section>

      {/* Intro Copy Section */}
      <section className="py-8 sm:py-10 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-base sm:text-lg leading-relaxed space-y-4">
          <p>
            Untold Chicago is a long-form podcast and video series built to let former Chicago athletes tell their story the way it was actually lived — without pressure, without spin, and without being reduced to headlines.
          </p>
          <p>
            This isn&apos;t an interview designed to put you on the spot. It&apos;s a conversation that gives you room to reflect, explain, and be heard.
          </p>
        </div>
      </section>

      {/* What the Conversation Feels Like */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4">
            What the Conversation Feels Like
          </h2>
          <p className="text-center text-base sm:text-lg text-gray-300 mb-6">
            We walk through the moments that actually mattered — at your pace, in your words.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[
              'When you first believed you could make it — and when you doubted it',
              'Who showed up early, before the rest of the world noticed',
              'What Chicago meant to you — the pressure, the pride, and when it finally felt like home',
              'The people who carried you forward — coaches, teammates, family',
              'How life changed once the game slowed down',
              'What you\'re proudest of now, and how you want your story remembered',
            ].map((item, idx) => (
              <li key={idx} className="text-base sm:text-lg text-gray-200 bg-[#111] rounded-lg p-4">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-center text-base sm:text-lg text-gray-300 mt-6">
            There&apos;s direction, but there&apos;s no script.
          </p>
        </div>
      </section>

      {/* Why Athletes Say Yes */}
      <section className="py-8 sm:py-12 md:py-16 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4">
            Why Athletes Say Yes
          </h2>
          <p className="text-center text-base sm:text-lg text-gray-300 mb-6">
            Athletes choose Untold Chicago because it feels different.
          </p>
          <ul className="space-y-3">
            {[
              'You\'re guided, not interrogated',
              'No hot takes, no rapid-fire questions',
              'It feels like sitting down with someone who understands the journey',
              'You decide what you want to share — and what you don\'t',
            ].map((item, idx) => (
              <li key={idx} className="text-base sm:text-lg text-gray-200 bg-[#111] rounded-lg p-4">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-lg sm:text-xl font-semibold text-[#bc0000]">
            This is your story, told on your terms.
          </p>
        </div>
      </section>

      {/* The Environment */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6">
            The Environment
          </h2>
          <ul className="space-y-3">
            {[
              'Private, professional studio',
              'No audience, no distractions',
              'Everyone on set signs NDAs',
              'Nothing is released without your approval',
            ].map((item, idx) => (
              <li key={idx} className="text-base sm:text-lg text-gray-200 bg-[#111] rounded-lg p-4">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-center text-base sm:text-lg text-gray-300 mt-6">
            If there&apos;s anything you decide shouldn&apos;t be public, it won&apos;t be.
          </p>
        </div>
      </section>

      {/* Why This Matters + Coming Soon */}
      <section className="py-8 sm:py-12 md:py-16 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6">
            Why This Matters
          </h2>
          <div className="space-y-4 text-base sm:text-lg leading-relaxed text-gray-200">
            <p>
              Chicago fans don&apos;t just remember stats — they remember moments, people, and how you made them feel.
            </p>
            <p>
              Untold Chicago gives you space to add depth to how your career is remembered, clear up what was misunderstood, share what you&apos;ve learned, and leave something that still matters years from now.
            </p>
          </div>
          <p className="mt-8 text-center text-lg sm:text-xl font-semibold text-[#bc0000]">
            Episodes coming soon to Untold Chicago Stories.
          </p>
        </div>
      </section>

      {/* Future Video Grid Placeholder - Hidden until episodes exist */}
      {/*
      <section className="py-8 sm:py-12 md:py-16" aria-hidden="true" hidden>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6">
            Episodes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((episode) => (
              <VideoCard key={episode.id} episode={episode} />
            ))}
          </div>
        </div>
      </section>
      */}
    </main>
  );
}
