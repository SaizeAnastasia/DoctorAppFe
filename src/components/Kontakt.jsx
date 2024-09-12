import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Kontakt.css'


function Kontakt() {
  const navigate = useNavigate();

  return (
    <div className="kontakt-container">
      <div className="kontakt-box">
        <h1>Kontakt</h1>
        <p>
          Hier können Sie die Kontaktinformationen einfügen. Diese Seite enthält Informationen, wie man den Betreiber der Website kontaktieren kann.
        </p>
        <button type="button" onClick={() => navigate('/booking')}>Zurück zur Terminbuchung</button>
      </div>
    </div>
  );
}

export default Kontakt;
