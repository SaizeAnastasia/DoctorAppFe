import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PasswordChecklist from 'react-password-checklist';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './styles/ResetPassword.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resetToken = queryParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError('Ungültiger oder fehlender Token. Bitte überprüfen Sie Ihre E-Mail für den richtigen Link.');
    }
  }, [location.search]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      setError('Ungültiger oder fehlender Token. Bitte überprüfen Sie Ihre E-Mail für den richtigen Link.');
      return;
    }

    fetch('/api/auth-for-reset/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tokenForResetPassword: token, newPassword: password }) 
    })
      .then(response => {
        if (response.status !== 200) {
          throw new Error('Fehler beim Zurücksetzen des Passworts');
        }
        return response.json();
      })
      .then(data => {
        console.log('Passwort erfolgreich zurückgesetzt:', data);
        alert('Ihr Passwort wurde erfolgreich zurückgesetzt.');
        navigate('/login');
      })
      .catch(error => {
        console.error('Fehler beim Zurücksetzen des Passworts:', error);
        setError('Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
      });
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <div className='reset-password-container'>
      <h1>Passwort zurücksetzen</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Neues Passwort:
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
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
        </label>
        <label>
          Passwort bestätigen:
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Bitte bestätigen Sie Ihr Passwort"
              required
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="toggle-password"
              aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              role="button"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </label>
        <PasswordChecklist
          rules={["minLength", "specialChar", "number", "capital", "match"]}
          minLength={8}
          value={password}
          valueAgain={confirmPassword}
          onChange={setIsPasswordValid}
          messages={{
            minLength: "Das Passwort muss mindestens 8 Zeichen lang sein.",
            specialChar: "Das Passwort muss ein Sonderzeichen enthalten.",
            number: "Das Passwort muss eine Zahl enthalten.",
            capital: "Das Passwort muss einen Großbuchstaben enthalten.",
            match: "Die Passwörter stimmen überein."
          }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={!isPasswordValid}>Bestätigen</button>
        <button type="button" onClick={handleCancel}>Abbrechen</button>
      </form>
    </div>
  );
}

export default ResetPassword;
