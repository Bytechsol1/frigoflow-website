(() => {
  const root = document.querySelector('.capability-carousel');
  if (!root) return;
  const track = root.querySelector('.capability-track');
  const cards = [...track.children];
  const prev = root.querySelector('[data-capability-prev]');
  const next = root.querySelector('[data-capability-next]');
  const count = root.querySelector('.capability-position');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  const update = () => {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    index = cards.reduce((best, card, i) => Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft) < Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - track.scrollLeft) ? i : best, 0);
    count.textContent = `${String(index + 1).padStart(2, '0')} / 09`;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  };
  const move = direction => {
    const target = Math.max(0, Math.min(cards.length - 1, index + direction));
    track.scrollTo({ left: cards[target].offsetLeft - cards[0].offsetLeft, behavior: reduced.matches ? 'instant' : 'smooth' });
  };
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  root.querySelector('.capability-controls').hidden = false;
  update();
})();
