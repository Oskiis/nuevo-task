import {
  getAuth,
  signOut
} from 'firebase/auth'; // Para autenticación
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where
} from 'firebase/firestore'; // Para Firestore
import React, { useEffect, useState } from 'react';
import 'react-calendar/dist/Calendar.css'; // Estilos del calendario
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Navegación
import './noti.css'; // Estilos personalizados

const Notificaciones = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uid = location.state?.uid;

  const [tareas, setTareas] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  const [tareasProximas, setTareasProximas] = useState([]);
  const [tareasVencidas, setTareasVencidas] = useState([]);
  const [tareasRecientes, setTareasRecientes] = useState([]);
  const [tareasCompletadas, setTareasCompletadas] = useState([]);

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
  }, [auth.currentUser, db]);

  useEffect(() => {
    if (!uid) {
      navigate('/');
      return;
    }
    cargarTareas();
  }, [db, uid, navigate]);

  const cargarTareas = async () => {
    const hoy = new Date();
    try {
      const querySnapshot = await getDocs(query(collection(db, 'tareas'), where('uid', '==', uid)));
      const todasTareas = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Clasificar tareas en diferentes estados
      const proximas = todasTareas.filter((tarea) => {
        const fechaVencimiento = new Date(tarea.fechaVencimiento);
        return tarea.estado !== 'finalizado' && fechaVencimiento > hoy && (fechaVencimiento - hoy) / (1000 * 60 * 60 * 24) <= 3;
      });

      const vencidas = todasTareas.filter((tarea) => {
        const fechaVencimiento = new Date(tarea.fechaVencimiento);
        return tarea.estado !== 'finalizado' && fechaVencimiento < hoy;
      });

      const recientes = todasTareas.filter((tarea) => {
        const fechaCreacion = new Date(tarea.fechaCreacion);
        return (hoy - fechaCreacion) / (1000 * 60 * 60 * 24) <= 7;
      });

      const completadas = todasTareas.filter((tarea) => tarea.estado === 'finalizado');

      // Actualizar el estado con las tareas filtradas
      setTareasProximas(proximas);
      setTareasVencidas(vencidas);
      setTareasRecientes(recientes);
      setTareasCompletadas(completadas);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  const renderTareas = (titulo, tareas, clase) => (
    <div>
      <h2>{titulo}</h2>
      {tareas.length > 0 ? (
        tareas.map((tarea) => (
          <div key={tarea.id} className={`notificacion ${clase}`}>
            <h3>Título: {tarea.titulo}</h3>
            <p>Fecha de vencimiento: {new Date(tarea.fechaVencimiento).toLocaleString()}</p>
            {tarea.estado && <p>Estado: {tarea.estado}</p>}
            {tarea.estado === 'finalizado' && tarea.fechaCompletado && (
              <p>Fecha de completado: {new Date(tarea.fechaCompletado).toLocaleString()}</p>
            )}
          </div>
        ))
      ) : (
        <p>No hay tareas en esta categoría.</p>
      )}
    </div>
  );

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
      <header className="header">
        <div className="header-left">
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <h1 className="header-title">Notificaciones</h1>
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
          <li><Link to="/notas">Inicio</Link></li>
          <li><Link to="/calendario" state={{ uid }}>Calendario</Link></li>
          <li><Link to="/noti" state={{ uid }}>Notificaciones</Link></li>
          <li><Link to="/ajustes" state={{ uid }}>Ajustes</Link></li>
        </ul>
      </nav>

      <div className="notificaciones-container">
        <h1>Notificaciones</h1>
        
        {tareasCompletadas.length > 0 && (
          tareasCompletadas.map((tarea) => (
            <div key={tarea.id} className="notificacion notificacion-completada">
              <h3>Tarea Completada</h3>
              <p>{`Has completado la tarea "${tarea.titulo}".`}</p>
            </div>
          ))
        )}

        {tareasVencidas.length > 0 && (
          tareasVencidas.map((tarea) => (
            <div key={tarea.id} className="notificacion notificacion-vencida">
              <h3>Tarea Vencida</h3>
              <p>{`La tarea "${tarea.titulo}" venció hace 2 días.`}</p>
            </div>
          ))
        )}

        {tareasRecientes.length > 0 && (
          tareasRecientes.map((tarea) => (
            <div key={tarea.id} className="notificacion notificacion-reciente">
              <h3>Notificación Reciente</h3>
              <p>Se agregó una nueva tarea a tu lista.</p>
            </div>
          ))
        )}

        {tareasProximas.length > 0 && (
          tareasProximas.map((tarea) => (
            <div key={tarea.id} className="notificacion notificacion-proxima">
              <h3>Tarea Próxima</h3>
              <p>{`La tarea "${tarea.titulo}" vence mañana.`}</p>
            </div>
          ))
        )}
      </div>

      <div className="crear-tarea">
        <button className="crear-tarea-button" onClick={() => navigate('/notas', { state: { uid } })}>
          ⇚
        </button>
      </div>
    </div>
  );
};

export default Notificaciones;
