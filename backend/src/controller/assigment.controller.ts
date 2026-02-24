
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { QuestionServices } from "../services/question.services";
import { uploadSingle } from "../config/multer.config";
import { supabase } from "../config/supabase.config";
import { AnalysisServices } from "../services/analysis.services";


export class AssignmentController {
    static uploadFile = uploadSingle;
    static async GenerateQuiz(req: any, res: Response, next: NextFunction) {
        try {
            const { count, questionType } = req.body;
            const file = req.file;
            const question = await QuestionServices.generateProjectUnderstandingQuiz(count, questionType, file);
            res.send(question);
        } catch (err) {
            next(err)
        }
    }
    static async create(req: any, res: Response, next: NextFunction) {
        try {
            const createdBy = req.user.id;
            const { title,
                description,
                projectType,
                isQuestions,
                lastDate,
                questionCount,
                questions,
                totalScore,
                examType,
                channelId
            } = req.body;
            const assignment = await prisma.assignment.create({
                data: {
                    title,
                    description,
                    projectType,
                    isQuestions,
                    lastDate: lastDate ? new Date(lastDate) : new Date(),
                    questionCount,
                    questions,
                    totalScore,
                    examType,
                    channelId,
                    createdById: createdBy
                }
            });
            res.send(assignment);
        } catch (err) {
            next(err)
        }
    }
    static async getAllInChannel(req: any, res: Response, next: NextFunction) {
        try {
            const channelId = req.params.channelId as string;
            const assignments = await prisma.assignment.findMany({
                where: {
                    channelId: channelId
                }, orderBy: {
                    createdAt: 'desc'
                }
            });
            if (req.user.role == 'student') {
                const userId = req.user.id;
                const assignmentsWithStatus = await Promise.all(
                    assignments.map(async (assignment) => {
                        const response = await prisma.assignmentResponse.findFirst({
                            where: {
                                assignmentId: assignment.id,
                                studentId: userId
                            }
                        });
                        return {
                            ...assignment,
                            status: response?.response ? "completed" : assignment.isQuestions == false && response?.analyses ? "completed" : "pending",
                            yourScore: response?.yourScore || 0,
                            isAnalysis: response?.analyses || false
                        };
                    })
                );
                res.send(assignmentsWithStatus);
                return;
            }
            res.send(assignments);
        } catch (err) {
            next(err)
        }
    }
    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const assignment = await prisma.assignment.findUnique({
                where: {
                    id: id
                },
            });
            res.send(assignment);
        } catch (err) {
            next(err)
        }
    }
    static async getForFaculty(req: any, res: Response, next: NextFunction) {
        try {
            const createdBy = req.user.id;
            const assignments = await prisma.assignment.findMany({
                where: {
                    createdById: createdBy
                }, orderBy: {
                    createdAt: 'desc'
                }
            });
            res.send(assignments);
        } catch (err) {
            next(err)
        }
    }
    static async myAssignment(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const channelId = await prisma.channel.findMany({
                where: {
                    teamMembers: {
                        has: userId
                    }
                }, select: {
                    id: true
                }, orderBy: {
                    createdAt: 'desc'
                }
            })

            if (channelId.length == 0) {
                throw { status: 400, message: "No Assignment is available for you" }
            }

            const assignments = await prisma.assignment.findMany({
                where: {
                    channelId: {
                        in: channelId.map(c => c.id)
                    },
                    lastDate: {
                        gte: new Date()
                    }
                }
            })

            const assignmentsWithStatus = await Promise.all(
                assignments.map(async (assignment) => {
                    const response = await prisma.assignmentResponse.findFirst({
                        where: {
                            assignmentId: assignment.id,
                            studentId: userId
                        }
                    });
                    return {
                        ...assignment,
                        status: response?.response ? "completed" : assignment.isQuestions == false && response?.analyses ? "completed" : "pending",
                        yourScore: response?.yourScore || 0
                    };
                })
            );

            res.json(assignmentsWithStatus);
        }
        catch (err) {
            next(err)
        }
    }
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { title,
                description,
                projectType,
                lastDate,
                totalScore,
            } = req.body;
            const assignment = await prisma.assignment.update({
                where: {
                    id: id
                },
                data: {
                    title,
                    description,
                    projectType,
                    lastDate: lastDate ? new Date(lastDate) : undefined,
                    totalScore,
                }
            });
            res.send(assignment);
        } catch (err) {
            next(err)
        }
    }
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            await prisma.assignment.delete({
                where: {
                    id: id
                },
            })
        } catch (err) {
            next(err)
        }
    }

    // Assignment Response
    static async submitAssignment(req: any, res: Response, next: NextFunction) {
        try {
            const studentId = req.user.id;
            const assignmentId = req.params.id;
            const file = req.file;
            const assignment = await prisma.assignment.findUnique({
                where: { id: assignmentId }
            })

            let attachmentUrl = null;
            if (file && supabase) {
                const sanitizedFileName = file.originalname
                    .replace(/[^a-zA-Z0-9._-]/g, '_')
                    .replace(/_{2,}/g, '_');
                const fileName = `${Date.now()}-${sanitizedFileName}`;
                const { data, error } = await supabase.storage
                    .from('assignments')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype
                    });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('assignments')
                    .getPublicUrl(fileName);

                attachmentUrl = publicUrl;
            }
            let question = null
            if (assignment && assignment.isQuestions && (assignment.examType === 'quiz' || assignment.examType === 'summary')) {
                question = await QuestionServices.generateProjectUnderstandingQuiz(assignment.questionCount as number, assignment.examType, file)
            }
            const analyses = await AnalysisServices.analyzeProject(file);
            const assignmentResponse = await prisma.assignmentResponse.create({
                data: {
                    assignmentId,
                    studentId,
                    facultyId: assignment?.createdById,
                    totalScore: assignment?.totalScore as number,
                    isAnalyses: true,
                    analyses,
                    attachment: attachmentUrl,
                    question
                },
                include: {
                    assignment: true,
                }
            });
            res.json(assignmentResponse);
        } catch (err) {
            next(err)
        }
    }
    static async getAssignmentResponses(req: Request, res: Response, next: NextFunction) {
        try {
            const assignmentId = req.params.id as string;
            const responses = await prisma.assignmentResponse.findMany({
                where: {
                    assignmentId: assignmentId
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }, orderBy: {
                    createdAt: 'desc'
                }
            });
            res.json(responses);
        } catch (err) {
            next(err)
        }
    }
    static async getMyAssignmentResponses(req: any, res: Response, next: NextFunction) {
        try {
            const studentId = req.user.id;
            const responses = await prisma.assignmentResponse.findMany({
                where: {
                    studentId: studentId
                },
                include: {
                    assignment: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            lastDate: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            res.json(responses);
        } catch (err) {
            next(err)
        }
    }
    static async getResponseById(req: any, res: Response, next: NextFunction) {
        try {
            const studentId = req.user.id;
            const id = req.params.id as string;
            const response = await prisma.assignmentResponse.findFirst({
                where: {
                    assignmentId: id,
                    studentId: studentId
                },
                include: {
                    student: true,
                    assignment: true
                }
            });
            if (response && response.response) {
                res.json({ ...response, alreadyCompleted: true });
                return;
            }
            res.json(response);
        } catch (err) {
            next(err)
        }
    }
    static async getMyResponseId(req: any, res: Response, next: NextFunction) {
        try {
            const id = req.user.id as string;
            const response = await prisma.assignmentResponse.findMany({
                where: {
                    studentId: id
                },
                select: {
                    id: true,
                    assignmentId: true
                }
            });
            res.json(response);
        } catch (err) {
            next(err)
        }
    }
    static async addResponse(req: any, res: Response, next: NextFunction) {
        try {
            const assignmentId = req.params.id as string;
            const studentId = req.user.id;
            const { response, violations, isTerminated, terminatedReason } = req.body;
            let analyses = null
            if (!isTerminated) {
                const assignmentResponse = await prisma.assignmentResponse.findFirst({
                    where: { assignmentId, studentId },
                    include: { assignment: true }
                });
                console.log(assignmentResponse)
                const parsedQuestion = typeof assignmentResponse?.question === 'string'
                    ? JSON.parse(assignmentResponse.question)
                    : assignmentResponse?.question;
                const questions = (parsedQuestion as any)?.questions || [];
                analyses = await AnalysisServices.analyzeExam({
                    testType: assignmentResponse?.assignment?.examType || 'quiz',
                    questions,
                    studentResponses: response,
                    totalScore: assignmentResponse?.totalScore || 0,
                });
            }
            const updatedResponse = await prisma.assignmentResponse.updateMany({
                where: {
                    assignmentId,
                    studentId
                },
                data: {
                    response,
                    violations,
                    isTerminated,
                    terminatedReason,
                    responseAnalysis: response
                }
            });
            res.json(updatedResponse);
        } catch (err) {
            next(err)
        }
    }
    static async sendFeedback(req: any, res: Response, next: NextFunction) {
        try {
            const responseId = req.params.id;
            const { score, review } = req.body;
            const updatedResponse = await prisma.assignmentResponse.update({
                where: {
                    id: responseId
                },
                data: {
                    yourScore: score,
                    facultyReview: review
                }
            });
            res.json(updatedResponse);
        } catch (err) {
            next(err);
        }
    }
}