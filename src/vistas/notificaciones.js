import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './notificaciones.css';

const Notificaciones = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uid = location.state?.uid;

  const [tareasProximas, setTareasProximas] = useState([]);
  const [tareasVencidas, setTareasVencidas] = useState([]);
  const [tareasRecientes, setTareasRecientes] = useState([]);
  const [tareasCompletadas, setTareasCompletadas] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    if (!uid) {
      navigate('/');
      return;
    }
    cargarTareas();
  }, [db, uid, navigate]);

  const cargarTareas = async () => {
    const hoy = new Date();
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

    setTareasProximas(proximas);
    setTareasVencidas(vencidas);
    setTareasRecientes(recientes);
    setTareasCompletadas(completadas);
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
          </div>
        ))
      ) : (
        <p>No hay tareas en esta categoría.</p>
      )}
    </div>
  );

  return (
    <div className="notificaciones-container">
      <h1>Notificaciones</h1>
      {renderTareas('Próximas a vencer', tareasProximas, 'notificacion-proxima')}
      {renderTareas('Vencidas', tareasVencidas, 'notificacion-vencida')}
      {renderTareas('Recientemente agregadas', tareasRecientes, 'notificacion-reciente')}
      {renderTareas('Completadas', tareasCompletadas, 'notificacion-completada')}
    </div>
  );
};

export default Notificaciones;
