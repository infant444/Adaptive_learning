import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";


export class DashboardController {
  static async getFacultyDashboard(req: any, res: Response,next:NextFunction) {
    try {
      const facultyId = req.user?.id;

      const [
        totalChannels,
        totalExams,
        totalAssignments,
        totalExamResponses,
        recentResponses,
        recentExams,
        recentAssignments,
        examStats,
        assignmentStats,
      ] = await Promise.all([
        prisma.channel.count({ where: { facultyId } }),
        prisma.exam.count({ where: { createdById:facultyId } }),
        prisma.assignment.count({ where: { createdById:facultyId } }),
        prisma.response.count({
          where: { exam: { createdById:facultyId } },
        }),
        prisma.response.findMany({
          where: { exam: { createdById:facultyId} },
          include: { student: true, exam: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.exam.findMany({
          where: { createdById:facultyId },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.assignment.findMany({
          where: { createdById:facultyId },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.exam.findMany({
          where: { createdById:facultyId },
          select: {
            title: true,
            _count: { select: { responses: true } },
          },
          take: 5,
        }),
        prisma.assignment.findMany({
          where: { createdById:facultyId },
          select: {
            title: true,
            _count: { select: { responses: true } },
          },
          take: 5,
        }),
      ]);

      const currentAssignments = await prisma.assignment.count({
        where: {
          createdById:facultyId,
          lastDate: { gte: new Date() },
        },
      });

      res.json({
        totalChannels,
        totalExams,
        totalAssignments,
        totalExamResponses,
        currentAssignments,
        recentResponses,
        recentExams,
        recentAssignments,
        examStats,
        assignmentStats,
      });
    } catch (error) {
     next(error)
    }
  }

  static async getStudentDashboard(req: any, res: Response,next:NextFunction) {
    try {
      const studentId = req.user?.id;

      const [
        totalChannels,
        totalExams,
        totalAssignments,
        completedExams,
        completedAssignments,
        recentExamResponses,
        recentAssignmentResponses,
        upcomingExams,
        pendingAssignments,
        performanceStats,
      ] = await Promise.all([
        prisma.channel.count({
          where: { teamMembers: { has:  studentId  } },
        }),
        prisma.exam.count({
          where: {
            OR: [
              { publishType: "public" },
              { channel: { teamMembers: { has:  studentId  } } },
            ],
          },
        }),
        prisma.assignment.count({
          where: {
            OR: [
              { channel: { teamMembers: { has:  studentId  } } },
            ],
          },
        }),
        prisma.response.count({
          where: { studentId },
        }),
        prisma.assignmentResponse.count({
          where: { studentId, response: { not: {} } },
        }),
        prisma.response.findMany({
          where: { studentId },
          include: { exam: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.assignmentResponse.findMany({
          where: { studentId, response: { not: {} } },
          include: { assignment: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.exam.findMany({
          where: {
            isStart: true,
            startAt: { gte: new Date() },
            OR: [
              { publishType: "public" },
              { channel: { teamMembers: { has:  studentId  } } },
            ],
          },
          orderBy: { startAt: "asc" },
          take: 5,
        }),
        prisma.assignmentResponse.findMany({
          where: {
            studentId,
            response: { equals: {} },
            assignment: { lastDate: { gte: new Date() } },
          },
          include: { assignment: true },
          orderBy: { assignment: { lastDate: "asc" } },
          take: 5,
        }),
        prisma.response.findMany({
          where: { studentId, yourScore: { not: 0 } },
          select: { yourScore: true, exam: { select: { totalScore: true } } },
        }),
      ]);

      const avgScore =
        performanceStats.length > 0
          ? performanceStats.reduce((acc, r) => acc + (r.yourScore || 0), 0) /
            performanceStats.length
          : 0;

      res.json({
        totalChannels,
        totalExams,
        totalAssignments,
        completedExams,
        completedAssignments,
        avgScore: Math.round(avgScore * 100) / 100,
        recentExamResponses,
        recentAssignmentResponses,
        upcomingExams,
        pendingAssignments,
        performanceStats,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  }
}
