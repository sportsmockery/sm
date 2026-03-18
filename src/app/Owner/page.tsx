import { datalabAdmin } from '@/lib/supabase-datalab'
import OwnershipHub from './OwnershipHub'

export const revalidate = 3600

export const metadata = {
  title: 'Owner & GM Report Cards',
  description: 'Data-backed grades on every Chicago ownership group — Spending, Results, Fan Sentiment, and Loyalty Tax.',
}

export default async function OwnerPage() {
  // Fetch grades + vote counts from shared Supabase
  const [gradesResult, voteResult] = await Promise.all([
    datalabAdmin
      .from('ownership_grades')
      .select('*')
      .eq('is_current', true)
      .order('overall_grade', { ascending: false }),
    datalabAdmin
      .from('ownership_vote_counts')
      .select('*'),
  ])

  const grades = gradesResult.data || []
  const voteCounts = voteResult.data || []

  // Merge vote counts
  const voteMap = new Map(voteCounts.map((v: any) => [v.grade_id, v]))
  const gradesWithVotes = grades.map((g: any) => {
    const votes = voteMap.get(g.id)
    return {
      ...g,
      agree_count: votes?.agree_count || 0,
      disagree_count: votes?.disagree_count || 0,
      total_votes: votes?.total_votes || 0,
    }
  })

  return <OwnershipHub grades={gradesWithVotes} />
}
