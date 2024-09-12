import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './styles/DoctorInfo.css';

function DoctorInfo() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = useState(null);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetched doctorId from URL:', doctorId);
    if (!doctorId) {
      setError('Invalid doctor ID');
      setLoading(false);
      return;
    }

    const fetchDoctorData = async () => {
      try {
        console.log('Starting fetch for doctor data');

        const response = await fetch(`/api/doctor-profiles/${doctorId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch doctor information. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched doctor data:', data);
        setDoctor(data);

        if (data.departmentId) {
          try {
            const departmentResponse = await fetch(`/api/departments/${data.departmentId}`);
            if (!departmentResponse.ok) {
              throw new Error(`Failed to fetch department information. Status: ${departmentResponse.status}`);
            }
            const departmentData = await departmentResponse.json();
            console.log('Fetched department data:', departmentData);
            setDepartmentName(departmentData.titleDepartment);
          } catch (error) {
            console.error('Error fetching department data:', error);
            setDepartmentName('Unknown');
          }
        } else {
          setDepartmentName('Unknown');
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  const handleBackClick = () => {
    const fromStep = location.state?.fromStep;
    if (fromStep) {
      navigate('/booking', { state: { step: fromStep } });
    } else {
      navigate('/booking');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return (
    <div>
      <p>Error: {error}</p>
      <button onClick={handleBackClick}>Zurück</button>
    </div>
  );

  return (
    <div className="doctor-info-container">
      <div className="doctor-info-box">
        <h1>Informationen über den Arzt</h1>
        {doctor?.photoUrl && (
          <img src={doctor.photoUrl} alt={`${doctor.firstName} ${doctor.lastName}`} />
        )}
        <p>Dr. {doctor?.firstName || 'Nicht verfügbar'} {doctor?.lastName || 'Nicht verfügbar'}</p>
        <p>Spezialisierung: {doctor?.specialization || 'Nicht verfügbar'}</p>
        <p>Berufserfahrung: {doctor?.experienceYears ? `${doctor.experienceYears} Jahre` : 'Nicht verfügbar'}</p>
        <button onClick={handleBackClick}>Zurück</button>
      </div>
    </div>
  );
}

export default DoctorInfo;
