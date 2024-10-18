import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { db } from './firebase'; // Ajusta la ruta según la estructura de tu proyecto

const App = () => {
  const auth = getAuth(); 
  const [user, setUser] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = auth.currentUser;
      setUser(currentUser);

      if (currentUser) {
        await fetchTareas(currentUser.uid);
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const fetchTareas = async (userId) => {
    try {
      const tareasRef = collection(db, 'tareas');
      const q = query(tareasRef, where('uid', '==', userId));
      const querySnapshot = await getDocs(q);

      const tareasList = [];
      querySnapshot.forEach((doc) => {
        const tareaData = doc.data();
        tareasList.push({ ...tareaData, id: doc.id });
      });
      setTareas(tareasList);
      setLoading(false);
    } catch (error) {
      console.error('Error recuperando tareas: ', error);
      setLoading(false);
    }
  };

  // Pantalla para usuarios no autenticados
  if (!user && !loading) {
    return (
      <div style={styles.container}>
        <img src={require('./assets/images/logo.jpeg')} alt="Logo" style={styles.logo} />
        <h1 style={styles.welcomeText}>¡Bienvenido!</h1>
        <button style={styles.button} onClick={() => window.location.href = '/login'}>
          Iniciar sesión
        </button>
        <p style={styles.registerText}>
          ¿No tienes cuenta?{' '}
          <span style={styles.registerLink} onClick={() => window.location.href = '/register'}>
            Regístrate
          </span>
        </p>
      </div>
    );
  }

  // Pantalla para usuarios autenticados
  return (
    <div style={styles.container}>
      {loading ? (
        <p>Cargando...</p>
      ) : tareas.length > 0 ? (
        <div>
          {tareas.map(item => (
            <div key={item.id} style={styles.tareaContainer}>
              {item.imagen && <img src={item.imagen} alt={item.nombre} style={styles.tareaImagen} />}
              <div style={styles.tareaInfo}>
                <h2 style={styles.tareaTitulo}>{item.nombre}</h2>
                <p style={styles.tareaFecha}>Fecha límite: {item.fechaLimite}</p>
                <p style={styles.tareaCategoria}>Prioridad: {item.categoria}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.noTareasContainer}>
          <p style={styles.noTareasText}>Aquí visualizas tus tareas, agrega una y descubrirás la magia</p>
        </div>
      )}

      <button style={styles.crearTareaButton} onClick={() => window.location.href = '../newTask'}>
        Crear tarea
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '20px',
  },
  logo: {
    width: '200px',
    height: '120px',
    marginBottom: '70px',
  },
  welcomeText: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '60px',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#87CEFA',
    padding: '15px 40px',
    borderRadius: '25px',
    marginBottom: '50px',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  registerText: {
    fontSize: '16px',
    color: '#333',
    textAlign: 'center',
  },
  registerLink: {
    color: '#87CEFA',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  tareaContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '20px',
    backgroundColor: '#f0f0f0',
    padding: '15px',
    borderRadius: '10px',
  },
  tareaImagen: {
    width: '100px',
    height: '100px',
    borderRadius: '10px',
    marginRight: '15px',
  },
  tareaInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tareaTitulo: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  tareaFecha: {
    fontSize: '16px',
    marginTop: '5px',
  },
  tareaCategoria: {
    fontSize: '16px',
    marginTop: '5px',
    color: '#87CEFA',
  },
  noTareasContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  noTareasText: {
    fontSize: '18px',
    color: '#888',
    textAlign: 'center',
  },
  crearTareaButton: {
    backgroundColor: '#87CEFA',
    padding: '15px',
    borderRadius: '25px',
    alignItems: 'center',
    position: 'fixed',
    bottom: '10px',
    left: '20px',
    right: '20px',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
};

ReactDOM.render(<App />, document.getElementById('root'));
