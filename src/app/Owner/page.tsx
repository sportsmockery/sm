import OwnershipHub from './OwnershipHub'

export const revalidate = 3600

export const metadata = {
  title: 'Owner & GM Report Cards | Sports Mockery',
  description: 'Data-backed grades on every Chicago ownership group — Spending, Results, Fan Sentiment, and Loyalty Tax.',
}

const DATALAB_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

export default async function OwnerPage() {
  let grades: any[] = []

  try {
    const res = await fetch(`${DATALAB_URL}/api/ownership-scores/grades`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const json = await res.json()
      grades = json.grades || json.data || json || []
      if (!Array.isArray(grades)) grades = []
    }
  } catch (err) {
    console.error('Failed to fetch ownership grades from DataLab:', err)
  }

  return <OwnershipHub grades={grades} />
}
