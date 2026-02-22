export const quizPrompt = (difficulty: string, count: number, subject: string, description: string) => `
Generate EXACTLY ${count} multiple-choice questions STRICTLY based ONLY on the content from the uploaded document.

CRITICAL: You MUST generate EXACTLY ${count} questions, no more, no less.

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
- Each question has 1 mark
- Calculate totalScore as total number of questions (which should be ${count})
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
  ],
  "totalScore": ${count}
}
`;


export const descriptivePrompt = (difficulty: string, count: number, subject: string, description: string) => `
Generate EXACTLY ${count} descriptive/essay-type questions STRICTLY based ONLY on the content from the uploaded document.

CRITICAL: You MUST generate EXACTLY ${count} questions, no more, no less.

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
  * Marks for each question
- Calculate totalScore as sum of all question marks
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
  ],
  "totalScore": 100
}
`;

export const projectAnalysisPrompt = () => `
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

export const projectUnderstandingQuizPrompt = (count: number, questionType: string) => `
Generate EXACTLY ${count} ${questionType} questions to assess the student's understanding of their uploaded project.

CRITICAL: You MUST generate EXACTLY ${count} questions, no more, no less.

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
- Each question has 1 mark
- Calculate totalScore as total number of questions

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
  ],
  "totalScore": 10
}
` : `
For Descriptive Questions:
- Questions should require detailed explanations
- Include key points that demonstrate understanding
- Specify what depth of answer is expected
- Assign marks for each question
- Calculate totalScore as sum of all question marks

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
  ],
  "totalScore": 100
}
`}

Return response in valid JSON format only.
`;


export const generateExamInstructionsPrompt = (examDetails: {
  questionCount: number;
  testType: string;
  durationMinutes?: number;
  domain?: string;
  difficulty?: string;
}) => `
Generate comprehensive exam instructions for students based on the following exam details:

Exam Details:
- Total Questions: ${examDetails.questionCount}
- Test Type: ${examDetails.testType}
- Duration: ${examDetails.durationMinutes ? `${examDetails.durationMinutes} minutes` : 'No time limit'}
- Domain: ${examDetails.domain || 'General'}
- Difficulty: ${examDetails.difficulty || 'Medium'}

Generate clear, professional instructions that include:

1. GENERAL INSTRUCTIONS:
   - How to navigate through questions
   - How to submit answers
   - What happens if time runs out (if timed)
   - Can students review/change answers
   - Auto-save functionality

2. EXAM-SPECIFIC GUIDELINES:
   ${examDetails.testType === 'quiz' ? `
   - Each question has only one correct answer
   - Select the best option from given choices
   - No negative marking
   - Unanswered questions will be marked as incorrect
   ` : examDetails.testType === 'coding' ? `
   - Write clean, well-commented code
   - Test your code before submission
   - Follow proper naming conventions
   - Include edge case handling
   - Time complexity matters
   ` : `
   - Write detailed, well-structured answers
   - Support your answers with examples
   - Be clear and concise
   - Proper formatting will be appreciated
   - Plagiarism will result in zero marks
   `}

3. TIME MANAGEMENT:
   ${examDetails.durationMinutes ? `
   - Total time: ${examDetails.durationMinutes} minutes
   - Suggested time per question: ${Math.floor(examDetails.durationMinutes / examDetails.questionCount)} minutes
   - Timer will be visible throughout
   - Warning at 5 minutes remaining
   - Auto-submit when time expires
   ` : `
   - No time limit for this exam
   - Take your time to answer thoughtfully
   - You can save and return later
   - Ensure to submit before deadline
   `}

4. TECHNICAL REQUIREMENTS:
   - Stable internet connection required
   - Use updated browser (Chrome/Firefox recommended)
   - Don't refresh the page during exam
   - Don't use browser back button
   - Keep your device charged

5. EXAM RULES:
   - No external help or resources allowed
   - Keep your workspace clear
   - No communication with others
   - Violation will result in disqualification
   - All activities are monitored

6. BEFORE YOU START:
   - Read all instructions carefully
   - Check your internet connection
   - Close unnecessary tabs/applications
   - Have a backup device ready
   - Note the submission deadline

Return response in valid JSON format:
{
  "title": "Exam Instructions",
  "generalInstructions": ["Instruction 1", "Instruction 2"],
  "examGuidelines": ["Guideline 1", "Guideline 2"],
  "timeManagement": ["Time tip 1", "Time tip 2"],
  "technicalRequirements": ["Requirement 1", "Requirement 2"],
  "examRules": ["Rule 1", "Rule 2"],
  "beforeYouStart": ["Checklist item 1", "Checklist item 2"],
  "importantNotes": ["Note 1", "Note 2"]
}
`;

export const examAnalysisPrompt = (examData: {
  testType: string;
  questions: any[];
  studentResponses: any[];
  timeTaken: number;
  totalScore: number;
  durationMinutes?: number;
}) => `
You are an experienced and compassionate faculty member reviewing a student's exam performance. Analyze the exam thoroughly and provide professional, constructive, and motivating feedback.

EXAM DETAILS:
- Test Type: ${examData.testType}
- Total Questions: ${examData.questions.length}
- Total Score: ${examData.totalScore}
- Time Allocated: ${examData.durationMinutes ? `${examData.durationMinutes} minutes` : 'No time limit'}
- Time Taken: ${examData.timeTaken} minutes

QUESTIONS AND ANSWERS:
${JSON.stringify(examData.questions, null, 2)}

STUDENT RESPONSES:
${JSON.stringify(examData.studentResponses, null, 2)}

ANALYSIS REQUIREMENTS:

${examData.testType === 'quiz' ? `
FOR QUIZ/MCQ TYPE:
1. SCORING:
   - Check each answer against correct answer
   - Each correct answer = 1 mark
   - Calculate total marks obtained
   - Calculate percentage score

