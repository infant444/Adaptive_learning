import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export class GroupController {
    static async createGroup(req: any, res: Response, next: NextFunction) {
        try {
            const facultyId = req.user.id;
            const { name, description } = req.body;
            const group = await prisma.channel.create({
                data: {
                    name,
                    description,
                    facultyId
                }
            })
            res.json(group)
        } catch (err) {
            next(err)
        }
    }

    static async getGroups(req: any, res: Response, next: NextFunction) {
        try {
            const facultyId = req.user.id;
            const groups = await prisma.channel.findMany({
                where: {
                    facultyId
                }
            })
            res.json(groups)
        } catch (err) {
            next(err)
        }
    }
    static async getGroupById(req: any, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const group = await prisma.channel.findUnique({
                where: {
                    id: id
                }
            })
            res.json(group)
        } catch (err) {
            next(err)
        }
    }
    static async getStudentGroups(req: any, res: Response, next: NextFunction) {
        try {
            const studentId = req.user.id;
            const groups = await prisma.channel.findMany({
                where: {
                    teamMembers: {
                        has: studentId
                    }
                }
            })
            res.json(groups)
        } catch (err) {
            next(err)
        }
    }
    static async addTeamMember(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id as string;
            const id = req.params.id;
            const group = await prisma.channel.update({
                where: {
                    id: id
                },
                data: {
                    teamMembers: {
                        push: userId
                    }
                }
            })
            res.send(group)
        } catch (err) {
            next(err);
        }
    }
    static async updateGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { name, description } = req.body;
            const group = await prisma.channel.update({
                where: {
                    id: id
                },
                data: {
                    name,
                    description
                }
            })
            res.json(group)
        } catch (err) {
            next(err)
        }
    }
    static async deleteGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            await prisma.channel.delete({
                where: {
                    id: id
                }
            });
            res.json({ message: "Channel deleted successfully! " })
        } catch (err) {
            next(err)
        }
    }
}