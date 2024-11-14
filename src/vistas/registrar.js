import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import logo from '../assets/images/logo.jpeg'; // Importa tu logo
import './registrar.css';

const Registrar = () => {
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const storage = getStorage();

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      setSuccess('Se ha enviado un correo de verificación. Por favor, verifica tu cuenta antes de continuar.');

      const interval = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(interval);

          if (fotoPerfil) {
            const storageRef = ref(storage, `fotosPerfil/${user.uid}`);
            await uploadBytes(storageRef, fotoPerfil);
          }

          await setDoc(doc(db, 'Usuarios', user.uid), {
            uid: user.uid,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            email,
            fotoPerfil: fotoPerfil ? `fotosPerfil/${user.uid}` : null,
          });

          navigate('/');
        }
      }, 3000);
    } catch (err) {
      setError('Error al registrar: ' + err.message);
    }
  };

  return (
    <div className="registrar-container">
      {/* Imagen que redirige al index */}
      <img
        src={logo}
        alt="Logo"
        className="logo-image"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer', width: '150px', marginBottom: '20px' }}
      />

      <h1>Registrar Cuenta</h1>
      {error && <p className="error">{error}</p>}
      {success && (
        <div className="modal">
          <div className="modal-content">
            <p>{success}</p>
            <button onClick={() => setSuccess('')} className="modal-button">Aceptar</button>
          </div>
        </div>
      )}
      <form onSubmit={handleRegistro}>
        <input
          type="text"
          placeholder="Nombre(s)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellido Paterno"
          value={apellidoPaterno}
          onChange={(e) => setApellidoPaterno(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellido Materno"
          value={apellidoMaterno}
          onChange={(e) => setApellidoMaterno(e.target.value)}
          required
        />
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
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFotoPerfil(e.target.files[0])}
        />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Registrar;
