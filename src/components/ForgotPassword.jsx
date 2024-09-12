import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/ForgotPassword.css'

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch('/api/auth-for-reset/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
      .then(async response => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        // Проверка типа контента ответа
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        } else {
          return response.text();  // Обработка текстового ответа
        }
      })
      .then(data => {
        console.log('Antwort vom Server für Passwortzurücksetzung:', data);
        setSuccess(true);

      })
      .catch(error => {
        console.error('Fehler beim Senden der Anfrage zum Zurücksetzen des Passworts:', error);
        setError('Fehler beim Senden der Anfrage zum Zurücksetzen des Passworts. Bitte versuchen Sie es später erneut.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleBack = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <h1>Passwort vergessen</h1>
          <p>Eine E-Mail mit Anweisungen zum Zurücksetzen des Passworts wurde an {email} gesendet.</p>
          <p>Sie werden in wenigen Sekunden auf die Seite zum Zurücksetzen des Passworts weitergeleitet.</p>
          <button onClick={handleBack}>Zurück zum Login</button>
        </div>
      </div>
    );
  }
// убрал лишний контейнер
  return (
    <div className="forgot-password-container">
      <h1>Passwort vergessen</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Geben Sie Ihre E-Mail-Adresse ein:
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="E-Mail"
            required
          />
        </label>
        {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Senden...' : 'Bestätigen'}
        </button>
        <button type="button" onClick={handleBack}>Zurück</button>
      </form>
    </div>
  );
  
}

export default ForgotPassword;
