import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";

import { FaFacebook, FaGoogle } from "react-icons/fa"; // Iconos de Facebook y Google
import "./login.css";
import "../assets/images/logo.jpeg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        // Aquí puedes manejar el "Recordarme" con localStorage o cookies si es necesario
      }
      navigate("/");
    } catch (err) {
      setError("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="login-page">
    
      <div className="form-container">
        <div className="login-box">
          <img
            src={require("../assets/images/logo.jpeg")}
            alt="logo"
            onClick={() => navigate("/")} // Redirige al inicio al hacer clic
            style={{ cursor: "pointer" }} // Cambia el cursor a pointer para indicar que es clickeable
          />
          
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

          {/* Botón de "Olvidé mi contraseña" */}
          <div className="forgot-password">
            <button type="button" onClick={() => navigate("/reset-password")}>
              Olvidé mi contraseña
            </button>
          </div>

          {/* Casilla de verificación "Recordarme" */}
          <div className="remember-me">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Recordarme
            </label>
          </div>

          {/* Separador con "OR" */}
          <div className="separator">
            <span>OR</span>
          </div>

          {/* Botones de inicio de sesión con Facebook y Google */}
          <div className="social-login">
            <button type="button" className="facebook-login">
              <FaFacebook className="social-icon" /> Continuar con Facebook
            </button>
            <button type="button" className="google-login">
              <FaGoogle className="social-icon" /> Continuar con Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
