import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../CSS/CreateExamPage.module.css';

// Question type constants to match backend
const QUESTION_TYPES = {
    SIMPLE_ANSWER: 'SIMPLE_ANSWER',
    LONG_ANSWER: 'LONG_ANSWER',
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE'
};

function CreateExamPage() {
    const { title } = useParams();
    const navigate = useNavigate();
    const [examTitle, setExamTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState(QUESTION_TYPES.SIMPLE_ANSWER);
    const [options, setOptions] = useState(['', '', '', '']);
    const [answer, setAnswer] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (title) {
            fetchExamData(title);
        }
    }, [title]);

    const fetchExamData = async (examTitle) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/exams/title/${examTitle}`);
            const exam = response.data;
            setExamTitle(exam.title);
            setQuestions(exam.questions);
        } catch (error) {
            console.error('Error fetching exam data:', error);
            setError('Failed to fetch exam data');
        }
    };

    const validateQuestion = () => {
        if (!questionText.trim()) {
            setError('Question text is required');
            return false;
        }
        if (!answer.trim()) {
            setError('Answer is required');
            return false;
        }
        if (questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
            const validOptions = options.filter(opt => opt.trim());
            if (validOptions.length < 2) {
                setError('Multiple choice questions require at least 2 options');
                return false;
            }
            if (!options.includes(answer)) {
                setError('Answer must match one of the options');
                return false;
            }
        }
        if (questionType === QUESTION_TYPES.LONG_ANSWER && answer.length < 10) {
            setError('Long answer template must be at least 10 characters');
            return false;
        }
        return true;
    };

    const handleAddOrUpdateQuestion = () => {
        setError('');
        if (!validateQuestion()) {
            return;
        }

        const newQuestion = {
            questionText,
            questionType,
            options: questionType === QUESTION_TYPES.MULTIPLE_CHOICE ? options.filter(opt => opt.trim()) : [],
            answer,
        };

        if (editIndex !== null) {
            const updatedQuestions = [...questions];
            updatedQuestions[editIndex] = newQuestion;
            setQuestions(updatedQuestions);
            setEditIndex(null);
        } else {
            setQuestions([...questions, newQuestion]);
        }

        resetQuestionForm();
    };

    const handleEditQuestion = (index) => {
        setError('');
        const question = questions[index];
        setQuestionText(question.questionText);
        setQuestionType(question.questionType);
        setOptions(question.options?.length ? question.options : ['', '', '', '']);
        setAnswer(question.answer);
        setEditIndex(index);
    };

    const handleDeleteQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const handleSubmitExam = async () => {
        if (!examTitle.trim()) {
            setError('Exam title is required');
            return;
        }
        if (questions.length === 0) {
            setError('At least one question is required');
            return;
        }

        const examData = {
            title: examTitle,
            questions: questions,
        };

        try {
            if (title) {
                await axios.put(`http://localhost:8080/api/exams/title/${title}`, examData);
                alert('Exam updated successfully!');
            } else {
                const response = await axios.post('http://localhost:8080/api/exams', examData);
                const { url_link } = response.data;
                alert(`Exam saved successfully! Access it at: ${url_link}`);
            }
            navigate('/teacher-dashboard');
        } catch (error) {
            console.error('Error saving exam:', error);
            setError('Failed to save exam: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const resetQuestionForm = () => {
        setQuestionText('');
        setQuestionType(QUESTION_TYPES.SIMPLE_ANSWER);
        setOptions(['', '', '', '']);
        setAnswer('');
        setError('');
    };

    return (
        <div className={styles.examPageWrapper}>
            
            <header className={styles.appHeader}>
                <div className={styles.logoText}>Exam_Point</div>
            </header>
            <div className={styles.createExamContainer}>
                <h2>{title ? 'Edit Exam' : 'Create Exam'}</h2>

                {error && <div className="error-message">{error}</div>}

                <div className={styles.formGroup}>
                    <label>Exam Title:</label>
                    <input
                        type="text"
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                        placeholder="Exam Title"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Question Type:</label>
                    <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                    >
                        <option value={QUESTION_TYPES.SIMPLE_ANSWER}>Simple Answer</option>
                        <option value={QUESTION_TYPES.MULTIPLE_CHOICE}>Multiple Choice</option>
                        <option value={QUESTION_TYPES.LONG_ANSWER}>Long Answer</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Question:</label>
                    <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Enter the question"
                    />
                </div>

                {questionType === QUESTION_TYPES.MULTIPLE_CHOICE && (
                    <div className={styles.formGroup}>
                        <h4>Options:</h4>
                        {options.map((option, index) => (
                            <input
                                key={index}
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label>Answer:</label>
                    {questionType === QUESTION_TYPES.LONG_ANSWER ? (
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter the model answer"
                        />
                    ) : (
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={questionType === QUESTION_TYPES.MULTIPLE_CHOICE ? 
                                "Enter the correct option" : "Enter the answer"}
                        />
                    )}
                </div>

                <button 
                    onClick={handleAddOrUpdateQuestion}
                    className={styles.primaryButton}
                >
                    {editIndex !== null ? 'Update Question' : 'Add Question'}
                </button>

                <div className={styles.questionsList}>
                    <h3>Questions List</h3>
                    {questions.length === 0 ? (
                        <p>No questions added yet</p>
                    ) : (
                        <ul>
                            {questions.map((q, index) => (
                                <li key={index} className={styles.questionItem}>
                                    <strong>Question {index + 1}:</strong> {q.questionText} <br />
                                    <strong>Type:</strong> {q.questionType} <br />
                                    {q.questionType === QUESTION_TYPES.MULTIPLE_CHOICE && (
                                        <div className="options-list">
                                            <strong>Options:</strong>
                                            <ul>
                                                {q.options.map((option, optIndex) => (
                                                    <li key={optIndex}>{option}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <strong>Answer:</strong> {q.answer} <br />
                                    <div className={styles.questionActions}>
                                        <button onClick={() => handleEditQuestion(index)}>Edit</button>
                                        <button onClick={() => handleDeleteQuestion(index)}>Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button 
                    onClick={handleSubmitExam}
                    className={styles.submitButton}
                    disabled={questions.length === 0}
                >
                    {title ? 'Update Exam' : 'Save & Generate Link'}
                </button>
            </div>
        </div>
    );
}

export default CreateExamPage;
