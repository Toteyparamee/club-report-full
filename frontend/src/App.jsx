import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ReportForm from './pages/ReportForm';
import FcmRegister from './pages/FcmRegister';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report/new" element={<ReportForm />} />
        <Route path="/register-notify" element={<FcmRegister />} />
      </Routes>
    </BrowserRouter>
  );
}
