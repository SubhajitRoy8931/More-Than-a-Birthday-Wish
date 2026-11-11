(() => {
  'use strict';

  const poemText = 'We walked through time believing it was taking us somewhere, never knowing some moments were quietly finding their way back to one another.';
  const experience = document.getElementById('experience');
  const backgroundMusic = document.getElementById('backgroundMusic');
  const BACKGROUND_MUSIC_VOLUME = 0.18;
  let backgroundMusicRequestVersion = 0;
  let backgroundMusicStarted = false;
  const musicToggle = document.getElementById('musicToggle');
  const musicIconOn = document.getElementById('musicIconOn');
  const musicIconMuted = document.getElementById('musicIconMuted');

  if (backgroundMusic) {
    backgroundMusic.loop = true;
    backgroundMusic.preload = 'auto';
    backgroundMusic.volume = BACKGROUND_MUSIC_VOLUME;
  }

  function syncMusicToggle() {
    if (!backgroundMusic || !musicToggle) return;
    const muted = backgroundMusic.muted;
    musicToggle.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
    musicToggle.setAttribute('title', muted ? 'Unmute music' : 'Mute music');
    musicToggle.setAttribute('aria-pressed', String(muted));
    // SVGElement.hidden is not consistently reflected as an HTML attribute.
    // Toggle the actual attribute so the matching SVG icon is shown in every browser.
    if (musicIconOn) musicIconOn.toggleAttribute('hidden', muted);
    if (musicIconMuted) musicIconMuted.toggleAttribute('hidden', !muted);
  }

  // One audio element is the sole soundtrack source. Native looping preserves
  // continuity; pause() preserves currentTime for exact-position resumption.
  // The promise result lets a restored story wait for autoplay permission rather
  // than allowing narration to run ahead of a soundtrack that the browser blocked.
  function requestBackgroundMusicPlayback() {
    if (!backgroundMusic || !backgroundMusicStarted
      || document.visibilityState !== 'visible' || !backgroundMusic.paused) {
      return Promise.resolve(false);
    }

    const requestVersion = backgroundMusicRequestVersion;
    let playRequest;
    try {
      playRequest = backgroundMusic.play();
    } catch (error) {
      if (error && error.name !== 'NotAllowedError') console.warn('Background music playback could not start:', error);
      return Promise.resolve(false);
    }

    const confirmPlayback = () => {
      if (document.visibilityState !== 'visible' || requestVersion !== backgroundMusicRequestVersion) {
        backgroundMusic.pause();
        return false;
      }
      return true;
    };
    if (playRequest && typeof playRequest.then === 'function') {
      return playRequest.then(confirmPlayback).catch(error => {
        if (error && error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
          console.warn('Background music playback was interrupted:', error);
        }
        return false;
      });
    }
    return Promise.resolve(confirmPlayback());
  }

  function startBackgroundMusicFromGesture() {
    if (!backgroundMusic) return;
    backgroundMusicStarted = true;
    requestBackgroundMusicPlayback();
  }

  function suspendBackgroundMusicUntilGesture() {
    if (!backgroundMusic) return;
    backgroundMusicRequestVersion += 1;
    backgroundMusic.pause();
  }

  if (musicToggle && backgroundMusic) {
    syncMusicToggle();
    backgroundMusic.addEventListener('volumechange', syncMusicToggle);
    musicToggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      backgroundMusic.muted = !backgroundMusic.muted;
      syncMusicToggle();
    });
  }

  const motionPreference = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let prefersReducedMotion = Boolean(motionPreference && motionPreference.matches);
  experience.classList.toggle('reduced-motion', prefersReducedMotion);

  const openingGate = document.getElementById('openingGate');
  const openingKicker = document.getElementById('openingKicker');
  const openingHeadline = document.getElementById('openingHeadline');
  const enterStoryButton = document.getElementById('enterStoryButton');
  let openingSequenceStarted = false;
  let openingCompleted = false;

  function startOpeningSequence() {
    if (openingSequenceStarted || !openingGate || openingGate.hidden) return;
    openingSequenceStarted = true;
    if (openingKicker) openingKicker.classList.add('is-visible');
    const kickerRevealMs = prefersReducedMotion ? 1 : 750;
    const headlineRevealMs = prefersReducedMotion ? 1 : 900;
    window.setTimeout(() => {
      if (!openingGate || openingGate.hidden || openingCompleted) return;
      if (openingHeadline) {
        openingHeadline.setAttribute('aria-hidden', 'false');
        openingHeadline.classList.add('is-visible');
      }
      window.setTimeout(() => {
        if (!openingGate || openingGate.hidden || openingCompleted || !enterStoryButton) return;
        enterStoryButton.hidden = false;
        requestAnimationFrame(() => enterStoryButton.classList.add('is-visible'));
      }, headlineRevealMs + 2000);
    }, kickerRevealMs + 1500);
  }

  const poem = document.getElementById('poem');
  const scenes = [...document.querySelectorAll('.scene')];
  const sceneTitle = document.getElementById('sceneTitle');

  // One shared title system keeps every story scene visually consistent and
  // makes the title available immediately, independent of scene animations.
  // Scene 1 intentionally has no title.
  const sceneTitles = [
    '',
    'The Day of the First Message',
    'A Simple Birthday Wish',
    '',
    'Days Without a Label',
    'We Found a Way to Talk',
    'A Name That Made Me Blush',
    'The First Photograph You Sent Me',
    "The Little Moments I Never Thought I'd Miss",
    'The Day I Planned to Tell You',
    'The Day Did Not Go As Planned',
    'I Chose Another Way',
    'The Way I Expressed',
    'You Needed Time',
    'November 25, 2020',
    'Life After Your Yes',
    'Our First Captured Moments',
    'A Little Request, A Special Feeling',
    'The Day I Fell a Little Deeper',
    "The Picnic I Couldn't Be Part Of",
    'The Little Pictures I Waited For',
    'Before Distance Found Its Way',
    'When Our Paths Began to Diverge',
    'The One Thing That Still Brought Us Together',
    'The Journey I Made Just to See You',
    'A Little Earlier Than Everyone Else',
    'The Little Moments I Miss',
    'A Day I Wish I Could Revisit',
    'The Day I Came Home to Be with You',
    'When Our Tuition Days Came to an End',
    'After HS, Our Life Changed Completely',
    'A Different Kind of Togetherness',
    'The Calls We Kept Quiet',
    'The Pictures I Kept as Treasures',
    'Just a Glimpse of You',
    'A New Beginning, Back at Home',
    'Closer, Yet Still Apart',
    'Still Connected',
    'The Day We Finally Had Time for Each Other',
    'The Last Little Glimpses of You',
    'The Holi I Wish I Had Handled Differently',
    'The Days I Kept Waiting for Your Message',
    'The Day We Said Goodbye',
    "The Hope I Couldn't Let Go Of",
    'Between Disappointment and Hope',
    'What I Learned on June 1',
    'The Parts of Our Story I Never Knew',
    'Trying to Find My Focus Again',
    "The Things I Couldn't Tell You",
    'The Last Resting Place',
    ''
  ];

  // The shared title is placed inside each scene's own content composition.
  // It therefore follows the section layout instead of floating at the viewport edge.
  // Scene 3 (index 3) intentionally has no shared title: its original sentence
  // remains the complete, centred, animated content of that scene. The final scene (data-scene 50)
  // also has no shared title; its opening and closing dates frame the final wish.
  const sceneTitleTargets = {
    1: '.date-stage', 2: null, 4: '.days-intro-stage', 5: '.phones-stage',
    6: '.name-stage', 7: '.photo-memory-stage', 8: '.archive-stage', 9: null,
    10: '.chapter-story-stage', 11: '.sunset-stage', 12: '.confession-poem-stage',
    13: '.night-stage', 14: '.yes-stage', 15: '.afterglow-stage',
    16: '.first-selfies-stage', 17: '.profile-memory-stage', 18: '.story-memory-stage',
    19: '.story-memory-stage', 20: '.story-memory-stage', 21: '.story-memory-stage',
    22: '.separation-stage', 23: '.hope-intro-block', 24: '.hope-journey-heading',
    25: '.story-memory-stage', 26: '.story-memory-stage', 27: '.story-memory-stage',
    28: '.story-memory-stage', 29: '.story-memory-stage', 30: '.new-beginnings-stage',
    31: '.whatsapp-memory-stage', 32: '.whatsapp-calls-stage', 33: '.picture-keepsakes-stage',
    34: '.just-a-glimpse-stage', 35: '.chapter-text-stage', 36: '.chapter-text-stage',
    37: '.second-drop-connection-stage', 38: '.jan23-date-stage', 39: '.last-glimpses-stage',
    40: '.new-memory-stage', 41: '.new-memory-stage', 42: '.new-memory-stage',
    43: '.new-memory-stage', 44: '.new-memory-stage', 45: '.new-memory-stage',
    46: '.things-stage', 47: '.exam-results-heading', 48: '.scene51-stage',
    49: '.scene52__content', 50: '.scene53-stage'
  };

  // Preserve the old in-scene heading elements as hidden duplicates; the one
  // shared heading is moved into the matching composition for each scene.
  const previousTitleSelectors = {
    1: ['.date-kicker'], 4: ['.days-title'], 5: ['.phones-title'], 6: ['.chapter-overline'],
    10: ['.story-heading'], 11: ['.story-heading'],
    13: ['.story-heading'], 14: ['.yes-date'], 15: ['.story-heading'],
    17: ['.profile-memory-kicker'], 18: ['.story-memory-kicker'], 19: ['.story-memory-kicker'],
    20: ['.story-memory-kicker'], 21: ['.story-memory-kicker'], 23: ['.hope-title'],
    24: ['.hope-journey-title'], 25: ['.story-memory-kicker'], 26: ['.story-memory-kicker'],
    27: ['.story-memory-kicker'], 28: ['.story-memory-kicker'], 29: ['.story-memory-kicker'],
    30: ['.new-beginnings-title'], 31: ['.whatsapp-memory-title'], 32: ['.whatsapp-calls-title'],
    33: ['.story-memory-kicker'], 34: ['.just-a-glimpse-title'], 35: ['.chapter-text-title'],
    36: ['.chapter-text-title'], 37: ['.second-drop-connection-title'], 38: ['.jan23-date-title'],
    39: ['.last-glimpses-title'], 40: ['.new-memory-title'], 41: ['.new-memory-title'],
    42: ['.new-memory-title'], 43: ['.new-memory-title'], 44: ['.new-memory-title'],
    45: ['.new-memory-title'], 46: ['.things-title'], 47: ['.exam-results-title'],
    49: ['.scene52__title']
  };

  Object.entries(previousTitleSelectors).forEach(([sceneIndex, selectors]) => {
    const scene = scenes[Number(sceneIndex)];
    selectors.forEach(selector => {
      const oldTitle = scene && scene.querySelector(selector);
      if (oldTitle) oldTitle.classList.add('legacy-scene-title');
    });
  });

  // Reusable orientation classification for actual gallery photographs.
  // Maps, screenshots, videos, avatars, Scene 37 and Scene 48 are deliberately
  // outside this selector so their specialised compositions remain untouched.
  const standardPhotoFrameSelector = [
    '.first-selfie',
    '.profile-memory-photo-wrap',
    '.story-memory-gallery:not(.second-drop-connection-gallery) > .story-memory-photo',
    '.new-beginnings-photo',
    '.jan23-date-photo',
    '.last-glimpses-photo'
  ].join(',');

  function classifyPhotoFrame(image) {
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    const frame = image.closest(standardPhotoFrameSelector);
    if (!frame) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    const isPortrait = ratio < .95;
    frame.classList.toggle('is-photo-portrait', isPortrait);
    frame.classList.toggle('is-photo-landscape', !isPortrait);
    frame.classList.toggle('is-photo-square', ratio >= .95 && ratio <= 1.05);
  }

  // Defer non-critical photographs until their scene is entered. Because the
  // scenes are absolutely stacked, native loading=lazy alone can treat every
  // image as being in the viewport; data-src avoids those eager network loads.
  function loadSceneImages(index) {
    const scene = scenes[index];
    if (!scene) return;
    scene.querySelectorAll('img[data-src]').forEach(image => {
      image.addEventListener('load', () => classifyPhotoFrame(image), { once: true });
      image.addEventListener('error', () => {
        const frame = image.closest(standardPhotoFrameSelector);
        if (frame) frame.classList.add('photo-frame-load-failed');
      }, { once: true });
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
      image.loading = 'eager';
      if (image.complete && image.naturalWidth) classifyPhotoFrame(image);
    });
  }

  const previousButton = document.getElementById('previousButton');
  const playButton = document.getElementById('playButton');
  const nextButton = document.getElementById('nextButton');
  const controls = document.getElementById('transportControls');
  const gifImage = document.getElementById('birthdayFrame');
  const gifMessage = document.getElementById('message-gif');
  const thanksMessage = document.getElementById('message-thanks');
  const welcomeMessage = document.getElementById('message-welcome');

  // All final holds use the same objective reading-time calculation. Existing
  // reveal intervals remain unchanged; only the hold after the last entrance
  // animation is recalculated from text that appeared during the scene.
  const LINE_INTERVAL_MS = 300;
  const TRACK_ENTRANCE_END_MS = 650;
  const CHAPTER_GLYPH_ENTRANCE_MS = 120;
  const READING_WORDS_PER_SECOND = 3.33;
  const MIN_FINAL_HOLD_MS = 1500;
  const MAX_POST_PRESENTATION_HOLD_MS = 10_000;
  // Captured per scene so the final transition can be bounded independently
  // from the time needed to reveal its authored content.
  const sceneFinalPresentationEnds = new Array(scenes.length).fill(null);

  // Explicitly specified visual sequences retain their existing timing.
  const LETTER_INTERVAL = 70;
  const COMMA_PAUSE = 180;
  const PERIOD_PAUSE = 250;
  const GIF_START = 1100;
  const THANKS_AT = GIF_START + 2000;
  const WELCOME_AT = THANKS_AT + 2000;
  const CHAT_MESSAGE_ENTER_MS = 260;
  const CHAT_PHONE_ENTER_AT_MS = 120;
  const CHAT_PHONE_ENTER_MS = 1050;
  const chatContact = document.querySelector('.contact-name');
  const chatContactEnterAt = CHAT_PHONE_ENTER_AT_MS;
  const chatPresentationEndAt = Math.max(
    chatContactEnterAt + CHAT_PHONE_ENTER_MS,
    WELCOME_AT + CHAT_MESSAGE_ENTER_MS
  );
  const CHAT_DURATION = sceneDurationWithReading(2, chatPresentationEndAt, [
    textRevealEvent(chatContactEnterAt, chatContact.textContent),
    textRevealEvent(THANKS_AT, thanksMessage.textContent),
    textRevealEvent(WELCOME_AT, welcomeMessage.textContent)
  ]);
  const GIF_FRAME_MS = 130;
  const GIF_FRAME_COUNT = 12;
  const PHONE_START_DELAY = 1800;
  const PHONE_LETTER_INTERVAL = 70;
  const PHONE_GLYPH_FADE_MS = 155;
  const NAME_HIGHLIGHT_MS = 1500;
  const PHOTO_REVEAL_MS = 1200;
  const framePaths = Array.from({ length: GIF_FRAME_COUNT }, (_, i) =>
    `assets/birthday-frames/frame-${String(i).padStart(2, '0')}.webp`
  );

  function countWords(text) {
    const value = String(text || '').trim();
    return value ? value.split(/\s+/).length : 0;
  }

  function countReadableWords(text) {
    return (String(text || '').trim().match(/\S+/g) || [])
      .filter(token => /[\p{L}\p{N}]/u.test(token)).length;
  }

  function textRevealEvent(at, text) {
    const words = countReadableWords(text);
    return words ? { at, words } : null;
  }

  function wordRevealEventsFromTextAndGlyphs(textBlocks, glyphEvents, startAt = 0) {
    const readingEvents = [];
    let glyphIndex = 0;

    textBlocks.forEach(text => {
      let inWord = false;
      let currentWord = '';
      let finalGlyphAt = 0;
      const finishWord = () => {
        if (inWord && /[\p{L}\p{N}]/u.test(currentWord)) {
          readingEvents.push({ at: startAt + finalGlyphAt, words: 1 });
        }
        inWord = false;
        currentWord = '';
      };

      for (const character of Array.from(String(text || ''))) {
        const nextGlyph = glyphEvents[glyphIndex];
        if (/\s/u.test(character)) {
          finishWord();
          // Some typewriter schedules include whitespace glyphs; others use
          // text nodes and therefore have no corresponding event to consume.
          if (nextGlyph && /\s/u.test(String(nextGlyph.element.textContent || ''))) {
            glyphIndex += 1;
          }
          continue;
        }

        if (nextGlyph) {
          finalGlyphAt = nextGlyph.at;
          glyphIndex += 1;
        }
        inWord = true;
        currentWord += character;
      }
      finishWord();
    });

    return readingEvents;
  }

  function typewriterReadingEvents(paragraphs, typewriter, startAt = 0) {
    return wordRevealEventsFromTextAndGlyphs(
      paragraphs.map(paragraph => paragraph.textContent),
      typewriter.events,
      startAt
    );
  }

  function trackReadingEvents(track) {
    return track.entries
      .map(entry => textRevealEvent(entry.at, entry.element.textContent))
      .filter(Boolean);
  }

  function trackPresentationEnd(track, entranceMs = null) {
    return Math.max(0, ...track.entries.map(entry => {
      const actualEntranceMs = entranceMs === null
        ? (entry.element.closest('.story-copy') ? 680 : TRACK_ENTRANCE_END_MS)
        : entranceMs;
      return entry.at + actualEntranceMs;
    }));
  }

  function typewriterPresentationEnd(typewriter, startAt = 0, entranceMs = CHAPTER_GLYPH_ENTRANCE_MS) {
    if (!typewriter || !typewriter.events.length) return startAt;
    const lastGlyphAt = Math.max(...typewriter.events.map(event => event.at));
    return startAt + lastGlyphAt + entranceMs;
  }

  function remainingReadingTimeMs(readingEvents, presentationEndAt) {
    const events = readingEvents
      .filter(event => event && Number.isFinite(event.at) && event.words > 0)
      .sort((a, b) => a.at - b.at);
    if (!events.length) return 0;

    let outstandingSeconds = 0;
    let previousRevealAt = null;
    events.forEach(event => {
      if (previousRevealAt !== null) {
        outstandingSeconds = Math.max(
          0,
          outstandingSeconds - ((event.at - previousRevealAt) / 1000)
        );
      }
      outstandingSeconds += event.words / READING_WORDS_PER_SECOND;
      previousRevealAt = event.at;
    });

    const finalElapsedSeconds = Math.max(0, presentationEndAt - previousRevealAt) / 1000;
    return Math.max(0, outstandingSeconds - finalElapsedSeconds) * 1000;
  }

  function sceneDurationWithReading(sceneIndex, presentationEndAt, readingEvents = [], imageAllowanceMs = 0) {
    const titleEvent = textRevealEvent(0, sceneTitles[sceneIndex] || '');
    const allReadingEvents = [titleEvent, ...readingEvents].filter(Boolean);
    // Most scenes reveal their complete composition immediately when reduced
    // motion is enabled. Their reading clock must therefore also start at once,
    // rather than preserving time from animations that no longer run. The last
    // two chapters keep their authored typewriter sequences in reduced motion.
    const immediateReducedMotion = prefersReducedMotion && sceneIndex < 49;
    const timedReadingEvents = immediateReducedMotion
      ? allReadingEvents.map(event => ({ ...event, at: 0 }))
      : allReadingEvents;
    const finalPresentationEndAt = immediateReducedMotion ? 0 : presentationEndAt;
    if (Number.isFinite(sceneIndex) && sceneIndex >= 0 && sceneIndex < sceneFinalPresentationEnds.length) {
      sceneFinalPresentationEnds[sceneIndex] = Math.max(
        sceneFinalPresentationEnds[sceneIndex] ?? 0,
        finalPresentationEndAt
      );
    }
    const remainingMs = remainingReadingTimeMs(timedReadingEvents, finalPresentationEndAt);
    const finalHoldMs = Math.max(MIN_FINAL_HOLD_MS, remainingMs) + imageAllowanceMs;
    return Math.ceil(finalPresentationEndAt + finalHoldMs);
  }

  function sectionDuration(sceneIndex, tracks, extraReadingEvents = [], otherPresentationEndAt = 0) {
    const readingEvents = tracks.flatMap(trackReadingEvents).concat(extraReadingEvents);
    const presentationEndAt = Math.max(
      otherPresentationEndAt,
      ...tracks.map(track => trackPresentationEnd(track))
    );
    return sceneDurationWithReading(sceneIndex, presentationEndAt, readingEvents);
  }

  function createTrack(elements, startDelay = 0, revealClass = 'timed-copy') {
    let cursor = startDelay;
    let totalWords = 0;
    const entries = elements.map(element => {
      element.classList.add(revealClass);
      const words = countWords(element.textContent);
      const entry = { element, at: cursor, words };
      totalWords += words;
      cursor += words * LINE_INTERVAL_MS;
      return entry;
    });
    return { entries, totalWords, end: cursor };
  }

  function trackEnd(track) {
    return track ? track.end : 0;
  }

  function updateTrack(track, localTime) {
    if (!track) return;
    track.entries.forEach(entry => {
      entry.element.classList.toggle('is-revealed', localTime >= entry.at);
    });
  }

  // Opening poem: letter-by-letter reveal, with punctuation pauses.
  const letterSchedule = [];
  let poemClock = 0;
  const poemWords = poemText.split(' ');
  poemWords.forEach((word, wordIndex) => {
    const wordGroup = document.createElement('span');
    wordGroup.className = 'poem-word';
    for (const character of word) {
      const span = document.createElement('span');
      span.className = 'glyph';
      span.textContent = character;
      wordGroup.appendChild(span);
      letterSchedule.push({ element: span, at: poemClock });
      poemClock += LETTER_INTERVAL;
      if (character === ',') poemClock += COMMA_PAUSE;
      if (character === '.') poemClock += PERIOD_PAUSE;
    }
    poem.appendChild(wordGroup);
    if (wordIndex < poemWords.length - 1) poem.appendChild(document.createTextNode(' '));
  });
  const poemReadingEvents = wordRevealEventsFromTextAndGlyphs([poemText], letterSchedule);
  const poemLastGlyphAt = Math.max(0, ...letterSchedule.map(event => event.at));
  const poemDuration = sceneDurationWithReading(0, poemLastGlyphAt + 155, poemReadingEvents);

  // Build word-count schedules for all ordinary narrative lines.
  const closingTrack = createTrack(
    [document.querySelector('.closing-stage h2')], 900
  );
  const daysTrack = createTrack(
    [...document.querySelectorAll('.days-intro-copy p')], 1900
  );
  const dateMain = document.querySelector('.date-main');
  const dateYear = document.querySelector('.date-year');
  const dateDuration = sceneDurationWithReading(1, 1500, [
    textRevealEvent(160, dateMain.textContent),
    textRevealEvent(360, dateYear.textContent)
  ]);
  const closingDuration = sectionDuration(3, [closingTrack]);
  const daysDuration = sectionDuration(4, [daysTrack], [
    textRevealEvent(0, document.querySelector('.days-intro-stage .chapter-overline').textContent),
    textRevealEvent(570, document.querySelector('.interval-start').textContent),
    textRevealEvent(1100, document.querySelector('.interval-end').textContent)
  ]);

  // The phones scene has a user-specified letter-by-letter animation rather
  // than the ordinary word-count line reveal.
  function prepareTypedParagraphs(paragraphs) {
    const events = [];
    let cursor = 0;
    paragraphs.forEach(paragraph => {
      const original = paragraph.textContent.trim();
      paragraph.replaceChildren();
      const pieces = original.split(/(\s+)/).filter(Boolean);
      pieces.forEach(piece => {
        if (/^\s+$/.test(piece)) {
          paragraph.appendChild(document.createTextNode(piece));
          return;
        }
        const word = document.createElement('span');
        word.className = 'typed-word';
        for (const character of piece) {
          const glyph = document.createElement('span');
          glyph.className = 'typed-glyph';
          glyph.textContent = character;
          word.appendChild(glyph);
          events.push({ element: glyph, at: cursor });
          cursor += PHONE_LETTER_INTERVAL;
        }
        paragraph.appendChild(word);
      });
    });
    return { events, typingDuration: cursor };
  }
  const phoneTyping = prepareTypedParagraphs([
    document.querySelector('.phones-footnote')
  ]);
  const phoneTextParagraphs = [document.querySelector('.phones-footnote')];
  const borrowedHer = document.querySelector('.borrowed-her');
  const borrowedMine = document.querySelector('.borrowed-mine');
  const phoneReadingEvents = typewriterReadingEvents(phoneTextParagraphs, phoneTyping, PHONE_START_DELAY).concat([
    textRevealEvent(500, borrowedHer.textContent),
    textRevealEvent(800, borrowedMine.textContent)
  ]);
  const phonesPresentationEndAt = Math.max(
    typewriterPresentationEnd(phoneTyping, PHONE_START_DELAY, PHONE_GLYPH_FADE_MS),
    500 + 850,
    800 + 850
  );
  const phonesDuration = sceneDurationWithReading(5, phonesPresentationEndAt, phoneReadingEvents);

  // The name is a deliberate visual beat between its two narration lines.
  const nameLead = document.querySelector('.name-lead');
  const nameFollow = document.querySelector('.name-follow');
  const memoryName = document.querySelector('.memory-name');
  nameLead.classList.add('timed-copy');
  nameFollow.classList.add('timed-copy');
  const nameLeadWords = countWords(nameLead.textContent);
  const nameFollowWords = countWords(nameFollow.textContent);
  const nameStart = 350;
  const nameHighlightAt = nameStart + nameLeadWords * LINE_INTERVAL_MS;
  const nameFollowAt = nameHighlightAt + NAME_HIGHLIGHT_MS;
  const nameReadingEvents = [
    textRevealEvent(nameStart, nameLead.textContent),
    textRevealEvent(nameHighlightAt, memoryName.textContent),
    textRevealEvent(nameFollowAt, nameFollow.textContent)
  ];
  const namePresentationEndAt = Math.max(
    nameStart + TRACK_ENTRANCE_END_MS,
    nameHighlightAt + NAME_HIGHLIGHT_MS,
    nameFollowAt + TRACK_ENTRANCE_END_MS
  );
  const nameDuration = sceneDurationWithReading(6, namePresentationEndAt, nameReadingEvents);

  // Photograph narration follows the same per-line formula. The photograph
  // begins its reveal after the short "And she sent it." line has had its turn.
  const photoTrack = createTrack(
    [...document.querySelectorAll('.photo-copy p')], 250
  );
  const photoFrame = document.querySelector('.memory-photo-frame');
  const photoRevealAt = photoTrack.entries[4].at;
  // Let the photograph finish its reveal before the final explanatory line appears.
  photoTrack.entries[4].at += PHOTO_REVEAL_MS;
  photoTrack.end += PHOTO_REVEAL_MS;
  const photoDuration = sceneDurationWithReading(
    7,
    Math.max(trackPresentationEnd(photoTrack), photoRevealAt + PHOTO_REVEAL_MS),
    trackReadingEvents(photoTrack)
  );

  // Scene 8 contains only its centred narration; the three lines retain
  // their original staggered reveal and word-count-based hold.
  const archiveReflectionTrack = createTrack(
    [...document.querySelectorAll('.archive-reflection p')], 700
  );
  const archiveDuration = sectionDuration(8, [archiveReflectionTrack]);

  const nov24Track = createTrack(
    [document.querySelector('.nov24-card p')], 1250
  );
  const nov24Card = document.querySelector('.nov24-card');
  const nov24Duration = sectionDuration(9, [nov24Track], [
    textRevealEvent(100, `${nov24Card.querySelector('h2').textContent} ${nov24Card.querySelector('.nov24-year').textContent}`)
  ], 1250);

  // The cancelled-class and arrival accounts now form one continuous scene.
  const cancelledTrack = createTrack(
    [...document.querySelectorAll('.cancelled-copy p')], 850
  );
  const cancelledDuration = sectionDuration(10, [cancelledTrack]);
  // The waiting-for-sunset and pre-message nerves accounts now form one scene.
  const sunsetTrack = createTrack(
    [...document.querySelectorAll('.sunset-copy p')], 900
  );
  const sunsetDuration = sectionDuration(11, [sunsetTrack], [], 350 + 1800);
  const confessionIntroTrack = createTrack(
    [...document.querySelectorAll('.confession-poem-intro p')], 850
  );
  const confessionTitle = document.querySelector('.confession-poem-title');
  const confessionTitleAt = confessionIntroTrack.end + 450;
  const confessionPoemLinesTrack = createTrack(
    [...document.querySelectorAll('.confession-poem-lines p')], confessionTitleAt + 850
  );
  const fullPoemLink = document.getElementById('fullPoemLink');
  const confessionReadingEvents = trackReadingEvents(confessionIntroTrack)
    .concat([textRevealEvent(confessionTitleAt, confessionTitle.textContent)])
    .concat(trackReadingEvents(confessionPoemLinesTrack))
    .concat([textRevealEvent(confessionPoemLinesTrack.end, fullPoemLink.textContent)]);
  const confessionPresentationEndAt = Math.max(
    trackPresentationEnd(confessionIntroTrack),
    confessionTitleAt + 850,
    trackPresentationEnd(confessionPoemLinesTrack, 630),
    confessionPoemLinesTrack.end + 650
  );
  const confessionPoemDuration = sceneDurationWithReading(12, confessionPresentationEndAt, confessionReadingEvents);
  // The response and longest-night narration now share one scene and one timed track.
  const replyNightTrack = createTrack(
    [...document.querySelectorAll('.night-copy p')], 900
  );
  const nightDuration = sectionDuration(13, [replyNightTrack]);
  const yesDate = document.querySelector('.yes-date');
  const yesWord = document.querySelector('.yes-word');
  const yesCaption = document.querySelector('.yes-caption');
  const YES_REVEAL_AT = 1800;
  const YES_CAPTION_AT = 5200;
  const yesDuration = sceneDurationWithReading(14, Math.max(
    450 + 1000,
    YES_REVEAL_AT + 1700,
    YES_CAPTION_AT + 900,
    4000 + 2100
  ), [
    textRevealEvent(YES_REVEAL_AT, yesWord.textContent),
    textRevealEvent(YES_CAPTION_AT, yesCaption.textContent)
  ]);
  const afterglowTrack = createTrack(
    [...document.querySelectorAll('.afterglow-copy p')], 900
  );
  const afterglowDuration = sectionDuration(15, [afterglowTrack]);

  // November 28: each photograph completes its full pop-up, exact 2-second
  // hold, and settling animation before the next photograph begins. The full
  // approved narration types continuously at 70ms per character; the final
  // reading hold is calculated from the text revealed during that sequence.
  const FIRST_SELFIE_START_MS = 450;
  const FIRST_SELFIE_ENTER_MS = 480;
  const FIRST_SELFIE_HOLD_MS = 2000;
  const FIRST_SELFIE_SETTLE_MS = 1050;
  const FIRST_SELFIE_GAP_AFTER_SETTLE_MS = 250;
  const FIRST_SELFIE_TYPE_INTERVAL_MS = 70;
  const firstSelfieElements = [
    document.querySelector('.first-selfie-one'),
    document.querySelector('.first-selfie-two')
  ];
  const FIRST_SELFIE_CYCLE_MS = FIRST_SELFIE_ENTER_MS + FIRST_SELFIE_HOLD_MS + FIRST_SELFIE_SETTLE_MS;
  const firstSelfieSecondStart = FIRST_SELFIE_START_MS + FIRST_SELFIE_CYCLE_MS;
  const firstSelfiesHoldStart = firstSelfieSecondStart + FIRST_SELFIE_ENTER_MS;
  const firstSelfiesSettleAt = firstSelfiesHoldStart + FIRST_SELFIE_HOLD_MS;
  const firstSelfiesCopyStart = firstSelfiesSettleAt + FIRST_SELFIE_SETTLE_MS + FIRST_SELFIE_GAP_AFTER_SETTLE_MS;

  function prepareFirstSelfiesTypewriter(paragraphs) {
    const events = [];
    let cursor = 0;
    paragraphs.forEach(paragraph => {
      const originalText = paragraph.textContent;
      paragraph.replaceChildren();
      paragraph.classList.add('first-selfie-typed-paragraph');
      const pieces = originalText.split(/(\s+)/).filter(Boolean);
      pieces.forEach(piece => {
        if (/^\s+$/.test(piece)) {
          paragraph.appendChild(document.createTextNode(piece));
          return;
        }
        const word = document.createElement('span');
        word.className = 'first-selfie-word';
        for (const character of piece) {
          const glyph = document.createElement('span');
          glyph.className = 'first-selfie-glyph';
          glyph.textContent = character;
          word.appendChild(glyph);
          events.push({ element: glyph, at: cursor });
          cursor += FIRST_SELFIE_TYPE_INTERVAL_MS;
        }
        paragraph.appendChild(word);
      });
    });
    return { events, typingDuration: cursor };
  }

  const firstSelfiesParagraphs = [...document.querySelectorAll('.first-selfies-copy p')];
  const firstSelfiesTypewriter = prepareFirstSelfiesTypewriter(firstSelfiesParagraphs);
  const firstSelfiesDuration = sceneDurationWithReading(
    16,
    Math.max(
      firstSelfiesSettleAt + FIRST_SELFIE_SETTLE_MS,
      typewriterPresentationEnd(firstSelfiesTypewriter, firstSelfiesCopyStart, 120)
    ),
    typewriterReadingEvents(firstSelfiesParagraphs, firstSelfiesTypewriter, firstSelfiesCopyStart)
  );

  // Single portrait memory: the photograph enters prominently, holds for 2s,
  // settles into its permanent position, then the full narration types at 70ms.
  // The final reading hold is calculated after the typewriter has completed.
  // All stages use story time so pause/resume and scene navigation stay synchronized.
  const PROFILE_PHOTO_START_MS = 450;
  const PROFILE_PHOTO_POP_MS = 480;
  const PROFILE_PHOTO_HOLD_MS = 2000;
  const PROFILE_PHOTO_SETTLE_MS = 1050;
  const PROFILE_TEXT_GAP_MS = 250;
  const PROFILE_TYPE_INTERVAL_MS = 70;
  const profilePhoto = document.querySelector('.profile-memory-photo-wrap');
  const profileCopyParagraphs = [...document.querySelectorAll('.profile-memory-copy p')];
  const profilePhotoSettleAt = PROFILE_PHOTO_START_MS + PROFILE_PHOTO_POP_MS + PROFILE_PHOTO_HOLD_MS;
  const profileCopyStartAt = profilePhotoSettleAt + PROFILE_PHOTO_SETTLE_MS + PROFILE_TEXT_GAP_MS;

  function prepareProfileMemoryTypewriter(paragraphs) {
    const events = [];
    let cursor = 0;
    paragraphs.forEach(paragraph => {
      const originalText = paragraph.textContent;
      paragraph.replaceChildren();
      paragraph.classList.add('profile-memory-typed-paragraph');
      const pieces = originalText.split(/(\s+)/).filter(Boolean);
      pieces.forEach(piece => {
        if (/^\s+$/.test(piece)) {
          paragraph.appendChild(document.createTextNode(piece));
          return;
        }
        const word = document.createElement('span');
        word.className = 'profile-memory-word';
        for (const character of piece) {
          const glyph = document.createElement('span');
          glyph.className = 'profile-memory-glyph';
          glyph.textContent = character;
          word.appendChild(glyph);
          events.push({ element: glyph, at: cursor });
          cursor += PROFILE_TYPE_INTERVAL_MS;
        }
        paragraph.appendChild(word);
      });
    });
    return { events, typingDuration: cursor };
  }
  const profileMemoryTypewriter = prepareProfileMemoryTypewriter(profileCopyParagraphs);
  const profileMemoryDuration = sceneDurationWithReading(
    17,
    Math.max(
      profilePhotoSettleAt + PROFILE_PHOTO_SETTLE_MS,
      typewriterPresentationEnd(profileMemoryTypewriter, profileCopyStartAt, 120)
    ),
    typewriterReadingEvents(profileCopyParagraphs, profileMemoryTypewriter, profileCopyStartAt)
  );


  // The remaining personal photo memories follow the same visual language:
  // the photographs enter prominently, hold, settle, and only then does a
  // continuous 70ms-per-character narration begin. Each final hold is calculated
  // from the amount of text still outstanding after all reveals have completed.
  const STORY_MEMORY_START_MS = 450;
  const STORY_MEMORY_POP_MS = 480;
  const STORY_MEMORY_PAIR_HOLD_MS = 2000;
  const STORY_MEMORY_SETTLE_MS = 1050;
  const STORY_MEMORY_PHOTO_CYCLE_MS = STORY_MEMORY_POP_MS + STORY_MEMORY_PAIR_HOLD_MS + STORY_MEMORY_SETTLE_MS;
  const STORY_MEMORY_TEXT_GAP_MS = 250;
  const STORY_MEMORY_TYPE_INTERVAL_MS = 70;

  function prepareStoryMemoryTypewriter(paragraphs) {
    const events = [];
    let cursor = 0;
    paragraphs.forEach(paragraph => {
      const originalText = paragraph.textContent;
      paragraph.replaceChildren();
      const pieces = originalText.split(/(\s+)/).filter(Boolean);
      pieces.forEach(piece => {
        if (/^\s+$/.test(piece)) {
          paragraph.appendChild(document.createTextNode(piece));
          return;
        }
        const word = document.createElement('span');
        word.className = 'story-memory-word';
        for (const character of piece) {
          const glyph = document.createElement('span');
          glyph.className = 'story-memory-glyph';
          glyph.textContent = character;
          word.appendChild(glyph);
          events.push({ element: glyph, at: cursor });
          cursor += STORY_MEMORY_TYPE_INTERVAL_MS;
        }
        paragraph.appendChild(word);
      });
    });
    return { events, typingDuration: cursor };
  }

  function preparePairStoryMemory(selector, sceneName, sceneIndex) {
    const root = document.querySelector(selector);
    const gallery = root.querySelector('.story-memory-gallery');
    const photos = [...root.querySelectorAll('.story-memory-photo')];
    const copyParagraphs = [...root.querySelectorAll('.story-memory-copy p')];
    const typewriter = prepareStoryMemoryTypewriter(copyParagraphs);
    const lastStart = STORY_MEMORY_START_MS + (photos.length - 1) * STORY_MEMORY_PHOTO_CYCLE_MS;
    const holdAt = lastStart + STORY_MEMORY_POP_MS;
    const settleAt = holdAt + STORY_MEMORY_PAIR_HOLD_MS;
    const copyStart = settleAt + STORY_MEMORY_SETTLE_MS + STORY_MEMORY_TEXT_GAP_MS;
    const presentationEndAt = Math.max(
      lastStart + STORY_MEMORY_POP_MS + STORY_MEMORY_PAIR_HOLD_MS + STORY_MEMORY_SETTLE_MS,
      typewriterPresentationEnd(typewriter, copyStart, 120)
    );
    const duration = sceneDurationWithReading(
      sceneIndex,
      presentationEndAt,
      typewriterReadingEvents(copyParagraphs, typewriter, copyStart)
    );

    function update(localTime) {
      gallery.style.transform = 'none';
      photos.forEach((photo, i) => {
        const start = STORY_MEMORY_START_MS + i * STORY_MEMORY_PHOTO_CYCLE_MS;
        applyFullscreenPhotoPopup(photo, localTime, start, {
          popMs: STORY_MEMORY_POP_MS,
          holdMs: STORY_MEMORY_PAIR_HOLD_MS,
          settleMs: STORY_MEMORY_SETTLE_MS
        });
      });
      typewriter.events.forEach(event => {
        event.element.classList.toggle('is-visible', localTime >= copyStart + event.at);
      });
    }
    return { name: sceneName, duration, update };
  }

  function prepareCollectionStoryMemory(selector, sceneName, sceneIndex, holdMs = 2000) {
    const root = document.querySelector(selector);
    const gallery = root.querySelector('.story-memory-gallery');
    const photos = [...root.querySelectorAll('.story-memory-photo')];
    const copyParagraphs = [...root.querySelectorAll('.story-memory-copy p')];
    const typewriter = prepareStoryMemoryTypewriter(copyParagraphs);
    const COLLECTION_HOLD_MS = holdMs;
    const COLLECTION_SETTLE_MS = STORY_MEMORY_SETTLE_MS;
    const COLLECTION_GAP_MS = STORY_MEMORY_TEXT_GAP_MS;
    const perPhoto = STORY_MEMORY_POP_MS + COLLECTION_HOLD_MS + COLLECTION_SETTLE_MS + COLLECTION_GAP_MS;
    const copyStart = STORY_MEMORY_START_MS + photos.length * perPhoto;
    const lastPhotoStart = photos.length ? STORY_MEMORY_START_MS + (photos.length - 1) * perPhoto : 0;
    const presentationEndAt = Math.max(
      lastPhotoStart + STORY_MEMORY_POP_MS + COLLECTION_HOLD_MS + COLLECTION_SETTLE_MS,
      typewriterPresentationEnd(typewriter, copyStart, 120)
    );
    const duration = sceneDurationWithReading(
      sceneIndex,
      presentationEndAt,
      typewriterReadingEvents(copyParagraphs, typewriter, copyStart)
    );
    function update(localTime) {
      gallery.style.transform = 'none';
      photos.forEach((photo, i) => {
        const start = STORY_MEMORY_START_MS + i * perPhoto;
        applyFullscreenPhotoPopup(photo, localTime, start, {
          popMs: STORY_MEMORY_POP_MS,
          holdMs: COLLECTION_HOLD_MS,
          settleMs: COLLECTION_SETTLE_MS
        });
      });
      typewriter.events.forEach(event => {
        event.element.classList.toggle('is-visible', localTime >= copyStart + event.at);
      });
    }
    return { name: sceneName, duration, update };
  }

  const redOutfitMemory = preparePairStoryMemory('.scene-red-outfit', 'red-outfit', 18);
  const picnicMemory = preparePairStoryMemory('.scene-picnic', 'picnic', 19);
  const littlePicturesMemory = prepareCollectionStoryMemory('.scene-little-pictures', 'little-pictures', 20);
  const lastTogetherMemory = preparePairStoryMemory('.scene-last-together', 'last-together', 21);
  // The final five memory scenes follow the user's chosen order after Scene 27.
  const earlyTuitionMemory = preparePairStoryMemory('.scene-early-tuition', 'early-tuition', 25);
  const littleMomentsMemory = preparePairStoryMemory('.scene-little-moments', 'little-moments', 26);
  const durgaPujaMemory = preparePairStoryMemory('.scene-durga-puja', 'durga-puja', 27);
  const saraswatiPujaMemory = preparePairStoryMemory('.scene-saraswati-puja', 'saraswati-puja', 28);
  const tuitionEndingMemory = preparePairStoryMemory('.scene-tuition-ending', 'tuition-ending', 29);
  // Scene 36: five newer photographs she shared. Keep the same five-photo
  // reveal-and-settle choreography, with a shorter 2-second hold per image.
  const pictureKeepsakesMemory = prepareCollectionStoryMemory(
    '.scene-picture-keepsakes', 'picture-keepsakes', 33, 2000
  );

  // Scene 33: reveal the two real institutes one at a time. Each photo pops up,
  // holds for two seconds, then settles before the next photo appears. Names,
  // locations and chapter labels follow, then the narration types at 70ms/char.
  const NEW_BEGINNINGS_START_MS = 450;
  const NEW_BEGINNINGS_POP_MS = 480;
  const NEW_BEGINNINGS_HOLD_MS = 2000;
  const NEW_BEGINNINGS_SETTLE_MS = 1050;
  const NEW_BEGINNINGS_BETWEEN_MS = 250;
  const NEW_BEGINNINGS_DETAILS_GAP_MS = 300;
  const NEW_BEGINNINGS_CAPTIONS_GAP_MS = 700;
  const NEW_BEGINNINGS_COPY_GAP_MS = 550;
  const NEW_BEGINNINGS_TYPE_INTERVAL_MS = 70;
  const newBeginningsRoot = document.querySelector('.scene-new-beginnings');
  const newBeginningsPhotos = [...newBeginningsRoot.querySelectorAll('.new-beginnings-photo')];
  const newBeginningsDetails = [...newBeginningsRoot.querySelectorAll('.new-beginnings-details')];
  const newBeginningsCaptions = [...newBeginningsRoot.querySelectorAll('.new-beginnings-caption')];
  const newBeginningsCopyParagraphs = [...newBeginningsRoot.querySelectorAll('.new-beginnings-copy p')];

  function prepareNewBeginningsTypewriter(paragraphs) {
    const events = [];
    let cursor = 0;
    paragraphs.forEach(paragraph => {
      const originalText = paragraph.textContent;
      paragraph.replaceChildren();
      const pieces = originalText.split(/(\s+)/).filter(Boolean);
      pieces.forEach(piece => {
        if (/^\s+$/.test(piece)) {
          paragraph.appendChild(document.createTextNode(piece));
          return;
        }
        const word = document.createElement('span');
        word.className = 'new-beginnings-word';
        for (const character of Array.from(piece)) {
          const glyph = document.createElement('span');
          glyph.className = 'new-beginnings-glyph';
          glyph.textContent = character;
          word.appendChild(glyph);
          events.push({ element: glyph, at: cursor });
          cursor += NEW_BEGINNINGS_TYPE_INTERVAL_MS;
        }
        paragraph.appendChild(word);
      });
    });
    return { events, typingDuration: cursor };
  }

  const newBeginningsFirstSettledAt = NEW_BEGINNINGS_START_MS + NEW_BEGINNINGS_POP_MS + NEW_BEGINNINGS_HOLD_MS + NEW_BEGINNINGS_SETTLE_MS;
  const newBeginningsSecondStartAt = newBeginningsFirstSettledAt + NEW_BEGINNINGS_BETWEEN_MS;
  const newBeginningsSecondSettledAt = newBeginningsSecondStartAt + NEW_BEGINNINGS_POP_MS + NEW_BEGINNINGS_HOLD_MS + NEW_BEGINNINGS_SETTLE_MS;
  const newBeginningsDetailsAt = newBeginningsSecondSettledAt + NEW_BEGINNINGS_DETAILS_GAP_MS;
  const newBeginningsCaptionsAt = newBeginningsDetailsAt + NEW_BEGINNINGS_CAPTIONS_GAP_MS;
  const newBeginningsCopyStartAt = newBeginningsCaptionsAt + NEW_BEGINNINGS_COPY_GAP_MS;
  const newBeginningsTypewriter = prepareNewBeginningsTypewriter(newBeginningsCopyParagraphs);
  const newBeginningsReadingEvents = typewriterReadingEvents(
    newBeginningsCopyParagraphs, newBeginningsTypewriter, newBeginningsCopyStartAt
  )
    .concat(newBeginningsDetails.map(element => textRevealEvent(newBeginningsDetailsAt, element.textContent)))
    .concat(newBeginningsCaptions.map(element => textRevealEvent(newBeginningsCaptionsAt, element.textContent)));
  const newBeginningsPresentationEndAt = Math.max(
    newBeginningsSecondSettledAt,
    newBeginningsDetailsAt + 420,
    newBeginningsCaptionsAt + 420,
    typewriterPresentationEnd(newBeginningsTypewriter, newBeginningsCopyStartAt, 120)
  );
  const newBeginningsDuration = sceneDurationWithReading(
    30, newBeginningsPresentationEndAt, newBeginningsReadingEvents
  );

  function updateNewBeginningsPhoto(photo, localTime, startAt) {
    applyFullscreenPhotoPopup(photo, localTime, startAt, {
      popMs: NEW_BEGINNINGS_POP_MS,
      holdMs: NEW_BEGINNINGS_HOLD_MS,
      settleMs: NEW_BEGINNINGS_SETTLE_MS
    });
  }

  function updateNewBeginnings(localTime) {
    updateNewBeginningsPhoto(newBeginningsPhotos[0], localTime, NEW_BEGINNINGS_START_MS);
    updateNewBeginningsPhoto(newBeginningsPhotos[1], localTime, newBeginningsSecondStartAt);
    newBeginningsDetails.forEach(detail => {
      detail.classList.toggle('is-visible', localTime >= newBeginningsDetailsAt);
    });
    newBeginningsCaptions.forEach(caption => {
      caption.classList.toggle('is-visible', localTime >= newBeginningsCaptionsAt);
    });
    newBeginningsTypewriter.events.forEach(event => {
      event.element.classList.toggle('is-visible', localTime >= newBeginningsCopyStartAt + event.at);
    });
  }


  // Scene 34: the WhatsApp recording starts after the introductory line appears.
  // Its native controls independently pause and seek the video; the site-level
  // Pause/Resume control also pauses/resumes the video together with story time.
  const WHATSAPP_INTRO_AT_MS = 420;
  const WHATSAPP_VIDEO_START_AT_MS = WHATSAPP_INTRO_AT_MS + 420 + 2000;
  const WHATSAPP_TYPE_INTERVAL_MS = 70;
  const whatsappMemoryRoot = document.querySelector('.scene-whatsapp-memory');
  const whatsappIntro = whatsappMemoryRoot.querySelector('.whatsapp-memory-intro');
  const whatsappVideoShell = whatsappMemoryRoot.querySelector('.whatsapp-video-shell');
  const whatsappVideo = whatsappMemoryRoot.querySelector('.whatsapp-memory-video');
  const whatsappCopyParagraphs = [...whatsappMemoryRoot.querySelectorAll('.whatsapp-memory-copy p')];
  let whatsappVideoUserPaused = false;
  let whatsappVideoPlayAttempted = false;
  let whatsappVideoPlayPending = false;
  let whatsappStoryPauseRequested = false;
  let whatsappResumeAfterStoryPause = false;

  function prepareWhatsAppMemoryTypewriter(paragraphs) {
    const events = [];
    let cursor = 0;
    paragraphs.forEach(paragraph => {
      const originalText = paragraph.textContent;
      paragraph.replaceChildren();
      const pieces = originalText.split(/(\s+)/).filter(Boolean);
      pieces.forEach(piece => {
        if (/^\s+$/.test(piece)) {
          paragraph.appendChild(document.createTextNode(piece));
          return;
        }
        const word = document.createElement('span');
        word.className = 'whatsapp-memory-word';
        for (const character of Array.from(piece)) {
          const glyph = document.createElement('span');
          glyph.className = 'whatsapp-memory-glyph';
          glyph.textContent = character;
          word.appendChild(glyph);
          events.push({ element: glyph, at: cursor });
          cursor += WHATSAPP_TYPE_INTERVAL_MS;
        }
        paragraph.appendChild(word);
      });
    });
    return { events, typingDuration: cursor };
  }

  const whatsappMemoryTypewriter = prepareWhatsAppMemoryTypewriter(whatsappCopyParagraphs);
  const whatsappMemoryDuration = sceneDurationWithReading(
    31,
    Math.max(
      WHATSAPP_INTRO_AT_MS + 420,
      WHATSAPP_VIDEO_START_AT_MS + 440,
      typewriterPresentationEnd(whatsappMemoryTypewriter, WHATSAPP_VIDEO_START_AT_MS, 120)
    ),
    typewriterReadingEvents(whatsappCopyParagraphs, whatsappMemoryTypewriter, WHATSAPP_VIDEO_START_AT_MS)
      .concat([textRevealEvent(WHATSAPP_INTRO_AT_MS, whatsappIntro.textContent)])
  );

  whatsappVideo.addEventListener('play', () => {
    if (!whatsappStoryPauseRequested) whatsappVideoUserPaused = false;
  });
  whatsappVideo.addEventListener('pause', () => {
    if (whatsappStoryPauseRequested) {
      whatsappStoryPauseRequested = false;
      return;
    }
    if (!whatsappVideo.ended) whatsappVideoUserPaused = true;
  });

  function attemptWhatsAppVideoPlay() {
    if (paused || ended || whatsappVideoUserPaused || whatsappVideo.ended || whatsappVideoPlayAttempted || whatsappVideoPlayPending) return;
    whatsappVideoPlayAttempted = true;
    whatsappVideoPlayPending = true;
    const playResult = whatsappVideo.play();
    if (playResult && typeof playResult.then === 'function') {
      playResult.catch(error => {
        // The native Play control remains available if a browser blocks autoplay.
        console.info('WhatsApp video autoplay was not available; use the video Play control.', error);
      }).finally(() => { whatsappVideoPlayPending = false; });
    } else {
      whatsappVideoPlayPending = false;
    }
  }

  function pauseWhatsAppVideoForStory() {
    whatsappResumeAfterStoryPause = Boolean(whatsappVideo && !whatsappVideo.paused && !whatsappVideo.ended);
    if (whatsappResumeAfterStoryPause) {
      whatsappStoryPauseRequested = true;
      whatsappVideo.pause();
    }
  }

  function resumeWhatsAppVideoForStory() {
    const shouldResume = whatsappResumeAfterStoryPause;
    whatsappResumeAfterStoryPause = false;
    if (shouldResume && !whatsappVideoUserPaused && !whatsappVideo.ended && whatsappVideo.paused) {
      const playResult = whatsappVideo.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(error => console.info('WhatsApp video did not resume automatically.', error));
      }
    }
  }

  function stopWhatsAppVideoForNavigation() {
    whatsappResumeAfterStoryPause = false;
    if (!whatsappVideo.paused) {
      whatsappStoryPauseRequested = true;
      whatsappVideo.pause();
    }
    try { whatsappVideo.currentTime = 0; } catch (_) { /* metadata may not be ready */ }
    whatsappVideoUserPaused = false;
    whatsappVideoPlayAttempted = false;
    whatsappVideoPlayPending = false;
  }

  function updateWhatsAppMemory(localTime) {
    const introVisible = localTime >= WHATSAPP_INTRO_AT_MS;
    const videoVisible = localTime >= WHATSAPP_VIDEO_START_AT_MS;
    whatsappIntro.classList.toggle('is-visible', introVisible);
    whatsappVideoShell.classList.toggle('is-visible', videoVisible);
    whatsappMemoryTypewriter.events.forEach(event => {
      event.element.classList.toggle('is-visible', videoVisible && localTime >= WHATSAPP_VIDEO_START_AT_MS + event.at);
    });
    if (videoVisible && activeScene === 31) attemptWhatsAppVideoPlay();
  }

  // Scene 35: late-night WhatsApp video calls. Video and narration begin
  // together and run independently; the story transport coordinates both.
  const CALLS_INTRO_AT_MS = 420;
  const CALLS_VIDEO_START_AT_MS = CALLS_INTRO_AT_MS + 420 + 2000;
  const CALLS_TYPE_INTERVAL_MS = 70;
  const whatsappCallsRoot = document.querySelector('.scene-whatsapp-calls');
  const whatsappCallsIntro = whatsappCallsRoot.querySelector('.whatsapp-calls-intro');
  const whatsappCallsVideoShell = whatsappCallsRoot.querySelector('.whatsapp-calls-video-shell');
  const whatsappCallsVideo = whatsappCallsRoot.querySelector('.whatsapp-calls-video');
  const whatsappCallsParagraphs = [...whatsappCallsRoot.querySelectorAll('.whatsapp-calls-copy p')];
  let callsVideoUserPaused = false;
  let callsVideoPlayAttempted = false;
  let callsVideoStoryPauseRequested = false;
  let callsVideoResumeAfterStoryPause = false;

  function prepareCallsTypewriter(paragraphs) {
    const events = [];
    let cursor = 0;
    paragraphs.forEach(paragraph => {
      const pieces = paragraph.textContent.split(/(\s+)/).filter(Boolean);
      paragraph.replaceChildren();
      pieces.forEach(piece => {
        if (/^\s+$/.test(piece)) { paragraph.appendChild(document.createTextNode(piece)); return; }
        const word = document.createElement('span'); word.className = 'whatsapp-calls-word';
        for (const character of Array.from(piece)) {
          const glyph = document.createElement('span'); glyph.className = 'whatsapp-calls-glyph';
          glyph.textContent = character; word.appendChild(glyph);
          events.push({ element: glyph, at: cursor }); cursor += CALLS_TYPE_INTERVAL_MS;
        }
        paragraph.appendChild(word);
      });
    });
    return { events, typingDuration: cursor };
  }
  const whatsappCallsTypewriter = prepareCallsTypewriter(whatsappCallsParagraphs);
  const whatsappCallsDuration = sceneDurationWithReading(
    32,
    Math.max(
      CALLS_INTRO_AT_MS + 420,
      CALLS_VIDEO_START_AT_MS + 440,
      typewriterPresentationEnd(whatsappCallsTypewriter, CALLS_VIDEO_START_AT_MS, 120)
    ),
    typewriterReadingEvents(whatsappCallsParagraphs, whatsappCallsTypewriter, CALLS_VIDEO_START_AT_MS)
      .concat([textRevealEvent(CALLS_INTRO_AT_MS, whatsappCallsIntro.textContent)])
  );

  whatsappCallsVideo.addEventListener('play', () => { if (!callsVideoStoryPauseRequested) callsVideoUserPaused = false; });
  whatsappCallsVideo.addEventListener('pause', () => {
    if (callsVideoStoryPauseRequested) { callsVideoStoryPauseRequested = false; return; }
    if (!whatsappCallsVideo.ended) callsVideoUserPaused = true;
  });
  function attemptCallsVideoPlay() {
    if (paused || ended || callsVideoUserPaused || whatsappCallsVideo.ended || callsVideoPlayAttempted) return;
    callsVideoPlayAttempted = true;
    const result = whatsappCallsVideo.play();
    if (result && typeof result.catch === 'function') result.catch(error => console.info('Video autoplay unavailable; use the video Play control.', error));
  }
  function pauseCallsVideoForStory() {
    callsVideoResumeAfterStoryPause = Boolean(!whatsappCallsVideo.paused && !whatsappCallsVideo.ended);
    if (callsVideoResumeAfterStoryPause) { callsVideoStoryPauseRequested = true; whatsappCallsVideo.pause(); }
  }
  function resumeCallsVideoForStory() {
    const shouldResume = callsVideoResumeAfterStoryPause; callsVideoResumeAfterStoryPause = false;
    if (shouldResume && !callsVideoUserPaused && !whatsappCallsVideo.ended && whatsappCallsVideo.paused) {
      const result = whatsappCallsVideo.play(); if (result && typeof result.catch === 'function') result.catch(() => {});
    }
  }
  function stopCallsVideoForNavigation() {
    callsVideoResumeAfterStoryPause = false;
    if (!whatsappCallsVideo.paused) { callsVideoStoryPauseRequested = true; whatsappCallsVideo.pause(); }
    try { whatsappCallsVideo.currentTime = 0; } catch (_) {}
    callsVideoUserPaused = false; callsVideoPlayAttempted = false;
  }
  function updateWhatsAppCalls(localTime) {
    const introVisible = localTime >= CALLS_INTRO_AT_MS;
    const videoVisible = localTime >= CALLS_VIDEO_START_AT_MS;
    whatsappCallsIntro.classList.toggle('is-visible', introVisible);
    whatsappCallsVideoShell.classList.toggle('is-visible', videoVisible);
    whatsappCallsTypewriter.events.forEach(event => event.element.classList.toggle('is-visible', videoVisible && localTime >= CALLS_VIDEO_START_AT_MS + event.at));
    if (videoVisible && activeScene === 32) attemptCallsVideoPlay();
  }

  // Character-by-character tracks used by the two latest scenes. The previous
  // build called this helper without defining it, which stopped script startup
  // before the opening poem could render. Build the spans once; story time then
  // controls visibility so pause/resume and scene navigation remain deterministic.
  function prepareCharacterTrack(elements, startDelay = 0, intervalMs = 70) {
    const events = [];
    let cursor = startDelay;
    let characterCount = 0;

    elements.forEach(element => {
      const originalText = element.textContent;
      element.replaceChildren();
      element.classList.add(
        element.closest('.scene-separation') ? 'separation-typed' : 'hope-typed'
      );

      for (const character of Array.from(originalText)) {
        const glyph = document.createElement('span');
        glyph.className = element.closest('.scene-separation')
          ? 'separation-glyph'
          : 'hope-glyph';
        glyph.textContent = character;
        element.appendChild(glyph);
        events.push({ element: glyph, at: cursor });
        cursor += intervalMs;
        characterCount += 1;
      }
    });

    return {
      events,
      characterCount,
      // End time is the timestamp immediately after the final character's slot.
      lastCharacterAt: characterCount ? cursor : startDelay
    };
  }

  // Scene 25: the academic choices now carry the entire separation scene.
  // The heading stays stationary; the two choices enter sequentially, then
  // the approved narration types continuously at 70ms per character.
  const separationChoiceHer = document.querySelector('.separation-choice-her');
  const separationChoiceMine = document.querySelector('.separation-choice-mine');
  const separationCopyElements = [...document.querySelectorAll('.separation-copy p')];
  const SEPARATION_HER_AT = 2200;
  const SEPARATION_MINE_AT = 3500;
  const SEPARATION_COPY_AT = 5050;
  const SEPARATION_TYPEWRITER_MS = 70;

  const separationTrack = prepareCharacterTrack(
    separationCopyElements,
    SEPARATION_COPY_AT,
    SEPARATION_TYPEWRITER_MS
  );
  const separationDuration = sceneDurationWithReading(
    22,
    Math.max(
      SEPARATION_HER_AT + 1290,
      SEPARATION_MINE_AT + 1290,
      typewriterPresentationEnd(separationTrack, 0, 0)
    ),
    typewriterReadingEvents(separationCopyElements, separationTrack, 0)
      .concat([
        textRevealEvent(SEPARATION_HER_AT + 1290, separationChoiceHer.textContent),
        textRevealEvent(SEPARATION_MINE_AT + 1290, separationChoiceMine.textContent)
      ])
  );

  function applyPopSettle(element, localTime, startAt, options = {}) {
    const popMs = options.popMs ?? 650;
    const holdMs = options.holdMs ?? 300;
    const settleMs = options.settleMs ?? 430;
    const startScale = options.startScale ?? .72;
    const peakScale = options.peakScale ?? 1.13;
    const endScale = options.endScale ?? 1;
    const lift = options.lift ?? 24;
    const t = localTime - startAt;
    const fade = easeOutCubic(t / Math.min(popMs, 450));
    let scale;
    let y;
    if (t < 0) {
      scale = startScale;
      y = lift;
    } else if (t <= popMs) {
      const p = easeOutBack(t / popMs);
      scale = startScale + (peakScale - startScale) * p;
      y = lift * (1 - easeOutCubic(t / popMs));
    } else if (t <= popMs + holdMs) {
      scale = peakScale;
      y = 0;
    } else {
      const p = smoothProgress((t - popMs - holdMs) / settleMs);
      scale = peakScale + (endScale - peakScale) * p;
      y = 0;
    }
    element.style.opacity = fade.toFixed(3);
    element.style.filter = `blur(${(2.6 * (1 - fade)).toFixed(2)}px)`;
    element.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
  }

  function updateSeparationScene(localTime) {
    applyPopSettle(separationChoiceHer, localTime, SEPARATION_HER_AT, {
      popMs: 690, holdMs: 180, settleMs: 420, startScale: .68, peakScale: 1.14, lift: 24
    });
    applyPopSettle(separationChoiceMine, localTime, SEPARATION_MINE_AT, {
      popMs: 690, holdMs: 180, settleMs: 420, startScale: .68, peakScale: 1.14, lift: 24
    });
    separationTrack.events.forEach(event => {
      event.element.classList.toggle('is-visible', localTime >= event.at);
    });
  }

  // Scene 26: the remaining connection, ending on ENGLISH TUITION.
  const hopeIntroBlock = document.querySelector('.hope-intro-block');
  const hopeIntroParagraph = document.querySelector('.hope-intro-copy');
  const hopeEnglishTitle = document.querySelector('.hope-english-title');
  const HOPE_TYPEWRITER_MS = 70;
  const HOPE_INTRO_START = 850;
  const hopeIntroTrack = prepareCharacterTrack([hopeIntroParagraph], HOPE_INTRO_START, HOPE_TYPEWRITER_MS);
  const HOPE_ENGLISH_WAIT_MS = 2000;
  const HOPE_ENGLISH_AT = hopeIntroTrack.lastCharacterAt + HOPE_ENGLISH_WAIT_MS;
  const HOPE_ENGLISH_POP_MS = 780;
  const hopeIntroDuration = sceneDurationWithReading(
    23,
    HOPE_ENGLISH_AT + HOPE_ENGLISH_POP_MS + 420,
    typewriterReadingEvents([hopeIntroParagraph], hopeIntroTrack, 0)
      .concat([textRevealEvent(HOPE_ENGLISH_AT + HOPE_ENGLISH_POP_MS + 420, hopeEnglishTitle.textContent)])
  );

  function updateHopeIntroScene(localTime) {
    hopeIntroBlock.style.opacity = '1';
    hopeIntroBlock.style.visibility = 'visible';
    hopeIntroBlock.style.display = 'flex';
    hopeIntroTrack.events.forEach(event => {
      event.element.classList.toggle('is-visible', localTime >= event.at);
    });
    const englishElapsed = localTime - HOPE_ENGLISH_AT;
    if (englishElapsed < 0) {
      hopeEnglishTitle.style.opacity = '0';
      hopeEnglishTitle.style.transform = 'translate3d(0, 18px, 0) scale(.82)';
      hopeEnglishTitle.style.filter = 'blur(3px)';
    } else {
      const enter = easeOutBack(englishElapsed / HOPE_ENGLISH_POP_MS);
      const settle = smoothProgress((englishElapsed - HOPE_ENGLISH_POP_MS) / 420);
      const scale = englishElapsed < HOPE_ENGLISH_POP_MS ? (.82 + (.28 * enter)) : (1.10 - .10 * settle);
      const y = englishElapsed < HOPE_ENGLISH_POP_MS ? 18 * (1 - easeOutCubic(englishElapsed / HOPE_ENGLISH_POP_MS)) : 0;
      const opacity = easeOutCubic(englishElapsed / 420);
      hopeEnglishTitle.style.opacity = opacity.toFixed(3);
      hopeEnglishTitle.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      hopeEnglishTitle.style.filter = `blur(${(2.6 * (1 - opacity)).toFixed(2)}px)`;
    }
  }

  // Scene 27: a dedicated journey reveal. The small kicker sits above the
  // large main heading, followed by the map reveal, route trace and narration.
  const hopeJourneyBlock = document.querySelector('.hope-journey-block');
  const hopeMapFrame = document.querySelector('.hope-map-frame');
  const hopeRouteGlow = document.getElementById('hopeRouteGlow');
  const hopeRouteCore = document.getElementById('hopeRouteCore');
  const hopeRouteRunner = document.getElementById('hopeRouteRunner');
  const hopeWaypointElements = [...document.querySelectorAll('.hope-waypoints circle')];
  const hopeCopyElements = [...document.querySelectorAll('.hope-copy p')];
  const hopeRouteLength = hopeRouteCore.getTotalLength();
  [hopeRouteGlow, hopeRouteCore].forEach(path => {
    path.style.strokeDasharray = `${hopeRouteLength}`;
    path.style.strokeDashoffset = `${hopeRouteLength}`;
  });
  // Begin the map reveal soon after entering the scene. The route still gets
  // its own uninterrupted tracing beat before the map settles and narration starts.
  const HOPE_MAP_AT = 350;
  const HOPE_MAP_POP_MS = 900;
  const HOPE_ROUTE_AT = HOPE_MAP_AT + HOPE_MAP_POP_MS + 300;
  const HOPE_ROUTE_MS = 3600;
  const HOPE_ROUTE_HOLD_MS = 700;
  const HOPE_MAP_SHRINK_AT = HOPE_ROUTE_AT + HOPE_ROUTE_MS + HOPE_ROUTE_HOLD_MS;
  const HOPE_MAP_SHRINK_MS = 900;
  const HOPE_COPY_AT = HOPE_MAP_SHRINK_AT + HOPE_MAP_SHRINK_MS + 250;
  const hopeNarrationTrack = prepareCharacterTrack(hopeCopyElements, HOPE_COPY_AT, HOPE_TYPEWRITER_MS);
  const hopeJourneyDuration = sceneDurationWithReading(
    24,
    typewriterPresentationEnd(hopeNarrationTrack, 0, 0),
    typewriterReadingEvents(hopeCopyElements, hopeNarrationTrack, 0)
  );

  function updateHopeJourneyScene(localTime) {
    // Keep the map's final layout footprint from the first frame. Its entrance
    // and settle are visual transforms, so the narration below never reflows.
    hopeJourneyBlock.style.display = 'flex';
    hopeJourneyBlock.style.visibility = 'visible';
    const initialWidth = hopeInitialMapWidth();
    const finalWidth = hopeFinalMapWidth();
    const initialScale = initialWidth / finalWidth;
    hopeMapFrame.style.width = `${finalWidth}%`;

    const mapElapsed = localTime - HOPE_MAP_AT;
    if (mapElapsed < 0) {
      hopeMapFrame.style.opacity = '0';
      hopeMapFrame.style.filter = 'blur(3px)';
      hopeMapFrame.style.transform = `translate3d(0, 28px, 0) scale(${(initialScale * .76).toFixed(4)})`;
    } else {
      const popP = clamp01(mapElapsed / HOPE_MAP_POP_MS);
      const popEase = easeOutBack(popP);
      const fade = easeOutCubic(mapElapsed / 500);
      let scale = initialScale * (.76 + (.34 * popEase));
      let y = 28 * (1 - easeOutCubic(popP));
      if (localTime >= HOPE_MAP_SHRINK_AT) {
        const shrinkP = smoothProgress((localTime - HOPE_MAP_SHRINK_AT) / HOPE_MAP_SHRINK_MS);
        scale = (initialScale * 1.10) + ((1 - (initialScale * 1.10)) * shrinkP);
        y = 1.5 * shrinkP;
      }
      hopeMapFrame.style.opacity = fade.toFixed(3);
      hopeMapFrame.style.filter = `blur(${(3 * (1 - fade)).toFixed(2)}px)`;
      hopeMapFrame.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    }

    const routeP = smoothProgress((localTime - HOPE_ROUTE_AT) / HOPE_ROUTE_MS);
    const routeOffset = hopeRouteLength * (1 - routeP);
    hopeRouteGlow.style.strokeDashoffset = `${routeOffset}`;
    hopeRouteCore.style.strokeDashoffset = `${routeOffset}`;
    hopeRouteRunner.style.opacity = (routeP > 0 && routeP < 1 ? 1 : 0).toFixed(3);
    if (routeP > 0 && routeP <= 1) {
      const point = hopeRouteCore.getPointAtLength(hopeRouteLength * routeP);
      hopeRouteRunner.setAttribute('cx', point.x.toFixed(2));
      hopeRouteRunner.setAttribute('cy', point.y.toFixed(2));
    }
    hopeWaypointElements.forEach(dot => {
      const stopProgress = Number(dot.dataset.routeProgress || 1);
      const reveal = clamp01((routeP - stopProgress) / 0.035);
      dot.style.opacity = reveal.toFixed(3);
      dot.style.transformBox = 'fill-box';
      dot.style.transformOrigin = 'center';
      dot.style.transform = `scale(${(0.72 + 0.28 * reveal).toFixed(3)})`;
    });
    hopeNarrationTrack.events.forEach(event => {
      event.element.classList.toggle('is-visible', localTime >= event.at);
    });
  }

  function hopeInitialMapWidth() {
    if (window.matchMedia('(max-width: 650px)').matches) return 90;
    if (window.matchMedia('(max-height: 700px)').matches) return 70;
    return 72;
  }

  // At least 10% smaller than the previous permanent map dimensions.
  function hopeFinalMapWidth() {
    return window.matchMedia('(max-width: 650px)').matches ? 73 : 55;
  }

  // Scene 37: the title stays visible and stationary while the narration
  // types continuously, one character every 70ms. Calculate the final reading
  // hold from the words that remain outstanding when the typewriter finishes.
  const JUST_A_GLIMPSE_TYPE_INTERVAL_MS = 70;
  const justAGlimpseParagraphs = [...document.querySelectorAll('.just-a-glimpse-copy p')];

  function prepareJustAGlimpseTypewriter(paragraphs) {
    const events = [];
    let cursor = 0;
    paragraphs.forEach(paragraph => {
      const originalText = paragraph.textContent;
      paragraph.replaceChildren();
      for (const character of Array.from(originalText)) {
        if (/\s/.test(character)) {
          paragraph.appendChild(document.createTextNode(character));
        } else {
          const glyph = document.createElement('span');
          glyph.className = 'just-a-glimpse-glyph';
          glyph.textContent = character;
          paragraph.appendChild(glyph);
        }
        // Spaces and punctuation count toward the requested 70ms cadence.
        const glyph = paragraph.lastElementChild;
        if (glyph && glyph.classList.contains('just-a-glimpse-glyph')) {
          events.push({ element: glyph, at: cursor });
        }
        cursor += JUST_A_GLIMPSE_TYPE_INTERVAL_MS;
      }
    });
    return { events, typingDuration: cursor };
  }

  const justAGlimpseTypewriter = prepareJustAGlimpseTypewriter(justAGlimpseParagraphs);
  const justAGlimpseDuration = sceneDurationWithReading(
    34,
    typewriterPresentationEnd(justAGlimpseTypewriter, 0, 120),
    typewriterReadingEvents(justAGlimpseParagraphs, justAGlimpseTypewriter, 0)
  );

  // Scenes 38–39: stationary titles with continuous 70ms-per-character
  // narration and an objective reading hold after the final character appears.
  const CHAPTER_TEXT_TYPE_INTERVAL_MS = 70;

  function prepareChapterTextTypewriter(paragraphs, glyphClass) {
    const events = [];
    let cursor = 0;
    paragraphs.forEach(paragraph => {
      const originalText = paragraph.textContent;
      paragraph.replaceChildren();
      for (const character of Array.from(originalText)) {
        if (/\s/.test(character)) {
          paragraph.appendChild(document.createTextNode(character));
        } else {
          const glyph = document.createElement('span');
          glyph.className = glyphClass;
          glyph.textContent = character;
          paragraph.appendChild(glyph);
          events.push({ element: glyph, at: cursor });
        }
        cursor += CHAPTER_TEXT_TYPE_INTERVAL_MS;
      }
    });
    return { events, typingDuration: cursor };
  }

  const returningHomeParagraphs = [...document.querySelectorAll('.returning-home-copy p')];
  const returningHomeTypewriter = prepareChapterTextTypewriter(
    returningHomeParagraphs, 'chapter-text-glyph'
  );
  const returningHomeDuration = sceneDurationWithReading(
    35,
    typewriterPresentationEnd(returningHomeTypewriter, 0),
    typewriterReadingEvents(returningHomeParagraphs, returningHomeTypewriter, 0)
  );
  const closerApartParagraphs = [...document.querySelectorAll('.closer-apart-copy p')];
  const closerApartTypewriter = prepareChapterTextTypewriter(
    closerApartParagraphs, 'chapter-text-glyph'
  );
  const closerApartDuration = sceneDurationWithReading(
    36,
    typewriterPresentationEnd(closerApartTypewriter, 0),
    typewriterReadingEvents(closerApartParagraphs, closerApartTypewriter, 0)
  );


  // Scene 40: the WhatsApp recording appears first, followed by the four
  // photographs one by one. The narration begins 2s after the final image.
  const SECOND_DROP_VIDEO_FIRST_AT_MS = 350;
  const SECOND_DROP_VIDEO_FADE_MS = 420;
  const SECOND_DROP_PHOTO_FIRST_AFTER_VIDEO_MS = 240;
  const SECOND_DROP_PHOTO_STAGGER_MS = 420;
  const SECOND_DROP_PHOTO_FADE_MS = 380;
  const SECOND_DROP_NARRATION_GAP_MS = 2000;
  const secondDropRoot = document.querySelector('.scene-second-drop-connection');
  const secondDropVideoShell = secondDropRoot.querySelector('.second-drop-connection-video-shell');
  const secondDropVideo = secondDropRoot.querySelector('.second-drop-connection-video');
  const secondDropPhotos = [...secondDropRoot.querySelectorAll('.second-drop-connection-photo')];
  const secondDropVideoAt = SECOND_DROP_VIDEO_FIRST_AT_MS;
  const secondDropPhotoFirstAt = secondDropVideoAt + SECOND_DROP_VIDEO_FADE_MS + SECOND_DROP_PHOTO_FIRST_AFTER_VIDEO_MS;
  const secondDropPhotoTimes = secondDropPhotos.map((_, i) => secondDropPhotoFirstAt + i * SECOND_DROP_PHOTO_STAGGER_MS);
  const secondDropNarrationStartAt = secondDropPhotoTimes[secondDropPhotoTimes.length - 1] + SECOND_DROP_PHOTO_FADE_MS + SECOND_DROP_NARRATION_GAP_MS;
  const secondDropCopyParagraphs = [...secondDropRoot.querySelectorAll('.second-drop-connection-copy p')];
  const secondDropConnectionTypewriter = prepareChapterTextTypewriter(
    secondDropCopyParagraphs, 'second-drop-connection-glyph'
  );
  const secondDropConnectionDuration = sceneDurationWithReading(
    37,
    Math.max(
      secondDropVideoAt + SECOND_DROP_VIDEO_FADE_MS,
      (secondDropPhotoTimes[secondDropPhotoTimes.length - 1] || 0) + SECOND_DROP_PHOTO_FADE_MS,
      typewriterPresentationEnd(secondDropConnectionTypewriter, secondDropNarrationStartAt)
    ),
    typewriterReadingEvents(secondDropCopyParagraphs, secondDropConnectionTypewriter, secondDropNarrationStartAt)
  );

  // Scene 41: January 23, 2026 — three photographs from the first proper date
  // in Tufanganj. Each photo pops into its permanent position, holds for 2s,
  // and settles before the next one begins. Narration then types at 70ms/char.
  const JAN23_PHOTO_START_MS = 500;
  const JAN23_PHOTO_POP_MS = 550;
  const JAN23_PHOTO_HOLD_MS = 2000;
  const JAN23_PHOTO_SETTLE_MS = 550;
  const JAN23_PHOTO_BETWEEN_MS = 250;
  const JAN23_COPY_GAP_MS = 450;
  const jan23Root = document.querySelector('.scene-jan23-date');
  const jan23Photos = [...jan23Root.querySelectorAll('.jan23-date-photo')];
  const jan23CopyParagraphs = [...jan23Root.querySelectorAll('.jan23-date-copy p')];
  const jan23Typewriter = prepareChapterTextTypewriter(jan23CopyParagraphs, 'jan23-date-glyph');
  const jan23PhotoCycle = JAN23_PHOTO_POP_MS + JAN23_PHOTO_HOLD_MS + JAN23_PHOTO_SETTLE_MS + JAN23_PHOTO_BETWEEN_MS;
  const jan23PhotoStarts = jan23Photos.map((_, i) => JAN23_PHOTO_START_MS + i * jan23PhotoCycle);
  const jan23NarrationStartAt = jan23PhotoStarts[jan23PhotoStarts.length - 1] + JAN23_PHOTO_POP_MS + JAN23_PHOTO_HOLD_MS + JAN23_PHOTO_SETTLE_MS + JAN23_COPY_GAP_MS;
  const jan23DateDuration = sceneDurationWithReading(
    38,
    Math.max(
      (jan23PhotoStarts[jan23PhotoStarts.length - 1] || 0) + JAN23_PHOTO_POP_MS + JAN23_PHOTO_HOLD_MS + JAN23_PHOTO_SETTLE_MS,
      typewriterPresentationEnd(jan23Typewriter, jan23NarrationStartAt)
    ),
    typewriterReadingEvents(jan23CopyParagraphs, jan23Typewriter, jan23NarrationStartAt)
      .concat([textRevealEvent(0, jan23Root.querySelector('.jan23-date-kicker').textContent)])
  );

  function updateJan23Date(localTime) {
    jan23Photos.forEach((photo, i) => {
      applyFullscreenPhotoPopup(photo, localTime, jan23PhotoStarts[i], {
        popMs: JAN23_PHOTO_POP_MS,
        holdMs: JAN23_PHOTO_HOLD_MS,
        settleMs: JAN23_PHOTO_SETTLE_MS
      });
    });
    jan23Typewriter.events.forEach(event => {
      event.element.classList.toggle('is-visible', localTime >= jan23NarrationStartAt + event.at);
    });
  }

  // Scene 42: the two photographs appear one after another in the centre,
  // hold for 2 seconds, then settle outward to frame the muted video.
  const LAST_GLIMPSES_PHOTO_START_MS = 500;
  const LAST_GLIMPSES_POP_MS = 550;
  const LAST_GLIMPSES_HOLD_MS = 2000;
  const LAST_GLIMPSES_SETTLE_MS = 550;
  const LAST_GLIMPSES_BETWEEN_MS = 250;
  const LAST_GLIMPSES_VIDEO_GAP_MS = 250;
  const LAST_GLIMPSES_VIDEO_FADE_MS = 420;
  const LAST_GLIMPSES_COPY_GAP_MS = 2000;
  const lastGlimpsesRoot = document.querySelector('.scene-last-glimpses');
  const lastGlimpsesPhotos = [...lastGlimpsesRoot.querySelectorAll('.last-glimpses-photo')];
  const lastGlimpsesVideoShell = lastGlimpsesRoot.querySelector('.last-glimpses-video-shell');
  const lastGlimpsesVideo = lastGlimpsesRoot.querySelector('.last-glimpses-video');
  const lastGlimpsesAudioToggle = lastGlimpsesRoot.querySelector('.last-glimpses-audio-toggle');
  const lastGlimpsesCopyParagraphs = [...lastGlimpsesRoot.querySelectorAll('.last-glimpses-copy p')];
  const lastGlimpsesTypewriter = prepareChapterTextTypewriter(lastGlimpsesCopyParagraphs, 'last-glimpses-glyph');
  const LAST_GLIMPSES_PHOTO_CYCLE_MS = LAST_GLIMPSES_POP_MS + LAST_GLIMPSES_HOLD_MS + LAST_GLIMPSES_SETTLE_MS + LAST_GLIMPSES_BETWEEN_MS;
  const lastGlimpsesPhotoStarts = lastGlimpsesPhotos.map((_, i) => LAST_GLIMPSES_PHOTO_START_MS + i * LAST_GLIMPSES_PHOTO_CYCLE_MS);
  const lastGlimpsesVideoAt = lastGlimpsesPhotoStarts[lastGlimpsesPhotoStarts.length - 1] + LAST_GLIMPSES_POP_MS + LAST_GLIMPSES_HOLD_MS + LAST_GLIMPSES_SETTLE_MS + LAST_GLIMPSES_VIDEO_GAP_MS;
  const lastGlimpsesCopyStartAt = lastGlimpsesVideoAt + LAST_GLIMPSES_VIDEO_FADE_MS + LAST_GLIMPSES_COPY_GAP_MS;
  const lastGlimpsesDuration = sceneDurationWithReading(
    39,
    Math.max(
      (lastGlimpsesPhotoStarts[lastGlimpsesPhotoStarts.length - 1] || 0) + LAST_GLIMPSES_POP_MS + LAST_GLIMPSES_HOLD_MS + LAST_GLIMPSES_SETTLE_MS,
      lastGlimpsesVideoAt + LAST_GLIMPSES_VIDEO_FADE_MS,
      typewriterPresentationEnd(lastGlimpsesTypewriter, lastGlimpsesCopyStartAt)
    ),
    typewriterReadingEvents(lastGlimpsesCopyParagraphs, lastGlimpsesTypewriter, lastGlimpsesCopyStartAt)
  );

  function applyLastGlimpsePhoto(photo, localTime, startAt, direction) {
    applyFullscreenPhotoPopup(photo, localTime, startAt, {
      popMs: LAST_GLIMPSES_POP_MS,
      holdMs: LAST_GLIMPSES_HOLD_MS,
      settleMs: LAST_GLIMPSES_SETTLE_MS
    });
  }

  function syncLastGlimpsesAudioButton() {
    const isMuted = lastGlimpsesVideo.muted;
    lastGlimpsesAudioToggle.textContent = isMuted ? 'Unmute' : 'Mute';
    lastGlimpsesAudioToggle.setAttribute('aria-label', isMuted ? 'Unmute video' : 'Mute video');
    lastGlimpsesAudioToggle.setAttribute('aria-pressed', String(!isMuted));
  }
  lastGlimpsesAudioToggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    lastGlimpsesVideo.muted = !lastGlimpsesVideo.muted;
    syncLastGlimpsesAudioButton();
  });
  lastGlimpsesVideo.addEventListener('volumechange', syncLastGlimpsesAudioButton);
  lastGlimpsesVideo.muted = true;
  syncLastGlimpsesAudioButton();

  let lastGlimpsesVideoUserPaused = false;
  let lastGlimpsesVideoPlayAttempted = false;
  let lastGlimpsesVideoStoryPauseRequested = false;
  let lastGlimpsesVideoResumeAfterStoryPause = false;
  lastGlimpsesVideo.addEventListener('play', () => {
    if (!lastGlimpsesVideoStoryPauseRequested) lastGlimpsesVideoUserPaused = false;
  });
  lastGlimpsesVideo.addEventListener('pause', () => {
    if (lastGlimpsesVideoStoryPauseRequested) { lastGlimpsesVideoStoryPauseRequested = false; return; }
    if (!lastGlimpsesVideo.ended) lastGlimpsesVideoUserPaused = true;
  });
  function attemptLastGlimpsesVideoPlay() {
    if (paused || ended || lastGlimpsesVideoUserPaused || lastGlimpsesVideo.ended || lastGlimpsesVideoPlayAttempted) return;
    lastGlimpsesVideoPlayAttempted = true;
    const result = lastGlimpsesVideo.play();
    if (result && typeof result.catch === 'function') result.catch(error => console.info('Last-glimpses video autoplay unavailable; use its Play control.', error));
  }
  function pauseLastGlimpsesVideoForStory() {
    lastGlimpsesVideoResumeAfterStoryPause = Boolean(!lastGlimpsesVideo.paused && !lastGlimpsesVideo.ended);
    if (lastGlimpsesVideoResumeAfterStoryPause) { lastGlimpsesVideoStoryPauseRequested = true; lastGlimpsesVideo.pause(); }
  }
  function resumeLastGlimpsesVideoForStory() {
    const shouldResume = lastGlimpsesVideoResumeAfterStoryPause;
    lastGlimpsesVideoResumeAfterStoryPause = false;
    if (shouldResume && !lastGlimpsesVideoUserPaused && !lastGlimpsesVideo.ended && lastGlimpsesVideo.paused) {
      const result = lastGlimpsesVideo.play();
      if (result && typeof result.catch === 'function') result.catch(() => {});
    }
  }
  function stopLastGlimpsesVideoForNavigation() {
    lastGlimpsesVideoResumeAfterStoryPause = false;
    if (!lastGlimpsesVideo.paused) { lastGlimpsesVideoStoryPauseRequested = true; lastGlimpsesVideo.pause(); }
    try { lastGlimpsesVideo.currentTime = 0; } catch (_) { /* metadata may not be ready */ }
    lastGlimpsesVideo.muted = true;
    syncLastGlimpsesAudioButton();
    lastGlimpsesVideoUserPaused = false;
    lastGlimpsesVideoPlayAttempted = false;
  }
  function updateLastGlimpses(localTime) {
    applyLastGlimpsePhoto(lastGlimpsesPhotos[0], localTime, lastGlimpsesPhotoStarts[0], 1);
    applyLastGlimpsePhoto(lastGlimpsesPhotos[1], localTime, lastGlimpsesPhotoStarts[1], -1);
    const videoVisible = localTime >= lastGlimpsesVideoAt;
    lastGlimpsesVideoShell.classList.toggle('is-visible', videoVisible);
    lastGlimpsesTypewriter.events.forEach(event => {
      event.element.classList.toggle('is-visible', localTime >= lastGlimpsesCopyStartAt + event.at);
    });
    if (videoVisible && activeScene === 39) attemptLastGlimpsesVideoPlay();
  }

  let secondDropVideoUserPaused = false;
  let secondDropVideoPlayAttempted = false;
  let secondDropVideoStoryPauseRequested = false;
  let secondDropVideoResumeAfterStoryPause = false;

  secondDropVideo.addEventListener('play', () => {
    if (!secondDropVideoStoryPauseRequested) secondDropVideoUserPaused = false;
  });
  secondDropVideo.addEventListener('pause', () => {
    if (secondDropVideoStoryPauseRequested) {
      secondDropVideoStoryPauseRequested = false;
      return;
    }
    if (!secondDropVideo.ended) secondDropVideoUserPaused = true;
  });

  function attemptSecondDropVideoPlay() {
    if (paused || ended || secondDropVideoUserPaused || secondDropVideo.ended || secondDropVideoPlayAttempted) return;
    secondDropVideoPlayAttempted = true;
    const result = secondDropVideo.play();
    if (result && typeof result.catch === 'function') {
      result.catch(error => console.info('WhatsApp recording autoplay unavailable; use the video Play control.', error));
    }
  }

  function pauseSecondDropVideoForStory() {
    secondDropVideoResumeAfterStoryPause = Boolean(!secondDropVideo.paused && !secondDropVideo.ended);
    if (secondDropVideoResumeAfterStoryPause) {
      secondDropVideoStoryPauseRequested = true;
      secondDropVideo.pause();
    }
  }

  function resumeSecondDropVideoForStory() {
    const shouldResume = secondDropVideoResumeAfterStoryPause;
    secondDropVideoResumeAfterStoryPause = false;
    if (shouldResume && !secondDropVideoUserPaused && !secondDropVideo.ended && secondDropVideo.paused) {
      const result = secondDropVideo.play();
      if (result && typeof result.catch === 'function') result.catch(() => {});
    }
  }

  function stopSecondDropVideoForNavigation() {
    secondDropVideoResumeAfterStoryPause = false;
    if (!secondDropVideo.paused) {
      secondDropVideoStoryPauseRequested = true;
      secondDropVideo.pause();
    }
    try { secondDropVideo.currentTime = 0; } catch (_) { /* metadata may not be ready */ }
    secondDropVideoUserPaused = false;
    secondDropVideoPlayAttempted = false;
  }

  function updateSecondDropConnection(localTime) {
    const videoVisible = localTime >= secondDropVideoAt;
    secondDropVideoShell.classList.toggle('is-visible', videoVisible);
    secondDropPhotos.forEach((photo, i) => {
      photo.classList.toggle('is-visible', localTime >= secondDropPhotoTimes[i]);
    });
    secondDropConnectionTypewriter.events.forEach(event => {
      event.element.classList.toggle('is-visible', localTime >= secondDropNarrationStartAt + event.at);
    });
    if (videoVisible && activeScene === 37) attemptSecondDropVideoPlay();
  }

  // Scenes 43–45: the Holi incident, the waiting period, and the breakup.
  const HOLI_REFLECTION_START_MS = 450;
  const holiReflectionRoot = document.querySelector('.scene-holi-reflection');
  const holiReflectionCopy = [...holiReflectionRoot.querySelectorAll('.holi-reflection-copy p')];
  const holiReflectionTypewriter = prepareChapterTextTypewriter(holiReflectionCopy, 'new-memory-glyph');
  const holiReflectionParagraphs = [...document.querySelectorAll('.holi-reflection-copy p')];
  const holiReflectionDuration = sceneDurationWithReading(
    40,
    typewriterPresentationEnd(holiReflectionTypewriter, HOLI_REFLECTION_START_MS),
    typewriterReadingEvents(holiReflectionParagraphs, holiReflectionTypewriter, HOLI_REFLECTION_START_MS)
      .concat([textRevealEvent(0, document.querySelector('.scene-holi-reflection .new-memory-date').textContent)])
  );

  const WAITING_DAYS_SCREENSHOT_START_MS = 500;
  const WAITING_DAYS_SCREENSHOT_POP_MS = 550;
  const WAITING_DAYS_SCREENSHOT_HOLD_MS = 2000;
  const WAITING_DAYS_SCREENSHOT_SETTLE_MS = 550;
  const WAITING_DAYS_COPY_GAP_MS = 450;
  const WAITING_DAYS_NARRATION_START_MS = WAITING_DAYS_SCREENSHOT_START_MS + WAITING_DAYS_SCREENSHOT_POP_MS + WAITING_DAYS_SCREENSHOT_HOLD_MS + WAITING_DAYS_SCREENSHOT_SETTLE_MS + WAITING_DAYS_COPY_GAP_MS;
  const waitingDaysRoot = document.querySelector('.scene-waiting-days');
  const waitingDaysScreenshotFrame = waitingDaysRoot.querySelector('.waiting-days-screenshot-frame');
  const waitingDaysCopy = [...waitingDaysRoot.querySelectorAll('.waiting-days-copy p')];
  const waitingDaysTypewriter = prepareChapterTextTypewriter(waitingDaysCopy, 'new-memory-glyph');
  const waitingDaysGrandfatherPhrase = 'learned that your grandfather had passed away';
  const waitingDaysGrandfatherPhraseIndex = Array.from(waitingDaysCopy[3].textContent).join('').indexOf(waitingDaysGrandfatherPhrase);
  const waitingDaysGrandfatherCharacterOffset = waitingDaysCopy.slice(0, 3)
    .reduce((sum, paragraph) => sum + Array.from(paragraph.textContent).length, 0)
    + Math.max(0, waitingDaysGrandfatherPhraseIndex);
  const waitingDaysGrandfatherMomentAt = WAITING_DAYS_NARRATION_START_MS
    + waitingDaysGrandfatherCharacterOffset * CHAPTER_TEXT_TYPE_INTERVAL_MS;
  const waitingDaysDuration = sceneDurationWithReading(
    41,
    Math.max(
      WAITING_DAYS_SCREENSHOT_START_MS + WAITING_DAYS_SCREENSHOT_POP_MS + WAITING_DAYS_SCREENSHOT_HOLD_MS + WAITING_DAYS_SCREENSHOT_SETTLE_MS,
      typewriterPresentationEnd(waitingDaysTypewriter, WAITING_DAYS_NARRATION_START_MS)
    ),
    typewriterReadingEvents(waitingDaysCopy, waitingDaysTypewriter, WAITING_DAYS_NARRATION_START_MS)
  );

  const BREAKUP_VIDEO_AT_MS = 450;
  const BREAKUP_VIDEO_FADE_MS = 380;
  const BREAKUP_COPY_GAP_MS = 2000;
  const BREAKUP_NARRATION_START_MS = BREAKUP_VIDEO_AT_MS + BREAKUP_VIDEO_FADE_MS + BREAKUP_COPY_GAP_MS;
  const breakupRoot = document.querySelector('.scene-breakup-day');
  const breakupVideoShell = breakupRoot.querySelector('.breakup-video-shell');
  const breakupVideo = breakupRoot.querySelector('.breakup-conversation-video');
  const breakupCopy = [...breakupRoot.querySelectorAll('.breakup-day-copy p')];
  const breakupTypewriter = prepareChapterTextTypewriter(breakupCopy, 'new-memory-glyph');
  const breakupDuration = sceneDurationWithReading(
    42,
    Math.max(
      BREAKUP_VIDEO_AT_MS + BREAKUP_VIDEO_FADE_MS,
      typewriterPresentationEnd(breakupTypewriter, BREAKUP_NARRATION_START_MS)
    ),
    typewriterReadingEvents(breakupCopy, breakupTypewriter, BREAKUP_NARRATION_START_MS)
      .concat([textRevealEvent(0, breakupRoot.querySelector('.new-memory-date').textContent)])
  );

  // Scenes 46–48: the period after the breakup and the June 1 introduction.
  const AFTER_BREAKUP_TEXT_START_MS = 450;
  const afterBreakupHopeParagraphs = [...document.querySelectorAll('.after-breakup-hope-copy p')];
  const afterBreakupHopeTypewriter = prepareChapterTextTypewriter(
    afterBreakupHopeParagraphs, 'new-memory-glyph'
  );
  const afterBreakupHopeDuration = sceneDurationWithReading(
    43,
    typewriterPresentationEnd(afterBreakupHopeTypewriter, AFTER_BREAKUP_TEXT_START_MS),
    typewriterReadingEvents(afterBreakupHopeParagraphs, afterBreakupHopeTypewriter, AFTER_BREAKUP_TEXT_START_MS)
  );
  const anotherChanceCopyParagraphs = [...document.querySelectorAll('.another-chance-copy p')];
  const anotherChanceTypewriter = prepareChapterTextTypewriter(
    anotherChanceCopyParagraphs, 'new-memory-glyph'
  );
  const reNEETPhrase = 'Then NEET was cancelled.';
  const reNEETPhraseIndex = Array.from(anotherChanceCopyParagraphs[2].textContent).join('').indexOf(reNEETPhrase);
  const reNEETCharacterOffset = anotherChanceCopyParagraphs.slice(0, 2)
    .reduce((sum, paragraph) => sum + Array.from(paragraph.textContent).length, 0)
    + Math.max(0, reNEETPhraseIndex);
  const reNEETMomentAt = AFTER_BREAKUP_TEXT_START_MS
    + reNEETCharacterOffset * CHAPTER_TEXT_TYPE_INTERVAL_MS;
  const anotherChanceDuration = sceneDurationWithReading(
    44,
    typewriterPresentationEnd(anotherChanceTypewriter, AFTER_BREAKUP_TEXT_START_MS),
    typewriterReadingEvents(anotherChanceCopyParagraphs, anotherChanceTypewriter, AFTER_BREAKUP_TEXT_START_MS)
  );
  const whatICameToKnowTypewriter = prepareChapterTextTypewriter(
    [...document.querySelectorAll('.what-i-came-to-know-copy p')], 'new-memory-glyph'
  );
  const WHAT_CHAT_AFTER_INTRO_MS = 3000;
  const WHAT_CHAT_WORD_INTERVAL_MS = 330;
  const whatChatFeed = document.getElementById('whatChatFeed');
  const whatChatMessages = [...whatChatFeed.querySelectorAll('[data-chat-message]')];
  // Count linguistic word tokens rather than spaces so punctuation such as
  // "......" and ".." never adds a false word to the agreed reading delay.
  const whatChatSchedule = whatChatMessages.map((element, index) => {
    const text = element.querySelector('.what-chat-bubble').textContent;
    const words = (text.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g) || []).length;
    const at = whatChatMessages.slice(0, index).reduce((sum, previous) => {
      const previousText = previous.querySelector('.what-chat-bubble').textContent;
      return sum + (previousText.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g) || []).length * WHAT_CHAT_WORD_INTERVAL_MS;
    }, 0);
    return { element, at, words };
  });
  const WHAT_CHAT_START_MS = AFTER_BREAKUP_TEXT_START_MS + whatICameToKnowTypewriter.typingDuration + WHAT_CHAT_AFTER_INTRO_MS;
  const whatChatReadingEvents = whatChatSchedule.map(item => textRevealEvent(
    WHAT_CHAT_START_MS + item.at,
    item.element.textContent
  ));
  const whatChatLastRowAt = whatChatSchedule.length
    ? WHAT_CHAT_START_MS + whatChatSchedule[whatChatSchedule.length - 1].at + 340
    : WHAT_CHAT_START_MS;
  const whatICameToKnowDuration = sceneDurationWithReading(
    45,
    Math.max(
      typewriterPresentationEnd(whatICameToKnowTypewriter, AFTER_BREAKUP_TEXT_START_MS),
      whatChatLastRowAt
    ),
    typewriterReadingEvents(
      [...document.querySelectorAll('.what-i-came-to-know-copy p')],
      whatICameToKnowTypewriter,
      AFTER_BREAKUP_TEXT_START_MS
    ).concat(whatChatReadingEvents)
  );

  // Scene 49: two independent vertical timeline columns. The first four events
  // reveal down the left column; the final three continue down the right.
  // Each card remains visible for 0.33s per displayed word before the next card.
  const thingsStage = document.getElementById('thingsStage');
  const thingsIntro = thingsStage.querySelector('.things-intro');
  const thingsIntroTypewriter = prepareChapterTextTypewriter([thingsIntro], 'new-memory-glyph');
  const THINGS_TIMELINE_START_GAP_MS = 2000;
  const THINGS_WORD_INTERVAL_MS = 330;
  const thingsEvents = [...thingsStage.querySelectorAll('.things-event')];
  let thingsTimelineCursor = THINGS_TIMELINE_START_GAP_MS;
  const thingsTimelineSchedule = thingsEvents.map(element => {
    const words = countWords(element.textContent);
    const item = { element, at: thingsTimelineCursor, words };
    thingsTimelineCursor += words * THINGS_WORD_INTERVAL_MS;
    return item;
  });
  const thingsNarration = [...thingsStage.querySelectorAll('.things-narration p')];
  const lastThingsEvent = thingsTimelineSchedule.length
    ? thingsTimelineSchedule[thingsTimelineSchedule.length - 1]
    : null;
  const lastThingsEventAt = lastThingsEvent
    ? lastThingsEvent.at
    : THINGS_TIMELINE_START_GAP_MS;
  // Keep the final timeline card on screen for its full reading interval too.
  // Only after that 0.33s-per-word interval does the narration begin.
  const lastThingsEventReadingMs = lastThingsEvent
    ? lastThingsEvent.words * THINGS_WORD_INTERVAL_MS
    : 0;
  const thingsNarrationStartMs = AFTER_BREAKUP_TEXT_START_MS + thingsIntroTypewriter.typingDuration + lastThingsEventAt + lastThingsEventReadingMs;
  const thingsNarrationTypewriter = prepareChapterTextTypewriter(thingsNarration, 'new-memory-glyph');
  const thingsMobileLayout = window.matchMedia('(max-width: 760px)');
  const thingsLeftColumn = thingsStage.querySelector('.things-timeline-left');
  const thingsRightColumn = thingsStage.querySelector('.things-timeline-right');
  const thingsMobileTrack = thingsStage.querySelector('.things-mobile-track');
  function updateThingsTimelineTracks() {
    const visibleEvents = thingsEvents.filter(element => element.classList.contains('is-visible'));
    [thingsLeftColumn, thingsRightColumn].forEach(column => {
      if (!column) return;
      const track = column.querySelector('.things-timeline-track');
      if (!track) return;
      const columnEvents = [...column.querySelectorAll('.things-event.is-visible')];
      if (!columnEvents.length) {
        track.style.height = '0px';
        return;
      }
      const columnRect = column.getBoundingClientRect();
      const lastRect = columnEvents[columnEvents.length - 1].getBoundingClientRect();
      // The dotted line ends at the centre of the latest revealed marker.
      const markerCentre = lastRect.top - columnRect.top + 16.5;
      track.style.height = `${Math.max(0, markerCentre - 9)}px`;
    });
    if (thingsMobileTrack) {
      if (!thingsMobileLayout.matches || !visibleEvents.length) {
        thingsMobileTrack.style.height = '0px';
      } else {
        const grid = thingsStage.querySelector('.things-timeline-grid');
        const gridRect = grid.getBoundingClientRect();
        const lastRect = visibleEvents[visibleEvents.length - 1].getBoundingClientRect();
        const markerCentre = lastRect.top - gridRect.top + 16.5;
        thingsMobileTrack.style.height = `${Math.max(0, markerCentre - 8)}px`;
      }
    }
  }

  function keepLatestThingsItemVisible(element) {
    if (performance.now() < restorationScrollGuardUntil) return;
    if (!element || thingsStage.scrollHeight <= thingsStage.clientHeight + 2) return;
    const stageRect = thingsStage.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const itemBottom = itemRect.bottom - stageRect.top + thingsStage.scrollTop;
    const visibleBottom = thingsStage.scrollTop + thingsStage.clientHeight;
    // Keep the timeline stationary until the next revealed item reaches
    // the lower reading gutter. Native touch scrolling remains available.
    if (itemBottom > visibleBottom - 8) {
      thingsStage.scrollTo({
        top: Math.max(0, itemBottom - thingsStage.clientHeight + 8),
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }
  }
  const thingsIntroParagraphs = [thingsIntro];
  const thingsReadingEvents = typewriterReadingEvents(
    thingsIntroParagraphs, thingsIntroTypewriter, AFTER_BREAKUP_TEXT_START_MS
  ).concat(thingsTimelineSchedule.map(item => textRevealEvent(
    AFTER_BREAKUP_TEXT_START_MS + thingsIntroTypewriter.typingDuration + item.at,
    item.element.textContent
  ))).concat(typewriterReadingEvents(
    thingsNarration, thingsNarrationTypewriter, thingsNarrationStartMs
  ));
  const thingsDuration = sceneDurationWithReading(
    46,
    typewriterPresentationEnd(thingsNarrationTypewriter, thingsNarrationStartMs),
    thingsReadingEvents
  );

  // Scene 50: examination outcomes appear in a 2x2 grid after a two-second
  // pause once the opening narration has completely finished. Cards reveal in
  // chronological order and remain visible while the next result is read.
  const examResultsStage = document.getElementById('examResultsStage');
  const examResultsScroll = document.getElementById('examResultsScroll');
  const examResultsIntro = [...examResultsStage.querySelectorAll('.exam-results-copy p')];
  const examResultsIntroTypewriter = prepareChapterTextTypewriter(examResultsIntro, 'new-memory-glyph');
  const EXAM_RESULTS_GRID_PAUSE_MS = 2000;
  const EXAM_RESULTS_WORD_INTERVAL_MS = 330;
  const examResultCards = [...examResultsStage.querySelectorAll('.exam-result-card')];
  let examResultsCursor = 0;
  const examResultsSchedule = examResultCards.map(element => {
    const result = element.querySelector('p').textContent;
    const words = (result.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g) || []).length;
    const item = { element, at: examResultsCursor, words };
    examResultsCursor += words * EXAM_RESULTS_WORD_INTERVAL_MS;
    return item;
  });
  const examResultsClosing = [...examResultsStage.querySelectorAll('.exam-results-closing p')];
  const examResultsClosingStartMs = AFTER_BREAKUP_TEXT_START_MS
    + examResultsIntroTypewriter.typingDuration
    + EXAM_RESULTS_GRID_PAUSE_MS
    + examResultsCursor;
  const examResultsClosingTypewriter = prepareChapterTextTypewriter(examResultsClosing, 'new-memory-glyph');
  const examResultsReadingEvents = typewriterReadingEvents(
    examResultsIntro, examResultsIntroTypewriter, AFTER_BREAKUP_TEXT_START_MS
  ).concat(examResultsSchedule.map(item => textRevealEvent(
    AFTER_BREAKUP_TEXT_START_MS + examResultsIntroTypewriter.typingDuration + EXAM_RESULTS_GRID_PAUSE_MS + item.at,
    item.element.textContent
  ))).concat(typewriterReadingEvents(
    examResultsClosing, examResultsClosingTypewriter, examResultsClosingStartMs
  ));
  const examResultsDuration = sceneDurationWithReading(
    47,
    typewriterPresentationEnd(examResultsClosingTypewriter, examResultsClosingStartMs),
    examResultsReadingEvents
  );
  function keepLatestExamResultVisible(element) {
    if (performance.now() < restorationScrollGuardUntil) return;
    const scrollArea = examResultsScroll;
    if (!element || !scrollArea || scrollArea.scrollHeight <= scrollArea.clientHeight + 2) return;

    // The title is deliberately outside this scroll area. Only the narration,
    // result cards and closing paragraph move, so no paragraph can pass
    // underneath or become obscured by the fixed scene heading.
    const scrollRect = scrollArea.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const lowerEdge = scrollRect.bottom - 8;
    const overflow = itemRect.bottom - lowerEdge;
    if (overflow > 1) {
      const maximumScroll = Math.max(0, scrollArea.scrollHeight - scrollArea.clientHeight);
      const nextScrollTop = Math.min(maximumScroll, scrollArea.scrollTop + overflow + 10);
      if (nextScrollTop > scrollArea.scrollTop + 1) {
        scrollArea.scrollTo({
          top: nextScrollTop,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    }
  }

  let breakupVideoUserPaused = false;
  let breakupVideoPlayAttempted = false;
  let breakupVideoStoryPauseRequested = false;
  let breakupVideoResumeAfterStoryPause = false;
  breakupVideo.muted = true;
  breakupVideo.addEventListener('play', () => {
    if (!breakupVideoStoryPauseRequested) breakupVideoUserPaused = false;
  });
  breakupVideo.addEventListener('pause', () => {
    if (breakupVideoStoryPauseRequested) { breakupVideoStoryPauseRequested = false; return; }
    if (!breakupVideo.ended) breakupVideoUserPaused = true;
  });
  function attemptBreakupVideoPlay() {
    if (paused || ended || breakupVideoUserPaused || breakupVideo.ended || breakupVideoPlayAttempted) return;
    breakupVideoPlayAttempted = true;
    const result = breakupVideo.play();
    if (result && typeof result.catch === 'function') result.catch(error => console.info('Breakup recording autoplay unavailable; use its Play control.', error));
  }
  function pauseBreakupVideoForStory() {
    breakupVideoResumeAfterStoryPause = Boolean(!breakupVideo.paused && !breakupVideo.ended);
    if (breakupVideoResumeAfterStoryPause) { breakupVideoStoryPauseRequested = true; breakupVideo.pause(); }
  }
  function resumeBreakupVideoForStory() {
    const shouldResume = breakupVideoResumeAfterStoryPause;
    breakupVideoResumeAfterStoryPause = false;
    if (shouldResume && !breakupVideoUserPaused && !breakupVideo.ended && breakupVideo.paused) {
      const result = breakupVideo.play();
      if (result && typeof result.catch === 'function') result.catch(() => {});
    }
  }
  function stopBreakupVideoForNavigation() {
    breakupVideoResumeAfterStoryPause = false;
    if (!breakupVideo.paused) { breakupVideoStoryPauseRequested = true; breakupVideo.pause(); }
    try { breakupVideo.currentTime = 0; } catch (_) { /* metadata may not be ready */ }
    breakupVideoUserPaused = false;
    breakupVideoPlayAttempted = false;
  }
  function updateNewMemoryTypewriter(typewriter, localTime, startAt) {
    typewriter.events.forEach(event => {
      event.element.classList.toggle('is-visible', localTime >= startAt + event.at);
    });
  }
  function updateBreakupScene(localTime) {
    const videoVisible = localTime >= BREAKUP_VIDEO_AT_MS;
    breakupVideoShell.classList.toggle('is-visible', videoVisible);
    updateNewMemoryTypewriter(breakupTypewriter, localTime, BREAKUP_NARRATION_START_MS);
    if (videoVisible && activeScene === 42) attemptBreakupVideoPlay();
  }

  // Final-chapters scene (data-scene 48): a single centred reflection with four photographs and one
  // quiet link to the separate poem collection. All text uses the existing
  // 70ms chapter typewriter; images reveal one at a time in the same horizontal
  // row. Each photo uses the shared fullscreen pop-up, exact 2-second hold,
  // and settle sequence before the next photo begins.
  const scene51Stage = document.getElementById('scene51Stage');
  const scene51IntroParagraph = scene51Stage.querySelector('.scene51-opening p');
  const scene51MiddleParagraphs = [...scene51Stage.querySelectorAll('.scene51-middle p')];
  const scene51FinalParagraphs = [...scene51Stage.querySelectorAll('.scene51-final-copy p')];
  const scene51Photos = [...scene51Stage.querySelectorAll('.scene51-photo')];
  scene51Photos.forEach(photo => {
    const image = photo.querySelector('img');
    // The shared popup controller owns these frames' transforms and opacity.
    photo.style.transition = 'none';
    if (image) image.addEventListener('error', () => { image.hidden = true; });
  });
  const scene51PoemsLink = document.getElementById('scene51PoemsLink');
  const SCENE51_INTRO_START_MS = 900;
  const SCENE51_PHOTO_POP_MS = 480;
  const SCENE51_PHOTO_HOLD_MS = 2000;
  const SCENE51_PHOTO_SETTLE_MS = 1050;
  const SCENE51_PHOTO_CYCLE_MS = SCENE51_PHOTO_POP_MS + SCENE51_PHOTO_HOLD_MS + SCENE51_PHOTO_SETTLE_MS;
  // Preserve the existing two-second pause after the final photo has settled
  // before the next narration block begins.
  const SCENE51_POST_PHOTO_GAP_MS = 2000;
  const SCENE51_LINK_HOLD_MS = 550;
  const scene51IntroTypewriter = prepareChapterTextTypewriter([scene51IntroParagraph], 'new-memory-glyph');
  const scene51PhotosStartMs = SCENE51_INTRO_START_MS + scene51IntroTypewriter.typingDuration + 450;
  const scene51PhotoStartsMs = scene51Photos.map((_, i) => scene51PhotosStartMs + i * SCENE51_PHOTO_CYCLE_MS);
  const scene51LastPhotoSettledAtMs = scene51PhotoStartsMs.length
    ? scene51PhotoStartsMs[scene51PhotoStartsMs.length - 1] + SCENE51_PHOTO_CYCLE_MS
    : scene51PhotosStartMs;
  const scene51MiddleStartMs = scene51LastPhotoSettledAtMs + SCENE51_POST_PHOTO_GAP_MS;
  const scene51MiddleTypewriter = prepareChapterTextTypewriter(scene51MiddleParagraphs, 'new-memory-glyph');
  const scene51LinkAtMs = scene51MiddleStartMs + scene51MiddleTypewriter.typingDuration;
  const scene51FinalStartMs = scene51LinkAtMs + SCENE51_LINK_HOLD_MS;
  const scene51FinalTypewriter = prepareChapterTextTypewriter(scene51FinalParagraphs, 'new-memory-glyph');
  const scene51ReadingEvents = typewriterReadingEvents(
    [scene51IntroParagraph], scene51IntroTypewriter, SCENE51_INTRO_START_MS
  ).concat(typewriterReadingEvents(
    scene51MiddleParagraphs, scene51MiddleTypewriter, scene51MiddleStartMs
  )).concat([
    textRevealEvent(scene51LinkAtMs, scene51PoemsLink.textContent)
  ]).concat(typewriterReadingEvents(
    scene51FinalParagraphs, scene51FinalTypewriter, scene51FinalStartMs
  ));
  const scene51Duration = sceneDurationWithReading(
    48,
    typewriterPresentationEnd(scene51FinalTypewriter, scene51FinalStartMs),
    scene51ReadingEvents
  );


  // Last Resting Place (data-scene 49). Keep this scene on the shared story
  // timeline so transport controls, pause/resume and scene navigation behave
  // exactly like the preceding chapters.
  const scene52Root = document.getElementById('scene-52');
  const scene52Viewport = scene52Root.querySelector('#scene52-narration-viewport');
  const scene52NarrationParagraphs = [...scene52Root.querySelectorAll('#scene52-narration-text p')];
  const SCENE52_ARTWORK_SETTLE_MS = 2000;
  const scene52NarrationTypewriter = prepareChapterTextTypewriter(
    scene52NarrationParagraphs, 'new-memory-glyph'
  );

  // On mobile, narration begins at full width below the title, then wraps
  // beside the stationary grave from the headstone's top to the ground-safe
  // viewport edge. As the text scrolls, the float's document-space top follows
  // scrollTop so its screen-space position remains aligned with the grave.
  let scene52GraveFlowFrame = null;
  let scene52FlowHasMeasured = false;
  let scene52GraveFlowIsMobile = false;
  let scene52GraveFlowTopOffset = 0;
  let scene52GraveFlowBaseHeight = 0;
  let scene52GraveFlowScrollFrame = null;
  let scene52ScrollTimer = null;
  let scene52ScrollTarget = null;
  function syncScene52GraveFlowHeight() {
    const graveFlow = scene52Root.querySelector('.scene52__grave-flow-shape');
    const narrationText = scene52Root.querySelector('#scene52-narration-text');
    if (!graveFlow || !narrationText || !scene52Viewport.clientWidth) return;

    const isMobilePortrait = window.matchMedia('(max-width: 600px)').matches;
    const isMobileLandscape = window.matchMedia('(max-width: 760px) and (orientation: landscape) and (max-height: 600px)').matches;
    if (!isMobilePortrait && !isMobileLandscape) {
      ['position', 'top', 'height', 'width', 'margin', 'shape-outside', 'shape-margin']
        .forEach(property => graveFlow.style.removeProperty(property));
      scene52Viewport.style.removeProperty('top');
      scene52GraveFlowIsMobile = false;
      scene52GraveFlowTopOffset = 0;
      scene52GraveFlowBaseHeight = 0;
      scene52FlowHasMeasured = true;
      return;
    }

    const stone = scene52Root.querySelector('.scene52__headstone-mobile-scale');
    const bouquet = scene52Root.querySelector('.scene52__bouquet');
    if (!stone || !bouquet) return;

    // Keep the narration viewport in its designed position directly below
    // the title. The opening lines must use the full width until they reach
    // the headstone; only then should text wrap into the clear column beside
    // the grave. Never move the viewport itself down to the artwork.
    const stoneRect = stone.getBoundingClientRect();
    const bouquetRect = bouquet.getBoundingClientRect();
    const viewportRect = scene52Viewport.getBoundingClientRect();
    const textRect = narrationText.getBoundingClientRect();
    if (textRect.width <= 0) return;
    const graveLeft = Math.min(stoneRect.left, bouquetRect.left);
    const graveRight = Math.max(stoneRect.right, bouquetRect.right);
    const scrollInset = Number.parseFloat(
      getComputedStyle(scene52Viewport).getPropertyValue('--scene52-scroll-inset')
    );
    const lowerEdge = viewportRect.bottom - (Number.isFinite(scrollInset) ? scrollInset : 8);
    // Begin the exclusion exactly where the headstone starts, preserving
    // full-width narration above it. Continue the exclusion to the ground-safe
    // viewport edge (not merely to the bottom of the stone/bouquet): text must
    // stay in the left column and scroll upward instead of flowing underneath
    // the grave or onto the ground.
    const graveTopOffset = Math.max(0, stoneRect.top - viewportRect.top);
    const graveBottomOffset = Math.max(
      graveTopOffset + 1,
      lowerEdge - viewportRect.top
    );
    // Cache the visible grave-to-ground region. During scrolling, move the
    // float's document-space origin by scrollTop while keeping this height
    // fixed. This makes its visible top and bottom track the stationary grave
    // and ground boundary instead of letting later paragraphs flow underneath.
    scene52GraveFlowTopOffset = graveTopOffset;
    scene52GraveFlowBaseHeight = graveBottomOffset - graveTopOffset;
    scene52GraveFlowIsMobile = true;
    const exclusionLeft = Math.max(textRect.left, graveLeft - 6);
    const exclusionRight = Math.min(textRect.right, graveRight + 6);
    const exclusionWidth = Math.max(1, exclusionRight - exclusionLeft);
    // Let the float's box span from the grave to the right edge of the text
    // column, but shape only the actual grave footprint. This lets lines use
    // every clear gap on both sides instead of wasting the space beside it.
    const floatWidth = Math.max(exclusionWidth, textRect.right - exclusionLeft);
    const floatWidthPercent = Math.min(100, (floatWidth / textRect.width) * 100);
    const shapeRightInsetPercent = Math.max(
      0,
      Math.min(100, ((textRect.right - exclusionRight) / floatWidth) * 100)
    );

    // Apply the measured float once. Later scroll frames only update its
    // document-space top margin; no artwork geometry is remeasured.
    // Keep the float in normal flow. Its top margin is advanced by scrollTop
    // so its on-screen position remains aligned with the stationary headstone.
    // Sticky positioning only pins the painted box; it does not move the float
    // exclusion area used for subsequent line layout, which caused text to
    // become full-width beneath the grave after the first viewport was passed.
    graveFlow.style.position = 'static';
    graveFlow.style.removeProperty('top');
    graveFlow.style.width = `${floatWidthPercent}%`;
    graveFlow.style.height = `${Math.max(1, scene52GraveFlowBaseHeight)}px`;
    graveFlow.style.margin = `${scene52GraveFlowTopOffset + scene52Viewport.scrollTop}px 0 0 0`;
    graveFlow.style.shapeMargin = isMobileLandscape ? '6px' : '7px';
    graveFlow.style.shapeOutside = isMobileLandscape
      ? `inset(0px ${shapeRightInsetPercent}% 0px 0px round 22px 22px 0 0)`
      : `inset(0px ${shapeRightInsetPercent}% 0px 0px round 24px 24px 0 0)`;
    scene52FlowHasMeasured = true;
  }

  function requestScene52GraveFlowSync() {
    if (scene52GraveFlowFrame !== null) return;
    scene52GraveFlowFrame = window.requestAnimationFrame(() => {
      scene52GraveFlowFrame = null;
      syncScene52GraveFlowHeight();
    });
  }

  // Scroll-only update: do not remeasure the SVG. Move the float's normal-flow
  // origin down by exactly the scroll distance, keeping its visible top aligned
  // with the stationary headstone. Its height remains the grave-to-ground
  // viewport distance, so text wraps left only beside the grave and never
  // reflows full-width below it as later narration scrolls into view.
  scene52Viewport.addEventListener('scroll', () => {
    if (!scene52GraveFlowIsMobile || !scene52FlowHasMeasured || scene52GraveFlowScrollFrame !== null) return;
    scene52GraveFlowScrollFrame = window.requestAnimationFrame(() => {
      scene52GraveFlowScrollFrame = null;
      const graveFlow = scene52Root.querySelector('.scene52__grave-flow-shape');
      if (!graveFlow || !scene52GraveFlowIsMobile) return;
      graveFlow.style.marginTop = `${scene52GraveFlowTopOffset + scene52Viewport.scrollTop}px`;
    });
  }, { passive: true });

  requestScene52GraveFlowSync();
  window.addEventListener('resize', () => {
    scene52FlowHasMeasured = false;
    requestScene52GraveFlowSync();
  }, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      scene52FlowHasMeasured = false;
      requestScene52GraveFlowSync();
    }, { passive: true });
  }
  const scene52Duration = sceneDurationWithReading(
    49,
    typewriterPresentationEnd(scene52NarrationTypewriter, SCENE52_ARTWORK_SETTLE_MS),
    typewriterReadingEvents(
      scene52NarrationParagraphs, scene52NarrationTypewriter, SCENE52_ARTWORK_SETTLE_MS
    ).concat([textRevealEvent(0, scene52Root.querySelector('svg text')?.textContent || '')])
  );


  // The Final Wish (data-scene 50). The opening date is present from the first
  // frame; the narration begins after a short reading beat. The closing date
  // appears exactly two seconds after the final narration character is typed.
  const scene53Root = document.getElementById('scene-53');
  const scene53Stage = document.getElementById('scene53Stage');
  const scene53NarrationParagraphs = [...scene53Root.querySelectorAll('#scene53Narration p:not(.scene53-birthday)')];
  const scene53PoemLink = document.getElementById('scene53PoemLink');
  const scene53Birthday = scene53Root.querySelector('.scene53-birthday');
  const scene53ClosingDate = document.getElementById('scene53ClosingDate');
  const SCENE53_NARRATION_START_MS = 1100;
  const SCENE53_POEM_LINK_PAUSE_MS = 850;
  const SCENE53_BIRTHDAY_AFTER_LINK_MS = 2100;
  const SCENE53_FINAL_DATE_PAUSE_MS = 2000;
  const SCENE53_FINAL_DATE_FADE_MS = 1200;
  const scene53Typewriter = prepareChapterTextTypewriter(
    scene53NarrationParagraphs, 'scene53-glyph'
  );
  const scene53NarrationLastCharacterAtMs = Math.max(
    0,
    scene53Typewriter.typingDuration - CHAPTER_TEXT_TYPE_INTERVAL_MS
  );
  const scene53PoemLinkAtMs =
    SCENE53_NARRATION_START_MS
      + scene53NarrationLastCharacterAtMs
      + SCENE53_POEM_LINK_PAUSE_MS;
  const scene53BirthdayAtMs = scene53PoemLinkAtMs + SCENE53_BIRTHDAY_AFTER_LINK_MS;
  const scene53BirthdayTypewriter = prepareChapterTextTypewriter(
    [scene53Birthday], 'scene53-glyph'
  );
  const scene53BirthdayLastCharacterAtMs = Math.max(
    0,
    scene53BirthdayTypewriter.typingDuration - CHAPTER_TEXT_TYPE_INTERVAL_MS
  );
  const scene53ClosingDateAtMs =
    scene53BirthdayAtMs
      + scene53BirthdayLastCharacterAtMs
      + SCENE53_FINAL_DATE_PAUSE_MS;
  const scene53DateMain = scene53Root.querySelector('.scene53-date-main');
  const scene53DateSubtitle = scene53Root.querySelector('.scene53-date-subtitle');
  const scene53Duration = sceneDurationWithReading(
    50,
    scene53ClosingDateAtMs + SCENE53_FINAL_DATE_FADE_MS,
    [
      textRevealEvent(0, scene53DateMain ? scene53DateMain.textContent : ''),
      textRevealEvent(0, scene53DateSubtitle ? scene53DateSubtitle.textContent : ''),
      ...typewriterReadingEvents(scene53NarrationParagraphs, scene53Typewriter, SCENE53_NARRATION_START_MS),
      textRevealEvent(scene53PoemLinkAtMs, scene53PoemLink.textContent),
      ...typewriterReadingEvents([scene53Birthday], scene53BirthdayTypewriter, scene53BirthdayAtMs),
      textRevealEvent(scene53ClosingDateAtMs, scene53ClosingDate.textContent)
    ]
  );
  let scene53ScrollTimer = null;
  let scene53ScrollTarget = null;

  function scheduleScene53Scroll(targetElement) {
    if (performance.now() < restorationScrollGuardUntil || !targetElement) return;
    scene53ScrollTarget = targetElement;
    if (scene53ScrollTimer !== null) return;

    scene53ScrollTimer = window.setTimeout(() => {
      const target = scene53ScrollTarget;
      scene53ScrollTarget = null;
      scene53ScrollTimer = null;
      if (!target || !target.isConnected) return;

      const stageRect = scene53Stage.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const lowerEdge = stageRect.bottom - 8;
      const overflow = targetRect.bottom - lowerEdge;
      if (overflow > 0) {
        scene53Stage.scrollTo({
          top: scene53Stage.scrollTop + overflow,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    }, 140);
  }

  function updateScene53(localTime) {
    scene53Typewriter.events.forEach(event => {
      const visible = localTime >= SCENE53_NARRATION_START_MS + event.at;
      const wasVisible = event.element.classList.contains('is-visible');
      event.element.classList.toggle('is-visible', visible);
      if (visible && !wasVisible) scheduleScene53Scroll(event.element);
    });

    const poemLinkVisible = localTime >= scene53PoemLinkAtMs;
    const poemLinkWasVisible = scene53PoemLink.classList.contains('is-visible');
    scene53PoemLink.classList.toggle('is-visible', poemLinkVisible);
    scene53PoemLink.setAttribute('aria-hidden', String(!poemLinkVisible));
    scene53PoemLink.tabIndex = poemLinkVisible ? 0 : -1;
    if (poemLinkVisible && !poemLinkWasVisible) scheduleScene53Scroll(scene53PoemLink);

    scene53BirthdayTypewriter.events.forEach(event => {
      const visible = localTime >= scene53BirthdayAtMs + event.at;
      const wasVisible = event.element.classList.contains('is-visible');
      event.element.classList.toggle('is-visible', visible);
      if (visible && !wasVisible) scheduleScene53Scroll(event.element);
    });

    const closingDateVisible = localTime >= scene53ClosingDateAtMs;
    const closingDateWasVisible = scene53ClosingDate.classList.contains('is-visible');
    scene53ClosingDate.classList.toggle('is-visible', closingDateVisible);
    if (closingDateVisible && !closingDateWasVisible) {
      scheduleScene53Scroll(scene53ClosingDate);
    }
  }

  // Scroll only far enough to keep the newest revealed character in view.
  // The entire narration already exists in the DOM for typewriter scheduling,
  // so scrolling to scrollHeight would jump past paragraphs not yet revealed.
  function scheduleScene52NarrationScroll(targetElement) {
    if (performance.now() < restorationScrollGuardUntil || !targetElement) return;
    scene52ScrollTarget = targetElement;
    if (scene52ScrollTimer !== null) return;

    scene52ScrollTimer = window.setTimeout(() => {
      const target = scene52ScrollTarget;
      scene52ScrollTarget = null;
      scene52ScrollTimer = null;
      if (!target || !target.isConnected) return;

      const viewportRect = scene52Viewport.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const scrollInset = Number.parseFloat(
        getComputedStyle(scene52Viewport).getPropertyValue('--scene52-scroll-inset')
      );
      const lowerEdge = viewportRect.bottom - (Number.isFinite(scrollInset) ? scrollInset : 24);
      const overflow = targetRect.bottom - lowerEdge;

      if (overflow > 0) {
        scene52Viewport.scrollTo({
          top: scene52Viewport.scrollTop + overflow + 1,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    }, 180);
  }

  function updateScene52(localTime) {
    // Re-measure only when the viewport has changed, never during narration
    // scrolling. The sticky exclusion remains aligned with the fixed artwork.
    if (!scene52FlowHasMeasured && scene52Viewport.clientWidth > 0) {
      requestScene52GraveFlowSync();
    }

    scene52NarrationTypewriter.events.forEach(event => {
      const visible = localTime >= SCENE52_ARTWORK_SETTLE_MS + event.at;
      const wasVisible = event.element.classList.contains('is-visible');
      event.element.classList.toggle('is-visible', visible);
      if (visible && !wasVisible) scheduleScene52NarrationScroll(event.element);
    });
  }

  const sceneDefs = [
    { name: 'opening', duration: poemDuration },
    { name: 'date', duration: dateDuration },
    { name: 'chat', duration: CHAT_DURATION },
    { name: 'closing', duration: closingDuration },
    { name: 'days-intro', duration: daysDuration },
    { name: 'phones', duration: phonesDuration },
    { name: 'name', duration: Math.ceil(nameDuration) },
    { name: 'photo', duration: Math.ceil(photoDuration) },
    { name: 'archive', duration: archiveDuration },
    { name: 'nov24', duration: nov24Duration },
    { name: 'cancelled-arrival', duration: cancelledDuration },
    { name: 'sunset-and-message', duration: sunsetDuration },
    { name: 'confession-poem', duration: confessionPoemDuration },
    { name: 'you-needed-time', duration: nightDuration },
    { name: 'yes', duration: yesDuration },
    { name: 'afterglow', duration: afterglowDuration },
    { name: 'first-selfies', duration: firstSelfiesDuration },
    { name: 'profile-memory', duration: profileMemoryDuration },
    { name: 'red-outfit', duration: redOutfitMemory.duration },
    { name: 'picnic', duration: picnicMemory.duration },
    { name: 'little-pictures', duration: littlePicturesMemory.duration },
    { name: 'last-together', duration: lastTogetherMemory.duration },
    { name: 'separation', duration: separationDuration },
    { name: 'hope-intro', duration: hopeIntroDuration },
    { name: 'hope-journey', duration: hopeJourneyDuration },
    { name: 'early-tuition', duration: earlyTuitionMemory.duration },
    { name: 'little-moments', duration: littleMomentsMemory.duration },
    { name: 'durga-puja', duration: durgaPujaMemory.duration },
    { name: 'saraswati-puja', duration: saraswatiPujaMemory.duration },
    { name: 'tuition-ending', duration: tuitionEndingMemory.duration },
    { name: 'new-beginnings', duration: newBeginningsDuration },
    { name: 'whatsapp-memory', duration: whatsappMemoryDuration },
    { name: 'whatsapp-calls', duration: whatsappCallsDuration },
    { name: 'picture-keepsakes', duration: pictureKeepsakesMemory.duration },
    { name: 'just-a-glimpse', duration: justAGlimpseDuration },
    { name: 'returning-home', duration: returningHomeDuration },
    { name: 'closer-apart', duration: closerApartDuration },
    { name: 'second-drop-connection', duration: secondDropConnectionDuration },
    { name: 'jan23-date', duration: jan23DateDuration },
    { name: 'last-glimpses', duration: lastGlimpsesDuration },
    { name: 'holi-reflection', duration: holiReflectionDuration },
    { name: 'waiting-days', duration: waitingDaysDuration },
    { name: 'breakup-day', duration: breakupDuration },
    { name: 'after-breakup-hope', duration: afterBreakupHopeDuration },
    { name: 'another-chance', duration: anotherChanceDuration },
    { name: 'what-i-came-to-know', duration: whatICameToKnowDuration },
    { name: 'things-i-didnt-know', duration: thingsDuration },
    { name: 'exam-results', duration: examResultsDuration },
    { name: 'final-chapters', duration: scene51Duration },
    { name: 'last-resting-place', duration: scene52Duration },
    { name: 'final-wish', duration: scene53Duration }
  ];
  // Retain the existing 30% pacing extension where it fits, but bound the
  // final wait from the last authored reveal/entrance to the next scene at 10s.
  // Scene element reveal offsets themselves are never changed by this cap.
  sceneDefs.forEach((scene, index) => {
    const finalPresentationEndAt = sceneFinalPresentationEnds[index];
    if (!Number.isFinite(finalPresentationEndAt)) {
      throw new Error(`Missing final presentation timing for scene ${index}.`);
    }
    const extendedDuration = Math.round(scene.duration * 1.3);
    const latestAllowedEnd = Math.ceil(finalPresentationEndAt + MAX_POST_PRESENTATION_HOLD_MS);
    scene.duration = Math.min(extendedDuration, latestAllowedEnd);
  });

  if (scenes.length !== 51 || sceneDefs.length !== 51) {
    throw new Error(`Expected 51 scenes and 51 timing entries; found ${scenes.length} scenes and ${sceneDefs.length} timing entries.`);
  }
  if (sceneDefs.some((scene, index) => !Number.isFinite(scene.duration)
    || scene.duration < MIN_FINAL_HOLD_MS
    || scene.duration < sceneFinalPresentationEnds[index]
    || scene.duration - sceneFinalPresentationEnds[index] > MAX_POST_PRESENTATION_HOLD_MS + 1)) {
    throw new Error('Every scene must finish its reveals before transition and hold for no more than 10 seconds afterwards.');
  }
  const offsets = sceneDefs.map((_, index) =>
    sceneDefs.slice(0, index).reduce((sum, scene) => sum + scene.duration, 0)
  );
  const totalDuration = sceneDefs.reduce((sum, scene) => sum + scene.duration, 0);
  const atmosphere = document.querySelector('.atmosphere');

  // Emotional colour journey: the shared atmosphere changes with the story,
  // while each scene's photographs, videos and authored artwork remain untouched.
  // Values are ordered by the existing 51-scene playback timeline.
  function parseAtmosphereHex(hex) {
    const value = hex.replace('#', '');
    return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16));
  }
  function blendAtmosphereColor(from, to, amount) {
    return from.map((value, index) => Math.round(value + (to[index] - value) * amount));
  }
  function makeAtmospherePalette(baseHex, glowHex, glowAlpha = .12) {
    const base = parseAtmosphereHex(baseHex);
    const glow = parseAtmosphereHex(glowHex);
    return {
      a: base,
      b: blendAtmosphereColor(base, [16, 11, 21], .46),
      c: [8, 6, 12],
      glow,
      alpha: glowAlpha,
      x: 50,
      y: 45,
      size: 48,
      wash: blendAtmosphereColor(glow, base, .34),
      washAlpha: glowAlpha * .42,
      washX: 82,
      washY: 77
    };
  }

  const atmospherePalettes = [
    makeAtmospherePalette('#211523', '#A16F90', .11), // 0 Opening
    makeAtmospherePalette('#211523', '#A16F90', .11), // 1 First message
    makeAtmospherePalette('#281923', '#A9778C', .12), // 2 Birthday wish
    makeAtmospherePalette('#241724', '#9B718F', .11), // 3 Beginning
    makeAtmospherePalette('#241824', '#A17691', .11), // 4 Days without a label
    makeAtmospherePalette('#281A2C', '#A77DAF', .13), // 5 Phones and conversations
    makeAtmospherePalette('#30203B', '#B18BC1', .15), // 6 Name and growing affection
    makeAtmospherePalette('#2A1D31', '#A982B5', .13), // 7 First photograph
    makeAtmospherePalette('#261B2D', '#9D789F', .12), // 8 Looking back
    makeAtmospherePalette('#241B2B', '#9D789F', .12), // 9 November 24
    makeAtmospherePalette('#241B2B', '#9D789F', .12), // 10 Plans interrupted
    makeAtmospherePalette('#30213A', '#B78CB7', .15), // 11 Sunset and another way
    makeAtmospherePalette('#2D1E38', '#B18ABD', .15), // 12 Confession poem
    makeAtmospherePalette('#111522', '#7882A8', .085), // 13 You needed time
    makeAtmospherePalette('#49305A', '#C49BD8', .22), // 14 Yes (applied at the word reveal)
    makeAtmospherePalette('#38242E', '#B8849A', .15), // 15 Life after yes
    makeAtmospherePalette('#38242E', '#B8849A', .15), // 16 First selfies
    makeAtmospherePalette('#30202D', '#A77B91', .13), // 17 Profile memory
    makeAtmospherePalette('#321F2B', '#B17C91', .14), // 18 Red outfit
    makeAtmospherePalette('#2E202C', '#A77D96', .13), // 19 Picnic
    makeAtmospherePalette('#2B1F2B', '#9E788F', .12), // 20 Little pictures
    makeAtmospherePalette('#261D2B', '#92768F', .11), // 21 Before distance
    makeAtmospherePalette('#1D1A2A', '#82799F', .10), // 22 Paths diverge
    makeAtmospherePalette('#1A1828', '#8880AA', .10), // 23 A little hope
    makeAtmospherePalette('#181626', '#8880AA', .10), // 24 Journey
    makeAtmospherePalette('#231B2C', '#9C789D', .12), // 25 Early tuition
    makeAtmospherePalette('#28202E', '#A27C9C', .12), // 26 Little moments
    makeAtmospherePalette('#302331', '#B1859E', .14), // 27 Durga Puja
    makeAtmospherePalette('#2B202F', '#A681A0', .13), // 28 Saraswati Puja
    makeAtmospherePalette('#251C2A', '#95768E', .11), // 29 Tuition ending
    makeAtmospherePalette('#1E1928', '#85799F', .10), // 30 New beginnings
    makeAtmospherePalette('#211A29', '#92799F', .11), // 31 WhatsApp memories
    makeAtmospherePalette('#1D1826', '#89759A', .10), // 32 Calls
    makeAtmospherePalette('#241B2C', '#9D7FA5', .12), // 33 Picture keepsakes
    makeAtmospherePalette('#211A2A', '#947A9D', .11), // 34 Glimpses
    makeAtmospherePalette('#1C1929', '#83799D', .10), // 35 Returning home
    makeAtmospherePalette('#141827', '#7584A7', .09), // 36 Closer yet apart
    makeAtmospherePalette('#191827', '#817FA7', .10), // 37 Still connected
    makeAtmospherePalette('#34232F', '#B4879C', .15), // 38 Day together
    makeAtmospherePalette('#211A2A', '#927A9B', .11), // 39 Last glimpses
    makeAtmospherePalette('#211923', '#967384', .10), // 40 Holi reflection
    makeAtmospherePalette('#10111B', '#777D9B', .085), // 41 Waiting days
    makeAtmospherePalette('#0D0D16', '#6D718F', .075), // 42 Goodbye
    makeAtmospherePalette('#171321', '#8B79A8', .10), // 43 Hope after breakup
    makeAtmospherePalette('#191727', '#9285AF', .11), // 44 Disappointment and hope
    makeAtmospherePalette('#10111A', '#767C9B', .085), // 45 What I came to know
    makeAtmospherePalette('#0D1019', '#707B95', .075), // 46 Things I didn't know
    makeAtmospherePalette('#171321', '#8E7BAA', .10), // 47 Exam results
    makeAtmospherePalette('#17101F', '#8E719F', .095), // 48 Final chapters / poems
    makeAtmospherePalette('#17101F', '#8E719F', .095), // 49 Grave scene: shared atmosphere held; scene background is locked
    makeAtmospherePalette('#352044', '#A782BC', .15)  // 50 Final birthday
  ];

  // The atmosphere follows the emotional palette of each scene over the full
  // duration of that scene, rather than completing its change just after entry.
  // The resulting colour curve is continuous across scene boundaries and is
  // evaluated from the story clock, so pause/seek/replay remain deterministic.
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function blendAtmospherePalette(from, to, amount) {
    const blended = {};
    ['a', 'b', 'c', 'glow', 'wash'].forEach(key => {
      blended[key] = from[key].map((value, index) => lerp(value, to[key][index], amount));
    });
    ['alpha', 'x', 'y', 'size', 'washAlpha', 'washX', 'washY'].forEach(key => {
      blended[key] = lerp(from[key], to[key], amount);
    });
    return blended;
  }

  function sampleAtmosphereCurve(curve, time) {
    const span = Math.max(1, curve.endAt - curve.startAt);
    const progress = smoothstep(Math.max(0, Math.min(1, (time - curve.startAt) / span)));
    return blendAtmospherePalette(curve.from, curve.to, progress);
  }

  // Tiny, authored temperature cues let even palette-matched scenes keep
  // breathing internally. Positive values lean a fraction warmer; negative
  // values lean cooler. The values follow the narration's emotional direction
  // and are intentionally too small to read as separate colour effects.
  const sceneMicroTemperatures = [
    .14, .16, .22, .12, .06, .10, .22, .16, .08, .06,
    .04, .18, .10, -.32, 0, .28, .26, .20, .24, .20,
    .10, -.04, -.20, -.08, -.16, .02, .12, .20, .14, -.02,
    -.15, -.10, -.16, .04, -.04, -.18, -.28, -.20, .20, -.04,
    -.10, -.30, -.38, .05, .05, -.30, -.32, -.08, -.02, 0, .22
  ];

  function applyAtmosphereTemperature(palette, temperature) {
    const shifted = { ...palette };
    const shift = temperature * 4.5;
    ['a', 'b', 'glow', 'wash'].forEach(key => {
      shifted[key] = palette[key].map((value, index) => {
        const channelShift = index === 0 ? shift : index === 1 ? shift * .14 : -shift * .72;
        return Math.max(0, Math.min(255, value + channelShift));
      });
    });
    shifted.alpha = Math.max(.04, Math.min(.24, palette.alpha * (1 + temperature * .045)));
    shifted.washAlpha = palette.washAlpha * (1 + temperature * .045);
    return shifted;
  }

  // Begin very close to the site's original plum-black foundation, then let
  // the opening poem gently arrive at its first authored emotional palette.
  const openingStartPalette = makeAtmospherePalette('#1D1420', '#946A84', .105);
  const atmosphereStops = [{ at: 0, ...openingStartPalette }];
  const atmosphereSceneCurves = new Array(sceneDefs.length);

  function addAtmosphereStop(at, palette) {
    atmosphereStops.push({ at, ...palette });
  }

  const openingCurve = {
    startAt: offsets[0],
    endAt: offsets[0] + sceneDefs[0].duration,
    from: openingStartPalette,
    to: applyAtmosphereTemperature(atmospherePalettes[0], sceneMicroTemperatures[0])
  };
  atmosphereSceneCurves[0] = openingCurve;
  addAtmosphereStop(openingCurve.endAt, openingCurve.to);

  // The running palette is the exact ending colour of the previous chapter.
  // Each new emotional destination is approached throughout the current scene.
  let runningPalette = openingCurve.to;
  for (let sceneIndex = 1; sceneIndex < sceneDefs.length; sceneIndex++) {
    const sceneStart = offsets[sceneIndex];
    const sceneEnd = sceneStart + sceneDefs[sceneIndex].duration;

    if (sceneIndex === 14) {
      // November 25 is the single expressive exception. Hold the preceding
      // midnight tone until the word itself appears, then make one clear lift.
      addAtmosphereStop(sceneStart, runningPalette);
      addAtmosphereStop(sceneStart + YES_REVEAL_AT, runningPalette);
      addAtmosphereStop(sceneStart + YES_REVEAL_AT + 760, atmospherePalettes[14]);
      atmosphereSceneCurves[sceneIndex] = {
        startAt: sceneStart,
        endAt: sceneEnd,
        from: runningPalette,
        to: atmospherePalettes[14]
      };
      runningPalette = atmospherePalettes[14];
      continue;
    }

    if (sceneIndex === 49) {
      // The Last Resting Place owns an opaque, authored background in its own
      // scene CSS. Keep the shared atmosphere fixed beneath it and do not
      // animate, grade, or alter the graveyard scene's existing background.
      addAtmosphereStop(sceneStart, runningPalette);
      addAtmosphereStop(sceneEnd, runningPalette);
      atmosphereSceneCurves[sceneIndex] = {
        startAt: sceneStart,
        endAt: sceneEnd,
        from: runningPalette,
        to: runningPalette
      };
      continue;
    }

    const targetPalette = applyAtmosphereTemperature(
      atmospherePalettes[sceneIndex], sceneMicroTemperatures[sceneIndex]
    );
    const curve = {
      startAt: sceneStart,
      endAt: sceneEnd,
      from: runningPalette,
      to: targetPalette
    };
    atmosphereSceneCurves[sceneIndex] = curve;
    addAtmosphereStop(sceneStart, curve.from);
    addAtmosphereStop(sceneEnd, curve.to);
    runningPalette = targetPalette;
  }

  // A few meaningful narration beats receive only a tiny tonal response. They
  // are blended into the scene's ongoing curve so no ordinary line creates a
  // visible colour cue or competes with the November 25 transformation.
  function addAtmosphereNarrativeNudge(time, sceneIndex, targetPalette, strength, duration) {
    const curve = atmosphereSceneCurves[sceneIndex];
    if (!curve || time <= curve.startAt || time + duration * 2 >= curve.endAt) return;

    const baselineAtStart = sampleAtmosphereCurve(curve, time);
    const nudgePalette = blendAtmospherePalette(baselineAtStart, targetPalette, strength);
    const returnAt = time + duration * 2;
    const baselineAtReturn = sampleAtmosphereCurve(curve, returnAt);

    addAtmosphereStop(time, baselineAtStart);
    addAtmosphereStop(time + duration, nudgePalette);
    addAtmosphereStop(returnAt, baselineAtReturn);
  }

  // The classroom arrival warms the atmosphere by only a trace; the difficult
  // family news cools it gently; the NEET cancellation briefly allows a little
  // violet hope before the following revelation changes the emotional tone.
  const arrivalMomentAt = offsets[10] + cancelledTrack.entries[1].at;
  const arrivalPalette = makeAtmospherePalette('#30213A', '#B78CB7', .15);
  addAtmosphereNarrativeNudge(arrivalMomentAt, 10, arrivalPalette, .12, 4200);

  const grandfatherMomentAt = offsets[41] + waitingDaysGrandfatherMomentAt;
  addAtmosphereNarrativeNudge(grandfatherMomentAt, 41, atmospherePalettes[42], .18, 4600);

  const reNEETMomentAtGlobal = offsets[44] + reNEETMomentAt;
  const reNEETPalette = makeAtmospherePalette('#211A2E', '#A18BB9', .12);
  addAtmosphereNarrativeNudge(reNEETMomentAtGlobal, 44, reNEETPalette, .16, 4400);

  atmosphereStops.sort((left, right) => left.at - right.at);
  // If an authored emotional beat shares a timestamp with a chapter anchor,
  // the later entry is authoritative; remove duplicates to prevent a jump.
  const uniqueAtmosphereStops = atmosphereStops.reduce((result, stop) => {
    if (result.length && result[result.length - 1].at === stop.at) result[result.length - 1] = stop;
    else result.push(stop);
    return result;
  }, []);
  atmosphereStops.splice(0, atmosphereStops.length, ...uniqueAtmosphereStops);

  function updateAtmosphere(time) {
    let left = atmosphereStops[0];
    let right = atmosphereStops[atmosphereStops.length - 1];
    for (let i = 0; i < atmosphereStops.length - 1; i++) {
      if (time <= atmosphereStops[i + 1].at) { left = atmosphereStops[i]; right = atmosphereStops[i + 1]; break; }
    }
    const span = Math.max(1, right.at - left.at);
    const t = smoothstep(Math.max(0, Math.min(1, (time - left.at) / span)));
    const mixArray = (key) => left[key].map((value, i) => lerp(value, right[key][i], t));
    const mixNumber = (key) => lerp(left[key], right[key], t);
    const rgb = (values) => values.map(value => Math.round(value)).join(', ');
    const hex = (values) => '#' + values.map(value => Math.round(value).toString(16).padStart(2, '0')).join('');
    atmosphere.style.setProperty('--bg-a', hex(mixArray('a')));
    atmosphere.style.setProperty('--bg-b', hex(mixArray('b')));
    atmosphere.style.setProperty('--bg-c', hex(mixArray('c')));
    atmosphere.style.setProperty('--glow-rgb', rgb(mixArray('glow')));
    atmosphere.style.setProperty('--glow-alpha', mixNumber('alpha').toFixed(3));
    atmosphere.style.setProperty('--glow-x', `${mixNumber('x').toFixed(2)}%`);
    atmosphere.style.setProperty('--glow-y', `${mixNumber('y').toFixed(2)}%`);
    atmosphere.style.setProperty('--glow-size', `${mixNumber('size').toFixed(2)}%`);
    atmosphere.style.setProperty('--wash-rgb', rgb(mixArray('wash')));
    atmosphere.style.setProperty('--wash-alpha', mixNumber('washAlpha').toFixed(3));
    atmosphere.style.setProperty('--wash-x', `${mixNumber('washX').toFixed(2)}%`);
    atmosphere.style.setProperty('--wash-y', `${mixNumber('washY').toFixed(2)}%`);
  }

  const STORY_RETURN_STATE_KEY = 'birthday-story-return-state-v2';
  const LEGACY_STORY_RETURN_STATE_KEY = 'birthday-story-return-state-v1';
  let lastNavigationReturnState = null;
  let storyRestoreGeneration = 0;
  let restorationScrollGuardUntil = 0;
  let elapsed = 0;
  let lastFrameTime = 0;
  let activeScene = -1;
  // Track the last genuinely displayed scene separately from activeScene:
  // same-scene restarts temporarily clear activeScene to replay all reveals.
  let lastDisplayedSceneIndex = -1;
  let previousNavigationClickArmed = false;
  let nextNavigationClickArmed = false;
  function clearConsecutiveNavigationClicks() {
    previousNavigationClickArmed = false;
    nextNavigationClickArmed = false;
  }
  let paused = true;
  let ended = false;
  let rafId = 0;
  let animationLoopRunning = false;
  let previousGifFrame = -1;
  let controlsVisible = false;

  // Keep mobile screens awake while this experience is active. The browser
  // releases its screen wake lock when the page becomes hidden, so we retain
  // the intent and request a fresh lock when the visitor returns. This does
  // not resume playback: the existing visibility handler still pauses it.
  let screenWakeLock = null;
  let screenWakeLockWanted = true;
  let screenWakeLockRequestPending = false;

  async function acquireScreenWakeLock() {
    if (!screenWakeLockWanted || ended || document.visibilityState !== 'visible') return;
    if (!('wakeLock' in navigator) || !navigator.wakeLock || screenWakeLock || screenWakeLockRequestPending) return;

    screenWakeLockRequestPending = true;
    try {
      const lock = await navigator.wakeLock.request('screen');
      // The request can resolve after navigation or story completion. Do not
      // keep a lock in that case.
      if (!screenWakeLockWanted || ended || document.visibilityState !== 'visible') {
        await lock.release();
        return;
      }
      screenWakeLock = lock;
      lock.addEventListener('release', () => {
        if (screenWakeLock === lock) screenWakeLock = null;
      }, { once: true });
    } catch (error) {
      // Unsupported browsers, insecure contexts, low-power mode, or system
      // policy can deny the request. Playback remains usable without a lock.
      console.warn('Screen Wake Lock could not be acquired:', error);
    } finally {
      screenWakeLockRequestPending = false;
    }
  }

  function releaseScreenWakeLock(disable = false) {
    if (disable) screenWakeLockWanted = false;
    const lock = screenWakeLock;
    screenWakeLock = null;
    if (lock && !lock.released) {
      lock.release().catch(error => {
        console.warn('Screen Wake Lock could not be released cleanly:', error);
      });
    }
  }

  // Preload the small set of GIF frames so the birthday animation freezes
  // exactly when the story is paused.
  const frameImages = framePaths.map(path => {
    const image = new Image();
    image.src = path;
    return image;
  });

  function sceneAt(time) {
    for (let i = 0; i < sceneDefs.length; i++) {
      if (time < offsets[i] + sceneDefs[i].duration || i === sceneDefs.length - 1) return i;
    }
    return sceneDefs.length - 1;
  }

  // Every scene with progressive narration gets the same overflow-aware host:
  // short compositions remain centred, while tall compositions start at the
  // top and follow newly revealed text. Scenes 46, 47, 49 and 50 retain their
  // dedicated controllers because they coordinate additional timeline/media.
  const narrationAutoScrollHostSelectors = {
    0: '.poem-stage',
    1: '.date-stage',
    2: '.chat-flow',
    3: '.closing-stage',
    4: '.days-intro-stage',
    5: '.phones-stage',
    6: '.name-stage',
    7: '.photo-memory-stage',
    8: '.archive-stage',
    9: '.nov24-card',
    10: '.chapter-story-stage',
    11: '.sunset-stage',
    12: '.confession-poem-stage',
    13: '.night-stage',
    14: '.yes-stage',
    15: '.afterglow-stage',
    16: '.first-selfies-stage',
    17: '.profile-memory-stage',
    18: '.story-memory-stage',
    19: '.story-memory-stage',
    20: '.story-memory-stage',
    21: '.story-memory-stage',
    22: '.separation-stage',
    23: '.hope-intro-stage',
    24: '.hope-journey-block',
    25: '.story-memory-stage',
    26: '.story-memory-stage',
    27: '.story-memory-stage',
    28: '.story-memory-stage',
    29: '.story-memory-stage',
    30: '.new-beginnings-stage',
    31: '.whatsapp-memory-stage',
    32: '.whatsapp-calls-stage',
    33: '.picture-keepsakes-stage',
    34: '.just-a-glimpse-stage',
    35: '.chapter-text-stage',
    36: '.chapter-text-stage',
    37: '.second-drop-connection-stage',
    38: '.jan23-date-stage',
    39: '.last-glimpses-stage',
    40: '.new-memory-stage',
    41: '.new-memory-stage',
    42: '.new-memory-stage',
    43: '.new-memory-stage',
    44: '.new-memory-stage',
    45: '.new-memory-stage',
    48: '.scene51-stage'
  };
  const narrationAutoScrollTargetSelector = 'p, h1, h2, figure, a, .message-row, .date-main, .date-year, .new-beginnings-details, .whatsapp-video-shell, .whatsapp-calls-video-shell, .second-drop-connection-video-shell, .last-glimpses-video-shell, .breakup-video-shell';
  const narrationAutoScrollRevealClasses = ['revealed', 'is-visible', 'is-revealed', 'visible'];
  let narrationAutoScrollObserver = null;
  let narrationAutoScrollHost = null;
  let narrationAutoScrollTimer = null;
  let narrationAutoScrollPendingTarget = null;
  let narrationAutoScrollLastTarget = null;

  function refreshNarrationAutoScrollOverflow(host = narrationAutoScrollHost) {
    if (!host) return false;
    const hasOverflow = host.scrollHeight > host.clientHeight + 2;
    host.classList.toggle('has-narration-overflow', hasOverflow);
    return hasOverflow;
  }

  function scheduleNarrationAutoScroll(target) {
    if (performance.now() < restorationScrollGuardUntil) return;
    if (!target || !narrationAutoScrollHost || !target.isConnected) return;
    narrationAutoScrollPendingTarget = target;
    narrationAutoScrollLastTarget = target;
    if (narrationAutoScrollTimer !== null) return;

    narrationAutoScrollTimer = window.setTimeout(() => {
      narrationAutoScrollTimer = null;
      const host = narrationAutoScrollHost;
      const pendingTarget = narrationAutoScrollPendingTarget;
      narrationAutoScrollPendingTarget = null;
      if (!host || !pendingTarget || !pendingTarget.isConnected) return;
      if (!refreshNarrationAutoScrollOverflow(host)) return;

      window.requestAnimationFrame(() => {
        if (host !== narrationAutoScrollHost || !pendingTarget.isConnected) return;
        const hostRect = host.getBoundingClientRect();
        const targetRect = pendingTarget.getBoundingClientRect();
        // Keep a small reading gutter, but do not start following a line
        // while meaningful unused viewport space remains.
        const lowerEdge = hostRect.bottom - 8;
        const overflow = targetRect.bottom - lowerEdge;
        if (overflow <= 1) return;

        const maximumScroll = Math.max(0, host.scrollHeight - host.clientHeight);
        const nextScrollTop = Math.min(maximumScroll, host.scrollTop + overflow + 10);
        if (nextScrollTop > host.scrollTop + 1) {
          host.scrollTo({
            top: nextScrollTop,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    }, 105);
  }

  function handleNarrationAutoScrollMotion(event) {
    const changedElement = event.target;
    if (!(changedElement instanceof Element)) return;
    const textContainer = changedElement.matches(narrationAutoScrollTargetSelector)
      ? changedElement
      : changedElement.closest(narrationAutoScrollTargetSelector);
    if (textContainer && narrationAutoScrollHost && narrationAutoScrollHost.contains(textContainer)) {
      // Keep the actual animated glyph as the scroll target. Using its entire
      // paragraph here would make long typewritten passages jump prematurely.
      scheduleNarrationAutoScroll(changedElement);
    }
  }

  function activateNarrationAutoScroll(index) {
    if (narrationAutoScrollObserver) {
      narrationAutoScrollObserver.disconnect();
      narrationAutoScrollObserver = null;
    }
    if (narrationAutoScrollHost) {
      narrationAutoScrollHost.removeEventListener('animationend', handleNarrationAutoScrollMotion);
      narrationAutoScrollHost.removeEventListener('transitionend', handleNarrationAutoScrollMotion);
    }
    if (narrationAutoScrollTimer !== null) window.clearTimeout(narrationAutoScrollTimer);
    narrationAutoScrollTimer = null;
    narrationAutoScrollPendingTarget = null;
    narrationAutoScrollLastTarget = null;
    narrationAutoScrollHost = null;

    const selector = narrationAutoScrollHostSelectors[index];
    const scene = scenes[index];
    const host = selector && scene ? scene.querySelector(selector) : null;
    if (!host) return;

    narrationAutoScrollHost = host;
    host.classList.add('narration-auto-scroll-host');
    host.scrollTop = 0;
    refreshNarrationAutoScrollOverflow(host);

    narrationAutoScrollObserver = new MutationObserver(records => {
      records.forEach(record => {
        const target = record.target;
        if (!(target instanceof Element)) return;
        if (!narrationAutoScrollRevealClasses.some(className => target.classList.contains(className))) return;
        const textTarget = target.matches(narrationAutoScrollTargetSelector)
          ? target
          : target.closest(narrationAutoScrollTargetSelector);
        if (textTarget && host.contains(textTarget)) scheduleNarrationAutoScroll(target);
      });
    });
    narrationAutoScrollObserver.observe(host, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    host.addEventListener('animationend', handleNarrationAutoScrollMotion);
    host.addEventListener('transitionend', handleNarrationAutoScrollMotion);
  }

  window.addEventListener('resize', () => {
    if (!narrationAutoScrollHost) return;
    refreshNarrationAutoScrollOverflow();
    if (narrationAutoScrollLastTarget && narrationAutoScrollLastTarget.isConnected) {
      scheduleNarrationAutoScroll(narrationAutoScrollLastTarget);
    }
  }, { passive: true });

  function setScene(index) {
    if (index === activeScene) return;
    if (activeScene >= 0 && scenes[activeScene]) {
      scenes[activeScene].classList.remove('restore-settled');
      scenes[activeScene].querySelectorAll('.restore-settled').forEach(element => element.classList.remove('restore-settled'));
    }
    if (sceneTitle) sceneTitle.classList.remove('restore-settled');
    if (lastDisplayedSceneIndex !== index) clearConsecutiveNavigationClicks();
    experience.classList.remove('is-instant-state');
    if (activeScene === 31 && index !== 31) stopWhatsAppVideoForNavigation();
    if (activeScene === 32 && index !== 32) stopCallsVideoForNavigation();
    if (activeScene === 37 && index !== 37) stopSecondDropVideoForNavigation();
    if (activeScene === 39 && index !== 39) stopLastGlimpsesVideoForNavigation();
    if (activeScene === 42 && index !== 42) stopBreakupVideoForNavigation();
    if (index !== 49) {
      if (scene52ScrollTimer !== null) window.clearTimeout(scene52ScrollTimer);
      scene52ScrollTimer = null;
      scene52ScrollTarget = null;
    }
    if (index !== 50) {
      if (scene53ScrollTimer !== null) window.clearTimeout(scene53ScrollTimer);
      scene53ScrollTimer = null;
      scene53ScrollTarget = null;
    }
    activeScene = index;
    lastDisplayedSceneIndex = index;
    const title = sceneTitles[index] || '';
    if (sceneTitle) {
      if (title) {
        const activeSceneElement = scenes[index];
        const targetSelector = sceneTitleTargets[index];
        const titleHost = targetSelector === null
          ? activeSceneElement
          : activeSceneElement && targetSelector
            ? activeSceneElement.querySelector(targetSelector)
            : null;

        sceneTitle.textContent = title;
        sceneTitle.hidden = false;
        sceneTitle.setAttribute('aria-hidden', 'false');

        if (titleHost) {
          titleHost.insertBefore(sceneTitle, titleHost.firstChild);
        } else {
          console.warn(`Title host not found for scene ${index}; title left detached.`);
          sceneTitle.remove();
        }
      } else {
        // The third scene keeps its original animated sentence; the final scene keeps its date bookends.
        sceneTitle.hidden = true;
        sceneTitle.setAttribute('aria-hidden', 'true');
        sceneTitle.remove();
      }
    }
    if (scenes[index] && title) scenes[index].setAttribute('aria-label', title);
    loadSceneImages(index);
    if (index === 45 && whatChatFeed) whatChatFeed.scrollTop = 0;
    if (index === 46 && thingsStage) {
      thingsStage.scrollTop = 0;
      thingsStage.querySelectorAll('.things-timeline-track, .things-mobile-track').forEach(track => { track.style.height = '0px'; });
      const narrationContainer = thingsStage.querySelector('.things-narration');
      if (narrationContainer) narrationContainer.classList.remove('is-visible');
    }
    if (index === 47 && examResultsStage) {
      if (examResultsScroll) examResultsScroll.scrollTop = 0;
      examResultCards.forEach(card => card.classList.remove('is-visible'));
    }
    if (index === 48 && scene51Stage) scene51Stage.scrollTop = 0;
    if (index === 49 && scene52Viewport) scene52Viewport.scrollTop = 0;
    if (index === 50 && scene53Stage) scene53Stage.scrollTop = 0;
    scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === index));
    activateNarrationAutoScroll(index);
    // Both directional controls remain available at the boundaries: the
    // first click restarts/completes the current scene; the second navigates.
    previousButton.disabled = false;
    nextButton.disabled = false;
    previousButton.setAttribute('aria-label', 'Restart current scene; click again for previous scene');
    nextButton.setAttribute('aria-label', 'Complete current scene; click again for next scene');
  }

  function updatePoem(localTime) {
    for (const item of letterSchedule) {
      item.element.classList.toggle('revealed', localTime >= item.at);
    }
  }

  function updateChat(localTime) {
    const gifVisible = localTime >= GIF_START;
    const thanksVisible = localTime >= THANKS_AT;
    const welcomeVisible = localTime >= WELCOME_AT;
    gifMessage.classList.toggle('visible', gifVisible);
    thanksMessage.classList.toggle('visible', thanksVisible);
    welcomeMessage.classList.toggle('visible', welcomeVisible);

    // In reduced-motion mode, keep the birthday illustration on one frame.
    // The surrounding conversation is still shown in full.
    if (prefersReducedMotion) {
      if (previousGifFrame !== 0) {
        previousGifFrame = 0;
        gifImage.src = framePaths[0];
      }
      return;
    }

    if (gifVisible) {
      const frame = Math.floor((localTime - GIF_START) / GIF_FRAME_MS) % GIF_FRAME_COUNT;
      if (frame !== previousGifFrame) {
        previousGifFrame = frame;
        gifImage.src = framePaths[frame];
      }
    } else if (previousGifFrame !== 0) {
      previousGifFrame = 0;
      gifImage.src = framePaths[0];
    }
  }

  function updatePhoneTyping(localTime) {
    const typingTime = localTime - PHONE_START_DELAY;
    phoneTyping.events.forEach(event => {
      event.element.classList.toggle('revealed', typingTime >= event.at);
    });
  }

  function clamp01(value) { return Math.max(0, Math.min(1, value)); }
  function easeOutCubic(value) { return 1 - Math.pow(1 - clamp01(value), 3); }
  function easeOutBack(value) {
    const t = clamp01(value);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
  function smoothProgress(value) {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  }

  // One reusable viewport-fit calculation for staged photo reveals. The frame
  // retains its permanent orientation-based dimensions; only its transform is
  // expanded, centred, and then animated back into the layout.
  const photoPopupGeometryCache = new WeakMap();
  const photoPopupFrameState = new WeakMap();
  const photoPopupStageCounts = new WeakMap();

  function setPhotoPopupLayer(frame, active) {
    const previous = photoPopupFrameState.get(frame);
    if (previous && previous.active === active) return;
    if (!previous && !active) return;
    const stage = previous ? previous.stage : frame.closest(
      '.first-selfies-stage, .profile-memory-stage, .story-memory-stage, .new-beginnings-stage, .jan23-date-stage, .last-glimpses-stage, .new-memory-stage, .scene51-stage'
    );
    if (stage) {
      const count = Math.max(0, (photoPopupStageCounts.get(stage) || 0) + (active ? 1 : -1));
      photoPopupStageCounts.set(stage, count);
      stage.classList.toggle('photo-popup-overflow-visible', count > 0);
    }
    frame.style.zIndex = active ? '1001' : '';
    frame.style.pointerEvents = active ? 'none' : '';
    photoPopupFrameState.set(frame, { active, stage });
  }

  function getPhotoPopupGeometry(frame) {
    const image = frame && frame.querySelector('img');
    const dimensions = image && image.naturalWidth && image.naturalHeight
      ? `${image.naturalWidth}x${image.naturalHeight}` : '0x0';
    const stage = frame && frame.closest(
      '.first-selfies-stage, .profile-memory-stage, .story-memory-stage, .new-beginnings-stage, .jan23-date-stage, .last-glimpses-stage, .new-memory-stage, .scene51-stage'
    );
    const scrollTop = stage ? Math.round(stage.scrollTop) : 0;
    const popupOverflow = stage && stage.classList.contains('photo-popup-overflow-visible') ? 'open' : 'scroll';
    // visualViewport represents the actually visible area on mobile browsers,
    // which can be shorter than the layout viewport when browser chrome is shown.
    const visibleViewport = window.visualViewport;
    const viewportLeft = visibleViewport ? visibleViewport.offsetLeft : 0;
    const viewportTop = visibleViewport ? visibleViewport.offsetTop : 0;
    const viewportWidth = visibleViewport && visibleViewport.width > 0
      ? visibleViewport.width : window.innerWidth;
    const viewportHeight = visibleViewport && visibleViewport.height > 0
      ? visibleViewport.height : window.innerHeight;
    const key = [
      `${window.innerWidth}x${window.innerHeight}`,
      `${viewportLeft.toFixed(2)},${viewportTop.toFixed(2)},${viewportWidth.toFixed(2)},${viewportHeight.toFixed(2)}`,
      dimensions,
      scrollTop,
      popupOverflow
    ].join('|');
    const cached = frame && photoPopupGeometryCache.get(frame);
    if (cached && cached.key === key) return cached.geometry;

    const previousTransform = frame.style.transform;
    frame.style.transform = 'none';
    const rect = frame.getBoundingClientRect();
    frame.style.transform = previousTransform;

    // The transform enlarges the entire frame, not just the image's
    // object-fit content box. Fit against both frame dimensions so cropped or
    // differently proportioned images cannot push the frame off-screen.
    // The 92% allowance also leaves room for the entrance easing and shadows.
    const scale = Math.min(
      (viewportWidth * .92) / Math.max(1, rect.width),
      (viewportHeight * .92) / Math.max(1, rect.height),
      16
    );
    const geometry = {
      dx: (viewportLeft + viewportWidth / 2) - (rect.left + rect.width / 2),
      dy: (viewportTop + viewportHeight / 2) - (rect.top + rect.height / 2),
      scale
    };
    if (frame) photoPopupGeometryCache.set(frame, { key, geometry });
    return geometry;
  }

  function applyFullscreenPhotoPopup(frame, localTime, startAt, options = {}) {
    const popMs = options.popMs ?? 480;
    const holdMs = options.holdMs ?? 2000;
    const settleMs = options.settleMs ?? 1050;
    const elapsed = localTime - startAt;
    const settleAt = popMs + holdMs;
    const finishAt = settleAt + settleMs;
    setPhotoPopupLayer(frame, elapsed >= 0 && elapsed < finishAt);
    const geometry = getPhotoPopupGeometry(frame);

    if (elapsed < 0) {
      frame.style.opacity = '0';
      frame.style.filter = 'blur(2.5px)';
      frame.style.transform = `translate3d(${geometry.dx.toFixed(2)}px, ${geometry.dy.toFixed(2)}px, 0) scale(${(geometry.scale * .94).toFixed(4)})`;
      return;
    }

    let dx = geometry.dx;
    let dy = geometry.dy;
    let scale = geometry.scale;
    let opacity = 1;
    let blur = 0;

    if (elapsed < popMs) {
      const progress = easeOutCubic(elapsed / popMs);
      scale = geometry.scale * (.94 + .06 * easeOutBack(progress));
      opacity = progress;
      blur = 2.5 * (1 - progress);
    } else if (elapsed >= settleAt && elapsed < finishAt) {
      const progress = smoothProgress((elapsed - settleAt) / settleMs);
      dx *= 1 - progress;
      dy *= 1 - progress;
      scale = geometry.scale + (1 - geometry.scale) * progress;
    } else if (elapsed >= finishAt) {
      dx = 0;
      dy = 0;
      scale = 1;
    }

    frame.style.opacity = opacity.toFixed(3);
    frame.style.filter = `blur(${blur.toFixed(2)}px)`;
    frame.style.transform = elapsed >= finishAt
      ? 'none'
      : `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
  }

  function updateFirstSelfies(localTime) {
    const gallery = document.querySelector('.first-selfies-gallery');
    gallery.style.transform = 'none';
    firstSelfieElements.forEach((element, index) => {
      const startAt = FIRST_SELFIE_START_MS + index * FIRST_SELFIE_CYCLE_MS;
      applyFullscreenPhotoPopup(element, localTime, startAt, {
        popMs: FIRST_SELFIE_ENTER_MS,
        holdMs: FIRST_SELFIE_HOLD_MS,
        settleMs: FIRST_SELFIE_SETTLE_MS
      });
    });

    firstSelfiesTypewriter.events.forEach(event => {
      event.element.classList.toggle(
        'is-visible', localTime >= firstSelfiesCopyStart + event.at
      );
    });
  }

  function updateProfileMemory(localTime) {
    applyFullscreenPhotoPopup(profilePhoto, localTime, PROFILE_PHOTO_START_MS, {
      popMs: PROFILE_PHOTO_POP_MS,
      holdMs: PROFILE_PHOTO_HOLD_MS,
      settleMs: PROFILE_PHOTO_SETTLE_MS
    });

    profileMemoryTypewriter.events.forEach(event => {
      event.element.classList.toggle(
        'is-visible', localTime >= profileCopyStartAt + event.at
      );
    });
  }

  function updateNarrative(index, localTime) {
    if (index === 3) updateTrack(closingTrack, localTime);
    if (index === 4) updateTrack(daysTrack, localTime);
    if (index === 6) {
      nameLead.classList.toggle('is-revealed', localTime >= nameStart);
      memoryName.classList.toggle('is-revealed', localTime >= nameHighlightAt);
      nameFollow.classList.toggle('is-revealed', localTime >= nameFollowAt);
    }
    if (index === 7) {
      updateTrack(photoTrack, localTime);
      photoFrame.classList.toggle('is-revealed', localTime >= photoRevealAt);
    }
    if (index === 8) updateTrack(archiveReflectionTrack, localTime);
    if (index === 9) updateTrack(nov24Track, localTime);
    if (index === 10) updateTrack(cancelledTrack, localTime);
    if (index === 11) updateTrack(sunsetTrack, localTime);
    if (index === 12) {
      updateTrack(confessionIntroTrack, localTime);
      const poemHeadingVisible = localTime >= confessionTitleAt;
      confessionTitle.classList.toggle('is-revealed', poemHeadingVisible);
      updateTrack(confessionPoemLinesTrack, localTime);
      fullPoemLink.classList.toggle('is-revealed', localTime >= confessionPoemLinesTrack.end);
    }
    if (index === 13) updateTrack(replyNightTrack, localTime);
    if (index === 14) {
      yesDate.classList.toggle('is-revealed', localTime >= 450);
      yesWord.classList.toggle('is-revealed', localTime >= YES_REVEAL_AT);
      yesCaption.classList.toggle('is-revealed', localTime >= YES_CAPTION_AT);
    }
    if (index === 15) updateTrack(afterglowTrack, localTime);
    if (index === 16) updateFirstSelfies(localTime);
    if (index === 17) updateProfileMemory(localTime);
    if (index === 18) redOutfitMemory.update(localTime);
    if (index === 19) picnicMemory.update(localTime);
    if (index === 20) littlePicturesMemory.update(localTime);
    if (index === 21) lastTogetherMemory.update(localTime);
    if (index === 22) updateSeparationScene(localTime);
    if (index === 23) updateHopeIntroScene(localTime);
    if (index === 24) updateHopeJourneyScene(localTime);
    if (index === 25) earlyTuitionMemory.update(localTime);
    if (index === 26) littleMomentsMemory.update(localTime);
    if (index === 27) durgaPujaMemory.update(localTime);
    if (index === 28) saraswatiPujaMemory.update(localTime);
    if (index === 29) tuitionEndingMemory.update(localTime);
    if (index === 30) updateNewBeginnings(localTime);
    if (index === 31) updateWhatsAppMemory(localTime);
    if (index === 32) updateWhatsAppCalls(localTime);
    if (index === 33) pictureKeepsakesMemory.update(localTime);
    if (index === 34) {
      justAGlimpseTypewriter.events.forEach(event => {
        event.element.classList.toggle('is-visible', localTime >= event.at);
      });
    }
    if (index === 35) {
      returningHomeTypewriter.events.forEach(event => {
        event.element.classList.toggle('is-visible', localTime >= event.at);
      });
    }
    if (index === 36) {
      closerApartTypewriter.events.forEach(event => {
        event.element.classList.toggle('is-visible', localTime >= event.at);
      });
    }
    if (index === 37) updateSecondDropConnection(localTime);
    if (index === 38) updateJan23Date(localTime);
    if (index === 39) updateLastGlimpses(localTime);
    if (index === 40) updateNewMemoryTypewriter(holiReflectionTypewriter, localTime, HOLI_REFLECTION_START_MS);
    if (index === 41) {
      applyFullscreenPhotoPopup(waitingDaysScreenshotFrame, localTime, WAITING_DAYS_SCREENSHOT_START_MS, {
        popMs: WAITING_DAYS_SCREENSHOT_POP_MS,
        holdMs: WAITING_DAYS_SCREENSHOT_HOLD_MS,
        settleMs: WAITING_DAYS_SCREENSHOT_SETTLE_MS
      });
      waitingDaysTypewriter.events.forEach(event => {
        event.element.classList.toggle('is-visible', localTime >= WAITING_DAYS_NARRATION_START_MS + event.at);
      });
    }
    if (index === 42) updateBreakupScene(localTime);
    if (index === 43) updateNewMemoryTypewriter(afterBreakupHopeTypewriter, localTime, AFTER_BREAKUP_TEXT_START_MS);
    if (index === 44) updateNewMemoryTypewriter(anotherChanceTypewriter, localTime, AFTER_BREAKUP_TEXT_START_MS);
    if (index === 45) {
      updateNewMemoryTypewriter(whatICameToKnowTypewriter, localTime, AFTER_BREAKUP_TEXT_START_MS);
      whatChatSchedule.forEach(item => {
        const visible = localTime >= WHAT_CHAT_START_MS + item.at;
        const wasVisible = item.element.classList.contains('is-visible');
        item.element.classList.toggle('is-visible', visible);
        if (visible && !wasVisible) {
          // Keep every earlier bubble in the feed; only move the scroll position
          // so the latest message remains visible on smaller screens.
          whatChatFeed.scrollTo({
            top: whatChatFeed.scrollHeight,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    }
    if (index === 46) {
      updateNewMemoryTypewriter(thingsIntroTypewriter, localTime, AFTER_BREAKUP_TEXT_START_MS);
      thingsTimelineSchedule.forEach(item => {
        const visible = localTime >= AFTER_BREAKUP_TEXT_START_MS + thingsIntroTypewriter.typingDuration + item.at;
        const wasVisible = item.element.classList.contains('is-visible');
        item.element.classList.toggle('is-visible', visible);
        if (visible && !wasVisible) keepLatestThingsItemVisible(item.element);
      });
      updateThingsTimelineTracks();
      thingsNarrationTypewriter.events.forEach(event => {
        const visible = localTime >= thingsNarrationStartMs + event.at;
        const wasVisible = event.element.classList.contains('is-visible');
        event.element.classList.toggle('is-visible', visible);
        if (visible && !wasVisible) {
          const narrationContainer = thingsStage.querySelector('.things-narration');
          if (narrationContainer) narrationContainer.classList.add('is-visible');
          keepLatestThingsItemVisible(event.element);
        }
      });
    }
    if (index === 47) {
      updateNewMemoryTypewriter(examResultsIntroTypewriter, localTime, AFTER_BREAKUP_TEXT_START_MS);
      examResultsSchedule.forEach(item => {
        const visible = localTime >= AFTER_BREAKUP_TEXT_START_MS
          + examResultsIntroTypewriter.typingDuration
          + EXAM_RESULTS_GRID_PAUSE_MS
          + item.at;
        const wasVisible = item.element.classList.contains('is-visible');
        item.element.classList.toggle('is-visible', visible);
        if (visible && !wasVisible) keepLatestExamResultVisible(item.element);
      });
      examResultsClosingTypewriter.events.forEach(event => {
        const visible = localTime >= examResultsClosingStartMs + event.at;
        const wasVisible = event.element.classList.contains('is-visible');
        event.element.classList.toggle('is-visible', visible);
        if (visible && !wasVisible) keepLatestExamResultVisible(event.element);
      });
    }
    if (index === 48) {
      updateNewMemoryTypewriter(scene51IntroTypewriter, localTime, SCENE51_INTRO_START_MS);
      scene51Photos.forEach((photo, photoIndex) => {
        const photoStartAt = scene51PhotoStartsMs[photoIndex];
        photo.classList.toggle('is-visible', localTime >= photoStartAt);
        applyFullscreenPhotoPopup(photo, localTime, photoStartAt, {
          popMs: SCENE51_PHOTO_POP_MS,
          holdMs: SCENE51_PHOTO_HOLD_MS,
          settleMs: SCENE51_PHOTO_SETTLE_MS
        });
      });
      updateNewMemoryTypewriter(scene51MiddleTypewriter, localTime, scene51MiddleStartMs);
      scene51PoemsLink.classList.toggle('is-visible', localTime >= scene51LinkAtMs);
      updateNewMemoryTypewriter(scene51FinalTypewriter, localTime, scene51FinalStartMs);
    }
    if (index === 49) updateScene52(localTime);
    if (index === 50) updateScene53(localTime);
  }

  function render() {
    const bounded = Math.max(0, Math.min(elapsed, totalDuration));
    const index = sceneAt(Math.min(bounded, totalDuration - 1));
    const localTime = bounded - offsets[index];
    // Reduced motion settles decorative reveals immediately, but the final
    // chapters retain their authored typewriter and pause sequence: those are
    // meaningful narrative timing, not merely decorative motion.
    const timingSensitiveFinalChapter = index === 49 || index === 50;
    const visualTime = prefersReducedMotion && !timingSensitiveFinalChapter
      ? sceneDefs[index].duration
      : localTime;
    setScene(index);
    // Reduced-motion users receive a stable scene palette. The "Yes." scene
    // still receives its deliberate brighter state because the word is revealed
    // immediately in that mode; its background therefore settles after the reveal.
    const reducedMotionAtmosphereTime = index === 14
      ? offsets[index] + YES_REVEAL_AT + 900
      : offsets[index];
    updateAtmosphere(prefersReducedMotion ? reducedMotionAtmosphereTime : bounded);

    if (index === 0) updatePoem(visualTime);
    if (index === 2) updateChat(visualTime);
    if (index === 5) updatePhoneTyping(visualTime);
    updateNarrative(index, visualTime);

    if (index !== 2 && previousGifFrame !== 0) {
      previousGifFrame = 0;
      gifImage.src = framePaths[0];
    }

    if (bounded >= totalDuration) {
      elapsed = totalDuration;
      ended = true;
      paused = true;
      lastFrameTime = 0;
      experience.classList.add('is-paused');
      releaseScreenWakeLock(true);
      syncPlayButton();
    }
  }

  function tick(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    if (!paused && !ended) {
      elapsed += timestamp - lastFrameTime;
      if (elapsed >= totalDuration) elapsed = totalDuration;
      render();
    }
    lastFrameTime = timestamp;
    rafId = requestAnimationFrame(tick);
  }

  function syncPlayButton() {
    const label = ended ? 'Replay from beginning' : (paused ? 'Resume' : 'Pause');
    playButton.setAttribute('aria-label', label);
  }

  function showControls() {
    controlsVisible = true;
    experience.classList.add('controls-visible');
    controls.setAttribute('aria-hidden', 'false');
  }

  function hideControls() {
    controlsVisible = false;
    experience.classList.remove('controls-visible');
    controls.setAttribute('aria-hidden', 'true');
  }

  function pauseStoryForExternalInterruption() {
    // Pause audio first, then close the story clock at this same interaction
    // instant rather than leaving up to one requestAnimationFrame uncounted.
    suspendBackgroundMusicUntilGesture();
    if (!paused && !ended) {
      const pauseAt = performance.now();
      if (lastFrameTime) elapsed = Math.min(totalDuration, elapsed + Math.max(0, pauseAt - lastFrameTime));
      paused = true;
      render();
      if (activeScene === 31) pauseWhatsAppVideoForStory();
      if (activeScene === 32) pauseCallsVideoForStory();
      if (activeScene === 37) pauseSecondDropVideoForStory();
      if (activeScene === 39) pauseLastGlimpsesVideoForStory();
      if (activeScene === 42) pauseBreakupVideoForStory();
      experience.classList.add('is-paused');
      lastFrameTime = 0;
      syncPlayButton();
    }
  }

  function pauseAndShow() {
    pauseStoryForExternalInterruption();
    showControls();
  }

  function resumeAndHide() {
    // Resume is itself a trusted gesture. This also covers a restored story
    // position reached from one of the companion reading pages.
    if (backgroundMusic) backgroundMusicStarted = true;
    requestBackgroundMusicPlayback();
    if (ended) {
      elapsed = 0;
      ended = false;
      activeScene = -1;
      screenWakeLockWanted = true;
      render();
    }
    paused = false;
    if (activeScene === 31) resumeWhatsAppVideoForStory();
    if (activeScene === 32) resumeCallsVideoForStory();
    if (activeScene === 37) resumeSecondDropVideoForStory();
    if (activeScene === 39) resumeLastGlimpsesVideoForStory();
    if (activeScene === 42) resumeBreakupVideoForStory();
    experience.classList.remove('is-paused');
    lastFrameTime = performance.now();
    hideControls();
    syncPlayButton();
    acquireScreenWakeLock();
  }

  function resetActiveSceneForSeek(targetIndex) {
    // Re-enter the current scene so its scene-specific visual state, scroll
    // position, timeline tracks and media are reset before rendering a seek.
    if (activeScene === 31) stopWhatsAppVideoForNavigation();
    if (activeScene === 32) stopCallsVideoForNavigation();
    if (activeScene === 37) stopSecondDropVideoForNavigation();
    if (activeScene === 39) stopLastGlimpsesVideoForNavigation();
    if (activeScene === 42) stopBreakupVideoForNavigation();
    scenes[targetIndex].classList.remove('restore-settled');
    scenes[targetIndex].querySelectorAll('.restore-settled').forEach(element => element.classList.remove('restore-settled'));
    if (sceneTitle) sceneTitle.classList.remove('restore-settled');
    scenes[targetIndex].classList.remove('is-active');
    activeScene = -1;
    elapsed = offsets[targetIndex];
    render();
  }

  function jumpTo(index) {
    suspendBackgroundMusicUntilGesture();
    const safeIndex = Math.max(0, Math.min(sceneDefs.length - 1, index));
    ended = false;
    screenWakeLockWanted = true;
    paused = true;
    lastFrameTime = 0;
    experience.classList.add('is-paused');
    experience.classList.remove('is-instant-state');
    resetActiveSceneForSeek(safeIndex);
    showControls();
    syncPlayButton();
  }

  function jumpToCurrentSectionBeginning() {
    suspendBackgroundMusicUntilGesture();
    if (activeScene < 0) return;
    ended = false;
    screenWakeLockWanted = true;
    paused = true;
    lastFrameTime = 0;
    experience.classList.add('is-paused');
    experience.classList.remove('is-instant-state');
    resetActiveSceneForSeek(activeScene);
    showControls();
    syncPlayButton();
  }

  function jumpToSceneEnd(targetScene) {
    suspendBackgroundMusicUntilGesture();
    const safeIndex = Math.max(0, Math.min(sceneDefs.length - 1, targetScene));
    ended = false;
    screenWakeLockWanted = true;
    paused = true;
    lastFrameTime = 0;
    experience.classList.add('is-paused');
    experience.classList.remove('is-instant-state');
    resetActiveSceneForSeek(safeIndex);
    // Land on the final millisecond of the destination scene so all of its
    // scheduled reveals and narration are complete, without advancing onward.
    elapsed = offsets[safeIndex] + Math.max(0, sceneDefs[safeIndex].duration - 1);
    render();
    experience.classList.add('is-instant-state');
    showControls();
    syncPlayButton();
  }

  function jumpToCurrentSectionEnd() {
    suspendBackgroundMusicUntilGesture();
    if (activeScene < 0) return;
    const targetScene = activeScene;
    ended = false;
    screenWakeLockWanted = true;
    paused = true;
    lastFrameTime = 0;
    experience.classList.add('is-paused');
    resetActiveSceneForSeek(targetScene);
    // Render the last millisecond of this scene, not the next scene. Every
    // scheduled element is therefore visible while playback remains paused.
    elapsed = offsets[targetScene] + Math.max(0, sceneDefs[targetScene].duration - 1);
    render();
    experience.classList.add('is-instant-state');
    showControls();
    syncPlayButton();
  }

  function togglePlay() {
    if (paused || ended) resumeAndHide();
    else pauseAndShow();
  }

  // A tap/click anywhere pauses and reveals the controls. A tap outside them
  // while paused resumes playback and hides the controls again.
  experience.addEventListener('click', event => {
    if (event.target.closest('.music-toggle, .opening-gate, .transport-controls, .whatsapp-video-shell, .second-drop-connection-video-shell, .last-glimpses-video-shell, .last-glimpses-audio-toggle, video')) return;
    if (!paused && !ended) pauseAndShow();
    else if (controlsVisible && paused) resumeAndHide();
    else showControls();
  });

  [previousButton, playButton, nextButton].forEach(button => {
    button.addEventListener('click', event => event.stopPropagation());
  });
  previousButton.addEventListener('click', () => {
    if (activeScene < 0) return;
    if (previousNavigationClickArmed) {
      clearConsecutiveNavigationClicks();
      jumpToSceneEnd(activeScene > 0 ? activeScene - 1 : 0);
      return;
    }
    clearConsecutiveNavigationClicks();
    previousNavigationClickArmed = true;
    jumpToCurrentSectionBeginning();
  });
  nextButton.addEventListener('click', () => {
    if (activeScene < 0) return;
    if (nextNavigationClickArmed) {
      clearConsecutiveNavigationClicks();
      jumpTo(activeScene < sceneDefs.length - 1 ? activeScene + 1 : 0);
      return;
    }
    clearConsecutiveNavigationClicks();
    nextNavigationClickArmed = true;
    jumpToCurrentSectionEnd();
  });
  playButton.addEventListener('click', () => {
    clearConsecutiveNavigationClicks();
    togglePlay();
  });

  function beginExperienceFromOpening() {
    if (openingCompleted || !openingGate || openingGate.hidden) return;
    openingCompleted = true;
    // Directly inside the trusted CTA click: the sole initial music-start gesture.
    startBackgroundMusicFromGesture();
    elapsed = 0;
    ended = false;
    activeScene = -1;
    paused = false;
    lastFrameTime = performance.now();
    experience.classList.remove('is-paused');
    hideControls();
    render();
    syncPlayButton();
    acquireScreenWakeLock();
    openingGate.classList.add('is-leaving');
    openingGate.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => { openingGate.hidden = true; }, prefersReducedMotion ? 1 : 660);
  }

  if (openingGate) openingGate.addEventListener('click', event => event.stopPropagation());
  if (enterStoryButton) enterStoryButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    beginExperienceFromOpening();
  });

  function getElementReference(root, element) {
    if (!root || !element || (element !== root && !root.contains(element))) return null;
    if (element.id) return { id: element.id };
    const path = [];
    let node = element;
    while (node && node !== root) {
      const parent = node.parentElement;
      if (!parent) return null;
      path.unshift(Array.prototype.indexOf.call(parent.children, node));
      node = parent;
    }
    return node === root ? { path } : null;
  }

  function resolveElementReference(root, reference) {
    if (!root || !reference) return null;
    if (reference.id) {
      if (root.id === reference.id) return root;
      return [...root.querySelectorAll('[id]')].find(element => element.id === reference.id) || null;
    }
    if (!Array.isArray(reference.path)) return null;
    let node = root;
    for (const childIndex of reference.path) {
      if (!Number.isInteger(childIndex) || childIndex < 0 || !node.children[childIndex]) return null;
      node = node.children[childIndex];
    }
    return node;
  }

  function captureActiveSceneAnimations(index) {
    const scene = scenes[index];
    if (!scene || typeof scene.getAnimations !== 'function') return [];
    try {
      return scene.getAnimations({ subtree: true }).map(animation => {
        const target = animation.effect && animation.effect.target;
        const reference = getElementReference(scene, target);
        const currentTime = Number(animation.currentTime);
        const playState = animation.playState;
        if (!reference || !Number.isFinite(currentTime)
          || !['running', 'paused', 'pending'].includes(playState)) return null;
        return {
          target: reference,
          name: animation.animationName || animation.transitionProperty || animation.constructor.name,
          pseudo: animation.effect.pseudoElement || '',
          currentTime,
          playbackRate: Number.isFinite(animation.playbackRate) ? animation.playbackRate : 1,
          playState
        };
      }).filter(Boolean);
    } catch (error) {
      console.info('The browser could not capture every in-progress scene animation.', error);
      return [];
    }
  }

  function captureActiveSceneScroll(index) {
    const scene = scenes[index];
    if (!scene) return [];
    const candidates = new Set();
    if (narrationAutoScrollHost && scene.contains(narrationAutoScrollHost)) {
      candidates.add(narrationAutoScrollHost);
    }
    scene.querySelectorAll('*').forEach(element => {
      const overflowY = getComputedStyle(element).overflowY;
      const scrollable = ['auto', 'scroll', 'overlay'].includes(overflowY);
      if (scrollable && (element.scrollHeight > element.clientHeight + 2
        || element.scrollTop > 0 || element.scrollLeft > 0)) candidates.add(element);
    });
    return [...candidates].map(element => {
      const reference = getElementReference(scene, element);
      return reference ? {
        target: reference,
        top: element.scrollTop,
        left: element.scrollLeft
      } : null;
    }).filter(Boolean);
  }

  // Store the full snapshot in sessionStorage. The URL carries only a short
  // marker: serializing every animation into a query string can create URLs
  // large enough to be rejected by browsers, proxies, or the hosting layer.
  function createStoryReturnState() {
    const clickTime = !paused && !ended && lastFrameTime
      ? Math.max(0, performance.now() - lastFrameTime)
      : 0;
    const savedElapsed = Math.max(0, Math.min(totalDuration - 1, elapsed + clickTime));
    const savedSceneIndex = sceneAt(savedElapsed);
    return {
      version: 2,
      elapsed: savedElapsed,
      sceneIndex: savedSceneIndex,
      paused: Boolean(paused || ended),
      ended: Boolean(ended),
      controlsVisible: Boolean(controlsVisible),
      audio: backgroundMusic ? {
        currentTime: Number.isFinite(backgroundMusic.currentTime) ? backgroundMusic.currentTime : 0,
        muted: Boolean(backgroundMusic.muted),
        started: Boolean(backgroundMusicStarted),
        wasPlaying: Boolean(backgroundMusicStarted && !backgroundMusic.paused && !paused && !ended)
      } : null,
      scrollPositions: captureActiveSceneScroll(savedSceneIndex),
      animations: captureActiveSceneAnimations(savedSceneIndex),
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      savedAt: Date.now()
    };
  }

  function withStoryReturnState(destination) {
    const state = createStoryReturnState();
    lastNavigationReturnState = state;
    try {
      sessionStorage.setItem(STORY_RETURN_STATE_KEY, JSON.stringify(state));
      sessionStorage.removeItem(LEGACY_STORY_RETURN_STATE_KEY);
    } catch (error) {
      console.warn('Could not save the story return snapshot in this tab.', error);
    }
    const target = new URL(destination, window.location.href);
    target.searchParams.set('storyReturn', 'session-v2');
    return target.href;
  }

  scene51PoemsLink.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    window.location.assign(withStoryReturnState(scene51PoemsLink.href));
  });

  // The dedicated poem is opened in a separate tab, but receives the same
  // snapshot. Its return links can therefore restore this exact story moment.
  fullPoemLink.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const poemUrl = withStoryReturnState(fullPoemLink.href);
    const poemTab = window.open(poemUrl, '_blank');
    if (!poemTab) window.location.assign(poemUrl);
  });

  // The final-scene poem uses the same timestamped, opener-aware navigation
  // as the existing confession poem, preserving this exact moment in the story.
  scene53PoemLink.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const poemUrl = withStoryReturnState(scene53PoemLink.href);
    const poemTab = window.open(poemUrl, '_blank');
    if (!poemTab) window.location.assign(poemUrl);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseStoryForExternalInterruption();
    else if (screenWakeLockWanted && !ended) {
      // The story and track remain paused together until the visitor presses Resume.
      acquireScreenWakeLock();
    }
  });
  // Losing focus pauses the same shared story/audio clock. Focus returning alone
  // never resumes either; the existing Resume control restarts both together.
  window.addEventListener('blur', pauseStoryForExternalInterruption);
  window.addEventListener('beforeunload', suspendBackgroundMusicUntilGesture, { once: true });

  window.addEventListener('keydown', event => {
    // Keyboard shortcuts must not bypass the pre-story opening invitation.
    if (!openingCompleted && openingGate && !openingGate.hidden) return;
    if (event.target.closest && event.target.closest('.whatsapp-video-shell, .second-drop-connection-video-shell, .last-glimpses-video-shell, .last-glimpses-audio-toggle, .breakup-video-shell')) return;
    if (event.code === 'Space' && !['BUTTON', 'INPUT', 'TEXTAREA', 'VIDEO'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      if (paused || ended) resumeAndHide(); else pauseAndShow();
    }
    if (event.code === 'ArrowLeft' && (paused || ended) && activeScene > 0) jumpTo(activeScene - 1);
    if (event.code === 'ArrowRight' && (paused || ended)) jumpTo(activeScene < sceneDefs.length - 1 ? activeScene + 1 : 0);
    if (event.code === 'Escape' && controlsVisible && paused) resumeAndHide();
  });

  function isValidStoryReturnState(savedState) {
    if (!savedState || ![1, 2].includes(savedState.version)
      || !Number.isFinite(savedState.elapsed)
      || !Number.isFinite(savedState.savedAt)
      || Date.now() - savedState.savedAt > 24 * 60 * 60 * 1000) return false;
    const restoredElapsed = Math.max(0, Math.min(totalDuration - 1, savedState.elapsed));
    return !(Number.isInteger(savedState.sceneIndex)
      && sceneAt(restoredElapsed) !== savedState.sceneIndex);
  }

  function clearPendingNarrationScrolls() {
    if (narrationAutoScrollTimer !== null) window.clearTimeout(narrationAutoScrollTimer);
    narrationAutoScrollTimer = null;
    narrationAutoScrollPendingTarget = null;
    narrationAutoScrollLastTarget = null;
    if (scene52ScrollTimer !== null) window.clearTimeout(scene52ScrollTimer);
    scene52ScrollTimer = null;
    scene52ScrollTarget = null;
    if (scene53ScrollTimer !== null) window.clearTimeout(scene53ScrollTimer);
    scene53ScrollTimer = null;
    scene53ScrollTarget = null;
  }

  function restoreSceneScrollPositions(savedState, sceneIndex) {
    const scene = scenes[sceneIndex];
    if (!scene) return;
    const positions = Array.isArray(savedState.scrollPositions) ? savedState.scrollPositions : [];
    // Version-one snapshots only preserved the final chapter's scroll offset.
    if (!positions.length && sceneIndex === 48 && Number.isFinite(savedState.scene51ScrollTop)) {
      positions.push({ target: { id: 'scene51Stage' }, top: savedState.scene51ScrollTop, left: 0 });
    }
    restorationScrollGuardUntil = performance.now() + 420;
    clearPendingNarrationScrolls();
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      if (activeScene !== sceneIndex) return;
      positions.forEach(position => {
        const element = resolveElementReference(scene, position.target);
        if (!element) return;
        element.scrollTo({
          top: Math.max(0, Number(position.top) || 0),
          left: Math.max(0, Number(position.left) || 0),
          behavior: 'auto'
        });
      });
      if (Number.isFinite(savedState.scrollX) && Number.isFinite(savedState.scrollY)) {
        window.scrollTo({ left: savedState.scrollX, top: savedState.scrollY, behavior: 'auto' });
      }
      if (narrationAutoScrollHost) refreshNarrationAutoScrollOverflow(narrationAutoScrollHost);
    }));
  }

  function restoreSceneAnimationProgress(savedState, sceneIndex) {
    const scene = scenes[sceneIndex];
    if (!scene) return;
    const savedAnimations = Array.isArray(savedState.animations) ? savedState.animations : [];
    const restoredTargets = new WeakSet();
    const animationBuckets = new Map();
    const animationKey = (reference, name, pseudo) => {
      const locator = reference.id ? `id:${reference.id}` : `path:${reference.path.join('.')}`;
      return `${locator}|${name}|${pseudo || ''}`;
    };

    // Force the timeline-derived classes to be applied before matching the
    // browser-created CSS animations/transitions to their saved local times.
    void scene.offsetWidth;
    if (typeof scene.getAnimations === 'function') {
      try {
        scene.getAnimations({ subtree: true }).forEach(animation => {
          const target = animation.effect && animation.effect.target;
          const reference = getElementReference(scene, target);
          if (!reference) return;
          const name = animation.animationName || animation.transitionProperty || animation.constructor.name;
          const pseudo = animation.effect.pseudoElement || '';
          const key = animationKey(reference, name, pseudo);
          if (!animationBuckets.has(key)) animationBuckets.set(key, []);
          animationBuckets.get(key).push({ animation, target });
        });
      } catch (error) {
        console.info('The browser could not enumerate scene animations during restoration.', error);
      }
    }

    savedAnimations.forEach(savedAnimation => {
      if (!savedAnimation || !savedAnimation.target || !Number.isFinite(savedAnimation.currentTime)) return;
      const key = animationKey(savedAnimation.target, savedAnimation.name, savedAnimation.pseudo);
      const match = animationBuckets.get(key);
      if (!match || !match.length) return;
      const { animation, target } = match.shift();
      try {
        animation.pause();
        animation.currentTime = Math.max(0, savedAnimation.currentTime);
        animation.playbackRate = Number.isFinite(savedAnimation.playbackRate) ? savedAnimation.playbackRate : 1;
        if (savedAnimation.playState === 'running' || savedAnimation.playState === 'pending') animation.play();
        else animation.pause();
        restoredTargets.add(target);
      } catch (error) {
        console.info('An individual scene animation could not be restored.', error);
      }
    });

    // Elements whose entrance had already settled are fixed in their current
    // timeline-derived state, so they do not replay. Truly in-progress effects
    // above retain their recorded Web Animations API currentTime.
    const revealSelector = '.revealed, .is-visible, .is-revealed, .visible';
    scene.querySelectorAll(revealSelector).forEach(element => {
      if (!restoredTargets.has(element)) element.classList.add('restore-settled');
    });
    const allSceneElements = [scene, ...scene.querySelectorAll('*')];
    allSceneElements.forEach(element => {
      if (restoredTargets.has(element)) return;
      const computed = getComputedStyle(element);
      if (computed.animationName && computed.animationName.split(',').some(name => name.trim() !== 'none')) {
        element.classList.add('restore-settled');
      }
    });
    if (sceneTitle && !sceneTitle.hidden && !restoredTargets.has(sceneTitle)) {
      sceneTitle.classList.add('restore-settled');
    }
  }

  function restoreBackgroundMusicState(audioState) {
    if (!backgroundMusic) return;
    const state = audioState && typeof audioState === 'object' ? audioState : null;
    backgroundMusicRequestVersion += 1;
    backgroundMusic.pause();
    backgroundMusicStarted = Boolean(state && state.started);
    if (state && typeof state.muted === 'boolean') backgroundMusic.muted = state.muted;
    if (state && Number.isFinite(state.currentTime)) {
      const seekToSavedPosition = () => {
        const duration = backgroundMusic.duration;
        const targetTime = Number.isFinite(duration) && duration > 0
          ? Math.max(0, state.currentTime % duration)
          : Math.max(0, state.currentTime);
        try { backgroundMusic.currentTime = targetTime; } catch (_) { /* Media may have become unavailable. */ }
      };
      if (backgroundMusic.readyState >= 1) seekToSavedPosition();
      else backgroundMusic.addEventListener('loadedmetadata', seekToSavedPosition, { once: true });
    }
    syncMusicToggle();
  }

  function restoreStoryState(savedState, options = {}) {
    if (!isValidStoryReturnState(savedState)) return false;
    const sameDocument = Boolean(options.sameDocument);
    const restoredElapsed = savedState.ended
      ? totalDuration
      : Math.max(0, Math.min(totalDuration - 1, savedState.elapsed));
    const restoredSceneIndex = sceneAt(Math.min(restoredElapsed, totalDuration - 1));
    const shouldResumeStory = !savedState.paused && !savedState.ended;
    const shouldResumeAudio = Boolean(shouldResumeStory && savedState.audio
      && savedState.audio.started && savedState.audio.wasPlaying);
    const generation = ++storyRestoreGeneration;

    elapsed = restoredElapsed;
    ended = Boolean(savedState.ended);
    paused = shouldResumeStory && shouldResumeAudio && backgroundMusic ? true : !shouldResumeStory;
    lastFrameTime = 0;
    if (!sameDocument) {
      activeScene = -1;
      experience.classList.remove('is-paused');
    }
    const restoreScene = scenes[restoredSceneIndex];
    if (restoreScene) {
      restoreScene.classList.remove('restore-settled');
      restoreScene.querySelectorAll('.restore-settled').forEach(element => element.classList.remove('restore-settled'));
    }
    if (sceneTitle) sceneTitle.classList.remove('restore-settled');
    restorationScrollGuardUntil = performance.now() + 420;
    experience.classList.toggle('is-paused', paused);
    render();
    restoreSceneAnimationProgress(savedState, restoredSceneIndex);
    restoreSceneScrollPositions(savedState, restoredSceneIndex);

    if (savedState.audio) restoreBackgroundMusicState(savedState.audio);
    if (shouldResumeAudio && backgroundMusic) {
      const finishAudioRestore = audioResumed => {
        if (generation !== storyRestoreGeneration || !shouldResumeStory) return;
        if (audioResumed && document.visibilityState === 'visible') {
          paused = false;
          experience.classList.remove('is-paused');
          lastFrameTime = performance.now();
          if (savedState.controlsVisible) showControls();
          else hideControls();
          syncPlayButton();
          acquireScreenWakeLock();
        } else if (document.visibilityState === 'visible') {
          // Autoplay policies differ by browser. Keep the story frozen at the
          // exact return point and expose Resume; its click is a trusted gesture.
          paused = true;
          experience.classList.add('is-paused');
          showControls();
          lastFrameTime = 0;
          syncPlayButton();
        }
      };
      const attemptAudioResume = () => {
        if (generation !== storyRestoreGeneration) return;
        if (document.visibilityState !== 'visible') {
          const onVisible = () => {
            if (document.visibilityState !== 'visible') return;
            document.removeEventListener('visibilitychange', onVisible);
            attemptAudioResume();
          };
          document.addEventListener('visibilitychange', onVisible);
          return;
        }
        requestBackgroundMusicPlayback().then(finishAudioRestore);
      };
      attemptAudioResume();
    }

    experience.classList.toggle('is-paused', paused);
    if (savedState.controlsVisible) showControls();
    else if (!shouldResumeAudio) hideControls();
    syncPlayButton();
    if (paused) releaseScreenWakeLock(false);
    return true;
  }

  function restoreStoryPositionAfterPoems() {
    let savedState;
    const returnMarker = new URLSearchParams(window.location.search).get('storyReturn');
    // New links use a small marker and read the snapshot from this tab's
    // sessionStorage. Full JSON query values remain supported for old bookmarks.
    let serializedState = returnMarker && returnMarker.trim().startsWith('{')
      ? returnMarker
      : null;
    try {
      if (!serializedState) {
        serializedState = sessionStorage.getItem(STORY_RETURN_STATE_KEY)
          || sessionStorage.getItem(LEGACY_STORY_RETURN_STATE_KEY);
      }
      sessionStorage.removeItem(STORY_RETURN_STATE_KEY);
      sessionStorage.removeItem(LEGACY_STORY_RETURN_STATE_KEY);
    } catch (error) {
      // Legacy full-state URLs still work when sessionStorage is restricted.
      console.info('Session storage unavailable while restoring the story position.', error);
    }
    if (!serializedState) return false;
    try {
      savedState = JSON.parse(serializedState);
    } catch (error) {
      console.warn('Could not parse the saved story position:', error);
      return false;
    }
    if (!restoreStoryState(savedState)) return false;

    // Remove the one-time marker/payload after reading it so a later refresh
    // does not repeatedly rewind the story position.
    if (returnMarker) {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.hash);
      } catch (_) { /* Some file:// previews disallow history URL replacement. */ }
    }
    if (openingGate) openingGate.hidden = true;
    return true;
  }

  const restoredStoryPosition = restoreStoryPositionAfterPoems();
  if (!restoredStoryPosition) {
    experience.classList.add('is-paused');
    render();
    startOpeningSequence();
  } else if (openingGate) {
    // Return links restore their saved position instead of repeating the invitation.
    openingGate.hidden = true;
  }

  // Respect live changes to the operating-system accessibility preference.
  // A legacy listener fallback covers older Safari versions.
  if (motionPreference) {
    const handleMotionPreferenceChange = event => {
      prefersReducedMotion = Boolean(event.matches);
      experience.classList.toggle('reduced-motion', prefersReducedMotion);
      render();
    };
    if (typeof motionPreference.addEventListener === 'function') {
      motionPreference.addEventListener('change', handleMotionPreferenceChange);
    } else if (typeof motionPreference.addListener === 'function') {
      motionPreference.addListener(handleMotionPreferenceChange);
    }
  }

  function startAnimationLoop() {
    if (animationLoopRunning) return;
    animationLoopRunning = true;
    rafId = requestAnimationFrame(tick);
  }

  function stopAnimationLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    animationLoopRunning = false;
    lastFrameTime = 0;
  }

  // A companion poem tab asks the still-open story tab to restore its own
  // snapshot. The large animation state never needs to travel through a URL or
  // postMessage; it remains in this tab's memory/sessionStorage.
  window.addEventListener('message', event => {
    if (event.origin !== window.location.origin || !event.data
      || event.data.type !== 'birthday-story:return-to-opener') return;
    let savedState = event.data.state || lastNavigationReturnState;
    if (!savedState) {
      try {
        const serialized = sessionStorage.getItem(STORY_RETURN_STATE_KEY)
          || sessionStorage.getItem(LEGACY_STORY_RETURN_STATE_KEY);
        if (serialized) savedState = JSON.parse(serialized);
      } catch (error) {
        console.info('The story tab could not read its saved return snapshot.', error);
      }
    }
    if (restoreStoryState(savedState, { sameDocument: true })) {
      lastNavigationReturnState = null;
      try {
        sessionStorage.removeItem(STORY_RETURN_STATE_KEY);
        sessionStorage.removeItem(LEGACY_STORY_RETURN_STATE_KEY);
      } catch (_) { /* The in-memory restore has already succeeded. */ }
      window.focus();
      startAnimationLoop();
      if (!paused) acquireScreenWakeLock();
    }
  });

  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    const savedState = lastNavigationReturnState;
    lastNavigationReturnState = null;
    if (savedState) {
      restoreStoryState(savedState, { sameDocument: true });
    } else {
      // BFCache keeps the existing DOM and CSS animation timelines intact.
      // Restart only the story clock; never install a second RAF loop.
      lastFrameTime = 0;
    }
    startAnimationLoop();
    if (screenWakeLockWanted && !ended) acquireScreenWakeLock();
  });

  // Preserve the outgoing state before freezing the page. The in-memory copy
  // is used on BFCache return; sessionStorage is only a fallback for browsers
  // that reconstruct the document instead of restoring it from BFCache.
  window.addEventListener('pagehide', event => {
    if (!lastNavigationReturnState) lastNavigationReturnState = createStoryReturnState();
    if (event.persisted) {
      try {
        sessionStorage.setItem(STORY_RETURN_STATE_KEY, JSON.stringify(lastNavigationReturnState));
      } catch (_) { /* The in-memory BFCache snapshot remains available. */ }
    }
    suspendBackgroundMusicUntilGesture();
    stopAnimationLoop();
    releaseScreenWakeLock(false);
  });

  // Request immediately while the page is visible so the phone does not
  // reach its normal screen timeout during the automatically playing story.
  acquireScreenWakeLock();
  startAnimationLoop();
})();
