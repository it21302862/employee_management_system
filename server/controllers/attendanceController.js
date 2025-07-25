import Attendance from '../models/Attendance.js';
import moment from 'moment';

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
    const attendance = new Attendance({ user: req.user.id, type: 'check-in', note: req.body.note });
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

    const formattedLogs = logs.map(log => ({
      _id: log._id,
      type: log.type,
      date: moment(log.timestamp).format("YYYY-MM-DD"),
      time: moment(log.timestamp).format("HH:mm:ss"),
      reason: log.note || "", 
      createdAt: log.createdAt,
      updatedAt: log.updatedAt
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ msg: 'Server error' });
  }
}

export const getLogForDate = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.params;

  const log = await Attendance.findOne({ user: userId, date });

  if (!log) {
    return res.status(404).json({ message: "No attendance record found for this date" });
  }

  const workingHours = log.checkIn && log.checkOut
    ? ((new Date(log.checkOut) - new Date(log.checkIn)) / (1000 * 60 * 60)).toFixed(2)
    : null;

  res.json({
    date: log.date,
    checkIn: log.checkIn,
    checkOut: log.checkOut,
    workingHours,
    status: workingHours ? "Present" : "Incomplete"
  });
};

export const getTimeSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { range } = req.query;

    if (!userId) return res.status(400).json({ error: "User not authenticated" });

    const startDate = range === "month"
      ? moment().startOf("month")
      : moment().startOf("week");
    const endDate = moment().endOf("day");

    const logs = await Attendance.find({
      user: userId,
      timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    }).sort({ timestamp: 1 }); 

    const dailyRecords = {};

    logs.forEach(log => {
      const dateKey = moment(log.timestamp).format("YYYY-MM-DD");

      if (!dailyRecords[dateKey]) {
        dailyRecords[dateKey] = { checkIn: null, checkOut: null };
      }

      if (log.type === "check-in" && !dailyRecords[dateKey].checkIn) {
        dailyRecords[dateKey].checkIn = new Date(log.timestamp);
      }

      if (log.type === "check-out") {
        dailyRecords[dateKey].checkOut = new Date(log.timestamp);
      }
    });

    let totalHours = 0;
    let daysWithCompleteRecords = 0;

    for (const date in dailyRecords) {
      const { checkIn, checkOut } = dailyRecords[date];
      if (checkIn && checkOut && checkOut > checkIn) {
        const diff = (checkOut - checkIn) / (1000 * 60 * 60); // in hours
        totalHours += diff;
        daysWithCompleteRecords++;
      }
    }

    const averageDailyHours = daysWithCompleteRecords > 0
      ? (totalHours / daysWithCompleteRecords).toFixed(2)
      : 0;

    res.json({
      range,
      totalDays: daysWithCompleteRecords,
      totalHours: totalHours.toFixed(2),
      averageDailyHours
    });

  } catch (err) {
    console.error("Error generating summary:", err);
    res.status(500).json({ error: "Server error while generating summary" });
  }
};

export async function getDashboardSummary(req, res) {
  try {
    const logs = await Attendance.find({ user: req.user.id }).sort({ timestamp: 1 });

    // Group logs by date
    const dailySummary = {};

    logs.forEach(log => {
      const dateKey = moment(log.timestamp).format("YYYY-MM-DD");

      if (!dailySummary[dateKey]) {
        dailySummary[dateKey] = {
          date: dateKey,
          checkIn: null,
          checkOut: null,
        };
      }

      if (log.type === "check-in") {
        // Store earliest check-in
        if (!dailySummary[dateKey].checkIn) {
          dailySummary[dateKey].checkIn = moment(log.timestamp);
        }
      } else if (log.type === "check-out") {
        // Store latest check-out
        dailySummary[dateKey].checkOut = moment(log.timestamp);
      }
    });

    // Format response
    const summaryArray = Object.values(dailySummary).map(day => {
      const checkInTime = day.checkIn ? day.checkIn.format("HH:mm:ss") : null;
      const checkOutTime = day.checkOut ? day.checkOut.format("HH:mm:ss") : null;

      let hoursWorked = 0;
      if (day.checkIn && day.checkOut) {
        hoursWorked = moment.duration(day.checkOut.diff(day.checkIn)).asHours();
      }

      return {
        date: day.date,
        startTime: checkInTime,
        endTime: checkOutTime,
        status: day.checkIn ? "Present" : "Absent",
        workingHours: hoursWorked.toFixed(2),
      };
    });

    res.json(summaryArray);

  } catch (err) {
    console.error("Error in dashboard summary:", err);
    res.status(500).json({ msg: "Server error" });
  }
}

export const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Use current month if no query provided
    const currentMonth = moment().format("YYYY-MM");
    const startOfMonth = moment(currentMonth, "YYYY-MM").startOf("month");
    const endOfMonth = moment(currentMonth, "YYYY-MM").endOf("month");

    const logs = await Attendance.find({
      user: userId,
      timestamp: {
        $gte: startOfMonth.toDate(),
        $lte: endOfMonth.toDate(),
      },
    }).sort({ timestamp: 1 });

    const dailySummary = {};

    logs.forEach(log => {
      const dateKey = moment(log.timestamp).format("YYYY-MM-DD");
      if (!dailySummary[dateKey]) {
        dailySummary[dateKey] = { checkIn: null, checkOut: null };
      }

      if (log.type === "check-in" && !dailySummary[dateKey].checkIn) {
        dailySummary[dateKey].checkIn = moment(log.timestamp);
      }
      if (log.type === "check-out") {
        dailySummary[dateKey].checkOut = moment(log.timestamp);
      }
    });

    let totalHours = 0;

    const result = Object.entries(dailySummary).map(([date, { checkIn, checkOut }]) => {
      let workingHours = 0;
      if (checkIn && checkOut) {
        workingHours = moment.duration(checkOut.diff(checkIn)).asHours();
        totalHours += workingHours;
      }

      return {
        date,
        workingHours: parseFloat(workingHours.toFixed(2)),
      };
    });

    res.json({
      month: currentMonth,
      totalWorkingDays: result.length,
      totalHours: Math.floor(totalHours), 
      totalMinutes: Math.floor((totalHours % 1) * 60), 
      details: result, 
    });

  } catch (err) {
    console.error("Monthly summary error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};