// All animation, ported from the design prototype (Dobojo Site Vermillion.dc.html).
// Keyed off data-attributes so each page only runs what exists in its DOM.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// exposed for debugging (preview tooling); harmless in production
if (typeof window !== 'undefined') {
  window.__gsap = gsap;
  window.__ST = ScrollTrigger;
}

const motionOK = () => window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  ScrollTrigger.refresh();
  // land a touch deeper than the sticky nav so no trace of the pinned hero
  // animation stays visible above the section
  const calc = () => el.getBoundingClientRect().top + window.scrollY - 30;
  if (motionOK()) {
    const o = { v: window.scrollY };
    gsap.to(o, {
      v: calc(), duration: 1.1, ease: 'power2.inOut',
      onUpdate: () => window.scrollTo(0, o.v),
      onComplete: () => {
        // pinned sections can shift the target while we scroll — correct once
        if (Math.abs(calc() - window.scrollY) > 8) {
          const o2 = { v: window.scrollY };
          gsap.to(o2, { v: calc(), duration: 0.5, ease: 'power2.out', onUpdate: () => window.scrollTo(0, o2.v) });
        }
      },
    });
  } else {
    window.scrollTo({ top: calc(), behavior: 'smooth' });
  }
}

export function initMotion() {
  if (!motionOK()) {
    document.documentElement.classList.add('no-motion');
    return;
  }

  // scroll reveals
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' } }
    );
  });

  // image hover scale
  document.querySelectorAll('img, [data-art]').forEach((el) => {
    if (el.dataset.hoverBound) return;
    el.dataset.hoverBound = '1';
    el.classList.add('hoverable');
    el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.04, duration: 0.45, ease: 'power2.out' }));
    el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, duration: 0.55, ease: 'power2.out' }));
  });

  // ── Start: flower grows, bird flies in, credo fades in; both leave on scroll
  //    and COME BACK when scrolling up again (reversible exit timeline)
  const flower = document.querySelector('[data-flower]');
  const bird = document.querySelector('[data-bird]');
  if (flower || bird) {
    const wing = bird ? bird.querySelector('[data-wing]') : null;
    const idle = [];
    const startIdle = (flowerDelay, birdDelay) => {
      if (flower) idle.push(gsap.to(flower, { rotation: 3.5, transformOrigin: '50% 100%', duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: flowerDelay }));
      if (bird) idle.push(gsap.to(bird, { y: -2, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: birdDelay }));
    };
    const stopIdle = () => idle.splice(0).forEach((t) => t.kill());

    if (flower) gsap.fromTo(flower, { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 1.6, ease: 'elastic.out(1,0.45)', delay: 1.2 });
    if (bird) {
      const btl = gsap.timeline({ delay: 0.5 });
      btl.fromTo(
        bird,
        { x: -Math.min(520, window.innerWidth * 0.4), y: -240, rotation: -14, opacity: 1 },
        { x: -46, y: -26, rotation: -5, duration: 0.85, ease: 'power1.in' },
        0
      ).to(bird, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: 'power3.out' }, 0.85);
      if (wing) {
        btl.fromTo(wing, { rotation: -30 }, { rotation: 25, duration: 0.11, yoyo: true, repeat: 11, transformOrigin: '30% 40%', ease: 'sine.inOut' }, 0)
          .set(wing, { rotation: 0 }, 1.4);
      }
    }
    startIdle(3, 1.9);
    const credo = document.querySelector('[data-credo]');
    if (credo) gsap.fromTo(credo, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 2.1 });

    const exitTargets = [bird, wing, flower].filter(Boolean);
    const exit = gsap.timeline({
      scrollTrigger: { trigger: document.body, start: '6px top', toggleActions: 'play none none reverse' },
      onStart() {
        gsap.killTweensOf(exitTargets);
        stopIdle();
        // settle to resting pose so play captures (and reverse restores) it
        if (bird) gsap.set(bird, { x: 0, y: 0, rotation: 0, opacity: 1 });
        if (flower) gsap.set(flower, { scale: 1, rotation: 0 });
      },
      onReverseComplete() { startIdle(0.5, 0.5); },
    });
    if (bird) {
      exit.to(bird, { x: Math.min(560, window.innerWidth * 0.45), y: -300, rotation: 10, duration: 0.7, ease: 'power2.in' }, 0)
        .to(bird, { opacity: 0, duration: 0.22 }, 0.48);
      if (wing) exit.fromTo(wing, { rotation: -30 }, { rotation: 25, duration: 0.09, yoyo: true, repeat: 8, transformOrigin: '30% 40%', ease: 'sine.inOut', immediateRender: false }, 0);
    }
    if (flower) exit.to(flower, { scale: 0, rotation: 0, transformOrigin: '50% 100%', duration: 0.4, ease: 'back.in(1.4)' }, 0);
  }

  // ── ticker
  const tk = document.querySelector('[data-ticker]');
  if (tk) gsap.to(tk, { xPercent: -50, duration: 30, repeat: -1, ease: 'none' });

  // ── Über mich: pinned stage — intro slides out left, CV panel in from right,
  //    then the vita timeline scrolls horizontally. DESKTOP ONLY — on mobile the
  //    CV renders statically (CSS) as a swipeable card track.
  const mm = gsap.matchMedia();
  const stage = document.querySelector('[data-about-stage]');
  const intro = document.querySelector('[data-about-intro]');
  const cv = document.querySelector('[data-cv]');
  const cvTrack = document.querySelector('[data-cv-track]');
  if (stage && intro && cv && cvTrack) {
    mm.add('(min-width: 761px)', () => {
      const dist = () => Math.max(0, cvTrack.scrollWidth - stage.clientWidth);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage, start: 'top 90px', end: () => '+=' + (dist() + 1300),
          scrub: 0.5, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
      tl.to(intro, { x: '-55vw', autoAlpha: 0, ease: 'power1.inOut', duration: 0.6 }, 0);
      tl.fromTo(cv, { x: '80vw', autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'power1.inOut', duration: 0.6 }, 0.12);
      tl.to(cvTrack, { x: () => -dist(), ease: 'none', duration: 1.6 }, 0.85);
    });
  }

  // ── Werke: tree birds peek out; the cat scares them off on scroll — and the
  //    whole scene REVERSES when scrolling back up (birds return, cat leaves)
  const scene = document.querySelector('[data-tree-scene]');
  if (scene) {
    const tbirds = scene.querySelectorAll('[data-tree-bird]');
    const cat = document.querySelector('[data-cat]');
    const treeSvg = scene.querySelector('[data-tree]');
    const bob = [];
    const startBob = (delay) => {
      tbirds.forEach((b, i) => bob.push(gsap.to(b, { y: -4, duration: 1.6 + (i % 3) * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: delay + i * 0.3 })));
    };
    const stopBob = () => bob.splice(0).forEach((t) => t.kill());
    tbirds.forEach((b, i) => {
      gsap.fromTo(b, { opacity: 0, scale: 0, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(2)', delay: 0.8 + i * 0.22, transformOrigin: '50% 100%' });
    });
    startBob(1.6);
    if (cat) gsap.set(cat, { x: 300, opacity: 0 });

    const scare = gsap.timeline({
      scrollTrigger: { trigger: '[data-werke-hero]', start: '20px top', toggleActions: 'play none none reverse' },
      onStart() {
        gsap.killTweensOf(tbirds);
        stopBob();
        gsap.set(tbirds, { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0 });
      },
      onReverseComplete() { startBob(0.3); },
    });
    if (cat) {
      scare.to(cat, { x: 0, opacity: 1, duration: 1.2, ease: 'power2.out' }, 0);
      scare.to(cat, { y: -3, duration: 0.16, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 0);
    }
    if (treeSvg) scare.fromTo(treeSvg, { rotation: 0 }, { rotation: 1.4, transformOrigin: '50% 100%', duration: 0.09, yoyo: true, repeat: 7, immediateRender: false }, 0.55);
    tbirds.forEach((b, i) => {
      const dir = i % 2 ? 1 : -1;
      scare.to(b, { x: -(140 + i * 60) + dir * 20, y: -(150 + i * 55), rotation: dir * -8, duration: 1.5, ease: 'power1.out' }, 0.62 + i * 0.1);
      scare.to(b.querySelectorAll('path'), { scaleY: 0.35, transformOrigin: '50% 100%', duration: 0.09, yoyo: true, repeat: 14, ease: 'sine.inOut' }, 0.62 + i * 0.1);
      scare.to(b, { opacity: 0, duration: 0.45 }, 1.7 + i * 0.1);
    });
  }

  // ── Werke: orbit rotation + pinned hero blur-out into the gallery
  const orb = document.querySelector('[data-orbit]');
  if (orb) {
    const items = orb.querySelectorAll('[data-orbit-item]');
    gsap.to(orb, { rotation: 360, duration: 36, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
    gsap.to(items, { rotation: -360, duration: 36, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
  }
  // Pinned hero blur-out — DESKTOP ONLY; on mobile the hero flows normally and
  // the galleries follow directly (no 50vh gap, no pin).
  const hero = document.querySelector('[data-werke-hero]');
  const wrap = document.querySelector('[data-orbit-wrap]');
  if (hero && wrap) {
    mm.add('(min-width: 761px)', () => {
      const fades = hero.querySelectorAll('[data-hero-fade]');
      const sm = document.getElementById('sec-malerei');
      if (sm) gsap.set(sm, { marginTop: '50vh' });
      gsap.timeline({
        scrollTrigger: {
          trigger: hero, start: 'top top',
          end: () => '+=' + Math.round(hero.offsetHeight + window.innerHeight * 0.38),
          scrub: 0.5, pin: true, pinSpacing: false, anticipatePin: 1, invalidateOnRefresh: true,
        },
      })
        .to(fades, { opacity: 0, y: -36, duration: 0.35, ease: 'power1.in', stagger: 0.03 }, 0)
        .to(wrap, { scale: 3.1, duration: 1, ease: 'power1.in' }, 0)
        .to(wrap, { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0.7);
    });
  }

  // subtle parallax on gallery artworks
  document.querySelectorAll('.gallery-grid [data-art]').forEach((el, i) => {
    gsap.to(el, {
      yPercent: -(4 + (i % 3) * 4), ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

export function setupNavigation() {
  // same-page smooth anchors (Werke jump chips)
  document.querySelectorAll('[data-scroll-to]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToId(el.getAttribute('data-scroll-to'));
    });
  });
  // arriving with a #hash (e.g. from the Start page cards): wait for the pinned
  // hero to initialise, then glide to the section — mirrors the prototype.
  if (location.hash) {
    const id = location.hash.slice(1);
    if (document.getElementById(id)) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
      setTimeout(() => scrollToId(id), 500);
    }
  }
}

export function refreshTriggers() {
  ScrollTrigger.refresh();
}
