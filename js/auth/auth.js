import { auth, db } from '../core/firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Validate Codeforces handle
export async function validateCodeforcesHandle(handle) {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await res.json();
    return data.status === 'OK';
  } catch {
    return false;
  }
}

// Register new user
export async function registerUser(email, password, codeforcesHandle) {
  const isValid = await validateCodeforcesHandle(codeforcesHandle);
  if (!isValid) throw new Error('Invalid Codeforces handle. Please check and try again.');

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);

  await setDoc(doc(db, 'users', cred.user.uid), {
    email,
    codeforcesHandle,
    currentLevel: 0,
    currentWeek: 1,
    streak: 0,
    lastActivity: null,
    badges: [],
    progress: {},
    createdAt: serverTimestamp()
  });

  return cred.user;
}

// Login
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  if (!cred.user.emailVerified) {
    await signOut(auth);
    throw new Error('Please verify your email before logging in. Check your inbox.');
  }
  // Award first login badge
  await awardBadgeIfNew(cred.user.uid, 'first_login');
  return cred.user;
}

// Logout
export async function logoutUser() {
  await signOut(auth);
  window.location.href = '/index.html';
}

// Check if current user is admin
export async function isAdmin() {
  const user = auth.currentUser;
  if (!user) return false;
  const token = await user.getIdTokenResult(true);
  return token.claims.admin === true;
}

// Get current user profile
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Award badge helper
export async function awardBadgeIfNew(uid, badgeId) {
  try {
    const { updateDoc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      badges: arrayUnion(badgeId)
    });
  } catch {}
}

// Auth state observer
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Require auth + verified (redirect if not)
export async function requireAuth(redirectTo = '/index.html') {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (!user || !user.emailVerified) {
        window.location.href = redirectTo;
        reject(new Error('Not authenticated'));
      } else {
        resolve(user);
      }
    });
  });
}

// Require admin
export async function requireAdmin() {
  const user = await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    window.location.href = '/pages/dashboard.html';
    throw new Error('Not admin');
  }
  return user;
}
