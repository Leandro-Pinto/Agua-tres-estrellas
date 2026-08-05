import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { formatoFecha } from '../utils';

export default function Reportes() {
  const [porTipo, setPorTipo] = useState([]);
  const [inactivos, setInactivos] = useState(null);
  const [prediccion, setPrediccion] = useState(null);
  const [topBidones, setTopBidones] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reportes/clientes-por-tipo'),
      api.get('/reportes/clientes-inactivos'),
      api.get('/reportes/prediccion-consumo'),
      api.get('/reportes/top-bidones'),
    ])
      .then(([r1, r2, r3, r4]) => {
        setPorTipo(r1.data);
        setInactivos(r2.data);
        setPrediccion(r3.data);
        setTopBidones(r4.data);
      })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="loading">Cargando reportes…</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reportes</h1>
          <p>Indicadores para apoyar la toma de decisiones (RF-15, RF-16, RF-17).</p>
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16 }}>Clientes por tipo</h2>
        <div className="stat-grid" style={{ marginTop: 12, marginBottom: 0 }}>
          {porTipo.map((row) => (
            <div key={row.tipo} className="card stat-card">
              <div className="stat-value">{row.dataValues ? row.dataValues.total : row.total}</div>
              <div className="stat-label">{row.tipo}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16 }}>
          Clientes inactivos <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--color-text-muted)' }}>(RF-16)</span>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Umbrales actuales (días sin pedido, según frecuencia): Semanal {inactivos?.umbral_dias?.Semanal}, Quincenal{' '}
          {inactivos?.umbral_dias?.Quincenal}, Mensual {inactivos?.umbral_dias?.Mensual}, Ocasional{' '}
          {inactivos?.umbral_dias?.Ocasional}.
        </p>

        {inactivos?.clientes?.length === 0 ? (
          <p className="empty-state">No hay clientes inactivos por el momento. 🎉</p>
        ) : (
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Frecuencia</th>
                <th>Última entrega</th>
                <th>Días sin pedido</th>
              </tr>
            </thead>
            <tbody>
              {inactivos?.clientes?.map((c) => (
                <tr key={c.id_cliente}>
                  <td>{c.nombre}</td>
                  <td>{c.frecuencia_habitual}</td>
                  <td>{formatoFecha(c.ultima_entrega)}</td>
                  <td>
                    <strong>{c.dias_sin_pedido}</strong> / {c.umbral_dias} días
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16 }}>Predicción de consumo de agua</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Modelo mejorado tipo perceptrón simple: combina frecuencia, recencia, volumen de botellones, estabilidad del patrón y tipo de cliente para estimar la probabilidad de consumo activo.
        </p>

        <table className="table" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Frecuencia</th>
              <th>Probabilidad</th>
              <th>Estado</th>
              <th>Días sin pedido</th>
            </tr>
          </thead>
          <tbody>
            {prediccion?.clientes?.map((c) => (
              <tr key={c.id_cliente}>
                <td>{c.nombre}</td>
                <td>{c.tipo}</td>
                <td>{c.frecuencia_habitual}</td>
                <td>{c.probabilidad_consumo != null ? `${(c.probabilidad_consumo * 100).toFixed(0)}%` : '—'}</td>
                <td>{c.estado}</td>
                <td>{c.dias_sin_pedido ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <h2 style={{ fontSize: 16 }}>
          Top clientes por bidones ({topBidones?.mes})
          <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--color-text-muted)' }}> (RF-17)</span>
        </h2>
        {topBidones?.ranking?.length === 0 ? (
          <p className="empty-state">Aún no hay pedidos registrados este mes.</p>
        ) : (
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Bidones en el mes</th>
              </tr>
            </thead>
            <tbody>
              {topBidones?.ranking?.map((row, i) => (
                <tr key={row.id_cliente}>
                  <td>{i + 1}</td>
                  <td>{row.cliente?.nombre}</td>
                  <td>{row.cliente?.tipo}</td>
                  <td>
                    <strong>{row.dataValues ? row.dataValues.total_botellones : row.total_botellones}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
