import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { io } from "../server";

export class DiscussionController {
    static async getMessages(req: any, res: Response, next: NextFunction) {
        try {
            const { channelId } = req.params;
            const messages = await prisma.discussion.findMany({
                where: { channelId },
                include: { sendUser: { select: { id: true, name: true, email: true } } },
                orderBy: { sendAt: 'asc' }
            });
            res.json(messages);
        } catch (err) {
            next(err);
        }
    }

    static async sendMessage(req: any, res: Response, next: NextFunction) {
        try {
            const { channelId } = req.params;
            const { message } = req.body;
            const sendBy = req.user.id;
            
            const newMessage = await prisma.discussion.create({
                data: { message, sendBy, channelId },
                include: { sendUser: { select: { id: true, name: true, email: true } } }
            });
            
            io.to(channelId).emit('new-message', newMessage);
            
            res.json(newMessage);
        } catch (err) {
            next(err);
        }
    }
}
