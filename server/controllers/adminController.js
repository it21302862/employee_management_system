import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

export async function allAttendance(req, res) {
  try {
    const logs = await Attendance.find().populate('user', 'name email role').sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}

export async function allEmployees(req, res) {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
} 