import { Router } from "express";
import asyncHandler from "express-async-handler";
import authMiddleware from "../middleware/auth.middleware";
import { AssignmentController } from "../controller/assigment.controller";
const route = Router();
route.use(authMiddleware);

route.post("/create",asyncHandler(AssignmentController.create));
route.get("/channel/:channelId",asyncHandler(AssignmentController.getAllInChannel));
route.get("/:id",asyncHandler(AssignmentController.getById));
route.get("/my/detail", asyncHandler(AssignmentController.myAssignment));
route.get("/faculty/detail",asyncHandler(AssignmentController.getForFaculty));
route.put("/update/:id", asyncHandler(AssignmentController.update));
route.delete("/delete/:id", asyncHandler(AssignmentController.delete));
// response
route.post("/response/create/:id",AssignmentController.uploadFile,asyncHandler(AssignmentController.submitAssignment))
route.get("/response/:id",asyncHandler(AssignmentController.getResponseById))
route.get("/response/my/detail", asyncHandler(AssignmentController.getMyAssignmentResponses))
route.get("/response/assignment/:id",asyncHandler(AssignmentController.getAssignmentResponses))
route.get("/response/my/id",asyncHandler(AssignmentController.getMyResponseId))
route.put("/response/addResponse/:id",asyncHandler(AssignmentController.addResponse));
route.put("/response/sendFeedback/:id", asyncHandler(AssignmentController.sendFeedback));
export default route