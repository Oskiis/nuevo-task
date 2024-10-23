import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { FaUserCircle } from 'react-icons/fa'; // Icono de avatar
import './login.css';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); 
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="login-page">
      <div className="image-container">
        <img src="assets/images/logo.jpeg" alt="logo" />
      </div>
      <div className="form-container">
        <div className="login-box">
          <FaUserCircle className="avatar-icon" />
          <h1>Inicia sesión</h1>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="0100047452"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Iniciar sesión</button>
          </form>
       
        </div>
      </div>
    </div>
  );
};

export default Login;
