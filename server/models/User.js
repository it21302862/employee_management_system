import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee',
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true, 
    trim: true,
  },
  profileImage: {
    type: String, 
    default: '',  
  },
  position: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 18,
    max: 100,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
  }
}, { timestamps: true });

export default model('User', userSchema);
