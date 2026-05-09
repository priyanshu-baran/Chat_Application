import { ref, onValue, off } from 'firebase/database';
import { data } from '.';

export const ListenToUserPresence = (userId, callback) => {
  const userRef = ref(data.db, `/presence/${userId}`);
  const handleSnapshot = (snapshot) => {
    const presence = snapshot.val();
    callback({
      userId,
      state: presence?.state ?? 'offline',
      last_changed: presence?.last_changed ?? null,
    });
  };
  onValue(userRef, handleSnapshot);
  return () => off(userRef, 'value', handleSnapshot);
};
