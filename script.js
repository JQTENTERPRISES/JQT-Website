document.addEventListener('DOMContentLoaded', function() {
  var title = document.querySelector('.hero-title-section');
  var dash = document.querySelector('.dashboard-container');
  var sub = document.querySelector('.hero-subtitle-section');
  var pieces = document.querySelectorAll('.dashboard-piece');

  function resetPieces() {
    pieces.forEach(function(p, i) {
      p.classList.remove('assembled','flying-in-left','flying-in-right');
      p.style.left = '';
      p.style.top = '';
      p.classList.add(i % 2 === 0 ? 'flying-in-left' : 'flying-in-right');
    });
  }
  resetPieces();

  var assembled = false;

  window.addEventListener('scroll', function() {
    var s = window.scrollY;
    var wh = window.innerHeight;
    var trigger = wh * 0.2;

    // Title fade
    if (s > trigger * 0.75) { title.classList.add('fade-out'); }
    else { title.classList.remove('fade-out'); }

    // Below trigger: show and assemble dashboard
    if (s > trigger) {
      dash.classList.add('visible');
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
    } else {
      // Scrolled back up above trigger — instant clean reset
      dash.classList.remove('visible','assembled');
      sub.classList.remove('visible');
      if (assembled) { assembled = false; resetPieces(); }
    }

    // Phase 3: fade dash and show subtitle at 80% scroll
    if (s > wh * 0.8) {
      dash.classList.add('assembled');
      sub.classList.add('visible');
    } else if (s > trigger) {
      dash.classList.remove('assembled');
      sub.classList.remove('visible');
    }

    // Nav bg
    var nav = document.querySelector('.nav');
    nav.style.background = s > 100 ? 'rgba(245,245,240,0.98)' : 'rgba(245,245,240,0.9)';
  });

  // Service cards
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function() { entry.target.classList.add('visible'); }, i * 150);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });
  document.querySelectorAll('.service-card').forEach(function(c) { obs.observe(c); });

  // Contact form
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form));
      var subject = encodeURIComponent('New Contact Form Submission');
      var body = encodeURIComponent('Name: ' + data.name + '\nEmail: ' + data.email + '\nPhone: ' + (data.phone || 'Not provided') + '\n\nMessage:\n' + data.message);
      window.location.href = 'mailto:jqtenterprisesllc@gmail.com?subject=' + subject + '&body=' + body;
      var msg = document.createElement('div');
      msg.className = 'form-success';
      msg.textContent = 'Your email client should open shortly.';
      form.insertBefore(msg, form.firstChild);
      form.reset();
      setTimeout(function() { msg.remove(); }, 5000);
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      var t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});