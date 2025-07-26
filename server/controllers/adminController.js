import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import moment from 'moment';
import mongoose from 'mongoose';
import dayjs from 'dayjs';

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

export async function checkinDistribution(req, res) {
  try {
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();

    const checkIns = await Attendance.find({
      type: 'check-in',
      timestamp: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const buckets = {
      '7 AM - 9 AM': 0,
      '9 AM - 11 AM': 0,
      '11 AM - 1 PM': 0,
      'Late (1 PM+)': 0,
    };

    checkIns.forEach((record) => {
      const hour = dayjs(record.timestamp).hour();

      if (hour >= 7 && hour < 9) buckets['7 AM - 9 AM']++;
      else if (hour >= 9 && hour < 11) buckets['9 AM - 11 AM']++;
      else if (hour >= 11 && hour < 13) buckets['11 AM - 1 PM']++;
      else buckets['Late (1 PM+)']++;
    });

    res.json(buckets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
}


export async function allLogs(req, res) {
  try {
    const logs = await Attendance.find({
      note: { $nin: [null, ""] }
    })
    .sort({ timestamp: -1 })
    .populate("user", "employeeId"); 

    const formattedLogs = logs.map(log => ({
      _id: log._id,
      empId: log.user?.employeeId || "—", 
      type: log.type,
      date: moment(log.timestamp).format("YYYY-MM-DD"),
      time: moment(log.timestamp).format("HH:mm:ss"),
      reason: log.note || "",
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ msg: 'Server error' });
  }
}

export async function workingHoursPerMonth(req, res) {
  try {
    const users = await User.find({ role: "employee" });
    const logs = await Attendance.find({}).sort({ timestamp: 1 });

    const userLogsMap = {};

    logs.forEach((log) => {
      const userId = log.user.toString();
      if (!userLogsMap[userId]) {
        userLogsMap[userId] = [];
      }
      userLogsMap[userId].push(log);
    });

    const result = [];

    for (const user of users) {
      const monthlyData = {};

      const logs = userLogsMap[user._id.toString()] || [];

      for (let i = 0; i < logs.length - 1; i++) {
        const logIn = logs[i];
        const logOut = logs[i + 1];

        if (logIn.type === "check-in" && logOut.type === "check-out") {
          const inTime = moment(logIn.timestamp);
          const outTime = moment(logOut.timestamp);

          if (outTime.isAfter(inTime) && outTime.diff(inTime, "hours") < 24) {
            const month = inTime.format("MMM");

            const durationHours = outTime.diff(inTime, "hours", true);

            if (!monthlyData[month]) {
              monthlyData[month] = 0;
            }

            monthlyData[month] += durationHours;
            i++; 
          }
        }
      }

      const data = Object.entries(monthlyData).map(([month, hours]) => ({
        x: month,
        y: parseFloat(hours.toFixed(2))
      }));

      result.push({
        id: user.name,
        data
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Error calculating working hours:", err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function updateCheckIn(req, res) {
  try {
    const { employeeId, date, checkInTime, checkOutTime } = req.body;

    if (!employeeId) {
      return res.status(400).json({ msg: "Employee ID is required" });
    }

    if (!date) {
      return res.status(400).json({ msg: "Date is required" });
    }

    // Find user by employeeId
    const user = await User.findOne({ employeeId });
    if (!user) {
      return res.status(404).json({ msg: "User not found for this Employee ID" });
    }

    const baseDate = new Date(date); 

    const buildLocalTimestamp = (base, timeStr) => {
      if (!timeStr) return null;
      const [hour, minute] = timeStr.split(":").map(Number);
      const d = new Date(base);
      d.setHours(hour, minute, 0, 0); 
      return d;
    };

    const checkInTimestamp = buildLocalTimestamp(baseDate, checkInTime);
    const checkOutTimestamp = buildLocalTimestamp(baseDate, checkOutTime);

    // Upsert check-in doc
    if (checkInTimestamp) {
      await Attendance.findOneAndUpdate(
        {
          user: user._id,
          type: "check-in",
          timestamp: {
            $gte: baseDate,
            $lt: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        { $set: { timestamp: checkInTimestamp, updatedAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // Upsert check-out doc
    if (checkOutTimestamp) {
      await Attendance.findOneAndUpdate(
        {
          user: user._id,
          type: "check-out",
          timestamp: {
            $gte: baseDate,
            $lt: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        { $set: { timestamp: checkOutTimestamp, updatedAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return res.json({ msg: "Attendance times updated successfully" });
  } catch (err) {
    console.error("Error updating attendance:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}

export async function removeUserAndLogs(req, res) {
  const { employeeId } = req.params;

  try {
    const user = await User.findOne({ employeeId });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await Attendance.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    res.status(200).json({ msg: 'User and all associated attendance logs deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ msg: 'Server error while deleting user' });
  }
}