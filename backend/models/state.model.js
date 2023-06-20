import mongoose from 'mongoose';

const userStateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['online', 'offline'],
    default: 'offline',
  },
});

const UserState = mongoose.model('UserState', userStateSchema);
export default UserState;
