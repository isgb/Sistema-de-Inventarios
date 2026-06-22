/**
 * @fileoverview Página de registro de nuevo usuario.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Formulario de registro con validación básica.
 * @returns {JSX.Element}
 */
export default function RegisterPage() {

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  /** @param {React.ChangeEvent<HTMLInputElement>} e */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /** @param {React.FormEvent} e */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error('Completa todos los campos');
      return;
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Cuenta creada exitosamente');
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
          <i className="bi bi-person-plus"></i>
        </div>
        <h2>Crear Cuenta</h2>
        <p className="subtitle">Regístrate para acceder al sistema</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Nombre completo</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-person text-muted"></i>
              </span>
              <input
                type="text"
                name="name"
                className="form-control border-start-0"
                placeholder="Tu nombre"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          </div>

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

          <div className="mb-3">
            <label className="form-label small fw-semibold">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type="password"
                name="password"
                className="form-control border-start-0"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Confirmar contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-lock-fill text-muted"></i>
              </span>
              <input
                type="password"
                name="confirmPassword"
                className="form-control border-start-0"
                placeholder="Repite tu contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
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
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <p className="text-center mb-0 small">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-decoration-none fw-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
