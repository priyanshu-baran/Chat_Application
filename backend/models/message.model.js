import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const msgSchema = new Schema({
  room: {
    type: String,
    required: true,
  },
  contents: [
    {
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Message = mongoose.model('Message', msgSchema);
export default Message;
