import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ref, onValue } from 'firebase/database';
import io from 'socket.io-client';
import axios from 'axios';
import { ListenToUserPresence } from './ListenToUserPresence';
import { SkeletonUI, SkeletonMsg } from './SkeletonUI';
import { Settings } from './Settings';

import { data } from '.';

const socket = io(process.env.REACT_APP_BACKEND_URL);

const AVATAR_COLORS = [
  '#7c3aed',
  '#0ea5e9',
  '#ec4899',
  '#f97316',
  '#10b981',
  '#f59e0b',
  '#6366f1',
];
const avatarColor = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];
const getInitials = (name = '') =>
  name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

const EMOJIS = [
  '😊',
  '😂',
  '❤️',
  '👍',
  '🔥',
  '😍',
  '🙏',
  '😭',
  '✨',
  '🎉',
  '😎',
  '🤔',
  '👀',
  '💯',
  '😅',
  '🥺',
  '🫡',
  '🤝',
  '💬',
  '⚡',
];

const SeenTick = ({ seen }) => (
  <span
    className={`msg-tick ${seen ? 'msg-tick--seen' : 'msg-tick--sent'}`}
    title={seen ? 'Seen' : 'Sent'}>
    {seen ? (
      <svg
        viewBox='0 0 16 11'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M1 5.5L4.5 9L11 2'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M5 5.5L8.5 9L15 2'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ) : (
      <svg
        viewBox='0 0 10 11'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M1 5.5L4 8.5L9 2'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    )}
  </span>
);

export const Main = () => {
  const navigate = useNavigate('');
  const dummy = useRef();
  const field = useRef();
  const messagesRef = useRef();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('qc-theme') || 'dark',
  );
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [room, setRoom] = useState('');
  const [isLoading, setIsLoading] = useState({ UI: true, MSG: true });
  const [userDetails, setUserDetails] = useState({});
  const [userInfo, setUserInfo] = useState({
    username: '',
    shortdesc: 'Full Stack Developer',
    photoUrl: '',
  });
  const [isVisible, setIsVisible] = useState(false);
  const [recieverInfo, setRecieverInfo] = useState({ username: '', email: '' });
  const [msg, setMsg] = useState('');
  const [msgList, setMsgList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [presenceMap, setPresenceMap] = useState({});
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = theme === 'dark';
  const onlineUsers = allUsers.filter(
    (u) => presenceMap[u.firebaseUid] === 'online',
  );
  const offlineUsers = allUsers.filter(
    (u) => presenceMap[u.firebaseUid] !== 'online',
  );
  const filterUsers = (list) =>
    searchQuery.trim()
      ? list.filter((u) =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : list;
  const generateRoomId = (a, b) => [a, b].sort().join('_');
  useEffect(() => {
    localStorage.setItem('qc-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/');
      return;
    }
    let infoUser = JSON.parse(userString);
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/users/`)
      .then((res) => {
        const me = res.data.find((u) => u.email === infoUser.email);
        if (!me) {
          navigate('/');
          return;
        }
        if (!infoUser.displayName)
          infoUser = { ...infoUser, displayName: me.username };
        setUserDetails(infoUser);
        setUserInfo({
          username: infoUser.displayName,
          shortdesc: me.about || 'Full Stack Developer',
        });
        setAllUsers(res.data.filter((u) => u.email !== infoUser.email));
      })
      .catch(console.error);
  }, [navigate]);
  useEffect(() => {
    if (!allUsers.length) return;
    const unsubs = allUsers
      .filter((u) => u.firebaseUid)
      .map((u) =>
        ListenToUserPresence(u.firebaseUid, ({ state }) =>
          setPresenceMap((prev) => ({ ...prev, [u.firebaseUid]: state })),
        ),
      );
    return () => unsubs.forEach((fn) => fn());
  }, [allUsers]);

  useEffect(() => {
    const unsub = onValue(ref(data.db, '.info/connected'), (snap) =>
      setIsFirebaseConnected(!!snap.val()),
    );
    return unsub;
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (
        /^[a-zA-Z0-9]$/.test(e.key) &&
        recieverInfo.username &&
        field.current &&
        document.activeElement !== field.current
      ) {
        field.current.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [recieverInfo.username]);
  useEffect(() => {
    const t = setTimeout(
      () => setIsLoading((p) => ({ ...p, UI: false })),
      2000,
    );
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    socket.on('receive_message', (content) => {
      setMsgList((prev) => [...prev, { ...content, seen: false }]);
      setTimeout(
        () => dummy.current?.scrollIntoView({ behavior: 'smooth' }),
        50,
      );
      if (room && recieverInfo.username) {
        socket.emit('mark_seen', { room, username: userDetails.displayName });
      }
    });
    return () => socket.off('receive_message');
  }, [msgList, room, recieverInfo.username, userDetails.displayName]);
  useEffect(() => {
    socket.on('messages_seen', ({ seenBy }) => {
      setMsgList((prev) =>
        prev.map((m) =>
          m.from === userDetails.displayName && m.to === seenBy
            ? { ...m, seen: true }
            : m,
        ),
      );
    });
    return () => socket.off('messages_seen');
  }, [userDetails.displayName]);
  const handleReciever = useCallback(
    (user) => {
      setIsVisible(true);
      setShowEmojiPicker(false);
      setIsLoading((p) => ({ ...p, MSG: true }));
      setMsgList([]);
      setRecieverInfo({ username: user.username, email: user.email });
      setTimeout(() => setIsLoading((p) => ({ ...p, MSG: false })), 800);
      const roomId = generateRoomId(user.email, data.auth.currentUser.email);
      setRoom(roomId);
      socket.emit('join_room', roomId);
      socket.emit('mark_seen', {
        room: roomId,
        username: userDetails.displayName,
      });
      socket.once('initial_messages', (msgs) => {
        if (!Array.isArray(msgs) || !msgs.length) return;
        setMsgList(
          [...msgs]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((m) => ({
              from: m.from,
              to: m.to,
              msg: m.message,
              time: m.time,
              seen: m.seen,
            })),
        );
        setTimeout(
          () => dummy.current?.scrollIntoView({ behavior: 'smooth' }),
          100,
        );
      });
    },
    [userDetails.displayName],
  );
  const handleClicked = () => {
    if (!msg.trim()) return;
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const msgContent = {
      from: userDetails.displayName,
      to: recieverInfo.username,
      msg: msg.trim(),
      time,
      seen: false,
    };
    socket.emit('send_message', { room, msgContent });
    setMsgList((prev) => [...prev, msgContent]);
    setMsg('');
    setShowEmojiPicker(false);
    field.current?.focus();
    setTimeout(() => dummy.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };
  const handleSettingsSave = ({ username, shortdesc }) => {
    setUserInfo((p) => ({ ...p, username, shortdesc }));
  };
  const handleSignOut = () => {
    if (room) socket.emit('leave_room', room);
    data.auth.signOut();
    toast.success('Logged out');
    navigate('/');
  };
  const isReceiverOnline = onlineUsers.some(
    (u) => u.username === recieverInfo.username,
  );
  return (
    <div className={`shell ${isDark ? 'dark' : 'light'}`}>
      {isLoading.UI ? (
        <SkeletonUI />
      ) : (
        <aside className='sb'>
          <div className='sb-top'>
            <div className='sb-brand'>
              <div className='sb-brand-icon'>
                <svg
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                  />
                </svg>
              </div>
              <span className='sb-brand-name'>QuickChat</span>
            </div>
            <button
              className='theme-btn'
              onClick={toggleTheme}
              title='Toggle theme'>
              {isDark ? (
                <svg
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z'
                  />
                </svg>
              ) : (
                <svg
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'
                  />
                </svg>
              )}
            </button>
          </div>
          <div
            className='sb-profile icon_parent'
            onClick={() => setIsSettingsVisible(true)}>
            <div className='sb-avatar-wrap'>
              {userInfo.photoUrl &&
              !userInfo.photoUrl.includes('profile-pic') ? (
                <img
                  src={userInfo.photoUrl}
                  alt=''
                  className='sb-avatar-img'
                />
              ) : (
                <div
                  className='sb-avatar-letter'
                  style={{ background: avatarColor(0) }}>
                  {getInitials(userInfo.username)}
                </div>
              )}
              <span
                className={`sb-status-ring ${isFirebaseConnected ? 'ring-on' : 'ring-off'}`}
              />
            </div>
            <div className='sb-profile-text'>
              <div className='sb-profile-name'>
                {userInfo.username || '…'}
                <i className='bx bx-edit-alt edit_icon' />
              </div>
              <div className='sb-profile-desc'>{userInfo.shortdesc}</div>
            </div>
            <div
              className={`sb-conn-badge ${isFirebaseConnected ? 'badge-on' : 'badge-off'}`}>
              {isFirebaseConnected ? '●' : '○'}
            </div>
          </div>
          <div className='sb-search-wrap'>
            <svg
              className='sb-search-icon'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0'
              />
            </svg>
            <input
              className='sb-search'
              placeholder='Search people…'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className='sb-search-clear'
                onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>
          <div className='sb-lists'>
            <div className='sb-section-label'>
              <span>Active</span>
              <span className='sb-count sb-count--on'>
                {onlineUsers.length}
              </span>
            </div>
            <div className='sb-user-list'>
              {filterUsers(onlineUsers).length === 0 ? (
                <p className='sb-empty'>
                  {searchQuery ? 'No match' : 'No one online'}
                </p>
              ) : (
                filterUsers(onlineUsers).map((user, i) => (
                  <button
                    key={user.firebaseUid || i}
                    onClick={() => handleReciever(user)}
                    className={`sb-user ${recieverInfo.username === user.username ? 'sb-user--active' : ''}`}>
                    <div
                      className='sb-user-av'
                      style={{ background: avatarColor(i) }}>
                      {getInitials(user.username)}
                      <span className='sb-dot sb-dot--on' />
                    </div>
                    <div className='sb-user-info'>
                      <span className='sb-user-name'>{user.username}</span>
                      <span className='sb-user-sub'>Active now</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className='sb-section-label sb-section-label--mt'>
              <span>Offline</span>
              <span className='sb-count'>{offlineUsers.length}</span>
            </div>
            <div className='sb-user-list'>
              {filterUsers(offlineUsers).length === 0 ? (
                <p className='sb-empty'>
                  {searchQuery ? 'No match' : 'Everyone online!'}
                </p>
              ) : (
                filterUsers(offlineUsers).map((user, i) => (
                  <button
                    key={user.firebaseUid || i}
                    onClick={() => handleReciever(user)}
                    className={`sb-user sb-user--dim ${recieverInfo.username === user.username ? 'sb-user--active' : ''}`}>
                    <div className='sb-user-av sb-user-av--grey'>
                      {getInitials(user.username)}
                      <span className='sb-dot sb-dot--off' />
                    </div>
                    <div className='sb-user-info'>
                      <span className='sb-user-name'>{user.username}</span>
                      <span className='sb-user-sub'>Offline</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className='sb-logout'>
            <svg
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
            Sign out
          </button>
        </aside>
      )}
      <main className='chat-main'>
        {isSettingsVisible && (
          <Settings
            onClose={() => setIsSettingsVisible(false)}
            onSave={handleSettingsSave}
            currentUser={{
              username: userInfo.username,
              shortdesc: userInfo.shortdesc,
            }}
          />
        )}
        {!isSettingsVisible && !isVisible && (
          <div className='chat-empty'>
            <div className='chat-empty-blob'>
              <svg
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.3'
                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                />
              </svg>
            </div>
            <h3>Your messages live here</h3>
            <p>Pick a conversation from the left to start chatting</p>
          </div>
        )}
        {!isSettingsVisible &&
          isVisible &&
          (isLoading.MSG ? (
            <SkeletonMsg />
          ) : (
            <div className='chat-panel'>
              <div className='chat-hdr'>
                <div
                  className='chat-hdr-av'
                  style={{ background: avatarColor(0) }}>
                  {getInitials(recieverInfo.username)}
                  <span
                    className={`hdr-dot ${isReceiverOnline ? 'hdr-dot--on' : 'hdr-dot--off'}`}
                  />
                </div>
                <div className='chat-hdr-info'>
                  <span className='chat-hdr-name'>{recieverInfo.username}</span>
                  <span
                    className={`chat-hdr-status ${isReceiverOnline ? 'hdr-status--on' : 'hdr-status--off'}`}>
                    {isReceiverOnline ? 'Active now' : 'Offline'}
                  </span>
                </div>
              </div>
              <div
                className='chat-msgs'
                ref={messagesRef}>
                {msgList.length === 0 && (
                  <div className='msgs-empty'>
                    <span>👋</span> Send a message to start the conversation
                  </div>
                )}
                {msgList.map((message, index) => {
                  const isMine = message.from === userDetails.displayName;
                  const isLast = index === msgList.length - 1;
                  const prevSame =
                    index > 0 && msgList[index - 1].from === message.from;
                  return (
                    <div
                      key={index}
                      className={`msg-wrap ${isMine ? 'msg-wrap--mine' : 'msg-wrap--theirs'} ${prevSame ? 'msg-wrap--grouped' : ''}`}>
                      {!isMine && !prevSame && (
                        <div
                          className='msg-av'
                          style={{ background: avatarColor(0) }}>
                          {getInitials(recieverInfo.username)}
                        </div>
                      )}
                      {!isMine && prevSame && <div className='msg-av-spacer' />}

                      <div
                        className={`msg-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                        <span className='msg-text'>{message.msg}</span>
                        <div className='msg-meta'>
                          <span className='msg-time'>{message.time}</span>
                          {isMine && isLast && <SeenTick seen={message.seen} />}
                          {isMine && !isLast && (
                            <SeenTick seen={message.seen} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={dummy} />
              </div>
              {showEmojiPicker && (
                <div className='emoji-tray'>
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      className='emoji-item'
                      onClick={() => {
                        setMsg((p) => p + e);
                        field.current?.focus();
                      }}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
              <div className='chat-bar'>
                <button
                  className='bar-icon-btn'
                  onClick={() => toast.info('Attachments coming soon!')}
                  title='Attach'>
                  <svg
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
                    />
                  </svg>
                </button>
                <button
                  className={`bar-icon-btn ${showEmojiPicker ? 'bar-icon-btn--on' : ''}`}
                  onClick={() => setShowEmojiPicker((p) => !p)}
                  title='Emoji'>
                  😊
                </button>
                <div className='bar-input-wrap'>
                  <input
                    ref={field}
                    type='text'
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleClicked();
                    }}
                    placeholder={`Message ${recieverInfo.username}…`}
                    className='bar-input'
                  />
                </div>
                <button
                  onClick={handleClicked}
                  disabled={!msg.trim()}
                  className={`bar-send ${msg.trim() ? 'bar-send--ready' : ''}`}>
                  <svg
                    viewBox='0 0 24 24'
                    fill='currentColor'>
                    <path d='M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z' />
                  </svg>
                </button>
              </div>
            </div>
          ))}
      </main>
    </div>
  );
};
