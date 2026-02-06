import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
export class UserController{
    static async getAllStudent(req:Request,res:Response,next:NextFunction){
        try{
            const user= await prisma.user.findMany({
                where:{
                    role:'student'
                }
            });
            res.send(user);
        }catch(err){
            next(err)
        }
    }
    static async getAllFaculty(req:Request,res:Response,next:NextFunction){
        try{
            const user= await prisma.user.findMany({
                where:{
                    role:'faculty'
                }
            });
            res.send(user);
        }catch(err){
            next(err)
        }
    }
    static async getUser(req:Request,res:Response,next:NextFunction){
         try{
            const userId=req.params.id as string;
            const user= await prisma.user.findUnique({
                where:{
                    id:userId
                }
            });
            res.send(user);
        }catch(err){
            next(err)
        }
    }
    static async myDetail(req:any,res:Response,next:NextFunction){
        try{
            const userId=req.user.id as string;
            const user= await prisma.user.findUnique({
                where:{
                    id:userId
                }
            });
            res.send(user);
        }catch(err){
            next(err)
        }
    }  
    static async updateDetail(req:any, res:Response, next:NextFunction){
        try{
            const userId=req.user.id as string;
            const {name, phoneNo, collegeName, university}=req.body;
            const user= await prisma.user.update({
                where:{
                    id:userId
                },
                data:{
                    name, phoneNo, collegeName, university
                }
            });
            res.send(user);
        }catch(err){
            next(err)
        }
    }
}