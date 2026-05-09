import express from 'express';
import bcrypt from 'bcryptjs';

import User from '../models/user.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    console.error('GET /users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne(
      { username: req.params.username },
      { password: 0 },
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('GET /users/:username error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/add', async (req, res) => {
  const { username, email, password, firebaseUid } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: 'username, email, and password are all required.' });
  }
  if (username.trim().length < 3) {
    return res
      .status(400)
      .json({ error: 'Username must be at least 3 characters.' });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 8 characters.' });
  }
  try {
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: 'Username or email is already taken.' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      ...(firebaseUid && { firebaseUid }),
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: 'Username or email is already taken.' });
    }
    console.error('POST /users/add error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

router.patch('/me', async (req, res) => {
  const { username, about } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header.' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    if (!username?.trim()) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    const updated = await User.findOneAndUpdate(
      { firebaseUid: idToken },
      { username: username.trim(), about: about || 'Full Stack Developer' },
      { new: true, select: '-password' },
    );

    if (!updated) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'Profile updated.', user: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username already taken.' });
    }
    console.error('PATCH /users/me error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});
