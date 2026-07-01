import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDetail from './pages/TeacherDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="navbar">
        <span className="navbar-brand">Admin — ระบบรายงานการสอนชุมนุม</span>
      </div>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/teacher/:id" element={<TeacherDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
