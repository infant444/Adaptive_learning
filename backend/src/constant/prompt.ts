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
Analyze the uploaded project document and provide a comprehensive, faculty-friendly summary with detailed insights.

ANALYSIS REQUIREMENTS:

1. PROJECT OVERVIEW:
   - Extract project title and provide a clear, concise description (3-5 sentences)
   - Explain the project in simple terms that any faculty member can understand
   - List main objectives and goals
   - Identify the problem statement and real-world relevance
   - Mention target users or beneficiaries
   - Highlight innovation or unique aspects

2. TECHNICAL DETAILS:
   - List all technologies, frameworks, and tools used
   - Identify programming languages and versions
   - Describe system architecture and design patterns
   - Explain key features and functionalities
   - Mention database design and data flow
   - Note any APIs, third-party integrations, or libraries
   - Identify security measures implemented

3. PROJECT SCOPE & IMPLEMENTATION:
   - Modules or components developed
   - Development methodology used (Agile, Waterfall, etc.)
   - Testing approaches mentioned
   - Deployment strategy if specified
   - Scalability and performance considerations

4. AI-GENERATED CONTENT DETECTION (Liberal Analysis):
   IMPORTANT: Be liberal and fair in assessment. Many students use AI as a writing assistant, which is acceptable.
   - Only flag content as AI-generated if there are STRONG indicators:
     * Overly generic descriptions with no project-specific details
     * Inconsistent technical depth (very detailed in some areas, vague in others)
     * Template-like structure with placeholder-style content
     * Contradictory information or logical inconsistencies
     * Lack of personal insights or decision-making rationale
   - DO NOT penalize for:
     * Well-structured writing or proper grammar
     * Use of technical terminology
     * Professional formatting
     * Clear and concise explanations
   - Estimate percentage conservatively (focus on obvious cases only)
   - Provide specific examples when flagging sections
   - Assess student's genuine understanding based on technical details and implementation specifics

5. QUALITY ASSESSMENT:
   - Completeness: Check if all standard sections are present (introduction, methodology, implementation, results, conclusion)
   - Technical accuracy: Verify if technical claims are sound and feasible
   - Documentation quality: Assess clarity, structure, and professionalism
   - Code quality: If code snippets present, evaluate readability and best practices
   - Visual aids: Note presence of diagrams, flowcharts, screenshots
   - Citations and references: Check if external sources are properly credited
   - Depth of explanation: Evaluate if concepts are explained adequately

6. VIVA QUESTIONS:
   Generate 10-15 targeted viva questions that:
   - Test deep understanding of the project
   - Cover different aspects (technical, implementation, design decisions)
   - Include "why" and "how" questions, not just "what"
   - Probe decision-making and problem-solving approach
   - Include scenario-based questions
   - Mix easy, medium, and challenging questions

7. RECOMMENDATIONS:
   - Specific areas needing improvement or clarification
   - Red flags or concerns faculty should investigate
   - Strengths and positive aspects to acknowledge
   - Suggestions for project enhancement
   - Verification methods to confirm student understanding

Return response in valid JSON format only.

