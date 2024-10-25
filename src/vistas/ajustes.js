import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ajustes.css';

const Ajustes = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'Usuarios', user.uid));
        setUsuario(userDoc.data());
      }
    };
    fetchUserData();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!usuario) {
    return <div>Cargando...</div>; // Puedes mostrar un loader aquí
  }

  return (
    <div className="ajustes-container">
      <h1>Ajustes</h1>
      <div className="perfil-container">
        <img
          src={`URL_DE_TU_STORAGE/${usuario.fotoPerfil}`} // Asegúrate de que la URL sea correcta
          alt="Foto de perfil"
          className="perfil-imagen"
        />
        <div className="usuario-info">
          <span className="usuario-email">{usuario.email}</span>
          <br/>
          <span className="usuario-nombre">{usuario.nombre.toLowerCase()}</span>
          
        </div>
      </div>
      <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
    </div>
  );
};

export default Ajustes;
