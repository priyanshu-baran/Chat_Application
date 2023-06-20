/* eslint-disable jsx-a11y/heading-has-content */
import { useEffect, useState } from 'react';

export const Notify = ({ online, setOnline }) => {
  const [, setTimer] = useState(10);
  const [isTabFocused, setIsTabFocused] = useState(true);
  useEffect(() => {
    const popup = document.querySelector('.popup'),
      wifiIcon = document.querySelector('.icon i'),
      popupTitle = document.querySelector('.popup .title'),
      popupDesc = document.querySelector('.desc'),
      reconnectBtn = document.querySelector('.reconnect');
    let isOnline = true;
    let intervalId;
    const checkConnection = async () => {
      try {
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/posts'
        );
        isOnline = response.status >= 200 && response.status < 300;
        setOnline(isOnline);
      } catch (error) {
        isOnline = false;
        setOnline(false);
      }
      setTimer(10);
      clearInterval(intervalId);
      handlePopup(isOnline);
    };
    const handlePopup = (status) => {
      if (status) {
        wifiIcon.className = 'uil uil-wifi';
        popupTitle.innerText = 'Restored Connection';
        popupDesc.innerHTML =
          'Your device is now successfully connected to the internet.';
        popup.classList.add('online');
        return setTimeout(() => popup.classList.remove('show'), 2000);
      }
      wifiIcon.className = 'uil uil-wifi-slash';
      popupTitle.innerText = 'Lost Connection';
      popupDesc.innerHTML =
        'Your network is unavailable. We will attempt to reconnect you in <b>10</b> seconds.';
      popup.className = 'popup show';
      intervalId = setInterval(decrementTimer, 1000);
    };
    const decrementTimer = () => {
      setTimer((prevTimer) => {
        const newtimer = prevTimer - 1;
        if (newtimer === 0) checkConnection();
        popup.querySelector('.desc b').innerText = newtimer;
        return newtimer;
      });
    };
    const handleVisibilityChange = () => {
      setIsTabFocused(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const startInterval = () => {
      if (isOnline && isTabFocused) {
        checkConnection();
      }
    };
    let interval = setInterval(startInterval, 4000);
    if (isOnline && isTabFocused) {
      checkConnection();
    }
    if (!isTabFocused) {
      setTimer(10);
      clearInterval(interval);
    }
    reconnectBtn.addEventListener('click', checkConnection);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      clearInterval(intervalId);
    };
  }, [isTabFocused, setOnline]);
  return (
    <div className='popup'>
      <div className='icon'>
        <i className=''></i>
      </div>
      <div className='details'>
        <h2 className='title'></h2>
        <p className='desc'></p>
        <button className='reconnect'>Reconnect Now</button>
      </div>
    </div>
  );
};
