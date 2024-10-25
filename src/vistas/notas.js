// src/vistas/notas.js
import { collection, deleteDoc, doc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './notas.css';

const Notas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uid = location.state?.uid;

  const [tareas, setTareas] = useState([]);
  const [longPressTask, setLongPressTask] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    if (!uid) {
      navigate('/');
      return;
    }

    const obtenerTareas = async () => {
      const q = query(collection(db, 'tareas'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      const tareasUsuario = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTareas(tareasUsuario);
    };

    obtenerTareas();
  }, [db, uid, navigate]);

  const handleTaskClick = (tarea) => {
    navigate('/notaseditar', { state: { tarea } });
  };

  const handleLongPress = (tarea) => {
    setLongPressTask(tarea.id);
    const confirmDelete = window.confirm('¿Estás seguro que deseas eliminar esta tarea? No hay vuelta atrás.');
    if (confirmDelete) {
      handleDelete(tarea.id);
    } else {
      setLongPressTask(null); // Reinicia si no se confirma
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

  return (
    <div className="notas-container">
      <h1>Lista de tareas</h1>
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
          <p>No hay tareas disponibles.</p>
        )}

        
          <button className="crear-tarea-button">
            <Link to="/newtask" state={{ uid }} style={{ color: 'white', textDecoration: 'none' }}>
              + Crear nueva tarea
            </Link>
          </button>
      </div>
      <div className="menu-inferior">
        <Link to="/">Inicio</Link>
        <Link to="/calendario">Calendario</Link>
        <Link to="/notificaciones">Notificaciones</Link>
        <Link to="/ajustes"state={{ uid }}>Ajustes</Link>
      </div>
    </div>
  );
};

export default Notas;















