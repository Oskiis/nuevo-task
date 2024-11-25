import { getAuth, signOut } from 'firebase/auth'; // Para autenticación
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'; // Para Firestore
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import 'react-calendar/dist/Calendar.css'; // Estilos del calendario
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Navegación
import './ajustes.css'; // Estilos personalizados

const Ajustes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uid = location.state?.uid;

  const [usuario, setUsuario] = useState(null);
  const [nuevaFoto, setNuevaFoto] = useState(null);
  const [cambios, setCambios] = useState({});
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage();

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUsuario = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'Usuarios', user.uid));
          setUsuario(userDoc.data());
        } catch (error) {
          console.error('Error al cargar usuario:', error);
        }
      }
    };

    fetchUsuario();
  }, [auth.currentUser]);

  const handleChange = (field, value) => {
    setCambios({ ...cambios, [field]: value });
  };

  const handleGuardarCambios = async () => {
    if (!uid || Object.keys(cambios).length === 0) return;

    try {
      await updateDoc(doc(db, 'Usuarios', uid), cambios);
      alert('¡Cambios guardados correctamente!');
      setCambios({});
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      alert('Hubo un problema al guardar los cambios.');
    }
  };

  // Subir nueva imagen de perfil
  const handleSubirImagen = async (file) => {
    if (!file || !uid) return;

    try {
      const imageRef = ref(storage, `fotosPerfil/${uid}_${file.name}`);
      await uploadBytes(imageRef, file); // Subir la imagen
      const imageUrl = await getDownloadURL(imageRef); // Obtener la URL de descarga

      // Actualizar Firestore con la nueva URL
      await updateDoc(doc(db, 'Usuarios', uid), { fotoPerfil: imageUrl });

      setNuevaFoto(imageUrl); // Actualizar la vista en tiempo real
      alert('Imagen subida correctamente');
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      alert('Hubo un problema al subir la imagen.');
    }
  };

  // Cerrar sesión
  const handleCerrarSesion = () => {
    signOut(auth)
      .then(() => {
        console.log('Sesión cerrada');
        navigate('/');
      })
      .catch((error) => console.error('Error al cerrar sesión:', error));
  };

  // Mostrar cuadro del perfil
  const handleMouseEnter = () => setMostrarPerfil(true);

  // Ocultar cuadro del perfil
  const handleMouseLeave = () => setTimeout(() => setMostrarPerfil(false), 5000);

  return (
    <div className="notas-container">
      {/* Menú de navegación */}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}></div>
      <header className="header">
        <div className="header-left">
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <h1 className="header-title">Información Personal</h1>
        </div>
        <div className="header-right">
          {usuario && (
            <img
              src={nuevaFoto || usuario.fotoPerfil || 'default-avatar.png'}
              alt="Foto de perfil"
              className="perfil-imagen"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </div>
      </header>

      {/* Cuadro del perfil */}
      {mostrarPerfil && usuario && (
        <div className="perfil-popup">
          <p>Correo electrónico: {usuario.email}</p>
          <div className="perfil-popup-image">
            <img src={nuevaFoto || usuario.fotoPerfil} alt="Foto de perfil" />
          </div>
          <p>Hola, {usuario.nombre}</p>
          <button className="cerrar-sesion-btn" onClick={handleCerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      )}

      <nav className={`menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/notas" state={{ uid }}>Notas y Tareas</Link></li>
          <li><Link to="/ajustes">Información Personal</Link></li>
          <li><Link to="/privacidad" state={{ uid }}>Privacidad y seguridad</Link></li>
          <li><Link to="/acerca" state={{ uid }}>Acerca de</Link></li>
          <button className="cerrar-sesion-btn" onClick={handleCerrarSesion}>Cerrar sesión</button>
        </ul>
      </nav>

      <div className="ajustes-container">
        <div className="ajustes-content">
          <h1 className="ajustes-subtitle">Tu información personal</h1>
          <h2 className="ajustes-subtitle">
            Aquí puedes cambiar tu nombre, apellidos, foto de perfil y más
          </h2>
          <div className="ajustes-seccion">
            <h3 className="ajustes-seccion-title">Información Básica</h3>
            <div className="ajustes-campo">
              <label>Foto de Perfil</label>
              <div className="ajustes-foto">
                <img
                  src={nuevaFoto || usuario?.fotoPerfil || 'default-avatar.png'}
                  alt="Foto de perfil"
                  className="ajustes-imagen"
                />
                <input
                  type="file"
                  id="upload-input"
                  style={{ display: 'none' }}
                  onChange={(e) => handleSubirImagen(e.target.files[0])}
                />
                <button onClick={() => document.getElementById('upload-input').click()}>
                  Cargar Imagen
                </button>
              </div>
            </div>
            <div className="ajustes-campo">
              <label>Nombre</label>
              <input
                type="text"
                defaultValue={usuario?.nombre || ''}
                onChange={(e) => handleChange('nombre', e.target.value)}
              />
            </div>
            <div className="ajustes-campo">
              <label>Apellido Paterno</label>
              <input
                type="text"
                defaultValue={usuario?.apellidoPaterno || ''}
                onChange={(e) => handleChange('apellidoPaterno', e.target.value)}
              />
            </div>
            <div className="ajustes-campo">
              <label>Apellido Materno</label>
              <input
                type="text"
                defaultValue={usuario?.apellidoMaterno || ''}
                onChange={(e) => handleChange('apellidoMaterno', e.target.value)}
              />
            </div>
          </div>
        </div>
        <button className="ajustes-guardar" onClick={handleGuardarCambios}>
          Guardar Cambios
        </button>
      </div>

      {/* Contenedor del calendario */}
      <div className="crear-tarea">
        <button
          className="crear-tarea-button"
          onClick={() => navigate('/notas', { state: { uid } })}
        >
          ⇚
        </button>
      </div>
    </div>
  );
};

export default Ajustes;
