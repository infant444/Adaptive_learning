import { fileManager, genAI } from "../config/gemini.config";
import { quizPrompt, descriptivePrompt, projectAnalysisPrompt, projectUnderstandingQuizPrompt, generateExamInstructionsPrompt } from "../constant/prompt";




export class QuestionServices {
  static async generateQuiz(subject: string, difficulty: string, count: number, description: string, file: any) {
    const uploadedFile = await fileManager.uploadFile(file.buffer, {
      mimeType: file.mimetype,
      displayName: file.originalname
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const result = await model.generateContent([
      {
        text: quizPrompt(difficulty, count, subject, description)
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
    const questions = JSON.parse(cleanJsonString);

    return questions;
  }

  static async generateDescriptiveQuestion(subject: string, difficulty: string, count: number, description: string, file: any) {
    const uploadedFile = await fileManager.uploadFile(file.buffer, {
      mimeType: file.mimetype,
      displayName: file.originalname
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const result = await model.generateContent([
      {
        text: descriptivePrompt(difficulty, count, subject, description)
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
    const questions = JSON.parse(cleanJsonString);

    return questions;
  }


  static async generateProjectUnderstandingQuiz(count: number, questionType: 'mcq' | 'descriptive', file: any) {
    const uploadedFile = await fileManager.uploadFile(file.buffer, {
      mimeType: file.mimetype,
      displayName: file.originalname
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const result = await model.generateContent([
      {
        text: projectUnderstandingQuizPrompt(count, questionType)
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
    const questions = JSON.parse(cleanJsonString);

    return questions;
  }

  static async generateExamInstructions(examDetails: {
    questionCount: number;
    testType: string;
    durationMinutes?: number;
    domain?: string;
    difficulty?: string;
  }) {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const result = await model.generateContent([
      {
        text: generateExamInstructionsPrompt(examDetails)
      }
    ]);

    const response = result.response.text();
    const cleanJsonString = response.trim().replace(/```json/g, '').replace(/```/g, '').trim();
    const instructions = JSON.parse(cleanJsonString);

    return instructions;
  }
}