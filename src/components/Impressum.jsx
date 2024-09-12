import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Impressum.css'


function Impressum() {
  const navigate = useNavigate();

  return (
    <div className="impressum-container">
      <div className="impressum-box">
        <h1>Impressum</h1>
        <p>
          Hier können Sie das Impressum einfügen. Diese Seite enthält rechtliche Informationen und Details zum Betreiber der Website.
        </p>
        <button type="button" onClick={() => navigate('/booking')}>Zurück zur Terminbuchung</button>
      </div>
    </div>
  );
}

export default Impressum;
