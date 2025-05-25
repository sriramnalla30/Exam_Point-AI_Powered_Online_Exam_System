import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/TeacherDashboard.css';


function TeacherDashboard() {
    const [exams, setExams] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/exams');
                console.log(response.data);
                setExams(Array.isArray(response.data) ? response.data : []); 
            } catch (error) {
                console.error('Error fetching exams:', error);
            }
        };

        fetchExams();
    }, []);

    const handleDeleteExam = async (examTitle) => {
        if (window.confirm("Are you sure you want to delete this exam?")) {
            try {
                console.log(examTitle);
                await axios.delete(`http://localhost:8080/api/exams/title/${examTitle}`);
                alert("Exam deleted successfully!");
                setExams(exams.filter(exam => exam.title !== examTitle));
            } catch (error) {
                console.error("Error deleting exam:", error);
                alert("Failed to delete exam.");
            }
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <h2 className="dashboard-title">Teacher Dashboard</h2>
                <Link to="/create-exam" className="create-exam-button">
                    Create New Exam
                </Link>
                <table className="dashboard-table">
                    <thead>
                        <tr className="table-header">
                            <th>Exam Name</th>
                            <th>Exam Link</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.map((exam) => (
                            <tr key={exam.id} className="table-row">
                                <td>{exam.title}</td>
                                <td>
                                    <button
                                        className="action-button copy-link"
                                        onClick={() =>
                                            navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.id}`)
                                        }
                                    >
                                        Copy Link
                                    </button>
                                </td>
                                <td className="action-buttons">
                                    <button
                                        className="action-button edit-button"
                                        onClick={() => navigate(`/edit-exam/${exam.id}`)}
                                    >
                                        View/Edit
                                    </button>
                                    <button
                                        className="action-button delete-button"
                                        onClick={() => handleDeleteExam(exam.title)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TeacherDashboard;
