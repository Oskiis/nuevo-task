
import { getAuth, signOut } from 'firebase/auth'; // Para autenticación
import { doc, getDoc, getFirestore } from 'firebase/firestore'; // Para Firestore
import React, { useEffect, useState } from 'react';
import 'react-calendar/dist/Calendar.css'; // Estilos del calendario
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Navegación
import './ajustes.css'; // Estilos personalizados


const Acerca = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uid = location.state?.uid;

  const [tareas, setTareas] = useState([]);
  const [date, setDate] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  const db = getFirestore();
  const auth = getAuth();



  // Obtener datos del usuario
  useEffect(() => {
    const fetchUsuario = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'Usuarios', user.uid));
          setUsuario(userDoc.data());
        } catch (error) {
          console.error("Error al cargar usuario:", error);
        }
      }
    };

    fetchUsuario();
  }, [auth.currentUser]);




  // Cerrar sesión
  const handleCerrarSesion = () => {
    signOut(auth)
      .then(() => {
        console.log('Sesión cerrada');
        navigate('/');
      })
      .catch(error => console.error('Error al cerrar sesión:', error));
  };

  // Mostrar cuadro del perfil
  const handleMouseEnter = () => setMostrarPerfil(true);

  // Ocultar cuadro del perfil
  const handleMouseLeave = () => setTimeout(() => setMostrarPerfil(false), 5000);

  return (
    <div className="notas-container">
      {/* Menú de navegación */}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}></div>
      <header className="header">
        <div className="header-left">
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <h1 className="header-title">Acerca de </h1>
        </div>
        <div className="header-right">
          {usuario && (
            <img
              src={usuario.fotoPerfil}
              alt="Foto de perfil"
              className="perfil-imagen"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </div>
      </header>

      {/* Cuadro del perfil */}
      {mostrarPerfil && usuario && (
        <div className="perfil-popup">
          <p>Correo electrónico: {usuario.email}</p>
          <div className="perfil-popup-image">
            <img src={usuario.fotoPerfil} alt="Foto de perfil" />
          </div>
          <p>Hola, {usuario.nombre}</p>
          <button className="cerrar-sesion-btn" onClick={handleCerrarSesion}>Cerrar sesión</button>
        </div>
      )}

      <nav className={`menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          
          <li><Link to="/notas" state={{ uid }}>Notas y Tareas</Link></li>
          <li><Link to="/ajustes">Informacion Personal</Link></li>
          <li><Link to="/privacidad" state={{ uid }}>Privacidad y seguridad</Link></li>
          <li><Link to="/acerca" state={{ uid }}>Acerca de</Link></li>
          <button className="cerrar-sesion-btn" onClick={handleCerrarSesion}>Cerrar sesión</button>
        </ul>
      </nav>

      {/* Contenedor del calendario */}
      <div className="crear-tarea">
        <button className="crear-tarea-button" onClick={() => navigate('/notas', { state: { uid } })}>
          ⇚
        </button>
      </div>
    </div>
  );
};

export default Acerca;
