// animations.js — scroll-reveal and counter animations
(function () {
  // Counter animation
  function animateCounter(el, target, duration) {
    const start = 0;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Animate stat numbers on page load
  document.addEventListener('DOMContentLoaded', () => {
    const statNums = document.querySelectorAll('.stat-num');
    statNums.forEach(el => {
      const text = el.textContent.trim();
      const num = parseInt(text);
      if (!isNaN(num) && num > 0) {
        animateCounter(el, num, 1200);
      }
    });

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .step-card, .waste-chip').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
      observer.observe(el);
    });
  });
})();
