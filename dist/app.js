const menuToggle = document.querySelector('.menu-toggle');
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
