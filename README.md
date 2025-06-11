# Exam_Point-AI_Powered_Online_Exam_System


I developed a full-stack online exam platform that leverages generative AI for automated answer evaluation. The system enables teachers to create exams with multiple question types (MCQ, fill-in-the-blank, and long/paragraph answers) and provides students with a seamless test-taking experience.
Tech Stack:
Backend: Java, Spring Boot, Spring Security, JPA, MySQL
Frontend: React.js
AI Integration: Local Ollama generative AI model for semantic answer evaluation
Key Features:
Teachers can create and manage exams with diverse question types.
MCQs are auto-graded; subjective answers are evaluated using AI for semantic similarity.
Secure authentication and role-based access for teachers and students.
Real-time feedback and detailed evaluation reports for students.

Working Process Explanation : [Working Process.docx](https://github.com/user-attachments/files/20432431/Working.Process.docx)

Working Video : https://drive.google.com/file/d/1-UZ7D8iFSOAPjf7JragX9Eyc-EoSB71v/view?usp=drivesdk


Problem Faced: Ollama AI Evaluation Issues 

Context-1:
In my exam system project, I used a local Ollama generative AI model{gemma:2b} to automatically evaluate students’ long/paragraph and fill-in-the-blank answers by comparing them to the teacher’s answer. The backend would send both answers to Ollama, which was expected to return true (correct) or false (incorrect) based on semantic similarity.
Issue:
I noticed that Ollama was often returning false even when the student’s answer was semantically correct but phrased differently from the teacher’s answer. This led to unfair grading and a poor user experience.
How I Diagnosed the Problem
1.Logging and Debugging:
I added detailed logging to the backend to capture the exact prompts sent to Ollama and the responses received.
This helped me see that the model was being too strict, focusing on exact wording rather than meaning.
2.Prompt Analysis:
I reviewed the prompt being sent to Ollama and realized it was not clearly instructing the model to consider semantic similarity.
How I Fixed the Problem
Prompt Engineering:
I rewrote the prompt to explicitly ask Ollama to judge answers based on meaning, not just wording.
Example:
“Compare the following answers. If the student’s answer means the same as the teacher’s answer, even if the wording is different, return true. Otherwise, return false.”
Testing and Iteration:
I tested the new prompt with various answer pairs to ensure Ollama was now correctly identifying semantically similar answers as correct.
I iterated on the prompt wording until the results were reliable
Outcome
Improved Accuracy:
The AI now evaluates student answers more fairly, focusing on meaning rather than exact wording


Context-2:
In my exam system, when a student submitted answers, the backend would send long/paragraph and fill-in-the-blank answers to the local Ollama AI model{gemma:2b} for evaluation. Sometimes, Ollama took several seconds to respond.
Issue:
Because of this delay, the frontend would time out or show an “evaluation failed” error before the backend received Ollama’s response. This led to a poor user experience, as students thought their submissions had failed even when the evaluation was still processing in the background.
How I Diagnosed the Problem
Error Logging:
I checked the frontend and backend logs and noticed that the frontend was receiving timeout or error responses, even though the backend eventually got a response from Ollama.
Network and Timing Analysis:
I measured the time taken for the backend to get a response from Ollama and compared it to the frontend’s timeout settings.
I realized that the frontend was not waiting long enough for the backend to finish processing.
User Experience Review:
I observed that students would see an error message even though their answers were being evaluated correctly, just with a delay.
How I Fixed the Problem
Increased Frontend Timeout:
I increased the timeout duration for the frontend’s API call to allow more time for Ollama to process and respond.
Loading Indicators:
I added a loading spinner and a message (“Evaluating your answers, please wait...”) on the frontend to inform users that evaluation was in progress.
Backend Response Handling:
I ensured the backend sent a clear status response (success, failure, or still processing) and handled Ollama’s delays gracefully.
I added error handling for cases where Ollama took too long or failed to respond, so the frontend could show a helpful message instead of a generic error..

 Results while testing without UI
 
 ![WhatsApp Image 2025-05-24 at 10 13 07_82c95034](https://github.com/user-attachments/assets/82e4caca-4ae3-4217-b895-a557d51b5f71)

 ![WhatsApp Image 2025-05-24 at 10 34 40_fd0acd0a](https://github.com/user-attachments/assets/f09e10e9-a14c-4a34-91fb-67fd03767b98)


