// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

const firebaseConfig = {
apiKey: "AIzaSyCkdqBDlyjxYGITnGNE7phfNxUguJ2gm-Q",
    authDomain: "icpc-academy-388f8.firebaseapp.com",
    projectId: "icpc-academy-388f8",
    storageBucket: "icpc-academy-388f8.firebasestorage.app",
    messagingSenderId: "1047619006167",
    appId: "1:1047619006167:web:40ca0013ea7cb0d8984a92",
    measurementId: "G-4K3RJXLZSQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
