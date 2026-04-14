import { auth, db } from '../core/firebase-config.js';
import { logoutUser, isAdmin } from '../auth/auth.js';
import { getUserNotifications, markNotificationRead } from '../core/utils.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── TOAST SYSTEM ─────────────────────────────────────────────────
export function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-body">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-msg">${message}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── NAVBAR RENDERER ───────────────────────────────────────────────
export function renderNavbar(activePage = '') {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  navbar.innerHTML = `
    <div class="navbar-brand">
  <div class="logo-ico">
    <img src="../assets/logo.png" alt="logo">
  </div>

  <div class="brand-text">
    ICPC <span>Academy</span>
    <div class="brand-sub">Developed by Eng. Youssef Barakat</div>
  </div>
</div>
    <div class="navbar-actions">
      <button class="notif-btn" id="notif-toggle" title="Notifications">
        🔔
        <span class="notif-badge" id="notif-count" style="display:none">0</span>
      </button>
      <div id="user-menu" style="display:flex;align-items:center;gap:0.5rem">
        <div class="skeleton" style="width:80px;height:32px;border-radius:8px"></div>
      </div>
      <button class="mobile-menu-btn" id="sidebar-toggle">☰</button>
    </div>
  `;

  // Sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
  });

  // Notification panel toggle
  document.getElementById('notif-toggle')?.addEventListener('click', () => {
    document.getElementById('notif-panel')?.classList.toggle('open');
  });

  // Close panel on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notif-toggle') && !e.target.closest('#notif-panel')) {
      document.getElementById('notif-panel')?.classList.remove('open');
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const adminUser = await isAdmin();
    const userMenu  = document.getElementById('user-menu');

    userMenu.innerHTML = `
      <span style="font-size:0.85rem;color:var(--text-secondary)">
        ${user.email?.split('@')[0]}
        ${adminUser ? '<span class="badge-chip cyan" style="margin-left:0.35rem;font-size:0.7rem">Admin</span>' : ''}
      </span>
      <button class="btn btn-ghost btn-sm" onclick="window._logout()">Sign Out</button>
    `;

    window._logout = async () => {
  try {
    await logoutUser();
    window.location.href = "https://hnuicpc.github.io/icpc-academy/";
  } catch (e) {
    console.error("Logout failed:", e);
  }
};

    // Load notifications
    loadNotifications(user.uid);
  });
}

async function loadNotifications(uid) {
  try {
    const notifs = await getUserNotifications(uid);
    const unread = notifs.filter(n => !n.read);
    const countEl = document.getElementById('notif-count');
    if (countEl) {
      if (unread.length > 0) {
        countEl.textContent = unread.length;
        countEl.style.display = 'flex';
      } else {
        countEl.style.display = 'none';
      }
    }

    const panel = document.getElementById('notif-panel');
    if (!panel) return;

    const list = panel.querySelector('.notif-panel-list');
    if (!list) return;

    if (notifs.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:0.88rem">No notifications yet</div>';
      return;
    }

    list.innerHTML = notifs.map(n => {
      const time = n.createdAt?.toDate ? timeAgo(n.createdAt.toDate()) : '';
      const typeIcon = n.type === 'warning' ? '⚠️' : n.type === 'announcement' ? '📢' : '🎯';
      return `
        <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}" onclick="window._readNotif('${n.id}', this)">
          <div class="notif-dot ${n.read ? 'read' : ''}"></div>
          <div style="flex:1">
            <div class="notif-item-title">${typeIcon} ${n.title}</div>
            <div class="notif-item-msg">${n.message}</div>
            <div class="notif-item-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');

    window._readNotif = async (id, el) => {
      await markNotificationRead(id);
      el.classList.remove('unread');
      el.querySelector('.notif-dot')?.classList.add('read');
      const count = parseInt(countEl?.textContent || '0') - 1;
      if (count <= 0 && countEl) countEl.style.display = 'none';
      else if (countEl) countEl.textContent = count;
    };
  } catch(e) {
    console.warn('Notifications load failed:', e);
  }
}

function timeAgo(date) {
  const secs = Math.floor((Date.now() - date) / 1000);
  if (secs < 60)    return 'Just now';
  if (secs < 3600)  return `${Math.floor(secs/60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`;
  return `${Math.floor(secs/86400)}d ago`;
}

// ── SIDEBAR RENDERER ──────────────────────────────────────────────
export function renderSidebar(activePage = '', showAdmin = false) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const links = [
    { href: 'dashboard.html',   icon: '🏠', label: 'Dashboard',   key: 'dashboard' },
    { href: 'course.html',      icon: '📚', label: 'Course',       key: 'course' },
    { href: 'leaderboard.html', icon: '🏆', label: 'Leaderboard',  key: 'leaderboard' },
    { href: 'profile.html',     icon: '👤', label: 'My Profile',   key: 'profile' },
  ];

  const adminLinks = [
    { href: 'admin.html',       icon: '⚙️', label: 'Admin Panel',  key: 'admin' },
  ];

  const renderLink = (l) => `
    <li>
      <a href="${l.href}" class="${activePage === l.key ? 'active' : ''}">
        <span class="nav-icon">${l.icon}</span> ${l.label}
      </a>
    </li>
  `;

  sidebar.innerHTML = `
    <nav>
      <ul class="sidebar-nav">
        <li class="sidebar-label">Navigation</li>
        ${links.map(renderLink).join('')}
        ${showAdmin ? `
          <li><div class="sidebar-divider"></div></li>
          <li class="sidebar-label">Admin</li>
          ${adminLinks.map(renderLink).join('')}
        ` : ''}
      </ul>
      <div style="padding:1rem 1.75rem;margin-top:auto">
        <div style="font-size:0.72rem;color:var(--text-muted);line-height:1.8">
          ICPC Academy v1.0<br>
          ECPC Preparation Platform
        </div>
      </div>
    </nav>
  `;
}
