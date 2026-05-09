import React from 'react';
import ReactDOM from 'react-dom/client';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  serverTimestamp,
  onDisconnect,
  onValue,
} from 'firebase/database';

import 'react-toastify/dist/ReactToastify.css';
import 'react-loading-skeleton/dist/skeleton.css';

import { App } from './App';
import './css/main.css';
import './css/entrance.css';
import './css/notify.css';
import './css/settings.css';

const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
});

const auth = getAuth(app);
const db = getDatabase(app);

export const data = { auth, db };

let presenceUnsubscribe = null;

const setupPresence = (user) => {
  const userStatusRef = ref(db, `/presence/${user.uid}`);
  const connectedRef = ref(db, '.info/connected');

  presenceUnsubscribe = onValue(connectedRef, (snap) => {
    if (!snap.val()) return;
    onDisconnect(userStatusRef)
      .set({ state: 'offline', last_changed: serverTimestamp() })
      .then(() => {
        set(userStatusRef, {
          state: 'online',
          last_changed: serverTimestamp(),
        });
      })
      .catch((err) => console.error('Presence setup error:', err));
  });
};

const teardownPresence = (uid) => {
  if (presenceUnsubscribe) {
    presenceUnsubscribe();
    presenceUnsubscribe = null;
  }
  const userStatusRef = ref(db, `/presence/${uid}`);
  set(userStatusRef, {
    state: 'offline',
    last_changed: serverTimestamp(),
  }).catch((err) => console.error('Failed to set offline on sign-out:', err));
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    const userString = JSON.stringify(user, (_, v) =>
      v === undefined ? null : v,
    );
    localStorage.setItem('user', userString);
    setupPresence(user);
  } else {
    const cached = JSON.parse(localStorage.getItem('user') || 'null');
    if (cached?.uid) teardownPresence(cached.uid);
    localStorage.removeItem('user');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
