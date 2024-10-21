
import { getAuth, signOut } from 'firebase/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ajustes.css';

const Ajustes = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); 
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="ajustes-container">
      <h1>Ajustes</h1>
      <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
      {}
    </div>
  );
};

export default Ajustes;
