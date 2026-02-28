document.addEventListener('DOMContentLoaded', () => {

    const heroTitleSection = document.querySelector('.hero-title-section');
    const dashboardContainer = document.querySelector('.dashboard-container');
    const heroSubtitleSection = document.querySelector('.hero-subtitle-section');
    const dashboardPieces = document.querySelectorAll('.dashboard-piece');

    function getDirection(index) {
        return index % 2 === 0 ? 'left' : 'right';
    }

    function resetPieces() {
        dashboardPieces.forEach((piece, index) => {
            piece.classList.remove('assembled');
            piece.style.left = '';
            piece.style.top = '';
            const dir = getDirection(index);
            piece.classList.remove('flying-in-left', 'flying-in-right');
            piece.classList.add(dir === 'left' ? 'flying-in-left' : 'flying-in-right');
        });
    }

    resetPieces();

    let assembled = false;
    let assembleTimeout = null;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const wh = window.innerHeight;

        // Phase 1: fade title at 15% scroll
        if (scrollY > wh * 0.15) {
            heroTitleSection.classList.add('fade-out');
        } else {
            heroTitleSection.classList.remove('fade-out');
        }

        // Full reset when back at top
        if (scrollY < wh * 0.1) {
            if (assembled) {
                assembled = false;
                if (assembleTimeout) clearTimeout(assembleTimeout);
                dashboardContainer.classList.remove('visible', 'assembled');
                heroSubtitleSection.classList.remove('visible');
                resetPieces();
            }
        }

        // Phase 2: fly in dashboard at 15-20% scroll
        if (scrollY > wh * 0.15) {
            dashboardContainer.classList.add('visible');

            if (!assembled) {
                assembled = true;
                dashboardPieces.forEach((piece, index) => {
                    assembleTimeout = setTimeout(() => {
                        piece.classList.remove('flying-in-left', 'flying-in-right');
                        piece.classList.add('assembled');
                        piece.style.left = piece.dataset.finalX + 'px';
                        piece.style.top = piece.dataset.finalY + 'px';
                    }, index * 150);
                });
            }
        }

        // Phase 3: fade dashboard at 65%, show subtitle only after fully faded at 80%
        if (scrollY > wh * 0.65) {
            dashboardContainer.classList.add('assembled');
        } else {
            dashboardContainer.classList.remove('assembled');
        }

        if (scrollY > wh * 0.85) {
            heroSubtitleSection.classList.add('visible');
        } else {
            heroSubtitleSection.classList.remove('visible');
        }

        // Nav
        const nav = document.querySelector('.nav');
        nav.style.background = scrollY > 100
            ? 'rgba(245, 245, 240, 0.98)'
            : 'rgba(245, 245, 240, 0.9)';
    });

    // Service cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), index * 150);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });

    document.querySelectorAll('.service-card').forEach(card => observer.observe(card));

    // Contact form
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

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

});