
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NewTask = () => {
  const location = useLocation();
  const { uid } = location.state || {};
  
  console.log("UID en NewTask:", uid); //REcordar quitar esta madre

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [categoria, setCategoria] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore();

    try {
      await addDoc(collection(db, 'tareas'), {
        uid,
        titulo,
        descripcion,
        fechaVencimiento,
        prioridad,
        categoria,
      });
      navigate('/notas', { state: { uid } }); 
    } catch (error) {
      console.error("Error al agregar la tarea: ", error);
    }
  };

  if (!uid) {
    return <div>Error: No se pudo obtener el UID del usuario.</div>;
  }

  return (
    <div className="new-task-container">
      <h1>Crear nueva tarea</h1>
      <form onSubmit={handleSubmit}>
        <label>Título de la tarea</label>
        <input
          type="text"
          placeholder="Ingresa el título de la tarea"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <label>Descripción de la tarea</label>
        <textarea
          placeholder="Ingresa la descripción de la tarea"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />

        <label>Fecha de Vencimiento</label>
        <input
          type="date"
          value={fechaVencimiento}
          onChange={(e) => setFechaVencimiento(e.target.value)}
          required
        />

        <label>Prioridad</label>
        <select
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
          required
        >
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>

        <label>Categoría</label>
        <input
          type="text"
          placeholder="Ingresa la categoría"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        />

        <button type="submit" className="agregar-tarea-button">
          Agregar tarea
        </button>
      </form>
    </div>
  );
};

export default NewTask;
