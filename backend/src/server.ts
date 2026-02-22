import dorenv from 'dotenv';
dorenv.config();
import express from 'express';
import cors from 'cors';
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { errorHandler } from './middleware/error.middleware';
import AuthRouter from './router/auth.route';
import ExamRouter from './router/exam.route';
import ChannelRouter from './router/group.route';
import UserRouter from './router/user.route';
import DiscussionRouter from './router/discussion.route';
import ResponseRouter from './router/response.route';
import FeedBackRouter from './router/feedback.route';
const app=express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin:["http://localhost:5173",]
}));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-channel', (channelId) => {
        socket.join(channelId);
        console.log(`User ${socket.id} joined channel ${channelId}`);
    });

    socket.on('leave-channel', (channelId) => {
        socket.leave(channelId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

export { io };

app.get("/",(req,res)=>{
    res.status(200).json({
        message:"Hello Welcome to Adaptive Learning" 
    })
})
app.use("/api/auth",AuthRouter);
app.use("/api/user",UserRouter)
app.use("/api/channel",ChannelRouter);
app.use("/api/exam",ExamRouter);
app.use("/api/discussion",DiscussionRouter);
app.use("/api/response",ResponseRouter);
app.use("/api/feedback",FeedBackRouter)
app.use(errorHandler);


const port=process.env.PORT || 5000;
server.listen(port,()=>{
    console.log("serve on http://localhost:"+port);
    
})