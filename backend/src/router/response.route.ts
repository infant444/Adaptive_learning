import { Router } from "express";
import asyncHandler from "express-async-handler";

import authMiddleware from "../middleware/auth.middleware";
import { ResponseController } from "../controller/response.controller";
const router = Router();
router.use(authMiddleware)

router.post("/submit/:id",asyncHandler(ResponseController.submitResponse));
router.post("/terminated/:id", asyncHandler(ResponseController.submitTerminatedResponse));
router.get("/exam/:examId",asyncHandler(ResponseController.GetResponseByExam));
router.get("/student/:studentId", asyncHandler(ResponseController.GetResponseByStudent));
router.get("/:id",asyncHandler(ResponseController.GetResponseById));
router.get("/my/detail", asyncHandler(ResponseController.GetResponseMyself));
router.put("/update/:id",asyncHandler(ResponseController.addFacultyFeedback));
export default router;