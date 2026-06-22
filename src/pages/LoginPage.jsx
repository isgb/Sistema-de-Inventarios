/**
 * @fileoverview Página de inicio de sesión.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Formulario de login con validación y feedback visual.
 * @returns {JSX.Element}
 */
export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Maneja cambios en los campos del formulario.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Envía las credenciales al servicio de autenticación.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Completa todos los campos');
      return;
    }
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success('Bienvenido');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <Toaster position="top-center" />
      <div className="auth-card">
        <div className="brand-logo">
          <i className="bi bi-box-seam"></i>
        </div>
        <h2>Iniciar Sesión</h2>
        <p className="subtitle">Accede a tu panel de inventarios</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Correo electrónico</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email"
                name="email"
                className="form-control border-start-0"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type="password"
                name="password"
                className="form-control border-start-0"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <p className="text-center mb-1 small">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-decoration-none fw-semibold">
            Regístrate aquí
          </Link>
        </p>

        <div className="mt-3 p-2 bg-light rounded text-center" style={{ fontSize: '0.78rem' }}>
          <strong>Demo:</strong> admin@inventario.com / 123456
        </div>
      </div>
    </div>
  );
}
