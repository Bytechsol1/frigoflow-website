/* Reusable, dependency-free editorial carousel. Content is supplied as data. */
class FrigoTestimonialSlider {
  static instances = 0;

  constructor(root, testimonials) {
    if (!root.id) root.id = `partner-slider-${++FrigoTestimonialSlider.instances}`;
    this.root = root;
    this.items = testimonials;
    this.index = 0;
    this.track = root.querySelector('.signature-track');
    this.progress = root.querySelector('.signature-progress');
    this.counter = root.querySelector('.signature-count');
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    this.render();
    this.track.addEventListener('scroll', () => {
      if (this.pendingFrame) return;
      this.pendingFrame = requestAnimationFrame(() => {
        this.pendingFrame = null;
        const closest = this.slides.reduce((best, slide, index) => Math.abs(this.offset(index) - this.track.scrollLeft) < Math.abs(this.offset(best) - this.track.scrollLeft) ? index : best, 0);
        this.select(closest);
      });
    }, { passive: true });
    this.track.addEventListener('keydown', event => {
      const actions = { ArrowLeft: this.index - 1, ArrowRight: this.index + 1, Home: 0, End: this.items.length - 1 };
      if (!(event.key in actions)) return;
      event.preventDefault();
      this.go(actions[event.key]);
    });
    root.querySelectorAll('[data-slide-direction]').forEach(button => {
      button.addEventListener('click', () => this.go(this.index + Number(button.dataset.slideDirection)));
    });
    const align = () => this.track.scrollTo({ left: this.offset(this.index), behavior: 'instant' });
    this.resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(align) : null;
    if (this.resizeObserver) this.resizeObserver.observe(this.track);
    else window.addEventListener('resize', align);
    root.querySelector('.signature-controls').hidden = false;
    this.select(0);
    this.setupAutoplay();
  }

  setupAutoplay() {
    this.autoplayPaused = false;
    this.focused = false;
    this.dragging = false;
    this.visible = true;
    this.autoplayButton = this.element('button', 'signature-autoplay', '\u275a\u275a');
    this.autoplayButton.type = 'button';
    this.autoplayButton.setAttribute('aria-label', 'Pause automatic testimonials');
    this.autoplayButton.setAttribute('aria-pressed', 'false');
    this.root.querySelector('.signature-arrows').prepend(this.autoplayButton);
    this.autoplayButton.addEventListener('click', () => {
      this.autoplayPaused = !this.autoplayPaused;
      if (!this.autoplayPaused) this.focused = false;
      this.autoplayButton.textContent = this.autoplayPaused ? '\u25b6' : '\u275a\u275a';
      this.autoplayButton.setAttribute('aria-pressed', String(this.autoplayPaused));
      this.autoplayButton.setAttribute('aria-label', this.autoplayPaused ? 'Resume automatic testimonials' : 'Pause automatic testimonials');
      this.scheduleAutoplay();
    });
    this.root.addEventListener('focusin', () => {
      this.focused = !!this.root.querySelector(':focus-visible');
      this.scheduleAutoplay();
    });
    this.root.addEventListener('focusout', () => {
      setTimeout(() => { this.focused = !!this.root.querySelector(':focus-visible'); this.scheduleAutoplay(); }, 0);
    });
    this.track.addEventListener('pointerdown', () => { this.dragging = true; this.scheduleAutoplay(); });
    const release = () => { this.dragging = false; this.scheduleAutoplay(); };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    document.addEventListener('visibilitychange', () => this.scheduleAutoplay());
    this.reducedMotion.addEventListener('change', () => this.scheduleAutoplay());
    if (typeof IntersectionObserver === 'function') {
      this.visibilityObserver = new IntersectionObserver(entries => {
        this.visible = entries.some(entry => entry.isIntersecting);
        this.scheduleAutoplay();
      }, { threshold: 0.1 });
      this.visibilityObserver.observe(this.root);
    }
    this.scheduleAutoplay();
  }

  scheduleAutoplay() {
    clearTimeout(this.autoplayTimer);
    const playing = !this.autoplayPaused && !this.focused && !this.dragging && this.visible && !document.hidden && !this.reducedMotion.matches;
    this.counter.setAttribute('aria-live', playing ? 'off' : 'polite');
    if (!playing) return;
    this.autoplayTimer = setTimeout(() => {
      this.go((this.index + 1) % this.items.length, true);
      this.scheduleAutoplay();
    }, 3000);
  }

  element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  render() {
    this.slides = this.items.map((item, index) => {
      const slide = this.element('figure', 'signature-slide');
      slide.id = `${this.root.id || 'partner'}-quote-${index + 1}`;
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${index + 1} of ${this.items.length}`);
      const top = this.element('div', 'signature-slide-top');
      top.append(this.element('span', '', item.topic), this.element('span', 'signature-placeholder', 'Placeholder perspective'));
      const mark = this.element('span', 'signature-quote-mark', '\u201c');
      mark.setAttribute('aria-hidden', 'true');
      const quote = this.element('blockquote', '');
      quote.append(this.element('p', '', item.quote));
      const author = this.element('figcaption', 'signature-author');
      const avatar = this.element('span', 'signature-monogram', String(index + 1).padStart(2, '0'));
      avatar.setAttribute('aria-hidden', 'true');
      const identity = this.element('div', '');
      identity.append(this.element('strong', '', item.identity), this.element('span', '', item.role));
      author.append(avatar, identity, this.element('span', 'signature-clinic', `${item.company} / placeholder`));
      slide.append(top, mark, quote, author);
      this.track.append(slide);
      const button = this.element('button', 'signature-step');
      button.type = 'button';
      button.setAttribute('aria-label', `Show testimonial ${index + 1}: ${item.role}`);
      button.setAttribute('aria-controls', slide.id);
      const number = this.element('span', '', String(index + 1).padStart(2, '0'));
      button.append(number);
      button.addEventListener('click', () => this.go(index));
      this.progress.append(button);
      return slide;
    });
  }

  offset(index) {
    return this.slides[index].offsetLeft - this.slides[0].offsetLeft;
  }

  select(index) {
    const changed = this.index !== index;
    this.index = index;
    this.slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.classList.toggle('is-before', i === index - 1);
      slide.classList.toggle('is-after', i === index + 1);
      slide.setAttribute('aria-hidden', String(i !== index));
      this.progress.children[i].setAttribute('aria-current', String(i === index));
    });
    this.root.querySelector('[data-slide-direction="-1"]').disabled = index === 0;
    this.root.querySelector('[data-slide-direction="1"]').disabled = index === this.items.length - 1;
    if (changed || !this.counter.dataset.initialized) {
      this.counter.replaceChildren(this.element('strong', '', String(index + 1).padStart(2, '0')), this.element('span', '', `/ ${String(this.items.length).padStart(2, '0')}`));
      this.counter.dataset.initialized = 'true';
    }
  }

  go(index, automatic = false) {
    const target = Math.max(0, Math.min(index, this.items.length - 1));
    const wrap = automatic && target === 0 && this.index === this.items.length - 1;
    this.track.scrollTo({ left: this.offset(target), behavior: this.reducedMotion.matches || wrap ? 'instant' : 'smooth' });
    if (!automatic && this.autoplayButton) this.scheduleAutoplay();
  }
}

const testimonialData = document.querySelector('#testimonial-data');
if (testimonialData) {
  const items = JSON.parse(testimonialData.textContent);
  document.querySelectorAll('[data-testimonial-slider]').forEach(root => new FrigoTestimonialSlider(root, items));
}
