/**
 * Edge Enhancement Layer — Masters 2026 Intelligence
 * ====================================================
 * Injects conviction metrics, briefing strip, focus mode,
 * storytelling copy, and conviction tags into the existing SPA.
 *
 * Does NOT replace or restructure the existing dashboard.
 * Hooks into the rendered DOM after the React SPA mounts.
 */

(function () {
  'use strict';

  // ===================================================================
  // PART 1 — CONVICTION METRIC ENGINE
  // ===================================================================

  /**
   * Extracts player data from the React fiber tree.
   * The SPA stores player objects with known fields like full_name,
   * masters_alpha_score, implied_probability, etc.
   * We walk the React internal fiber to find the data array.
   */
  function extractPlayersFromFiber() {
    var root = document.getElementById('root');
    if (!root || !root._reactRootContainer && !root.__reactFiber$) {
      // Try React 18+ internals
      var fiberKey = Object.keys(root || {}).find(function (k) {
        return k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$');
      });
      if (!fiberKey) return null;
    }
    return null; // Fiber extraction is fragile; use DOM scraping instead
  }

  /**
   * Extracts player data by scanning the compiled JS bundle's
   * inlined data. The bundle contains player objects as JSON literals.
   * We intercept them via a global data store or scrape from DOM.
   */
  var _playerCache = null;
  var _enrichedCache = null;

  /**
   * Scrape player data from rendered table rows and card elements.
   * Returns array of player objects with whatever fields are visible.
   */
  function scrapePlayersFromDOM() {
    var players = [];
    var seen = new Set();

    // Strategy 1: Scrape from table rows
    var rows = document.querySelectorAll('main table tbody tr');
    rows.forEach(function (row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 3) return;

      // Player name is typically in first few cells
      var nameCell = row.querySelector('td .font-semibold, td .font-bold, td [class*="font-semibold"]');
      if (!nameCell) {
        // Try finding name from cell text patterns
        for (var i = 0; i < Math.min(cells.length, 4); i++) {
          var txt = cells[i].textContent.trim();
          // Player names have 2+ words, no pure numbers
          if (txt && /^[A-Z][a-z]+ [A-Z]/.test(txt) && !/^\d/.test(txt)) {
            nameCell = cells[i];
            break;
          }
        }
      }
      if (!nameCell) return;

      var name = nameCell.textContent.trim();
      if (seen.has(name) || !name || name.length < 4) return;
      seen.add(name);

      var player = { full_name: name, _row: row };

      // Extract numeric values from cells
      cells.forEach(function (cell) {
        var text = cell.textContent.trim();
        // Odds format: +350, +1000, etc.
        if (/^\+\d{3,}$/.test(text)) {
          player._odds_text = text;
        }
      });

      players.push(player);
    });

    return players;
  }

  /**
   * Intercept the player data from the bundle by hooking into
   * Array.prototype methods used during React render.
   * This is the most reliable extraction method.
   */
  function interceptPlayerData() {
    if (_playerCache) return _playerCache;

    // Try extracting from any global/window exposure
    var candidates = [];

    // Walk all script-created globals
    for (var key in window) {
      try {
        var val = window[key];
        if (Array.isArray(val) && val.length > 80 && val.length < 100) {
          if (val[0] && val[0].full_name && val[0].masters_alpha_score !== undefined) {
            _playerCache = val;
            return val;
          }
        }
      } catch (e) { /* skip inaccessible */ }
    }

    // Strategy: Monkey-patch JSON.parse to capture the data if it's lazy-loaded
    // (not needed if data is inlined in bundle — it is in this case)

    return null;
  }

  /**
   * Final strategy: Extract embedded player JSON from the bundle source.
   * The data is inlined as object literals in the compiled JS.
   */
  function extractFromBundleSource(callback) {
    var scriptEl = document.querySelector('script[src*="index-"]');
    if (!scriptEl) return callback(null);

    fetch(scriptEl.src)
      .then(function (r) { return r.text(); })
      .then(function (src) {
        // Find player objects by matching the pattern:
        // {"full_name":"...",..."masters_alpha_score":...}
        var re = /\{[^{}]*"full_name":"[^"]+?"[^{}]*"masters_alpha_score":\d+[^{}]*"archetype_scores":\{[^}]*\}[^}]*\}/g;
        var matches = src.match(re);
        if (!matches || matches.length < 10) {
          // Try simpler pattern
          re = /\{"full_name":"[^"]+","tour":"[^"]+","age":\d+[^}]+\}/g;
          matches = src.match(re);
        }
        if (!matches) return callback(null);

        var players = [];
        var seen = new Set();
        matches.forEach(function (m) {
          try {
            // The archetype_scores nested object may cause issues — add closing brace
            var fixed = m;
            // Count braces to see if balanced
            var opens = (fixed.match(/\{/g) || []).length;
            var closes = (fixed.match(/\}/g) || []).length;
            while (closes < opens) {
              fixed += '}';
              closes++;
            }
            var obj = JSON.parse(fixed);
            if (obj.full_name && !seen.has(obj.full_name)) {
              seen.add(obj.full_name);
              players.push(obj);
            }
          } catch (e) { /* skip malformed */ }
        });

        _playerCache = players.length > 50 ? players : null;
        callback(_playerCache);
      })
      .catch(function () { callback(null); });
  }

  // ---------------------------------------------------------------
  // Conviction Metric Calculations
  // ---------------------------------------------------------------

  /**
   * Clamp value to 0–100 range.
   */
  function clamp(v) {
    return Math.max(0, Math.min(100, v));
  }

  /**
   * Convert American odds to implied probability (0–1).
   * +350 → 0.2222, -150 → 0.6
   */
  function oddsToImplied(oddsStr) {
    if (typeof oddsStr === 'number') return oddsStr; // already probability
    if (!oddsStr) return 0;
    var n = parseInt(String(oddsStr).replace('+', ''), 10);
    if (isNaN(n)) return 0;
    if (String(oddsStr).startsWith('-')) {
      return Math.abs(n) / (Math.abs(n) + 100);
    }
    return 100 / (n + 100);
  }

  /**
   * Normalize a value within a [min, max] range to 0–100.
   */
  function normalize(value, min, max) {
    if (max === min) return 50;
    return clamp(((value - min) / (max - min)) * 100);
  }

  /**
   * Get min/max of a numeric field across all players.
   */
  function fieldRange(players, field) {
    var vals = players.map(function (p) { return p[field]; }).filter(function (v) { return v != null && !isNaN(v); });
    return { min: Math.min.apply(null, vals), max: Math.max.apply(null, vals) };
  }

  /**
   * WIN EQUITY (0–100)
   * How often this player realistically wins this tournament profile.
   *
   * Formula: Weighted blend of:
   *   - mc_win (Monte Carlo win %)            — 30% weight
   *   - adjusted_win_equity                   — 25% weight
   *   - masters_alpha_score                   — 20% weight
   *   - performance_score                     — 15% weight
   *   - sunday_closer (finishing ability)      — 10% weight
   *
   * All inputs normalized to 0–100 before blending.
   */
  function calcWinEquity(p, ranges) {
    var mcWin = normalize(p.mc_win || 0, 0, ranges.mc_win.max);
    var adjEquity = normalize(p.adjusted_win_equity || 0, 0, 100);
    var alpha = normalize(p.masters_alpha_score || 0, 0, 100);
    var perf = normalize(p.performance_score || 0, 0, 100);
    var closer = normalize(p.sunday_closer || 0, ranges.sunday_closer.min, ranges.sunday_closer.max);

    return clamp(
      mcWin * 0.30 +
      adjEquity * 0.25 +
      alpha * 0.20 +
      perf * 0.15 +
      closer * 0.10
    );
  }

  /**
   * TOP 10 EQUITY (0–100)
   * How often this player realistically stays in contention.
   *
   * Formula: Weighted blend of:
   *   - mc_top10 (Monte Carlo top-10 %)       — 30% weight
   *   - top10_rate (historical top-10 rate)    — 20% weight
   *   - avg_consistency                        — 20% weight
   *   - augusta_fit_composite                  — 15% weight
   *   - cut_rate (making the cut)              — 15% weight
   */
  function calcTop10Equity(p, ranges) {
    var mcT10 = normalize(p.mc_top10 || 0, 0, ranges.mc_top10.max);
    var histT10 = normalize(p.top10_rate || 0, 0, 1) ;
    var consistency = normalize(p.avg_consistency || 0, ranges.avg_consistency.min, ranges.avg_consistency.max);
    // Lower avg_consistency = more consistent (std dev), so invert
    var consistencyInv = 100 - consistency;
    var augustaFit = normalize(p.augusta_fit_composite || 0, 0, 100);
    var cutRate = normalize(p.cut_rate || 0, 0, 1);

    return clamp(
      mcT10 * 0.30 +
      histT10 * 0.20 +
      consistencyInv * 0.20 +
      augustaFit * 0.15 +
      cutRate * 0.15
    );
  }

  /**
   * STABILITY SCORE (0–100)
   * How likely the player is to hold performance for all 72 holes.
   *
   * Formula: Inverse of volatility signals:
   *   - avg_consistency (lower = more stable)   — 25% weight
   *   - avg_weekend_falloff (lower = better)    — 25% weight
   *   - recovery_elasticity (higher = better)   — 20% weight
   *   - fragility_score (lower = more stable)   — 20% weight (inverted)
   *   - cut_rate                                — 10% weight
   */
  function calcStability(p, ranges) {
    // Invert: lower consistency std dev = more stable
    var consistency = 100 - normalize(p.avg_consistency || 2, ranges.avg_consistency.min, ranges.avg_consistency.max);
    // Invert: lower weekend falloff = more stable
    var falloff = 100 - normalize(p.avg_weekend_falloff || 0, ranges.avg_weekend_falloff.min, ranges.avg_weekend_falloff.max);
    var elasticity = normalize(p.recovery_elasticity || 0, ranges.recovery_elasticity.min, ranges.recovery_elasticity.max);
    // Invert fragility: lower = more stable
    var fragInv = 100 - normalize(p.fragility_score || 50, 0, 100);
    var cutRate = normalize(p.cut_rate || 0, 0, 1);

    return clamp(
      consistency * 0.25 +
      falloff * 0.25 +
      elasticity * 0.20 +
      fragInv * 0.20 +
      cutRate * 0.10
    );
  }

  /**
   * FRAGILITY SCORE (0–100)
   * How likely the player is to break down under Augusta conditions.
   *
   * Formula: Aggregate of collapse risk signals:
   *   - fragility_score (existing)              — 30% weight
   *   - pressure_index (higher = more fragile)  — 25% weight
   *   - avg_weekend_falloff                     — 20% weight
   *   - narrative_inflation                     — 15% weight
   *   - inverse of recovery_elasticity          — 10% weight
   */
  function calcFragility(p, ranges) {
    var fragility = normalize(p.fragility_score || 0, 0, 100);
    var pressure = normalize(p.pressure_index || 0, ranges.pressure_index.min, ranges.pressure_index.max);
    var falloff = normalize(p.avg_weekend_falloff || 0, ranges.avg_weekend_falloff.min, ranges.avg_weekend_falloff.max);
    var inflation = normalize(p.narrative_inflation || 0, ranges.narrative_inflation.min, ranges.narrative_inflation.max);
    var elasticityInv = 100 - normalize(p.recovery_elasticity || 0, ranges.recovery_elasticity.min, ranges.recovery_elasticity.max);

    return clamp(
      fragility * 0.30 +
      pressure * 0.25 +
      falloff * 0.20 +
      inflation * 0.15 +
      elasticityInv * 0.10
    );
  }

  /**
   * VALUE SCORE (0–100)
   * Where model belief most disagrees with market pricing.
   *
   * Formula:
   *   - value_gap (existing model vs market)    — 35% weight
   *   - (adjusted_win_equity - implied_probability) normalized — 30% weight
   *   - hidden_edge_score                       — 20% weight
   *   - inverse of narrative_inflation          — 15% weight
   */
  function calcValueScore(p, ranges) {
    var vGap = normalize(p.value_gap || 0, ranges.value_gap.min, ranges.value_gap.max);
    // Model equity vs market probability — positive = underpriced
    var equityEdge = (p.adjusted_win_equity || 0) - (p.implied_probability || 0);
    var edgeNorm = normalize(equityEdge, ranges._equity_edge.min, ranges._equity_edge.max);
    var hiddenEdge = normalize(p.hidden_edge_score || 0, 0, 100);
    var inflationInv = 100 - normalize(p.narrative_inflation || 0, ranges.narrative_inflation.min, ranges.narrative_inflation.max);

    return clamp(
      vGap * 0.35 +
      edgeNorm * 0.30 +
      hiddenEdge * 0.20 +
      inflationInv * 0.15
    );
  }

  /**
   * Assign a conviction tag based on the 5 computed metrics.
   * Returns { label, cssClass }
   */
  function assignConvictionTag(p) {
    var we = p._winEquity;
    var t10 = p._top10Equity;
    var stab = p._stability;
    var frag = p._fragility;
    var val = p._valueScore;

    // True Contender: high win equity + high stability
    if (we >= 65 && stab >= 60 && frag < 40) {
      return { label: 'True Contender', cssClass: 'true-contender' };
    }
    // Fragile Favorite: high implied prob but high fragility
    if ((p.implied_probability || 0) >= 5 && frag >= 55) {
      return { label: 'Fragile Favorite', cssClass: 'fragile-favorite' };
    }
    // Mispriced Value: high value score
    if (val >= 65 && we >= 30) {
      return { label: 'Mispriced Value', cssClass: 'mispriced-value' };
    }
    // Placement Machine: high top-10 equity + stability, moderate win equity
    if (t10 >= 60 && stab >= 55 && we < 65) {
      return { label: 'Placement Machine', cssClass: 'placement-machine' };
    }
    // Stable Grinder: high stability, lower equity
    if (stab >= 65 && we < 40 && t10 >= 40) {
      return { label: 'Stable Grinder', cssClass: 'stable-grinder' };
    }
    // False Signal: high implied prob or narrative but low model support
    if ((p.narrative_inflation || 0) > 20 && we < 30 && val < 35) {
      return { label: 'False Signal', cssClass: 'false-signal' };
    }

    return null; // No strong conviction tag
  }

  /**
   * Enrich all players with the 5 conviction metrics + tag.
   */
  function enrichPlayers(players) {
    if (!players || players.length === 0) return [];
    if (_enrichedCache) return _enrichedCache;

    // Compute ranges for normalization
    var ranges = {
      mc_win: fieldRange(players, 'mc_win'),
      mc_top10: fieldRange(players, 'mc_top10'),
      avg_consistency: fieldRange(players, 'avg_consistency'),
      avg_weekend_falloff: fieldRange(players, 'avg_weekend_falloff'),
      recovery_elasticity: fieldRange(players, 'recovery_elasticity'),
      pressure_index: fieldRange(players, 'pressure_index'),
      narrative_inflation: fieldRange(players, 'narrative_inflation'),
      value_gap: fieldRange(players, 'value_gap'),
      sunday_closer: fieldRange(players, 'sunday_closer'),
    };

    // Pre-compute equity edge range
    var edges = players.map(function (p) {
      return (p.adjusted_win_equity || 0) - (p.implied_probability || 0);
    });
    ranges._equity_edge = {
      min: Math.min.apply(null, edges),
      max: Math.max.apply(null, edges)
    };

    players.forEach(function (p) {
      p._winEquity = Math.round(calcWinEquity(p, ranges) * 10) / 10;
      p._top10Equity = Math.round(calcTop10Equity(p, ranges) * 10) / 10;
      p._stability = Math.round(calcStability(p, ranges) * 10) / 10;
      p._fragility = Math.round(calcFragility(p, ranges) * 10) / 10;
      p._valueScore = Math.round(calcValueScore(p, ranges) * 10) / 10;
      p._convictionTag = assignConvictionTag(p);
    });

    _enrichedCache = players;
    return players;
  }

  // ===================================================================
  // PART 2 — DOM INJECTION ENGINE
  // ===================================================================

  var INJECTED = {};  // Track what we've already injected

  // ---------------------------------------------------------------
  // A. Intelligence Briefing Strip
  // ---------------------------------------------------------------

  function buildBriefingStrip(players) {
    if (INJECTED.briefingStrip) return;

    var sorted = players.slice().sort(function (a, b) { return (b._winEquity || 0) - (a._winEquity || 0); });

    // Most Mispriced (highest value score)
    var mispriced = players.slice().sort(function (a, b) { return (b._valueScore || 0) - (a._valueScore || 0); })[0];
    // Most Stable
    var stable = players.slice().sort(function (a, b) { return (b._stability || 0) - (a._stability || 0); })[0];
    // Most Fragile (among favorites — implied_prob >= 3%)
    var fragile = players
      .filter(function (p) { return (p.implied_probability || 0) >= 3; })
      .sort(function (a, b) { return (b._fragility || 0) - (a._fragility || 0); })[0];
    // Best Augusta Fit
    var augustaFit = players.slice().sort(function (a, b) { return (b.augusta_fit_composite || 0) - (a.augusta_fit_composite || 0); })[0];

    if (!mispriced || !stable) return;

    var strip = document.createElement('div');
    strip.className = 'edge-briefing-strip';
    strip.setAttribute('role', 'region');
    strip.setAttribute('aria-label', 'Intelligence Briefing');

    var cards = [
      {
        label: 'Most Mispriced',
        player: mispriced.full_name,
        detail: 'Value ' + mispriced._valueScore.toFixed(0) + ' \u00b7 ' + (mispriced.outright_win || ''),
        valueClass: 'cyan'
      },
      {
        label: 'Most Stable',
        player: stable.full_name,
        detail: 'Stability ' + stable._stability.toFixed(0) + ' \u00b7 Fragility ' + stable._fragility.toFixed(0),
        valueClass: 'green'
      },
      {
        label: 'Most Fragile Favorite',
        player: fragile ? fragile.full_name : '—',
        detail: fragile ? 'Fragility ' + fragile._fragility.toFixed(0) + ' \u00b7 ' + (fragile.outright_win || '') : '',
        valueClass: 'red'
      },
      {
        label: 'Best Augusta Fit',
        player: augustaFit ? augustaFit.full_name : '—',
        detail: augustaFit ? 'Fit ' + (augustaFit.augusta_fit_composite || 0).toFixed(0) + ' \u00b7 Alpha ' + (augustaFit.masters_alpha_score || 0).toFixed(0) : '',
        valueClass: 'gold'
      }
    ];

    cards.forEach(function (c) {
      var card = document.createElement('div');
      card.className = 'ebs-card';
      card.innerHTML =
        '<span class="ebs-label">' + c.label + '</span>' +
        '<span class="ebs-player">' + c.player + '</span>' +
        '<span class="ebs-detail"><span class="ebs-value ' + c.valueClass + '">' + c.detail + '</span></span>';
      strip.appendChild(card);
    });

    return strip;
  }

  function injectBriefingStrip(players) {
    if (INJECTED.briefingStrip) return;

    var strip = buildBriefingStrip(players);
    if (!strip) return;

    // Find insertion point: after the hero/summary area, before main dashboard content
    // Look for the first major card grid or section after summary stats
    var main = document.querySelector('main');
    if (!main) return;

    // Strategy: Find the first section-like container after summary metrics
    // Look for containers with grid layouts that hold summary cards
    var candidates = main.querySelectorAll('[class*="grid"][class*="gap"]');
    var inserted = false;

    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      // Look for a grid that appears to be summary cards (early in the page, 3-4 columns)
      if (el.children.length >= 3 && el.children.length <= 6) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 2) {
          // Insert after this summary grid
          el.parentNode.insertBefore(strip, el.nextSibling);
          inserted = true;
          break;
        }
      }
    }

    // Fallback: insert at beginning of main's first significant child
    if (!inserted) {
      var firstSection = main.querySelector('[class*="space-y"], [class*="flex-col"]');
      if (firstSection && firstSection.firstChild) {
        // Find first child that's a significant block (not a header)
        var children = firstSection.children;
        for (var j = 0; j < children.length; j++) {
          if (children[j].offsetHeight > 100) {
            firstSection.insertBefore(strip, children[j]);
            inserted = true;
            break;
          }
        }
      }
    }

    if (!inserted && main.children.length > 0) {
      // Last resort: after the first child of main
      main.insertBefore(strip, main.children[1] || null);
    }

    INJECTED.briefingStrip = true;
  }

  // ---------------------------------------------------------------
  // B. Conviction Tags on Table Rows
  // ---------------------------------------------------------------

  function injectConvictionTags(players) {
    if (INJECTED.convictionTags) return;

    var playerMap = {};
    players.forEach(function (p) {
      if (p._convictionTag) {
        playerMap[p.full_name] = p;
      }
    });

    var rows = document.querySelectorAll('main table tbody tr');
    var injected = 0;

    rows.forEach(function (row) {
      // Find the player name in this row
      var nameEl = row.querySelector('[class*="font-semibold"], [class*="font-bold"]');
      if (!nameEl) return;
      var name = nameEl.textContent.trim();

      // Check if we already injected
      if (row.querySelector('.edge-conviction-tag')) return;

      var player = playerMap[name];
      if (!player || !player._convictionTag) return;

      var tag = document.createElement('span');
      tag.className = 'edge-conviction-tag ' + player._convictionTag.cssClass;
      tag.textContent = player._convictionTag.label;
      tag.title = getConvictionTooltip(player);

      // Insert after the name
      nameEl.parentNode.insertBefore(tag, nameEl.nextSibling);
      injected++;
    });

    if (injected > 0) {
      INJECTED.convictionTags = true;
    }
  }

  function getConvictionTooltip(p) {
    return 'Win ' + p._winEquity.toFixed(0) +
      ' \u00b7 T10 ' + p._top10Equity.toFixed(0) +
      ' \u00b7 Stab ' + p._stability.toFixed(0) +
      ' \u00b7 Frag ' + p._fragility.toFixed(0) +
      ' \u00b7 Val ' + p._valueScore.toFixed(0);
  }

  // ---------------------------------------------------------------
  // C. Metric Explainer Text
  // ---------------------------------------------------------------

  var METRIC_EXPLAINERS = {
    'Masters Alpha': 'Composite model score — higher means stronger overall tournament fit.',
    'Alpha Score': 'Composite model score — higher means stronger overall tournament fit.',
    'Performance Score': 'Raw skill rating from strokes gained and recent form.',
    'Market Pattern': 'How market pricing aligns with historical winner profiles.',
    'Hidden Edge': 'Model-detected advantages the market may be underweighting.',
    'Augusta Fit': 'Course-specific compatibility across 5 Augusta dimensions.',
    'Fragility': 'How likely this profile is to break under Augusta pressure.',
    'Fragility Score': 'How likely this profile is to break under Augusta pressure.',
    'Pressure Index': 'Sensitivity to high-stakes moments and weekend pressure.',
    'Win Equity': 'How often this player realistically wins this tournament profile.',
    'Top 10 Equity': 'How often this player stays in realistic contention.',
    'Stability': 'Likelihood of holding performance across all 72 holes.',
    'Value Score': 'Where model belief most disagrees with market pricing.',
    'Green Complex': 'Approach, short game, and putting skill on Augusta greens.',
    'Decision Zone': 'Ability to attack par-5s and manage go/no-go decisions.',
    'Implied Probability': 'Market-implied win probability derived from betting odds.',
    'Conviction Tier': 'Model confidence level — Strong Buy, Buy, or Hold.'
  };

  function injectMetricExplainers() {
    if (INJECTED.explainers) return;

    // Find header/label elements that match known metric names
    var allText = document.querySelectorAll('main h3, main h4, main [class*="font-semibold"], main [class*="uppercase"][class*="tracking"]');
    var injected = 0;

    allText.forEach(function (el) {
      var text = el.textContent.trim();
      // Remove trailing characters like colons, parentheses
      var clean = text.replace(/[:\s(]+$/, '').replace(/\s*\(\d+%\)$/, '').trim();

      if (METRIC_EXPLAINERS[clean] && !el.querySelector('.edge-metric-explainer') && !el.nextElementSibling?.classList?.contains('edge-metric-explainer')) {
        var explainer = document.createElement('span');
        explainer.className = 'edge-metric-explainer';
        explainer.textContent = METRIC_EXPLAINERS[clean];

        // If it's a small label, insert after; if it's a heading, insert as next sibling
        if (el.tagName === 'H3' || el.tagName === 'H4') {
          el.parentNode.insertBefore(explainer, el.nextSibling);
        } else {
          // Append inside or after
          el.parentNode.insertBefore(explainer, el.nextSibling);
        }
        injected++;
      }
    });

    if (injected > 2) {
      INJECTED.explainers = true;
    }
  }

  // ---------------------------------------------------------------
  // D. Focus Mode Toggle
  // ---------------------------------------------------------------

  function injectFocusToggle() {
    if (INJECTED.focusToggle) return;

    // Find the table header area or a toolbar/filter bar
    var filterBar = document.querySelector('main [class*="flex"][class*="gap"][class*="items-center"]');
    if (!filterBar) {
      // Try finding any control bar near the table
      var tables = document.querySelectorAll('main table');
      if (tables.length > 0) {
        // Look for controls above the first table
        filterBar = tables[0].closest('[class*="rounded"]');
        if (filterBar) {
          filterBar = filterBar.querySelector('[class*="flex"][class*="gap"]');
        }
      }
    }
    if (!filterBar) return;

    // Check if there's already a toggle
    if (document.querySelector('.edge-focus-toggle')) return;

    var toggle = document.createElement('button');
    toggle.className = 'edge-focus-toggle';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('title', 'Focus mode highlights Win Equity, Top 10, Stability, Fragility, and Value');
    toggle.innerHTML = '<span class="toggle-dot"></span>Focus';

    toggle.addEventListener('click', function () {
      var isActive = document.body.classList.toggle('edge-focus-mode');
      toggle.classList.toggle('active', isActive);
      toggle.setAttribute('aria-pressed', String(isActive));

      // Apply dimming to non-essential table columns
      applyFocusDimming(isActive);
    });

    filterBar.appendChild(toggle);
    INJECTED.focusToggle = true;
  }

  /**
   * In focus mode, dim table columns that aren't in the core 5 metrics.
   * We identify columns by header text and apply .edge-dim class.
   */
  function applyFocusDimming(active) {
    var tables = document.querySelectorAll('main table');
    tables.forEach(function (table) {
      var headers = table.querySelectorAll('thead th');
      var focusKeywords = [
        'name', 'player', 'rank', '#',
        'alpha', 'win', 'equity', 'top 10', 'top10', 't10',
        'stab', 'fragil', 'value', 'odds', 'conviction',
        'fit', 'augusta'
      ];

      headers.forEach(function (th, colIdx) {
        var text = th.textContent.toLowerCase().trim();
        var isFocusCol = focusKeywords.some(function (kw) { return text.indexOf(kw) !== -1; });

        if (active && !isFocusCol && text.length > 0) {
          th.classList.add('edge-dim');
          // Dim corresponding body cells
          var bodyCells = table.querySelectorAll('tbody tr td:nth-child(' + (colIdx + 1) + ')');
          bodyCells.forEach(function (td) { td.classList.add('edge-dim'); });
        } else {
          th.classList.remove('edge-dim');
          var bodyCells2 = table.querySelectorAll('tbody tr td:nth-child(' + (colIdx + 1) + ')');
          bodyCells2.forEach(function (td) { td.classList.remove('edge-dim'); });
        }
      });
    });
  }

  // ---------------------------------------------------------------
  // E. Section Storytelling Intros
  // ---------------------------------------------------------------

  var SECTION_INTROS = {
    'Alpha Rankings': 'These are the players whose profile most closely matches what Augusta rewards. Alpha combines performance, market pattern, and hidden edge into a single conviction score.',
    'Field Breakdown': 'How the 93-player field distributes across conviction tiers. The market concentrates attention at the top — but the model finds edge throughout.',
    'Augusta Fit Engine': 'Augusta National is unlike any other course. These scores break down each player\'s compatibility across green reading, distance, decision-making, and institutional knowledge.',
    'Augusta Fit': 'Augusta National is unlike any other course. These scores break down each player\'s compatibility across green reading, distance, decision-making, and institutional knowledge.',
    'Augusta DNA': 'Historical patterns that repeat at Augusta. Small misses compound quickly on this course — fragility matters more here than at any other major.',
    'Market Gaps': 'Where the model\'s belief most disagrees with what the market is pricing. Overpriced players carry narrative inflation. Underpriced players carry hidden edge.',
    'Historical': 'Past performance at Augusta is one of the strongest predictive signals in golf. These patterns show who thrives here and who struggles.',
    'Betting Intelligence': 'Odds reflect crowd consensus. The model surfaces where that consensus is weakest and where exploitable gaps exist.',
    'Player Explorer': 'Explore the full field with conviction metrics. Focus mode highlights the five signals that matter most: Win Equity, Top 10 Equity, Stability, Fragility, and Value.'
  };

  function injectSectionIntros() {
    if (INJECTED.sectionIntros) return;

    var headings = document.querySelectorAll('main h2, main h3');
    var injected = 0;

    headings.forEach(function (h) {
      var text = h.textContent.trim();
      // Remove icons/emoji from text
      var clean = text.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();

      Object.keys(SECTION_INTROS).forEach(function (key) {
        if (clean.indexOf(key) !== -1 && !h.parentNode.querySelector('.edge-section-intro')) {
          var intro = document.createElement('p');
          intro.className = 'edge-section-intro';
          intro.textContent = SECTION_INTROS[key];
          h.parentNode.insertBefore(intro, h.nextSibling);
          injected++;
        }
      });
    });

    if (injected > 0) {
      INJECTED.sectionIntros = true;
    }
  }

  // ---------------------------------------------------------------
  // F. Inject Mini Metrics on Player Cards (non-table views)
  // ---------------------------------------------------------------

  function injectCardMetrics(players) {
    if (INJECTED.cardMetrics) return;

    var playerMap = {};
    players.forEach(function (p) {
      playerMap[p.full_name] = p;
    });

    // Find card-like containers with player names
    var cards = document.querySelectorAll('main [class*="rounded"][class*="border"][class*="bg-card"]');
    var injected = 0;

    cards.forEach(function (card) {
      if (card.querySelector('.edge-metrics-row')) return;

      // Find player name inside card
      var nameEl = card.querySelector('[class*="font-semibold"], [class*="font-bold"]');
      if (!nameEl) return;
      var name = nameEl.textContent.trim();
      var player = playerMap[name];
      if (!player || !player._winEquity) return;

      var row = document.createElement('div');
      row.className = 'edge-metrics-row';

      var metrics = [
        { label: 'WIN', value: player._winEquity.toFixed(0), highlight: player._winEquity >= 60 },
        { label: 'T10', value: player._top10Equity.toFixed(0), highlight: player._top10Equity >= 55 },
        { label: 'STB', value: player._stability.toFixed(0), highlight: player._stability >= 60 },
        { label: 'FRG', value: player._fragility.toFixed(0), highlight: player._fragility >= 55 },
        { label: 'VAL', value: player._valueScore.toFixed(0), highlight: player._valueScore >= 60 }
      ];

      metrics.forEach(function (m) {
        var chip = document.createElement('span');
        chip.className = 'edge-mini-metric' + (m.highlight ? ' highlight' : '');
        chip.innerHTML = '<span class="mm-label">' + m.label + '</span>' + m.value;
        row.appendChild(chip);
      });

      // Find a good insertion point inside the card
      var insertTarget = card.querySelector('[class*="text-muted"], [class*="text-sm"]');
      if (insertTarget) {
        insertTarget.parentNode.insertBefore(row, insertTarget.nextSibling);
      } else {
        card.appendChild(row);
      }
      injected++;
    });

    if (injected > 0) {
      INJECTED.cardMetrics = true;
    }
  }

  // ===================================================================
  // PART 3 — ORCHESTRATION
  // ===================================================================

  var MAX_RETRIES = 30;
  var RETRY_INTERVAL = 800; // ms
  var retryCount = 0;

  function runEnhancements() {
    // Only run on dashboard view, not briefing
    var hash = window.location.hash;
    var isBriefing = !hash || hash === '#' || hash === '#/' || hash === '#/briefing' || hash === '#/briefing/';

    // Check if SPA has rendered meaningful content
    var main = document.querySelector('main');
    if (!main || main.children.length === 0) {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(runEnhancements, RETRY_INTERVAL);
      }
      return;
    }

    // Check if there's a table or significant content rendered
    var hasTable = main.querySelector('table');
    var hasCards = main.querySelectorAll('[class*="rounded"][class*="border"]').length > 3;

    if (!hasTable && !hasCards && !isBriefing) {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(runEnhancements, RETRY_INTERVAL);
      }
      return;
    }

    // Extract player data from bundle
    var players = interceptPlayerData();
    if (players) {
      enrichAndInject(players);
    } else {
      // Fall back to bundle extraction
      extractFromBundleSource(function (extracted) {
        if (extracted) {
          enrichAndInject(extracted);
        } else {
          // Even without full player data, inject storytelling + explainers
          injectSectionIntros();
          injectMetricExplainers();
          injectFocusToggle();
        }
      });
    }
  }

  function enrichAndInject(players) {
    var enriched = enrichPlayers(players);

    // Inject all enhancements
    injectBriefingStrip(enriched);
    injectConvictionTags(enriched);
    injectMetricExplainers();
    injectSectionIntros();
    injectFocusToggle();
    injectCardMetrics(enriched);

    // Log for debugging
    if (window.console && window.console.log) {
      console.log(
        '%c[Edge Enhancement Layer]%c Enriched ' + enriched.length + ' players with conviction metrics.',
        'color: hsl(51, 100%, 50%); font-weight: bold;',
        'color: inherit;'
      );

      // Log top 5 by Win Equity
      var top5 = enriched.slice().sort(function (a, b) { return b._winEquity - a._winEquity; }).slice(0, 5);
      console.table(top5.map(function (p) {
        return {
          Player: p.full_name,
          'Win Equity': p._winEquity,
          'Top 10': p._top10Equity,
          Stability: p._stability,
          Fragility: p._fragility,
          Value: p._valueScore,
          Tag: p._convictionTag ? p._convictionTag.label : '—'
        };
      }));
    }

    // Expose enriched data globally for manual inspection
    window.__edgePlayers = enriched;
  }

  // ---------------------------------------------------------------
  // Re-run on hash change (SPA navigation)
  // ---------------------------------------------------------------

  function onRouteChange() {
    // Reset injection flags for per-view elements
    INJECTED.convictionTags = false;
    INJECTED.explainers = false;
    INJECTED.sectionIntros = false;
    INJECTED.focusToggle = false;
    INJECTED.cardMetrics = false;

    retryCount = 0;
    // Small delay to let React re-render
    setTimeout(runEnhancements, 600);
  }

  window.addEventListener('hashchange', onRouteChange);

  // Also observe DOM mutations for SPA view transitions
  var mutationTimer = null;
  var observer = new MutationObserver(function () {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(function () {
      if (!INJECTED.convictionTags || !INJECTED.sectionIntros) {
        // Re-attempt injection for elements that may not have been ready
        if (_enrichedCache) {
          injectConvictionTags(_enrichedCache);
          injectCardMetrics(_enrichedCache);
        }
        injectSectionIntros();
        injectMetricExplainers();
        injectFocusToggle();
      }
    }, 500);
  });

  var root = document.getElementById('root');
  if (root) {
    observer.observe(root, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------------
  // Initial boot
  // ---------------------------------------------------------------

  // Wait for SPA to mount before running
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(runEnhancements, 1000);
    });
  } else {
    setTimeout(runEnhancements, 1000);
  }

})();
