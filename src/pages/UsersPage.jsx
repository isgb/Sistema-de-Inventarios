/**
 * @fileoverview Página de gestión de usuarios.
 * Permite listar, crear y editar usuarios (nombre, email, contraseña, estado).
 * Accesible para ADMIN y SUPER_ADMIN.
 */

import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUsers, createUser, updateUser } from '../services/user.service';
import { getRoles, assignRole, revokeRole } from '../services/role.service';
import EmptyState from '../components/common/EmptyState';
import toast, { Toaster } from 'react-hot-toast';

const PAGE_SIZE = 10;
const INITIAL_CREATE_FORM = { name: '', email: '', password: '', roleName: 'USER' };
const AVAILABLE_ROLES = ['USER', 'MANAGER', 'ADMIN'];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo', color: 'bg-success' },
  { value: 'inactive', label: 'Inactivo', color: 'bg-secondary' },
  { value: 'blocked', label: 'Bloqueado', color: 'bg-danger' },
];

export default function UsersPage() {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ ...INITIAL_CREATE_FORM });
  const [submitting, setSubmitting] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', status: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const [roles, setRoles] = useState([]);
  const [roleToAssign, setRoleToAssign] = useState({});
  const [roleActionUserId, setRoleActionUserId] = useState(null);

  const canEdit = hasRole('ADMIN', 'SUPER_ADMIN');
  // El backend solo otorga el permiso users:assign-role a SUPER_ADMIN (ver seed.js).
  const canManageRoles = hasRole('SUPER_ADMIN');

  useEffect(() => {
    loadUsers(1, false);
    if (canManageRoles) {
      getRoles().then(setRoles).catch(() => {});
    }
  }, [canManageRoles]);

  /**
   * Carga una página de usuarios. Con append=true agrega al final de la lista
   * actual (botón "Cargar más"); con append=false reemplaza la lista (carga
   * inicial o refresco tras crear/editar/asignar rol).
   */
  async function loadUsers(targetPage = 1, append = false) {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const result = await getUsers({ page: targetPage, limit: PAGE_SIZE });
      setUsers((prev) => (append ? [...prev, ...result.items] : result.items));
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // --- Asignar / revocar roles ---

  async function handleAssignRole(userId) {
    const roleId = roleToAssign[userId];
    if (!roleId) { toast.error('Selecciona un rol'); return; }

    setRoleActionUserId(userId);
    try {
      await assignRole(userId, roleId);
      toast.success('Rol asignado');
      setRoleToAssign((prev) => ({ ...prev, [userId]: '' }));
      loadUsers(1, false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRoleActionUserId(null);
    }
  }

  async function handleRevokeRole(userId, roleName) {
    const role = roles.find((r) => r.name === roleName);
    if (!role) return;
    if (!window.confirm(`¿Revocar el rol ${roleName}?`)) return;

    setRoleActionUserId(userId);
    try {
      await revokeRole(userId, role._id);
      toast.success('Rol revocado');
      loadUsers(1, false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRoleActionUserId(null);
    }
  }

  // --- Crear usuario ---

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Completa todos los campos');
      return;
    }
    if (createForm.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await createUser(createForm);
      toast.success('Usuario creado exitosamente');
      setCreateForm({ ...INITIAL_CREATE_FORM });
      setShowCreateForm(false);
      loadUsers(1, false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Editar usuario ---

  function startEditing(user) {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      password: '',
      status: user.status,
    });
    setShowCreateForm(false);
  }

  function cancelEditing() {
    setEditingUser(null);
    setEditForm({ name: '', email: '', password: '', status: '' });
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e?.preventDefault();
    if (!editForm.name || !editForm.email) {
      toast.error('Nombre y email son obligatorios');
      return;
    }
    if (editForm.password && editForm.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const dataToSend = {
      name: editForm.name,
      email: editForm.email,
      status: editForm.status,
    };
    if (editForm.password) {
      dataToSend.password = editForm.password;
    }

    setSavingEdit(true);
    try {
      await updateUser(editingUser, dataToSend);
      toast.success('Usuario actualizado exitosamente');
      cancelEditing();
      loadUsers(1, false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div>
      <Toaster position="top-center" />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Usuarios</h4>
          <p className="text-muted mb-0 small">{total} usuarios registrados</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { setShowCreateForm(!showCreateForm); cancelEditing(); }}
        >
          <i className={`bi ${showCreateForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
          {showCreateForm ? 'Cancelar' : 'Nuevo Usuario'}
        </button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="stat-card mb-4">
          <h6 className="fw-bold mb-3"><i className="bi bi-person-plus me-2"></i>Crear Usuario</h6>
          <form onSubmit={handleCreateSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Nombre</label>
                <input type="text" name="name" className="form-control form-control-sm" value={createForm.name} onChange={handleCreateChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Email</label>
                <input type="email" name="email" className="form-control form-control-sm" value={createForm.email} onChange={handleCreateChange} />
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-semibold">Contraseña</label>
                <input type="password" name="password" className="form-control form-control-sm" value={createForm.password} onChange={handleCreateChange} />
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-semibold">Rol</label>
                <select name="roleName" className="form-select form-select-sm" value={createForm.roleName} onChange={handleCreateChange}>
                  {AVAILABLE_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn btn-success btn-sm w-100" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de usuarios */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 small">Cargando usuarios...</p>
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon="bi-people" message="No hay usuarios registrados" />
      ) : (
        <div className="table-wrapper">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  {canEdit && <th className="text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const statusOption = STATUS_OPTIONS.find((s) => s.value === user.status) || STATUS_OPTIONS[0];
                  const isBeingEdited = editingUser === user._id;
                  const columnCount = 5 + (canEdit ? 1 : 0);
                  return (
                    <Fragment key={user._id}>
                    <tr className={isBeingEdited ? 'table-warning' : ''}>
                      <td className="fw-semibold">
                        {isBeingEdited ? (
                          <input
                            type="text"
                            name="name"
                            className="form-control form-control-sm"
                            value={editForm.name}
                            onChange={handleEditChange}
                            disabled={savingEdit}
                            autoFocus
                          />
                        ) : user.name}
                      </td>
                      <td className="text-muted">
                        {isBeingEdited ? (
                          <input
                            type="email"
                            name="email"
                            className="form-control form-control-sm"
                            value={editForm.email}
                            onChange={handleEditChange}
                            disabled={savingEdit}
                          />
                        ) : user.email}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1 mb-1">
                          {(user.roles || []).map((role) => (
                            <span key={role} className="badge bg-primary d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                              {role}
                              {canManageRoles && (
                                <i
                                  className="bi bi-x-circle-fill"
                                  style={{ cursor: 'pointer' }}
                                  title="Revocar rol"
                                  onClick={() => handleRevokeRole(user._id, role)}
                                ></i>
                              )}
                            </span>
                          ))}
                        </div>
                        {canManageRoles && (
                          <div className="d-flex gap-1">
                            <select
                              className="form-select form-select-sm"
                              style={{ fontSize: '0.7rem', maxWidth: 120 }}
                              value={roleToAssign[user._id] || ''}
                              onChange={(e) => setRoleToAssign((prev) => ({ ...prev, [user._id]: e.target.value }))}
                            >
                              <option value="">+ Asignar rol...</option>
                              {roles
                                .filter((r) => !(user.roles || []).includes(r.name))
                                .map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                            </select>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              style={{ fontSize: '0.7rem' }}
                              disabled={roleActionUserId === user._id || !roleToAssign[user._id]}
                              onClick={() => handleAssignRole(user._id)}
                            >
                              <i className="bi bi-plus-lg"></i>
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        {isBeingEdited ? (
                          <select
                            name="status"
                            className="form-select form-select-sm"
                            style={{ fontSize: '0.7rem' }}
                            value={editForm.status}
                            onChange={handleEditChange}
                            disabled={savingEdit}
                          >
                            {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        ) : (
                          <span className={`badge ${statusOption.color}`} style={{ fontSize: '0.7rem' }}>
                            {statusOption.label}
                          </span>
                        )}
                      </td>
                      <td className="small text-muted">
                        {new Date(user.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      {canEdit && (
                        <td className="text-center">
                          {isBeingEdited ? (
                            <div className="d-flex gap-1 justify-content-center">
                              <button
                                className="btn btn-success btn-sm"
                                title="Guardar"
                                disabled={savingEdit}
                                onClick={handleEditSubmit}
                              >
                                {savingEdit ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check-lg"></i>}
                              </button>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                title="Cancelar"
                                disabled={savingEdit}
                                onClick={cancelEditing}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-outline-warning btn-sm"
                              title="Editar usuario"
                              onClick={() => startEditing(user)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                    {isBeingEdited && (
                      <tr className="table-warning">
                        <td colSpan={columnCount} className="pt-0">
                          <div className="d-flex align-items-end gap-2 flex-wrap py-2">
                            <div>
                              <label className="form-label small fw-semibold mb-1">Nueva contraseña</label>
                              <input
                                type="password"
                                name="password"
                                className="form-control form-control-sm"
                                style={{ maxWidth: 220 }}
                                placeholder="Dejar vacío para no cambiar"
                                value={editForm.password}
                                onChange={handleEditChange}
                                disabled={savingEdit}
                              />
                            </div>
                            <div className="form-text mb-1" style={{ fontSize: '0.72rem' }}>
                              <i className="bi bi-info-circle me-1"></i>
                              Si no deseas cambiar la contraseña, deja el campo vacío.
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">Mostrando {users.length} de {total} usuarios</span>
            {page < totalPages && (
              <button className="btn btn-outline-primary btn-sm" disabled={loadingMore} onClick={() => loadUsers(page + 1, true)}>
                {loadingMore ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-arrow-down-circle me-1"></i>}
                Cargar más
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
