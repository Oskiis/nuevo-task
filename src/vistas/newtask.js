import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import dayjs from 'dayjs';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import * as React from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './newtask.css';

const NewTask = () => {
  const location = useLocation();
  const { uid } = location.state || {};
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(dayjs()); // Usando dayjs para gestionar fecha
  const [prioridad, setPrioridad] = useState('Media');
  const [categoria, setCategoria] = useState('');
  const [imagen, setImagen] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore();
    const storage = getStorage();
    let imageUrl = '';

    if (imagen) {
      const imageRef = ref(storage, `tareas/${uid}_${Date.now()}`);
      await uploadBytes(imageRef, imagen);
      imageUrl = await getDownloadURL(imageRef);
    }

    try {
      await addDoc(collection(db, 'tareas'), {
        uid,
        titulo,
        descripcion,
        fechaVencimiento: fechaVencimiento.format(), // Guardando en formato ISO
        prioridad,
        categoria,
        imageUrl,
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

        <label>Fecha y Hora de Vencimiento</label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDateTimePicker
            value={fechaVencimiento}
            onChange={(newValue) => setFechaVencimiento(newValue)}
            slotProps={{
              textField: { variant: 'outlined', fullWidth: true, placeholder: 'Selecciona fecha y hora' },
            }}
          />
        </LocalizationProvider>

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

        <label>Agregar Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files[0])}
        />

        <button type="submit" className="agregar-tarea-button">
          Agregar tarea
        </button>
      </form>
    </div>
  );
};

export default NewTask;
