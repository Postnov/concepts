// Ирина Сычевская — моушн концепта «Розовый плакат-табло».
// Фирменная идея — весы: «15.000» и «−45 кг» набираются барабанами, а лента делений под цифрой едет вместе с ними
// и встаёт вместе с последней цифрой, как шкала механических весов. «15.000» считает вверх, «−45» — вниз (минус).
// Барабаны только у этих двух её цифр.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  if (!animate) return;

  /* ---------- табло: цифра → барабан ---------- */
  // Ширину ячейки задаёт невидимая итоговая цифра, поэтому строка не сдвигается ни до, ни после прокрутки.
  // Текст для скринридера остаётся в aria-label.
  // dir 'down' — лента по убыванию: каждая цифра стартует с 9 и катится вниз до своей
  function buildTablo(el) {
    const down = el.dataset.dir === 'down';
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.setAttribute('role', 'img');
    el.textContent = '';
    const drums = [];
    [...text].forEach(ch => {
      if (!/\d/.test(ch)) {
        el.append(document.createTextNode(ch));
        return;
      }
      const slot = document.createElement('span');
      slot.className = 'dr';
      const ghost = document.createElement('span');
      ghost.className = 'dr__ghost';
      ghost.textContent = ch;
      const strip = document.createElement('span');
      strip.className = 'dr__strip';
      // Один-два полных оборота и остановка на её цифре; у правых цифр оборотов больше — «набегает» волной
      const turns = 1 + Math.min(drums.length, 2);
      const n = Number(ch);
      // Вверх: лента 0,1,2…, едет вверх и встаёт на цифре. Вниз: лента n, n+1… (сверху вниз), едет вниз —
      // в окне цифры идут по убыванию 9, 8, 7… и встают на n
      const steps = down ? turns * 10 + (9 - n) : turns * 10 + n;
      for (let k = 0; k <= steps; k++) {
        const d = document.createElement('span');
        d.textContent = String(down ? (n + k) % 10 : k % 10);
        strip.append(d);
      }
      slot.append(ghost, strip);
      el.append(slot);
      drums.push({ strip, end: -(steps / (steps + 1)) * 100 });
    });
    return {
      play(opts = {}) {
        const tl = gsap.timeline(opts);
        drums.forEach((d, i) => {
          tl.fromTo(d.strip, { yPercent: down ? d.end : 0 }, {
            yPercent: down ? 0 : d.end,
            duration: 1.4 + i * 0.08, ease: 'power3.out',
          }, i * 0.09);
        });
        return tl;
      },
    };
  }

  // Лента делений весов: едет столько же, сколько крутятся барабаны, тем же power3.out, без отскока.
  // 400px — целое число периодов делений (50px и 10px), поэтому лента встаёт ровно в исходное положение.
  function rollRuler(ruler, duration, dir = 1) {
    return gsap.fromTo($('span', ruler), { '--rx': `${-400 * dir}px` }, { '--rx': '0px', duration, ease: 'power3.out' });
  }

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    $$(selector).forEach(el => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 100, duration: 1, stagger: 0.09, ease: 'expo.out',
        scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
        onComplete: () => split.revert(),
      });
    });
  }

  // Тонкие иконки «рисуются» линией
  function drawIcons(svg, scrollTrigger) {
    const parts = $$('path, circle', svg);
    parts.forEach(p => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
    gsap.to(parts, {
      strokeDashoffset: 0, duration: 1.4, stagger: 0.12, ease: 'power2.inOut', scrollTrigger,
      onComplete: () => parts.forEach(p => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Афиша ---------- */
    const heroTablo = buildTablo($('.hero__num'));
    const name = SplitText.create('.hero__name span', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__kicker', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.15)
      .from(name.chars, { yPercent: 112, stagger: 0.035, duration: 1, ease: 'expo.out' }, 0.2)
      .fromTo('.hero__photo .frame',
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.25)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.45)
      .from('.hero__shade', { x: -14, y: -14, autoAlpha: 0, duration: 1.1 }, 0.9)
      .from('.hero__avatar', { scale: 0.6, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.7)
      .from('.hero__pre', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.85)
      .fromTo('.hero .ruler', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.35)
      .from('.hero .ruler i', { scaleY: 0, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.6);
    const heroRoll = heroTablo.play();
    intro
      .add(heroRoll, 0.55)
      .add(rollRuler($('.hero .ruler'), heroRoll.duration()), 0.55)
      .from('.hero__post > *', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.4)
      .from('.ribbon > *', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 1.5);

    // Фото чуть отстаёт при прокрутке
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Более 6 лет + системы ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.years', start: 'top 78%' } })
      .fromTo('.years__ph',
        { clipPath: 'inset(0% 0% 100% 0% round 22px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.3, stagger: 0.15, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.years__ph img', { scale: 1.25, duration: 1.8, stagger: 0.15, ease: 'expo.out' }, 0.15);
    gsap.timeline({ scrollTrigger: { trigger: '.years__text', start: 'top 82%' } })
      .from('.years__big > span', { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out' })
      .from('.years__lead', { y: 18, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.35);

    revealLines('.sec-head h2');
    // Подзаголовок появляется следом за строками заголовка
    $$('.sec-head .sec-sub').forEach(sub => gsap.from(sub, {
      y: 14, autoAlpha: 0, duration: 0.8, delay: 0.25,
      scrollTrigger: { trigger: sub.closest('.sec-head'), start: 'top 84%' },
    }));
    gsap.from('.tile', {
      y: 46, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.tiles', start: 'top 86%' },
    });

    /* ---------- 3. Залог ---------- */
    const pills = $$('.pill');
    gsap.set(pills, { y: 34, autoAlpha: 0 });
    ScrollTrigger.batch(pills, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.1, ease: 'expo.out' }),
    });
    $$('.pill .ico').forEach(svg => drawIcons(svg, { trigger: svg, start: 'top 88%' }));
    gsap.timeline({ scrollTrigger: { trigger: '.pill--wide', start: 'top 82%' } })
      .fromTo('.pill__photo',
        { clipPath: 'inset(100% 0% 0% 0% round 16px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.2)
      .from('.pill__photo img', { scale: 1.25, duration: 1.7, ease: 'expo.out' }, 0.3)
      .from('.pill__big', { x: -16, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.5);

    /* ---------- 4. −45 кг ---------- */
    const lossTablo = buildTablo($('.loss__num .tablo'));
    const lossRoll = lossTablo.play();
    gsap.timeline({ scrollTrigger: { trigger: '.loss__band', start: 'top 72%' } })
      .fromTo('.loss__band', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.loss__pre', { y: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.5)
      .from('.loss .ruler i', { scaleY: 0, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.5)
      .add(lossRoll, 0.6)
      // Лента «минуса» едет в обратную сторону
      .add(rollRuler($('.loss .ruler'), lossRoll.duration(), -1), 0.6)
      .from('.loss__kg', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 1.3);
    $$('.gallery__ph').forEach(ph => {
      gsap.timeline({ scrollTrigger: { trigger: ph, start: 'top 88%' } })
        .fromTo(ph, { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' })
        .from($('img', ph), { scale: 1.22, duration: 1.7, ease: 'expo.out' }, 0.1);
    });
    gsap.from('.btn--wa', {
      y: 24, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.loss__cta', start: 'top 92%' },
    });

    /* ---------- 5. Диплом ---------- */
    gsap.from('.passe', {
      y: 70, rotate: -9, autoAlpha: 0, duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: '.passe', start: 'top 86%' },
    });
    gsap.to('.passe__in img', {
      yPercent: -4, scale: 1.06, ease: 'none',
      scrollTrigger: { trigger: '.passe', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    gsap.from('.legal > *', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.legal', start: 'top 90%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
