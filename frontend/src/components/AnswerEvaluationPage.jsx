import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import '../CSS/AnswerEvaluationPage.css';

function AnswerEvaluationPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
            navigate('/login');
            return;
        }
        fetchEvaluation();
    }, [examId, navigate]);

// AnswerEvaluationPage.jsx
const fetchEvaluation = async () => {
    const maxRetries = 3;
    let currentTry = 0;

    while (currentTry < maxRetries) {
        try {
            setLoading(true);
            setError(''); // Clear any previous errors
            
            console.log(`Attempting to fetch evaluation (attempt ${currentTry + 1})`);
            const response = await axiosInstance.get(`/api/evaluation/${examId}`);
            
            if (!response.data) {
                throw new Error('No evaluation data received');
            }
            
            setEvaluation(response.data);
            setLoading(false);
            return; // Success, exit function
            
        } catch (err) {
            currentTry++;
            console.error(`Error fetching evaluation (attempt ${currentTry}):`, err);
            
            // If this was the last attempt, show error to user
            if (currentTry === maxRetries) {
                setLoading(false);
                if (err.code === 'ECONNABORTED') {
                    setError('The evaluation is taking longer than expected. Please refresh the page to try again.');
                } else if (err.response?.status === 404) {
                    setError('Evaluation not found. Please wait a moment and refresh the page.');
                } else if (err.response?.status === 500) {
                    setError('Server error while loading evaluation. Please try again later.');
                } else {
                    setError('Failed to load evaluation results. Please refresh the page to try again.');
                }
            } else {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }
};

    const getScoreColor = (score, maxScore) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'excellent-score';
        if (percentage >= 60) return 'good-score';
        if (percentage >= 40) return 'average-score';
        return 'needs-improvement-score';
    };

    const renderQuestionCard = (question, index) => (
        <div key={index} className="question-evaluation-card">
            <div className="question-header">
                <h3>Question {index + 1}</h3>
                <span className={getScoreColor(question.score, question.maxScore)}>
                    {question.score}/{question.maxScore} points
                </span>
            </div>

            <div className="question-content">
                <p className="question-text">{question.questionText}</p>
                
                <div className="answer-section">
                    <div className="student-answer">
                        <h4>Your Answer:</h4>
                        <p>{question.studentAnswer}</p>
                    </div>

                    <div className="correct-answer">
                        <h4>Correct Answer:</h4>
                        <p>{question.correctAnswer}</p>
                    </div>
                </div>

                <div className="feedback-section">
                    <h4>Feedback:</h4>
                    <p>{question.feedback}</p>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="evaluation-loading">
                <div className="loading-spinner"></div>
                <p>Loading your results...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="evaluation-error">
                <h3>⚠️ Error</h3>
                <p>{error}</p>
                <button onClick={() => navigate('/student-dashboard')}>
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div className="evaluation-not-found">
                <h3>Results Not Found</h3>
                <p>The evaluation results for this exam could not be found.</p>
                <button onClick={() => navigate('/student-dashboard')}>
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="evaluation-container">
            <header className="evaluation-header">
                <h2>{evaluation.examTitle}</h2>
                <div className="overall-score">
                    <span className={getScoreColor(evaluation.totalScore, evaluation.maxScore)}>
                        Score: {evaluation.totalScore}/{evaluation.maxScore} 
                        ({evaluation.percentage.toFixed(1)}%)
                    </span>
                </div>
            </header>

            <div className="questions-evaluation">
                {evaluation.questions.map((question, index) => 
                    renderQuestionCard(question, index)
                )}
            </div>

            <div className="evaluation-actions">
                <button 
                    className="primary-button"
                    onClick={() => navigate('/student-dashboard')}
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}

export default AnswerEvaluationPage;
