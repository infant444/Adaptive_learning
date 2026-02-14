import { fileManager, genAI } from "../config/gemini.config";

const quizPrompt = (difficulty: string, count: number, subject: string, description: string) => `
Generate ${count} multiple-choice questions STRICTLY based ONLY on the content from the uploaded document.

IMPORTANT RULES:
- Extract questions ONLY from the provided document content
- DO NOT use fully from external knowledge or information instance use 10%-20% of knowledge taken from external but also it completely relevant to provided document content
- Subject: ${subject}
- Difficulty: ${difficulty}
- Description: ${description}
- To use a description as instruction to follow or given some added on component like something which are not present in document but need to add the concept on the question
- don't use  document page number in any case document is full of program use a program is directly in a question with a proper structure
- If document is not available check where description is available if description is available the use description in case document and description both are not available return empty array
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


const descriptivePrompt = (difficulty: string, count: number, subject: string, description: string) => `
Generate ${count} descriptive/essay-type questions STRICTLY based ONLY on the content from the uploaded document.

IMPORTANT RULES:
- Extract questions ONLY from the provided document content
- Questions should require detailed explanations and understanding
- Subject: ${subject}
- Difficulty: ${difficulty}
- Description: ${description}
- Use description as additional instruction or context
- Don't reference document page numbers
- If document contains programs/code, reference them directly in questions
- Each question should have:
  * Clear question statement
  * Key points that should be covered in the answer
  * Suggested answer length (words/paragraphs)
- Return response in valid JSON format only

Format:
{
  "questions": [
    {
      "question": "Detailed question text from document",
      "keyPoints": [
        "Key point 1 that should be covered",
        "Key point 2 that should be covered",
        "Key point 3 that should be covered"
      ],
      "suggestedLength": "200-300 words" or "2-3 paragraphs",
      "marks": 10
    }
  ]
}
`;

const projectAnalysisPrompt = () => `
Analyze the uploaded project document and provide a comprehensive summary for faculty review.

ANALYSIS REQUIREMENTS:
1. PROJECT OVERVIEW:
   - What is the project about?
   - Main objectives and goals
   - Problem statement being addressed

2. TECHNICAL DETAILS:
   - Technologies/frameworks/tools used
   - Programming languages
   - Architecture/design patterns
   - Key features implemented

3. AI-GENERATED CONTENT DETECTION:
   - Estimate percentage of content that appears to be AI-generated or copy-pasted
   - Identify sections with generic/template-like content
   - Flag inconsistencies in writing style or technical depth
   - Assess originality and student understanding

4. QUALITY ASSESSMENT:
   - Completeness of documentation
   - Technical accuracy
   - Code quality indicators (if code is present)
   - Proper citations and references

5. RECOMMENDATIONS:
   - Areas needing improvement
   - Questions faculty should ask the student
   - Suggestions for verification of understanding

Return response in valid JSON format only.

Format:
{
  "projectOverview": {
    "title": "Project title",
    "description": "Brief description",
    "objectives": ["Objective 1", "Objective 2"],
    "problemStatement": "Problem being solved"
  },
  "technicalDetails": {
    "technologies": ["Tech 1", "Tech 2"],
    "languages": ["Language 1", "Language 2"],
    "architecture": "Architecture description",
    "keyFeatures": ["Feature 1", "Feature 2"]
  },
  "aiContentAnalysis": {
    "estimatedAIGeneratedPercentage": 30,
    "suspiciousSections": [
      {
        "section": "Section name",
        "reason": "Why it appears AI-generated",
        "confidence": "high/medium/low"
      }
    ],
    "originalityScore": 70,
    "writingStyleConsistency": "consistent/inconsistent"
  },
  "qualityAssessment": {
    "completeness": 85,
    "technicalAccuracy": 80,
    "documentationQuality": "good/average/poor",
    "codeQuality": "good/average/poor/not-applicable",
    "properCitations": true
  },
  "recommendations": {
    "areasForImprovement": ["Area 1", "Area 2"],
    "questionsForStudent": ["Question 1", "Question 2"],
    "verificationSuggestions": ["Suggestion 1", "Suggestion 2"]
  },
  "overallAssessment": "Brief overall assessment summary"
}
`;

const projectUnderstandingQuizPrompt = (count: number, questionType: string) => `
Generate ${count} ${questionType} questions to assess the student's understanding of their uploaded project.

IMPORTANT RULES:
- Questions should test DEEP UNDERSTANDING, not just memorization
- Focus on:
  * Why certain technologies/approaches were chosen
  * How different components work together
  * Problem-solving decisions made
  * Trade-offs and alternatives considered
  * Implementation challenges and solutions
  * Real-world application and scalability
- Questions should reveal if student truly understands or just copied content
- Mix conceptual and practical questions
- Include "what-if" scenarios to test adaptability

${questionType === 'mcq' ? `
For Multiple Choice Questions:
- Each question must have 4 options (A, B, C, D)
- Options should be plausible to test real understanding
- Avoid obvious wrong answers

Format:
{
  "questions": [
    {
      "question": "Why did you choose [technology] for [specific component]?",
      "options": {
        "A": "Plausible reason 1",
        "B": "Plausible reason 2",
        "C": "Plausible reason 3",
        "D": "Plausible reason 4"
      },
      "correctAnswer": "A",
      "explanation": "Why this answer tests understanding"
    }
  ]
}
` : `
For Descriptive Questions:
- Questions should require detailed explanations
- Include key points that demonstrate understanding
- Specify what depth of answer is expected

Format:
{
  "questions": [
    {
      "question": "Explain the architecture of your project and justify your design decisions",
      "keyPoints": [
        "Component interaction explanation",
        "Technology choice justification",
        "Scalability considerations",
        "Alternative approaches considered"
      ],
      "suggestedLength": "300-400 words",
      "marks": 15,
      "evaluationCriteria": [
        "Technical accuracy",
        "Depth of understanding",
        "Critical thinking",
        "Practical considerations"
      ]
    }
  ]
}
`}

Return response in valid JSON format only.
`;
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
}