// auth.js — enhanced with styled messages
document.addEventListener('DOMContentLoaded', () => {
  readStore(); // ensure data initialized

  function setMsg(id, text, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'small ' + (type || 'muted');
  }

  // Register
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('regUsername').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      const role = document.getElementById('regRole').value;
      if (!username || !password || !role) { setMsg('regMessage', '⚠️ Please fill all fields', 'error'); return; }
      const store = readStore();
      if (store.users.some(u => u.username === username)) { setMsg('regMessage', '⚠️ Username already taken', 'error'); return; }
      store.users.push({ username, password, role });
      saveStore(store);
      setMsg('regMessage', '✓ Account created! Redirecting…', 'success');
      setTimeout(() => window.location.href = 'login.html', 1000);
    });
  }

  // Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const role = document.getElementById('loginRole').value;
      if (!username || !password) { setMsg('loginMessage', '⚠️ Enter your credentials', 'error'); return; }
      const store = readStore();
      const user = store.users.find(u => u.username === username && u.password === password && u.role === role);
      if (!user) { setMsg('loginMessage', '⚠️ Invalid credentials or role', 'error'); return; }
      saveSession({ username: user.username, role: user.role });
      setMsg('loginMessage', '✓ Login successful! Redirecting…', 'success');
      setTimeout(() => window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html', 700);
    });
  }

  // Auto-redirect if already logged in
  const sess = readSession();
  if (sess && (location.pathname.endsWith('login.html') || location.pathname.endsWith('register.html'))) {
    window.location.href = sess.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
  }
});
