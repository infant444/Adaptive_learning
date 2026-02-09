import { Router } from "express";
import asyncHandler from "express-async-handler";

import { ExamController } from "../controller/exam.controller";
import authMiddleware from "../middleware/auth.middleware";
const router = Router();
router.use(authMiddleware)

router.post("/generate",ExamController.uploadFile,asyncHandler(ExamController.generateQuestion))
export default router;