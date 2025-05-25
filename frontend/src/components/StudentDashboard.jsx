import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../CSS/StudentDashboard.css';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

function StudentDashboard() {
    const navigate = useNavigate();
    const [examLink, setExamLink] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Check authentication on component mount
    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || user.role !== 'Student') {
            navigate('/login');
        }
    }, [navigate]);

    const extractExamId = (link) => {
        // Handle both full URLs and just IDs
        if (!link) return null;
        
        // Try to extract ID from URL
        const match = link.match(/\/exam\/(\d+)/);
        if (match) return match[1];
        
        // Check if the input is just a number
        if (/^\d+$/.test(link.trim())) {
            return link.trim();
        }
        
        return null;
    };

    const handleStartExam = async () => {
        setIsLoading(true);
        setError('');
        try {
            const examId = extractExamId(examLink);
            if (!examId) {
                setError('Invalid exam link or ID. Please enter a valid exam link or ID.');
                setIsLoading(false);
                return;
            }

            // Verify the exam exists
            const { data } = await api.get(`/api/exams/${examId}`);
            if (!data || !data.questions || data.questions.length === 0) {
                setError('No questions found for this exam.');
                setIsLoading(false);
                return;
            }

            // Navigate to the exam page
            navigate(`/exam/${examId}`);
        } catch (err) {
            console.error('Error details:', err);
            if (err.code === 'ECONNABORTED') {
                setError('Request timed out. Please try again.');
            } else if (err.response) {
                setError(err.response.data.message || 'Failed to fetch exam. Server error.');
            } else if (err.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError('Failed to fetch exam. Please try again.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Student Dashboard</h2>
            <div className="link-section">
                <label htmlFor="exam-link" className="link-label">Enter Exam Link:</label>
                <input
                    id="exam-link"
                    className="link-input"
                    type="text"
                    placeholder="Paste exam link here"
                    value={examLink}
                    onChange={(e) => setExamLink(e.target.value)}
                    disabled={isLoading}
                />
                <button 
                    className="btn-start-exam" 
                    onClick={handleStartExam}
                    disabled={isLoading || !examLink.trim()}
                >
                    {isLoading ? 'Validating...' : 'Start Exam'}
                </button>
            </div>
            {error && <p className="message-error">{error}</p>}
        </div>
    );
}

export default StudentDashboard; 