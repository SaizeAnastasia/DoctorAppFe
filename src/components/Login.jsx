import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT:', e);
    return null;
  }
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Валидация полей 
    const errors = {};
    if (!email) errors.email = "Das Feld 'Email' ist erforderlich";
    if (!password) errors.password = "Das Feld 'Passwort' ist erforderlich";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Login failed. Please check your email and password.');
        }
        return response.json();
      })
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);

          // Извлекаем данные пользователя из JWT
          const userDetails = parseJwt(data.token);

          // Сохраняем данные пользователя в localStorage
          if (userDetails) {
            localStorage.setItem('userDetails', JSON.stringify({
              id: userDetails.userId, // Идентификатор пользователя
              name: userDetails.userName, // Имя пользователя
              email: email, // Email из введенных данных
              role: userDetails.role // Роль пользователя
            }));
          }

          // Перенаправление на соответствующую страницу в зависимости от роли
          if (userDetails.role === 'ADMIN') {
            navigate('/adminSchedule');
          } else if (userDetails.role === 'PATIENT') {
            navigate('/user');
          } else {
            setError('Unauthorized role');
          }
        } else {
          setError('Login failed. Please check your email and password.');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        setError('An error occurred during login. Please try again later.');
      });
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password');
  };

  const handleSignupClick = () => {
    navigate('/signup'); // Перенаправление на страницу регистрации
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Bitte geben Sie Ihre Email-Adresse ein"
            required
          />
          {fieldErrors.email && <p className="error">{fieldErrors.email}</p>}
        </label>
        <label>
          Passwort:
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Bitte geben Sie Ihr Passwort ein"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              role="button"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {fieldErrors.password && <p className="error">{fieldErrors.password}</p>}
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="login-button">Login</button>
        <a href="#" onClick={handleForgotPasswordClick} className="forgot-password-link">Passwort vergessen?</a>
        <button type="button" onClick={() => navigate('/booking')} className="login-button">Zurück zur Terminbuchung</button>
      </form>
      <div className="signup-link">
        <p>Noch nicht registriert? <a href="#" onClick={handleSignupClick}>Jetzt registrieren</a></p>
      </div>
    </div>
  );
}

export default Login;
