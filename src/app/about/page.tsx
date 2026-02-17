import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us - Sports Mockery',
  description: 'Learn about Sports Mockery, your source for Chicago sports news and commentary.',
}

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: 'var(--sm-dark)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '140px 24px 80px',
          background: 'linear-gradient(180deg, var(--sm-surface) 0%, var(--sm-dark) 100%)',
          borderBottom: '1px solid var(--sm-border)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            color: 'var(--sm-text)',
            fontFamily: "'Montserrat', sans-serif",
            margin: '0 0 16px',
          }}
        >
          About Sports Mockery
        </h1>
        <p
          style={{
            fontSize: '20px',
            color: 'var(--sm-text-muted)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Chicago&apos;s premier destination for sports news, analysis, and commentary.
          We cover all the teams you love.
        </p>
      </section>

      {/* Main Content */}
      <section
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '80px 24px',
        }}
      >
        {/* Who We Are */}
        <div style={{ marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--sm-text)',
              fontFamily: "'Montserrat', sans-serif",
              marginBottom: '20px',
            }}
          >
            Who We Are
          </h2>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.8,
              color: 'var(--sm-text-muted)',
            }}
          >
            Sports Mockery is Chicago&apos;s premier destination for sports news, analysis,
            and commentary. We cover all the teams you love: the Bears, Bulls, Cubs,
            White Sox, and Blackhawks. We&apos;re passionate fans just like you, delivering
            insightful, entertaining, and honest coverage every single day.
          </p>
        </div>

        {/* Our Mission */}
        <div style={{ marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--sm-text)',
              fontFamily: "'Montserrat', sans-serif",
              marginBottom: '20px',
            }}
          >
            Our Mission
          </h2>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.8,
              color: 'var(--sm-text-muted)',
            }}
          >
            Our mission is to provide insightful, entertaining, and honest coverage of
            Chicago sports. We don&apos;t sugarcoat the truth, and we&apos;re not afraid to
            call it like we see it. Whether it&apos;s breaking news, deep-dive analysis, or
            hot takes, we bring the passion that Chicago sports deserve.
          </p>
        </div>

        {/* Our Values */}
        <div style={{ marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--sm-text)',
              fontFamily: "'Montserrat', sans-serif",
              marginBottom: '24px',
            }}
          >
            Our Values
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                title: 'Authenticity',
                description:
                  'We tell it like it is. No corporate spin, no sugar-coating. Just real, honest sports talk from real Chicago fans.',
              },
              {
                title: 'Passion',
                description:
                  'We live and breathe Chicago sports. Every article, every take, every analysis comes from a place of genuine love for the game.',
              },
              {
                title: 'Community',
                description:
                  'We\'re building a home for Chicago sports fans to come together, debate, and celebrate the teams we all care about.',
              },
              {
                title: 'Quality',
                description:
                  'From game recaps to trade rumors to in-depth analysis, we hold ourselves to the highest standard of sports journalism.',
              },
            ].map((value) => (
              <div
                key={value.title}
                style={{
                  backgroundColor: 'var(--sm-card)',
                  border: '1px solid var(--sm-border)',
                  borderRadius: 'var(--sm-radius-lg)',
                  padding: '28px',
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--sm-text)',
                    fontFamily: "'Montserrat', sans-serif",
                    marginBottom: '12px',
                  }}
                >
                  {value.title}
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: 'var(--sm-text-muted)',
                    margin: 0,
                  }}
                >
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Team */}
        <div style={{ marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--sm-text)',
              fontFamily: "'Montserrat', sans-serif",
              marginBottom: '20px',
            }}
          >
            Our Team
          </h2>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.8,
              color: 'var(--sm-text-muted)',
            }}
          >
            Our writers are lifelong Chicago sports fans with decades of combined
            experience covering the teams we love. From game recaps to trade rumors
            to in-depth analysis, we&apos;ve got you covered.
          </p>
        </div>

        {/* Contact CTA */}
        <div
          style={{
            backgroundColor: 'var(--sm-card)',
            border: '1px solid var(--sm-border)',
            borderRadius: 'var(--sm-radius-xl)',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--sm-text)',
              fontFamily: "'Montserrat', sans-serif",
              marginBottom: '12px',
            }}
          >
            Get In Touch
          </h2>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.8,
              color: 'var(--sm-text-muted)',
              marginBottom: '24px',
            }}
          >
            Have a tip? Want to write for us? Just want to chat about the Bears&apos;
            latest draft pick? We&apos;d love to hear from you.
          </p>
          <Link
            href="/contact"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #bc0000, #ff4444)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '16px',
              padding: '14px 36px',
              borderRadius: '9999px',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
