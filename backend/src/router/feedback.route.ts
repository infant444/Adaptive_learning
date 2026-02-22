import { Router } from "express";
import asyncHandler from "express-async-handler";
import authMiddleware from "../middleware/auth.middleware";
import { feedbackController } from "../controller/feedback.controller";
const router=Router();
router.use(authMiddleware);
router.post("/create/:examId",asyncHandler(feedbackController.AddFeedback));
router.get("/exam/:id",asyncHandler(feedbackController.getFeedback));
export default router;