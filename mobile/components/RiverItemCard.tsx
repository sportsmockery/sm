import { memo, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@/hooks/useTheme'
import { api, type RiverItem } from '@/lib/api'
import { getAnonymousId } from '@/lib/anonymousId'

interface RiverItemCardProps {
  item: RiverItem
  onPress?: (postId: number) => void
}

function getEditorialPostId(data: Record<string, unknown>): number | null {
  const raw = data.postId
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string' && /^\d+$/.test(raw)) return parseInt(raw, 10)
  return null
}

function RiverItemCardComponent({ item, onPress }: RiverItemCardProps) {
  const { colors } = useTheme()

  const isEditorial = item.type === 'editorial' || item.type === 'trending_article'
  const data = item.data
  const headline = (data.headline as string) || (data.title as string) || ''
  const summary = (data.summary as string) || (data.excerpt as string) || ''
  const insight = (data.insight as string) || ''
  const featuredImage = (data.featuredImage as string) || (data.image as string) || ''
  const authorName =
    (data.author_name as string) || ((data.author as any)?.name as string) || 'Sports Mockery'
  const breakingIndicator = (data.breakingIndicator as string) || ''
  const postId = getEditorialPostId(data)

  const handlePress = () => {
    if (isEditorial && postId && onPress) onPress(postId)
  }

  return (
    <TouchableOpacity
      activeOpacity={isEditorial && postId ? 0.85 : 1}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderLeftColor: item.teamColor || colors.border,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top row: team + timestamp */}
      <View style={styles.topRow}>
        <View style={[styles.teamPill, { backgroundColor: item.teamColor || colors.border }]}>
          <Text style={styles.teamPillText}>{item.team}</Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.textMuted }]}>{item.timestamp}</Text>
      </View>

      {/* Editorial / trending_article */}
      {isEditorial && (
        <>
          {breakingIndicator ? (
            <Text style={[styles.breakingBadge, { color: '#BC0000' }]}>{breakingIndicator}</Text>
          ) : null}
          {!!headline && (
            <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
              {headline}
            </Text>
          )}
          {!!featuredImage && (
            <Image
              source={{ uri: featuredImage }}
              style={styles.featuredImage}
              contentFit="cover"
              transition={200}
            />
          )}
          {!!summary && (
            <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={4}>
              {summary}
            </Text>
          )}
          {!!insight && (
            <View style={[styles.insightBox, { borderLeftColor: '#00D4FF' }]}>
              <Text style={styles.insightLabel}>SCOUT INSIGHT</Text>
              <Text style={[styles.insightText, { color: colors.text }]}>{insight}</Text>
            </View>
          )}
          <Text style={[styles.author, { color: colors.textMuted }]}>By {authorName}</Text>
        </>
      )}

      {/* Non-editorial typed cards */}
      {!isEditorial && (
        <View style={styles.fallback}>
          <View style={styles.fallbackHeader}>
            <Ionicons name={iconForType(item.type)} size={16} color={colors.textMuted} />
            <Text style={[styles.fallbackType, { color: colors.textMuted }]}>
              {labelForType(item.type)}
            </Text>
          </View>
          {renderTypedBody(item, colors)}
        </View>
      )}
    </TouchableOpacity>
  )
}

function renderTypedBody(
  item: RiverItem,
  colors: ReturnType<typeof useTheme>['colors']
) {
  const data = item.data
  switch (item.type) {
    case 'poll':
      return <PollBody data={data} colors={colors} />
    case 'debate':
      return <DebateBody data={data} colors={colors} />
    case 'scout_summary':
      return <ScoutSummaryBody data={data} colors={colors} />
    case 'chart':
      return <ChartBody data={data} colors={colors} />
    case 'box_score':
      return <BoxScoreBody data={data} colors={colors} />
    case 'trade_proposal':
      return <TradeProposalBody data={data} colors={colors} />
    case 'hub_update':
      return <HubUpdateBody data={data} colors={colors} />
    case 'video':
      return <VideoBody data={data} colors={colors} />
    default:
      return <DefaultBody data={data} colors={colors} />
  }
}

