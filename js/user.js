// user.js - Enhanced for new UI
document.addEventListener('DOMContentLoaded', () => {
  const sess = readSession();
  if (!sess || sess.role !== 'user') { alert('Please login as user'); window.location = 'login.html'; return; }

  // navigation
  const links = document.querySelectorAll('.side-link');
  const views = document.querySelectorAll('.view');
  function show(v) {
    views.forEach(x => x.classList.add('hidden'));
    const target = document.getElementById('view-' + v);
    if (target) target.classList.remove('hidden');
    links.forEach(l => l.classList.toggle('active', l.dataset.view === v));
  }
  links.forEach(l => { l.addEventListener('click', ev => { ev.preventDefault(); show(l.dataset.view); }); });

  // greeting
  document.getElementById('uGreeting').textContent = `Welcome back, ${sess.username} 👋`;

  function refreshUI() {
    const s = readStore();
    // populate categories
    const select = document.getElementById('wasteCategory');
    select.innerHTML = '';
    s.categories.forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c.charAt(0).toUpperCase() + c.slice(1);
      select.appendChild(o);
    });

    // quick tip
    const tip = s.tips.length ? s.tips[Math.floor(Math.random() * s.tips.length)] : null;
    document.getElementById('tipShort').textContent = tip ? tip.text : 'No tips yet.';

    // tips list
    const tipsList = document.getElementById('tipsList');
    tipsList.innerHTML = '';
    if (!s.tips.length) {
      tipsList.innerHTML = '<div class="empty-state"><div class="es-icon">💡</div><p>No advisory tips yet.</p></div>';
    } else {
      const icons = ['🌿', '♻️', '📦', '💧', '🔋', '🌱', '🗑️'];
      s.tips.forEach((t, i) => {
        const div = document.createElement('div'); div.className = 'tip-item';
        div.innerHTML = `<div class="tip-icon">${icons[i % icons.length]}</div>
          <div class="tip-content"><strong>${t.title}</strong><p>${t.text}</p></div>`;
        tipsList.appendChild(div);
      });
    }

    renderMySubs();
    updateCounts();
    renderRecent();
  }

  function renderMySubs() {
    const s = readStore();
    const my = s.submissions.filter(x => x.username === sess.username).reverse();
    const target = document.getElementById('mySubmissions');
    target.innerHTML = '';
    if (!my.length) {
      target.innerHTML = '<div class="empty-state"><div class="es-icon">📭</div><p>No submissions yet. Submit your first pickup!</p></div>';
      return;
    }
    my.forEach(r => {
      const div = document.createElement('div'); div.className = 'request';
      div.innerHTML = `
        <div class="request-info">
          <strong>${r.waste_type.charAt(0).toUpperCase() + r.waste_type.slice(1)} Waste</strong>
          <div class="request-meta">
            <span class="meta-item">⚖️ ${r.quantity} kg</span>
            <span class="meta-item">📅 ${r.preferred_date}</span>
            <span class="meta-item">📍 ${r.address || 'No address'}</span>
          </div>
        </div>
        <div><span class="badge ${r.status}">${r.status === 'collected' ? '✓ Collected' : '⏳ Pending'}</span></div>`;
      target.appendChild(div);
    });
  }

  function renderRecent() {
    const s = readStore();
    const my = s.submissions.filter(x => x.username === sess.username).slice(-3).reverse();
    const target = document.getElementById('recentActivity');
    if (!target) return;
    target.innerHTML = '';
    if (!my.length) {
      target.innerHTML = '<div class="empty-state"><div class="es-icon">🌱</div><p>No activity yet. Submit your first pickup request!</p></div>';
      return;
    }
    my.forEach(r => {
      const div = document.createElement('div'); div.className = 'request';
      div.innerHTML = `
        <div class="request-info">
          <strong>${r.waste_type.charAt(0).toUpperCase() + r.waste_type.slice(1)} Waste — ${r.quantity} kg</strong>
          <div class="request-meta">
            <span class="meta-item">📅 ${r.preferred_date}</span>
            <span class="meta-item">📍 ${r.address || 'No address'}</span>
          </div>
        </div>
        <span class="badge ${r.status}">${r.status === 'collected' ? '✓ Collected' : '⏳ Pending'}</span>`;
      target.appendChild(div);
    });
  }

  function updateCounts() {
    const s = readStore();
    const mySubs = s.submissions.filter(x => x.username === sess.username);
    const pending = mySubs.filter(x => x.status === 'pending').length;
    const collected = mySubs.filter(x => x.status === 'collected').length;
    const el1 = document.getElementById('pendingCount');
    const el2 = document.getElementById('collectedCount');
    const el3 = document.getElementById('totalCount');
    if (el1) el1.textContent = pending;
    if (el2) el2.textContent = collected;
    if (el3) el3.textContent = mySubs.length;
    document.getElementById('uSub').textContent = `${pending} pending · ${collected} collected`;
  }

  // submit form
  document.getElementById('submitForm').addEventListener('submit', e => {
    e.preventDefault();
    const cat = document.getElementById('wasteCategory').value;
    const qty = Number(document.getElementById('wasteQty').value) || 0;
    const addr = document.getElementById('wasteAddress').value.trim();
    const store = readStore();
    store.submissions.push({
      id: Date.now() + Math.floor(Math.random() * 999),
      username: sess.username, name: sess.username, phone: '',
      address: addr, waste_type: cat, quantity: qty,
      preferred_date: new Date().toISOString().slice(0, 10),
      status: 'pending', created_at: new Date().toISOString()
    });
    saveStore(store);
    const msg = document.getElementById('submitMsg');
    msg.textContent = '✓ Pickup request submitted!';
    msg.className = 'small success';
    document.getElementById('submitForm').reset();
    setTimeout(() => { msg.textContent = ''; msg.className = 'small muted'; }, 2500);
    refreshUI();
  });

  document.getElementById('clearUserSubs').addEventListener('click', () => {
    if (!confirm('Clear all your submissions?')) return;
    const s = readStore(); s.submissions = s.submissions.filter(x => x.username !== sess.username);
    saveStore(s); refreshUI();
  });

  document.getElementById('userLogout').addEventListener('click', () => { clearSession(); window.location = 'login.html'; });

  show('dashboard');
  refreshUI();
});
