/* ========================================
   ERNANDE — Editor de Vídeo
   Interactivity & Animations
   ======================================== */

(function () {
  'use strict';

  // Wait for DOM + GSAP
  function boot() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return setTimeout(boot, 50);
    }
    gsap.registerPlugin(ScrollTrigger);
    initNav();
    initHeroAnim();
    initScrollReveals();
    initVideoModal();
    initCounters();
    initSmoothAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ===== NAVIGATION ===== */
  function initNav() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('navBurger');
    const mmenu = document.getElementById('mmenu');
    const mlinks = mmenu.querySelectorAll('.mmenu__link');
    let lastY = 0;

    // Hide on scroll down
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 120 && y > lastY) nav.classList.add('nav--up');
      else nav.classList.remove('nav--up');
      lastY = y;
    }, { passive: true });

    // Mobile menu
    burger.addEventListener('click', () => {
      const isOpen = mmenu.classList.toggle('open');
      burger.classList.toggle('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mlinks.forEach(l => l.addEventListener('click', () => {
      mmenu.classList.remove('open');
      burger.classList.remove('active');
      document.body.style.overflow = '';
    }));
  }

  /* ===== HERO ANIMATION ===== */
  function initHeroAnim() {
    const tl = gsap.timeline({ delay: 0.2 });
    const chars = document.querySelectorAll('.hero__char');
    const reveals = document.querySelectorAll('.hero [data-reveal]');

    if (chars.length) {
      tl.from(chars, {
        yPercent: 110,
        duration: 1,
        stagger: 0.04,
        ease: 'power4.out'
      });
    }

    if (reveals.length) {
      tl.from(reveals, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out'
      }, '-=0.5');
    }

    const scrollCue = document.querySelector('.hero__scroll');
    if (scrollCue) {
      tl.from(scrollCue, {
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      }, '-=0.3');
    }

    // Parallax mesh orbs on scroll
    gsap.to('.hero__mesh-orb--red', {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
      y: -120,
      x: -40,
      ease: 'none'
    });
    gsap.to('.hero__mesh-orb--green', {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
      y: -80,
      x: 30,
      ease: 'none'
    });
  }

  /* ===== SCROLL REVEALS ===== */
  function initScrollReveals() {
    // Section headers
    document.querySelectorAll('.section [data-reveal]').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: 'power3.out'
      });
    });

    // Reel cards — stagger
    const reelCards = document.querySelectorAll('.reel__card');
    if (reelCards.length) {
      gsap.from(reelCards, {
        scrollTrigger: {
          trigger: '.reel',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        scale: 0.96,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }

    // Client rows — stagger
    const clientItems = document.querySelectorAll('.clients__item');
    if (clientItems.length) {
      gsap.from(clientItems, {
        scrollTrigger: {
          trigger: '.clients',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 20, /* Changed from x: -30 to avoid horizontal overflow issues on mobile */
        duration: 0.6,
        stagger: 0.06,
        ease: 'power3.out'
      });
    }

    // About metrics
    const metrics = document.querySelectorAll('.about__metric');
    if (metrics.length) {
      gsap.from(metrics, {
        scrollTrigger: {
          trigger: '.about__metrics',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }

    // CTA block
    const ctaBlock = document.querySelector('.cta-block');
    if (ctaBlock) {
      gsap.from(ctaBlock, {
        scrollTrigger: {
          trigger: ctaBlock,
          start: 'top 95%', /* Triggers sooner so it doesn't stay hidden at bottom */
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 40,
        scale: 0.97,
        duration: 1,
        ease: 'power3.out'
      });
    }
  }

  /* ===== VIDEO MODAL ===== */
  function initVideoModal() {
    const modal = document.getElementById('videoModal');
    const frame = document.getElementById('modalFrame');
    const close = document.getElementById('modalClose');
    const backdrop = document.getElementById('modalBackdrop');

    function open(id) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      frame.innerHTML = '';
      frame.appendChild(iframe);
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function shut() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { frame.innerHTML = ''; }, 450);
    }

    document.querySelectorAll('[data-video-id]').forEach(card => {
      card.addEventListener('click', () => open(card.dataset.videoId));
    });

    close.addEventListener('click', shut);
    backdrop.addEventListener('click', shut);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
  }

  /* ===== COUNTER ANIMATION ===== */
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            innerText: target,
            duration: 1.6,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate() {
              el.textContent = Math.round(parseFloat(el.textContent));
            }
          });
        }
      });
    });
  }

  /* ===== SMOOTH ANCHORS ===== */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
      });
    });
  }
})();
