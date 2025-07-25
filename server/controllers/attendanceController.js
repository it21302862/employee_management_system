import Attendance from '../models/Attendance.js';

export async function checkIn(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alreadyCheckedIn = await Attendance.findOne({
      user: req.user.id,
      type: 'check-in',
      timestamp: { $gte: today },
    });
    if (alreadyCheckedIn) {
      return res.status(400).json({ msg: 'Already checked in today' });
    }
    const attendance = new Attendance({ user: req.user.id, type: 'check-in' });
    await attendance.save();
    res.status(201).json({ msg: 'Checked in successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}

export async function checkOut(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alreadyCheckedOut = await Attendance.findOne({
      user: req.user.id,
      type: 'check-out',
      timestamp: { $gte: today },
    });
    if (alreadyCheckedOut) {
      return res.status(400).json({ msg: 'Already checked out today' });
    }
    const attendance = new Attendance({ user: req.user.id, type: 'check-out' });
    await attendance.save();
    res.status(201).json({ msg: 'Checked out successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}

export async function myLogs(req, res) {
  try {
    const logs = await Attendance.find({ user: req.user.id }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
} 