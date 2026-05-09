import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { data } from '.';

export const Settings = ({ onClose, onSave, currentUser }) => {
  const uid = data.auth.currentUser?.uid || '';
  const [form, setForm] = useState({
    username: currentUser?.username || '',
    about: currentUser?.shortdesc || 'Full Stack Developer',
  });
  const [saving, setSaving] = useState(false);
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSave = async () => {
    if (!form.username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/users/me`,
        {
          username: form.username.trim(),
          about: form.about.trim() || 'Full Stack Developer',
        },
        { headers: { Authorization: `Bearer ${uid}` } },
      );
      toast.success('Profile updated!');
      onSave?.({
        username: res.data.user.username,
        shortdesc: res.data.user.about,
      });
      onClose();
    } catch (err) {
      if (err.response?.status === 409) toast.error('Username already taken');
      else {
        toast.error('Failed to save');
        console.error(err);
      }
    } finally {
      setSaving(false);
    }
  };
  const initials =
    form.username
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  return (
    <div
      className='settings-overlay'
      onClick={onClose}>
      <div
        className='settings-card'
        onClick={(e) => e.stopPropagation()}>
        <div className='settings-header'>
          <h2>Edit Profile</h2>
          <button
            className='settings-close'
            onClick={onClose}>
            ✕
          </button>
        </div>
        <div className='settings-avatar-row'>
          <div className='settings-avatar'>{initials}</div>
          <div>
            <button
              className='settings-avatar-btn'
              disabled>
              Change photo
            </button>
            <p className='settings-avatar-hint'>Photo upload coming soon</p>
          </div>
        </div>
        <label className='settings-label'>Username</label>
        <input
          type='text'
          name='username'
          value={form.username}
          onChange={handleChange}
          className='settings-input'
          placeholder='Your name'
        />
        <label className='settings-label'>About / Status</label>
        <input
          type='text'
          name='about'
          value={form.about}
          onChange={handleChange}
          className='settings-input'
          placeholder='e.g. Full Stack Developer'
          maxLength={200}
        />
        <p className='settings-hint'>{form.about.length}/200</p>
        <div className='settings-actions'>
          <button
            className='settings-btn-cancel'
            onClick={onClose}>
            Cancel
          </button>
          <button
            className='settings-btn-save'
            onClick={handleSave}
            disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
