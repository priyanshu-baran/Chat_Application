import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

import Message from './models/message.model.js';
import usersRouter from './routes/users.js';

const app = express();
const port = process.env.PORT || 8000;

app.use(helmet());
app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' }));

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map((o) =>
  o.trim(),
);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/users', apiLimiter);

app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

app.use('/users', usersRouter);

mongoose.connect(process.env.ATLAS_URI);

mongoose.connection.once('open', () =>
  console.log('✅ MongoDB connection established'),
);
mongoose.connection.on('error', (err) =>
  console.error('❌ MongoDB error:', err),
);

const server = app.listen(port, () =>
  console.log(`🚀 Server running on port ${port}`),
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 10_000,
  pingTimeout: 20_000,
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);
  let currentRoom = null;
  socket.on('join_room', async (room) => {
    if (!room || typeof room !== 'string') return;
    try {
      if (currentRoom) {
        socket.leave(currentRoom);
        console.log(`${socket.id} left room: ${currentRoom}`);
      }
      currentRoom = room;
      socket.join(room);
      console.log(`${socket.id} joined room: ${room}`);
      const messages = await Message.find({ room })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      socket.emit('initial_messages', messages.reverse());
    } catch (error) {
      console.error('join_room error:', error);
      socket.emit('error', { message: 'Failed to load messages.' });
    }
  });
  socket.on('send_message', async (data) => {
    const { room, msgContent } = data;
    if (!room || !msgContent?.from || !msgContent?.msg) return;
    try {
      const saved = await Message.create({
        room,
        from: msgContent.from,
        to: msgContent.to,
        message: msgContent.msg,
        time: msgContent.time,
      });
      socket.to(room).emit('receive_message', {
        ...msgContent,
        _id: saved._id,
      });
    } catch (error) {
      console.error('send_message error:', error);
      socket.emit('error', { message: 'Failed to send message.' });
    }
  });
  socket.on('leave_room', (room) => {
    if (currentRoom === room) currentRoom = null;
    socket.leave(room);
    console.log(`${socket.id} left room: ${room}`);
  });
  socket.on('mark_seen', async ({ room, username }) => {
    if (!room || !username) return;
    try {
      await Message.updateMany(
        { room, to: username, seen: false },
        { $set: { seen: true } },
      );
      socket.to(room).emit('messages_seen', { room, seenBy: username });
    } catch (err) {
      console.error('mark_seen error:', err);
    }
  });
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id} — reason: ${reason}`);
  });
});
