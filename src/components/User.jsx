import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import './styles/User.css';

function User() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = JSON.parse(localStorage.getItem('userDetails'))?.email;

    if (!token || !email) {
      console.error('No token or email found, redirecting to login...');
      navigate('/login');
      return;
    }

    fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error fetching user data: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
        setEditData(data); // Устанавливаем данные для редактирования
        setLoading(false);
      })
      .catch(error => {
        console.error('Error during user data fetching:', error);
        setError('Failed to load user data');
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/appointments/my', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching appointments');
        }
        return response.json();
      })
      .then(data => {
        console.log('Appointments data:', data); // Логирование данных
        setAppointments(data);
      })
      .catch(error => {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments');
      });
  }, [navigate]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  const handleEditSubmit = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, cannot update user data.');
      return;
    }

    fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update user data.');
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
        setEditing(false);
        alert('Daten wurden erfolgreich aktualisiert.');
      })
      .catch(error => {
        console.error('Error updating user data:', error);
        setError('Failed to update user data');
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    const token = localStorage.getItem('token');
    const email = JSON.parse(localStorage.getItem('userDetails'))?.email;

    fetch(`/api/users/by-email/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('userDetails');
          navigate('/signup');
        } else {
          console.error('Failed to delete account:', response.statusText);
        }
      })
      .catch(error => console.error('Error deleting account:', error));
  };

  const handleCancelAppointment = (appointmentId) => {
    const token = localStorage.getItem('token');
    fetch(`/api/appointments/${appointmentId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Fehler bei der Terminabsage');
        }
        setAppointments(appointments.filter(appointment => appointment.idAppointment !== appointmentId));
      })
      .catch(error => console.error('Error canceling appointment:', error));
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      console.error('Received undefined dateTime:', dateTime);
      return 'Ungültiges Datum'; // Возвращаем сообщение, если dateTime неопределено
    }

    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateTime);
        return 'Ungültiges Datum'; // Возвращаем сообщение об ошибке, если дата недействительна
      }
      return format(date, 'dd.MM.yyyy, EEEE, HH:mm', { locale: de });
    } catch (error) {
      console.error('Error formatting date:', error, 'DateTime value:', dateTime);
      return 'Ungültiges Datum'; // Возвращаем сообщение об ошибке, если что-то пошло не так
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Error: Benutzerinformationen konnten nicht geladen werden.</div>;
  }

  return (
    <div className="user-container">
      <h1>Benutzerinformationen</h1>
      <div className="user-info">
        {!editing ? (
          <>
            <p><strong>Vorname:</strong> {user.firstname}</p>
            <p><strong>Nachname:</strong> {user.surName}</p>
            <p><strong>Geburtsdatum:</strong> {format(new Date(user.birthDate), 'dd.MM.yyyy', { locale: de })}</p>
            <p><strong>Telefonnummer:</strong> {user.phoneNumber}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button onClick={() => setEditing(true)} className="edit-button">Persönliche Daten ändern</button>
          </>
        ) : (
          <>
            <label>
              Vorname:
              <input
                type="text"
                name="firstname"
                value={editData.firstname}
                onChange={handleEditChange}
              />
            </label>
            <label>
              Nachname:
              <input
                type="text"
                name="surName"
                value={editData.surName}
                onChange={handleEditChange}
              />
            </label>
            <label>
              Geburtsdatum:
              <input
                type="date"
                name="birthDate"
                value={editData.birthDate}
                onChange={handleEditChange}
              />
            </label>
            <label>
              Telefonnummer:
              <input
                type="text"
                name="phoneNumber"
                value={editData.phoneNumber}
                onChange={handleEditChange}
              />
            </label>

            <button onClick={handleEditSubmit} className="save-button">Speichern</button>
            <button onClick={() => setEditing(false)} className="cancel-button">Abbrechen</button>
          </>
        )}
      </div>
      <h2>Terminübersicht</h2>
      <ul className="appointment-history">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <li key={appointment.idAppointment}>
              {appointment.timeSlot?.dateTime ? formatDateTime(appointment.timeSlot.dateTime) : 'Datum nicht verfügbar'} -
              {appointment.timeSlot?.doctor?.firstName} {appointment.timeSlot?.doctor?.lastName},
              {appointment.timeSlot?.doctor?.department?.titleDepartment}
              <button
                className="cancel-button"
                onClick={() => handleCancelAppointment(appointment.idAppointment)}
              >
                Termin absagen
              </button>
            </li>
          ))
        ) : (
          <div className="appointment-message">
            <p>Keine Termine verfügbar</p>
          </div>
        )}
      </ul>
      <div className="user-actions">
        <button onClick={handleLogout} className="logout-button">Log out</button>
        <button onClick={handleDeleteAccount} className="delete-account-button">Account löschen</button>
      </div>
    </div>
  );
}

export default User;
