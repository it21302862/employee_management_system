import { Schema, model } from 'mongoose';

const attendanceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['check-in', 'check-out'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

export default model('Attendance', attendanceSchema); 