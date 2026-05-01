/**
 * EDGE Writer Training Curriculum
 *
 * Source of truth for all training modules. Each module drives the page UI,
 * the quiz scorer, the progress tracker, and the certification gate.
 */

export type VisualType = 'engagement' | 'authority' | 'signal' | 'headline'

export type InteractiveBlock =
  | 'engagement-explainer'
  | 'article-comparison'
  | 'headline-exercise'
  | 'signal-exercise'
  | 'article-analysis'
  | 'certification-quiz'

export interface QuizQuestion {
  question: string
  options: string[]
  correct: string
  explanation?: string
}

export interface TrainingModule {
  slug: string
  title: string
  subtitle: string
  description: string
  duration: string
  order: number
  video: {
    src: string
    poster: string
    fallback: string
  }
  visual: {
    type: VisualType
    title: string
    asset: string
  }
  lessons: string[]
  videoScript: string
  interactive?: InteractiveBlock
  quiz: QuizQuestion[]
  passScore: number
}

export const TRAINING_MODULES: TrainingModule[] = [
  {
    slug: 'edge-standard',
    title: 'The EDGE Standard',
    subtitle: 'Sports Mockery is not a content farm.',
    description:
      'Sports Mockery is becoming Chicago’s sports intelligence layer. Volume is no longer the goal — quality, trust, engagement, and insight are.',
    duration: '8 min',
    order: 1,
    video: {
      src: '/training/videos/training-edge-standard.mp4',
      poster: '/training/images/edge-standard-poster.png',
      fallback: 'Video coming soon',
    },
    visual: {
      type: 'authority',
      title: 'The EDGE Standard',
      asset: '/training/images/edge-standard-poster.png',
    },
    lessons: [
      'Sports Mockery is becoming Chicago’s sports intelligence layer.',
      'Writers are no longer paid or rewarded for raw volume.',
      'Quality, trust, engagement, and insight are the standard.',
      'EDGE rewards original thinking and useful real-time information.',
    ],
    videoScript:
      'Welcome to EDGE training. Sports Mockery is changing. We are not chasing volume anymore. We are building Chicago’s sports intelligence layer. That means every article, every signal, every update must earn trust. We reward originality, accuracy, engagement, and insight. If readers click but leave immediately, that is not success. If readers stay, scroll, comment, and trust us more, that is success.',
    quiz: [
      {
        question: 'What is the new Sports Mockery standard?',
        options: [
          'Publish as much as possible.',
          'Quality, trust, engagement, and insight.',
          'Match every other Chicago outlet headline-for-headline.',
          'Maximize raw page views.',
        ],
        correct: 'Quality, trust, engagement, and insight.',
      },
      {
        question: 'How are writers rewarded under the EDGE standard?',
        options: [
          'By word count and post volume.',
          'By originality, accuracy, and reader engagement.',
          'By how often they break news first regardless of accuracy.',
          'By beating WordPress traffic numbers.',
        ],
        correct: 'By originality, accuracy, and reader engagement.',
      },
      {
        question: 'A clickbait article gets 40,000 views but 8 seconds of average time on page. Under EDGE, that is:',
        options: [
          'A win — views are views.',
          'A neutral result.',
          'A weak result — engagement and trust did not happen.',
          'A bonus-worthy moment.',
        ],
        correct: 'A weak result — engagement and trust did not happen.',
      },
    ],
    passScore: 80,
  },
  {
    slug: 'authority-articles',
    title: 'Authority Articles',
    subtitle: 'How to write content that earns trust.',
    description:
      'Authority Articles are not rewritten reports. They have a thesis, original insight, and a clear answer to “why does this matter to Chicago fans?”',
    duration: '12 min',
    order: 2,
    video: {
      src: '/training/videos/training-authority-articles.mp4',
      poster: '/training/images/authority-article-framework.png',
      fallback: 'Video coming soon',
    },
    visual: {
      type: 'authority',
      title: 'Authority Article Framework',
      asset: '/training/images/authority-article-framework.png',
    },
    lessons: [
      'An Authority Article must have a thesis.',
      'It must include at least two original insights.',
      'It must explain why the story matters to Chicago fans.',
      'It cannot simply rewrite another report.',
      'Good: “The Bears Just Made a Move That Reveals Their Real Offensive Plan.”',
      'Bad: “Bears Make Another Roster Move.”',
    ],
    videoScript:
      'An Authority Article is not a rewritten report. It is a point of view. Your job is to explain what happened, why it matters, and what fans should think about next. Every Authority Article must have a clear thesis in the first three paragraphs and at least two original insights. If the article does not add value, it should be a Signal Update, not an article.',
    interactive: 'article-comparison',
    quiz: [
      {
        question: 'What must every Authority Article include?',
        options: [
          'A clear thesis and original insight.',
          'A celebrity name in the headline.',
          'At least 1,200 words.',
          'A photo gallery.',
        ],
        correct: 'A clear thesis and original insight.',
      },
      {
        question: 'When should a piece be a Signal Update instead of an Authority Article?',
        options: [
          'When the writer is short on time.',
          'When there is no thesis or original angle to add.',
          'When the team is on a losing streak.',
          'When the editor asks for a long piece.',
        ],
        correct: 'When there is no thesis or original angle to add.',
      },
      {
        question: 'Which is a stronger Authority Article opening?',
        options: [
          '“The Bears made another move today.”',
          '“The Bears’ latest move is not random — it points to a clear shift in how the front office views offensive depth.”',
          '“Fans were shocked.”',
          '“Sources confirm.”',
        ],
        correct:
          '“The Bears’ latest move is not random — it points to a clear shift in how the front office views offensive depth.”',
      },
    ],
    passScore: 80,
  },
  {
    slug: 'signal-updates',
    title: 'Signal Updates + Evergreen Pages',
    subtitle: 'Fast, accurate, useful updates.',
    description:
      'Signal Updates are short, sourced posts that feed evergreen pages — rumors, draft news, cap news, roster moves, injuries, depth chart movement.',
    duration: '10 min',
    order: 3,
    video: {
      src: '/training/videos/training-signal-updates.mp4',
      poster: '/training/images/signal-update-map.png',
      fallback: 'Video coming soon',
    },
    visual: {
      type: 'signal',
      title: 'Signal Update Map',
      asset: '/training/images/signal-update-map.png',
    },
    lessons: [
      'Signal Updates are short posts that feed evergreen pages.',
      'Signals cover rumors, draft news, cap news, roster news, injuries, depth chart movement.',
      'Signals must be sourced, clear, and quick.',
      'Signals are not opinion articles.',
    ],
    videoScript:
      'Signal Updates power our evergreen pages. They are fast, short, factual updates about rumors, draft news, cap movement, roster changes, injuries, and depth chart changes. Signals are not mini articles. They should be clear, sourced, and useful. The goal is to keep Sports Mockery current in real time.',
    interactive: 'signal-exercise',
    quiz: [
      {
        question: 'What is a Signal Update?',
        options: [
          'A short, factual update that feeds evergreen pages.',
          'An opinion piece from a guest writer.',
          'A long-form analysis.',
          'A locked premium-only post.',
        ],
        correct: 'A short, factual update that feeds evergreen pages.',
      },
      {
        question: 'Which of these belongs in a Signal Update?',
        options: [
          'A 1,500-word column on team identity.',
          'A sourced injury status update on a starting linebacker.',
          'A take on the front office’s long-term philosophy.',
          'A breakdown of fan reaction across social media.',
        ],
        correct: 'A sourced injury status update on a starting linebacker.',
      },
      {
        question: 'What must every Signal Update include?',
        options: [
          'A celebrity quote.',
          'A clear source or attribution.',
          'A poll.',
          'A video.',
        ],
        correct: 'A clear source or attribution.',
      },
    ],
    passScore: 80,
  },
  {
    slug: 'engagement-score',
    title: 'Engagement Score',
    subtitle: 'How writers are evaluated.',
    description:
      'Your Engagement Score weighs comments, time on page, scroll depth, headline integrity, originality, depth, and accuracy — not raw clicks.',
    duration: '14 min',
    order: 4,
    video: {
      src: '/training/videos/training-engagement-score.mp4',
      poster: '/training/images/engagement-score-breakdown.png',
      fallback: 'Video coming soon',
    },
    visual: {
      type: 'engagement',
      title: 'Engagement Score Breakdown',
      asset: '/training/images/engagement-score-breakdown.png',
    },
    lessons: [
      'Comments — 20%',
      'Time on Page — 20%',
      'Scroll Depth — 15%',
      'Headline Integrity — 15%',
      'Originality — 10%',
      'Depth — 10%',
      'Accuracy — 10%',
      'A high-view article with poor time on page and scroll depth is not a win.',
      'A lower-view article with high retention, comments, and trust can be extremely valuable.',
    ],
    videoScript:
      'Your Engagement Score measures whether readers actually value your work. It includes comments, time on page, scroll depth, headline integrity, originality, depth, and accuracy. A clickbait article with 20,000 views but 10 seconds of time on page is weak. An article with fewer views but high scroll depth and comments may be much stronger.',
    interactive: 'engagement-explainer',
    quiz: [
      {
        question: 'Which article is stronger under the Engagement Score?',
        options: [
          '40K views, 0:12 average time on page, 8% scroll depth, 0 comments.',
          '8K views, 2:00 average time on page, 80% scroll depth, 15 comments.',
          '100K views, 0:05 average time on page, 4% scroll depth.',
          '500 views, 0:02 average time on page, no comments.',
        ],
        correct: '8K views, 2:00 average time on page, 80% scroll depth, 15 comments.',
      },
      {
        question: 'What is the largest single weighting in the Engagement Score?',
        options: [
          'Headline integrity at 30%.',
          'Comments at 20% (tied with time on page at 20%).',
          'Accuracy at 50%.',
          'Page views at 25%.',
        ],
        correct: 'Comments at 20% (tied with time on page at 20%).',
      },
      {
        question: 'A high-view, low-retention article is:',
        options: [
          'A traffic win regardless of retention.',
          'A weak result under EDGE — engagement is the metric, not raw views.',
          'Worth republishing.',
          'A bonus-worthy moment.',
        ],
        correct: 'A weak result under EDGE — engagement is the metric, not raw views.',
      },
    ],
    passScore: 80,
  },
  {
    slug: 'headline-integrity',
    title: 'Headline Integrity',
    subtitle: 'Strong headlines without bait-and-switch.',
    description:
      'Headlines must be specific, interesting, and honest. No fake urgency, no overstating rumors, no headline that promises what the article does not deliver.',
    duration: '10 min',
    order: 5,
    video: {
      src: '/training/videos/training-headline-integrity.mp4',
      poster: '/training/images/headline-integrity-examples.png',
      fallback: 'Video coming soon',
    },
    visual: {
      type: 'headline',
      title: 'Headline Integrity — Bad vs Strong',
      asset: '/training/images/headline-integrity-examples.png',
    },
    lessons: [
      'Headlines must create interest without misleading readers.',
      'No fake urgency.',
      'No exaggerating rumors as facts.',
      'No headline that promises something the article does not deliver.',
      'Bad: “You Won’t Believe What Caleb Williams Just Did.”',
      'Good: “Caleb Williams’ Latest Comments Reveal How He Views the Bears’ Offensive Reset.”',
    ],
    videoScript:
      'Headline integrity is simple. The headline must match the article. You can be bold. You can be interesting. But you cannot trick the reader. A strong headline creates curiosity and delivers on it. A bad headline creates a click and destroys trust.',
    interactive: 'headline-exercise',
    quiz: [
      {
        question: 'What is headline integrity?',
        options: [
          'Using as many keywords as possible for SEO.',
          'The headline accurately reflects the content.',
          'Capitalizing every word.',
          'Writing the longest headline allowed.',
        ],
        correct: 'The headline accurately reflects the content.',
      },
      {
        question: 'Which headline is stronger?',
        options: [
          '“You Won’t Believe What Caleb Williams Just Did.”',
          '“Caleb Williams’ Latest Comments Reveal How He Views the Bears’ Offensive Reset.”',
          '“BREAKING: Caleb Williams.”',
          '“Caleb Williams Stuns Chicago.”',
        ],
        correct:
          '“Caleb Williams’ Latest Comments Reveal How He Views the Bears’ Offensive Reset.”',
      },
      {
        question: 'A headline frames a rumor as a confirmed fact. Under EDGE, that is:',
        options: [
          'Acceptable if the post is timely.',
          'A headline integrity violation.',
          'A bonus opportunity.',
          'Standard practice.',
        ],
        correct: 'A headline integrity violation.',
      },
    ],
    passScore: 80,
  },
  {
    slug: 'originality-depth',
    title: 'Originality + Depth',
    subtitle: 'Stop rewriting. Start adding value.',
    description:
      'Originality means adding something new. Depth means explaining impact, context, and consequences. Always answer “why does this matter?”',
    duration: '12 min',
    order: 6,
    video: {
      src: '/training/videos/training-originality-depth.mp4',
      poster: '/training/images/originality-depth-framework.png',
      fallback: 'Video coming soon',
    },
    visual: {
      type: 'authority',
      title: 'Originality + Depth Framework',
      asset: '/training/images/originality-depth-framework.png',
    },
    lessons: [
      'Originality means adding something new.',
      'Depth means explaining impact, context, and consequences.',
      'Writers must answer “why does this matter?”',
      'Articles should include perspective only Sports Mockery can provide.',
    ],
    videoScript:
      'Originality means you are not just repeating what someone else reported. Depth means you explain what it means. Ask yourself: what do I know, see, or believe that gives fans a better understanding of this story? If you cannot answer that, the article is not ready.',
    quiz: [
      {
        question: 'What is originality?',
        options: [
          'Republishing another outlet’s scoop quickly.',
          'Adding value beyond what has already been reported.',
          'Using the most popular keywords.',
          'Posting before any other Chicago site.',
        ],
        correct: 'Adding value beyond what has already been reported.',
      },
      {
        question: 'What does depth mean for an EDGE article?',
        options: [
          'Word count above 2,000.',
          'Explaining impact, context, and consequences.',
          'A long bullet list of stats.',
          'Two embedded videos.',
        ],
        correct: 'Explaining impact, context, and consequences.',
      },
      {
        question: 'You cannot answer “why does this matter to Chicago fans?” You should:',
        options: [
          'Publish anyway and let readers figure it out.',
          'Pause and rework the article — or convert it to a Signal Update.',
          'Ask Scout to write it.',
          'Add a poll.',
        ],
        correct: 'Pause and rework the article — or convert it to a Signal Update.',
      },
    ],
    passScore: 80,
  },
  {
    slug: 'accuracy-rumors',
    title: 'Accuracy + Rumor Framing',
    subtitle: 'Trust is the business model.',
    description:
      'Rumors are labeled as rumors. Reports are attributed. Speculation is never framed as fact. Accuracy protects the brand and the writer.',
    duration: '10 min',
    order: 7,
    video: {
      src: '/training/videos/training-accuracy-rumors.mp4',
      poster: '/training/images/rumor-framing-guide.png',
      fallback: 'Video coming soon',
    },
    visual: {
      type: 'signal',
      title: 'Rumor Framing Guide',
      asset: '/training/images/rumor-framing-guide.png',
    },
    lessons: [
      'Rumors must be labeled as rumors.',
      'Reports must be attributed.',
      'Do not frame speculation as fact.',
      'Accuracy protects the brand and the writer.',
    ],
    videoScript:
      'Trust is the business model. If something is a rumor, call it a rumor. If something is reported, attribute it. If something is your opinion, make that clear. Do not frame speculation as fact. Accuracy protects you and protects Sports Mockery.',
    quiz: [
      {
        question: 'How should rumors be framed?',
        options: [
          'As facts to drive urgency.',
          'Clearly labeled as rumors and sourced.',
          'Hidden inside the headline only.',
          'Not at all — never publish rumors.',
        ],
        correct: 'Clearly labeled as rumors and sourced.',
      },
      {
        question: 'You report another outlet’s scoop. What is required?',
        options: [
          'Nothing — repost the text.',
          'Attribute the source clearly.',
          'Change a few words and publish.',
          'Wait 24 hours.',
        ],
        correct: 'Attribute the source clearly.',
      },
      {
        question: 'Why does accuracy matter under EDGE?',
        options: [
          'It is required by the CMS.',
          'Trust is the business model — accuracy protects writers and the brand.',
          'Only because Google requires it.',
          'It does not — speed matters more.',
        ],
        correct: 'Trust is the business model — accuracy protects writers and the brand.',
      },
    ],
    passScore: 80,
  },
  {
    slug: 'article-analysis',
    title: 'Reading Your Article Analysis',
    subtitle: 'How to understand your score.',
    description:
      'The Article Analysis Detail under the Google tab shows engagement, retention, originality, depth, accuracy, and headline integrity for every piece you publish.',
    duration: '12 min',
    order: 8,
    video: {
      src: '/training/videos/training-article-analysis.mp4',
      poster: '/training/images/article-analysis-dashboard.png',
      fallback: 'Video coming soon',
    },
    visual: {
      type: 'engagement',
      title: 'Article Analysis Dashboard',
      asset: '/training/images/article-analysis-dashboard.png',
    },
    lessons: [
      'Open the Article Analysis Detail under the Google tab in your dashboard.',
      'Check comments, time on page, scroll depth, originality, depth, accuracy, and headline integrity.',
      'The system explains why the article scored high or low.',
      'Use the score to improve future articles, not to chase clicks.',
    ],
    videoScript:
      'The Article Analysis Detail shows why your score is what it is. If time on page is low, your intro may be weak. If scroll depth is low, your structure may be dragging. If comments are low, your article may lack a strong point of view. Use the dashboard as a coach.',
    interactive: 'article-analysis',
    quiz: [
      {
        question: 'If time on page is low, what should a writer review first?',
        options: [
          'The headline image.',
          'Intro, structure, and value delivery.',
          'The publish time.',
          'The comment section.',
        ],
        correct: 'Intro, structure, and value delivery.',
      },
      {
        question: 'A low scroll depth most likely points to:',
        options: [
          'A bad image.',
          'A dragging structure or weak middle section.',
          'Too many ads.',
          'Server speed.',
        ],
        correct: 'A dragging structure or weak middle section.',
      },
      {
        question: 'Low comments most likely indicate:',
        options: [
          'The article lacks a strong point of view.',
          'Comments are turned off.',
          'Readers are too busy.',
          'The CMS is broken.',
        ],
        correct: 'The article lacks a strong point of view.',
      },
    ],
    passScore: 80,
  },
  {
    slug: 'certification',
    title: 'Final Certification',
    subtitle: 'Prove you understand the EDGE standard.',
    description:
      'Final exam covering the full EDGE curriculum — Authority vs Signal classification, headline integrity, rumor framing, and article quality.',
    duration: '15 min',
    order: 9,
    video: {
      src: '/training/videos/training-certification.mp4',
      poster: '/training/images/edge-certified-badge.png',
      fallback: 'Video coming soon',
    },
    visual: {
      type: 'authority',
      title: 'EDGE Certified',
      asset: '/training/images/edge-certified-badge.png',
    },
    lessons: [
      '10-question exam covering the full EDGE curriculum.',
      'Score 80% or higher to earn certification.',
      'Certification unlocks Authority Article publishing for authors.',
      'Editors and admins can override the gate when needed.',
    ],
    videoScript:
      'To become EDGE certified, you must prove you understand the system. You will classify Signals vs Authority Articles, fix weak headlines, identify misleading framing, and improve a low-quality article. Certification unlocks full publishing trust.',
    interactive: 'certification-quiz',
    quiz: [
      {
        question: 'What is the new Sports Mockery standard?',
        options: [
          'Quality, trust, engagement, and insight.',
          'Volume above all.',
          'Match every other Chicago outlet.',
          'Maximize raw page views.',
        ],
        correct: 'Quality, trust, engagement, and insight.',
      },
      {
        question: 'What must every Authority Article include?',
        options: [
          'A clear thesis and original insight.',
          'A celebrity name.',
          'At least 2,000 words.',
          'A photo gallery.',
        ],
        correct: 'A clear thesis and original insight.',
      },
      {
        question: 'A Signal Update is best described as:',
        options: [
          'A short, sourced update that feeds evergreen pages.',
          'A long opinion piece.',
          'A poll.',
          'A premium-only post.',
        ],
        correct: 'A short, sourced update that feeds evergreen pages.',
      },
      {
        question: 'Time on page and scroll depth together account for what share of the Engagement Score?',
        options: ['10%', '25%', '35%', '60%'],
        correct: '35%',
      },
      {
        question: 'Comments contribute what share of the Engagement Score?',
        options: ['5%', '10%', '20%', '40%'],
        correct: '20%',
      },
      {
        question: 'Which is a stronger headline?',
        options: [
          '“You Won’t Believe What Caleb Williams Just Did.”',
          '“Caleb Williams’ Latest Comments Reveal How He Views the Bears’ Offensive Reset.”',
          '“BREAKING: Caleb Williams.”',
          '“Caleb Williams Stuns Chicago.”',
        ],
        correct:
          '“Caleb Williams’ Latest Comments Reveal How He Views the Bears’ Offensive Reset.”',
      },
      {
        question: 'How should rumors be framed?',
        options: [
          'As confirmed facts to drive urgency.',
          'Clearly labeled as rumors and sourced.',
          'Inside the headline only.',
          'Hidden in the closing paragraph.',
        ],
        correct: 'Clearly labeled as rumors and sourced.',
      },
      {
        question: 'Originality means:',
        options: [
          'Republishing scoops as fast as possible.',
          'Adding value beyond what has already been reported.',
          'Using popular keywords.',
          'Posting first regardless of accuracy.',
        ],
        correct: 'Adding value beyond what has already been reported.',
      },
      {
        question: 'A low scroll depth most likely points to:',
        options: [
          'A bad image.',
          'A dragging structure or weak middle section.',
          'Too many ads.',
          'Slow servers.',
        ],
        correct: 'A dragging structure or weak middle section.',
      },
      {
        question: 'Why does accuracy matter under EDGE?',
        options: [
          'It is a CMS requirement.',
          'Trust is the business model — accuracy protects writers and the brand.',
          'Only Google requires it.',
          'It does not — speed wins.',
        ],
        correct: 'Trust is the business model — accuracy protects writers and the brand.',
      },
    ],
    passScore: 80,
  },
]

export const TOTAL_MODULES = TRAINING_MODULES.length

export function findModule(slug: string): TrainingModule | undefined {
  return TRAINING_MODULES.find((m) => m.slug === slug)
}

export function nextModule(slug: string): TrainingModule | undefined {
  const idx = TRAINING_MODULES.findIndex((m) => m.slug === slug)
  if (idx < 0 || idx >= TRAINING_MODULES.length - 1) return undefined
  return TRAINING_MODULES[idx + 1]
}
