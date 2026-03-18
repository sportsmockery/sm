'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { TeamInfo } from './TeamHubLayout'

interface QuickLink {
  title: string
  path: string
  icon: React.ReactNode
}

function getQuickLinks(teamSlug: string): QuickLink[] {
  return [
    {
      title: 'Trade Rumors',
      path: `/${teamSlug}/trade-rumors`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 10L3 14L7 18M21 10L17 6L13 10M3 14H13M11 10H21"/>
        </svg>
      ),
    },
    {
      title: 'Draft News',
      path: `/${teamSlug}/draft-tracker`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
    },
    {
      title: ['chicago-cubs', 'chicago-white-sox'].includes(teamSlug) ? 'Luxury Tax' : 'Salary Cap',
      path: `/${teamSlug}/cap-tracker`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="9" y1="10" x2="15" y2="10"></line>
          <line x1="9" y1="14" x2="15" y2="14"></line>
        </svg>
      ),
    },
    {
      title: 'Depth Chart',
      path: `/${teamSlug}/depth-chart`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
  ]
}

interface TeamHeaderProps {
  team: TeamInfo
  rightSlot?: React.ReactNode
}

export default function TeamHeader({ team }: TeamHeaderProps) {
  const quickLinks = getQuickLinks(team.slug)

  return (
    <header
      className="team-header-container"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        width: '100%',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Team Hero Section */}
      <div
        className="team-hero"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '40px 60px',
          background: 'linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%)',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        {/* Left: Team Info */}
        <div
          className="team-info"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            className="team-logo-container"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}
          >
            <Image
              src={team.logo}
              alt={`${team.name} Logo`}
              width={64}
              height={64}
              style={{
                maxWidth: '80%',
                maxHeight: '80%',
                objectFit: 'contain',
              }}
              unoptimized
            />
          </div>
          <div
            className="team-details"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              className="team-title-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <h1
                className="team-name"
                style={{
                  margin: 0,
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#0b162a',
                }}
              >
                {team.name}
              </h1>
              <span
                className="season-badge"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  color: '#555',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {new Date().getFullYear()} SEASON
              </span>
            </div>
            <p
              className="team-meta"
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#6c757d',
              }}
            >
              {team.league === 'NFL'
                ? 'Chicago \u2022 NFC North'
                : team.league === 'NBA'
                ? 'Chicago \u2022 Central Division'
                : team.league === 'NHL'
                ? 'Chicago \u2022 Central Division'
                : 'Chicago \u2022 American League'}
            </p>
          </div>
        </div>

        {/* Right: Quick Links */}
        <div
          className="quick-links-container hidden lg:flex"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '12px 24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          }}
        >
          {quickLinks.map((link, index) => (
            <div key={link.title} style={{ display: 'flex', alignItems: 'center' }}>
              <Link
                href={link.path}
                className="quick-link"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  color: '#495057',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '8px 16px',
                  transition: 'color 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#00bcd4'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#495057'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {link.icon}
                <span>{link.title}</span>
              </Link>
              {index < quickLinks.length - 1 && (
                <div
                  className="link-divider"
                  style={{
                    height: '40px',
                    width: '1px',
                    backgroundColor: '#e9ecef',
                    margin: '0 8px',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
