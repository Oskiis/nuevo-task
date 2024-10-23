// src/vistas/notas.js
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './notas.css';

const Notas = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const uid = location.state?.uid; 

  const [tareas, setTareas] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    if (!uid) {
      navigate('/');
      return;
    }

    const obtenerTareas = async () => {
      const q = query(collection(db, 'tareas'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      const tareasUsuario = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTareas(tareasUsuario);
    };

    obtenerTareas();
  }, [db, uid, navigate]); 

  return (
    <div className="notas-container">
      <h1>Lista de tareas</h1>
      <button className="crear-tarea-button">
        <Link to="/newtask" state={{ uid }} style={{ color: 'white', textDecoration: 'none' }}>
          + Crear nueva tarea
        </Link>
      </button>
      <div className="tareas-list">
        {tareas.length > 0 ? (
          tareas.map((tarea) => (
            <div key={tarea.id} className="tarea">
              <h3>{tarea.titulo}</h3>
              <p>{tarea.descripcion}</p>
            </div>
          ))
        ) : (
          <p>No hay tareas disponibles.</p>
          
        )}
        
      </div>
      <div className="menu-inferior">
        <Link to="/">Inicio</Link>
        <Link to="/calendario">Calendario</Link>
        <Link to="/notificaciones">Notificaciones</Link>
        <Link to="/ajustes">Ajustes</Link> {}
      </div>
    </div>
  );
};

export default Notas;
