import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../CSS/EditExamPage.module.css';

function EditExamPage() {
    const { examId } = useParams();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newQuestionType, setNewQuestionType] = useState(''); // Track the new question type
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/exams/editExam/${examId}`);
                setExam(response.data);
            } catch (error) {
                setError('Failed to fetch exam data.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchExamData();
    }, [examId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`http://localhost:8080/api/exams/updateExam/${examId}`, exam)
            .then(response => {
                navigate(`/teacher-dashboard`);
            })
            .catch(error => {
                setError('Error updating exam.');
                console.error(error);
                console.log(JSON.stringify(exam, null, 2));
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExam((prevExam) => ({
            ...prevExam,
            [name]: value,
        }));
    };

    const handleQuestionChange = (index, e) => {
        const { name, value } = e.target;
        const updatedQuestions = [...exam.questions];
        updatedQuestions[index] = {
            ...updatedQuestions[index],
            [name]: value, // name is now questionText or answer
        };
        setExam((prevExam) => ({
            ...prevExam,
            questions: updatedQuestions,
        }));
    };

    const handleOptionChange = (index, optionIndex, e) => {
        const updatedQuestions = [...exam.questions];
        updatedQuestions[index].options[optionIndex] = e.target.value;
        setExam((prevExam) => ({
            ...prevExam,
            questions: updatedQuestions,
        }));
    };

    const handleAddQuestion = () => {
        if (!newQuestionType) {
            alert('Please select a question type');
            return;
        }
        const newQuestion = {
            questionText: "",
            questionType: newQuestionType,
            options: newQuestionType === 'Multiple Choice' ? ["", "", "", ""] : [], // For MCQs, initialize options
            answer: ""
        };
        setExam((prevExam) => ({
            ...prevExam,
            questions: [...prevExam.questions, newQuestion],
        }));
        setNewQuestionType(''); // Reset question type after adding
    };

    const handleQuestionSave = (index) => {
        const questionToUpdate = exam.questions[index];
        axios.put(`http://localhost:8080/api/exams/updateQuestion/${exam.id}/${questionToUpdate.id}`, questionToUpdate)
            .then(response => {
                console.log('Question updated successfully', response);
            })
            .catch(error => {
                console.error('Error updating question', error);
            });
    };

    const handleDeleteQuestion = (index) => {
        const questionToDelete = exam.questions[index];
        axios.delete(`http://localhost:8080/api/exams/deleteQuestion/${exam.id}/${questionToDelete.id}`)
            .then(response => {
                console.log('Question deleted successfully', response);
                const updatedQuestions = exam.questions.filter((_, i) => i !== index); // Remove the question from the local state
                setExam(prevExam => ({
                    ...prevExam,
                    questions: updatedQuestions,
                }));
            })
            .catch(error => {
                console.error('Error deleting question', error);
            });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!exam) return <div>Exam data not found.</div>;

    return (
        <div className={styles.editExamWrapper}>
            <header className={styles.editExamHeader}>
                <h2 className={styles.editExamTitle}>Edit Exam: {exam.title}</h2>
            </header>
            <div className={styles.editExamContainer}>
                <form className={styles.editExamForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Exam Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={exam.title}
                            onChange={handleInputChange}
                        />
                    </div>
                    {/* <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={exam.description || ''}
                            onChange={handleInputChange}
                        />
                    </div> */}

                    <h3>Questions</h3>
                    {exam.questions && exam.questions.map((question, index) => (
                        <div key={index} className={styles.questionBlock}>
                            <h4>Question {index + 1}</h4>
                            <div className={styles.formGroup}>
                                <label htmlFor={`question-text-${index}`}>Question Text</label>
                                <input
                                    type="text"
                                    id={`question-text-${index}`}
                                    name="questionText"
                                    value={question.questionText}
                                    onChange={(e) => handleQuestionChange(index, e)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor={`answer-${index}`}>Answer</label>
                                <input
                                    type="text"
                                    id={`answer-${index}`}
                                    name="answer"
                                    value={question.answer}
                                    onChange={(e) => handleQuestionChange(index, e)}
                                />
                            </div>
                            {question.options && question.options.length > 0 && question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className={styles.formGroup}>
                                    <label htmlFor={`option-${index}-${optionIndex}`}>Option {optionIndex + 1}</label>
                                    <input
                                        type="text"
                                        id={`option-${index}-${optionIndex}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, optionIndex, e)}
                                    />
                                </div>
                            ))}
                            <div>
                                <button type="button" className={styles.editExamButton} onClick={() => handleQuestionSave(index)}>Update Question</button>
                                <button type="button" className={styles.editExamButtonSecondary} onClick={() => handleDeleteQuestion(index)}>Delete Question</button>
                            </div>
                        </div>
                    ))}
                    {/* Question Type Selection for New Question */}
                    <div className={styles.formGroup}>
                        <label>Select Question Type:</label>
                        <select
                            value={newQuestionType}
                            onChange={(e) => setNewQuestionType(e.target.value)}
                        >
                            <option value="">Select Type</option>
                            <option value="Multiple Choice">Multiple Choice</option>
                            <option value="Fill in the Blank">Fill in the Blank</option>
                            <option value="Long Answer">Long Answer</option>
                        </select>
                    </div>
                    <button type="button" className={styles.editExamButton} onClick={handleAddQuestion}>Add New Question</button>
                    <button type="submit" className={styles.editExamButton}>Save Changes</button>
                </form>
            </div>
        </div>
    );
}

export default EditExamPage;
