/**
 * Benjamin Jonson Feature Block
 * Injected below the hero on the Masters briefing page.
 * Premium feature panel with hype song audio player.
 */
(function () {
  'use strict';

  // Only inject on briefing page
  function isBriefingPage() {
    var hash = window.location.hash;
    return !hash || hash === '#' || hash === '#/' || hash === '#/briefing' || hash === '#/briefing/';
  }

  // Audio state
  var audio = null;
  var isPlaying = false;
  var animFrame = null;

  function createAudio() {
    if (audio) return audio;
    audio = new Audio('/masters/assets/masters-hype-song.mp3');
    audio.preload = 'auto';
    audio.volume = 0.8;
    return audio;
  }

  // Preload audio immediately
  createAudio();

  function injectFeature() {
    if (!isBriefingPage()) return;
    if (document.getElementById('bj-feature')) return;

    // Find the first section (hero), inject after it
    var root = document.getElementById('root');
    if (!root) return;

    var sections = root.querySelectorAll('section');
    if (sections.length < 2) return;

    var heroSection = sections[0];

    // Create the feature block
    var block = document.createElement('div');
    block.id = 'bj-feature';
    block.innerHTML = [
      '<div class="bj-card">',
      '  <div class="bj-layout">',
      '    <div class="bj-image-col">',
      '      <div class="bj-image-wrapper" id="bj-img-wrapper">',
      '        <img src="/masters/assets/benjamin-jonson.png" alt="Benjamin Jonson" class="bj-image" />',
      '        <div class="bj-glow" id="bj-glow"></div>',
      '      </div>',
      '    </div>',
      '    <div class="bj-content-col">',
      '      <div class="bj-eyebrow">FEATURED INTELLIGENCE PROFILE</div>',
      '      <h2 class="bj-name">Benjamin Jonson</h2>',
      '      <div class="bj-title">The Augusta Quant</div>',
      '      <div class="bj-role">Intelligence Model Providing Data &amp; Analytics</div>',
      '      <p class="bj-desc">Benjamin Jonson models golf like a market, not a leaderboard. He studies fragility, recovery, and pressure behavior to isolate who is most likely to hold across 72 holes\u2009\u2014\u2009and where the market gets it wrong.</p>',
      '      <ul class="bj-bullets">',
      '        <li>Harvard PhD in advanced mathematical systems</li>',
      '        <li>Former Databricks executive focused on predictive modeling at scale</li>',
      '        <li>Built pricing models for golf and prediction markets</li>',
      '        <li>Designed offensive game scripts to outmaneuver the field</li>',
      '      </ul>',
      '      <div class="bj-divider"></div>',
      '      <div class="bj-principle">\u201CThe winner isn\u2019t the best\u2009\u2014\u2009it\u2019s the one who holds.\u201D</div>',
      '      <div class="bj-divider"></div>',
      '      <div class="bj-player">',
      '        <div class="bj-player-label">Masters Hype Song</div>',
      '        <div class="bj-player-controls">',
      '          <button class="bj-play-btn" id="bj-play-btn" aria-label="Play">',
      '            <svg id="bj-icon-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>',
      '            <svg id="bj-icon-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="5" y="4" width="4" height="16"/><rect x="15" y="4" width="4" height="16"/></svg>',
      '          </button>',
      '          <div class="bj-progress-wrap" id="bj-progress-wrap">',
      '            <div class="bj-progress-bar" id="bj-progress-bar"></div>',
      '          </div>',
      '          <div class="bj-time" id="bj-time">0:00 / 0:00</div>',
      '        </div>',
      '      </div>',
      '      <a href="https://open.spotify.com/artist/6b2GcSqnpEn1ThF7z7UmKX?si=oR3mHJnsTSSvCiGI0tOH4Q" target="_blank" rel="noopener noreferrer" class="bj-credit" id="bj-credit">GO HOME TRAV \u00B7 \u201CBear Down, We Came To Win\u201D</a>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    // Insert after hero section
    heroSection.parentNode.insertBefore(block, heroSection.nextSibling);

    // Wire up audio controls
    var playBtn = document.getElementById('bj-play-btn');
    var iconPlay = document.getElementById('bj-icon-play');
    var iconPause = document.getElementById('bj-icon-pause');
    var progressBar = document.getElementById('bj-progress-bar');
    var progressWrap = document.getElementById('bj-progress-wrap');
    var timeEl = document.getElementById('bj-time');
    var imgWrapper = document.getElementById('bj-img-wrapper');
    var glowEl = document.getElementById('bj-glow');
    var creditEl = document.getElementById('bj-credit');

    function formatTime(s) {
      if (!s || isNaN(s)) return '0:00';
      var m = Math.floor(s / 60);
      var sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function updateProgress() {
      if (!audio) return;
      var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      progressBar.style.width = pct + '%';
      timeEl.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
      if (isPlaying) {
        animFrame = requestAnimationFrame(updateProgress);
      }
    }

    function startAnimation() {
      imgWrapper.classList.add('bj-vibing');
      glowEl.classList.add('bj-glow-active');
      creditEl.classList.add('bj-credit-visible');
      creditEl.classList.add('bj-credit-blink');
    }

    function stopAnimation() {
      imgWrapper.classList.remove('bj-vibing');
      glowEl.classList.remove('bj-glow-active');
      creditEl.classList.remove('bj-credit-blink');
    }

    playBtn.addEventListener('click', function () {
      createAudio();
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        iconPlay.style.display = '';
        iconPause.style.display = 'none';
        stopAnimation();
        if (animFrame) cancelAnimationFrame(animFrame);
      } else {
        audio.play().then(function () {
          isPlaying = true;
          iconPlay.style.display = 'none';
          iconPause.style.display = '';
          startAnimation();
          updateProgress();
        }).catch(function () {});
      }
    });

    // Seek on click
    progressWrap.addEventListener('click', function (e) {
      if (!audio || !audio.duration) return;
      var rect = progressWrap.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
      updateProgress();
    });

    // Song ended
    audio.addEventListener('ended', function () {
      isPlaying = false;
      iconPlay.style.display = '';
      iconPause.style.display = 'none';
      stopAnimation();
      progressBar.style.width = '0%';
      audio.currentTime = 0;
    });

    // Update duration once loaded
    audio.addEventListener('loadedmetadata', function () {
      timeEl.textContent = '0:00 / ' + formatTime(audio.duration);
    });
  }

  // Remove on dashboard navigation
  function removeFeature() {
    var el = document.getElementById('bj-feature');
    if (el) el.remove();
    if (audio && isPlaying) {
      audio.pause();
      isPlaying = false;
    }
  }

  // Text replacements map
  var textReplacements = {
    'Where is consensus weakest': 'A data-driven intelligence system that isolates stability, exposes fragility, and reveals where the market gets the Masters wrong.',
    'The Intelligence Briefing': 'Data-Driven Intelligence System',
    '5-chapter editorial analysis — where consensus is weakest and where edge hides': 'Isolating stability, exposing fragility, and revealing where the market gets the Masters wrong'
  };

  function patchHeroText() {
    var root = document.getElementById('root');
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var keys = Object.keys(textReplacements);
    while (walker.nextNode()) {
      var node = walker.currentNode;
      if (!node.textContent) continue;
      for (var i = 0; i < keys.length; i++) {
        if (node.textContent.indexOf(keys[i]) !== -1) {
          node.textContent = textReplacements[keys[i]];
          break;
        }
      }
    }
  }

  // Replace section card SVG icons with yellow golf flag
  var flagsReplaced = false;
  function replaceIconsWithFlags() {
    if (flagsReplaced) return;
    var root = document.getElementById('root');
    if (!root) return;

    // Golf flag SVG — yellow flag on a pole
    var flagSvg = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M5 4v16" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M5 4l12 4-12 4z" fill="#FFD700"/>' +
      '</svg>';

    // Target SVGs inside section cards (rounded-xl/lg containers)
    // but NOT inside nav, aside, buttons, or the Benjamin feature
    var sections = root.querySelectorAll('section');
    var count = 0;
    sections.forEach(function (section) {
      var svgs = section.querySelectorAll('[class*="rounded-xl"] svg, [class*="rounded-lg"] svg');
      svgs.forEach(function (svg) {
        var cl = svg.getAttribute('class') || '';
        // Only replace small icon SVGs (w-3, w-4, w-5), skip large ones
        if ((cl.indexOf('w-4') !== -1 || cl.indexOf('w-3') !== -1 || cl.indexOf('w-5') !== -1) &&
            (cl.indexOf('h-4') !== -1 || cl.indexOf('h-3') !== -1 || cl.indexOf('h-5') !== -1)) {
          // Don't replace if inside a button or interactive element
          if (svg.closest('button') || svg.closest('a') || svg.closest('nav')) return;
          var wrapper = document.createElement('span');
          wrapper.className = 'golf-flag-icon';
          wrapper.innerHTML = flagSvg;
          wrapper.style.display = 'inline-flex';
          wrapper.style.alignItems = 'center';
          wrapper.style.justifyContent = 'center';
          svg.parentNode.replaceChild(wrapper, svg);
          count++;
        }
      });
    });
    if (count > 0) flagsReplaced = true;
  }

  // Run text patches on any page, retrying to catch late renders
  function patchAllText() {
    patchHeroText();
    setTimeout(patchHeroText, 500);
    setTimeout(patchHeroText, 1500);
    setTimeout(patchHeroText, 3000);
  }

  // Watch for SPA mount and route changes
  function check() {
    if (isBriefingPage()) {
      injectFeature();
      setTimeout(patchAllText, 300);
      setTimeout(replaceIconsWithFlags, 500);
    } else {
      removeFeature();
      // Also patch text and flags on dashboard pages
      setTimeout(patchAllText, 300);
      flagsReplaced = false;
      setTimeout(replaceIconsWithFlags, 800);
    }
  }

  // Poll for SPA mount, then watch hash changes
  var mountCheck = setInterval(function () {
    var root = document.getElementById('root');
    if (root && root.querySelector('section')) {
      clearInterval(mountCheck);
      check();
    }
  }, 200);

  window.addEventListener('hashchange', check);

  // Re-check after SPA navigation settles (debounced)
  var debounceTimer = null;
  var observer = new MutationObserver(function () {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      check();
      patchHeroText();
    }, 400);
  });
  observer.observe(document.getElementById('root') || document.body, {
    childList: true,
    subtree: true
  });
})();
