# Freestar — SPA / dynamic ad slot setup request

Copy/paste-ready email to send to the Freestar account manager. Requests the
SPA setup recipe needed to monetize our infinite-article scroll feature.

---

**To:** [Freestar AM email]
**Subject:** SportsMockery — Need SPA / dynamic ad slot setup for infinite article scroll

Hi [AM name],

We're rolling out an aggressive "next article" flow on SportsMockery
(sportsmockery.com / test.sportsmockery.com) to lift session depth and ad
impressions, and we need Freestar configured for SPA-style ad serving so it
works with our new pattern.

**Quick context on the site**

- ~37M sessions / ~7.6M users (rolling 18 months) per GA4
- ~109s avg engagement per active user — most readers land via Google organic, read one article, leave
- Stack: Next.js 16 (App Router) on Vercel, Freestar Prebid via the snippet you provided, ad units stored as HTML and injected per placement

**What we just built**

On every article page, when a reader nears the end, we auto-append up to 2
additional same-team articles inline (Medium-style). Each appended article
gets:

- Its own URL (we swap via `history.replaceState`)
- Its own GA4 `page_view` event
- A full editorial body (hero, content, comments, FAQ)

After the 3rd article, the next click is a hard navigation — that gives us a
clean ad-frequency reset and a clean Core Web Vitals measurement.

**The blocker**

Our current Freestar integration loads ad slots once on initial page render.
The appended articles in the stream end up with dead containers because (a)
their ad-slot HTML is injected dynamically, and (b) Freestar isn't being told
a new pageview happened or that new slots exist.

**What we need from you**

1. **SPA / single-page app setup guide** — your recommended pattern for
   `freestar.queue.push(() => freestar.newAdSlots(...))` and
   `deleteAdSlots(...)` on dynamic content.
2. **Pageview tracking** — the canonical way to fire a Freestar pageview when
   our URL changes (`freestar.trackPageview()` or equivalent), so each
   appended article is a distinct revenue event.
3. **Placement IDs for in-content slots in our infinite scroll context** —
   ideally a placement that's safe to instantiate multiple times per
   page-session under unique slot IDs (one per appended article).
4. **Refresh strategy** — page-level vs slot-level: what do you recommend for
   max RPM here without breaking viewability (50% / 1s) or AdSense's
   auto-refresh policy?
5. **AdSense / GAM compliance review** — we want confirmation our auto-load
   pattern (user-scroll triggered, capped at 3 articles per chain) is
   policy-safe before we ship.
6. **Frequency cap recommendation** — given each chain is one user reading
   2–3 articles in one session, how should the impression caps be configured
   to maximize fill without burning out the user?
7. **Anything else we should know** — e.g. lazy-load behavior, identity /
   consent considerations on URL swap, IAB TCF interactions.

Happy to jump on a 20-minute call if it's faster than email. We have
engineering ready to ship the Freestar integration as soon as we have the
recipe.

Thanks,
Chris
[your phone / Slack handle]
