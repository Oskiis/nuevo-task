import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../assets/images/Logo-google-icon-PNG.png';
import logo from '../assets/images/logo.jpeg';
import { auth, db } from '../config/firebase';
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
  const googleProvider = new GoogleAuthProvider();

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
  
          try {
            
            const userDocRef = doc(db, 'Usuarios', user.uid);
            const userDocSnap = await getDoc(userDocRef);
  
            if (userDocSnap.exists()) {
              setError('Ya hay una cuenta con este correo, por favor proporciona un nuevo correo.');
              return;
            }
  
            let fotoPerfilURL = null;
  
            if (fotoPerfil) {
              const storageRef = ref(storage, `fotosPerfil/${user.uid}`);
              await uploadBytes(storageRef, fotoPerfil);
              fotoPerfilURL = await getDownloadURL(storageRef);
            }
  
            await setDoc(userDocRef, {
              uid: user.uid,
              nombre,
              apellidoPaterno,
              apellidoMaterno,
              email: user.email,
              fotoPerfil: fotoPerfilURL,
            });
  
            navigate('/');
          } catch (error) {
            setError('Error al procesar la solicitud: ' + error.message);
          }
        } else {
          setError('El correo electrónico no ha sido verificado. Intenta nuevamente.');
        }
      }, 3000);
  
    } catch (err) {
      
      if (err.code === 'auth/email-already-in-use') {
        setError('Ya existe una cuenta registrada con este correo. Por favor, utiliza otro correo.');
      } else {
        setError('Error al registrar: ' + err.message);
      }
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
    <div className="registrar-container">
     
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

      <p className="or-text">- o -</p>

      <button onClick={handleGoogleLogin} className="google-login-button">
        <img src={googleLogo} alt="Google logo" className="google-icon" />
        Iniciar Sesión con Google
      </button>
    </div>
  );
};

export default Registrar;
