import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { uploadSingle } from "../config/multer.config";
import { QuestionServices } from "../services/question.services";
import { EmailServices } from "../services/email.services";

export class ExamController {
    static uploadFile = uploadSingle;

    static async generateQuizQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const { subject, description, difficulty, count, testType = 'quiz' } = req.body;
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
    // Work in Faculty
    static async createExam(req: any, res: Response, next: NextFunction) {
        try {
            const { title,
                domain,
                questionCount,
                isDuration,
                durationMinutes,
                isStart,
                startAt,
                endAt,
                questions,
                testType,
                publishType,
                organization,
                channelId,
                resultOut,
                totalScore
            } = req.body;
            const creatorId = req.user.id;
            const instruction = await QuestionServices.generateExamInstructions({
                questionCount,
                testType,
                durationMinutes,
                domain,
                difficulty: "medium"
            });
            const exams = await prisma.exam.create({
                data: {
                    title,
                    domain,
                    questionCount,
                    isDuration,
                    durationMinutes,
                    isStart,
                    startAt: startAt && startAt !== '' ? new Date(startAt) : null,
                    endAt: endAt && endAt !== '' ? new Date(endAt) : null,
                    questions,
                    testType,
                    publishType,
                    organization,
                    channelId,
                    instructions: instruction,
                    createdById: creatorId,
                    resultOut,
                    totalScore

                }
            });
            if (publishType == 'private') {
                const channelData = await prisma.channel.findUnique({
                    where: {
                        id: channelId
                    },
                    select: {
                        name: true,
                        teamMembers: true
                    }
                });

                if (channelData && channelData.teamMembers.length > 0) {
                    const users = await prisma.user.findMany({
                        where: {
                            id: {
                                in: channelData.teamMembers
                            }
                        },
                        select: {
                            email: true
                        }
                    });
                    const emailList = users.map(user => user.email);
                    await EmailServices.sendExamInvite(
                        title,
                        exams.id,
                        emailList,
                        channelData.name,
                        isStart,
                        startAt,
                        domain
                    );
                }
            }

            res.json(exams);
        } catch (err) {
            next(err)
        }
    }
    static async getFacultyExams(req: any, res: Response, next: NextFunction) {
        try {
            const facultyId = req.user.id;
            const exams = await prisma.exam.findMany({
                where: {
                    createdById: facultyId
                }, orderBy: {
                    createdAt: "desc"
                }
            })
            res.json(exams);
        } catch (err) {
            next(err)
        }
    }
    static async updateExam(req: any, res: Response, next: NextFunction) {
        try {
            const { title,
                isDuration,
                durationMinutes,
                isStart,
                startAt,
                endAt,
                publishType,
                organization,
                channelId,
                resultOut,
                totalScore
            } = req.body;
            const examId = req.params.examId as string;
            const creatorId = req.user.id;

            const existing = await prisma.exam.findFirst({
                where: {
                    id: examId,
                    createdById: creatorId
                }
            });

            if (!existing) {
                next({ status: 404, message: "Exam not found or unauthorized access" });
            }
            const exam = await prisma.exam.update({
                where: {
                    id: examId
                },
                data: {
                    title,
                    isDuration,
                    durationMinutes,
                    isStart,
                    startAt: startAt && startAt !== '' ? new Date(startAt) : null,
                    endAt: endAt && endAt !== '' ? new Date(endAt) : null,
                    publishType,
                    organization,
                    channelId,
                    resultOut,
                    totalScore
                }
            });

            res.json(exam);
        } catch (err) {
            next(err)
        }
    }
    static async updateQuestion(req: any, res: Response, next: NextFunction) {
        try {
            const { questions } = req.body;
            const examId = req.params.examId as string;
            const creatorId = req.user.id;

            const existing = await prisma.exam.findFirst({
                where: {
                    id: examId,
                    createdById: creatorId
                }
            });

            if (!existing) {
                next({ status: 404, message: "Exam not found or unauthorized access" });
            }

            const exam = await prisma.exam.update({
                where: {
                    id: examId
                },
                data: {
                    questions
                }
            });

            res.json(exam);
        } catch (err) {
            next(err)
        }
    }
    static async deleteExam(req: any, res: Response, next: NextFunction) {
        try {

            const examId = req.params.examId as string;
            const creatorId = req.user.id;

            const existing = await prisma.exam.findFirst({
                where: {
                    id: examId,
                    createdById: creatorId
                }
            });

            if (!existing) {
                next({ status: 404, message: "Exam not found or unauthorized access" });
            }

            const exam = await prisma.exam.delete({
                where: {
                    id: examId
                }
            });

            res.json(exam);
        } catch (err) {
            next(err)
        }
    }
    // Get Exams Student
    static async ExploreExams(req: Request, res: Response, next: NextFunction) {
        try {
            const exams = await prisma.exam.findMany(
                {
                    where: {
                        AND: [
                            {
                                NOT: {
                                    publishType: 'private'
                                }
                            },
                            {
                                OR: [
                                    {
                                        isStart: false
                                    },
                                    {
                                        endAt: {
                                            gt: new Date()
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    select: {
                        id:true,
                        title: true,
                        domain: true,
                        questionCount: true,
                        isDuration: true,
                        durationMinutes: true,
                        isStart: true,
                        startAt: true,
                        endAt: true,
                        testType: true,
                        publishType: true,
                        organization: true,
                        channelId: true,
                        createdById: true
                    }
                }
            );
            // console.log(exams);
            res.json(exams);
        } catch (err) {
            next(err)
        }
    }

    static async getExamById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const exam = await prisma.exam.findUnique({
                where: {
                    id: id
                }, select: {
                    id:true,
                    title: true,
                    domain: true,
                    questionCount: true,
                    isDuration: true,
                    durationMinutes: true,
                    isStart: true,
                    startAt: true,
                    endAt: true,
                    testType: true,
                    publishType: true,
                    organization: true,
                    channelId: true,
                    createdById: true
                }
            });
            res.json(exam);
        } catch (err) {
            next(err)
        }
    }
    static async myExam(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const channelId = await prisma.channel.findMany({
                where: {
                    teamMembers: {
                        has: userId
                    }
                },select:{
                        id:true
                    }
            })
            if(channelId.length==0){
                throw { status: 400, message: "No Exam is available for you" }
            }
            const exams=await prisma.exam.findMany({
                where:{
                    channelId:{
                        in:channelId.map(c=>c.id)
                    }
                }
            })
            res.json(exams);
        }
        catch (err) {
            next(err)
        }
    }
    static async getChannelExam(req: Request, res: Response, next: NextFunction) {
        const ChannelId = req.params.channelId as string;
        try {
            const exams = await prisma.exam.findMany({
                where: {
                    channelId: ChannelId
                }, select: {
                    title: true,
                    domain: true,
                    questionCount: true,
                    isDuration: true,
                    durationMinutes: true,
                    isStart: true,
                    startAt: true,
                    endAt: true,
                    testType: true,
                    publishType: true,
                    organization: true,
                    channelId: true,
                    createdById: true
                }
            });
            res.json(exams);
        } catch (err) {
            next(err)
        }
    }
    static async startExam(req: any, res: Response, next: NextFunction) {
        try {
            const examId = req.params.examId as string;
            const studentId = req.user?.id;
            
            const exam = await prisma.exam.findFirst({
                where: {
                    id: examId
                }
            });
            
            if (!exam) {
                return next({ status: 404, message: "Exam not found" });
            }
            
            const existingResponse = await prisma.response.findFirst({
                where: {
                    examId,
                    studentId
                }
            });
            
            res.json({
                ...exam,
                hasResponse: !!existingResponse
            });
        } catch (err) {
            next(err)
        }
    }
}