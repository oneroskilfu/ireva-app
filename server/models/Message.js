import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: String,
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedProperty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  relatedInvestment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment'
  },
  attachments: [
    {
      filename: String,
      url: String,
      mimetype: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Message = mongoose.model('Message', MessageSchema);