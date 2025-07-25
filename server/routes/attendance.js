import { Router } from 'express';
const router = Router();
import { checkIn, checkOut, myLogs, getLogForDate, getTimeSummary,getDashboardSummary,getMonthlySummary } from '../controllers/attendanceController.js';
import { auth, authorize } from '../middleware/auth.js';

// Check-in
router.post('/check-in', auth, authorize('employee'), checkIn);
// Check-out
router.post('/check-out', auth, authorize('employee'), checkOut);
// View own logs
router.get('/my-logs', auth, authorize('employee'), myLogs);
//get log for a date
router.get('/my-log/:date', auth, authorize('employee'), getLogForDate);
//to get the profile time summary
router.get('/summary', auth, authorize('employee'), getTimeSummary);
//to get the dashboard summary
router.get('/dash-summary', auth, authorize('employee'), getDashboardSummary);
//get pie chart data
router.get('/dash-monthly-summary', auth, authorize('employee'), getMonthlySummary);

export default router; 