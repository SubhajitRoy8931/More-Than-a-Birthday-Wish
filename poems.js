(() => {
  'use strict';
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
      const serializedState = targetUrl.searchParams.get('storyReturn') || storyReturnState;
      if (!serializedState) return;
      try {
        const openerOrigin = window.opener.location.origin;
        if (openerOrigin !== window.location.origin) return;
        const savedState = JSON.parse(serializedState);
        const targetOrigin = window.location.origin === 'null' ? '*' : window.location.origin;
        window.opener.focus();
        window.opener.postMessage({
          type: 'birthday-story:return-to-opener',
          state: savedState
        }, targetOrigin);
        event.preventDefault();
        window.close();
      } catch (error) {
        // A cross-origin or opener-isolated tab falls back to the return URL.
        console.info('The original story tab is unavailable; using the return link.', error);
      }
    });
  });

  const collection = window.POEM_COLLECTION;
  const mount = document.getElementById('poemCollections');
  if (!collection || !mount) return;

  const sections = [
    { key: 'before', id: 'before-separation', title: 'Before the Separation', count: '09', note: 'The words written while our story was still being lived.' },
    { key: 'after', id: 'after-separation', title: 'After the Separation', count: '13', note: 'The words that came after, carrying memories and unanswered questions.' }
  ];

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  sections.forEach(sectionInfo => {
    const poems = collection[sectionInfo.key] || [];
    const section = make('section', 'poem-collection-section');
    section.id = sectionInfo.id;
    const heading = make('header', 'collection-section-heading');
    const overline = make('div', 'section-overline', sectionInfo.count + ' POEMS');
    const title = make('h2', '', sectionInfo.title);
    const note = make('p', 'section-note', sectionInfo.note);
    heading.append(overline, title, note);
    const list = make('div', 'poem-entry-list');

    poems.forEach((poem, index) => {
      const details = make('details', 'poem-entry');
      details.id = 'poem-' + sectionInfo.key + '-' + (index + 1);
      const summary = make('summary', 'poem-entry-summary');
      const main = make('span', 'poem-entry-main');
      const poemTitle = make('span', 'poem-entry-title', poem.title);
      const occasion = make('span', 'poem-entry-occasion', poem.occasion);
      main.append(poemTitle, occasion);
      const affordance = make('span', 'poem-entry-affordance', 'Read poem');
      affordance.setAttribute('aria-hidden', 'true');
      summary.append(main, affordance);

      const body = make('article', 'poem-entry-body');
      body.setAttribute('aria-label', poem.title);
      const text = make('div', 'full-poem collection-full-poem');
      (poem.stanzas || []).forEach(stanzaText => {
        const stanza = make('section', 'stanza');
        stanzaText.split('\n').forEach(line => stanza.appendChild(make('p', '', line)));
        text.appendChild(stanza);
      });
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
})();
