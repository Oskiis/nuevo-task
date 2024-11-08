import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useLocation } from 'react-router-dom';
import './calendario.css';

const Calendario = () => {
  const location = useLocation();
  const uid = location.state?.uid;
  const [tareas, setTareas] = useState([]);
  const [date, setDate] = useState(new Date());
  const db = getFirestore();

  useEffect(() => {
    if (!uid) return;

    const obtenerTareas = async () => {
      try {
        const q = query(collection(db, 'tareas'), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
        const tareasUsuario = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fechaVencimiento: new Date(doc.data().fechaVencimiento),
        }));
        setTareas(tareasUsuario);
      } catch (error) {
        console.error("Error al obtener tareas:", error);
      }
    };

    obtenerTareas();
  }, [db, uid]);

  const getTaskColor = (fechaVencimiento) => {
    const diffInDays = Math.floor((fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
    if (diffInDays < 1) return 'rojo'; // Vence hoy o ya venció
    if (diffInDays <= 2) return 'rojo';
    if (diffInDays <= 5) return 'amarillo';
    return 'verde';
  };

  const renderDay = ({ date, view }) => {
    if (view === 'month') {
      const tareasDia = tareas.filter(tarea => (
        tarea.fechaVencimiento.toDateString() === date.toDateString()
      ));

      return (
        <div>
          {tareasDia.map(tarea => (
            <p key={tarea.id} className={`tarea-${getTaskColor(tarea.fechaVencimiento)}`}>
              {tarea.titulo}
            </p>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="calendario-container">
      <h1>Calendario de Tareas</h1>
      <Calendar
        onChange={setDate}
        value={date}
        tileContent={renderDay}
        locale="es-ES" // Configura el idioma a español
      />
      
    </div>
    
  );
};

export default Calendario;
