import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../assets/images/Logo-google-icon-PNG.png';
import logo from '../assets/images/logo.jpeg'; // Importa tu logo
import { auth, db } from '../config/firebase';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/notas'); // Redirigir a notas si el usuario ya está autenticado
      }
    });
    
    return () => unsubscribe(); // Limpiar el listener
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/notas');
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'Usuarios', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        navigate('/notas');
      } else {
        navigate('/rellenarDatos');
      }
    } catch (err) {
      setError('Error al iniciar sesión con Google.');
    }
  };

  return (
    <div className="login-container">
      {/* Imagen que redirige al index */}
      <img
        src={logo}
        alt="Logo"
        className="logo-image"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer', width: '150px', marginBottom: '20px' }}
      />

      <h1>Iniciar Sesión</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
      <p className="or-text">- o -</p>

      <button onClick={handleGoogleLogin} className="google-login-button">
        <img src={googleLogo} alt="Google logo" className="google-icon" />
        Iniciar Sesión con Google
      </button>

      <p 
        className="forgot-password-text" 
        onClick={() => navigate('/restablecerContraseña')}
        style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
      >
        ¿Olvidaste tu contraseña?
      </p>
      <div className="back-container" onClick={() => navigate('/')}>
        <span className="back-arrow">←</span>
        <span className="back-text">Volver</span>
      </div>
    </div>
    
  );
};

export default Login;
