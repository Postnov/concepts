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
      if (window.SplitText) plugins.push(SplitText);
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
