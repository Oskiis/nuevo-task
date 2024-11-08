
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
  const [prioridad, setPrioridad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');
  const db = getFirestore();

  useEffect(() => {
    if (!uid) {
      navigate('/');
      return;
    }
    obtenerTareas();
  }, [db, uid, navigate]);

  const obtenerTareas = async () => {
    let q = query(collection(db, 'tareas'), where('uid', '==', uid));
    if (prioridad) q = query(q, where('prioridad', '==', prioridad));
    if (categoria) q = query(q, where('categoria', '==', categoria));
    if (estado) q = query(q, where('estado', '==', estado));

    const querySnapshot = await getDocs(q);
    const tareasUsuario = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  const handleFilter = () => {
    obtenerTareas();
  };

  return (
    <div className="notas-container">
      <h1>Lista de tareas</h1>
      
      <div className="filtros">
        <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option value="">Prioridad</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
        
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        <option value="casa">Casa</option>
            <option value="trabajo">Trabajo</option>
            <option value="estudio">Estudio</option>
            <option value="salud">Salud</option>
            <option value="finanzas">Finanzas</option>
            <option value="compras">Compras</option>
            <option value="familia">Familia</option>
            <option value="social">Social</option>
            <option value="hobbies">Hobbies</option>
            <option value="viajes">Viajes</option>
            <option value="voluntariado">Voluntariado</option>
            <option value="proyectos personales">Proyectos personales</option>
            <option value="auto-cuidado">Auto-cuidado</option>
            <option value="tecnología">Tecnología</option>
            <option value="mascotas">Mascotas</option>
            <option value="eventos especiales">Eventos especiales</option>
            <option value="reparaciones y mantenimiento">Reparaciones y mantenimiento</option>
            <option value="planificación">Planificación</option>
        </select>
        
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Estado</option>
          <option value="finalizado">Finalizado</option>
          <option value="completado">Completado</option>
          <option value="en proceso">En Proceso</option>
        </select>
        
        <button onClick={handleFilter} className="filtrar-button">Filtrar</button>
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
          <p>No hay tareas disponibles.</p>
        )}

        <button className="crear-tarea-button" onClick={() => {
              console.log('Botón de crear tarea presionado');
              navigate('/newtask', { state: { uid } });
            }}>
              + Crear nueva tarea
        </button>

      </div>
      <div className="menu-inferior">
        <Link to="/">Inicio</Link>
        <Link to="/calendario" state={{ uid }}>Calendario</Link>
        <Link to="/notificaciones">Notificaciones</Link>
        <Link to="/ajustes" state={{ uid }}>Ajustes</Link>
        
        
      </div>
    </div>
  );
};

export default Notas;
