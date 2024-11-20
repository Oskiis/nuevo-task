import { getAuth } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './notas.css';

const Notas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uid = location.state?.uid;

  const [menuOpen, setMenuOpen] = useState(false);
  const [tareas, setTareas] = useState([]);
  const [longPressTask, setLongPressTask] = useState(null);
  const [prioridad, setPrioridad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [usuario, setUsuario] = useState(null);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    if (!uid) {
      navigate('/');
      return;
    }
    obtenerTareas();
    fetchUsuario();
  }, [db, uid, prioridad, categoria, estado, busqueda, navigate]);

  const fetchUsuario = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'Usuarios', user.uid));
      setUsuario(userDoc.data());
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const obtenerTareas = async () => {
    let q = query(collection(db, 'tareas'), where('uid', '==', uid));
    if (prioridad) q = query(q, where('prioridad', '==', prioridad));
    if (categoria) q = query(q, where('categoria', '==', categoria));
    if (estado) q = query(q, where('estado', '==', estado));

    const querySnapshot = await getDocs(q);
    let tareasUsuario = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      tareasUsuario = tareasUsuario.filter((tarea) =>
        tarea.titulo.toLowerCase().includes(busquedaLower)
      );
    }

    setTareas(tareasUsuario);
  };

  const handleTaskClick = (tarea) => {
    navigate('/notaseditar', { state: { tarea } });
  };

  const handleLongPress = (tarea) => {
    setLongPressTask(tarea.id);
    const confirmDelete = window.confirm(
      '¿Estás seguro que deseas eliminar esta tarea? No hay vuelta atrás.'
    );
    if (confirmDelete) {
      handleDelete(tarea.id);
    } else {
      setLongPressTask(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'tareas', id));
      setTareas((prevTareas) => prevTareas.filter((tarea) => tarea.id !== id));
      setLongPressTask(null);
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
    }
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  return (
    <div className="notas-container">
      {/* Menú de hamburguesa */}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}></div>
      <header className="header">
        <div className="header-left">
          <div className="menu-icon" onClick={toggleMenu}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <h1 className="header-title">Lista de Tareas</h1>
        </div>
        <div className="header-center">
          <input
            type="text"
            placeholder="Búsqueda por título"
            value={busqueda}
            onChange={handleBusquedaChange}
            className="busqueda-input"
          />
          <span className="lupa-texto">🔍</span>
        </div>
        <div className="header-right">
          {usuario && (
            <img
              src={usuario.fotoPerfil}
              alt="Foto de perfil"
              className="perfil-imagen"
            />
          )}
        </div>
      </header>

      <nav className={`menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/calendario" state={{ uid }}>Calendario</Link></li>
          <li><Link to="/notificaciones" state={{ uid }}>Notificaciones</Link></li>
          <li><Link to="/ajustes" state={{ uid }}>Ajustes</Link></li>
        </ul>
      </nav>

      
      <div className="filtros">
        <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option value="">Prioridad</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Categoría</option>
          <option value="casa">Casa</option>
          <option value="trabajo">Trabajo</option>
          <option value="estudio">Estudio</option>
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Estado</option>
          <option value="sin empezar">Sin empezar</option>
          <option value="en proceso">En proceso</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      <div className="tareas-list">
        {tareas.length > 0 ? (
          tareas.map((tarea) => (
            <div
              key={tarea.id}
              className={`tarea ${longPressTask === tarea.id ? 'tarea-roja' : ''}`}
              onClick={() => handleTaskClick(tarea)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleLongPress(tarea);
              }}
            >
              <div className="tarea-imagen">
                {tarea.imageUrl ? <img src={tarea.imageUrl} alt="Imagen de la tarea" /> : <p>Sin imagen</p>}
              </div>
              <div className="tarea-info">
                <h3>{tarea.titulo}</h3>
                <p>{tarea.descripcion.length > 100 ? tarea.descripcion.slice(0, 100) + '...' : tarea.descripcion}</p>
                <span className="tarea-prioridad">{tarea.prioridad}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No se encontraron tareas.</p>
        )}
      </div>
      <div className="crear-tarea">
        <button className="crear-tarea-button" onClick={() => navigate('/newtask', { state: { uid } })}>
          + Crear nueva tarea
        </button>
      </div>
    </div>
  );
};

export default Notas;
