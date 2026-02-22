
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AnalysisServices } from "../services/analysis.services";

export class ResponseController{
    static async submitResponse(req: any, res: Response, next: NextFunction){
        try {
            const {
                response,
                duration,
                violations,
                totalScore,
                isTerminated,
                terminatedReason,
                questions,
                testType,
                durationMinutes,
                facultyId
            } = req.body;
            const examId = req.params.id;
            
            const analysis = await AnalysisServices.analyzeExam({
                testType,
                questions,
                studentResponses: response,
                timeTaken: duration,
                totalScore,
                durationMinutes
            });

            const yourScore = analysis?.scoreAnalysis?.marksObtained || 0;
            const responseScore = analysis?.scoreAnalysis?.percentage || 0;

            const responseData = await prisma.response.create({
                data: {
                    response,
                    duration,
                    violations,
                    totalScore,
                    yourScore,
                    responseScore,
                    isTerminated,
                    terminatedReason,
                    isAnalyses: true,
                    analyses: analysis,
                    exam: { connect: { id: examId } },
                    student: { connect: { id: req.user?.id } },
                    faculty: { connect: { id: facultyId } }
                }
            });

            res.json(responseData);
        } catch (error) {
            next(error);
        }
    }
    static async submitTerminatedResponse(req: any, res: Response, next: NextFunction){
        try {
            const {
                response,
                duration,
                violations,
                totalScore,
                isTerminated,
                terminatedReason,
                studentId,
                facultyId
            } = req.body;
            const examId = req.params.id;

            const responseData = await prisma.response.create({
                data: {
                    response,
                    duration,
                    violations,
                    totalScore,
                    isTerminated,
                    terminatedReason,
                    isAnalyses: false,
                    analyses: {},
                    exam: { connect: { id: examId } },
                    student: { connect: { id: studentId || req.user?.id } },
                    faculty: { connect: { id: facultyId } }
                }
            });
            res.json(responseData);
        } catch (error) {
            next(error);
        }
    }

    // get response
    static async GetResponseByExam(req: Request, res: Response, next: NextFunction){
        try{
            const examId = req.params.examId as string;
            const responses = await prisma.response.findMany({
                where: { examId },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }}})
                    res.json(responses);
        }catch(error){
            next(error);
        }
    }
    static async GetResponseByStudent(req: Request, res: Response, next: NextFunction){
        try{
            const studentId = req.params.studentId as string;
            const responses = await prisma.response.findMany({
                where: { studentId },
                include: {
                    exam: {
                        select: {
                            id: true,
                            title: true,
                            testType: true,
                            totalScore: true,
                            durationMinutes: true
                        }
                    },
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    faculty: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            res.json(responses);
        }catch(error){
            next(error);
        }
    }
    static async GetResponseByStudentAndExam(req: Request, res: Response, next: NextFunction){
        try{
            const studentId = req.params.studentId as string;
            const examId = req.params.examId as string;
            const response = await prisma.response.findFirst({
                where: { studentId, examId },
                include: {
                    exam: {
                        select: {
                            id: true,
                            title: true,
                            testType: true,
                            totalScore: true,
                            durationMinutes: true
                        }
                    },
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    faculty: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            if(!response) return res.json({message: "No response found"});
            res.json(response);
        }catch(error){
            next(error);
        }
    }
    static async GetResponseById(req: Request, res: Response, next: NextFunction){
        try{
            const id = req.params.id as string;
            const response = await prisma.response.findUnique({
                where: { id },
                include: {
                    exam: {
                        select: {
                            id: true,
                            title: true,
                            testType: true,
                            totalScore: true,
                            durationMinutes: true,
                            domain:true,
                            questionCount:true
                        }
                    },
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    faculty: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            if(!response) {
                res.json({message: "No response found"});
            }
            res.json(response);
        }catch(error){
            next(error);
        }
    }
    static async GetResponseMyself(req: any, res: Response, next: NextFunction){
        try{
            const studentId = req.user.id;
            const responses = await prisma.response.findMany({
                where: { studentId },
                include: {
                    exam: {
                        select: {
                            id: true,
                            title: true,
                            testType: true,
                            totalScore: true,
                            durationMinutes: true,
                            domain:true,
                            questionCount:true
                        }
                    },
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                }
            });
            res.json(responses)
        }catch(err){
            next(err)
        }
    }
    static async addFacultyFeedback(req: any, res: Response, next: NextFunction){
        try{
            const {facultyFeedback} = req.body;
            const responseId = req.params.id as string;

            const response = await prisma.response.update({
                where: { id: responseId },
                data: { facultyReview:facultyFeedback }
            })
            res.json(response);
        }catch(error){
            next(error);
        }
    }
    
}
