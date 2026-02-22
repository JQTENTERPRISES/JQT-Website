// Cinematic hero scroll effect
const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const triggerPoint = window.innerHeight * 0.4;
    
    if (scrollPosition > triggerPoint) {
        hero.classList.add('scrolled');
    } else {
        hero.classList.remove('scrolled');
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

document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => observer.observe(card));
});

// Contact form handling
document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const subject = encodeURIComponent('New Contact Form Submission');
    const body = encodeURIComponent(
        `Name: ${data.name}\n` +
        `Email: ${data.email}\n` +
        `Phone: ${data.phone || 'Not provided'}\n\n` +
        `Message:\n${data.message}`
    );
    
    window.location.href = `mailto:jqtenterprisesllc@gmail.com?subject=${subject}&body=${body}`;
    
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success';
    successMsg.textContent = 'Your email client should open shortly. If not, please email us directly.';
    form.insertBefore(successMsg, form.firstChild);
    
    form.reset();
    
    setTimeout(() => {
        successMsg.remove();
    }, 5000);
});

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Nav background on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav.style.background = 'rgba(245, 245, 240, 0.98)';
    } else {
        nav.style.background = 'rgba(245, 245, 240, 0.9)';
    }
});
