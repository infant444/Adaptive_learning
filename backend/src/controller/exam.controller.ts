import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { uploadSingle } from "../config/multer.config";
import { QuestionServices } from "../services/question.services";

export class ExamController{
    static uploadFile = uploadSingle;
    
    static async generateQuestion(req:Request,res:Response,next:NextFunction){
        try {
            const {subject, description,difficulty, count}=req.body;
            const file = req.file;
            
            if (!file) {
                return next({ status: 400, message: "File is required" });
            }
            const result = await QuestionServices.generateQuiz(subject, difficulty, count, description, file);
            
            res.json(result);
        } catch (err) {
            next(err)
        }
    }
} 