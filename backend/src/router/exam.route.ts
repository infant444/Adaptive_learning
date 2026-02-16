import { Router } from "express";
import asyncHandler from "express-async-handler";

import { ExamController } from "../controller/exam.controller";
import authMiddleware from "../middleware/auth.middleware";
const router = Router();
router.use(authMiddleware)
// faculty
router.post("/generate",ExamController.uploadFile,asyncHandler(ExamController.generateQuizQuestion));
router.post("/create", asyncHandler(ExamController.createExam));
router.get("/faculty", asyncHandler(ExamController.getFacultyExams));
router.get("/faculty/:examId", asyncHandler(ExamController.startExam));
router.put("/update/detail/:examId",asyncHandler(ExamController.updateExam));
router.put("/update/question/:examId",asyncHandler(ExamController.updateQuestion));
router.delete("/delete/:examId",asyncHandler(ExamController.deleteExam));
// student
router.get("/explore", asyncHandler(ExamController.ExploreExams));
router.get("/my", asyncHandler(ExamController.myExam));
router.get("/detail/:examId", asyncHandler(ExamController.getExamById));
router.get("/start/:examId", asyncHandler(ExamController.startExam));

router.get("/channel/:channelId", asyncHandler(ExamController.getChannelExam));
export default router;