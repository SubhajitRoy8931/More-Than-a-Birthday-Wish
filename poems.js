(() => {
  'use strict';

  const status = document.getElementById('poemLoadStatus');
  function showStatus(message, role = 'alert') {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    status.setAttribute('role', role);
  }
  function clearStatus() {
    if (!status) return;
    status.hidden = true;
    status.textContent = '';
  }

  // Make runtime failures visible instead of leaving a blank poem page.
  window.addEventListener('error', event => {
    if (event.target && event.target !== window) return;
    console.error('Poem page script error:', event.error || event.message);
    showStatus('The poems could not be displayed because the page encountered an error. Reload the page; if it continues, check the browser console.');
  });

  // Carry the story timestamp through collection and dedicated-poem pages.
  // This runs before the collection mount check so the same script can also
  // maintain return links on let-you-know.html.
  const storyReturnState = new URLSearchParams(window.location.search).get('storyReturn');
  if (storyReturnState) {
    document.querySelectorAll('.return-link, .dedicated-poem-link').forEach(link => {
      const targetUrl = new URL(link.href, window.location.href);
      targetUrl.searchParams.set('storyReturn', storyReturnState);
      link.href = targetUrl.href;
    });
  }

  // The dedicated poem is opened from the story in a separate tab. When the
  // original tab is still available, send it the saved snapshot and close this
  // tab instead of opening a duplicate copy of the main experience. Standalone
  // visits and browsers that sever window.opener retain the normal URL return.
  document.querySelectorAll('.return-link').forEach(link => {
    link.addEventListener('click', event => {
      if (!window.opener || window.opener.closed) return;
      const targetUrl = new URL(link.href, window.location.href);
      const hasReturnMarker = targetUrl.searchParams.has('storyReturn') || Boolean(storyReturnState);
      if (!hasReturnMarker) return;
      try {
        const openerOrigin = window.opener.location.origin;
        if (openerOrigin !== window.location.origin) return;
        // The opener already owns the full snapshot in memory/sessionStorage.
        // Send only a small request; never echo the snapshot through a URL/message.
        window.opener.focus();
        window.opener.postMessage({ type: 'birthday-story:return-to-opener' }, window.location.origin);
        event.preventDefault();
        window.close();
      } catch (error) {
        // A cross-origin or opener-isolated tab falls back to the short return URL.
        console.info('The original story tab is unavailable; using the return link.', error);
      }
    });
  });

  const collection = window.POEM_COLLECTION;
  const mount = document.getElementById('poemCollections');

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function appendStanzas(container, stanzas) {
    if (!Array.isArray(stanzas)) throw new Error('Poem stanzas are missing or invalid.');
    stanzas.forEach(stanzaText => {
      if (typeof stanzaText !== 'string') throw new Error('A poem stanza is not valid text.');
      const stanza = make('section', 'stanza');
      stanzaText.split('\n').forEach(line => stanza.appendChild(make('p', '', line)));
      container.appendChild(stanza);
    });
  }

  // Dedicated poem pages render from the same collection data as the accordion,
  // so the full text can never drift between its two appearances.
  const dedicatedPoemMount = document.querySelector('[data-poem-id]');
  if (dedicatedPoemMount) {
    if (!collection || typeof collection !== 'object') {
      showStatus('The poem data could not be loaded. Reload this page; if the problem continues, the site deployment may be incomplete.');
      return;
    }

    try {
      const allPoems = Object.values(collection).filter(Array.isArray).flat();
      const dedicatedPoem = allPoems.find(poem => poem && poem.id === dedicatedPoemMount.dataset.poemId);
      if (!dedicatedPoem) {
        showStatus('This poem could not be found in the collection. Please return to the Poems page.');
        return;
      }
      appendStanzas(dedicatedPoemMount, dedicatedPoem.stanzas);
      clearStatus();
    } catch (error) {
      console.error('Could not render the dedicated poem:', error);
      showStatus('The poem data was found, but its text could not be displayed. Please reload the page.');
    }
  }

  if (!mount) return;
  if (!collection || typeof collection !== 'object') {
    showStatus('The poem data file could not be loaded. Reload the page; if the problem continues, check the site deployment and the poems-data.js request.');
    return;
  }

  const sections = [
    { key: 'before', id: 'before-separation', title: 'Before the Separation', count: '09', note: 'The words written while our story was still being lived.' },
    { key: 'after', id: 'after-separation', title: 'After the Separation', count: '14', note: 'The words that came after, carrying memories and unanswered questions.' }
  ];

  try {
    sections.forEach(sectionInfo => {
      const poems = collection[sectionInfo.key];
      if (!Array.isArray(poems)) throw new Error('The ' + sectionInfo.key + ' poem collection is missing or invalid.');

      const section = make('section', 'poem-collection-section');
      section.id = sectionInfo.id;
      const heading = make('header', 'collection-section-heading');
      const overline = make('div', 'section-overline', sectionInfo.count + ' POEMS');
      const title = make('h2', '', sectionInfo.title);
      const note = make('p', 'section-note', sectionInfo.note);
      heading.append(overline, title, note);
      const list = make('div', 'poem-entry-list');

      poems.forEach((poem, index) => {
        if (!poem || typeof poem.title !== 'string' || !Array.isArray(poem.stanzas)) {
          throw new Error('A poem entry in ' + sectionInfo.key + ' is incomplete.');
        }
        const details = make('details', 'poem-entry');
        details.id = 'poem-' + sectionInfo.key + '-' + (index + 1);
        const summary = make('summary', 'poem-entry-summary');
        const main = make('span', 'poem-entry-main');
        const poemTitle = make('span', 'poem-entry-title', poem.title);
        const occasion = make('span', 'poem-entry-occasion', poem.occasion || '');
        main.append(poemTitle, occasion);
        const affordance = make('span', 'poem-entry-affordance', 'Read poem');
        affordance.setAttribute('aria-hidden', 'true');
        summary.append(main, affordance);

        const body = make('article', 'poem-entry-body');
        body.setAttribute('aria-label', poem.title);
        const text = make('div', 'full-poem collection-full-poem');
        appendStanzas(text, poem.stanzas);
        body.appendChild(text);
        if (poem.dedicatedPage) {
          const dedicated = make('a', 'dedicated-poem-link', 'Open the dedicated poem page ↗');
          const dedicatedUrl = new URL(poem.dedicatedPage, window.location.href);
          if (storyReturnState) dedicatedUrl.searchParams.set('storyReturn', storyReturnState);
          dedicated.href = dedicatedUrl.href;
          body.appendChild(dedicated);
        }
        details.append(summary, body);
        details.addEventListener('toggle', () => {
          affordance.textContent = details.open ? 'Close poem' : 'Read poem';
        });
        list.appendChild(details);
      });
      section.append(heading, list);
      mount.appendChild(section);
    });

    clearStatus();
  } catch (error) {
    console.error('Could not render the poem collection:', error);
    mount.replaceChildren();
    showStatus('The poem collection data is incomplete or could not be rendered. Reload the page; if the problem continues, check the browser console.');
  }
})();
