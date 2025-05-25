import React from 'react';
import { Link } from 'react-router-dom';

function ProgressReportPage() {
    return (
        <div>
            <h2>Progress Report</h2>
            <div>
                <h3>Exam Score: 80%</h3>
                <ul>
                    <li>Question 1 - Correct</li>
                    <li>Question 2 - Incorrect</li>
                    {/* Replace with dynamic results */}
                </ul>
            </div>
            <button>
                <Link to="/student-dashboard">Return to Dashboard</Link>
            </button>
        </div>
    );
}

export default ProgressReportPage;
