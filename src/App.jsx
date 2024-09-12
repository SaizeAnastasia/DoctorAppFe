import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Signup from './components/Signup';
import Login from './components/Login';
import Booking from './components/Booking';
import Confirmation from './components/Confirmation';
import AdminSchedule from './components/AdminSchedule';
import Datenschutz from './components/Datenschutz';
import Impressum from './components/Impressum';
import Kontakt from './components/Kontakt';
import User from './components/User';
import DoctorInfo from './components/DoctorInfo';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './main.css';


// import './App.css';  // Добавлено: импорт стилей

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/doctorInfo/:doctorId" element={<DoctorInfo />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/adminSchedule" element={<AdminSchedule />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/kontakt" element={<Kontakt />} />
        <Route path="/user" element={<User />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
