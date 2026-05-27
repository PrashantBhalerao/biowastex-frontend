// admin.js - Enhanced for new UI
document.addEventListener('DOMContentLoaded', () => {
  const sess = readSession();
  if (!sess || sess.role !== 'admin') { alert('Please login as admin'); window.location = 'login.html'; return; }

  const links = document.querySelectorAll('.side-link');
  const views = document.querySelectorAll('.view');
  let chartInstance = null;

  function show(v) {
    views.forEach(x => x.classList.add('hidden'));
    const t = document.getElementById('view-' + v) || document.getElementById('view-' + v + '-admin');
    if (t) t.classList.remove('hidden');
    links.forEach(l => l.classList.toggle('active', l.dataset.view === v));
    if (v === 'overview') renderChart();
  }

  links.forEach(l => l.addEventListener('click', ev => { ev.preventDefault(); show(l.dataset.view); }));

  function refreshAll() {
    const s = readStore();
    const pending = s.submissions.filter(x => x.status === 'pending').length;
    const collected = s.submissions.filter(x => x.status === 'collected').length;
    document.getElementById('totalSub').textContent = s.submissions.length;
    document.getElementById('collectedSub').textContent = collected;
    const pel = document.getElementById('pendingSub');
    if (pel) pel.textContent = pending;
    const cel = document.getElementById('catCount');
    if (cel) cel.textContent = s.categories.length;
    renderSubmissions(); renderCategories(); renderTips();
  }

  function renderChart() {
    const s = readStore();
    const ctx = document.getElementById('adminChart');
    if (!ctx) return;
    const counts = {};
    s.categories.forEach(c => counts[c] = 0);
    s.submissions.forEach(sub => { if (counts[sub.waste_type] !== undefined) counts[sub.waste_type]++; else counts[sub.waste_type] = 1; });
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const colors = ['#39ff78','#00e5ff','#ffe135','#ff6b6b','#a78bfa','#fb923c','#34d399','#60a5fa'];
    if (chartInstance) { chartInstance.destroy(); }
    const isDark = !document.body.classList.contains('light');
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{ label: 'Submissions', data, backgroundColor: colors.slice(0, labels.length), borderRadius: 8, borderSkipped: false }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: isDark ? '#a0b8a8' : '#3a6648' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: isDark ? '#a0b8a8' : '#3a6648', stepSize: 1 } }
        }
      }
    });
  }

  function renderSubmissions() {
    const s = readStore();
    const container = document.getElementById('allSubmissions');
    container.innerHTML = '';
    if (!s.submissions.length) {
      container.innerHTML = '<div class="empty-state"><div class="es-icon">📭</div><p>No submissions yet.</p></div>';
      return;
    }
    s.submissions.slice().reverse().forEach(r => {
      const div = document.createElement('div'); div.className = 'request';
      div.innerHTML = `
        <div class="request-info">
          <strong>${r.name || r.username}</strong>
          <div class="request-meta">
            <span class="meta-item">♻️ ${r.waste_type}</span>
            <span class="meta-item">⚖️ ${r.quantity} kg</span>
            <span class="meta-item">📅 ${r.preferred_date}</span>
            <span class="meta-item">📍 ${r.address || 'N/A'}</span>
          </div>
        </div>
        <div class="request-actions">
          <span class="badge ${r.status}">${r.status === 'collected' ? '✓ Collected' : '⏳ Pending'}</span>
          ${r.status !== 'collected' ? `<button class="btn sm collect" data-id="${r.id}">Mark Collected</button>` : ''}
          <button class="btn sm danger delete" data-id="${r.id}">Delete</button>
        </div>`;
      container.appendChild(div);
    });
    container.querySelectorAll('.collect').forEach(b => b.addEventListener('click', e => {
      const id = Number(e.target.dataset.id); const s = readStore();
      s.submissions = s.submissions.map(x => x.id === id ? { ...x, status: 'collected', collected_at: new Date().toISOString() } : x);
      saveStore(s); refreshAll();
    }));
    container.querySelectorAll('.delete').forEach(b => b.addEventListener('click', e => {
      if (!confirm('Delete this submission?')) return;
      const id = Number(e.target.dataset.id); const s = readStore();
      s.submissions = s.submissions.filter(x => x.id !== id); saveStore(s); refreshAll();
    }));
  }

  function renderCategories() {
    const s = readStore();
    const c = document.getElementById('categoryList'); c.innerHTML = '';
    const catColors = { organic:'#4caf50', plastic:'#2196f3', paper:'#ff9800', glass:'#9c27b0', metal:'#607d8b', hazard:'#f44336' };
    s.categories.forEach(cat => {
      const chip = document.createElement('div'); chip.className = 'cat-chip';
      const col = catColors[cat] || '#39ff78';
      chip.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${col};display:inline-block"></span>
        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        <span class="rm" data-cat="${cat}" title="Remove">×</span>`;
      c.appendChild(chip);
    });
    c.querySelectorAll('.rm').forEach(btn => btn.addEventListener('click', () => {
      if (!confirm('Delete category?')) return;
      const s = readStore(); s.categories = s.categories.filter(x => x !== btn.dataset.cat);
      saveStore(s); refreshAll();
    }));
  }

  document.getElementById('addCategory').addEventListener('click', () => {
    const v = document.getElementById('newCategory').value.trim().toLowerCase();
    if (!v) return alert('Enter a category name');
    const s = readStore();
    if (s.categories.includes(v)) return alert('Category already exists');
    s.categories.push(v); saveStore(s);
    document.getElementById('newCategory').value = '';
    refreshAll();
  });

  function renderTips() {
    const s = readStore();
    const t = document.getElementById('adminTips'); t.innerHTML = '';
    const icons = ['🌿', '♻️', '📦', '💧', '🔋', '🌱'];
    if (!s.tips.length) {
      t.innerHTML = '<div class="empty-state"><div class="es-icon">💡</div><p>No tips yet. Add one below!</p></div>';
      return;
    }
    s.tips.forEach((tip, i) => {
      const div = document.createElement('div'); div.className = 'tip-item';
      div.innerHTML = `<div class="tip-icon">${icons[i % icons.length]}</div>
        <div class="tip-content" style="flex:1"><strong>${tip.title}</strong><p>${tip.text}</p></div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn sm outline editTip" data-id="${tip.id}">Edit</button>
          <button class="btn sm danger delTip" data-id="${tip.id}">Delete</button>
        </div>`;
      t.appendChild(div);
    });
    t.querySelectorAll('.editTip').forEach(b => b.addEventListener('click', e => {
      const id = Number(e.target.dataset.id); const s = readStore(); const tip = s.tips.find(x => x.id === id);
      const nt = prompt('Edit title', tip.title); if (nt === null) return;
      const tx = prompt('Edit text', tip.text); if (tx === null) return;
      tip.title = nt; tip.text = tx; saveStore(s); refreshAll();
    }));
    t.querySelectorAll('.delTip').forEach(b => b.addEventListener('click', e => {
      if (!confirm('Delete tip?')) return;
      const id = Number(e.target.dataset.id); const s = readStore();
      s.tips = s.tips.filter(x => x.id !== id); saveStore(s); refreshAll();
    }));
  }

  document.getElementById('addTip').addEventListener('click', () => {
    const title = document.getElementById('newTipTitle').value.trim();
    const text = document.getElementById('newTipText').value.trim();
    if (!title || !text) return alert('Enter both title and text');
    const s = readStore(); s.tips.push({ id: Date.now(), title, text }); saveStore(s);
    document.getElementById('newTipTitle').value = '';
    document.getElementById('newTipText').value = '';
    refreshAll();
  });

  document.getElementById('adminLogout').addEventListener('click', () => { clearSession(); window.location = 'login.html'; });

  show('overview'); refreshAll();
});
