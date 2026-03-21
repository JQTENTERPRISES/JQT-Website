// JQT Enterprises — Script
gsap.registerPlugin(ScrollTrigger);

// Nav scroll effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// Hero animations
const tl = gsap.timeline({ delay: 0.3 });

tl.to('.powered-tag', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
  .to('.hero-headline .line-1 > *', { y: '0%', duration: 0.7, ease: 'power3.out' }, '-=0.2')
  .to('.hero-headline .line-2 > *', { y: '0%', duration: 0.7, ease: 'power3.out' }, '-=0.5')
  .to('.hero-headline .line-3 > *', { y: '0%', duration: 0.7, ease: 'power3.out' }, '-=0.5')
  .to('.hero-headline .line-4 > *', { y: '0%', duration: 0.7, ease: 'power3.out' }, '-=0.5')
  .to('.hero-sub', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  .to('.hero-actions', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  .to('.hero-dashboard', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.4')
  .to('.scroll-hint', { opacity: 1, duration: 0.6 }, '-=0.2');

// Wrap headline text in spans for animation
document.querySelectorAll('.hero-headline span').forEach(span => {
  const text = span.innerHTML;
  span.innerHTML = '<span>' + text + '</span>';
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
reveals.forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    onEnter: () => el.classList.add('visible')
  });
});

// Dashboard bar animation
ScrollTrigger.create({
  trigger: '.hero-dashboard',
  start: 'top 80%',
  onEnter: () => {
    gsap.from('.bar', {
      height: '0%',
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    });
    gsap.from('.dash-bar-fill', {
      width: '0%',
      duration: 1,
      ease: 'power2.out'
    });
  }
});

// Contact form
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.textContent = 'Message Sent ✓';
    btn.style.background = '#4ade80';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}