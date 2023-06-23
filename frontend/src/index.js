import React from 'react';
import ReactDOM from 'react-dom/client';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

import 'react-toastify/dist/ReactToastify.css';

import { App } from './App';
import './css/main.css';
import './css/entrance.css';
import './css/notify.css';

// const react_url = 'http://localhost:5000';
const react_url = 'https://web-based-real-time-chat-application.netlify.app';
const auth = getAuth(
  initializeApp({
    apiKey: 'AIzaSyBNdhxEV9ohe6BWBJLQDkwGUoqPxIv0vJo',
    authDomain: 'chat-application-5f522.firebaseapp.com',
    projectId: 'chat-application-5f522',
    storageBucket: 'chat-application-5f522.appspot.com',
    messagingSenderId: '894185975108',
    appId: '1:894185975108:web:274174eab724a786507b11',
    measurementId: 'G-N2T9KKMYG1',
  })
);

export const data = { react_url, auth };

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in');
    const userString = JSON.stringify(user, (key, value) => {
      if (value === undefined) {
        return null;
      }
      return value;
    });
    sessionStorage.setItem('user', userString);
  } else {
    console.log('User is signed out');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
