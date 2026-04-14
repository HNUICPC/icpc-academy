import { db } from './firebase-config.js';
import {
  doc, updateDoc, addDoc, collection, query, where,
  getDocs, orderBy, limit, serverTimestamp, increment, arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── BADGE DEFINITIONS ──────────────────────────────────────────────
export const BADGES = {
  first_login:    { id: 'first_login',    icon: '🚀', label: 'First Login',       desc: 'Welcome to ICPC Academy!' },
  first_week:     { id: 'first_week',     icon: '📖', label: 'Week Warrior',       desc: 'Completed your first week!' },
  streak_7:       { id: 'streak_7',       icon: '🔥', label: '7-Day Streak',       desc: 'Active 7 days in a row!' },
  streak_30:      { id: 'streak_30',      icon: '⚡', label: '30-Day Streak',      desc: 'Unstoppable! 30 days streak.' },
  level_complete: { id: 'level_complete', icon: '🏆', label: 'Level Master',       desc: 'Completed a full level!' },
  perfect_week:   { id: 'perfect_week',   icon: '💎', label: 'Perfect Week',       desc: '100% completion in a week!' },
  early_bird:     { id: 'early_bird',     icon: '🌅', label: 'Early Bird',         desc: 'Logged in before 7 AM!' },
  night_owl:      { id: 'night_owl',      icon: '🦉', label: 'Night Owl',          desc: 'Studied past midnight!' },
};

// ─── STREAK SYSTEM ──────────────────────────────────────────────────
export async function updateStreak(uid, userProfile) {
  const now = new Date();
  const lastActivity = userProfile.lastActivity?.toDate();
  const userRef = doc(db, 'users', uid);

  if (!lastActivity) {
    await updateDoc(userRef, { streak: 1, lastActivity: serverTimestamp() });
    return 1;
  }

  const diffHours = (now - lastActivity) / (1000 * 60 * 60);

  if (diffHours < 24) {
    // Same day — no change
    return userProfile.streak;
  } else if (diffHours < 48) {
    // Consecutive day
    const newStreak = (userProfile.streak || 0) + 1;
    await updateDoc(userRef, { streak: newStreak, lastActivity: serverTimestamp() });
    // Check streak badges
    if (newStreak >= 7)  await awardBadge(uid, 'streak_7');
    if (newStreak >= 30) await awardBadge(uid, 'streak_30');
    return newStreak;
  } else {
    // Streak broken
    await updateDoc(userRef, { streak: 1, lastActivity: serverTimestamp() });
    return 1;
  }
}

// ─── BADGE SYSTEM ───────────────────────────────────────────────────
export async function awardBadge(uid, badgeId) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { badges: arrayUnion(badgeId) });
  // Create notification for badge
  await addNotification(uid, {
    type: 'progress',
    title: `🏅 Badge Earned: ${BADGES[badgeId]?.label}`,
    message: BADGES[badgeId]?.desc || 'You earned a new badge!'
  });
}

// ─── PROGRESS TRACKING ──────────────────────────────────────────────
export async function markSectionComplete(uid, levelId, weekId, sectionId, allSections) {
  const userRef = doc(db, 'users', uid);
  const progressKey = `progress.${levelId}_${weekId}_${sectionId}`;

  await updateDoc(userRef, {
    [progressKey]: true
  });

  // Check if all sections in week are done
  const weekProgress = allSections.every(s =>
    s.id === sectionId ? true : false // will be rechecked from fresh data
  );

  return true;
}

export async function getWeekProgress(uid, levelId, weekId, sections) {
  const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return { completed: 0, total: sections.length, percent: 0 };

  const progress = snap.data().progress || {};
  let completed = 0;
  sections.forEach(s => {
    if (progress[`${levelId}_${weekId}_${s.id}`]) completed++;
  });

  const percent = sections.length > 0 ? Math.round((completed / sections.length) * 100) : 0;
  return { completed, total: sections.length, percent };
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────
export async function addNotification(uid, { type, title, message }) {
  await addDoc(collection(db, 'notifications'), {
    uid,
    type,   // 'warning' | 'announcement' | 'progress'
    title,
    message,
    read: false,
    createdAt: serverTimestamp()
  });
}

export async function getUserNotifications(uid) {
  const q = query(
    collection(db, 'notifications'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function markNotificationRead(notifId) {
  await updateDoc(doc(db, 'notifications', notifId), { read: true });
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────
export async function getLeaderboard() {
  const { getDocs, collection, orderBy, limit, query } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const q = query(
    collection(db, 'users'),
    orderBy('currentWeek', 'desc'),
    orderBy('streak', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({ rank: i + 1, id: d.id, ...d.data() }));
}

// ─── CONTENT LOADERS ─────────────────────────────────────────────────
export async function getLevels() {
  const { getDocs, collection, orderBy, query } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const snap = await getDocs(query(collection(db, 'levels'), orderBy('order')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getWeeks(levelId) {
  const { getDocs, collection, orderBy, query, where } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const snap = await getDocs(query(
    collection(db, 'weeks'),
    where('levelId', '==', levelId),
    orderBy('order')
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getSections(weekId) {
  const { getDocs, collection, orderBy, query, where } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const snap = await getDocs(query(
    collection(db, 'sections'),
    where('weekId', '==', weekId),
    orderBy('order')
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
