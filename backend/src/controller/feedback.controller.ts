
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export class feedbackController {
    static async AddFeedback(req:any,res:Response,next:NextFunction){
        try{
            const examId=req.params.examId as string;
            const studentId= req.user.id as string;
            const{message,rating}=req.body;
            const feedback=await prisma.examFeedback.create({
                data:{
                    message,
                    rating,
                    examId,
                    studentId,
                }
            });
            res.json(feedback);
        }catch(err){
            next(err)
        }
    }
    static async getFeedback(req:Request,res:Response,next:NextFunction){
        try{
            const examId=req.params.id as string;
            const feedback=await prisma.examFeedback.findMany({
                where:{
                    examId
                },include:{
                    student:true
                }
            })
            res.send(feedback)
        }catch(err){
            next(err)
        }
    }
}