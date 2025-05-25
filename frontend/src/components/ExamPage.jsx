import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import '../CSS/ExamPage.css';

// Question type constants matching backend
const QUESTION_TYPES = {
    MCQ: 'MCQ',
    SHORT_ANSWER: 'SHORT_ANSWER',
    LONG_ANSWER: 'LONG_ANSWER'
};

// Helper function to normalize question type
const normalizeQuestionType = (type) => {
    if (!type) return null;
    
    // Convert to uppercase and remove spaces
    const normalizedType = type.toUpperCase().replace(/\s+/g, '_');
    
    // Check against our known types
    switch (normalizedType) {
        case 'MCQ':
        case 'MULTIPLE_CHOICE':
            return QUESTION_TYPES.MCQ;
        case 'SHORT_ANSWER':
        case 'SIMPLE_ANSWER':
            return QUESTION_TYPES.SHORT_ANSWER;
        case 'LONG_ANSWER':
            return QUESTION_TYPES.LONG_ANSWER;
        default:
            return type; // Return original type if no match
    }
};

function ExamPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || user.role !== 'Student') {
            navigate('/login');
            return;
        }
        fetchExam();
    }, [examId, navigate]);

    const fetchExam = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching exam with ID:', examId);
            const response = await axiosInstance.get(`/api/exams/${examId}`);
            console.log('Exam data received:', response.data);
            
            if (!response.data || !response.data.questions || response.data.questions.length === 0) {
                setError('No questions found in this exam.');
                setLoading(false);
                return;
            }
            
            setExam(response.data);
            // Initialize answers object
            const initialAnswers = {};
            response.data.questions.forEach(q => {
                initialAnswers[q.id] = '';
            });
            setAnswers(initialAnswers);
        } catch (error) {
            console.error('Error fetching exam:', error);
            setError(error.response?.data?.message || 'Failed to load exam. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

const handleSubmit = async () => {
    try {
        setIsSubmitting(true);
        setError('');

        // Validate answers
        const unansweredQuestions = exam.questions.filter(q => !answers[q.id]?.trim());
        if (unansweredQuestions.length > 0) {
            setError(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
            setIsSubmitting(false);
            return;
        }

        const submissionData = {
            examId: exam.id,
            answers: exam.questions.map(question => ({
                questionId: question.id,
                answer: answers[question.id].trim()
            }))
        };

        const response = await axiosInstance.post('/api/exams/submit', submissionData);

        if (response.data.status === 'success') {
            // Navigate to evaluation page
            navigate(`/evaluation/${exam.id}`);
        } else {
            throw new Error(response.data.error || 'Submission failed');
        }
    } catch (error) {
        console.error('Error submitting exam:', error);
        setError(error.response?.data?.error || 'Failed to submit exam. Please try again.');
        setIsSubmitting(false);
    }
};

    if (loading) {
        return <div className="loading-container">Loading exam...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    if (!exam) {
        return <div className="error-container">Exam not found</div>;
    }

    return (
        <div className="exam-container">
            <h2 className="exam-title">{exam.title}</h2>
            <div className="questions-list">
                {exam.questions.map((question, index) => {
                    const normalizedType = normalizeQuestionType(question.questionType);
                    return (
                        <div key={question.id} className="question-item">
                            <h3 className="question-number">Question {index + 1}</h3>
                            <p className="question-text">{question.questionText}</p>
                            
                            {normalizedType === QUESTION_TYPES.MCQ ? (
                                <div className="options-container">
                                    {question.options?.map((option, optIndex) => (
                                        <label key={optIndex} className="option-item">
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={option}
                                                checked={answers[question.id] === option}
                                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            ) : normalizedType === QUESTION_TYPES.LONG_ANSWER || question.questionType === 'Long Answer' ? (
                                <textarea
                                    value={answers[question.id] || ''}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    placeholder="Enter your answer here..."
                                    rows={5}
                                    className="long-answer-input"
                                    disabled={isSubmitting}
                                />
                            ) : normalizedType === QUESTION_TYPES.SHORT_ANSWER ? (
                                <input
                                    type="text"
                                    value={answers[question.id] || ''}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    placeholder="Enter your answer..."
                                    className="short-answer-input"
                                    disabled={isSubmitting}
                                />
                            ) : (
                                // Default to long answer input if type is unknown
                                <textarea
                                    value={answers[question.id] || ''}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    placeholder="Enter your answer here..."
                                    rows={5}
                                    className="long-answer-input"
                                    disabled={isSubmitting}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="submit-container">
                {error && <p className="error-message">{error}</p>}
                <button 
                    onClick={handleSubmit}
                    className="submit-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                </button>
            </div>
        </div>
    );
}

export default ExamPage;
