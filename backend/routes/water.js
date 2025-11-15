// routes/waterRoutes.js
import express from 'express';
import WaterMapController from '../controllers/WaterController.js';
import { protect } from '../middlewares/authmiddlewares.js'; // Your auth middleware

const router = express.Router();

// Public routes
router.get('/sources', WaterMapController.getWaterSources);
router.get('/nearest-clean', WaterMapController.findNearestCleanSource);
router.get('/alerts', WaterMapController.getActiveAlerts);
router.get('/fetch-data', WaterMapController.fetchWaterQualityData);

// Protected routes (require authentication)
router.post('/report', protect, WaterMapController.submitReport);
router.get('/my-reports', protect, WaterMapController.getUserReports);

export default router;