function DefaultBody({
  data,
  colors,
}: {
  data: Record<string, unknown>
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const headline = (data.headline as string) || (data.title as string) || ''
  const summary = (data.summary as string) || (data.excerpt as string) || ''
  return (
    <>
      {!!headline && (
        <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
          {headline}
        </Text>
      )}
      {!!summary && (
        <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={3}>
          {summary}
        </Text>
      )}
    </>
  )
}

function pollVotedKey(pollId: string): string {
  return `poll-voted:${pollId}`
}

function PollBody({
  data,
  colors,
}: {
  data: Record<string, unknown>
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const question = (data.question as string) || (data.headline as string) || ''
  const context = (data.context as string) || ''
  const options = Array.isArray(data.options) ? (data.options as string[]) : []
  const optionIds = Array.isArray(data.optionIds) ? (data.optionIds as string[]) : []
  const optionVoteCounts = Array.isArray(data.optionVoteCounts)
    ? (data.optionVoteCounts as number[])
    : []
  const initialTotal = (data.totalVotes as number) || 0
  const status = (data.status as string) || ''
  const pollId = (data.pollId as string) || ''
  // Inline voting only works when the feed gave us real option IDs (sm_polls).
  // Inline article poll blocks ship option text only — those stay read-only.
  const votable = !!pollId && optionIds.length === options.length && options.length > 0

  const [voteCounts, setVoteCounts] = useState<number[]>(() =>
    optionVoteCounts.length === options.length ? optionVoteCounts : options.map(() => 0)
  )
  const [totalVotes, setTotalVotes] = useState<number>(initialTotal)
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hydrate "already voted" state from the per-device cache.
  useEffect(() => {
    if (!votable) return
    let cancelled = false
    AsyncStorage.getItem(pollVotedKey(pollId))
      .then((stored) => {
        if (!cancelled && stored) setVotedOptionId(stored)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [pollId, votable])

  const handleVote = async (index: number) => {
    if (!votable || submitting || votedOptionId) return
    const optionId = optionIds[index]
    if (!optionId) return

    setSubmitting(true)
    setError(null)

    // Optimistic update
    const prevCounts = voteCounts
    const prevTotal = totalVotes
    setVoteCounts((counts) => counts.map((c, i) => (i === index ? c + 1 : c)))
    setTotalVotes((t) => t + 1)
    setVotedOptionId(optionId)

    try {
      const anonId = await getAnonymousId()
      const res = await api.votePoll(pollId, [optionId], anonId)
      if (res?.results) {
        // Reconcile to server truth.
        const serverCounts = options.map((label, i) => {
          const match = res.results.options.find(
            (o) => o.id === optionIds[i] || o.option_text === label
          )
          return match?.vote_count ?? voteCounts[i]
        })
        setVoteCounts(serverCounts)
        setTotalVotes(res.results.total_votes ?? prevTotal + 1)
      }
      AsyncStorage.setItem(pollVotedKey(pollId), optionId).catch(() => {})
    } catch (err) {
      const message = (err as Error)?.message || 'Vote failed'
      // "already voted" is expected if the server has a record we lost — keep
      // the locked state but surface clearer messaging if anything else broke.
      if (/already voted/i.test(message)) {
        AsyncStorage.setItem(pollVotedKey(pollId), optionId).catch(() => {})
      } else {
        setVoteCounts(prevCounts)
        setTotalVotes(prevTotal)
        setVotedOptionId(null)
        setError('Vote failed — tap to retry')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const showResults = !!votedOptionId

  return (
    <>
      {!!question && (
        <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
          {question}
        </Text>
      )}
      {!!context && (
        <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={2}>
          {context}
        </Text>
      )}
      <View style={{ gap: 8, marginBottom: 10 }}>
        {options.slice(0, 4).map((opt, i) => {
          // Alternate cyan/red so option A is intelligence, B is brand
          const accent = i % 2 === 0 ? '#00D4FF' : '#BC0000'
          const isVoted = votedOptionId && optionIds[i] === votedOptionId
          const count = voteCounts[i] ?? 0
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          return (
            <TouchableOpacity
              key={`${i}-${opt}`}
              activeOpacity={votable && !showResults ? 0.7 : 1}
              disabled={!votable || submitting || showResults}
              onPress={() => handleVote(i)}
              style={[
                styles.pollOption,
                {
                  borderColor: isVoted ? accent : colors.border,
                  backgroundColor: `${accent}10`,
                  overflow: 'hidden',
                },
              ]}
            >
              {showResults && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${pct}%`,
                    backgroundColor: `${accent}33`,
                  }}
                />
              )}
              <View style={[styles.pollDot, { backgroundColor: accent }]} />
              <Text
                style={[styles.pollOptionText, { color: colors.text, flex: 1 }]}
                numberOfLines={1}
              >
                {opt}
              </Text>
              {showResults && (
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    fontFamily: 'Montserrat-SemiBold',
                  }}
                >
                  {pct}%
                </Text>
              )}
              {isVoted && !submitting && (
                <Ionicons name="checkmark-circle" size={16} color={accent} />
              )}
              {submitting && isVoted && (
                <ActivityIndicator size="small" color={accent} />
              )}
            </TouchableOpacity>
          )
        })}
      </View>
      <View style={styles.metaRow}>
        {!!status && (
          <Text style={[styles.metaPill, { color: '#BC0000', borderColor: '#BC0000' }]}>
            {status}
          </Text>
        )}
        <Text style={[styles.metaText, { color: colors.textMuted }]}>
          {error
            ? error
            : totalVotes
            ? `${totalVotes.toLocaleString()} votes`
            : votable
            ? 'Tap to vote'
            : 'Open article to vote'}
        </Text>
      </View>
    </>
  )
}

function DebateBody({
  data,
  colors,
}: {
  data: Record<string, unknown>
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const prompt = (data.prompt as string) || (data.headline as string) || ''
  const sideA = (data.sideA as string) || ''
  const sideB = (data.sideB as string) || ''
  const participants = (data.participantCount as number) || 0

  return (
    <>
      {!!prompt && (
        <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
          {prompt}
        </Text>
      )}
      <View style={styles.debateRow}>
        <View
          style={[
            styles.debateSide,
            { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.06)' },
          ]}
        >
          <Text style={[styles.debateSideLabel, { color: '#00D4FF' }]}>PRO</Text>
          <Text style={[styles.debateSideText, { color: colors.text }]} numberOfLines={3}>
            {sideA}
          </Text>
        </View>
        <View
          style={[
            styles.debateSide,
            { borderColor: '#BC0000', backgroundColor: 'rgba(188,0,0,0.06)' },
          ]}
        >
          <Text style={[styles.debateSideLabel, { color: '#BC0000' }]}>CON</Text>
          <Text style={[styles.debateSideText, { color: colors.text }]} numberOfLines={3}>
            {sideB}
          </Text>
        </View>
      </View>
      {!!participants && (
        <Text style={[styles.metaText, { color: colors.textMuted }]}>
          {participants.toLocaleString()} fans weighed in
        </Text>
      )}
    </>
  )
}

// Match the web cleanBullets filter (src/components/homepage/RiverCards.tsx).
// Bullets must never contain URLs, must reference Chicago context, and must
// have enough substance to be worth showing.
const NON_CHICAGO_KEYWORDS = /\b(heat|lakers|celtics|warriors|knicks|nets|76ers|sixers|clippers|bucks|cavaliers|cavs|raptors|pistons|pacers|magic|hawks|hornets|wizards|pelicans|grizzlies|timberwolves|thunder|trail blazers|blazers|jazz|kings|spurs|suns|mavericks|mavs|rockets|nuggets|cowboys|patriots|eagles|giants|commanders|49ers|seahawks|rams(?! \d)|cardinals|falcons|panthers|saints|buccaneers|bucs|steelers|ravens|bengals|browns|titans|texans|colts|jaguars|dolphins|jets|bills|chargers|raiders|broncos|chiefs|yankees|mets|red sox|dodgers|braves|astros|padres|phillies|rangers|orioles|twins|guardians|royals|mariners|angels|rays|marlins|rockies|nationals|reds|brewers|diamondbacks|pirates|tigers|athletics|bluejays|blue jays|canadiens|maple leafs|bruins|rangers|penguins|flyers|capitals|hurricanes|lightning|panthers|red wings|senators|sabres|islanders|devils|blue jackets|predators|stars|wild|jets|flames|oilers|canucks|kraken|avalanche|golden knights|ducks|sharks|kings)\b/i

function cleanBullets(rawBullets: string[]): string[] {
  return rawBullets.filter((b) => {
    if (/https?:\/\//i.test(b)) return false
    if (NON_CHICAGO_KEYWORDS.test(b)) return false
    if (b.trim().length < 10) return false
    return true
  })
}

function ScoutSummaryBody({
  data,
  colors,
}: {
  data: Record<string, unknown>
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const topic = (data.topic as string) || (data.headline as string) || ''
  const summary = (data.summary as string) || ''
  const rawBullets = Array.isArray(data.bullets) ? (data.bullets as string[]) : []
  const bullets = cleanBullets(rawBullets)

  return (
    <>
      {!!topic && (
        <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
          {topic}
        </Text>
      )}
      {!!summary && (
        <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={4}>
          {summary}
        </Text>
      )}
      {bullets.length > 0 && (
        <View
          style={{
            borderLeftWidth: 3,
            borderLeftColor: '#00D4FF',
            paddingLeft: 12,
            paddingVertical: 4,
            gap: 6,
          }}
        >
          {bullets.slice(0, 3).map((b, i) => (
            <Text
              key={i}
              style={[styles.bulletItem, { color: colors.text }]}
              numberOfLines={2}
            >
              • {b}
            </Text>
          ))}
        </View>
      )}
    </>
  )
}

function BoxScoreBody({
  data,
  colors,
}: {
  data: Record<string, unknown>
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const home = (data.homeTeam as any) || {}
  const away = (data.awayTeam as any) || {}
  const status = (data.status as string) || ''
  const period = (data.period as string) || ''
  const keyPerformer = (data.keyPerformer as string) || ''

  const homeWins = (home.score ?? 0) > (away.score ?? 0)
  const awayWins = (away.score ?? 0) > (home.score ?? 0)

  return (
    <>
      <View style={styles.boxScoreRow}>
        <BoxScoreSide team={away} winner={awayWins} colors={colors} />
        <View style={styles.boxScoreCenter}>
          <Text style={[styles.boxScoreStatus, { color: colors.text }]}>
            {status || period}
          </Text>
          {!!period && period !== status && (
            <Text style={[styles.boxScorePeriod, { color: colors.textMuted }]}>{period}</Text>
          )}
        </View>
        <BoxScoreSide team={home} winner={homeWins} colors={colors} />
      </View>
      {!!keyPerformer && (
        <View style={[styles.keyPerformer, { borderColor: colors.border }]}>
          <Ionicons name="star" size={12} color="#D6B05E" />
          <Text style={[styles.keyPerformerText, { color: colors.text }]} numberOfLines={1}>
            {keyPerformer}
          </Text>
        </View>
      )}
    </>
  )
}

function BoxScoreSide({
  team,
  winner,
  colors,
}: {
  team: { name?: string; logo?: string; score?: number }
  winner: boolean
  colors: ReturnType<typeof useTheme>['colors']
}) {
  return (
    <View style={styles.boxScoreSide}>
      {team.logo ? (
        <Image
          source={{ uri: team.logo }}
          style={styles.boxScoreLogo}
          contentFit="contain"
        />
      ) : (
        <View style={[styles.boxScoreLogo, { backgroundColor: colors.border }]} />
      )}
      <Text
        style={[
          styles.boxScoreTeam,
          { color: colors.text, opacity: winner ? 1 : 0.65 },
        ]}
        numberOfLines={1}
      >
        {team.name ?? ''}
      </Text>
      <Text
        style={[
          styles.boxScoreScore,
          { color: colors.text, opacity: winner ? 1 : 0.55 },
        ]}
      >
        {team.score ?? '—'}
      </Text>
    </View>
  )
}

function TradeProposalBody({
  data,
  colors,
}: {
  data: Record<string, unknown>
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const proposer = (data.proposer as any) || {}
  const teamGets = (data.teamGets as any) || {}
  const otherTeamGets = (data.otherTeamGets as any) || {}
  const fairnessScore = (data.fairnessScore as number) || 0
  const editorApproved = !!data.isEditorApproved

  const fairColor =
    fairnessScore >= 75 ? '#22c55e' : fairnessScore >= 50 ? '#D6B05E' : '#BC0000'

  return (
    <>
      {(proposer.name || proposer.handle) && (
        <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
          Proposal from {proposer.name || proposer.handle}
          {editorApproved ? ' · ✓ Editor approved' : ''}
        </Text>
      )}
      <View style={styles.tradeRow}>
        <View style={[styles.tradeSide, { borderColor: colors.border }]}>
          <Text style={[styles.tradeSideLabel, { color: colors.textMuted }]}>
            {teamGets.name || 'Team'} gets
          </Text>
          {(teamGets.items || []).slice(0, 3).map((it: string, i: number) => (
            <Text key={i} style={[styles.tradeItem, { color: colors.text }]} numberOfLines={1}>
              • {it}
            </Text>
          ))}
        </View>
        <View style={[styles.tradeSide, { borderColor: colors.border }]}>
          <Text style={[styles.tradeSideLabel, { color: colors.textMuted }]}>
            {otherTeamGets.name || 'Other'} gets
          </Text>
          {(otherTeamGets.items || []).slice(0, 3).map((it: string, i: number) => (
            <Text key={i} style={[styles.tradeItem, { color: colors.text }]} numberOfLines={1}>
              • {it}
            </Text>
          ))}
        </View>
      </View>
      {!!fairnessScore && (
        <View style={styles.metaRow}>
          <Text style={[styles.fairnessLabel, { color: colors.textMuted }]}>Fairness</Text>
          <View style={[styles.fairnessTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.fairnessFill,
                { width: `${Math.min(100, fairnessScore)}%`, backgroundColor: fairColor },
              ]}
            />
          </View>
          <Text style={[styles.fairnessScore, { color: fairColor }]}>{fairnessScore}</Text>
        </View>
      )}
    </>
  )
}

function HubUpdateBody({
  data,
  colors,
}: {
  data: Record<string, unknown>
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const updateText = (data.updateText as string) || (data.headline as string) || ''
  const takeaway = (data.takeaway as string) || ''
  const status = (data.status as string) || ''

  return (
    <>
      {!!status && (
        <Text style={[styles.statusBadge, { color: '#BC0000' }]}>{status}</Text>
      )}
      {!!updateText && (
        <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
          {updateText}
        </Text>
      )}
      {!!takeaway && (
        <View style={[styles.insightBox, { borderLeftColor: '#00D4FF' }]}>
          <Text style={styles.insightLabel}>SCOUT TAKE</Text>
          <Text style={[styles.insightText, { color: colors.text }]}>{takeaway}</Text>
        </View>
      )}
    </>
  )
}

// Best-effort YouTube ID extraction. The /api/feed payload usually sets
// data.videoId directly, but fall back to parsing common URL shapes too.
function extractYouTubeId(data: Record<string, unknown>): string | null {
  const direct = (data.videoId as string) || (data.youtubeId as string) || ''
  if (direct) return direct
  const url =
    (data.videoUrl as string) ||
    (data.url as string) ||
    (data.source as string) ||
    ''
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  return match ? match[1] : null
}

function buildYouTubeEmbedHtml(videoId: string, isShort: boolean): string {
  // Autoplay starts as soon as the iframe mounts; we only mount on user tap.
  const params = 'autoplay=1&playsinline=1&rel=0&modestbranding=1'
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><style>html,body{margin:0;padding:0;background:#000;height:100%;width:100%;}iframe{display:block;width:100%;height:100%;border:0;}</style></head><body><iframe src="https://www.youtube.com/embed/${videoId}?${params}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></body></html>`
}

function VideoBody({
  data,
  colors,
}: {
  data: Record<string, unknown>
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const title = (data.title as string) || (data.headline as string) || ''
  const duration = (data.duration as string) || ''
  const source = (data.source as string) || ''
  const teaser = (data.teaser as string) || (data.summary as string) || ''
  const thumbnail = (data.thumbnailUrl as string) || (data.thumbnail as string) || ''
  const isShort = (data.isShort as boolean) === true
  const videoId = extractYouTubeId(data)

  const [playing, setPlaying] = useState(false)

  const aspectStyle = isShort ? styles.videoFrameShort : styles.videoFrame

  return (
    <>
      <View style={aspectStyle}>
        {playing && videoId ? (
          <WebView
            source={{ html: buildYouTubeEmbedHtml(videoId, isShort) }}
            style={styles.videoWebView}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
            originWhitelist={['*']}
          />
        ) : (
          <TouchableOpacity
            activeOpacity={videoId ? 0.85 : 1}
            onPress={videoId ? () => setPlaying(true) : undefined}
            style={styles.videoThumbTouch}
          >
            {!!thumbnail && (
              <Image
                source={{ uri: thumbnail }}
                style={styles.videoThumb}
                contentFit="cover"
                transition={200}
              />
            )}
            <View style={styles.videoPlayOverlay} pointerEvents="none">
              <Ionicons name="play-circle" size={56} color="rgba(255,255,255,0.95)" />
            </View>
            {!!duration && (
              <View style={styles.videoDuration} pointerEvents="none">
                <Text style={styles.videoDurationText}>{duration}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
      {!!title && (
        <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
          {title}
        </Text>
      )}
      {!!teaser && (
        <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={3}>
          {teaser}
        </Text>
      )}
      {!!source && (
        <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
          {source}
        </Text>
      )}
    </>
  )
}

function ChartBody({
  data,
  colors,
}: {
  data: Record<string, unknown>
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const headline = (data.headline as string) || (data.title as string) || ''
  const takeaway = (data.takeaway as string) || ''
  const chartData = Array.isArray(data.chartData) ? (data.chartData as Array<{ label: string; value: number }>) : []
  const statSource = (data.statSource as string) || ''

  const max = chartData.reduce((m, p) => Math.max(m, p.value || 0), 0) || 1

  return (
    <>
      {!!headline && (
        <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
          {headline}
        </Text>
      )}
      {chartData.length > 0 && (
        <View style={styles.chartWrap}>
          {chartData.map((p, i) => (
            <View key={`${i}-${p.label}`} style={styles.chartCol}>
              <View style={styles.chartBarTrack}>
                <View
                  style={[
                    styles.chartBarFill,
                    {
                      height: `${Math.max(6, (p.value / max) * 100)}%`,
                      backgroundColor: '#00D4FF',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.chartLabel, { color: colors.textMuted }]} numberOfLines={1}>
                {p.label}
              </Text>
            </View>
          ))}
        </View>
      )}
      {!!takeaway && (
        <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={4}>
          {takeaway}
        </Text>
      )}
      {!!statSource && (
        <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
          Source: {statSource}
        </Text>
      )}
    </>
  )
}

function iconForType(type: RiverItem['type']): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'poll':
      return 'bar-chart-outline'
    case 'chart':
      return 'analytics-outline'
    case 'hub_update':
      return 'newspaper-outline'
    case 'box_score':
      return 'football-outline'
    case 'trade_proposal':
      return 'swap-horizontal-outline'
    case 'scout_summary':
      return 'sparkles-outline'
    case 'debate':
      return 'chatbubbles-outline'
    case 'video':
      return 'play-circle-outline'
    default:
      return 'ellipse-outline'
  }
}

function labelForType(type: RiverItem['type']): string {
  switch (type) {
    case 'poll':
      return 'POLL'
    case 'chart':
      return 'CHART'
    case 'hub_update':
      return 'HUB UPDATE'
    case 'box_score':
      return 'BOX SCORE'
    case 'trade_proposal':
      return 'TRADE PROPOSAL'
    case 'scout_summary':
      return 'SCOUT SUMMARY'
    case 'debate':
      return 'DEBATE'
    case 'video':
      return 'VIDEO'
    default:
      return type.toUpperCase()
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  teamPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  teamPillText: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.3,
    color: '#FAFAFB',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  breakingBadge: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  headline: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    lineHeight: 22,
    marginBottom: 10,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#0B0F1422',
  },
  summary: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
    marginBottom: 10,
  },
  insightBox: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  insightLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#00D4FF',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 18,
  },
  author: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  fallback: {
    gap: 6,
  },
  fallbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  fallbackType: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  pollOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pollDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pollOptionText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaPill: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.6,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  debateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  debateSide: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  debateSideLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.6,
  },
  debateSideText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 18,
  },
  bulletItem: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 18,
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 110,
    marginBottom: 10,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartBarTrack: {
    flex: 1,
    width: '70%',
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Medium',
  },
  // Box score
  boxScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  boxScoreSide: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  boxScoreCenter: {
    width: 60,
    alignItems: 'center',
    gap: 2,
  },
  boxScoreLogo: {
    width: 36,
    height: 36,
  },
  boxScoreTeam: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
  },
  boxScoreScore: {
    fontSize: 26,
    fontFamily: 'Montserrat-Bold',
    lineHeight: 30,
  },
  boxScoreStatus: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  boxScorePeriod: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
  },
  keyPerformer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  keyPerformerText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    flex: 1,
  },
  // Trade
  tradeRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  tradeSide: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  tradeSideLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tradeItem: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 16,
  },
  fairnessLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  fairnessTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fairnessFill: {
    height: '100%',
    borderRadius: 3,
  },
  fairnessScore: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    width: 28,
    textAlign: 'right',
  },
  statusBadge: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  // Video
  videoFrame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoFrameShort: {
    width: '60%',
    aspectRatio: 9 / 16,
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoWebView: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoThumbTouch: {
    flex: 1,
    position: 'relative',
  },
  videoThumb: {
    width: '100%',
    height: '100%',
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
  },
})

export default memo(RiverItemCardComponent)
