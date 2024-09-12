import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import './styles/Confirmation.css'

function Confirmation() {
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const details = JSON.parse(localStorage.getItem('bookingDetails'));
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));

    if (!details || !userDetails) {
      setError('Keine Buchungsdetails oder Benutzerinformationen gefunden.');
      navigate('/booking');
      return;
    }

    const combinedDetails = {
      ...details,
      userId: userDetails.id,
      userEmail: userDetails.email,
      id: details.slotId,
      dateTime: details.date,
    };

    setAppointmentDetails(combinedDetails);
  }, [navigate]);

  const handleConfirm = async () => {
    if (!appointmentDetails || !appointmentDetails.id) {
      setError('Termin-ID fehlt.');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // // Первый запрос: бронирование таймслота
      // const bookingResponse = await fetch(`/api/timeslots/${appointmentDetails.id}/booking`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(appointmentDetails)
      // });

      // const bookingText = await bookingResponse.text();
      // let bookingData;
      // try {
      //   bookingData = JSON.parse(bookingText);
      // } catch (e) {
      //   console.log('Server returned a non-JSON response:', bookingText);
      //   bookingData = bookingText; // Если это не JSON, сохраняем текст
      // }

      // if (!bookingResponse.ok) {
      //   throw new Error(bookingData.message || 'Fehler bei der Buchung des Termins.');
      // }

      // console.log('Buchung erfolgreich:', bookingData);

      // Второй запрос: подтверждение записи на прием
      const appointmentResponse = await fetch(`/api/appointments/${appointmentDetails.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          timeSlotId: appointmentDetails.id,
          userId: appointmentDetails.userId,
          // status: 'SCHEDULED'
        })
      });

      const appointmentText = await appointmentResponse.text();
      let appointmentData;
      try {
        appointmentData = JSON.parse(appointmentText);
      } catch (e) {
        console.log('Server returned a non-JSON response:', appointmentText);
        appointmentData = appointmentText; // Если это не JSON, сохраняем текст
      }

      if (!appointmentResponse.ok) {
        throw new Error(appointmentData.message || 'Fehler bei der Terminbestätigung.');
      }

      console.log('Termin erfolgreich bestätigt:', appointmentData);

      setSuccess(true);
      localStorage.removeItem('bookingDetails');
    } catch (error) {
      console.error('Fehler bei der Terminbestätigung:', error.message);
      setError('Beim Bestätigen des Termins ist ein Fehler aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    localStorage.removeItem('bookingDetails');
    navigate('/booking');
  };

  const formatDateTime = (dateTime) => {
    try {
      return format(new Date(dateTime), "dd.MM.yyyy, EEEE, HH:mm", { locale: de });
    } catch (error) {
      console.error('Fehler beim Formatieren des Datums:', error);
      return dateTime;
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!appointmentDetails) {
    return <div>Loading...</div>;
  }

  if (success) {
    return (
      <div className="confirmation-container">
      <div className="confirmation-box">
        <h1>Bestätigung erfolgreich!</h1>
        <p>Ihr Termin wurde erfolgreich bestätigt und die E-Mails wurden versendet.</p>
        <button onClick={() => navigate('/user')}>Zurück zum Profil</button>
      </div>
    </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-box">
        <h1>Bestätigung</h1>
        <p><strong>Arzt:</strong> {appointmentDetails.doctorName}</p>
        <p><strong>Datum und Zeit:</strong> {appointmentDetails.dateTime ? formatDateTime(appointmentDetails.dateTime) : 'Zeit nicht verfügbar'}</p>
        <button onClick={handleConfirm} disabled={loading}>
          {loading ? 'Bestätigen...' : 'Bestätigen'}
        </button>
        <button onClick={handleReject} disabled={loading}>
          Ablehnen
        </button>
      </div>
    </div>
  );
}

export default Confirmation;

