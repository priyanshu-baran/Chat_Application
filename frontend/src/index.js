import React from 'react';
import ReactDOM from 'react-dom/client';
import { getAuth, getIdTokenResult, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

import 'react-toastify/dist/ReactToastify.css';

import { App } from './App';
import './css/main.css';
import './css/test.css';
import './css/entrance.css';
import './css/notify.css';

const react_url = 'http://localhost:5000';
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
    const userString = JSON.stringify(user);
    sessionStorage.setItem('user', userString);
    getIdTokenResult(user)
      .then((idTokenResult) => {
        const expirationTime = idTokenResult.expirationTime;
        console.log('Token expiration time:', expirationTime);
      })
      .catch((error) => {
        console.error('Error occurred while retrieving token result:', error);
      });
  } else {
    console.log('User is signed out');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
