import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Datenschutz.css'


function Datenschutz() {
  const navigate = useNavigate();

  return (
    <div className="datenschutz-container">
      <div className="datenschutz-box">
        <h1 className="datenschutz-header">Datenschutz</h1>
        <div className="datenschutz-content">
          <p>
            Hier können Sie die Datenschutzerklärung einfügen. Diese Seite enthält Informationen über die Verarbeitung und den Schutz personenbezogener Daten.
          </p>
        </div>
        <button type="button" onClick={() => navigate('/booking')}>Zurück zur Terminbuchung</button>
      </div>
    </div>
  );
}

export default Datenschutz;
