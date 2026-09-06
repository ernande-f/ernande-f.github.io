(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const all = (selector) => [...document.querySelectorAll(selector)];
  const projects = [
    { slug: 'venda-na-obra', title: 'Venda na Obra', file: '01_venda_na_obra.mp4', id: 'VNH_n9pUY5Y', type: 'Reels', sector: 'Construção', description: 'Conteúdo imobiliário editado para Venda na Obra. Um dos trabalhos que passaram pela minha timeline.' },
    { slug: 'esquadrias', title: 'Esquadrias em alumínio', file: '02_esquadrias.mp4', id: 'NRirHkJlBn8', type: 'Reels', sector: 'Esquadrias', description: 'Edição de conteúdo para uma marca de esquadrias em alumínio, com atenção ao produto e aos detalhes.' },
    { slug: 'reffine', title: 'Reffine Acabamentos', file: '03_reffine.mp4', id: 'YMRKqzmHOi4', type: 'Reels', sector: 'Acabamentos', description: 'Edição para a Reffine Acabamentos. Conteúdo para apresentar os produtos e a marca nas redes sociais.' },
    { slug: 'marcenaria-loft', title: 'Marcenaria Loft', file: '04_marcenaria_loft.mp4', id: 'SiXFEjd1HQI', type: 'Institucional', sector: 'Marcenaria', description: 'Um olhar sobre o trabalho da Marcenaria Loft, em uma edição de vídeo institucional.' },
  ];
  const chapters = [
    { slug: 'inicio', title: 'Apresentação', template: 'introTemplate' },
    ...projects.map((project) => ({ ...project, project: true })),
    { slug: 'sobre', title: 'Sobre mim', template: 'aboutTemplate' },
    { slug: 'contato', title: 'Contato', template: 'contactTemplate' },
  ];
  let chapterIndex = 0;
  let player = null;
  let playerReady = false;
  let playerPromise = null;
  let playbackTimer = null;
  let loadTimeout = null;
  let loadGeneration = 0;
  let muted = true;
  let isPlaying = false;
  let toastTimeout = null;

  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  function showToast(message) {
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { $('#toast').hidden = true; }, 3500);
  }
  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    return [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60, 0].map((n) => String(n).padStart(2, '0')).join(':');
  }
  function setPlaybackState(playing) {
    isPlaying = playing;
    $('#playButton').innerHTML = icon(playing ? 'pause' : 'play');
    $('#playButton').setAttribute('aria-label', playing ? 'Pausar vídeo' : chapters[chapterIndex].project ? 'Reproduzir vídeo' : 'Assistir ao primeiro projeto');
  }
  function destroyPlayer() {
    loadGeneration += 1;
    clearInterval(playbackTimer);
    clearTimeout(loadTimeout);
    if (player && typeof player.destroy === 'function') player.destroy();
    player = null;
    playerReady = false;
    $('#seekContainer').hidden = true;
    $('#muteButton').hidden = true;
    setPlaybackState(false);
  }
  function renderInspector(chapter) {
    const project = chapter.project;
    const title = project ? chapter.title : chapterIndex === 6 ? 'Vamos fazer um vídeo?' : 'Ernande Facco';
    const description = project ? chapter.description : chapterIndex === 6 ? 'Me conte sobre o projeto, a ideia e o que você precisa. A conversa começa por aqui.' : 'Editor de vídeo. Um pé no criativo, outro no técnico — e os dois na timeline.';
    $('#inspectorContent').innerHTML = `<div class="inspector-eyebrow">${icon(project ? 'film' : 'pointer')} ${project ? 'CLIPE SELECIONADO' : 'QUEM ESTÁ NA TIMELINE'}</div><h3 class="inspector-title">${title}</h3><p class="inspector-description">${description}</p><div class="property-group"><h3>${project ? 'Informações do clipe' : 'Ficha do editor'}</h3><dl class="properties"><div><dt>${project ? 'Formato' : 'O que eu faço'}</dt><dd>${project ? chapter.type : 'Edição de vídeo'}</dd></div><div><dt>${project ? 'Segmento' : 'Foco'}</dt><dd>${project ? chapter.sector : 'Conteúdo para redes'}</dd></div><div><dt>${project ? 'Minha parte' : 'Na bagagem'}</dt><dd>${project ? 'Edição' : '85+ vídeos'}</dd></div><div><dt>${project ? 'Onde assistir' : 'Já criei para'}</dt><dd>${project ? 'YouTube' : '7+ clientes'}</dd></div></dl></div><div class="property-group"><h3>${project ? 'Neste projeto' : 'Na minha timeline'}</h3><div class="property-tags">${(project ? [chapter.type, chapter.sector, 'Edição'] : ['Reels', 'Institucional', 'Color grading', 'Conteúdo para redes']).map((tag) => `<span>${tag}</span>`).join('')}</div></div><p class="inspector-note">${project ? 'Dê play no monitor para assistir ao trabalho completo.' : 'Gosto de pegar o material bruto e encontrar a história que está ali.'}</p>`;
  }
  function navigate(index, { updateHash = true, announce = true } = {}) {
    chapterIndex = Math.min(chapters.length - 1, Math.max(0, index));
    destroyPlayer();
    const chapter = chapters[chapterIndex];
    const screen = $('#screen');
    if (chapter.project) {
      screen.innerHTML = `<article class="project-poster"><img class="poster-image" src="https://img.youtube.com/vi/${chapter.id}/hqdefault.jpg" alt="Prévia: ${chapter.title}" width="480" height="360"><button class="poster-play" id="posterPlay" aria-label="Assistir a ${chapter.title}"><span class="poster-play-circle">${icon('play')}</span><span>Assistir ao projeto</span></button><div class="poster-caption"><span>${chapter.title}</span><span>${chapter.type}</span></div></article>`;
      $('#posterPlay').addEventListener('click', playCurrent);
    } else {
      screen.replaceChildren(document.getElementById(chapter.template).content.cloneNode(true));
    }
    $('#programName').textContent = chapter.project ? chapter.file : chapter.title.toLowerCase();
    $('#timecode').textContent = '00:00:00:00';
    $('#duration').textContent = `${String(chapterIndex + 1).padStart(2, '0')} / 07`;
    $('#monitorHint').textContent = chapter.project ? chapter.type.toUpperCase() : 'PORTFÓLIO INTERATIVO';
    $('#youtubeLink').hidden = !chapter.project;
    if (chapter.project) $('#youtubeLink').href = `https://www.youtube.com/watch?v=${chapter.id}`;
    $('#selectionLabel').textContent = `${String(chapterIndex + 1).padStart(2, '0')} / 07 — ${chapter.title}`;
    $('#chapterScrubber').value = chapterIndex;
    $('#chapterScrubber').setAttribute('aria-valuetext', chapter.title);
    // Chapters are navigation markers, not invented video durations.
    $('#timelineCanvas').style.setProperty('--head-position', `calc((100% - 14px) * ${chapterIndex / 7} + 1px)`);
    all('[data-chapter]').forEach((element) => {
      const selected = Number(element.dataset.chapter) === chapterIndex;
      element.classList.toggle('active', selected);
      if (selected) element.setAttribute('aria-current', 'page'); else element.removeAttribute('aria-current');
    });
    all('[data-project]').forEach((element) => {
      const selected = Number(element.dataset.project) === chapterIndex - 1;
      element.classList.toggle('selected', selected);
      if (selected) element.setAttribute('aria-current', 'page'); else element.removeAttribute('aria-current');
    });
    all('[data-nav]').forEach((element) => {
      const selected = element.dataset.nav === (chapterIndex === 5 ? 'about' : chapterIndex === 6 ? 'contact' : 'edit');
      element.classList.toggle('active', selected);
      if (selected) element.setAttribute('aria-current', 'page'); else element.removeAttribute('aria-current');
    });
    $('#previousButton').disabled = chapterIndex === 0;
    $('#nextButton').disabled = chapterIndex === chapters.length - 1;
    renderInspector(chapter);
    if (updateHash && location.hash !== `#${chapter.slug}`) history.pushState(null, '', `#${chapter.slug}`);
    if (announce) $('#announcement').textContent = `Capítulo ${chapterIndex + 1} de 7: ${chapter.title}`;
    setPlaybackState(false);
  }
  function loadYouTubeAPI() {
    if (window.YT?.Player) return Promise.resolve();
    if (playerPromise) return playerPromise;
    playerPromise = new Promise((resolve, reject) => {
      const apiScript = document.createElement('script');
      const timeout = setTimeout(() => {
        playerPromise = null;
        apiScript.remove();
        reject(new Error('YouTube API timed out'));
      }, 12000);
      window.onYouTubeIframeAPIReady = () => { clearTimeout(timeout); resolve(); };
      apiScript.src = 'https://www.youtube.com/iframe_api';
      apiScript.onerror = () => {
        clearTimeout(timeout);
        playerPromise = null;
        apiScript.remove();
        reject(new Error('YouTube API unavailable'));
      };
      document.head.appendChild(apiScript);
    });
    return playerPromise;
  }
  function showVideoError(chapter) {
    destroyPlayer();
    $('#screen').innerHTML = `<div class="video-error"><p>Não foi possível carregar o player aqui.</p><a href="https://www.youtube.com/watch?v=${chapter.id}" target="_blank" rel="noopener">Assistir a ${chapter.title} no YouTube ↗</a><button class="text-link" id="retryVideo">Tentar novamente</button></div>`;
    $('#retryVideo').addEventListener('click', playCurrent);
  }
  async function playCurrent() {
    if (!chapters[chapterIndex].project) navigate(1);
    if (playerReady && player) {
      if (isPlaying) player.pauseVideo(); else player.playVideo();
      return;
    }
    if ($('#playerMount')) return;
    const chapter = chapters[chapterIndex];
    const generation = ++loadGeneration;
    $('#screen').innerHTML = '<div class="player-loading" role="status">Abrindo vídeo…</div><div class="player-shell"><div id="playerMount"></div></div>';
    $('#monitorHint').textContent = 'CARREGANDO VÍDEO';
    try {
      await loadYouTubeAPI();
      if (generation !== loadGeneration) return;
      loadTimeout = setTimeout(() => { if (generation === loadGeneration && !playerReady) showVideoError(chapter); }, 15000);
      player = new window.YT.Player('playerMount', {
        videoId: chapter.id,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, origin: location.origin },
        events: {
          onReady(event) {
            if (generation !== loadGeneration) return;
            clearTimeout(loadTimeout);
            playerReady = true;
            if (muted) event.target.mute(); else event.target.unMute();
            event.target.playVideo();
            $('#muteButton').hidden = false;
            updateMute();
            $('#monitorHint').textContent = chapter.type.toUpperCase();
            playbackTimer = setInterval(updatePlayback, 300);
            updatePlayback();
          },
          onStateChange(event) {
            if (generation !== loadGeneration) return;
            setPlaybackState(event.data === window.YT.PlayerState.PLAYING);
            updatePlayback();
          },
          onError() { if (generation === loadGeneration) showVideoError(chapter); },
        },
      });
    } catch {
      if (generation === loadGeneration) showVideoError(chapter);
    }
  }
  function updatePlayback() {
    if (!playerReady || !player) return;
    const duration = player.getDuration();
    const current = player.getCurrentTime();
    $('#timecode').textContent = formatTime(current);
    $('#duration').textContent = formatTime(duration);
    $('#seekContainer').hidden = !duration;
    if (document.activeElement !== $('#videoSeek')) $('#videoSeek').value = duration ? current / duration * 100 : 0;
    $('#videoSeek').setAttribute('aria-valuetext', `${Math.floor(current)} segundos de ${Math.floor(duration)}`);
    muted = player.isMuted();
    updateMute();
  }
  function updateMute() {
    $('#muteButton').innerHTML = icon(muted ? 'mute' : 'volume');
    $('#muteButton').setAttribute('aria-label', muted ? 'Ativar som' : 'Desativar som');
    $('#muteButton').title = muted ? 'Ativar som (M)' : 'Desativar som (M)';
  }
  function toggleMute() {
    if (!playerReady) return;
    muted = !player.isMuted();
    if (muted) player.mute(); else player.unMute();
    updateMute();
  }
  function setExpanded(expanded) {
    $('#monitor').classList.toggle('expanded', expanded);
    document.body.classList.toggle('monitor-expanded', expanded);
    $('#expandButton').setAttribute('aria-label', expanded ? 'Reduzir monitor' : 'Ampliar monitor');
    $('#expandButton').title = expanded ? 'Reduzir monitor (Esc)' : 'Ampliar monitor';
    $('#expandButton').innerHTML = icon(expanded ? 'close' : 'expand');
    // Keep focus within the enlarged monitor while its background is obscured.
    all('.project-panel,.inspector-panel,.timeline-panel,.titlebar,.workspace-bar,.statusbar').forEach((element) => { element.inert = expanded; });
  }
  function selectTab(clients, focus = false) {
    $('#mediaTab').classList.toggle('active', !clients);
    $('#clientsTab').classList.toggle('active', clients);
    $('#mediaTab').setAttribute('aria-selected', String(!clients));
    $('#clientsTab').setAttribute('aria-selected', String(clients));
    $('#mediaTab').tabIndex = clients ? -1 : 0;
    $('#clientsTab').tabIndex = clients ? 0 : -1;
    $('#mediaPanel').hidden = clients;
    $('#clientsPanel').hidden = !clients;
    $('#binCount').textContent = clients ? '7 clientes · 2 destaques' : '4 vídeos · 2 arquivos';
    if (focus) $(clients ? '#clientsTab' : '#mediaTab').focus();
  }
  function fromHash() {
    // Preserve the old site's incoming section links.
    const aliases = { hero: 'inicio', portfolio: 'venda-na-obra', clientes: 'inicio' };
    const hash = location.hash.slice(1);
    const index = chapters.findIndex((chapter) => chapter.slug === (aliases[hash] || hash));
    navigate(index >= 0 ? index : 0, { updateHash: false, announce: false });
    if (hash === 'clientes') selectTab(true);
  }
  function revealChapter() {
    const clip = $(`[data-chapter="${chapterIndex}"]`);
    const scroll = $('#timelineScroll');
    const left = clip.offsetLeft;
    if (left < scroll.scrollLeft || left + clip.offsetWidth > scroll.scrollLeft + scroll.clientWidth) scroll.scrollLeft = Math.max(0, left - 20);
  }
  document.addEventListener('click', async (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      const index = chapters.findIndex((chapter) => `#${chapter.slug}` === link.getAttribute('href'));
      if (index >= 0) {
        event.preventDefault();
        const fromMonitor = $('#screen').contains(link);
        navigate(index);
        revealChapter();
        if (fromMonitor || matchMedia('(max-width: 720px)').matches) {
          $('#monitor').focus({ preventScroll: true });
          $('#monitor').scrollIntoView({ block: 'nearest', behavior: 'auto' });
        }
      }
    }
    if (event.target.closest('.copy-email')) {
      try {
        await navigator.clipboard.writeText('ernande@duck.com');
        showToast('E-mail copiado. Agora é só mandar sua ideia.');
      } catch { showToast('Meu e-mail: ernande@duck.com'); }
    }
  });
  $('#previousButton').addEventListener('click', () => { navigate(chapterIndex - 1); revealChapter(); });
  $('#nextButton').addEventListener('click', () => { navigate(chapterIndex + 1); revealChapter(); });
  $('#playButton').addEventListener('click', playCurrent);
  $('#muteButton').addEventListener('click', toggleMute);
  $('#videoSeek').addEventListener('input', (event) => { if (playerReady) player.seekTo(player.getDuration() * Number(event.target.value) / 100, true); });
  $('#chapterScrubber').addEventListener('input', (event) => { const value = Number(event.target.value); if (value !== chapterIndex) navigate(value, { updateHash: false }); });
  $('#chapterScrubber').addEventListener('change', () => { history.pushState(null, '', `#${chapters[chapterIndex].slug}`); });
  $('#timelineZoom').addEventListener('input', (event) => { $('#timelineCanvas').style.width = `${event.target.value}%`; revealChapter(); });
  $('#expandButton').addEventListener('click', () => setExpanded(!$('#monitor').classList.contains('expanded')));
  $('#mediaTab').addEventListener('click', () => selectTab(false));
  $('#clientsTab').addEventListener('click', () => selectTab(true));
  $('.panel-tabs').addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      selectTab(event.key === 'End' || (event.key !== 'Home' && document.activeElement === $('#mediaTab')), true);
    }
  });
  $('#helpButton').addEventListener('click', () => $('#helpDialog').showModal());
  $('#closeHelp').addEventListener('click', () => $('#helpDialog').close());
  $('#helpDialog').addEventListener('click', (event) => { if (event.target === $('#helpDialog')) { const rect = event.target.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close(); } });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && $('#monitor').classList.contains('expanded')) { setExpanded(false); $('#expandButton').focus(); return; }
    if ($('#helpDialog').open || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      navigate(chapterIndex + (event.key === 'ArrowRight' ? 1 : -1));
      revealChapter();
    } else if (event.code === 'Space' && !event.target.closest('button,a')) {
      event.preventDefault(); playCurrent();
    } else if (event.key.toLowerCase() === 'm') toggleMute();
  });
  window.addEventListener('popstate', () => { fromHash(); revealChapter(); });
  window.addEventListener('hashchange', () => { fromHash(); revealChapter(); });
  // A decorative soundtrack lane, not a visualization of the videos' audio.
  $('#waveform').innerHTML = Array.from({ length: 250 }, (_, i) => `<i style="--amplitude:${15 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * .13)) * 85}%"></i>`).join('');
  all('img').forEach((img) => img.addEventListener('error', () => { img.style.opacity = '0'; }, { once: true }));
  fromHash();
})();