Format:
{
  "projectOverview": {
    "title": "Project title",
    "description": "Clear 3-5 sentence description understandable by any faculty",
    "objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "problemStatement": "Problem being solved with real-world context",
    "targetUsers": "Who will use this project",
    "innovation": "What makes this project unique or innovative"
  },
  "technicalDetails": {
    "technologies": ["Tech 1", "Tech 2", "Tech 3"],
    "languages": ["Language 1", "Language 2"],
    "architecture": "Detailed architecture description",
    "keyFeatures": ["Feature 1 with brief explanation", "Feature 2 with brief explanation"],
    "database": "Database technology and design approach",
    "integrations": ["API 1", "Library 1"],
    "securityMeasures": ["Security measure 1", "Security measure 2"]
  },
  "implementationDetails": {
    "modules": ["Module 1", "Module 2"],
    "methodology": "Development methodology used",
    "testing": "Testing approach mentioned",
    "deployment": "Deployment strategy if specified"
  },
  "aiContentAnalysis": {
    "estimatedAIGeneratedPercentage": 15,
    "analysisNote": "Liberal assessment focusing only on strong indicators",
    "suspiciousSections": [
      {
        "section": "Section name",
        "reason": "Specific reason with evidence",
        "confidence": "high/medium/low",
        "example": "Specific text excerpt if applicable"
      }
    ],
    "originalityScore": 85,
    "understandingIndicators": [
      "Indicator 1 showing genuine understanding",
      "Indicator 2 showing genuine understanding"
    ],
    "writingStyleConsistency": "consistent/inconsistent",
    "technicalDepthAssessment": "Assessment of technical depth and specificity"
  },
  "qualityAssessment": {
    "completeness": 85,
    "technicalAccuracy": 80,
    "documentationQuality": "good/average/poor",
    "codeQuality": "good/average/poor/not-applicable",
    "visualAids": "present/absent",
    "properCitations": true,
    "depthOfExplanation": "thorough/adequate/superficial",
    "overallProfessionalism": 80
  },
  "vivaQuestions": [
    {
      "question": "Viva question 1",
      "category": "technical/implementation/design/problem-solving",
      "difficulty": "easy/medium/hard",
      "purpose": "What this question tests"
    }
  ],
  "recommendations": {
    "strengths": ["Strength 1", "Strength 2"],
    "areasForImprovement": ["Area 1 with specific suggestion", "Area 2 with specific suggestion"],
    "redFlags": ["Concern 1 if any", "Concern 2 if any"],
    "verificationSuggestions": ["How to verify understanding 1", "How to verify understanding 2"],
    "enhancementSuggestions": ["Enhancement 1", "Enhancement 2"]
  },
  "overallAssessment": "Comprehensive 4-6 sentence summary covering project quality, student understanding, and final recommendation"
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

${questionType === 'quiz' || questionType === 'mcq' ? `
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
  timeTaken?: number;
  totalScore: number;
  durationMinutes?: number;
}) => `
You are an experienced and compassionate faculty member reviewing a student's exam performance. Analyze the exam thoroughly and provide professional, constructive, and motivating feedback.

EXAM DETAILS:
- Test Type: ${examData.testType}
- Total Questions: ${examData.questions.length}
- Total Score: ${examData.totalScore}
${examData.durationMinutes ? `- Time Allocated: ${examData.durationMinutes} minutes` : ''}
${examData.timeTaken ? `- Time Taken: ${examData.timeTaken} seconds` : ''}

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
${examData.timeTaken ? `
4. TIME MANAGEMENT:
   - Evaluate if time was used efficiently
   - Average time per question
   - Suggest improvements if needed
` : ''}
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
${examData.timeTaken ? `
4. TIME MANAGEMENT:
   - Evaluate if time was distributed well across questions
   - Identify if any questions were rushed or incomplete
   - Suggest time allocation strategies
` : ''}
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
  ${examData.timeTaken ? `"timeManagement": {
    "totalTimeAllocated": "${examData.durationMinutes || 0} minutes",
    "timeTaken": "${examData.timeTaken} seconds to make as 'MM:SS'",
    "averageTimePerQuestion": "X minutes",
    "efficiency": "Excellent/Good/Needs Improvement",
    "suggestions": ["Time management tip 1", "Time management tip 2"]
  },` : ''}
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


export const projectQuestionAnalysisPrompt = (analysisData: {
  questions: any[];
  studentResponses: any[];
  totalScore: number;
  projectContext?: string;
  type?: string;
}) => `
You are an experienced faculty member evaluating a student's understanding of their project through Q&A assessment. Provide thorough, constructive, and encouraging feedback.

ASSESSMENT DETAILS:
- Assessment Type: ${analysisData.type || 'Project Q&A'}
- Total Questions: ${analysisData.questions.length}
- Total Score: ${analysisData.totalScore}
${analysisData.projectContext ? `- Project Context: ${analysisData.projectContext}` : ''}

QUESTIONS:
${JSON.stringify(analysisData.questions, null, 2)}

STUDENT RESPONSES:
${JSON.stringify(analysisData.studentResponses, null, 2)}

EVALUATION REQUIREMENTS:

1. SCORING WITH LIBERAL GRACE MARKS:
   - Evaluate based on conceptual understanding, not just keyword matching
   - Award marks for:
     * Correct concepts even with different wording
     * Partial understanding with relevant explanations
     * Practical knowledge and real-world application
     * Logical reasoning and problem-solving approach
   - Grace marks (up to 30% per question) for:
     * Demonstrating effort and thought process
     * Partially correct technical details
     * Good attempt with minor conceptual gaps
     * Relevant examples even if incomplete
   - Calculate total marks and percentage

2. QUESTION-WISE DETAILED FEEDBACK:
   - What the student understood correctly
   - Gaps in understanding or missing concepts
   - Key technical points that should be covered
   - How the answer demonstrates project knowledge
   - Specific suggestions for improvement

3. PROJECT UNDERSTANDING ASSESSMENT:
   - Depth of technical knowledge shown
   - Ability to explain design decisions
   - Understanding of implementation details
   - Awareness of challenges and solutions
   - Grasp of project architecture and flow

4. CONCEPTUAL ANALYSIS:
   - Strong areas of understanding
   - Weak areas needing reinforcement
   - Misconceptions to address
   - Topics requiring deeper study

5. STRENGTHS IDENTIFICATION:
   - Technical concepts well understood
   - Good explanations and clarity
   - Practical insights demonstrated
   - Problem-solving abilities shown

6. IMPROVEMENT ROADMAP:
   - Specific technical topics to review
   - Concepts needing clarification
   - Recommended study resources
   - Practice exercises or tasks
   - Areas to explore deeper

7. MOTIVATIONAL FEEDBACK:
   - Acknowledge understanding and effort
   - Encourage continued learning
   - Build confidence in technical abilities
   - Inspire curiosity and exploration

IMPORTANT GUIDELINES:
- Be encouraging and supportive in tone
- Focus on learning and understanding, not just scores
- Provide actionable, specific feedback
- Award grace marks liberally for genuine effort
- Evaluate understanding, not memorization
- Consider project complexity in evaluation
- Balance constructive criticism with positive reinforcement

Return response in valid JSON format:
{
  "scoreAnalysis": {
    "totalMarks": ${analysisData.totalScore},
    "marksObtained": 0,
    "graceMarksAwarded": 0,
    "percentage": 0,
    "grade": "A/B/C/D/F",
    "performanceLevel": "Excellent/Good/Average/Needs Improvement"
  },
  "questionWiseAnalysis": [
    {
      "questionNumber": 1,
      "question": "Question text",
      "studentAnswer": "Student's answer",
      "expectedKeyPoints": ["Key point 1", "Key point 2"],
      "marksAwarded": 0,
      "maxMarks": 0,
      "graceMarksAwarded": 0,
      "feedback": "Detailed constructive feedback",
      "strengthsInAnswer": ["What was good"],
      "areasToImprove": ["What needs work"]
    }
  ],
  "projectUnderstanding": {
    "technicalDepth": "Excellent/Good/Average/Needs Improvement",
    "conceptualClarity": "Excellent/Good/Average/Needs Improvement",
    "practicalKnowledge": "Excellent/Good/Average/Needs Improvement",
    "overallComprehension": "Assessment of overall project understanding"
  },
  "conceptualAnalysis": {
    "strongConcepts": ["Concept 1 well understood", "Concept 2 well understood"],
    "weakConcepts": ["Concept 1 needs work", "Concept 2 needs work"],
    "misconceptions": ["Misconception 1 to address", "Misconception 2 to address"]
  },
  "strengths": [
    "Specific strength 1 with example from answers",
    "Specific strength 2 with example from answers"
  ],
  "improvementRoadmap": [
    {
      "area": "Technical topic or concept",
      "currentUnderstanding": "What student currently knows",
      "targetUnderstanding": "What should be achieved",
      "actionSteps": ["Step 1", "Step 2"],
      "resources": ["Resource 1", "Resource 2"],
      "priority": "High/Medium/Low"
    }
  ],
  "overallFeedback": {
    "summary": "Comprehensive assessment of project knowledge",
    "keyTakeaways": ["Takeaway 1", "Takeaway 2"],
    "nextSteps": ["Next step 1", "Next step 2"],
    "encouragement": "Specific encouraging remarks based on performance"
  },
  "motivationalMessage": "Warm, personalized message that acknowledges the student's effort, highlights their understanding, addresses gaps constructively, and inspires continued learning and project improvement."
}
`;
