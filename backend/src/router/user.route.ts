import { Router } from "express";
import asyncHandler from "express-async-handler";

import { UserController } from "../controller/user.controller";
import authMiddleware from "../middleware/auth.middleware";

const route=Router();
route.use(authMiddleware);
route.get("/students",asyncHandler(UserController.getAllStudent));
route.get("/faculty",asyncHandler(UserController.getAllFaculty));
route.get("/:id",asyncHandler(UserController.getUser));
route.get("/me/detail",asyncHandler(UserController.myDetail));
route.put("/me/update", asyncHandler(UserController.updateDetail));
export default route;