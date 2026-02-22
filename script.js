// Smooth scroll animations for service cards
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

// Observe all service cards
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
    
    // Create mailto link with form data
    const subject = encodeURIComponent('New Contact Form Submission');
    const body = encodeURIComponent(
        `Name: ${data.name}\n` +
        `Email: ${data.email}\n` +
        `Phone: ${data.phone || 'Not provided'}\n\n` +
        `Message:\n${data.message}`
    );
    
    window.location.href = `mailto:jqtenterprisesllc@gmail.com?subject=${subject}&body=${body}`;
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success';
    successMsg.textContent = 'Your email client should open shortly. If not, please email us directly.';
    form.insertBefore(successMsg, form.firstChild);
    
    // Clear form
    form.reset();
    
    // Remove success message after 5 seconds
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
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
        nav.style.background = 'rgba(10, 10, 10, 0.8)';
    }
    
    lastScroll = currentScroll;
});
