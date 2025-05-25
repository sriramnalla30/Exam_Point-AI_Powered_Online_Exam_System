package com.project.exam_point.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.exam_point.dto.ExamSubmissionRequest;
import com.project.exam_point.model.Exam;
import com.project.exam_point.model.Question;
import com.project.exam_point.model.ExamSubmission; // Importing ExamSubmission model
import com.project.exam_point.service.ExamService;
import com.project.exam_point.service.ExamSubmissionService; // Importing ExamSubmissionService

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "http://localhost:3000")
public class ExamController {
    private final ExamService examService;
    private final ExamSubmissionService examSubmissionService; // Dependency injection for ExamSubmissionService
    
    public ExamController(ExamService examService, ExamSubmissionService examSubmissionService) {
        this.examService = examService;
        this.examSubmissionService = examSubmissionService;
    }

    @PostMapping
    public ResponseEntity<?> createExam(@RequestBody Exam exam) {
        // Set the generated link before saving
        String generatedLink = "http://localhost:3000/exam/" + (exam.getId() != null ? exam.getId() : "new");
        exam.setGeneratedLink(generatedLink);
        
        Exam savedExam = examService.saveExam(exam);
        
        // Update the link with the actual ID after saving
        generatedLink = "http://localhost:3000/exam/" + savedExam.getId();
        savedExam.setGeneratedLink(generatedLink);
        savedExam = examService.saveExam(savedExam);
        
        return ResponseEntity.ok(Map.of(
            "examId", savedExam.getId(), 
            "url_link", generatedLink,
            "exam", savedExam
        ));
    }

    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        List<Exam> exams = examService.getAllExams();
        return ResponseEntity.ok(exams);
    }

    @DeleteMapping("/title/{title}")
    public ResponseEntity<?> deleteExamByTitle(@PathVariable String title) {
        examService.deleteExamByTitle(title);
        return ResponseEntity.ok(Map.of("message", "Exam deleted successfully"));
    }

    @DeleteMapping("/deleteQuestion/{examId}/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long examId, @PathVariable Long questionId) {
        try {
            Exam updatedExam = examService.deleteQuestionFromExam(examId, questionId);
            return ResponseEntity.ok(updatedExam); // Return updated exam
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error deleting question"));
        }
    }

    @PutMapping("/title/{title}")
    public ResponseEntity<?> updateExamByTitle(@PathVariable String title, @RequestBody Exam exam) {
        Exam updatedExam = examService.updateExamByTitle(title, exam);
        return ResponseEntity.ok(Map.of("examTitle", updatedExam.getTitle(), "message", "Exam updated successfully"));
    }

    @PutMapping("/updateExam/{examId}")
    public ResponseEntity<Exam> updateExam(@PathVariable Long examId, @RequestBody Exam exam) {
        try {
            Exam updatedExam = examService.updateExam(examId, exam);
            return ResponseEntity.ok(updatedExam);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/title/{title}")
    public ResponseEntity<Exam> getExamByTitle(@PathVariable String title) {
        Exam exam = examService.getExamByTitle(title)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        return ResponseEntity.ok(exam);
    }

    @GetMapping("/editExam/{examId}")
    public ResponseEntity<Exam> editExam(@PathVariable Long examId) {
        Exam exam = examService.findById(examId);
        if (exam == null) {
            return ResponseEntity.notFound().build(); // 404 if not found
        }
        return ResponseEntity.ok(exam); // Return the exam as JSON
    }

    @PutMapping("/addQuestion/{examId}")
    public ResponseEntity<?> addQuestion(@PathVariable Long examId, @RequestBody Question question) {
        try {
            Exam updatedExam = examService.addQuestionToExam(examId, question);
            return ResponseEntity.ok(updatedExam);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error adding question"));
        }
    }

    @PutMapping("/updateQuestion/{examId}/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long examId, @PathVariable Long questionId, @RequestBody Question question) {
        try {
            Exam updatedExam = examService.updateQuestionInExam(examId, questionId, question);
            return ResponseEntity.ok(updatedExam);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error updating question"));
        }
    }

    @GetMapping("/{examId}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long examId) {
        Exam exam = examService.findById(examId);
        if (exam == null) {
            return ResponseEntity.notFound().build(); // Return 404 if not found
        }
        return ResponseEntity.ok(exam); // Return the exam details as JSON
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitExamAnswers(@RequestBody ExamSubmissionRequest request) {
        try {
            System.out.println("Received exam submission for exam ID: " + request.getExamId());
            
            // Create and save submissions
        List<ExamSubmission> examSubmissions = examService.convertToExamSubmissions(request);
        examSubmissionService.saveExamSubmissions(examSubmissions);
            
            // Wait for submissions to be processed
            examService.processAnswers(request);
            
            // Return success with exam ID for redirection
            return ResponseEntity.ok(Map.of(
                "message", "Exam submitted successfully",
                "examId", request.getExamId()
            ));
        } catch (Exception e) {
            System.err.println("Error processing exam submission: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to process exam submission: " + e.getMessage()));
        }
    }

}
