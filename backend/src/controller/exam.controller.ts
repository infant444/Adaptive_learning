import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { uploadSingle } from "../config/multer.config";
import { QuestionServices } from "../services/question.services";

export class ExamController {
    static uploadFile = uploadSingle;

    static async generateQuizQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const { subject, description, difficulty, count, testType } = req.body;
            const file = req.file;

            if (!file) {
                return next({ status: 400, message: "File is required" });
            }
            var result;
            if (testType == "quiz") {
                result = await QuestionServices.generateQuiz(subject, difficulty, count, description, file);
            } else if (testType == "summary") {
                result = await QuestionServices.generateDescriptiveQuestion(subject, difficulty, count, description, file);
            } else {
                next({ status: 400, message: "Invalid test type" });
            }

            res.json(result);
        } catch (err) {
            next(err)
        }
    }
}