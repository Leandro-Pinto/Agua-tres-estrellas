import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { claseBadgeEstado, formatoFecha } from '../utils';

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [activos, setActivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [r1, r2] = await Promise.all([api.get('/dashboard/resumen'), api.get('/dashboard/activos')]);
      setResumen(r1.data);
      setActivos(r2.data);
    } catch (err) {
      setError('No se pudo cargar el panel. Verifica que el servidor esté corriendo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Panel general</h1>
          <p>Resumen de pedidos y clientes en tiempo real.</p>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {cargando && <p className="loading">Cargando…</p>}

      {resumen && (
        <>
          <div className="stat-grid">
            {resumen.pedidos_por_estado.map((p) => (
              <div key={p.estado} className="card stat-card">
                <div className="stat-value">{p.total}</div>
                <div className="stat-label">{p.estado}</div>
              </div>
            ))}
            <div className="card stat-card">
              <div className="stat-value">{resumen.total_clientes_activos}</div>
              <div className="stat-label">Clientes activos</div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 20px' }}>
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>Pedidos activos (pendientes de entrega)</h2>
            {activos.length === 0 ? (
              <p className="empty-state">No hay pedidos pendientes por el momento.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Bidones</th>
                    <th>Estado</th>
                    <th>Fecha de solicitud</th>
                  </tr>
                </thead>
                <tbody>
                  {activos.map((p) => (
                    <tr key={p.id_pedido}>
                      <td>{p.cliente?.nombre}</td>
                      <td>{p.cantidad_botellones}</td>
                      <td>
                        <span className={claseBadgeEstado(p.estado)}>{p.estado}</span>
                      </td>
                      <td>{formatoFecha(p.fecha_solicitud)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
