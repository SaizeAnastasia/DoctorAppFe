import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordChecklist from 'react-password-checklist';
import './styles/Signup.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const countryCodes = [
  { name: "Germany", code: "+49" },
  { name: "United States", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  // Добавьте другие коды стран
];

function Signup() {
  const [formData, setFormData] = useState({
    salutation: '',
    firstname: '',
    surName: '',
    birthDate: '',
    phoneNumber: '',
    countryCode: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber' && value.length > 13) {
      setPhoneError('Maximale Anzahl von Zeichen überschritten. Maximale Anzahl von Zeichen ist 13.');
      return;
    } else {
      setPhoneError('');
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (phoneError) {
      return;
    }

    fetch('/api/users-authentication/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(async response => {
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }
      return response.text();
    })
    .then(data => {
      alert('Registrierung erfolgreich! Sie können sich jetzt einloggen.');
      navigate('/login');
    })
    .catch(error => {
      setError('Fehler bei der Registrierung: ' + error.message);
      console.error('Error creating user:', error);
    });
  };

  const maxDate = new Date().toISOString().split('T')[0];
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 150);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <div className="container">
      <h1>Registrierung</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Anrede:
          <select name="salutation" value={formData.salutation} onChange={handleChange}>
            <option value="">--Bitte wählen--</option>
            <option value="Frau">Frau</option>
            <option value="Herr">Herr</option>
          </select>
        </label>
        <label>
          Vorname:
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="Bitte geben Sie Ihren Vornamen ein"
            required
          />
        </label>
        <label>
          Nachname:
          <input
            type="text"
            name="surName"
            value={formData.surName}
            onChange={handleChange}
            placeholder="Bitte geben Sie Ihren Nachnamen ein"
            required
          />
        </label>
        <label>
          Geburtsdatum:
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            min={minDateString}
            max={maxDate}
            placeholder="Bitte geben Sie Ihr Geburtsdatum ein"
            required
          />
        </label>
        <label>
          Telefonnummer:
          <div className="phone-container">
            <div className="country-code">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                required
              >
                <option value="">-Code-</option>
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} ({country.name})
                  </option>
                ))}
              </select>
            </div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Bitte geben Sie Ihre Telefonnummer ein"
              maxLength="13"
              className="phone-input"
              required
            />
          </div>
          {phoneError && <p className="error">{phoneError}</p>}
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Bitte geben Sie Ihre Email-Adresse ein"
            required
          />
        </label>
        <label>
          Passwort:
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Bitte geben Sie Ihr Passwort ein"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </label>
        <label>
          Passwort wiederholen:
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Bitte wiederholen Sie Ihr Passwort"
              required
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="toggle-password"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </label>
        <PasswordChecklist
          rules={["minLength", "specialChar", "number", "capital", "match"]}
          minLength={8}
          value={formData.password}
          valueAgain={formData.confirmPassword}
          onChange={(isValid) => {}}
          messages={{
            minLength: "Das Passwort muss mindestens 8 Zeichen lang sein.",
            specialChar: "Das Passwort muss ein Sonderzeichen enthalten.",
            number: "Das Passwort muss eine Zahl enthalten.",
            capital: "Das Passwort muss einen Großbuchstaben enthalten.",
            match: "Die Passwörter stimmen überein."
          }}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Jetzt registrieren</button>
      </form>
      <button type="button" onClick={() => navigate('/login')}>Zurück</button>
      <button type="button" onClick={() => navigate('/booking')}>Abbrechen</button>
    </div>
  );
}

export default Signup;
