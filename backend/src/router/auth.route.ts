import { Router } from "express";
import asyncHandler from "express-async-handler";
import { AuthController } from "../controller/auth.controller";
const route = Router();

route.post("/register",asyncHandler(AuthController.signup));
route.post("/login", asyncHandler(AuthController.login));
route.post("/otp/forgot-password", asyncHandler(AuthController.forgotPasswordSendMail));
route.put("/verify", asyncHandler(AuthController.verifyUser));
route.put("/forgot-password",asyncHandler(AuthController.forgotResetPassword))
route.put("/update-password", asyncHandler(AuthController.updatePassword))
export default route