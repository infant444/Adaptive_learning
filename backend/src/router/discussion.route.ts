import { Router } from "express";
import { DiscussionController } from "../controller/discussion.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware)

router.get("/:channelId", DiscussionController.getMessages);
router.post("/:channelId", DiscussionController.sendMessage);

export default router;
