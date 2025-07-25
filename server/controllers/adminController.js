import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import moment from 'moment';
import mongoose from 'mongoose';

export async function allAttendance(req, res) {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const employees = await User.find({ role: { $in: ['employee', 'admin'] } }).select('name employeeId');

    const results = await Promise.all(
      employees.map(async (employee) => {
        const logs = await Attendance.find({
          user: employee._id,
          timestamp: { $gte: targetDate, $lt: nextDate },
        }).sort({ timestamp: 1 });

        const checkIn = logs.find(log => log.type === 'check-in');
        const checkOut = [...logs].reverse().find(log => log.type === 'check-out');

        let workingHours = null;
        if (checkIn && checkOut) {
          const diffMs = new Date(checkOut.timestamp) - new Date(checkIn.timestamp);
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
          workingHours = `${hours}h ${minutes}m`;
        }

        return {
          empId: employee.employeeId,
          name: employee.name,
          date: moment(targetDate).format('YYYY-MM-DD'),
          checkIn: checkIn?.timestamp || null,
          checkOut: checkOut?.timestamp || null,
          workingHours,
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
}

export async function allEmployees(req, res) {
  try {
    const currentUserId = req.user?.id || req.user?._id;

    const users = await User.find({
      role: { $in: ['employee', 'admin'] },
      _id: { $ne: currentUserId }, 
    }).select('-password');

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
}

 