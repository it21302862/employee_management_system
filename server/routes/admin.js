import { Router } from 'express';
const router = Router();
import { allAttendance, allEmployees } from '../controllers/adminController.js';
import { auth, authorize } from '../middleware/auth.js';

// View all attendance logs
router.get('/attendance', auth, authorize('admin'), allAttendance);
// View all employees
router.get('/employees', auth, authorize('admin'), allEmployees);


export default router; 