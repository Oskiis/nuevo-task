import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import './restablecerContraseña.css';

const RestablecerContraseña = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(true);
  const navigate = useNavigate();

  const closeWarning = () => {
    setShowWarning(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Por favor ingresa un correo electrónico.');
      return;
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.includes('google.com')) {
        setError('Lo sentimos, no se puede restablecer la contraseña. Solo inicia sesión con tu cuenta de Google.');
        setMessage(''); // Asegúrate de limpiar el mensaje en caso de error
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      setError('');
    } catch (err) {
      console.error("Error en reset password:", err);
      if (err.code === 'auth/user-not-found') {
        setError('Lo sentimos, no se encontró tu correo en nuestro sistema.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo es inválido.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta nuevamente más tarde.');
      } else {
        setError('Error al enviar el correo de recuperación, intenta de nuevo más tarde.');
      }
      setMessage('');
    }
  };

  return (
    <div className="password-reset-container">
      <h1>Recuperar Contraseña</h1>
      <label className="label-email">Correo Electrónico</label>
      <input
        type="email"
        placeholder="Ingresa tu correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-email"
        required
      />
      <button onClick={handlePasswordReset} className="reset-button">
        Recuperar Contraseña
      </button>
      <div className="back-container" onClick={() => navigate('/login')}>
        <span className="back-arrow">←</span>
        <span className="back-text">Volver</span>
      </div>

      {/* Mostrar mensaje de éxito o error */}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Ventana emergente de advertencia al inicio */}
      {showWarning && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeWarning}>&times;</span>
            <p>¡Atención! Recuerda que si iniciaste sesión con el método de Google, no es necesario restablecer tu contraseña. Solo inicia sesión con tu cuenta de Google y no de la manera tradicional.</p>
            <button onClick={closeWarning} className="modal-button">Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestablecerContraseña;
