import { collection, deleteDoc, doc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './notificaciones.css';

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tareas, setTareas] = useState([]);
  const [longPressTask, setLongPressTask] = useState(null);
  const [prioridad, setPrioridad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [uid, setUid] = useState(null);
  const db = getFirestore();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    if (!uid) {
      navigate('/');
      return;
    }
    obtenerTareas();
  }, [db, uid, prioridad, categoria, estado, busqueda, navigate]);

  const obtenerTareas = async () => {
    let q = query(collection(db, 'tareas'), where('uid', '==', uid));
    if (prioridad) q = query(q, where('prioridad', '==', prioridad));
    if (categoria) q = query(q, where('categoria', '==', categoria));
    if (estado) q = query(q, where('estado', '==', estado));

    const querySnapshot = await getDocs(q);
    let tareasUsuario = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      tareasUsuario = tareasUsuario.filter(tarea =>
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
    const confirmDelete = window.confirm('¿Estás seguro que deseas eliminar esta tarea? No hay vuelta atrás.');
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
    <div className="App">
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}></div>

      <header className="header">
        <div className="menu-icon" onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        <div className="titulo-header">
          <h1>Lista de Tareas</h1>
        </div>
        <div className="barra-busqueda">
          <input
            type="text"
            placeholder="Busca aquí el título de la tarea..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="busqueda-input"
          />
          <span className="lupa-texto">🔍</span>
        </div>
      </header>

      <nav className={`menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li><a href="#">Inicio</a></li>
          <li><a href="#">Calendario</a></li>
          <li><a href="#">Notificaciones</a></li>
          <li><a href="#">Ajustes</a></li>
        </ul>
      </nav>

      <main>
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
            <p>No se ha encontrado una tarea con dicho título.</p>
          )}

          <button className="crear-tarea-button" onClick={() => navigate('/newtask', { state: { uid } })}>
            + Crear nueva tarea
          </button>
        </div>
      </main>

      <div className="menu-inferior">
        <a href="#">Inicio</a>
        <a href="#">Calendario</a>
        <a href="#">Notificaciones</a>
        <a href="#">Ajustes</a>
      </div>
    </div>
  );
};

export default App;
