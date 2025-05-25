import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import TeacherDashboard from "./components/TeacherDashboard";
import CreateExamPage from "./components/CreateExamPage";
import StudentDashboard from "./components/StudentDashboard";
import ExamPage from "./components/ExamPage";
import ProgressReportPage from "./components/ProgressReportPage";
import EditExamPage from "./components/EditExamPage";
import AnswerEvaluationPage from "./components/AnswerEvaluationPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/create-exam" element={<CreateExamPage />} />
        <Route path="/create-exam/:title" element={<CreateExamPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/exam/:examId" element={<ExamPage />} />
        <Route path="/edit-exam/:examId" element={<EditExamPage />} />
        <Route path="/progress-report" element={<ProgressReportPage />} />
        <Route path="/evaluation/:examId" element={<AnswerEvaluationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
