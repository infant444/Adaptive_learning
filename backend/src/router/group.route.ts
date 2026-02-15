import { Router } from "express";
import asyncHandler from "express-async-handler";
import authMiddleware from "../middleware/auth.middleware";
import { GroupController } from "../controller/group.controller";
const router = Router();
router.use(authMiddleware)

router.post("/create",asyncHandler(GroupController.createGroup))
router.post("/send-invite", asyncHandler(GroupController.sendInvite))
router.get("/faculty/my-channel",asyncHandler(GroupController.getGroups))
router.get("/:id",asyncHandler(GroupController.getGroupById))
router.get("/student/my-channel",asyncHandler(GroupController.getStudentGroups))
router.get("/student/explore",asyncHandler(GroupController.ExploreGroup));
router.put("/add/:id",asyncHandler(GroupController.addTeamMember))
router.put("/exit/:id", asyncHandler(GroupController.exitGroup))
router.put("/update/:id", asyncHandler(GroupController.updateGroup))
router.delete("/delete/:id", asyncHandler(GroupController.deleteGroup))
export default router;