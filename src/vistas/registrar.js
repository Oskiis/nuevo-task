// src/vistas/registrar.js
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';

const Registrar = () => {
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const storage = getStorage();

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Subir foto de perfil a Firebase Storage
      if (fotoPerfil) {
        const storageRef = ref(storage, `fotosPerfil/${user.uid}`);
        await uploadBytes(storageRef, fotoPerfil);
      }

      // Almacenar datos del usuario en Firestore
      await setDoc(doc(db, 'Usuarios', user.uid), {
        uid: user.uid,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        email,
        contraseña: password, // Considera usar un hash en lugar de almacenar la contraseña en texto plano
        fotoPerfil: `fotosPerfil/${user.uid}` // Referencia a la foto de perfil en Storage
      });

      navigate('/'); // Redirigir a la página principal
    } catch (err) {
      setError('Error al registrar: ' + err.message);
    }
  };

  return (
    <div className="registrar-container">
      <h1>Registrar Cuenta</h1>
      {error && <p className="error">{error}</p>}
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
          required
        />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Registrar;
