// Draft-day traffic spike load test for sportsmockery.com
//
// Simulates the kind of burst traffic we expect on NFL Draft night and during
// other major news moments: aggregators pulling RSS, fans browsing the homepage,
// and deep-link visitors landing on team and article pages.
//
// Run:
//   k6 run -e BASE_URL=https://test.sportsmockery.com tests/load/draft-spike.k6.js
//
// Pre-launch: do NOT run against test.sportsmockery.com without coordinating
// with infra. See tests/load/README.md.

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://test.sportsmockery.com';

// Articles used by the article_read scenario. Keep this list short and stable;
// rotate it periodically so we are not always exercising the same cache keys.
const ARTICLE_PATHS = [
  '/article/bears-2026-draft-needs',
  '/article/caleb-williams-receivers-depth-chart',
  '/article/cubs-rotation-outlook',
  '/article/bulls-trade-deadline-targets',
  '/article/white-sox-spring-training-storylines',
];

// Article-card data routes hit by the homepage_browse scenario. These mimic
// the next/data fetches that fire as a user scrolls the home feed.
const HOMEPAGE_DATA_PATHS = [
  '/_next/data/BUILD_ID/index.json',
  '/_next/data/BUILD_ID/article-card-1.json',
  '/_next/data/BUILD_ID/article-card-2.json',
];

const cacheHitRate = new Rate('homepage_cache_hits');

export const options = {
  scenarios: {
    homepage_browse: {
      executor: 'ramping-vus',
      exec: 'homepageBrowse',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },   // warm-up
        { duration: '2m', target: 500 },  // ramp to peak
        { duration: '3m', target: 500 },  // peak
        { duration: '1m', target: 0 },    // ramp-down
      ],
      gracefulRampDown: '30s',
    },
    article_read: {
      executor: 'ramping-vus',
      exec: 'articleRead',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 500 },
        { duration: '3m', target: 500 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    breaking_news: {
      executor: 'ramping-vus',
      exec: 'breakingNews',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 500 },
        { duration: '3m', target: 500 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
    homepage_cache_hits: ['rate>0.95'],
  },
};

function isCacheHit(res) {
  const header = res.headers['X-Vercel-Cache'] || res.headers['x-vercel-cache'] || '';
  return header.toUpperCase() === 'HIT' || header.toUpperCase() === 'STALE';
}

export function homepageBrowse() {
  group('homepage_browse', () => {
    const home = http.get(`${BASE_URL}/`);
    check(home, {
      'homepage 200': (r) => r.status === 200,
      'homepage cache HIT or STALE': (r) => isCacheHit(r),
    });
    cacheHitRate.add(isCacheHit(home));

    // Simulate the user scrolling and the home feed lazy-loading two cards.
    for (let i = 1; i <= 2; i++) {
      const card = http.get(`${BASE_URL}/_next/data/BUILD_ID/article-card-${i}.json`);
      check(card, { 'card 200 or 404': (r) => r.status === 200 || r.status === 404 });
    }
    sleep(Math.random() * 2 + 1);
  });
}

export function articleRead() {
  group('article_read', () => {
    const team = http.get(`${BASE_URL}/chicago-bears`);
    check(team, { 'team page 200': (r) => r.status === 200 });

    const articlePath = ARTICLE_PATHS[Math.floor(Math.random() * ARTICLE_PATHS.length)];
    const article = http.get(`${BASE_URL}${articlePath}`);
    check(article, { 'article 200': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 2);
  });
}

export function breakingNews() {
  group('breaking_news', () => {
    const rss = http.get(`${BASE_URL}/api/rss`);
    check(rss, {
      'rss 200': (r) => r.status === 200,
      'rss is xml': (r) => (r.headers['Content-Type'] || '').includes('xml'),
    });

    const sitemap = http.get(`${BASE_URL}/news-sitemap.xml`);
    check(sitemap, {
      'news sitemap 200': (r) => r.status === 200,
      'news sitemap is xml': (r) => (r.headers['Content-Type'] || '').includes('xml'),
    });
    sleep(Math.random() * 5 + 5);
  });
}
