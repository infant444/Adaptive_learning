import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { verify } from "node:crypto";
import { generateOTP } from "../services/secure.services";
import { EmailServices } from "../services/email.services";
export class AuthController {
    // Signup
    static async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, phoneNo, email, university, collegeName, role, password } = req.body;
            if (!name || !email) {
                next({ status: 400, message: "Required fields missing" });
            }
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                next({ status: 409, message: "User already exists" });
            }
            const secureCode = generateOTP();
            const sendMail = EmailServices.sendOtp(secureCode, email);
            if (!sendMail) {
                next({ status: 500, message: "Error in sending mail" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    name,
                    phoneNo,
                    email,
                    university,
                    collegeName,
                    role,
                    password: hashedPassword
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    collegeName: true,
                    university: true,
                    createdAt: true
                }
            })
            res.json({ message: "OTP Send Successfully!", email: email, token: generateMailToken(email, secureCode) })
        } catch (err) {
            next(err)
        }
    }
    // Login 
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                next({ status: 400, message: "Required fields missing" });
            }
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                next({ status: 400, message: "User not exists!" });
                return;
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                next({ status: 400, message: "Invalid credentials" });
                return;
            }
            const userX = await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    isActive: false
                }
            });
            res.send(generateUserToken(user))
        } catch (err) {
            next(err)
        }
    }
    // To verify by otp
    static async verifyUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, token, code } = req.body;
            if (!email) {
                next({ status: 400, message: "Required fields missing" });
            }
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                next({ status: 400, message: "User not exists!" });
                return;
            }
            if (verifyMailToken(token) !== code) {
                next({ status: 400, message: "Invalid code!" });

            }
            const updateUser = await prisma.user.update({
                where: { email },
                data: { verify: true },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    collegeName: true,
                    university: true,
                    createdAt: true,
                    verify: true
                }

            })
            res.send(generateUserToken(updateUser))
        } catch (err) {
            next(err)
        }
    }
    // Send opt for a forgot Password
    static async forgotPasswordSendMail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const secureCode = generateOTP();
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                next({ status: 400, message: "User not exists!" });
                return;
            }
            const sendMail = EmailServices.sendOtp(secureCode, email);
            if (!sendMail) {
                next({ status: 500, message: "Error in sending mail" });
            }
            res.json({ message: "OTP Send Successfully!", email: email, token: generateMailToken(email, secureCode) })
        } catch (err) {
            next(err)
        }
    }
    // In forgot password to reset a password
    static async forgotResetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, token, password, code } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                next({ status: 400, message: "User not exists!" });
                return;
            }
            if (verifyMailToken(token) !== code) {
                next({ status: 400, message: "Invalid code!" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const updatedUser = await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            })
            res.json({ message: "Password reset successfully!" })
        } catch (err) {
            next(err)
        }
    }
    // 🔐 UPDATE PASSWORD
    static async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, password, new_password } = req.body;

            if (!id || !password || !new_password) {
                return next({ status: 400, message: "Missing fields" });
            }

            const user = await prisma.user.findUnique({ where: { id: id } });

            if (!user) {
                return next({ status: 404, message: "User not found" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return next({ status: 401, message: "Old password mismatch" });
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);

            await prisma.user.update({
                where: { id: id },
                data: { password: hashedPassword }
            });

            res.json({ status: 200, message: "Password updated successfully" });
        } catch (error) {
            next(error);
        }
    }
    //Logout
    static async logout(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const user = await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    isActive: false
                }
            });
            res.send(user)
        } catch (err) {
            next(err)
        }
    }
}
// Generate A token for a User
const generateUserToken = (user: any) => {
    if (!process.env.JWT_USER_AUTH) {
        throw new Error("JWT_USER_AUTH not configured");
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_USER_AUTH,
        { expiresIn: "7d" }
    );

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        university: user.university,
        collegeName: user.collegeName,
        role: user.role,
        verify: user.verify,
        token:token
    };

}
// Generate A token for a Email
const generateMailToken = (email: string, secureCode: string) => {
    if (!process.env.JWT_EMAIL_AUTH) {
        throw new Error("JWT_EMAIL_AUTH not configured");
    }

    const token = jwt.sign(
        { email: email, code: secureCode },
        process.env.JWT_EMAIL_AUTH,
        { expiresIn: "10m" }
    );
    return token;
}
const verifyMailToken = (token: string) => {
    if (!process.env.JWT_EMAIL_AUTH) {
        throw new Error("JWT_EMAIL_AUTH not configured");
    }
    const data: any = jwt.verify(token, process.env.JWT_EMAIL_AUTH);
    return data.code;
}