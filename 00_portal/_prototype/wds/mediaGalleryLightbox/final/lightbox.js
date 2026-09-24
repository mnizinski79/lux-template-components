/* ─────────────────────────────────────────────────────────────────────────────
   WDS MediaGalleryLightbox (Gen2) — shared prototype behavior
   Image-to-image change and swipe follow the review-animations pass adopted
   Sep 24 (marked "review-animations"). IconButton behavior is Ryan's
   primitive and intentionally not animated beyond its color states.

   const lb = WDSLightbox.create({ items, transition: 'drift' });
   lb.open(index, triggerEl);
   lb.setTransition('slide');   // explorer only
   lb.setSpeed(0.25);           // explorer only: 0.25 = 4x slower, for feel checks

   items: [{ src, alt, caption }]

   Image-to-image transitions run on the Web Animations API so every one of
   them can be interrupted mid-flight: the in-progress layer's current values
   are committed to inline style, then it animates out from exactly there.
   Rapid clicks never restart from zero and never queue up.
   ───────────────────────────────────────────────────────────────────────────── */

(function () {
  const EASE = {
    out: 'cubic-bezier(0.23, 1, 0.32, 1)',
    inOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
    drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
  };

  const CLOSE_MS = 260; // matches --lb-close-duration

  /* Each transition returns animations for the incoming layer and the
     outgoing layer. dir = +1 for next, -1 for previous. w = travel width.
     Outgoing keyframes are "to" only, so they start from wherever the layer
     currently is (settled, mid-transition, or mid-drag). */
  const TRANSITIONS = {
    cut: {
      label: 'Cut',
      incoming: () => [],
      outgoing: () => [],
    },

    crossfade: {
      label: 'Crossfade',
      incoming: () => [
        { target: 'layer', kf: [{ opacity: 0 }, { opacity: 1 }], ms: 240, ease: EASE.out },
      ],
      outgoing: () => [
        { target: 'layer', kf: [{ opacity: 0 }], ms: 240, ease: EASE.out },
      ],
    },

    // Timing is Francisco's 450/300 (the skill recommends 250/180; tried and
    // felt too fast). The 2px blur while the images overlap is from the
    // review-animations pass, so they read as one change, not two.
    drift: {
      label: 'Directional drift',
      incoming: (dir) => [
        {
          target: 'layer',
          kf: [
            { opacity: 0, transform: `translateX(${dir * 32}px)`, filter: 'blur(2px)' },
            { opacity: 1, transform: 'translateX(0)', filter: 'blur(0px)' },
          ],
          ms: 450, ease: EASE.out,
        },
      ],
      outgoing: (dir) => [
        {
          target: 'layer',
          kf: [{ opacity: 0, transform: `translateX(${-dir * 32}px)`, filter: 'blur(2px)' }],
          ms: 300, ease: EASE.out,
        },
      ],
    },

    slide: {
      label: 'Slide',
      incoming: (dir, w) => [
        {
          target: 'layer',
          kf: [{ transform: `translateX(${dir * w}px)` }, { transform: 'translateX(0)' }],
          ms: 420, ease: EASE.drawer,
        },
      ],
      outgoing: (dir, w) => [
        { target: 'layer', kf: [{ transform: `translateX(${-dir * w}px)` }], ms: 420, ease: EASE.drawer },
      ],
    },

    zoom: {
      label: 'Depth',
      incoming: () => [
        {
          target: 'layer',
          kf: [
            { opacity: 0, transform: 'scale(1.04)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          ms: 320, ease: EASE.out,
        },
      ],
      outgoing: () => [
        { target: 'layer', kf: [{ opacity: 0, transform: 'scale(0.97)' }], ms: 200, ease: EASE.out },
      ],
    },

    wipe: {
      label: 'Editorial wipe',
      incoming: (dir) => [
        {
          target: 'img',
          kf: [
            { clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', transform: 'scale(1.06)' },
            { clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' },
          ],
          ms: 560, ease: EASE.drawer,
        },
      ],
      outgoing: () => [
        { target: 'layer', kf: [{ opacity: 0 }], ms: 320, delay: 240, ease: EASE.out },
      ],
    },
  };

  const ICONS = {
    // Masks over the Figma-exported Phosphor Light glyphs (see lightbox.css)
    close: '<span class="lb__icon lb__icon--close" aria-hidden="true"></span>',
    prev: '<span class="lb__icon lb__icon--prev" aria-hidden="true"></span>',
    next: '<span class="lb__icon lb__icon--next" aria-hidden="true"></span>',
  };

  function create(opts) {
    const items = opts.items;
    let transition = TRANSITIONS[opts.transition] ? opts.transition : 'drift';
    let speed = 1;
    let index = 0;
    let trigger = null;
    let current = null;   // the settled / incoming layer
    let navSeq = 0;
    const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ── DOM ──
    const root = document.createElement('div');
    root.className = 'lb';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `
      <div class="lb__scrim"></div>
      <div class="lb__content" role="dialog" aria-modal="true" aria-label="Media gallery">
        <div class="lb__header">
          <div class="lb__counter" aria-live="polite"></div>
          <button class="lb__btn lb__close" type="button" aria-label="Close">${ICONS.close}</button>
        </div>
        <div class="lb__media">
          <div class="lb__arrow-slot"><button class="lb__btn lb__arrow lb__arrow--prev" type="button" aria-label="Previous image">${ICONS.prev}</button></div>
          <div class="lb__stage"></div>
          <div class="lb__arrow-slot"><button class="lb__btn lb__arrow lb__arrow--next" type="button" aria-label="Next image">${ICONS.next}</button></div>
        </div>
        <p class="lb__caption"></p>
      </div>`;
    document.body.appendChild(root);

    const $ = (s) => root.querySelector(s);
    const content = $('.lb__content');
    const stage = $('.lb__stage');
    const counter = $('.lb__counter');
    const caption = $('.lb__caption');
    const btnClose = $('.lb__close');
    const btnPrev = $('.lb__arrow--prev');
    const btnNext = $('.lb__arrow--next');

    // Warm the cache so decode() on navigation is effectively instant.
    items.forEach((it) => { const i = new Image(); i.src = it.src; });

    const wrap = (i) => (i + items.length) % items.length;
    const travelWidth = () => root.clientWidth;
    const reduced = () => reduceMQ.matches;

    function makeLayer(i) {
      const layer = document.createElement('div');
      layer.className = 'lb__layer';
      const img = document.createElement('img');
      img.className = 'lb__img';
      img.src = items[i].src;
      img.alt = items[i].alt || items[i].caption || '';
      img.draggable = false;
      layer.appendChild(img);
      layer._img = img;
      layer._anims = [];
      return layer;
    }

    // Freeze a layer at whatever it's showing right now, animations included.
    function freeze(layer) {
      layer._anims.forEach((a) => {
        try { a.commitStyles(); } catch (e) { /* element detached */ }
        a.cancel();
      });
      layer._anims = [];
    }

    function play(layer, specs) {
      const anims = specs.map((s) => {
        const el = s.target === 'img' ? layer._img : layer;
        return el.animate(s.kf, {
          duration: s.ms / speed,
          delay: (s.delay || 0) / speed,
          easing: s.ease,
          fill: 'both',
        });
      });
      layer._anims.push(...anims);
      return Promise.all(anims.map((a) => a.finished.catch(() => {})));
    }

    function retire(layer, specs) {
      layer.classList.add('is-leaving');
      layer.setAttribute('aria-hidden', 'true');
      if (!specs.length) { layer.remove(); return; }
      play(layer, specs).then(() => layer.remove());
      // Never let more than one layer linger behind the incoming one.
      stage.querySelectorAll('.lb__layer.is-leaving').forEach((l) => { if (l !== layer) l.remove(); });
    }

    // Height the caption will have once it holds `text`, measured off-screen
    // at the caption's current width.
    function measureCaption(text) {
      const probe = caption.cloneNode(false);
      probe.textContent = text;
      probe.removeAttribute('id');
      probe.setAttribute('aria-hidden', 'true');
      Object.assign(probe.style, {
        position: 'absolute', visibility: 'hidden', left: '0', top: '0',
        height: 'auto', boxSizing: 'border-box', margin: '0',
        width: caption.getBoundingClientRect().width + 'px',
      });
      caption.parentNode.appendChild(probe);
      const h = probe.getBoundingClientRect().height;
      probe.remove();
      return h;
    }

    // Everything already on the stage keeps the stage height it was laid out
    // in, so a caption that changes line count can't re-center it.
    function pinLayers(except) {
      const h = stage.getBoundingClientRect().height;
      stage.querySelectorAll('.lb__layer').forEach((l) => {
        if (l === except) return;
        l.style.bottom = 'auto';
        l.style.height = h + 'px';
      });
    }

    function renderMeta(animate) {
      const item = items[index];
      const text = item.caption || '';
      counter.textContent = `${index + 1}/${items.length}`;
      caption.getAnimations().forEach((a) => a.cancel());
      if (!animate) {
        caption.style.height = '';
        caption.textContent = text;
        return;
      }
      // Reserve the new caption's height right away so the media area settles
      // to its final size before the incoming image starts moving. The old
      // text dips out inside that box, then the new text fades in.
      caption.style.height = measureCaption(text) + 'px';
      const out = caption.animate([{ opacity: 0 }], { duration: 150 / speed, easing: EASE.out, fill: 'forwards' });
      out.finished.then(() => {
        caption.textContent = text;
        caption.style.height = '';
        out.cancel();
        caption.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 / speed, easing: EASE.out });
      }).catch(() => {});
    }

    function mountInstant(i) {
      stage.innerHTML = '';
      current = makeLayer(i);
      stage.appendChild(current);
    }

    // ── Navigation ──
    async function go(dir, opts = {}) {
      const seq = ++navSeq;
      const name = opts.instant ? 'cut' : (reduced() ? 'crossfade' : transition);
      const t = TRANSITIONS[name];
      const w = travelWidth();

      index = wrap(index + dir);
      const incoming = opts.incoming || makeLayer(index);
      if (!incoming.isConnected) stage.appendChild(incoming);

      // Hide until decoded so a half-painted image never animates in.
      if (!opts.incoming) {
        incoming.style.opacity = '0';
        await incoming._img.decode().catch(() => {});
        if (seq !== navSeq) { incoming.remove(); return; }
        incoming.style.opacity = '';
      }

      // Settle layout before anything animates: pin what's on screen, then let
      // the caption take its new height. An incoming layer that's already
      // visible (the slide peek) gets its vertical shift eased out instead.
      const before = opts.incoming ? incoming._img.getBoundingClientRect() : null;
      pinLayers(incoming);
      renderMeta(name !== 'cut');
      if (before) {
        const dy = before.top - incoming._img.getBoundingClientRect().top;
        const ms = opts.incomingSpecs ? opts.incomingSpecs[0].ms : 300;
        if (Math.abs(dy) > 0.5) incoming.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], { duration: ms / speed, easing: EASE.drawer });
      }

      const outgoing = opts.outgoing || current;
      if (outgoing && outgoing !== incoming) {
        freeze(outgoing);
        retire(outgoing, reduced() ? [{ target: 'layer', kf: [{ opacity: 0 }], ms: 150, ease: EASE.out }] : t.outgoing(dir, w));
      }

      current = incoming;

      if (opts.incomingSpecs) {
        play(incoming, opts.incomingSpecs);
      } else if (reduced()) {
        play(incoming, [{ target: 'layer', kf: [{ opacity: 0 }, { opacity: 1 }], ms: 150, ease: EASE.out }]);
      } else {
        play(incoming, t.incoming(dir, w));
      }
    }

    const next = (o) => go(1, o);
    const prev = (o) => go(-1, o);

    // ── Swipe / drag (touch, pen, and mouse so it works inside the portal) ──
    let drag = null;
    let suppressClick = false;

    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      // review-animations: ignore extra fingers once a gesture is under way.
      if (!e.isPrimary || (drag && drag.active)) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, active: false, samples: [], peek: null, peekDir: 0 };
    });

    stage.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;

      if (!drag.active) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        drag.active = true;
        try { stage.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
        // review-animations: grab the image exactly where it is, even
        // mid-transition, and let anything already leaving finish on its own.
        navSeq++;
        freeze(current);
        const cs = getComputedStyle(current);
        drag.baseX = cs.transform && cs.transform !== 'none' ? new DOMMatrixReadOnly(cs.transform).m41 : 0;
        drag.baseO = parseFloat(cs.opacity) || 1;
        drag.startDx = dx;
        current.style.transform = `translateX(${drag.baseX}px)`;
        current.style.filter = '';
        current._img.style.clipPath = '';
        current._img.style.transform = '';
      }

      drag.dx = dx;
      // Follow the finger from the moment the drag starts (no 8px catch-up).
      const x = drag.baseX + (dx - drag.startDx);
      drag.x = x;
      drag.samples.push({ x: e.clientX, t: e.timeStamp });
      if (drag.samples.length > 6) drag.samples.shift();

      const w = travelWidth();
      if (transition === 'slide' && !reduced()) {
        // Carousel model: the neighbor rides in alongside the finger.
        const dir = dx < 0 ? 1 : -1;
        if (drag.peekDir !== dir) {
          if (drag.peek) drag.peek.remove();
          drag.peek = makeLayer(wrap(index + dir));
          drag.peekDir = dir;
          stage.appendChild(drag.peek);
        }
        current.style.transform = `translateX(${x}px)`;
        drag.peek.style.transform = `translateX(${x + dir * w}px)`;
      } else {
        // Everything else: the image follows the finger and dims as it goes.
        current.style.transform = `translateX(${x}px)`;
        current.style.opacity = String(drag.baseO * (1 - Math.min(Math.abs(x) / w, 1) * 0.6));
      }
    });

    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      if (!d.active) return;
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);

      const w = travelWidth();
      const s = d.samples;
      // px/ms over the last few moves; a finger that has been still for 100ms
      // before lifting isn't flicking, so speed counts as zero.
      const still = s.length && e.timeStamp - s[s.length - 1].t > 100;
      const v = s.length > 1 && !still ? (s[s.length - 1].x - s[0].x) / Math.max(s[s.length - 1].t - s[0].t, 1) : 0;
      // review-animations: a light flick is enough (0.4 → 0.11 px/ms).
      const flick = Math.abs(v) > 0.11 && Math.sign(v) === Math.sign(d.dx);
      const commit = Math.abs(d.dx) > w * 0.2 || flick;
      const dir = d.dx < 0 ? 1 : -1;

      if (!commit) {
        // Settle back where it came from.
        const back = [{ target: 'layer', kf: [{ transform: 'translateX(0)', opacity: 1 }], ms: 300, ease: EASE.drawer }];
        const layer = current;
        play(layer, back).then(() => { freeze(layer); layer.style.transform = ''; layer.style.opacity = ''; });
        if (d.peek) {
          const peek = d.peek;
          play(peek, [{ target: 'layer', kf: [{ transform: `translateX(${d.peekDir * w}px)` }], ms: 300, ease: EASE.drawer }]).then(() => peek.remove());
        }
        return;
      }

      if (d.peek) {
        // Slide: both layers continue from where the finger left them.
        // A faster flick finishes faster.
        const remaining = w - Math.abs(d.dx);
        const ms = Math.max(220, Math.min(420, remaining / Math.max(Math.abs(v), 1.2)));
        go(dir, {
          incoming: d.peek,
          incomingSpecs: [{ target: 'layer', kf: [{ transform: 'translateX(0)' }], ms, ease: EASE.drawer }],
        });
        // go() retires the old layer with the transition's own outgoing spec;
        // override timing to match the finger-driven duration.
        const old = stage.querySelector('.lb__layer.is-leaving');
        if (old) {
          freeze(old);
          play(old, [{ target: 'layer', kf: [{ transform: `translateX(${-dir * w}px)` }], ms, ease: EASE.drawer }]).then(() => old.remove());
        }
        return;
      }

      // Non-slide: the dragged image keeps going the way it was thrown and
      // fades, then the incoming image uses the variant's own entrance.
      // review-animations: distance and duration come from release speed, and
      // the drawer curve's opening slope (~2.25x average) matches the finger,
      // so a hard flick leaves fast and a slow release eases out.
      const old = current;
      freeze(old);
      const speed = Math.max(Math.abs(v), 0.2);
      const travel = Math.min(200, Math.max(60, speed * 110));
      const exitMs = Math.min(300, Math.max(160, (2.25 * travel) / speed));
      play(old, [{ target: 'layer', kf: [{ transform: `translateX(${(d.x || 0) - dir * travel}px)`, opacity: 0 }], ms: exitMs, ease: EASE.drawer }])
        .then(() => old.remove());
      old.classList.add('is-leaving');
      current = null;
      go(dir, { outgoing: null });
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    // ── Open / close ──
    let closeTimer = null;

    function open(i, triggerEl) {
      clearTimeout(closeTimer);
      index = wrap(i);
      trigger = triggerEl || null;
      mountInstant(index);
      renderMeta(false);
      root.classList.remove('is-closing');
      root.classList.add('is-open');
      root.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey);
      btnClose.focus({ preventScroll: true });
    }

    function close() {
      if (!root.classList.contains('is-open')) return;
      root.classList.remove('is-open');
      root.classList.add('is-closing');
      root.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      closeTimer = setTimeout(() => root.classList.remove('is-closing'), CLOSE_MS);
      if (trigger) trigger.focus({ preventScroll: true });
    }

    function focusables() {
      return [btnClose, btnPrev, btnNext].filter((b) => b.offsetParent !== null);
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      // review-animations: keyboard-initiated navigation never animates,
      // single press or held.
      else if (e.key === 'ArrowRight') { e.preventDefault(); next({ instant: true }); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev({ instant: true }); }
      else if (e.key === 'Tab') {
        const f = focusables();
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', () => prev());
    btnNext.addEventListener('click', () => next());

    // Mobile has no arrows, so the media area itself is the control: tap the
    // left half for previous, the right half for next (alongside swipe).
    const tapZonesActive = () => btnPrev.offsetParent === null;

    // Click outside the media (scrim, letterbox space) dismisses.
    content.addEventListener('click', (e) => {
      if (suppressClick) return;
      if (e.target.closest('button, .lb__caption, .lb__counter')) return;
      if (tapZonesActive() && stage.contains(e.target)) {
        const r = stage.getBoundingClientRect();
        if (e.clientX < r.left + r.width / 2) prev(); else next();
        return;
      }
      if (current) {
        const r = current._img.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) return;
      }
      close();
    });

    return {
      open,
      close,
      next,
      prev,
      setTransition(name) { if (TRANSITIONS[name]) transition = name; },
      setSpeed(s) { speed = s; },
      get transition() { return transition; },
    };
  }

  window.WDSLightbox = { create, TRANSITIONS };
})();
