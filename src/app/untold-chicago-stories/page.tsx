import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Untold Chicago Stories | Sports Mockery',
  description: 'Untold Chicago is a long-form podcast and video series giving former Chicago athletes the space to tell their story the way it was actually lived.',
  openGraph: {
    title: 'Untold Chicago Stories',
    description: 'The stories behind the legends. Coming soon.',
    images: ['/untld-logo.svg'],
  },
};

export default function UntoldChicagoStoriesPage() {
  return (
    <main className="sm-show-page sm-untold-chicago">
      {/* Hero Section with Logo */}
      <section className="sm-show-hero" style={{ backgroundColor: '#000000', padding: '3rem 0' }}>
        <div className="sm-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/untld-logo.svg"
            alt="UNTLD Chicago Confidential Unreleased"
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
            }}
          />
        </div>
      </section>

      {/* Title Section */}
      <section style={{ backgroundColor: '#0a0a0a', padding: '3rem 0' }}>
        <div className="sm-container" style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            UNTOLD CHICAGO
          </h1>
          <h2
            style={{
              fontSize: 'clamp(1.25rem, 4vw, 2rem)',
              fontWeight: 700,
              color: '#bc0000',
              marginBottom: '2rem',
            }}
          >
            The stories behind the legends.
          </h2>
        </div>
      </section>

      {/* Description Section */}
      <section style={{ backgroundColor: '#111111', padding: '3rem 0' }}>
        <div className="sm-container">
          <p style={{ fontSize: '1.25rem', color: '#e0e0e0', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Untold Chicago is a long-form podcast and video series created to give former Chicago athletes the space to tell their story the way it was actually lived — without pressure, without spin, and without being reduced to headlines.
          </p>
          <p style={{ fontSize: '1.25rem', color: '#e0e0e0', lineHeight: 1.7 }}>
            This isn&apos;t an interview meant to put you on the spot. It&apos;s a conversation designed to allow you to reflect, explain, and be heard.
          </p>
        </div>
      </section>

      {/* What the Conversation Feels Like */}
      <section style={{ backgroundColor: '#0a0a0a', padding: '3rem 0' }}>
        <div className="sm-container">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', textAlign: 'center', marginBottom: '1.5rem' }}>
            WHAT THE CONVERSATION FEELS LIKE
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#b0b0b0', textAlign: 'center', marginBottom: '2rem' }}>
            We talk through the moments that mattered — naturally, at your pace:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              'When you first believed you could make it, and when you doubted it',
              'Who showed up for you early, before the world did',
              'What Chicago meant to you — the pressure, the pride, when it felt like home',
              'The people who carried you forward — coaches, teammates, family',
              'How life changed once the game slowed down',
              'What you\'re most proud of now, and how you want your story remembered',
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                <p style={{ fontSize: '1rem', color: '#d0d0d0', margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '1.1rem', color: '#b0b0b0', textAlign: 'center', marginTop: '2rem' }}>
            There&apos;s direction, but no script.
          </p>
        </div>
      </section>

      {/* Why Athletes Say Yes */}
      <section style={{ backgroundColor: '#111111', padding: '3rem 0' }}>
        <div className="sm-container">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', textAlign: 'center', marginBottom: '1.5rem' }}>
            WHY ATHLETES SAY YES
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#b0b0b0', textAlign: 'center', marginBottom: '2rem' }}>
            Athletes choose Untold Chicago because it feels different.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              'You\'re guided, not interrogated',
              'No hot takes, no rapid-fire questions',
              'It feels like sitting down with someone who understands the journey',
              'You decide what you want to share — and what you don\'t',
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                <p style={{ fontSize: '1rem', color: '#d0d0d0', margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#bc0000', textAlign: 'center', marginTop: '2rem' }}>
            This is your story, told on your terms.
          </p>
        </div>
      </section>

      {/* The Environment */}
      <section style={{ backgroundColor: '#0a0a0a', padding: '3rem 0' }}>
        <div className="sm-container">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', textAlign: 'center', marginBottom: '1.5rem' }}>
            THE ENVIRONMENT
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              'Private, professional studio',
              'No audience, no distractions',
              'Everyone on set signs NDAs',
              'Nothing is released without your approval',
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                <p style={{ fontSize: '1rem', color: '#d0d0d0', margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '1.1rem', color: '#b0b0b0', textAlign: 'center', marginTop: '2rem' }}>
            If there&apos;s something you decide shouldn&apos;t be public, it won&apos;t be.
          </p>
        </div>
      </section>

      {/* Why This Matters */}
      <section style={{ backgroundColor: '#111111', padding: '3rem 0' }}>
        <div className="sm-container">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', textAlign: 'center', marginBottom: '1.5rem' }}>
            WHY THIS MATTERS
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#b0b0b0', textAlign: 'center', marginBottom: '1.5rem' }}>
            Chicago fans don&apos;t just remember stats — they remember moments, people, and how you made them feel.
          </p>
          <p style={{ fontSize: '1.25rem', color: '#e0e0e0', textAlign: 'center', marginBottom: '2rem' }}>
            Untold Chicago gives you the chance to:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              'Add depth and context to how your career is remembered',
              'Address moments that were misunderstood',
              'Share lessons with the next generation',
              'Leave something meaningful behind',
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                <p style={{ fontSize: '1rem', color: '#d0d0d0', margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#bc0000', marginBottom: '0.5rem' }}>
              Years from now, this episode should still matter.
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.1em' }}>
              COMING SOON
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
