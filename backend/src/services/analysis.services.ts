import { fileManager, genAI } from "../config/gemini.config";
import { projectAnalysisPrompt, examAnalysisPrompt, projectQuestionAnalysisPrompt } from "../constant/prompt";

export class AnalysisServices {
    static async analyzeProject(file: any) {
        const uploadedFile = await fileManager.uploadFile(file.buffer, {
            mimeType: file.mimetype,
            displayName: file.originalname
        });

        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview"
        });

        const result = await model.generateContent([
            {
                text: projectAnalysisPrompt()
            },
            {
                fileData: {
                    fileUri: uploadedFile.file.uri,
                    mimeType: uploadedFile.file.mimeType
                }
            }
        ]);

        const response = result.response.text();
        const cleanJsonString = response.trim().replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanJsonString);

        return analysis;
    }

    static async analyzeExam(examData: {
        testType: string;
        questions: any[];
        studentResponses: any[];
        timeTaken?: number;
        totalScore: number;
        durationMinutes?: number;
    }) {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview"
        });

        const result = await model.generateContent([
            {
                text: examAnalysisPrompt(examData)
            }
        ]);

        const response = result.response.text();
        const cleanJsonString = response.trim().replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanJsonString);

        return analysis;
    }
    static async analyzeProjectQuestions(analysisData: {
        questions: any[];
        studentResponses: any[];
        totalScore: number;
        projectContext?: string;
        type?:string
    }) {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview"
        });

        const result = await model.generateContent([
            {
                text: projectQuestionAnalysisPrompt(analysisData)
            }
        ]);

        const response = result.response.text();
        const cleanJsonString = response.trim().replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanJsonString);

        return analysis;
    }

}