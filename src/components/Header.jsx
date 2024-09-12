import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Header.css'

function Header() {
  return (
    <header>
      <div>
        <img src="/logo_praxis.jpg" alt="Logo Praxis" />
      </div>
      <nav>
        {/* <Link to="/signup">Registrierung</Link> */}
        <Link to="/login">Login</Link>
        <Link to="/booking">Termin buchen</Link>
        <Link to="/adminSchedule">Admin</Link>
        {/* <Link to="/confirmation">Confirmation</Link>
        <Link to="/doctorInfo">DoctorInfo</Link>
        <Link to="/user">User</Link>
        <Link to="loginModal">Login Modal</Link>
        <Link to="forgotPassword">Forgot Password</Link>
        <Link to="resetPassword">Reset Password</Link> */}

      </nav>
    </header>
  );
}

export default Header;
