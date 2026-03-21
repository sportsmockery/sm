import { datalabAdmin } from '@/lib/supabase-datalab'
import OwnershipHub from './OwnershipHub'

export const revalidate = 3600

export const metadata = {
  title: 'Owner & GM Report Cards | Sports Mockery',
  description: 'Data-backed grades on every Chicago ownership group — Spending, Results, Fan Sentiment, and Loyalty Tax.',
}

export default async function OwnerPage() {
  let gradesWithVotes: any[] = []

  try {
    const { data: grades } = await datalabAdmin
      .from('ownership_grades')
      .select('*')
      .eq('is_current', true)
      .order('overall_grade', { ascending: true })

    if (grades && grades.length > 0) {
      const gradeIds = grades.map((g: any) => g.id)
      const { data: votes } = await datalabAdmin
        .from('ownership_vote_counts')
        .select('*')
        .in('grade_id', gradeIds)

      const votesMap = new Map((votes || []).map((v: any) => [v.grade_id, v]))
      gradesWithVotes = grades.map((g: any) => ({
        ...g,
        agree_count: votesMap.get(g.id)?.agree_count || 0,
        disagree_count: votesMap.get(g.id)?.disagree_count || 0,
        total_votes: votesMap.get(g.id)?.total_votes || 0,
      }))
    }
  } catch (err) {
    console.error('Failed to fetch ownership grades:', err)
  }

  return <OwnershipHub grades={gradesWithVotes} />
}
