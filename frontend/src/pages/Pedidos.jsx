import React, { useEffect, useState } from 'react';
import api from '../api/client';
import PedidoFormModal from '../components/PedidoFormModal.jsx';
import { ESTADOS, formatoFecha, siguienteEstado } from '../utils';

export default function Pedidos() {
  const [tablero, setTablero] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get('/pedidos/tablero');
      setTablero(data);
    } catch (err) {
      setError('No se pudo cargar el tablero de pedidos.');
    } finally {
      setCargando(false);
    }
  }

  async function crear(form) {
    await api.post('/pedidos', form);
    setModalAbierto(false);
    cargar();
  }

  async function avanzar(pedido) {
    const nuevo = siguienteEstado(pedido.estado);
    if (!nuevo) return;
    await api.patch(`/pedidos/${pedido.id_pedido}/estado`, { estado: nuevo });
    cargar();
  }

  async function retroceder(pedido) {
    const idx = ESTADOS.indexOf(pedido.estado);
    if (idx <= 0) return;
    const anterior = ESTADOS[idx - 1];
    if (!confirm(`¿Retroceder este pedido a "${anterior}"? Úsalo solo para corregir un error de registro.`)) return;
    await api.patch(`/pedidos/${pedido.id_pedido}/estado`, { estado: anterior, forzar: true });
    cargar();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pedidos</h1>
          <p>Tablero del embudo del CRM: arrastra el avance manualmente con los botones de cada tarjeta.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalAbierto(true)}>
          + Nuevo pedido
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {cargando && <p className="loading">Cargando…</p>}

      {tablero && (
        <div className="kanban">
          {ESTADOS.map((estado) => (
            <div key={estado} className="kanban-col">
              <div className="kanban-col__head">
                <h3>{estado}</h3>
                <span className="kanban-count">{tablero[estado]?.length || 0}</span>
              </div>

              {tablero[estado]?.map((p) => (
                <div key={p.id_pedido} className="pedido-card">
                  <strong>{p.cliente?.nombre}</strong>
                  <div className="meta">
                    {p.cantidad_botellones} bidones · {formatoFecha(p.fecha_solicitud)}
                  </div>
                  {p.notas && <div className="meta">📝 {p.notas}</div>}

                  <div className="acciones">
                    {estado !== 'Pedido recibido' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => retroceder(p)}>
                        ← Corregir
                      </button>
                    )}
                    {estado !== 'Entregado' && (
                      <button className="btn btn-primary btn-sm" onClick={() => avanzar(p)}>
                        Avanzar →
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {tablero[estado]?.length === 0 && (
                <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', padding: '6px 4px' }}>Sin pedidos</p>
              )}
            </div>
          ))}
        </div>
      )}

      {modalAbierto && <PedidoFormModal onClose={() => setModalAbierto(false)} onSave={crear} />}
    </div>
  );
}
