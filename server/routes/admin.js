import { Router } from 'express';
const router = Router();
import { allAttendance, allEmployees, checkinDistribution, allLogs, workingHoursPerMonth} from '../controllers/adminController.js';
import { auth, authorize } from '../middleware/auth.js';

// View all attendance logs
router.get('/attendance', auth, authorize('admin'), allAttendance);
// View all employees
router.get('/employees', auth, authorize('admin'), allEmployees);
// to get checkin times
router.get('/checkin-distribution', auth, authorize('admin'), checkinDistribution);
router.get('/all-logs', auth, authorize('admin'), allLogs);
router.get('/working-hours', auth, authorize('admin'), workingHoursPerMonth);

export default router; 