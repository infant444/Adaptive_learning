import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { QuestionServices } from "../services/question.services";
import { uploadSingle } from "../config/multer.config";

export class ProjectController{
    static uploadFile = uploadSingle;

    static async analyzeProject(req: Request, res: Response, next: NextFunction) {
            try {
                const file = req.file;
    
                if (!file) {
                    return next({ status: 400, message: "File is required" });
                }
    
                const result = await QuestionServices.analyzeProject(file);
    
                res.json(result);
            } catch (err) {
                next(err)
            }
        }

}