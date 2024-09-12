import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import './styles/AdminSchedule.css';

const fetchWithToken = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return await response.json();
};

function AdminSchedule() {
  const [schedule, setSchedule] = useState({
    doctorId: 0,
    dateTime: '',
    insurance: '',
    isBooked: false,
  });

  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [error, setError] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState({
    id: 0,
    firstName: '',
    lastName: '',
    departmentId: 0,
    specialization: '',
    experienceYears: 0,
    reviewId: 0,
    photoUrl: '',
  });

  const handleError = (err) => {
    console.error('Error:', err);
    setError(err);
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const data = await fetchWithToken('/api/doctor-profiles');
        setDoctors(data);
      } catch (err) {
        handleError(err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const data = await fetchWithToken('/api/timeslots');
        setSlots(data);
      } catch (err) {
        handleError(err);
      } finally {
        setLoadingSlots(false);
      }
    };

    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const data = await fetchWithToken('/api/departments');
        setDepartments(data);
      } catch (err) {
        handleError(err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDoctors();
    fetchSlots();
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setSchedule({
      ...schedule,
      [e.target.name]: e.target.value,
    });
  };

  const handleDoctorChange = (e) => {
    setCurrentDoctor({
      ...currentDoctor,
      [e.target.name]: e.target.value,
    });
  };

  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchWithToken('/api/timeslots', {
        method: 'POST',
        body: JSON.stringify(schedule),
      });

      // Новый слот, включающий данные врача из ответа API
      const newSlot = {
        ...data,
        doctorId: data.doctor.id, // Используем ID врача из ответа API
      };

      console.log('Slot created:', newSlot);

      // Добавляем новый слот в список слотов
      setSlots([...slots, newSlot]);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    console.log('Deleting slot with id:', slotId);
    try {
      await fetchWithToken(`/api/timeslots/${slotId}`, {
        method: 'DELETE',
      });
      setSlots(slots.filter(slot => slot.id !== slotId));
      console.log('Slot deleted');
    } catch (error) {
      handleError(error);
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    const method = currentDoctor.id ? 'PUT' : 'POST';
    const url = currentDoctor.id
      ? `/api/doctor-profiles/${currentDoctor.id}`
      : '/api/doctor-profiles';

    try {
      const data = await fetchWithToken(url, {
        method: method,
        body: JSON.stringify(currentDoctor),
      });
      console.log('Doctor profile updated:', data);
      if (currentDoctor.id) {
        setDoctors(doctors.map(doctor => doctor.id === currentDoctor.id ? data : doctor));
      } else {
        setDoctors([...doctors, data]);
      }
      setCurrentDoctor({
        id: 0,
        firstName: '',
        lastName: '',
        departmentId: 0,
        specialization: '',
        experienceYears: 0,
        reviewId: 0,
        photoUrl: '',
      });
    } catch (error) {
      handleError(error);
    }
  };

  const handleEditDoctor = (doctor) => {
    console.log('Editing doctor:', doctor);
    setCurrentDoctor(doctor);
  };

  const handleDeleteDoctor = async (doctorId) => {
    console.log('Deleting doctor with id:', doctorId);
    try {
      await fetchWithToken(`/api/doctor-profiles/${doctorId}`, {
        method: 'DELETE',
      });
      setDoctors(doctors.filter(doctor => doctor.id !== doctorId));
      console.log('Doctor deleted');
    } catch (error) {
      handleError(error);
    }
  };

  if (loadingDoctors || loadingSlots || loadingDepartments) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const formatDateTime = (dateTime) => {
    return format(new Date(dateTime), 'PPP, EEEE, p', { locale: de });
  };

  const getDoctorName = (doctor) => {
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unbekannter Arzt';
  };

  return (
    <div className="admin-container">
      <h1>Zeitplan bearbeiten</h1>
      <form onSubmit={handleSlotSubmit}>
        <label>
          Arzt auswählen:
          <select name="doctorId" value={schedule.doctorId} onChange={handleChange}>
            <option value="">--Bitte wählen--</option>
            {doctors.map(doctor => (
              <option key={`doctor-${doctor.id}`} value={doctor.id}>
                {doctor.firstName} {doctor.lastName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Versicherungsart auswählen:
          <select name="insurance" value={schedule.insurance} onChange={handleChange}>
            <option value="">--Bitte wählen--</option>
            <option value="PRIVATE">Privat versichert</option>
            <option value="PUBLIC">Gesetzlich versichert</option>
          </select>
        </label>
        <label>
          Beginn der Zeit:
          <input type="datetime-local" name="dateTime" value={schedule.dateTime} onChange={handleChange} />
        </label>
        <button type="submit">Zeitplan hinzufügen</button>
      </form>

      <h2>Vorhandene Slots</h2>
      <ul className="slot-list">
        {slots.map(slot => (
          <li key={`slot-${slot.id}`}>
            {formatDateTime(slot.dateTime)} - {getDoctorName(slot.doctor)}
            <button className="delete" onClick={() => handleDeleteSlot(slot.id)}>Löschen</button>
          </li>
        ))}
      </ul>

      <h2>Doctor Profiles</h2>
      <form onSubmit={handleDoctorSubmit}>
        <label>
          Vorname:
          <input type="text" name="firstName" value={currentDoctor.firstName} onChange={handleDoctorChange} placeholder="Vorname" />
        </label>
        <label>
          Nachname:
          <input type="text" name="lastName" value={currentDoctor.lastName} onChange={handleDoctorChange} placeholder="Nachname" />
        </label>
        <label>
          Abteilung:
          <select name="departmentId" value={currentDoctor.departmentId} onChange={handleDoctorChange}>
            <option value="">--Bitte wählen--</option>
            {departments.map(department => (
              <option key={`department-${department.id}`} value={department.id}>
                {department.titleDepartment}
              </option>
            ))}
          </select>
        </label>
        <label>
          Spezialisation:
          <input type="text" name="specialization" value={currentDoctor.specialization} onChange={handleDoctorChange} placeholder="Spezialisierung" />
        </label>
        <label>
          Berufserfahrung:
          <input type="number" name="experienceYears" value={currentDoctor.experienceYears} onChange={handleDoctorChange} placeholder="Berufserfahrung" />
        </label>
        <label>
          Bewertungen:
          <input type="number" name="reviewId" value={currentDoctor.reviewId} onChange={handleDoctorChange} placeholder="Bewertungen" />
        </label>
        <label>
          Foto URL:
          <input type="text" name="photoUrl" value={currentDoctor.photoUrl} onChange={handleDoctorChange} placeholder="Foto URL" />
        </label>
        <div className="button-container">
          <button type="submit">{currentDoctor.id ? 'Ändern' : 'Hinzufügen'}</button>
          <button type="button" onClick={() => setCurrentDoctor({
            id: 0,
            firstName: '',
            lastName: '',
            departmentId: 0,
            specialization: '',
            experienceYears: 0,
            reviewId: 0,
            photoUrl: '',
          })}>Abbrechen</button>
        </div>
      </form>

      <h2>Vorhandene Ärzte</h2>
      <ul className="doctor-list">
        {doctors.map(doctor => (
          <li key={`doctor-${doctor.id}`}>
            <div className="doctor-info">
              {doctor.photoUrl && <img src={doctor.photoUrl} alt={`${doctor.firstName} ${doctor.lastName}`} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />}
              <span>{doctor.firstName} {doctor.lastName} ({doctor.departmentId})</span>
            </div>
            <div className="button-group">
              <button onClick={() => handleEditDoctor(doctor)}>Bearbeiten</button>
              <button className="delete" onClick={() => handleDeleteDoctor(doctor.id)}>Löschen</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminSchedule;
