// ============================================
// 3. ROUTES WITH JWT AUTH (routes/menuRoutes.js)
// ============================================
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  addMenuItem,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getStaffMenuItems,
  getStudentMenu
} from '../controllers/menuController.js';

const router = express.Router();

// Admin routes - Protected with JWT and admin role
router.post('/admin/menu/add', protect, authorizeRoles('admin'), addMenuItem);
router.get('/admin/menu', protect, authorizeRoles('admin'), getAllMenuItems);
router.put('/admin/menu/update/:id', protect, authorizeRoles('admin'), updateMenuItem);
router.delete('/admin/menu/delete/:id', protect, authorizeRoles('admin'), deleteMenuItem);

// Staff routes - Protected with JWT and staff/admin roles
router.put('/staff/menu/availability/:id', protect, authorizeRoles('staff', 'admin'), toggleAvailability);
router.get('/staff/menu', protect, authorizeRoles('staff', 'admin'), getStaffMenuItems);

// Student routes - Protected with JWT and student role
router.get('/student/menu', protect, authorizeRoles('student'), getStudentMenu);

export default router;