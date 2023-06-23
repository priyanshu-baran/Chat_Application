import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();
// import serverless from 'serverless-http';

// const router = express.Router();

import UserState from './models/state.model.js';
import Message from './models/message.model.js';
import usersRouter from './routes/users.js';

const app = express();

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// router.get('/', (req, res) => {
//   res.json({
//     serviceId: process.env.EMAILJS_SERVICE_ID,
//     templateId: process.env.EMAILJS_TEMPLATE_ID,
//     apiKey: process.env.EMAILJS_API_KEY,
//   });
// });

app.use('/users', usersRouter);
// app.use('/api/env', router);

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});

let currentRoom = null;

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('loggedIn', async ({ details, name }) => {
    try {
      await UserState.findOneAndUpdate(
        { id: details.uid },
        { name: name, status: 'online' },
        { upsert: true }
      );
      const onlineUsers = await UserState.find(
        { status: 'online' },
        { name: 1 }
      );
      const onlineUserNames = onlineUsers.map((user) => user.name);
      const offlineUsers = await UserState.find(
        { status: 'offline' },
        { name: 1 }
      );
      const offlineUserNames = offlineUsers.map((user) => user.name);
      socket.broadcast.emit('userLoggedIn', name);
      socket.broadcast.emit('updateUserLists', {
        onlineUsers: onlineUserNames,
        offlineUsers: offlineUserNames,
      });
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  });

  socket.on('loggedOut', async (userData) => {
    try {
      await UserState.findOneAndUpdate(
        { id: userData.uid },
        { status: 'offline' }
      );
      const onlineUsers = await UserState.find(
        { status: 'online' },
        { name: 1 }
      );
      const onlineUserNames = onlineUsers.map((user) => user.name);
      const offlineUsers = await UserState.find(
        { status: 'offline' },
        { name: 1 }
      );
      const offlineUserNames = offlineUsers.map((user) => user.name);
      socket.broadcast.emit('userLoggedOut', userData.displayName);
      socket.broadcast.emit('updateUserLists', {
        onlineUsers: onlineUserNames,
        offlineUsers: offlineUserNames,
      });
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  });

  socket.on('join_room', async (room) => {
    try {
      if (currentRoom) {
        socket.leave(currentRoom);
        // console.log(`Left ${currentRoom} room..!!`);
      }
      currentRoom = room;
      socket.join(room);
      // console.log(`Joined ${room} room..!!`);
      const initialMessages = await Message.find({ room: room });
      if (initialMessages.length > 0) {
        const contents = initialMessages[0].contents;
        socket.emit('initial_messages', contents);
      }
    } catch (error) {
      console.error('Error retrieving initial messages:', error);
    }
  });

  socket.on('send_message', async (data) => {
    const { room, msgContent } = data;
    try {
      const existingRoom = await Message.findOne({
        room: room,
      });
      if (existingRoom) {
        existingRoom.contents.push({
          from: msgContent.from,
          to: msgContent.to,
          message: msgContent.msg,
          time: msgContent.time,
        });
        await existingRoom.save();
      } else {
        const newMessage = new Message({
          room: room,
          contents: [
            {
              from: msgContent.from,
              to: msgContent.to,
              message: msgContent.msg,
              time: msgContent.time,
            },
          ],
        });
        await newMessage.save();
      }
      socket.to(room).emit('receive_message', msgContent);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
    // console.log(`Left ${room} room..!!`);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});

// export const handler = serverless(app);
