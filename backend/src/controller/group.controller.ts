import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { EmailServices } from "../services/email.services";
export class GroupController {
    static async createGroup(req: any, res: Response, next: NextFunction) {
        try {
            const facultyId = req.user.id;
            const { name, description, isPrivate } = req.body;
            const group = await prisma.channel.create({
                data: {
                    name,
                    description,
                    facultyId,
                    isPrivate
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
                },
                include: {
                    faculty: true
                }
            })

            if (group && group.teamMembers.length > 0) {
                const teamMembersDetail = await prisma.user.findMany({
                    where: {
                        id: {
                            in: group.teamMembers
                        }
                    }
                })
                res.json({ ...group, teamMembersDetail })
            } else {
                res.json({ ...group, teamMembersDetail: [] })
            }
        } catch (err) {
            next(err)
        }
    }
    static async ExploreGroup(req: any, res: Response, next: NextFunction) {
        try {
            const studentId = req.user.id;
            const groups = await prisma.channel.findMany({
                where: {
                    AND: [
                        { isPrivate: false },
                        {
                            NOT: {
                                teamMembers: {
                                    has: studentId
                                }
                            }
                        }
                    ]
                },

                include: {
                    faculty: true
                }
            })
         
            res.json(groups)
        } catch (err) {
            next(err)
        }
    }
    static async exitGroup(req: any, res: Response, next: NextFunction) {
        try {
            const studentId = req.user.id;
            const groupId = req.params.id;
            const group = await prisma.channel.findUnique({
                where: { id: groupId }
            });
            if (group) {
                const updatedMembers = group.teamMembers.filter(id => id !== studentId);
                const updatedGroup = await prisma.channel.update({
                    where: { id: groupId },
                    data: { teamMembers: updatedMembers }
                });
                res.json(updatedGroup);
            }
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
    static async sendInvite(req: Request, res: Response, next: NextFunction) {
        try {
            const { emails, id } = req.body;
            const group = await prisma.channel.findUnique({
                where: {
                    id: id
                },
                include: {
                    faculty: true
                }
            })

            await EmailServices.sendInvite(group?.name || "Group", id, group?.faculty?.name || "Faculty", group?.faculty?.collegeName || "College", emails);

            res.json({ message: "Invitations sent successfully!" })
        } catch (err) {
            next(err);
        }
    }
    static async updateGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { name, description, isPrivate } = req.body;
            const group = await prisma.channel.update({
                where: {
                    id: id
                },
                data: {
                    name,
                    description,
                    isPrivate
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