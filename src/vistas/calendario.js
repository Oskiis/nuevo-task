import { getAuth, signOut } from 'firebase/auth'; // Para autenticación
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore'; // Para Firestore
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar'; // Componente de calendario
import 'react-calendar/dist/Calendar.css'; // Estilos del calendario
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Navegación
import './calendario.css'; // Estilos personalizados

const Calendario = () => {
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

  // Obtener tareas del usuario
  useEffect(() => {
    if (!uid) return;

    const obtenerTareas = async () => {
      try {
        const q = query(collection(db, 'tareas'), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
        const tareasUsuario = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fechaVencimiento: new Date(doc.data().fechaVencimiento),
        }));
        setTareas(tareasUsuario);
      } catch (error) {
        console.error("Error al obtener tareas:", error);
      }
    };

    obtenerTareas();
  }, [uid]);

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

  // Asignar color según la proximidad de la fecha
  const getTaskColor = (fechaVencimiento) => {
    const diffInDays = Math.floor((fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
    if (diffInDays < 1) return 'rojo'; // Vence hoy o ya venció
    if (diffInDays <= 2) return 'rojo';
    if (diffInDays <= 5) return 'amarillo';
    return 'verde';
  };

  // Renderizar contenido de los días en el calendario
  const renderDay = ({ date, view }) => {
    if (view === 'month') {
      const tareasDia = tareas.filter(tarea =>
        tarea.fechaVencimiento.toDateString() === date.toDateString()
      );

      return (
        <div>
          {tareasDia.map(tarea => (
            <p key={tarea.id} className={`tarea-${getTaskColor(tarea.fechaVencimiento)}`}>
              {tarea.titulo}
            </p>
          ))}
        </div>
      );
    }
  };

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
          <h1 className="header-title">Calendario de Actividades</h1>
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
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/calendario" state={{ uid }}>Calendario</Link></li>
          <li><Link to="/notificaciones" state={{ uid }}>Notificaciones</Link></li>
          <li><Link to="/ajustes" state={{ uid }}>Ajustes</Link></li>
        </ul>
      </nav>

      {/* Contenedor del calendario */}
      <div className="calendario-container">
        <h1>Calendario</h1>
        <Calendar
          onChange={setDate}
          value={date}
          tileContent={renderDay}
          locale="es-ES"
        />
      </div>
      <div className="crear-tarea">
        <button className="crear-tarea-button" onClick={() => navigate('/notas', { state: { uid } })}>
          ⇚
        </button>
      </div>
    </div>
  );
};

export default Calendario;
