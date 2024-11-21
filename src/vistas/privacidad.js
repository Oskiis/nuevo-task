import { EmailAuthProvider, getAuth, reauthenticateWithCredential, signOut, updatePassword } from 'firebase/auth'; // Para autenticación
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import 'react-calendar/dist/Calendar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './ajustes.css';

const Privacidad = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uid = location.state?.uid;

  const [tareas, setTareas] = useState([]);
  const [date, setDate] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [contraseñaAnterior, setContraseñaAnterior] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [confirmarCambio, setConfirmarCambio] = useState(false); 
  
  const db = getFirestore();
  const auth = getAuth();


  
  useEffect(() => {
    const fetchUsuario = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'Usuarios', user.uid));
          setUsuario(userDoc.data());
        } catch (error) {
          console.error("Error al cargar usuario:", error);
        }
      }
    };

    fetchUsuario();
  }, [auth.currentUser]);

  // Cerrar sesión
  const handleCerrarSesion = () => {
    signOut(auth)
      .then(() => {
        console.log('Sesión cerrada');
        navigate('/');
      })
      .catch(error => console.error('Error al cerrar sesión:', error));
  };

  const handleMouseEnter = () => setMostrarPerfil(true);

 
  const handleMouseLeave = () => setTimeout(() => setMostrarPerfil(false), 5000);

  const puedeCambiarContrasena = usuario && usuario.email && auth.currentUser.providerData[0].providerId === 'password';


  const handleSubmitNewPassword = async () => {
    if (nuevaContrasena.trim() === '') {
      setMensajeError('La nueva contraseña no puede estar vacía.');
      return;
    }
  
    if (nuevaContrasena.length < 6) {
      setMensajeError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
  
    const user = auth.currentUser;
  
    try {
      if (puedeCambiarContrasena) {
       
        const credential = EmailAuthProvider.credential(user.email, contraseñaAnterior); 
        await reauthenticateWithCredential(user, credential); 
  
    
        await updatePassword(user, nuevaContrasena); 
        console.log('Contraseña cambiada exitosamente');
        alert('Contraseña cambiada exitosamente.');
      } else {
        setMensajeError('No puedes cambiar tu contraseña ya que el inicio de sesión fue realizado con Google.');
      }
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
  
      
      setMensajeError(`Error: ${error.code} - ${error.message}`);
  
      if (error.code === 'auth/wrong-password') {
        setMensajeError('La contraseña anterior no es correcta.');
      } else {
        setMensajeError('Hubo un error al intentar cambiar la contraseña.');
      }
    }
  };

  
  const handleConfirmarCambio = () => {
    setConfirmarCambio(true);
  };

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
          <h1 className="header-title">Privacidad y Seguridad</h1>
        </div>
        <div className="header-right">
          {usuario && (
            <img
              src={usuario.fotoPerfil}
              alt="Foto de perfil"
              className="perfil-imagen"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </div>
      </header>

  
      {mostrarPerfil && usuario && (
        <div className="perfil-popup">
          <p>Correo electrónico: {usuario.email}</p>
          <div className="perfil-popup-image">
            <img src={usuario.fotoPerfil} alt="Foto de perfil" />
          </div>
          <p>Hola, {usuario.nombre}</p>
          <button className="cerrar-sesion-btn" onClick={handleCerrarSesion}>Cerrar sesión</button>
        </div>
      )}

      <nav className={`menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/notas" state={{ uid }}>Notas y Tareas</Link></li>
          <li><Link to="/ajustes">Informacion Personal</Link></li>
          <li><Link to="/privacidad" state={{ uid }}>Privacidad y seguridad</Link></li>
          <li><Link to="/acerca" state={{ uid }}>Acerca de</Link></li>
        </ul>
      </nav>

      <div className="ajustes-container">
        <h2 className="ajustes-subtitle">Privacidad y Seguridad</h2>

        {puedeCambiarContrasena ? (
          <div className="ajustes-seccion">
            <h3 className="ajustes-seccion-title">Cambio de Contraseña</h3>
            
     
            {!confirmarCambio ? (
              <div className="ajustes-campo">
                <p>¿Quieres cambiar tu contraseña? Esta acción te permitirá actualizar tu contraseña de seguridad para acceder a tu cuenta. Si estás listo para hacerlo, por favor presiona el botón a continuación.</p>
                <button className="ajustes-guardar" onClick={handleConfirmarCambio}>Sí, quiero cambiar mi contraseña</button>
              </div>
            ) : (
              <div>
                <div className="ajustes-campo">
                  <label htmlFor="contraseñaAnterior">Contraseña Anterior:</label>
                  <input
                    type="password"
                    id="contraseñaAnterior"
                    value={contraseñaAnterior}
                    onChange={(e) => setContraseñaAnterior(e.target.value)}
                    placeholder="Ingresa tu contraseña anterior"
                  />
                </div>
                <div className="ajustes-campo">
                  <label htmlFor="nuevaContrasena">Nueva Contraseña:</label>
                  <input
                    type="password"
                    id="nuevaContrasena"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                  />
                </div>
                <button className="ajustes-guardar" onClick={handleSubmitNewPassword}>Cambiar Contraseña</button>
                {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="ajustes-seccion">
            <h3 className="ajustes-seccion-title">Cambio de Contraseña no disponible</h3>
            <p>No puedes cambiar tu contraseña ya que el inicio de sesión fue realizado con Google. Si necesitas ayuda, contacta con nuestro soporte técnico.</p>
          </div>
        )}
      </div>
      <div className="crear-tarea">
        <button
          className="crear-tarea-button"
          onClick={() => navigate('/ajustes', { state: { uid } })}
        >
          ⇚
        </button>
      </div>
    </div>
  );
};

export default Privacidad;
