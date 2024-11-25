import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import dayjs from 'dayjs';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './notaseditar.css';

const NotasEditar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tarea } = location.state || {};

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(dayjs());
  const [prioridad, setPrioridad] = useState('Media');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('en proceso');
  const [imagen, setImagen] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [fechaCompletado, setFechaCompletado] = useState(null);
  const [color, setColor] = useState('#ffffff'); // Color inicial
  const db = getFirestore();
  const storage = getStorage();

  const colores = [
    { name: 'rojo', hex: '#fadbd8' },
    { name: 'azul', hex: '#befffc' },
    { name: 'verde', hex: '#d8fdd7' },
    { name: 'amarillo', hex: '#f9fdd7' },
    { name: 'lila', hex: '#e9d7fd' },
    { name: 'anaranjado', hex: '#ffebc3' },
  ];

  useEffect(() => {
    const cargarDatosTarea = async () => {
      const tareaRef = doc(db, 'tareas', tarea.id);
      const tareaSnap = await getDoc(tareaRef);

      if (tareaSnap.exists()) {
        const data = tareaSnap.data();
        setTitulo(data.titulo);
        setDescripcion(data.descripcion);
        setFechaVencimiento(dayjs(data.fechaVencimiento));
        setPrioridad(data.prioridad);
        setCategoria(data.categoria);
        setEstado(data.estado);
        setColor(data.color || '#ffffff'); // Cargar color existente o blanco por defecto
        setFechaCompletado(data.fechaCompletado || null);
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      }
    };

    if (tarea) {
      cargarDatosTarea();
    }
  }, [db, tarea]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      let updatedImageUrl = imageUrl;

      if (imagen) {
        const imageRef = ref(storage, `tareas/${tarea.uid}_${Date.now()}`);
        await uploadBytes(imageRef, imagen);
        updatedImageUrl = await getDownloadURL(imageRef);
      }

      const tareaRef = doc(db, 'tareas', tarea.id);

      let updatedFechaCompletado = fechaCompletado;
      if (estado === 'finalizado' || estado === 'completado') {
        updatedFechaCompletado = dayjs().toISOString();
      }

      await updateDoc(tareaRef, {
        titulo,
        descripcion,
        fechaVencimiento: fechaVencimiento.format(),
        prioridad,
        categoria,
        estado,
        color, // Guardar el color seleccionado
        imageUrl: updatedImageUrl,
        fechaCompletado: updatedFechaCompletado,
      });

      navigate('/notas', { state: { uid: tarea.uid } });
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
    }
  };

  return (
    <div className="notas-editar-container">
      <h1>Editar Tarea</h1>
      <form onSubmit={handleUpdate}>
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

        <label>Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          required
          disabled={estado === 'finalizado' || estado === 'completado'}
        >
          <option value="sin empezar">Sin empezar</option>
          <option value="en proceso">En proceso</option>
          <option value="finalizado">Finalizado</option>
        </select>

        <label>Selecciona un Color</label>
        <div className="color-selector">
          {colores.map((c) => (
            <div
              key={c.name}
              className={`color-circle ${color === c.hex ? 'selected' : ''}`}
              style={{ backgroundColor: c.hex }}
              onClick={() => setColor(c.hex)}
            />
          ))}
        </div>

        <label>Agregar Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files[0])}
        />

        <button type="submit" className="editar-tarea-button">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default NotasEditar;
