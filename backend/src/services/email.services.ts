import { link } from "node:fs";
import { MailConfig, mailGenerator } from "../config/mail.config";
import nodeMailer from 'nodemailer';
const company_name = "Sancilo";
const domain = "http://localhost:5173";

export class EmailServices {
    static sendOtp(secureCode: string, email: string) {
        const emailBody = {
            body: {
                greeting: "Hello",
                intro: [
                    "Your verification code is:",
                    "",
                    `${secureCode}`,
                    "",
                    "This code is valid for 10 minutes. Please do not share it with anyone.",
                ],
                outro: "If you did not request this verification, you can safely ignore this email.",
                signature: "Thanks & regards",
            },
        };
        return mailSender(emailBody, "Your Verification Code", email);

    }
    static sendInvite(group: string, id: string, facultyName: string, college: string,email:string[]) {
        const emailBody = {
            body: {
                greeting: "Dear Student,",
                intro: `You have been invited to join the ${group} channel  on the Sancilo platform for academic communication and important updates.`,
                action: {
                    instructions: "Please click the button below to join the group:",
                    button: {
                        color: "#2F80ED",
                        text: "Join Group",
                        link: domain + "/join-channel/" + id
                    }
                },
                outro: "Kindly ensure you join the group at the earliest to stay informed about announcements and course-related information. For any issues while joining, please contact the faculty."
            },
            signature: `Regards,\n${facultyName}\n${college}`
        };
        return mailSenderBulk(emailBody, `Invitation to Join ${group} Channel`, email);
    }
}

const mailSender = async (template: any, subject: string, email: string): Promise<Boolean> => {
    let transporter = nodeMailer.createTransport(MailConfig);
    const mail = mailGenerator.generate(template);
    let message = {
        from: `" ${company_name}" <infant0475@gmail.com>`,
        to: '<' + email + '>',
        subject: subject,
        html: mail,

    }

    try {
        await transporter.sendMail(message);
        console.log("Successfully sent to " + email);
        return true;
    } catch (error) {
        console.error("Email send failed:", error);
        return false;
    }
}
const mailSenderBulk = async (template: any, subject: string, email: string[]): Promise<Boolean> => {
    let transporter = nodeMailer.createTransport(MailConfig);
    const mail = mailGenerator.generate(template);
    let message = {
        from: `" ${company_name}" <infant0475@gmail.com>`,
         to: "undisclosed-recipients:;",
        bcc:email,
        subject: subject,
        html: mail,
    }

    try {
        await transporter.sendMail(message);
        console.log("Successfully sent to " + email);
        return true;
    } catch (error) {
        console.error("Email send failed:", error);
        return false;
    }
}
const mailSenderWithAttachment = async (template: any, subject: string, email: string, attachment: any): Promise<Boolean> => {
    let transporter = nodeMailer.createTransport(MailConfig);
    const mail = mailGenerator.generate(template);
    let message = {
        from: `" ${company_name}" <infant0475@gmail.com>`,
        to: '<' + email + '>',
        subject: subject,
        html: mail,
        attachments: [
            {
                filename: attachment.filename,
                content: Buffer.from(attachment.content, "utf-8"),
                contentType: attachment.contentType,
            },
        ],
    }

    try {
        await transporter.sendMail(message);
        console.log("Successfully sent to " + email);
        return true;
    } catch (error) {
        console.error("Email send failed:", error);
        return false;
    }
}