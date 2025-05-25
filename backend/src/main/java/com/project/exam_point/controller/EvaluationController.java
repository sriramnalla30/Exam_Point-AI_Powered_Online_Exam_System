package com.project.exam_point.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.exam_point.model.Exam;
import com.project.exam_point.model.ExamSubmission;
import com.project.exam_point.model.Question;
import com.project.exam_point.service.AnswerEvaluationService;
import com.project.exam_point.service.ExamService;
import com.project.exam_point.service.ExamSubmissionService;

@RestController
@RequestMapping("/api/evaluation")
@CrossOrigin(origins = "http://localhost:3000")
public class EvaluationController {

    private final AnswerEvaluationService answerEvaluationService;
    private final ExamService examService;
    private final ExamSubmissionService examSubmissionService;


    public EvaluationController(AnswerEvaluationService answerEvaluationService, 
            ExamService examService, 
            ExamSubmissionService examSubmissionService) {
this.answerEvaluationService = answerEvaluationService;
this.examService = examService;
this.examSubmissionService = examSubmissionService;
}

   
    @GetMapping("/{examId}")
    public ResponseEntity<Map<String, Object>> getEvaluationDetails(@PathVariable Long examId) {
        try {
            System.out.println("\n========== EVALUATION CONTROLLER START ==========");
            System.out.println("Evaluating exam ID: " + examId);
            
            // Fetch the exam details
            Exam exam = examService.findById(examId);
            if (exam == null) {
                System.out.println("ERROR: Exam not found for ID: " + examId);
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Exam not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            System.out.println("Found exam: " + exam.getTitle());

            // Fetch submissions for the given exam
            List<ExamSubmission> examSubmissions = examSubmissionService.findSubmissionsByExamId(examId);
            if (examSubmissions == null || examSubmissions.isEmpty()) {
                System.out.println("ERROR: No submissions found for exam ID: " + examId);
                Map<String, Object> error = new HashMap<>();
                error.put("error", "No submissions found for this exam");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            System.out.println("Found " + examSubmissions.size() + " submissions");

            // Calculate total and correct answers
            int totalQuestions = examSubmissions.size();
            int correctAnswers = 0;

            // Process evaluation details
            List<Map<String, Object>> details = new ArrayList<>();
            
            for (ExamSubmission submission : examSubmissions) {
                Question question = submission.getQuestion();
                String teacherAnswer = question.getAnswer() != null ? question.getAnswer().trim() : "";
                String studentAnswer = submission.getAnswer() != null ? submission.getAnswer().trim() : "";
                
                System.out.println("\n----- Processing Question -----");
                System.out.println("Question: " + question.getQuestionText());
                System.out.println("Question Type: " + question.getQuestionType());
                System.out.println("Teacher Answer: " + teacherAnswer);
                System.out.println("Student Answer: " + studentAnswer);
                
                boolean isCorrect;

                // Call the AI service to evaluate the answer
                if ("LONG_ANSWER".equals(question.getQuestionType()) || 
                    "Long Answer".equals(question.getQuestionType())) {
                    System.out.println("Evaluating as LONG_ANSWER using Ollama");
                    isCorrect = answerEvaluationService.validateLongAnswer(teacherAnswer, studentAnswer);
                } else {
                    System.out.println("Evaluating as SIMPLE_ANSWER with direct comparison");
                    isCorrect = answerEvaluationService.validateSimpleAnswer(teacherAnswer, studentAnswer);
                }

                System.out.println("Evaluation result: " + isCorrect);

                if (isCorrect) {
                    correctAnswers++;
                }

                Map<String, Object> detail = new HashMap<>();
                detail.put("question", question.getQuestionText());
                detail.put("studentAnswer", studentAnswer);
                detail.put("teacherAnswer", teacherAnswer);
                detail.put("isCorrect", isCorrect);
                detail.put("questionType", question.getQuestionType());
                
                details.add(detail);
            }

            // Calculate score as percentage
            double score = (double) correctAnswers / totalQuestions * 100;
            System.out.println("\n----- Final Results -----");
            System.out.println("Total Questions: " + totalQuestions);
            System.out.println("Correct Answers: " + correctAnswers);
            System.out.println("Score: " + score + "%");

            // Return complete evaluation data
            Map<String, Object> response = new HashMap<>();
            response.put("examTitle", exam.getTitle());
            response.put("totalScore", correctAnswers);  // Raw score instead of percentage
            response.put("maxScore", totalQuestions);

            List<Map<String, Object>> questions = new ArrayList<>();
            for (Map<String, Object> detail : details) {
                Map<String, Object> questionData = new HashMap<>();
                questionData.put("questionText", detail.get("question"));
                questionData.put("studentAnswer", detail.get("studentAnswer"));
                questionData.put("correctAnswer", detail.get("teacherAnswer"));
                questionData.put("score", (Boolean)detail.get("isCorrect") ? 1 : 0);  // 1 point per correct answer
                questionData.put("maxScore", 1);  // Each question is worth 1 point
                questionData.put("feedback", (Boolean)detail.get("isCorrect") ? 
                    "Your answer is correct!" : 
                    "Your answer needs improvement. Please review the correct answer.");
                questions.add(questionData);
            }
            response.put("questions", questions);

            System.out.println("========== EVALUATION CONTROLLER END ==========\n");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("ERROR in evaluation controller: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error fetching evaluation details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

}
