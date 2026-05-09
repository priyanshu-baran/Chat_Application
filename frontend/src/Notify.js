/* eslint-disable jsx-a11y/heading-has-content */
import { useEffect, useState } from 'react';

export const Notify = () => {
  const [, setTimer] = useState(10);
  const [isTabFocused, setIsTabFocused] = useState(true);
  useEffect(() => {
    const popup = document.querySelector('.popup');
    const wifiIcon = document.querySelector('.icon i');
    const popupTitle = document.querySelector('.popup .title');
    const popupDesc = document.querySelector('.desc');
    const reconnectBtn = document.querySelector('.reconnect');
    let isOnline = true;
    let intervalId;
    const checkConnection = async () => {
      try {
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/posts',
        );
        isOnline = response.status >= 200 && response.status < 300;
      } catch {
        isOnline = false;
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
        'Your network is unavailable. Reconnecting in <b>10</b> seconds.';
      popup.className = 'popup show';
      intervalId = setInterval(decrementTimer, 1000);
    };
    const decrementTimer = () => {
      setTimer((prev) => {
        const next = prev - 1;
        if (next === 0) checkConnection();
        const b = popup.querySelector('.desc b');
        if (b) b.innerText = next;
        return next;
      });
    };
    const handleVisibilityChange = () => {
      setIsTabFocused(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(() => {
      if (isOnline && isTabFocused) checkConnection();
    }, 4000);
    if (isOnline && isTabFocused) checkConnection();
    reconnectBtn.addEventListener('click', checkConnection);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      clearInterval(intervalId);
    };
  }, [isTabFocused]);
  return (
    <div className='popup'>
      <div className='icon'>
        <i className='' />
      </div>
      <div className='details'>
        <h2 className='title' />
        <p className='desc' />
        <button className='reconnect'>Reconnect Now</button>
      </div>
    </div>
  );
};
