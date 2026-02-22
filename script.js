const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const triggerPoint = window.innerHeight * 0.3;

    if (scrollPosition > triggerPoint) {
        hero.classList.add('scrolled');
    } else {
        hero.classList.remove('scrolled');
    }
});
