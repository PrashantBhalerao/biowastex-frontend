// core.js — Single source of truth for all BioWastex data & auth
// No more conflicting localStorage keys. Every page loads this first.

const BW = (() => {
  const STORE_KEY = 'bw_store_v3';
  const SESSION_KEY = 'bw_session_v3';
  const THEME_KEY = 'bw_theme';

  // ── DEFAULT SEED DATA ──────────────────────────────────────────
  function seed() {
    return {
      users: [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'demoUser', password: 'user123', role: 'user' }
      ],
      categories: ['organic', 'plastic', 'paper', 'glass', 'metal', 'hazardous'],
      tips: [
        { id: 1, title: 'Compost Organics', text: 'Kitchen scraps and yard waste are ideal for home composting. Reduces landfill load by up to 30%.' },
        { id: 2, title: 'Rinse Plastics', text: 'Rinse containers before recycling to avoid contamination. Even a small residue can reject an entire batch.' },
        { id: 3, title: 'Keep Paper Dry', text: 'Do not mix greasy or wet paper with recyclables — it degrades paper fiber quality.' }
      ],
      submissions: [
        { id: 101, username: 'demoUser', address: 'Ward 5, MG Road', waste_type: 'organic', quantity: 2.5, status: 'pending', date: '2025-11-05', created_at: new Date().toISOString() }
      ]
    };
  }

  // ── STORE HELPERS ──────────────────────────────────────────────
  function getStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return seed();
      const parsed = JSON.parse(raw);
      // ensure all keys exist (safe migration)
      if (!parsed.users) parsed.users = seed().users;
      if (!parsed.categories) parsed.categories = seed().categories;
      if (!parsed.tips) parsed.tips = seed().tips;
      if (!parsed.submissions) parsed.submissions = seed().submissions;
      return parsed;
    } catch (e) { return seed(); }
  }

  function saveStore(obj) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) { console.error('Save failed', e); }
  }

  function initStore() {
    if (!localStorage.getItem(STORE_KEY)) saveStore(seed());
  }

  // ── SESSION HELPERS ────────────────────────────────────────────
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
  }

  function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, role: user.role }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // ── AUTH ───────────────────────────────────────────────────────
  function login(username, password, role) {
    const store = getStore();
    const user = store.users.find(u =>
      u.username.toLowerCase() === username.toLowerCase() &&
      u.password === password &&
      u.role === role
    );
    if (!user) return { ok: false, msg: 'Invalid username, password, or role.' };
    saveSession(user);
    return { ok: true, user };
  }

  function register(username, password, role) {
    if (!username || !password || !role) return { ok: false, msg: 'All fields are required.' };
    if (username.length < 3) return { ok: false, msg: 'Username must be at least 3 characters.' };
    if (password.length < 4) return { ok: false, msg: 'Password must be at least 4 characters.' };
    const store = getStore();
    if (store.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, msg: 'Username already taken. Try another.' };
    }
    store.users.push({ username, password, role });
    saveStore(store);
    return { ok: true };
  }

  // ── GUARD: call at top of protected pages ──────────────────────
  function requireAuth(expectedRole) {
    const sess = getSession();
    if (!sess) { window.location.href = 'login.html'; return null; }
    if (sess.role !== expectedRole) { window.location.href = 'login.html'; return null; }
    return sess;
  }

  // ── THEME ──────────────────────────────────────────────────────
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t || 'dark');
    const icon = t === 'light' ? '🌙' : '☀️';
    document.querySelectorAll('.theme-btn').forEach(b => b.textContent = icon);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(saved);
    document.addEventListener('click', e => {
      if (e.target.closest('.theme-btn')) {
        const cur = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = cur === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
      }
    });
  }

  // ── TOAST NOTIFICATIONS (replaces all alert() calls) ──────────
  function toast(msg, type = 'info') {
    let wrap = document.getElementById('bw-toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'bw-toast-wrap';
      wrap.style.cssText = 'position:fixed;top:80px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none';
      document.body.appendChild(wrap);
    }
    const t = document.createElement('div');
    t.className = `bw-toast bw-toast-${type}`;
    t.textContent = msg;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('bw-toast-in'));
    setTimeout(() => {
      t.classList.remove('bw-toast-in');
      t.classList.add('bw-toast-out');
      setTimeout(() => t.remove(), 400);
    }, 3200);
  }

  // Init on load
  initStore();

  return { getStore, saveStore, getSession, saveSession, clearSession, login, register, requireAuth, initTheme, applyTheme, toast };
})();
