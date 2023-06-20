import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import axios from 'axios';

import { data } from '.';
const socket = io('http://localhost:5000');

export const Main = ({ online }) => {
  const [room, setRoom] = useState('');
  const dummy = useRef();
  const field = useRef();
  const usenavigate = useNavigate('');
  const [userDetails, setUserDetails] = useState({});
  const [isChecked, setIsChecked] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [recieverInfo, setRecieverInfo] = useState('');
  const [msg, setMsg] = useState('');
  const [msgList, setMsgList] = useState([]);
  const [chatList, setChatList] = useState({
    usersList: {
      online: [],
      offline: [],
    },
    color: ['indigo', 'gray', 'orange', 'pink', 'purple'],
    unreadMsg: [2, '', 1, '', ''],
  });
  const updateChatList = (onlineUsers, offlineUsers) => {
    setChatList((prevChatList) => ({
      ...prevChatList,
      usersList: {
        online: onlineUsers,
        offline: offlineUsers,
      },
    }));
  };
  const [userInfo, setUserInfo] = useState({
    username: '',
    shortdesc: 'Full Stack Developer',
    photoUrl: '',
  });
  const handleChecked = () => {
    setIsChecked(!isChecked);
  };
  const generateRoomId = (user1Id, user2Id) => {
    const sortedIds = [user1Id, user2Id].sort();
    const roomId = sortedIds.join('_');
    return roomId;
  };
  const handleReciever = async (list) => {
    setIsVisible(true);
    setMsgList([]);
    setRecieverInfo(list);
    await axios
      .get(`${data.react_url}/users/${list}`)
      .then((res) => {
        const roomId = generateRoomId(
          res.data.email,
          data.auth.currentUser.email
        );
        setRoom(roomId);
        socket.emit('join_room', roomId);
        socket.on('initial_messages', (initialMessages) => {
          if (Array.isArray(initialMessages) && initialMessages.length > 0) {
            const sortedMessages = initialMessages.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            const updatedMsg = sortedMessages.map((message) => ({
              from: message.from,
              to: message.to,
              msg: message.message,
              time: message.time,
            }));
            setMsgList([...updatedMsg]);
          }
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const handleClicked = () => {
    if (msg !== null && msg !== '') {
      const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const msgContent = {
        from: data.auth.currentUser.displayName,
        to: recieverInfo,
        msg,
        time: currentTime,
      };
      const updatedMsg = [...msgList, msgContent];
      const details = {
        room,
        msgContent,
      };
      console.log(details.room);
      socket.emit('send_message', details);
      setMsgList(updatedMsg);
      setMsg('');
      field.current.focus();
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleClicked();
    }
  };
  const handleSignOutWithGoogle = () => {
    data.auth.currentUser && data.auth.signOut();
    socket.emit('leave_room', room);
    socket.emit('loggedOut', userDetails);
    usenavigate('/');
    toast.success('Logged out successfully');
    sessionStorage.removeItem('user');
  };
  useEffect(() => {
    const userString = sessionStorage.getItem('user');
    const user = JSON.parse(userString);
    setUserDetails(user);
    const updateUserInfo = () => {
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        username: userDetails.displayName,
        photoUrl: userDetails.photoURL,
      }));
    };
    const handleKeyPress = (e) => {
      const isValidKey = /^[a-zA-Z0-9!@#$%^&*()]+$/.test(e.key);
      if (isValidKey && recieverInfo !== '') {
        field.current.focus();
      }
    };
    updateUserInfo();
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [recieverInfo, userDetails.displayName, userDetails.photoURL]);

  useEffect(() => {
    socket.on('userLoggedIn', (user) => {
      const updatedOnlineUsers = chatList.usersList.online.filter(
        (username) => username !== user
      );
      updateChatList(updatedOnlineUsers, chatList.usersList.offline);
      if (user !== data.auth.currentUser.displayName) {
        toast.info(`${user} logged In`);
      }
    });

    socket.on('updateUserLists', ({ onlineUsers, offlineUsers }) => {
      const filteredOnlineUsers = onlineUsers.filter(
        (user) => user !== data.auth.currentUser.displayName
      );
      const filteredOfflineUsers = offlineUsers.filter(
        (user) => user !== data.auth.currentUser.displayName
      );
      updateChatList(filteredOnlineUsers, filteredOfflineUsers);
    });

    socket.on('userLoggedOut', (user) => {
      const updatedOfflineUsers = chatList.usersList.offline.filter(
        (username) => username !== user
      );
      updateChatList(chatList.usersList.online, updatedOfflineUsers);
      if (user !== userDetails.displayName) {
        toast.info(`${user} logged out`);
      }
    });
    return () => {
      socket.off('updateUserLists');
      socket.off('userLoggedOut');
      socket.off('userLoggedIn');
    };
  }, [chatList, userDetails.displayName]);

  useEffect(() => {
    socket.on('receive_message', (content) => {
      const updatedMsg = [
        ...msgList,
        {
          from: content.from,
          to: content.to,
          msg: content.msg,
          time: content.time,
        },
      ];
      setMsgList(updatedMsg);
    });
    return () => {
      socket.off('receive_message');
    };
  }, [msgList]);

  return (
    <div
      className='h-screen overflow-hidden flex items-center justify-center'
      style={{ background: '#edf2f7' }}>
      <div className='flex h-screen antialiased text-gray-800'>
        <div className='flex flex-row h-full w-full overflow-x-hidden'>
          <div className='flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0'>
            <div className='flex flex-row items-center justify-center h-12 w-full'>
              <div className='flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'></path>
                </svg>
              </div>
              <div className='ml-2 font-bold text-2xl'>QuickChat</div>
            </div>
            <div
              style={{ marginLeft: '-8px' }}
              className='flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg'>
              <div className='h-20 w-20 rounded-full border overflow-hidden'>
                <img
                  src={userInfo.photoUrl}
                  alt='Avatar'
                  className='h-full w-full'
                />
              </div>
              <div className='text-lg font-semibold mt-2'>
                {userInfo.username}
              </div>
              <div className='text-lg text-gray-500'>{userInfo.shortdesc}</div>
              <div className='flex flex-row items-center mt-3'>
                <div className='switch-toggle'>
                  <input
                    type='checkbox'
                    id='bluetooth'
                    checked={online}
                    onChange={handleChecked}
                    disabled
                  />
                  <label htmlFor='bluetooth'></label>
                </div>
                <div
                  className={`leading-none ml-1 text-lg ${
                    online ? 'online' : 'offline'
                  }`}>
                  {online ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
            <div className='flex flex-col mt-8'>
              <div className='flex flex-row items-center justify-between text-xs'>
                <span className='font-bold'>Active Conversations</span>
                <span className='flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full'>
                  {chatList.usersList.online.length}
                </span>
              </div>
              <div
                style={{ borderBottom: '1px dashed black', height: '180px' }}
                className='flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto'>
                {chatList.usersList.online.map((list, index) => (
                  <button
                    key={index}
                    onClick={() => handleReciever(list)}
                    className={`flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 btn_hover ${
                      recieverInfo === list ? 'selected' : ''
                    }`}>
                    <div
                      className={`flex items-center justify-center h-8 w-8 bg-${chatList.color[index]}-200 rounded-full`}>
                      {list
                        .split(' ')
                        .map((word) => word.charAt(0))
                        .join('')}
                    </div>
                    <div className='ml-2 text-sm font-semibold'>{list}</div>
                    {chatList.unreadMsg[index] &&
                      chatList.unreadMsg[index] !== 0 && (
                        <div className='flex items-center justify-center ml-auto text-xs text-white bg-red-500 h-4 w-4 rounded leading-none'>
                          {chatList.unreadMsg[index]}
                        </div>
                      )}
                  </button>
                ))}
              </div>
              <div className='flex flex-row items-center justify-between text-xs mt-6'>
                <span className='font-bold'>Currently Offline Users</span>
                <span className='flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full'>
                  {chatList.usersList.offline.length}
                </span>
              </div>
              <div className='flex flex-col space-y-1 mt-4 -mx-2'>
                {chatList.usersList.offline.map((list, index) => (
                  <button
                    key={index}
                    onClick={() => handleReciever(list)}
                    className={`flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 btn_hover ${
                      recieverInfo === list ? 'selected' : ''
                    }`}>
                    <div className='flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full'>
                      {list
                        .split(' ')
                        .map((word) => word.charAt(0))
                        .join('')}
                    </div>
                    <div className='ml-2 text-sm font-semibold'>{list}</div>
                  </button>
                ))}
              </div>
              <div style={{ padding: '10px' }}></div>
              <button
                onClick={handleSignOutWithGoogle}
                className='flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0'>
                <span>LogOut</span>
              </button>
            </div>
          </div>
          {isVisible && (
            <div className='flex flex-col flex-auto h-full p-6'>
              <div className='flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4'>
                <div className='flex flex-col h-full overflow-x-auto mb-4'>
                  <div className='flex flex-col h-full'>
                    <div className='grid grid-cols-12 gap-y-2'>
                      {msgList.map((message, index) => (
                        <div
                          key={index}
                          className={`col-start-${
                            message.from === data.auth.currentUser.displayName
                              ? '6'
                              : '1'
                          } col-end-${
                            message.from === data.auth.currentUser.displayName
                              ? '13'
                              : '8'
                          } p-3 rounded-lg`}>
                          <div
                            className={`flex ${
                              message.from === data.auth.currentUser.displayName
                                ? 'justify-start flex-row-reverse'
                                : 'items-center'
                            }`}>
                            <div
                              className={`flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0`}>
                              {message.from ===
                              data.auth.currentUser.displayName
                                ? userInfo.username
                                    .split(' ')
                                    .map((word) => word.charAt(0))
                                    .join('')
                                : recieverInfo
                                    .split(' ')
                                    .map((word) => word.charAt(0))
                                    .join('')}
                            </div>
                            <div
                              style={{
                                wordWrap: 'break-word',
                                maxWidth: '550px',
                              }}
                              className={`relative ${
                                message.from ===
                                data.auth.currentUser.displayName
                                  ? 'mr-3 bg-indigo-100'
                                  : 'ml-3 bg-white'
                              } text-sm py-2 px-4 shadow rounded-xl`}>
                              <div>{message.msg}</div>
                              {message.from ===
                                data.auth.currentUser.displayName && (
                                <div
                                  style={{ minWidth: '100px' }}
                                  className='absolute text-xs bottom-0 right-0 -mb-5 mr-2 text-gray-500'>
                                  {message.time} &nbsp; Seen
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={dummy}></div>
                      {/* <div className='col-start-1 col-end-8 p-3 rounded-lg'>
                      <div className='flex flex-row items-center'>
                        <div className='flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0'>
                          A
                        </div>
                        <div className='relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl'>
                          <div className='flex flex-row items-center'>
                            <button className='flex items-center justify-center bg-indigo-600 hover:bg-indigo-800 rounded-full h-8 w-10'>
                              <svg
                                className='w-6 h-6 text-white'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='1.5'
                                  d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'></path>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='1.5'
                                  d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                              </svg>
                            </button>
                            <div className='flex flex-row items-center space-x-px ml-4'>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-4 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-8 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-8 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-10 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-10 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-12 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-10 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-6 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-5 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-4 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-3 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-10 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-10 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-8 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-8 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-1 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-1 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-8 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-8 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-2 w-1 bg-gray-500 rounded-lg'></div>
                              <div className='h-4 w-1 bg-gray-500 rounded-lg'></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div> */}
                    </div>
                  </div>
                </div>
                <div className='flex flex-row items-center h-16 rounded-xl bg-white w-full px-4'>
                  <div>
                    <button className='flex items-center justify-center text-gray-400 hover:text-gray-600'>
                      <svg
                        style={{ color: 'black' }}
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        xmlns='http://www.w3.org/2000/svg'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'></path>
                      </svg>
                    </button>
                  </div>
                  <div className='flex-grow ml-4'>
                    <div className='relative w-full'>
                      <input
                        style={{ paddingRight: '45px' }}
                        ref={field}
                        type='text'
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className='flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10'
                      />
                      <button className='absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600'>
                        <svg
                          style={{ color: 'black' }}
                          className='w-6 h-6'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                          xmlns='http://www.w3.org/2000/svg'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className='ml-4'>
                    <button
                      onClick={handleClicked}
                      className='flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0'>
                      <span>Send</span>
                      <span className='ml-2'>
                        <svg
                          className='w-4 h-4 transform rotate-45 -mt-px'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                          xmlns='http://www.w3.org/2000/svg'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'></path>
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
