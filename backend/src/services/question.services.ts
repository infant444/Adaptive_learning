import { fileManager, genAI } from "../config/gemini.config";

const quizPrompt = (difficulty: string, count: number, subject: string,description:string) => `
Generate ${count} multiple-choice questions STRICTLY based ONLY on the content from the uploaded document.

IMPORTANT RULES:
- Extract questions ONLY from the provided document content
- DO NOT use fully from external knowledge or information instance use 10%-20% of knowledge taken from external but also it completely relevant to provided document content
- Subject: ${subject}
- Difficulty: ${difficulty}
- Description: ${description}
- To use a description as instruction to follow or given some added on component like something which are not present in document but need to add the concept on the question
- don't use  document page number in any case document is full of program use a program is directly in a question with a proper structure
- Each question must have 4 options (A, B, C, D)
- All questions and answers must come directly from the document
- Indicate the correct answer
- Return response in valid JSON format only

Format:
{
  "questions": [
    {
      "question": "Question text from document",
      "options": {
        "A": "Option A from document",
        "B": "Option B from document",
        "C": "Option C from document",
        "D": "Option D from document"
      },
      "correctAnswer": "A"
    }
  ]
}
`;

export class QuestionServices {
    static async generateQuiz(subject: string, difficulty: string, count: number,description:string, file: any) {
        const uploadedFile = await fileManager.uploadFile(file.buffer, {
            mimeType: file.mimetype,
            displayName: file.originalname
        });

        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview"
        });

        const result = await model.generateContent([
            {
                text: quizPrompt(difficulty, count, subject,description)
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
}