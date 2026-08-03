import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { claseBadgeEstado, formatoFecha } from '../utils';

export default function ClienteDetalle() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .get(`/clientes/${id}`)
      .then(({ data }) => setCliente(data))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <p className="loading">Cargando…</p>;
  if (!cliente) return <p className="empty-state">Cliente no encontrado.</p>;

  return (
    <div>
      <Link to="/clientes" style={{ fontSize: 13, color: 'var(--color-primary)' }}>
        ← Volver a clientes
      </Link>

      <div className="page-header" style={{ marginTop: 10 }}>
        <div>
          <h1>{cliente.nombre}</h1>
          <p>
            {cliente.tipo} · {cliente.telefono} ·{' '}
            {cliente.activo ? (
              <span className="badge badge-entregado">Activo</span>
            ) : (
              <span className="badge badge-inactivo">Dado de baja</span>
            )}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
        <div className="form-grid" style={{ fontSize: 14 }}>
          <div>
            <strong>Dirección:</strong> {cliente.direccion}
          </div>
          <div>
            <strong>Referencia:</strong> {cliente.referencia || '—'}
          </div>
          <div>
            <strong>Frecuencia habitual:</strong> {cliente.frecuencia_habitual || '—'}
          </div>
          <div>
            <strong>Cliente desde:</strong> {formatoFecha(cliente.fecha_registro)}
          </div>
          {cliente.observaciones && (
            <div className="field-full">
              <strong>Observaciones:</strong> {cliente.observaciones}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px 0' }}>
          <h2 style={{ fontSize: 16 }}>Historial de pedidos</h2>
        </div>
        {cliente.pedidos?.length === 0 ? (
          <p className="empty-state">Este cliente aún no tiene pedidos registrados.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha solicitud</th>
                <th>Bidones</th>
                <th>Estado</th>
                <th>Entrega real</th>
              </tr>
            </thead>
            <tbody>
              {cliente.pedidos?.map((p) => (
                <tr key={p.id_pedido}>
                  <td>{formatoFecha(p.fecha_solicitud)}</td>
                  <td>{p.cantidad_botellones}</td>
                  <td>
                    <span className={claseBadgeEstado(p.estado)}>{p.estado}</span>
                  </td>
                  <td>{formatoFecha(p.fecha_entrega_real)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
