import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/Booking.css';

function Booking() {
  const location = useLocation();
  const [step, setStep] = useState(location.state?.step || 1);
  const [existingPatient, setExistingPatient] = useState(null);
  const [insurance, setInsurance] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchData = async (url, setState) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(`Data fetched from ${url}:`, data);
      setState(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('/api/departments', setDepartments);
  }, []);

  useEffect(() => {
    if (departmentId) {
      fetchData(`/api/doctor-profiles/department/${departmentId}`, setDoctors);
    }
  }, [departmentId]);

  const handleExistingPatient = (isExisting) => {
    if (isExisting) {
      setExistingPatient(true);
      setStep(2);
    } else {
      alert("Entschuldigung, wir nehmen keine neuen Patienten auf.");
    }
  };

  const handleInsuranceChange = (e) => {
    setInsurance(e.target.value);
    setStep(3);
  };

  const handleDepartmentChange = (e) => {
    setDepartmentId(e.target.value);
    setStep(4);
  };

  const handleDoctorChange = (e) => {
    setDoctorId(e.target.value);
  };

  const fetchAvailableSlots = () => {
    if (!insurance) {
      alert("Пожалуйста, выберите тип страховки.");
      return;
    }

    if (doctorId) {
      const typeOfInsurance = insurance ? `?TypeOfInsurance=${insurance}` : '';
      const url = `/api/timeslots/doctor/${doctorId}${typeOfInsurance}`;

      console.log(`Fetching slots from ${url}`);

      fetchData(url, (slots) => {
        // Фильтруем слоты по выбранному типу страховки
        const filteredSlots = slots.filter(slot => slot.insurance === insurance);
        setAvailableSlots(filteredSlots);
      });
      setStep(5);
    } else {
      alert("Bitte wählen Sie einen Arzt aus.");
    }
  };

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBooking = (e) => {
    e.preventDefault();

    const selectedDoctor = doctors.find(doc => doc.id === parseInt(doctorId));
    const bookingDetails = {
      doctorName: selectedDoctor ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : '',
      date: selectedSlot ? selectedSlot.dateTime.split(' ')[0] : '',
      slotId: selectedSlot?.id,
      insurance: insurance,
      doctorId: doctorId,
      departmentId: departmentId,
    };

    console.log('Saving to localStorage:', bookingDetails);
    localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

    const userDetails = localStorage.getItem("userDetails");
    console.log('User details in localStorage:', userDetails);

    if (!userDetails) {
      console.log('Opening login modal');
      setShowLoginModal(true);
    } else {
      navigate('/confirmation');
    }
  };

  const handleMoreInfoClick = (doctorId) => {
    if (doctorId) {
      navigate(`/doctorInfo/${doctorId}`, { state: { fromStep: 4 } });
    } else {
      console.error('Doctor ID is undefined');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCancel = () => {
    window.location.href = 'http://127.0.0.1:5500/';
  };


  return (
    <div className="booking-container">
      <h1>Termin buchen</h1>
      {step === 1 && (
        <div className="step-container">
          <strong>Waren Sie schon einmal bei uns?</strong>
          <div className="step-buttons">
            <button type="button" onClick={() => handleExistingPatient(true)}>Ja</button>
            <button type="button" onClick={() => handleExistingPatient(false)}>Nein</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="step-container">
          <label>
            Wählen Sie Ihre Versicherung:
            <select value={insurance} onChange={handleInsuranceChange}>
              <option value="">--Bitte wählen--</option>
              <option value="PUBLIC">Gesetzlich versichert</option>
              <option value="PRIVATE">Privat versichert</option>
            </select>
          </label>
          <div className="step-buttons">
            <button onClick={handleBack}>Zurück</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="step-container">
          <label>
            Wählen Sie bitte das gewünschte Fachgebiet:
            <select value={departmentId} onChange={handleDepartmentChange}>
              <option value="">--Bitte wählen--</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.titleDepartment}
                </option>
              ))}
            </select>
          </label>
          <div className="step-buttons">
            <button onClick={handleBack}>Zurück</button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="step-container">
          <label>
            Wählen Sie bitte einen Arzt:
            <select value={doctorId} onChange={handleDoctorChange}>
              <option value="">--Bitte wählen--</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.firstName} {doc.lastName}, {doc.specialization}
                </option>
              ))}
            </select>
          </label>
          {doctorId ? (
            <>
              <div className="button-container">
                <button
                  type="button"
                  className="info-button"
                  onClick={() => handleMoreInfoClick(doctorId)}
                >
                  mehr info
                </button>
                <button
                  type="button"
                  className="slot-button"
                  onClick={fetchAvailableSlots}
                >
                  Verfügbare Termine anzeigen
                </button>
              </div>
            </>
          ) : (
            <p>Bitte wählen Sie einen Arzt aus, um mehr Informationen zu sehen.</p>
          )}
          <div className="step-buttons">
            <button onClick={handleBack}>Zurück</button>
          </div>
        </div>
      )}
      {step === 5 && (
        <form onSubmit={handleBooking} className="step-container">
          <div className="slot-container">
            {availableSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className="slot-button"
                onClick={() => handleSlotSelection(slot)}
                style={{ backgroundColor: selectedSlot === slot ? '#f0f0f0' : '' }}
              >
                {new Date(slot.dateTime).toLocaleString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </button>
            ))}
          </div>
          <div className="step-buttons">
            <button type="submit" disabled={!selectedSlot}>Bestätigen</button>
            <button type="button" onClick={handleCancel}>Abbrechen</button>
            <button type="button" onClick={handleBack}>Zurück</button>
          </div>
        </form>
      )}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}

export default Booking;
