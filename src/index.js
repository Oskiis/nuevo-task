import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Link, Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import logo from './assets/images/logo.jpeg';
import './index.css';
import Ajustes from './vistas/ajustes';
import Calendario from './vistas/calendario';
import Login from './vistas/login';
import NewTask from './vistas/newtask';
import Notas from './vistas/notas';
import Notaseditar from './vistas/notaseditar';
import Noti from './vistas/noti';
import Notificaciones from './vistas/notificaciones';
import Registrar from './vistas/registrar';
import RellenarDatos from './vistas/rellenarDatos';
import RestablecerContraseña from './vistas/restablecerContraseña';


import Acerca from './vistas/acerca';

import Privacidad from './vistas/privacidad';



const App = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        navigate('/notas', { state: { uid: user.uid } }); // Redirige a notas.js con el uid
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="container">
      <img src={logo} alt="Logo" className="logo" />
      {!user && (
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
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registrar" element={<Registrar />} />
      <Route path="/notas" element={<Notas />} />
      <Route path="/newtask" element={<NewTask />} />
      <Route path="/ajustes" element={<Ajustes />} />
      <Route path="/notaseditar" element={<Notaseditar />} />
      <Route path="/calendario" element={<Calendario />} />
      <Route path="/rellenarDatos" element={<RellenarDatos />} />
      <Route path="/restablecerContraseña" element={<RestablecerContraseña />} />
      <Route path="/notificaciones" element={<Notificaciones />} />
      <Route path="/noti" element={<Noti />} />

      <Route path="/privacidad" element={<Privacidad />} />
      <Route path="/acerca" element={<Acerca />} />
    

    </Routes>
  </Router>,
  document.getElementById('root')
);
