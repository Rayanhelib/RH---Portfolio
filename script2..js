document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------
     1. Active nav link highlighting on scroll
     --------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link-custom[data-section]');

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.section === id);
    });
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(function (section) {
    observer.observe(section);
  });

  /* ---------------------------------------------------------
     2. Hover-to-play preview videos in the portfolio grid
     --------------------------------------------------------- */
  document.querySelectorAll('.hover-video').forEach(function (video) {
    const card = video.closest('.media-card-simple');
    if (!card) return;

    video.muted = true;
    video.playsInline = true;
    video.load();
    video.play().catch(function () { /* autoplay may be blocked, ignore */ });

    card.addEventListener('mouseenter', function () {
      video.play().catch(function () { /* autoplay may be blocked, ignore */ });
    });
    card.addEventListener('mouseleave', function () {
      video.pause();
    });
  });

  /* ---------------------------------------------------------
     3. Media lightbox modal (images + videos)
     --------------------------------------------------------- */
  const mediaModalEl = document.getElementById('mediaModal');
  const modalImage = document.getElementById('modalImage');
  const modalVideo = document.getElementById('modalVideo');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.querySelector('#mediaModal .btn-close-custom');

  function openMediaModal(type, src, title) {
    modalTitle.textContent = title || '';

    if (type === 'video') {
      modalVideo.src = src;
      modalVideo.classList.remove('d-none');
      modalImage.classList.add('d-none');
      modalImage.src = '';
      modalVideo.muted = true;
      modalVideo.playsInline = true;
      modalVideo.controls = true;
      modalVideo.autoplay = true;
      modalVideo.setAttribute('muted', '');
      modalVideo.setAttribute('playsinline', '');
      modalVideo.load();
      modalVideo.play().catch(function () { /* ignore */ });
    } else {
      modalImage.src = src;
      modalImage.alt = title || '';
      modalImage.classList.remove('d-none');
      modalVideo.classList.add('d-none');
      modalVideo.pause();
      modalVideo.src = '';
    }

    mediaModalEl.classList.add('show');
    mediaModalEl.removeAttribute('aria-hidden');
    document.body.classList.add('modal-open');
  }

  function closeMediaModal() {
    modalVideo.pause();
    modalVideo.src = '';
    modalImage.src = '';
    mediaModalEl.classList.remove('show');
    mediaModalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('[data-type]').forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      // If the click originated from an inner control (e.g. a remove button), skip opening the modal
      if (event.target.closest('[data-action]')) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const type = trigger.getAttribute('data-type');
      const src = trigger.getAttribute('data-src');
      const title = trigger.getAttribute('data-title');

      if (!type || !src) return;
      openMediaModal(type, src, title);
    });
  });

  // Delegated handler for in-card actions (safe removal of project items)
  document.body.addEventListener('click', function (event) {
    const act = event.target.closest('[data-action]');
    if (!act) return;

    const action = act.getAttribute('data-action');
    if (action === 'remove') {
      // prevent modal open and any other handlers
      event.stopPropagation();
      event.preventDefault();

      // find the nearest card to remove
      const card = act.closest('.media-card, .media-card-simple, .portfolio-item, .col-md-6');
      if (!card) return;

      // pause any video inside the card to avoid playback errors
      const vid = card.querySelector('video');
      if (vid) {
        try { vid.pause(); } catch (e) { /* ignore */ }
        // clear src to free resources
        try { vid.removeAttribute('src'); vid.load && vid.load(); } catch (e) { /* ignore */ }
      }

      // If the media modal is showing the same src, close it
      if (modalVideo && modalVideo.src) {
        const src = card.querySelector('[data-src]')?.getAttribute('data-src') || card.querySelector('video')?.getAttribute('src');
        if (src && modalVideo.src && modalVideo.src.includes(src)) {
          closeMediaModal();
        }
      }

      // remove the card element from DOM
      card.remove();
    }
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeMediaModal);
  }

  mediaModalEl.addEventListener('click', function (event) {
    if (event.target === mediaModalEl) {
      closeMediaModal();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMediaModal();
    }
  });

});
