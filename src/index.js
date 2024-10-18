// src/index.js
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom'; // Cambiado Switch a Routes
import logo from './assets/images/logo.jpeg';
import './index.css'; // Asegúrate de tener estilos aquí
import Login from './vistas/login'; // Importa el componente de login
import Registrar from './vistas/registrar'; // Importa el componente de registrar

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuario está logueado
        setUser(user);
      } else {
        // Usuario no está logueado
        setUser(null);
      }
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar
  }, []);

  return (
    <div className="container">
      <img src={logo} alt="Logo" className="logo" />
      {user ? (
        <>
          <h1>¡Bienvenido, {user.displayName || user.email}!</h1>
          <Link to="/logout">
            <button className="logout-button">Cerrar Sesión</button>
          </Link>
        </>
      ) : (
        <>
          <h1>¡Bienvenidos!</h1>
          <Link to="/login">
            <button className="login-button">Iniciar Sesión</button>
          </Link>
          <p>
            ¿No tienes cuenta? <Link to="/registrar">Regístrate</Link>
          </p>
        </>
      )}
    </div>
  );
};

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} /> {/* Cambiado a element */}
      <Route path="/registrar" element={<Registrar />} /> {/* Agrega la ruta para registrar */}
      <Route path="/" element={<App />} /> {/* Cambiado a element */}
    </Routes>
  </Router>,
  document.getElementById('root')
);
