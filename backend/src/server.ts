import dorenv from 'dotenv';
dorenv.config();
import express from 'express';
import cors from 'cors';
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import { errorHandler } from './middleware/error.middleware';
import AuthRouter from './router/auth.route';
const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin:["http://localhost:3000"]
}));

// Attach WebSocket server

app.get("/",(req,res)=>{
    res.status(200).json({
        message:"Hello Welcome to Adaptive Learning" 
    })
})
app.use("/api/auth",AuthRouter);
app.use(errorHandler);


const port=process.env.PORT || 5000;
app.listen(port,()=>{
    console.log("serve on http://localhost:"+port);
    
})