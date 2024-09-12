import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/LoginModal.css';
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

function LoginModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

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
          throw new Error('Login fehlgeschlagen. Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort.');
        }
        return response.json();
      })
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);

          const userDetails = parseJwt(data.token);

          fetch('/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          })
          .then(response => response.json())
          .then(userData => {
            localStorage.setItem('userDetails', JSON.stringify({
              id: userData.id,
              name: userData.surName || userData.firstname || '',
              email: userData.email
            }));

            navigate('/confirmation');
            onClose(); // Закрыть модальное окно после успешного входа
          })
          .catch(err => {
            console.error('Error fetching user data:', err);
            setError('Fehler beim Abrufen der Benutzerdaten. Bitte versuchen Sie es später noch einmal.');
          });
        } else {
          setError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort.');
        }
      })
      .catch(error => {
        console.error('Fehler beim Login:', error);
        setError('Während des Logins ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal.');
      });
  };

  const handleForgotPasswordClick = () => {
    onClose();
    navigate('/forgot-password');
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" role="dialog" aria-labelledby="login-title">
        <button className="close-button" onClick={onClose} aria-label="Close modal">×</button>
        <h1 id="login-title">Login</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Bitte geben Sie Ihre Email-Adresse ein"
              aria-required="true"
            />
            {fieldErrors.email && <p className="error" aria-live="assertive">{fieldErrors.email}</p>}
          </label>
          <label>
            Passwort:
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Bitte geben Sie Ihr Passwort ein"
                aria-required="true"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
                role="button"
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {fieldErrors.password && <p className="error" aria-live="assertive">{fieldErrors.password}</p>}
          </label>
          {error && <p className="error" aria-live="assertive">{error}</p>}
          <button type="submit" className="login-button">Login</button>
          <a href="#" onClick={handleForgotPasswordClick} className="forgot-password-link">Passwort vergessen?</a>
        </form>
        <div className="signup-link">
          <p>Noch nicht registriert? <a href="#" onClick={handleSignupClick}>Jetzt registrieren</a></p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
