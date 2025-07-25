import { Router } from 'express';
const router = Router();
import { checkIn, checkOut, myLogs } from '../controllers/attendanceController.js';
import { auth, authorize } from '../middleware/auth.js';

// Check-in
router.post('/check-in', auth, authorize('employee'), checkIn);
// Check-out
router.post('/check-out', auth, authorize('employee'), checkOut);
// View own logs
router.get('/my-logs', auth, authorize('employee'), myLogs);

export default router; 