2. MISTAKE ANALYSIS:
   - Identify which questions were answered incorrectly
   - For each mistake, explain:
     * What was the correct answer
     * Why the student's answer was incorrect
     * The concept/topic being tested

3. PATTERN IDENTIFICATION:
   - Identify topics where student struggled most
   - Identify topics where student performed well
   - Note any patterns in mistakes

4. TIME MANAGEMENT:
   - Evaluate if time was used efficiently
   - Average time per question
   - Suggest improvements if needed
` : `
FOR DESCRIPTIVE TYPE:
1. SCORING (WITH GRACE MARKS):
   - Evaluate each answer based on:
     * Relevance to the question (even if keywords don't match exactly)
     * Conceptual understanding demonstrated
     * Depth and clarity of explanation
     * Coverage of key points
     * Examples and practical application
   - Award marks out of total marks for each question
   - Provide grace marks (up to 20% of question marks) for:
     * Partially correct answers
     * Good attempt with minor gaps
     * Relevant content even if not perfectly structured
   - Calculate total marks obtained
   - Calculate percentage score

2. DETAILED FEEDBACK PER QUESTION:
   - What was done well
   - What was missing or incorrect
   - Key points that should have been covered
   - How to improve the answer

3. CONTENT QUALITY ANALYSIS:
   - Depth of understanding shown
   - Clarity of expression
   - Use of examples and explanations
   - Logical flow and structure

4. TIME MANAGEMENT:
   - Evaluate if time was distributed well across questions
   - Identify if any questions were rushed or incomplete
   - Suggest time allocation strategies
`}

5. STRENGTHS:
   - Highlight what the student did well
   - Acknowledge good performance areas
   - Positive reinforcement

6. AREAS FOR IMPROVEMENT:
   - Specific topics/concepts to review
   - Study strategies and resources
   - Practice recommendations

7. FOCUS AREAS:
   - Priority topics to focus on
   - Recommended learning path
   - Specific skills to develop

8. MOTIVATIONAL MESSAGE:
   - Encouraging and supportive tone
   - Acknowledge effort and progress
   - Build confidence for future attempts

IMPORTANT GUIDELINES:
- Be professional yet warm and encouraging
- Provide specific, actionable feedback
- Balance criticism with positive reinforcement
- Focus on learning and growth, not just scores
- Use gentle language that motivates rather than discourages
- For descriptive answers, be lenient and award grace marks for relevant content
- Don't just look for exact keyword matches - evaluate understanding

Return response in valid JSON format:
{
  "scoreAnalysis": {
    "totalMarks": ${examData.totalScore},
    "marksObtained": 0,
    "percentage": 0,
    "grade": "A/B/C/D/F",
    "performanceLevel": "Excellent/Good/Average/Needs Improvement"
  },
  "questionWiseAnalysis": [
    {
      "questionNumber": 1,
      "question": "Question text",
      "studentAnswer": "Student's answer",
      "correctAnswer": "Correct answer or key points",
      "marksAwarded": 0,
      "maxMarks": 1,
      "isCorrect": true,
      "feedback": "Detailed feedback for this question",
      "graceMarksAwarded": 0
    }
  ],
  "mistakeAnalysis": [
    {
      "questionNumber": 1,
      "topic": "Topic name",
      "mistake": "What went wrong",
      "correctConcept": "Explanation of correct concept",
      "howToImprove": "Specific improvement suggestion"
    }
  ],
  "timeManagement": {
    "totalTimeAllocated": "${examData.durationMinutes || 0} minutes",
    "timeTaken": "${examData.timeTaken} minutes",
    "averageTimePerQuestion": "X minutes",
    "efficiency": "Excellent/Good/Needs Improvement",
    "suggestions": ["Time management tip 1", "Time management tip 2"]
  },
  "strengths": [
    "Strength 1 with specific example",
    "Strength 2 with specific example"
  ],
  "areasForImprovement": [
    {
      "area": "Topic/Skill name",
      "currentLevel": "Description of current understanding",
      "targetLevel": "What should be achieved",
      "actionSteps": ["Step 1", "Step 2"],
      "resources": ["Resource 1", "Resource 2"]
    }
  ],
  "focusAreas": [
    {
      "priority": "High/Medium/Low",
      "topic": "Topic name",
      "reason": "Why this needs focus",
      "studyPlan": "Recommended approach"
    }
  ],
  "overallFeedback": {
    "summary": "Overall performance summary",
    "progressIndicators": ["Indicator 1", "Indicator 2"],
    "nextSteps": ["Next step 1", "Next step 2"]
  },
  "motivationalMessage": "Warm, encouraging message that acknowledges effort, celebrates strengths, and inspires continued learning. Be specific about what the student did well and express confidence in their ability to improve."
}
`;