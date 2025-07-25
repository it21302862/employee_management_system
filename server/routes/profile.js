import { Router } from 'express';
const router = Router();
import { me } from '../controllers/profileController.js';
import { auth } from '../middleware/auth.js';

router.get('/me', auth, me);

export default router; 