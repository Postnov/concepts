// Zarina del Mar — моушн концепта. Идея «три плоскости»: вокруг портрета вращаются три орбиты (3D-тренировки),
// по каждой бежит точка. Орбиты рисуются на двух canvas: задняя половина — под фото, передняя — над ним.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- Орбиты: три кольца в трёх плоскостях, проекция с перспективой ---------- */
  function createGyro(stage, opts = {}) {
    const back = $('.orbit__back', stage), front = $('.orbit__front', stage);
    const bctx = back.getContext('2d'), fctx = front.getContext('2d');
    const o = { radius: 0.365, persp: 6, pitch: -0.42, roll: 0.2, yaw: 0.7, spin: 0.28, ...opts };
    const st = { t: 1.2, reveal: 1, tilt: 0 };
    const rings = [
      { axis: 'xz', k: 1.02, speed: 0.62, phase: 0.2, color: [240, 101, 26], w: 1.8 },
      { axis: 'yz', k: 0.94, speed: -0.5, phase: 2.3, color: [27, 20, 16], w: 1.3 },
      { axis: 'xy', k: 1.1, speed: 0.78, phase: 4.1, color: [154, 74, 36], w: 1.2, dash: [2, 5] },
    ];
    let W = 0, H = 0, dpr = 1, active = true;

    function resize() {
      const r = stage.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      for (const c of [back, front]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      if (!W) return;
      bctx.clearRect(0, 0, W, H); fctx.clearRect(0, 0, W, H);
      const t = st.t;
      const yaw = o.yaw + t * o.spin + st.tilt + (window.scrollY || 0) * 0.0032;
      const pitch = o.pitch + Math.sin(t * 0.42) * 0.07;
      const roll = o.roll;
      const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
      const R = Math.min(W, H) * o.radius * (0.55 + 0.45 * st.reveal);
      const P = o.persp, cx = W / 2, cy = H / 2;
      const proj = (x, y, z, k) => {
        x *= k; y *= k; z *= k;
        const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw;
        const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        const x3 = x1 * cr - y2 * sr, y3 = x1 * sr + y2 * cr;
        const s = P / (P - z2);
        return { x: cx + x3 * R * s, y: cy - y3 * R * s, z: z2, s };
      };
      const pt = (axis, a, k) => {
        const c = Math.cos(a), s = Math.sin(a);
        return axis === 'xz' ? proj(c, 0, s, k) : axis === 'yz' ? proj(0, c, s, k) : proj(c, s, 0, k);
      };
      const depthAlpha = z => (0.2 + 0.8 * Math.min(1, Math.max(0, (z + 1.1) / 2.2))) * st.reveal;

      const N = 120;
      for (const ring of rings) {
        const [r, g, b] = ring.color;
        let prev = pt(ring.axis, 0, ring.k);
        for (let i = 1; i <= N; i++) {
          const cur = pt(ring.axis, (i / N) * Math.PI * 2, ring.k);
          const zm = (prev.z + cur.z) / 2;
          const ctx = zm >= 0 ? fctx : bctx;
          ctx.strokeStyle = `rgba(${r},${g},${b},${depthAlpha(zm).toFixed(3)})`;
          ctx.lineWidth = ring.w * (0.8 + 0.3 * (prev.s + cur.s - 1.7));
          ctx.setLineDash(ring.dash || []);
          ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(cur.x, cur.y); ctx.stroke();
          prev = cur;
        }
        ctx_reset(bctx); ctx_reset(fctx);
        // точка с хвостом
        const a0 = ring.phase + t * ring.speed;
        const dir = Math.sign(ring.speed);
        let tp = pt(ring.axis, a0, ring.k);
        for (let j = 1; j <= 26; j++) {
          const cur = pt(ring.axis, a0 - dir * j * 0.045, ring.k);
          const ctx = (tp.z + cur.z) / 2 >= 0 ? fctx : bctx;
          ctx.strokeStyle = `rgba(240,101,26,${((1 - j / 26) * 0.9 * st.reveal * (0.4 + 0.6 * Math.min(1, Math.max(0, (cur.z + 1.1) / 2.2)))).toFixed(3)})`;
          ctx.lineWidth = Math.max(0.6, 3.6 * (1 - j / 26) * cur.s);
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(cur.x, cur.y); ctx.stroke();
          tp = cur;
        }
        const d = pt(ring.axis, a0, ring.k);
        const dctx = d.z >= 0 ? fctx : bctx;
        const rad = 4.4 * d.s * (0.6 + 0.4 * st.reveal);
        dctx.globalAlpha = Math.min(1, st.reveal * (0.55 + 0.45 * Math.min(1, Math.max(0, (d.z + 1.1) / 2.2))));
        dctx.fillStyle = 'rgba(240,101,26,0.25)'; dctx.beginPath(); dctx.arc(d.x, d.y, rad * 2.1, 0, 7); dctx.fill();
        dctx.fillStyle = '#f0651a'; dctx.beginPath(); dctx.arc(d.x, d.y, rad, 0, 7); dctx.fill();
        dctx.fillStyle = '#fff4e4'; dctx.beginPath(); dctx.arc(d.x - rad * 0.25, d.y - rad * 0.25, rad * 0.35, 0, 7); dctx.fill();
        dctx.globalAlpha = 1;
      }

      // Мини-гизмо осей X Y Z в углу: поворачивается вместе с орбитами
      if (o.gizmo) {
        const gx = 30, gy = H - 30, L = 21;
        const axes = [['X', 1, 0, 0, '#1d1511'], ['Y', 0, 1, 0, '#1d1511'], ['Z', 0, 0, 1, '#f0651a']];
        fctx.font = '700 9.5px "Roboto Flex", system-ui, sans-serif'; fctx.textAlign = 'center'; fctx.textBaseline = 'middle';
        for (const [name, ax, ay, az, col] of axes) {
          const x1 = ax * cyw + az * syw, z1 = -ax * syw + az * cyw;
          const y2 = ay * cp - z1 * sp;
          const x3 = x1 * cr - y2 * sr, y3 = x1 * sr + y2 * cr;
          fctx.globalAlpha = st.reveal * 0.85;
          fctx.strokeStyle = col; fctx.lineWidth = 1.4; fctx.lineCap = 'round';
          fctx.beginPath(); fctx.moveTo(gx, gy); fctx.lineTo(gx + x3 * L, gy - y3 * L); fctx.stroke();
          fctx.fillStyle = col; fctx.fillText(name, gx + x3 * (L + 8), gy - y3 * (L + 8));
        }
        fctx.globalAlpha = 1;
        fctx.fillStyle = '#1d1511'; fctx.beginPath(); fctx.arc(gx, gy, 2, 0, 7); fctx.fill();
      }
    }
    const ctx_reset = c => c.setLineDash([]);

    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
    else window.addEventListener('resize', resize);
    return {
      st, draw,
      run() {
        new IntersectionObserver(es => { active = es[0].isIntersecting; }, { rootMargin: '80px' }).observe(stage);
        gsap.ticker.add((time, dt) => { if (!active) return; st.t += dt / 1000; draw(); });
      },
    };
  }

  const orbit = $('.orbit__stage');
  const gyro = orbit ? createGyro(orbit, { gizmo: true }) : null;

  // Весь контент аккордеонов/анимаций ниже — только при включённой анимации
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gyro.st.reveal = 0;
    gyro.draw();

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.orbit__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.orbit__photo img', { scale: 1.4, duration: 2, ease: 'expo.out' }, 0.2)
      .to(gyro.st, { reveal: 1, duration: 2.2, ease: 'expo.out' }, 0.45)
      .from('.orbit__halo', { scale: 0.7, autoAlpha: 0, duration: 2.4, ease: 'expo.out' }, 0.3)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.4)
      .from(name.chars, { yPercent: 115, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.5)
      .from('.hero__tag', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.05)
      .from('.bars__row', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 1.35)
      .from('.bars__fill', { scaleX: 0, duration: 1.4, stagger: 0.18, ease: 'expo.out' }, 1.45)
      .from('.promo', { y: 34, autoAlpha: 0, duration: 0.9 }, 1.35);

    gyro.run();
    gsap.to('.orbit__halo', { rotation: 360, duration: 160, ease: 'none', repeat: -1 });
    // Лёгкий поворот орбит за указателем на десктопе
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const hero = $('.hero');
      const to = gsap.quickTo(gyro.st, 'tilt', { duration: 1.2, ease: 'power3.out' });
      hero.addEventListener('pointermove', e => to(((e.clientX / innerWidth) - 0.5) * 0.9));
      hero.addEventListener('pointerleave', () => to(0));
    }

    /* ---------- 2. Курсы ---------- */
    revealLines('.courses h2', '.courses .sec-head');
    gsap.from('.courses .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses .sec-head', start: 'top 84%' } });

    const main = $('.course--main');
    gsap.timeline({ scrollTrigger: { trigger: main, start: 'top 84%' } })
      .fromTo(main, { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from($$('.course__no, .course__title, .course__text, .btn', main), { y: 24, autoAlpha: 0, stagger: 0.09, duration: 0.8 }, 0.55);
    gsap.to('.course__ring, .first__ring', { rotation: 360, duration: 46, ease: 'none', repeat: -1 });

    ['.course--adv', '.course--pack'].forEach((sel, i) => {
      gsap.from(sel, {
        y: 60, rotationX: -14, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: sel, start: 'top 90%' }, delay: i * 0.08,
      });
    });
    gsap.from('.course__badge', { xPercent: 30, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.course--pack', start: 'top 85%' } });

    // «5 дней — 5 минут»: кольца дней заполняются по очереди
    const express = $('.course--express');
    gsap.from(express, { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: express, start: 'top 90%' } });
    const rings = $$('.day__ring');
    gsap.timeline({ scrollTrigger: { trigger: '.days', start: 'top 92%' } })
      .fromTo(rings, { '--p': 0 }, { '--p': 100, duration: 0.9, stagger: 0.42, ease: 'power2.inOut' }, 0.3)
      .from($$('.day b'), { autoAlpha: 0, scale: 0.6, stagger: 0.42, duration: 0.5 }, 0.3);

    /* ---------- 3. Старт ---------- */
    revealLines('.start h2', '.start .sec-head');
    gsap.from('.start .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.start .sec-head', start: 'top 84%' } });
    gsap.from('.mail', { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.mail', start: 'top 88%' } });
    gsap.from('.pair', { x: -24, autoAlpha: 0, stagger: 0.14, duration: 0.8, scrollTrigger: { trigger: '.mail__pair', start: 'top 92%' } });
    gsap.from('.first', { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.first', start: 'top 90%' } });
    gsap.from('.first__play', { scale: 0.4, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.first', start: 'top 86%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
