import { auth, db } from '../core/firebase-config.js';
import { logoutUser, isAdmin } from '../auth/auth.js';
import { getUserNotifications, markNotificationRead } from '../core/utils.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── SVG ICON LIBRARY ──────────────────────────────────────────────
export const ICONS = {
  dashboard:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  course:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  leaderboard:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  profile:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  admin:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
  bell:       `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  signout:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  menu:       `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  close:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  check:      `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  info:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  warning:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  error:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  success:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  announce:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17l-9-5-9 5 9-5 9 5z"/><path d="M3 17v-5l9-5 9 5v5"/><path d="M12 7V2"/></svg>`,
  target:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
};

// ── TOAST SYSTEM ──────────────────────────────────────────────────
export function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons  = { success: ICONS.success, error: ICONS.error, info: ICONS.info, warning: ICONS.warning };
  const colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--accent)', warning: 'var(--warning)' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon" style="color:${colors[type]}">${icons[type]}</span>
    <div class="toast-body">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-msg">${message}</div>
    </div>
  `;
  container.appendChild(toast);

  // Animate out after 4 s
  setTimeout(() => {
    toast.style.opacity    = '0';
    toast.style.transform  = 'translateX(20px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── NAVBAR RENDERER ───────────────────────────────────────────────
export function renderNavbar(activePage = '') {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // ── Inject styles once ────────────────────────────────────────
  if (!document.getElementById('navbar-nav-styles')) {
    const style = document.createElement('style');
    style.id = 'navbar-nav-styles';
    style.textContent = `
      /* ── Base navbar ── */
      .navbar {
        position: relative;
        display: flex;
        align-items: center;
        /* Taller navbar: more vertical breathing room */
        min-height: 72px;
        padding: 0 1.5rem;
        gap: 1rem;
        background: var(--bg-navbar, #111111);
        border-bottom: 1px solid rgba(255, 161, 22, 0.12);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.45);
        /* Subtle top accent line */
        box-shadow:
          0 1px 0 rgba(255,161,22,0.18) inset,
          0 4px 24px rgba(0,0,0,0.5);
      }

      /* ── Brand / Logo ── */
      .navbar-brand {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        text-decoration: none;
        flex-shrink: 0;
      }

      /* Logo wrapper — fixed size so the image never overflows */
      .logo-ico {
        width: 52px;
        height: 52px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        /* Soft glow ring around logo */
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(255,161,22,0.18), 0 0 14px rgba(255,161,22,0.10);
      }

      .logo-ico img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        border-radius: 50%;
      }

      /* Brand typography */
      .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.15;
        font-family: 'Segoe UI', system-ui, sans-serif;
        font-size: 1.18rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: var(--text-primary, #f0f0f0);
      }

      .brand-text span {
        color: #FFA116;
      }

      .brand-sub {
        font-size: 0.72rem;
        font-weight: 400;
        color: var(--text-muted, #666);
        letter-spacing: 0.01em;
        margin-top: 1px;
        white-space: nowrap;
      }

      /* ── Center nav links ── */
      .navbar-nav {
        display: flex;
        align-items: center;
        gap: 0.15rem;
        flex: 1;
        justify-content: center;
      }

      .navbar-nav-link {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.48rem 0.95rem;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-muted, #888);
        text-decoration: none;
        border: 1px solid transparent;
        transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        white-space: nowrap;
        position: relative;
      }

      .navbar-nav-link svg { flex-shrink: 0; }

      .navbar-nav-link:hover {
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-primary, #f0f0f0);
        border-color: rgba(255, 255, 255, 0.07);
      }

      .navbar-nav-link.active {
        background: rgba(255, 161, 22, 0.10);
        border-color: rgba(255, 161, 22, 0.28);
        color: #FFA116;
        box-shadow: 0 0 10px rgba(255, 161, 22, 0.08);
      }

      /* ── Right-side actions ── */
      .navbar-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      /* Notification bell */
      .notif-btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 9px;
        background: transparent;
        border: 1px solid rgba(255,255,255,0.07);
        color: var(--text-muted, #888);
        cursor: pointer;
        transition: background 0.18s, color 0.18s, border-color 0.18s;
      }

      .notif-btn:hover {
        background: rgba(255,255,255,0.07);
        color: var(--text-primary, #f0f0f0);
        border-color: rgba(255,255,255,0.12);
      }

      .notif-badge {
        position: absolute;
        top: 5px;
        right: 5px;
        min-width: 16px;
        height: 16px;
        background: #FFA116;
        color: #111;
        border-radius: 999px;
        font-size: 0.62rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 3px;
        line-height: 1;
        box-shadow: 0 0 6px rgba(255,161,22,0.5);
      }

      /* User section */
      #user-menu {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .user-handle {
        font-size: 0.83rem;
        color: var(--text-secondary, #aaa);
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      /* Mobile hamburger */
      .mobile-menu-btn {
        display: none;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 9px;
        background: transparent;
        border: 1px solid rgba(255,255,255,0.07);
        color: var(--text-muted, #888);
        cursor: pointer;
        transition: background 0.18s, color 0.18s;
      }

      .mobile-menu-btn:hover {
        background: rgba(255,255,255,0.07);
        color: var(--text-primary, #f0f0f0);
      }

      /* ── Mobile dropdown ── */
      .navbar-mobile-nav {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-card, #161616);
        border-top: 1px solid rgba(255,161,22,0.1);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        padding: 0.6rem 0.75rem;
        flex-direction: column;
        gap: 0.2rem;
        z-index: 999;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      }

      .navbar-mobile-nav.open { display: flex; }
      .navbar-mobile-nav .navbar-nav-link { justify-content: flex-start; }

      /* ── Responsive: tablet (≤900px) ── */
      @media (max-width: 900px) {
        .navbar-nav-link { padding: 0.42rem 0.65rem; font-size: 0.8rem; }
      }

      /* ── Responsive: mobile (≤768px) ── */
      @media (max-width: 768px) {
        .navbar-nav          { display: none; }
        .mobile-menu-btn     { display: flex; }
        .navbar-actions      { gap: 0.3rem; }

        /* Hide username text on mobile, keep badge */
        .user-handle .username-text { display: none; }

        /* Smaller sign-out — icon only */
        #user-menu .btn-ghost span.signout-label { display: none; }
        #user-menu .btn-ghost { padding: 0.3rem 0.4rem; min-width: unset; }

        .badge-chip { font-size: 0.62rem !important; padding: 0.1rem 0.4rem; }
      }

      /* ── Responsive: very small (≤400px) ── */
      @media (max-width: 400px) {
        .navbar-brand .brand-sub { display: none; }
        .brand-text { font-size: 1rem; }
        .logo-ico { width: 42px; height: 42px; }
      }
        .brand-link {
  color: #FFA116;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  transition: all 0.2s ease;
}

.brand-link:hover {
  color: #ffbe55;
}

.brand-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0%;
  height: 1px;
  background: #FFA116;
  transition: width 0.25s ease;
}

.brand-link:hover::after {
  width: 100%;
}
    `;
    document.head.appendChild(style);
  }

  // Hide sidebar (legacy support)
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.style.display = 'none';

  const pageWrapper = document.querySelector('.page-wrapper');
  if (pageWrapper) pageWrapper.style.gridTemplateColumns = '1fr';

  // ── Nav links definition ──────────────────────────────────────
  const navLinks = activePage === 'admin'
    ? [{ href: 'admin.html', icon: ICONS.admin, label: 'Admin Panel', key: 'admin' }]
    : [
        { href: 'dashboard.html',   icon: ICONS.dashboard,   label: 'Dashboard',  key: 'dashboard'   },
        { href: 'course.html',      icon: ICONS.course,      label: 'Course',      key: 'course'      },
        { href: 'leaderboard.html', icon: ICONS.leaderboard, label: 'Leaderboard', key: 'leaderboard' },
        { href: 'profile.html',     icon: ICONS.profile,     label: 'Profile',     key: 'profile'     },
      ];

  const linksHTML = (extraLinks = []) =>
    [...navLinks, ...extraLinks].map(l => `
      <a href="${l.href}" class="navbar-nav-link ${activePage === l.key ? 'active' : ''}">
        ${l.icon} ${l.label}
      </a>
    `).join('');

  // ── Render HTML ───────────────────────────────────────────────
  navbar.innerHTML = `
    <div class="navbar-brand">
      <div class="logo-ico">
        <img src="../assets/logo.png" alt="ICPC Academy logo">
      </div>
      <div class="brand-text">
        HNUFE CPC <span>Academy</span>
<div class="brand-sub">
  Developed by Eng. 
  <a href="https://www.instagram.com/joe_111_11?igsh=MXAwdGd6N2JrN2didw==" 
     target="_blank" 
     class="brand-link">
     Youssef Barakat
  </a>
</div>
      </div>
    </div>

    <nav class="navbar-nav" id="navbar-nav" role="navigation" aria-label="Main navigation">
      ${linksHTML()}
    </nav>

    <div class="navbar-actions">
      <button class="notif-btn" id="notif-toggle" title="Notifications" aria-label="Notifications">
        ${ICONS.bell}
        <span class="notif-badge" id="notif-count" style="display:none" aria-live="polite">0</span>
      </button>
      <div id="user-menu">
        <div class="skeleton" style="width:80px;height:34px;border-radius:8px"></div>
      </div>
      <button class="mobile-menu-btn" id="mobile-nav-toggle" aria-label="Toggle menu">
        ${ICONS.menu}
      </button>
    </div>

    <div class="navbar-mobile-nav" id="navbar-mobile-nav" role="navigation" aria-label="Mobile navigation">
      ${linksHTML()}
    </div>
  `;

  // ── Mobile nav toggle (bug fix: one listener, not duplicated) ─
  const mobileToggleBtn = document.getElementById('mobile-nav-toggle');
  const mobileNav       = document.getElementById('navbar-mobile-nav');

  mobileToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileNav?.classList.toggle('open');
  });

  // Close mobile nav on outside click — use a named handler so it
  // doesn't stack up across re-renders
  if (window.__navbarOutsideClickHandler) {
    document.removeEventListener('click', window.__navbarOutsideClickHandler);
  }
  window.__navbarOutsideClickHandler = (e) => {
    if (!e.target.closest('#navbar')) {
      document.getElementById('navbar-mobile-nav')?.classList.remove('open');
    }
  };
  document.addEventListener('click', window.__navbarOutsideClickHandler);

  // ── Notification panel toggle (bug fix: one listener) ─────────
  const notifToggleBtn = document.getElementById('notif-toggle');

  notifToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('notif-panel')?.classList.toggle('open');
  });

  if (window.__notifOutsideClickHandler) {
    document.removeEventListener('click', window.__notifOutsideClickHandler);
  }
  window.__notifOutsideClickHandler = (e) => {
    if (!e.target.closest('#notif-toggle') && !e.target.closest('#notif-panel')) {
      document.getElementById('notif-panel')?.classList.remove('open');
    }
  };
  document.addEventListener('click', window.__notifOutsideClickHandler);

  // ── Auth state → populate user menu ──────────────────────────
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const adminUser = await isAdmin();
    const userMenu  = document.getElementById('user-menu');

    // Inject admin link if applicable
    if (adminUser && activePage !== 'admin') {
      const adminLink = `<a href="admin.html" class="navbar-nav-link ${activePage === 'admin' ? 'active' : ''}">${ICONS.admin} Admin</a>`;
      document.getElementById('navbar-nav')?.insertAdjacentHTML('beforeend', adminLink);
      document.getElementById('navbar-mobile-nav')?.insertAdjacentHTML('beforeend', adminLink);
    }

    const username = user.email?.split('@')[0] ?? 'User';

    userMenu.innerHTML = `
      <span class="user-handle">
        <span class="username-text">${username}</span>
        ${adminUser ? '<span class="badge-chip cyan" style="font-size:0.7rem">Admin</span>' : ''}
      </span>
      <button
        class="btn btn-ghost btn-sm"
        id="signout-btn"
        style="display:flex;align-items:center;gap:0.4rem"
        title="Sign Out"
        aria-label="Sign Out"
      >
        ${ICONS.signout} <span class="signout-label">Sign Out</span>
      </button>
    `;

    // Sign-out handler — using addEventListener instead of inline onclick
    // avoids potential CSP issues with inline event handlers
    document.getElementById('signout-btn')?.addEventListener('click', async () => {
      try {
        await logoutUser();
        window.location.href = 'https://hnuicpc.github.io/icpc-academy/';
      } catch (err) {
        console.error('Logout failed:', err);
        showToast('Sign out failed. Please try again.', 'error');
      }
    });

    loadNotifications(user.uid);
  });
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────
async function loadNotifications(uid) {
  try {
    const notifs  = await getUserNotifications(uid);
    const unread  = notifs.filter(n => !n.read);
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
      list.innerHTML = `
        <div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:0.88rem">
          No notifications yet
        </div>`;
      return;
    }

    list.innerHTML = notifs.map(n => {
      const time      = n.createdAt?.toDate ? timeAgo(n.createdAt.toDate()) : '';
      const typeIcon  = n.type === 'warning'      ? ICONS.warning
                      : n.type === 'announcement' ? ICONS.announce
                      : ICONS.target;
      const typeColor = n.type === 'warning'      ? 'var(--warning)'
                      : n.type === 'announcement' ? 'var(--accent)'
                      : 'var(--success)';
      return `
        <div
          class="notif-item ${n.read ? '' : 'unread'}"
          data-id="${n.id}"
          onclick="window._readNotif('${n.id}', this)"
          role="button"
          tabindex="0"
        >
          <div class="notif-dot ${n.read ? 'read' : ''}"></div>
          <div style="flex:1">
            <div class="notif-item-title" style="display:flex;align-items:center;gap:0.4rem">
              <span style="color:${typeColor}">${typeIcon}</span> ${n.title}
            </div>
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
  } catch (err) {
    console.warn('Notifications load failed:', err);
  }
}

// ── TIME HELPER ───────────────────────────────────────────────────
function timeAgo(date) {
  const secs = Math.floor((Date.now() - date) / 1000);
  if (secs < 60)    return 'Just now';
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

// ── SIDEBAR RENDERER (legacy stub) ───────────────────────────────
export function renderSidebar(activePage = '', showAdmin = false) {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.style.display = 'none';
}