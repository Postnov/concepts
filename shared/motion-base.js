// Общая основа моушна (по принципам VictoriaAwakening/motion/motion.js):
// элементы видимы по умолчанию и прячутся только gsap.from(); без GSAP или при reduced motion страница статичная.
// Против «прыжка» при загрузке: в <head> каждого демо html получает класс is-loading (main скрыт, см. base.css);
// снимаем его, когда шрифты загрузились и интро уже выставило начальные состояния.
(function () {
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  // Ждём реальную загрузку ВСЕХ объявленных шрифтов (не дольше 8 с).
  // document.fonts.ready нельзя: он резолвится сразу, если браузер ещё не начал грузить шрифты —
  // тогда интро и SplitText стартуют на запасном шрифте, а после подмены и revert текст прыгает.
  const fontsReady = () => {
    const faces = document.fonts ? [...document.fonts] : [];
    const all = Promise.all(faces.map(f => (f.status === 'loaded' ? f : f.load().catch(() => null))))
      .then(() => (document.fonts ? document.fonts.ready : null));
    return Promise.race([all, new Promise(r => setTimeout(r, 8000))]);
  };
  // Нарезка по строкам: вложенные элементы (<em> и т.п.) режем на куски по строкам сами, по вёрстке целого текста.
  // Сам SplitText (deepSlice) меряет слова по одному, пока пробела за словом ещё нет, — слово склеивалось со следующим и уезжало на новую строку.
  // Режется без сдвига только то, у чего кусок не повторит ничего, что занимает место: у inline — поля/рамку/отступ слева и справа,
  // у блочного — сверху и снизу, ::before/::after в потоке. inline-block и остальное не режем: их строки едут вместе
  const cuttable = n => {
    const s = getComputedStyle(n);
    const sides = { inline: ['Left', 'Right'], block: ['Top', 'Bottom'] }[s.display];
    return !!sides && !sides.some(k => parseFloat(s[`padding${k}`]) || parseFloat(s[`margin${k}`]) || parseFloat(s[`border${k}Width`]))
      && ['::before', '::after'].every(p => {
        const ps = getComputedStyle(n, p);
        return /^(none|normal)$/.test(ps.content) || /absolute|fixed/.test(ps.position);
      });
  };
  // Режет n на копии по строкам (куски встают следом за n); true — если было что резать
  const cutByLines = n => {
    const chars = [];
    const walk = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    for (let t; (t = walk.nextNode());) for (let i = 0; i < t.data.length; i++) {
      if (!t.data[i].trim()) continue;
      const r = document.createRange();
      r.setStart(t, i); r.setEnd(t, i + 1);
      chars.push({ t, i, box: r.getBoundingClientRect() });
    }
    // Начало строки — символ ниже и не правее предыдущего (так строки ищет и SplitText)
    const starts = chars.filter((c, k) => k && c.box.top > chars[k - 1].box.top && c.box.left <= chars[k - 1].box.left);
    for (const { t, i } of starts.reverse()) {
      const r = document.createRange();
      if (i) r.setStart(t, i);
      else {
        // Строка начинается с вложенного элемента — режем перед ним, иначе в прошлой строке останется его пустая копия
        let node = t;
        while (node.parentNode !== n && !node.previousSibling) node = node.parentNode;
        if (!node.previousSibling) continue;
        r.setStartBefore(node);
      }
      r.setEnd(n, n.childNodes.length);
      const piece = n.cloneNode(false);
      piece.append(r.extractContents());
      n.after(piece);
    }
    return starts.length > 0;
  };
  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    html.classList.remove('is-loading');
  };

  window.MotionBase = {
    reduce,
    // true — можно анимировать
    init() {
      if (!hasGsap || reduce) {
        fontsReady().then(reveal);
        return false;
      }
      const plugins = [ScrollTrigger];
      if (window.SplitText) {
        plugins.push(SplitText);
        // Каждая буква SplitText — свой inline-block, кернинга между ними нет; после revert() он возвращался,
        // и заголовок в конце интро сдвигался на 1–6 px. Всё, что режется на буквы, — без кернинга с самого начала (.split-chars в base.css)
        // reduceWhiteSpace по умолчанию false: с true SplitText превращает &nbsp; в пробел и режет по нему —
        // в нарезке слова переносились иначе, чем в собранном тексте, и после revert() прыгали на другую строку
        // Маски (mask: 'chars' | 'words' | 'lines') режут ровно по коробке куска: при плотной высоте строки хвосты «р», «ф», «у»
        // выходят за неё снизу, наклон курсива и длинное слово шире колонки — сбоку; их срезало, пока текст едет,
        // а после revert() они «выскакивали». Маска режет не overflow, а clip-path: inset(−T −100vw −B −100vw): сбоку не режет
        // вовсе (текст в масках едет по вертикали), сверху и снизу — с запасом, а коробка маски не меняется — ни раскладка,
        // ни базовая линия (padding у маски сдвигал заголовки в сетке с align-items: baseline). Запас — не меньше PAD и не
        // меньше того, на сколько чернила букв (canvas measureText, как в scripts/textcheck.mjs) реально выходят за коробку:
        // рукописные шрифты, крупный <em> в плотной строке. Сам кусок выше на P сверху и снизу (padding + такой же
        // отрицательный margin): старт yPercent: ±100 считается от его высоты и уводит текст за запас маски целиком (иначе
        // до начала анимации торчала бы полоска букв). Маска строки — flow-root: иначе отрицательные margin куска схлопнулись бы
        // сквозь неё с соседними и раздвинули строки. Сначала всё меряем, потом пишем стили — одна раскладка на нарезку
        const PAD = { top: 0.16, bottom: 0.3 }, PIECE = 0.2, GAP = 2;   // em, em, px
        let pen;
        const ink = piece => {   // чернила текста куска: [верх, низ] в px от верха его коробки
          pen = pen || document.createElement('canvas').getContext('2d');
          const box = piece.getBoundingClientRect();
          let top = 0, bottom = box.height;
          const walk = document.createTreeWalker(piece, NodeFilter.SHOW_TEXT);
          for (let n; (n = walk.nextNode());) {
            const text = n.data.trim();
            if (!text) continue;
            const cs = getComputedStyle(n.parentElement);
            pen.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            const mt = pen.measureText(text);
            const range = document.createRange();
            range.selectNodeContents(n);
            for (const r of range.getClientRects()) {
              const k = r.height / (mt.fontBoundingBoxAscent + mt.fontBoundingBoxDescent) || 1;
              const base = r.top - box.top + mt.fontBoundingBoxAscent * k;
              top = Math.min(top, base - mt.actualBoundingBoxAscent * k);
              bottom = Math.max(bottom, base + mt.actualBoundingBoxDescent * k);
            }
          }
          return { h: box.height, top, bottom };
        };
        const padMasks = split => {
          const all = (split.masks || []).filter(m => m.firstElementChild).map(m => {
            const fs = parseFloat(getComputedStyle(m).fontSize) || 16;
            return { m, block: getComputedStyle(m).display === 'block', fs, ...ink(m.firstElementChild) };
          });
          for (const { m, block, fs, h, top, bottom } of all) {
            const T = Math.max(PAD.top * fs, GAP - top), B = Math.max(PAD.bottom * fs, bottom - h + GAP);
            // со старта снизу верх чернил ниже маски: 2P ≥ B − top; со старта сверху низ чернил выше маски: 2P ≥ низ за коробкой + T
            const P = Math.max(PIECE * fs, (B - top) / 2 + GAP, (bottom - h + T) / 2 + GAP);
            Object.assign(m.style, { overflow: 'visible', clipPath: `inset(${-T}px -100vw ${-B}px -100vw)`, ...(block ? { display: 'flow-root' } : {}) });
            m.dataset.splitMask = '';   // метка для scripts/textcheck.mjs --masks
            Object.assign(m.firstElementChild.style, { paddingTop: `${P}px`, paddingBottom: `${P}px`, marginTop: `${-P}px`, marginBottom: `${-P}px` });
          }
          return split;
        };
        const create = SplitText.create;
        SplitText.create = (target, vars = {}) => {
          const type = vars.type ?? 'chars,words,lines';
          const els = gsap.utils.toArray(target);
          if (/chars/.test(type)) els.forEach(el => el.classList.add('split-chars'));
          if (/chars|words/.test(type) || vars.deepSlice !== undefined) return padMasks(create.call(SplitText, target, { reduceWhiteSpace: false, ...vars }));
          // Нарезка только по строкам. SplitText ищет строки по временным словам-inline-block, а у них свои переносы и высота строки:
          // появлялся перенос между «к&nbsp;» и <em>, между словом в <em> и «»», пропадал перенос после дефиса,
          // пустые копии <em> меняли высоту строки — после revert() текст прыгал на 0,5–500 px.
          // Временные слова — обычный inline (.split-word-inline в base.css), вложенные элементы режем по строкам заранее (cutByLines)
          const orig = els.map(el => el.innerHTML);
          const cut = els.map(el => [...el.children].filter(n => [n, ...n.querySelectorAll('*')].every(cuttable)).map(cutByLines).includes(true));
          const split = create.call(SplitText, target, {
            reduceWhiteSpace: false, ...vars, deepSlice: false, wordsClass: `${vars.wordsClass || ''} split-word-inline`.trim(),
          });
          // revert() SplitText вернул бы разрезанные куски — возвращаем исходную разметку
          const revert = split.revert;
          split.revert = function () {
            revert.call(this);
            els.forEach((el, i) => { if (cut[i]) el.innerHTML = orig[i]; });
            return this;
          };
          return padMasks(split);
        };
      }
      gsap.registerPlugin(...plugins);
      ScrollTrigger.config({ ignoreMobileResize: true });
      return true;
    },
    // Запуск после загрузки шрифтов (иначе SplitText режет строки по запасному шрифту);
    // страница показывается сразу после fn, когда начальные кадры интро уже выставлены
    ready(fn) {
      const run = () => fontsReady().then(() => {
        try { fn(); } finally { reveal(); }
      });
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
      else run();
    },
    // Число с неразрывным пробелом по тысячам: 7000 → «7 000»
    money: n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
  };

  html.classList.add(hasGsap && !reduce ? 'js-motion' : 'no-motion');
})();
