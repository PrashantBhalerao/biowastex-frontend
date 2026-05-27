// theme.js — updated for light/dark toggle
(function () {
  const KEY = 'bw_theme';
  const BTNS = '#themeToggle,#themeToggleHeader,#themeToggleHeader2,#themeToggleSidebar,#themeToggleSidebarAdmin';

  function applyTheme(t) {
    if (t === 'light') {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    } else {
      document.body.classList.remove('light');
      document.body.classList.remove('dark');
    }
    document.querySelectorAll(BTNS).forEach(btn => {
      if (btn) btn.textContent = t === 'light' ? '🌙' : '☀️';
    });
  }

  const saved = localStorage.getItem(KEY) || 'dark';
  applyTheme(saved);

  document.addEventListener('click', e => {
    if (e.target.matches(BTNS)) {
      const cur = document.body.classList.contains('light') ? 'light' : 'dark';
      const next = cur === 'light' ? 'dark' : 'light';
      localStorage.setItem(KEY, next);
      applyTheme(next);
    }
  });
})();
