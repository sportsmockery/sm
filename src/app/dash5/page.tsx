import type { Metadata } from 'next'
import Dash5Shell from './Dash5Shell'

export const metadata: Metadata = {
  title: 'Chicago Sports Intelligence — V2',
  description: 'Glass-card intelligence dashboard with drill-down, filters, and interactive charts.',
}

export default function Dash5Page() {
  return <Dash5Shell />
}
