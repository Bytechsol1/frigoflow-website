const menuToggle = document.querySelector('.menu-toggle');

// Visual duplicate enables a seamless sample-marker loop.
const markerList = document.querySelector('.clinic-testing-photo .marker-list');
if (markerList) {
  const copy = markerList.cloneNode(true);
  copy.classList.add('marker-duplicates');
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  markerList.parentElement.append(copy);
}


// Local clinic preview navigation. All records here are illustrative demo data.
const clinicContent = document.querySelector('#clinic-view-content');
if (clinicContent) {
  const ordersMarkup = clinicContent.innerHTML;
  const demoHeader = '<div class="app-topbar"><span>Demo workspace / NexGen Wellness</span><span class="avatar">EC</span></div>';
  const demoTitle = title => `<div class="app-title"><div><span class="app-eyebrow">ILLUSTRATIVE DEMO DATA</span><h3>${title}</h3></div></div>`;
  const demoTable = (headers, rows) => `<div class="table-scroll" tabindex="0" role="region" aria-label="Sample records; scroll to see all columns"><table><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const clinicViews = {
    orders: ordersMarkup,
    overview: demoHeader + demoTitle('Workspace overview') + '<div class="clinic-demo-summary"><div><span>Sample patients</span><strong>3</strong></div><div><span>Sample orders</span><strong>3</strong></div><div><span>Available reports</span><strong>1</strong></div></div><p class="clinic-view-note">Follow patient enrollment, testing progress, and results access from one clinic workspace. Select a sidebar icon to explore the demo.</p>',
    patients: demoHeader + demoTitle('Patients') + demoTable(['Patient', 'Patient ID', 'Test panel'], [['Jennifer Hall', '#00124', 'Cardiometabolic'], ['Daniel Price', '#00123', 'Hormone panel'], ['Lisa Gomez', '#00122', 'Wellness panel']]) + '<p class="clinic-view-note">Sample identities only. No real patient information is shown.</p>',
    results: demoHeader + demoTitle('Results') + demoTable(['Patient', 'Test panel', 'Report status'], [['Lisa Gomez', 'Wellness panel', '<span class="status status-ready"><i></i>Results available</span>'], ['Jennifer Hall', 'Cardiometabolic', 'Processing'], ['Daniel Price', 'Hormone panel', 'Awaiting collection']]) + '<p class="clinic-view-note">This preview shows report availability only. Actual laboratory reports are not connected.</p>',
    access: demoHeader + demoTitle('Access information') + '<div class="clinic-access-list"><h4>Role-based permissions</h4><p>Ensure the right access for each user.</p><h4>Secure data handling</h4><p>Built with industry-standard security practices.</p><h4>Audit &amp; access records</h4><p>Maintain a record of key actions, including agreement acceptance and data access.</p></div><p class="clinic-view-note">Informational demo only. Account permissions cannot be changed here.</p>'
  };
  document.querySelectorAll('[data-clinic-view]').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.clinicView;
      if (!Object.hasOwn(clinicViews, view)) return;
      clinicContent.innerHTML = clinicViews[view];
      document.querySelectorAll('[data-clinic-view]').forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      const caption = document.querySelector('#for-clinics .dashboard-caption>span:last-child');
      caption.textContent = `${button.getAttribute('title')} / Illustrative data`;
      caption.setAttribute('role', 'status');
    });
  });
}

const mobileNav = document.querySelector('#mobile-nav');
function closeMobileMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  mobileNav.hidden = true;
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  mobileNav.hidden = expanded;
});
mobileNav.querySelectorAll('a, button').forEach(link => link.addEventListener('click', closeMobileMenu));
matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) closeMobileMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeMobileMenu(); document.querySelector('.login-menu').open = false; }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.login-menu')) document.querySelector('.login-menu').open = false;
});
const dialog = document.querySelector('#info-dialog');
const messages = {
  clinic: ['Clinic portal', 'The clinic portal is not connected to this design preview. Use your existing clinic portal address to sign in.'],
  patient: ['Patient portal', 'The patient portal is not connected to this design preview. Use the portal link provided by your clinic to sign in.'],
  privacy: ['Privacy policy', 'The official Frigo Flow privacy policy has not been supplied for this preview. The demo form does not transmit or store your entries.'],
  terms: ['Terms of service', 'The official Frigo Flow terms of service have not been supplied for this preview.']
};
document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
  const [title, message] = messages[button.dataset.dialog];
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#dialog-message').textContent = message;
  document.querySelector('.login-menu').open = false;
  dialog.showModal();
}));
document.querySelectorAll('.dialog-close, .dialog-dismiss').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
document.querySelector('#demo-form').addEventListener('submit', event => {
  event.preventDefault();
  const status = document.querySelector('#form-status');
  status.textContent = 'This is a design preview. Your information has not been sent or saved; demo requests will be available when the live contact service is connected.';
  status.hidden = false;
});

// Progressive enhancement: quotes remain visible without JS or observer support.
// Section reveals are one-shot and leave the underlying content visible.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('section-enter');
      entry.target.addEventListener('animationend', () => entry.target.classList.remove('section-enter'), { once: true });
      sectionObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('.workflow .section-heading, .clinic-copy, .dashboard-stage, .branding-copy, .brand-preview, .capabilities-section .section-heading, .faq, .demo-panel').forEach(section => sectionObserver.observe(section));
}
