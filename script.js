document.addEventListener('DOMContentLoaded', () => {

    const heroTitleSection = document.querySelector('.hero-title-section');
    const dashboardContainer = document.querySelector('.dashboard-container');
    const heroSubtitleSection = document.querySelector('.hero-subtitle-section');
    const dashboardPieces = document.querySelectorAll('.dashboard-piece');

    function getDirection(i) { return i % 2 === 0 ? 'left' : 'right'; }

    function resetPieces() {
        dashboardPieces.forEach((piece, i) => {
            piece.classList.remove('assembled');
            piece.style.left = '';
            piece.style.top = '';
            piece.classList.remove('flying-in-left', 'flying-in-right');
            piece.classList.add(getDirection(i) === 'left' ? 'flying-in-left' : 'flying-in-right');
        });
    }

    resetPieces();

    let assembled = false;

    window.addEventListener('scroll', () => {
        const s = window.scrollY;
        const wh = window.innerHeight;
        const trigger = wh * 0.2;

        heroTitleSection.classList.toggle('fade-out', s > trigger * 0.75);

        if (s > trigger) {
            dashboardContainer.classList.add('visible');
            if (!assembled) {
                assembled = true;
                dashboardPieces.forEach((piece, i) => {
                    setTimeout(() => {
                        piece.classList.remove('flying-in-left', 'flying-in-right');
                        piece.classList.add('assembled');
                        piece.style.left = piece.dataset.finalX + 'px';
                        piece.style.top = piece.dataset.finalY + 'px';
                    }, i * 150);
                });
            }
        } else {
            dashboardContainer.classList.remove('visible', 'assembled');
            heroSubtitleSection.classList.remove('visible');
            if (assembled) {
                assembled = false;
                resetPieces();
            }
        }

        if (s > wh * 0.85) {
            dashboardContainer.classList.add('assembled');
            heroSubtitleSection.classList.add('visible');
        } else if (s > trigger) {
            dashboardContainer.classList.remove('assembled');
            heroSubtitleSection.classList.remove('visible');
        }

        document.querySelector('.nav').style.background = s > 100
            ? 'rgba(245, 245, 240, 0.98)' : 'rgba(245, 245, 240, 0.9)';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 150);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });
    document.querySelectorAll('.service-card').forEach(c => observer.observe(c));

    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const data = Object.fromEntries(new FormData(form));
        const subject = encodeURIComponent('New Contact Form Submission');
        const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\n\nMessage:\n${data.message}`);
        window.location.href = `mailto:jqtenterprisesllc@gmail.com?subject=${subject}&body=${body}`;
        const msg = document.createElement('div');
        msg.className = 'form-success';
        msg.textContent = 'Your email client should open shortly.';
        form.insertBefore(msg, form.firstChild);
        form.reset();
        setTimeout(() => msg.remove(), 5000);
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const t = document.querySelector(a.getAttribute('href'));
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

});
