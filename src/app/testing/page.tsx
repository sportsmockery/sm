import { Metadata } from 'next'
import TestingDashboard from './TestingDashboard'

export const metadata: Metadata = {
  title: 'QA Testing Checklist | SportsMockery',
  description: 'Comprehensive QA testing checklist for all SportsMockery features.',
  robots: { index: false, follow: false },
}

export default function TestingPage() {
  return <TestingDashboard />
}
