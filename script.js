document.addEventListener('DOMContentLoaded', () => {

    const heroTitleSection = document.querySelector('.hero-title-section');
    const dashboardContainer = document.querySelector('.dashboard-container');
    const heroSubtitleSection = document.querySelector('.hero-subtitle-section');
    const dashboardPieces = document.querySelectorAll('.dashboard-piece');

    function getDirection(index) {
        return index % 2 === 0 ? 'left' : 'right';
    }

    // Initialize pieces off-screen
    dashboardPieces.forEach((piece, index) => {
        const dir = getDirection(index);
        piece.classList.add(dir === 'left' ? 'flying-in-left' : 'flying-in-right');
    });

    // Scroll-based animation
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        // Phase 1: Fade out title
        const titleFadePoint = windowHeight * 0.2;
        if (scrollPosition > titleFadePoint) {
            heroTitleSection.classList.add('fade-out');
        } else {
            heroTitleSection.classList.remove('fade-out');
        }

        // Phase 2: Fly in dashboard pieces
        const dashboardStartPoint = windowHeight * 0.2;
        if (scrollPosition > dashboardStartPoint) {
            dashboardContainer.classList.add('visible');

            dashboardPieces.forEach((piece, index) => {
                const pieceStartPoint = dashboardStartPoint + (index * 100);
                if (scrollPosition > pieceStartPoint) {
                    const dir = getDirection(index);
                    if (!piece.classList.contains('assembled')) {
                        piece.classList.add(dir === 'left' ? 'flying-in-left' : 'flying-in-right');
                        setTimeout(() => {
                            piece.classList.remove('flying-in-left', 'flying-in-right');
                            piece.classList.add('assembled');
                            piece.style.left = `${piece.dataset.finalX}px`;
                            piece.style.top = `${piece.dataset.finalY}px`;
                        }, 120);
                    }
                }
            });
        }

        // Phase 3: Show subtitle after dashboard assembles
        const subtitlePoint = windowHeight * 0.7;
        if (scrollPosition > subtitlePoint) {
            dashboardContainer.classList.add('assembled');
            heroSubtitleSection.classList.add('visible');
        } else {
            dashboardContainer.classList.remove('assembled');
            heroSubtitleSection.classList.remove('visible');
        }

        // Nav background
        const nav = document.querySelector('.nav');
        if (window.pageYOffset > 100) {
            nav.style.background = 'rgba(245, 245, 240, 0.98)';
        } else {
            nav.style.background = 'rgba(245, 245, 240, 0.9)';
        }
    });

    // Service cards scroll animation
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 150);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => observer.observe(card));

    // Contact form
    document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const subject = encodeURIComponent('New Contact Form Submission');
        const body = encodeURIComponent(
            `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\n\nMessage:\n${data.message}`
        );
        window.location.href = `mailto:jqtenterprisesllc@gmail.com?subject=${subject}&body=${body}`;
        const successMsg = document.createElement('div');
        successMsg.className = 'form-success';
        successMsg.textContent = 'Your email client should open shortly. If not, please email us directly.';
        form.insertBefore(successMsg, form.firstChild);
        form.reset();
        setTimeout(() => successMsg.remove(), 5000);
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

});
