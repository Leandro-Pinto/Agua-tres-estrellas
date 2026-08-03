import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ClienteFormModal from '../components/ClienteFormModal.jsx';

const TIPOS = ['Hogar', 'Oficina', 'Empresa', 'Institución'];

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('');
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  useEffect(() => {
    const t = setTimeout(cargar, 250); // pequeño debounce para la búsqueda (RF-04)
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tipo, incluirInactivos]);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get('/clientes', { params: { q, tipo, incluirInactivos } });
      setClientes(data);
    } finally {
      setCargando(false);
    }
  }

  function abrirNuevo() {
    setClienteEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(cliente) {
    setClienteEditando(cliente);
    setModalAbierto(true);
  }

  async function guardar(form) {
    if (clienteEditando) {
      await api.put(`/clientes/${clienteEditando.id_cliente}`, form);
    } else {
      await api.post('/clientes', form);
    }
    setModalAbierto(false);
    cargar();
  }

  async function darDeBaja(cliente) {
    if (!confirm(`¿Dar de baja a "${cliente.nombre}"? Su historial de pedidos se conserva.`)) return;
    await api.patch(`/clientes/${cliente.id_cliente}/baja`);
    cargar();
  }

  async function reactivar(cliente) {
    await api.patch(`/clientes/${cliente.id_cliente}/reactivar`);
    cargar();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Clientes</h1>
          <p>Registro, búsqueda y estado de tus clientes.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>
          + Nuevo cliente
        </button>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Buscar por nombre o teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--color-text-muted)' }}>
          <input type="checkbox" checked={incluirInactivos} onChange={(e) => setIncluirInactivos(e.target.checked)} />
          Incluir dados de baja
        </label>
      </div>

      <div className="card">
        {cargando ? (
          <p className="loading" style={{ padding: 20 }}>
            Cargando…
          </p>
        ) : clientes.length === 0 ? (
          <p className="empty-state">No se encontraron clientes con esos filtros.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Teléfono</th>
                <th>Frecuencia</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id_cliente}>
                  <td>
                    <Link to={`/clientes/${c.id_cliente}`} style={{ fontWeight: 600, textDecoration: 'none' }}>
                      {c.nombre}
                    </Link>
                  </td>
                  <td>{c.tipo}</td>
                  <td>{c.telefono}</td>
                  <td>{c.frecuencia_habitual || '—'}</td>
                  <td>
                    {c.activo ? (
                      <span className="badge badge-entregado">Activo</span>
                    ) : (
                      <span className="badge badge-inactivo">Dado de baja</span>
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(c)}>
                      Editar
                    </button>
                    {c.activo ? (
                      <button className="btn btn-danger btn-sm" onClick={() => darDeBaja(c)}>
                        Dar de baja
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => reactivar(c)}>
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <ClienteFormModal cliente={clienteEditando} onClose={() => setModalAbierto(false)} onSave={guardar} />
      )}
    </div>
  );
}
