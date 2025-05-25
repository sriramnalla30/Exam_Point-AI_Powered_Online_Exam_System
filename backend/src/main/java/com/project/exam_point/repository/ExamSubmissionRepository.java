package com.project.exam_point.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.project.exam_point.model.ExamSubmission;

@Repository
public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {
    List<ExamSubmission> findByExamId(Long examId);
    @Modifying
    @Transactional
    @Query("DELETE FROM ExamSubmission es WHERE es.question.id = :questionId")
    void deleteByQuestionId(Long questionId);
}
