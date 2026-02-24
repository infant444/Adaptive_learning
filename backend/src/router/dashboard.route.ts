import { Router } from "express";
import { DashboardController } from "../controller/dashboard.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.get("/faculty", authMiddleware, DashboardController.getFacultyDashboard);
router.get("/student", authMiddleware, DashboardController.getStudentDashboard);

export default router;
