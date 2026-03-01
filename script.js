document.addEventListener('DOMContentLoaded', function() {
  window.scrollTo(0, 0);
  var heroTitle = document.querySelector('.hero-title-section');
  var dashContainer = document.querySelector('.dashboard-container');
  var heroSub = document.querySelector('.hero-subtitle-section');
  var pieces = document.querySelectorAll('.dashboard-piece');
  var assembled = false;
  function resetPieces() {
    pieces.forEach(function(p, i) {
      p.classList.remove('assembled','flying-in-left','flying-in-right');
      p.style.left = ''; p.style.top = '';
      p.classList.add(i % 2 === 0 ? 'flying-in-left' : 'flying-in-right');
    });
  }
  resetPieces();
  window.addEventListener('scroll', function() {
    var s = window.scrollY;
    var wh = window.innerHeight;
    var trigger = wh * 0.2;
    heroTitle.classList.toggle('fade-out', s > trigger * 0.75);
    if (s < trigger) {
      dashContainer.classList.remove('visible','assembled');
      heroSub.classList.remove('visible');
      if (assembled) { assembled = false; resetPieces(); }
      return;
    }
    dashContainer.classList.add('visible');
    if (!assembled) {
      assembled = true;
      pieces.forEach(function(p, i) {
        setTimeout(function() {
          p.classList.remove('flying-in-left','flying-in-right');
          p.classList.add('assembled');
          p.style.left = p.dataset.finalX + 'px';
          p.style.top = p.dataset.finalY + 'px';
        }, i * 150);
      });
    }
    if (s > wh * 0.85) {
      dashContainer.classList.add('assembled');
      heroSub.classList.add('visible');
    } else {
      dashContainer.classList.remove('assembled');
      heroSub.classList.remove('visible');
    }
    document.querySelector('.nav').style.background = s > 100 ? 'rgba(245,245,240,0.98)' : 'rgba(245,245,240,0.9)';
  });
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function() { entry.target.classList.add('visible'); }, i * 150);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });
  document.querySelectorAll('.service-card').forEach(function(c) { observer.observe(c); });
  var cf = document.getElementById('contactForm');
  if (cf) cf.addEventListener('submit', function(e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector('button[type="submit"], .submit-btn, button');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    emailjs.sendForm('service_dkzf00m', 'template_6ie98p2', form)
      .then(function() {
        var msg = document.createElement('div');
        msg.className = 'form-success';
        msg.textContent = 'Message sent! We will be in touch shortly.';
        form.insertBefore(msg, form.firstChild);
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
        setTimeout(function() { msg.remove(); }, 5000);
      }, function(error) {
        var msg = document.createElement('div');
        msg.className = 'form-success';
        msg.textContent = 'Something went wrong. Please email us directly.';
        form.insertBefore(msg, form.firstChild);
        if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
      });
  });
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      var t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});