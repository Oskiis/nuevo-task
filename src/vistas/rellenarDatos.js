import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';

const RellenarDatos = () => {
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const storage = getStorage();

  const handleGuardarDatos = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    // Validar que todos los campos estén llenos
    if (!nombre || !apellidoPaterno || !apellidoMaterno) {
      setError('Es necesario que llene todos los datos para avanzar.');
      return;
    }

    try {
      setError(''); // Limpiar cualquier error previo
      let fotoPerfilURL = null;

      if (fotoPerfil) {
        const storageRef = ref(storage, `fotosPerfil/${user.uid}`);
        await uploadBytes(storageRef, fotoPerfil);
        fotoPerfilURL = await getDownloadURL(storageRef);
      }

      await setDoc(doc(db, 'Usuarios', user.uid), {
        uid: user.uid,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        email: user.email,
        fotoPerfil: fotoPerfilURL,
      });

      navigate('/notas');
    } catch (err) {
      setError('Error al guardar datos: ' + err.message);
    }
  };

  return (
    <div className="rellenar-datos-container">
      <h1>Rellena tus Datos</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleGuardarDatos}>
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
          type="file"
          accept="image/*"
          onChange={(e) => setFotoPerfil(e.target.files[0])}
        />
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default RellenarDatos;
