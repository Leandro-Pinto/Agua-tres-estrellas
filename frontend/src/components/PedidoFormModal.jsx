import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function PedidoFormModal({ onClose, onSave }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    id_cliente: '',
    cantidad_botellones: 1,
    fecha_entrega_estimada: '',
    notas: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/clientes').then(({ data }) => setClientes(data));
  }, []);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.id_cliente) {
      setError('Selecciona un cliente.');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar el pedido.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Nuevo pedido</h2>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Cliente</label>
            <select className="select" value={form.id_cliente} onChange={(e) => set('id_cliente', e.target.value)} required>
              <option value="">— Selecciona un cliente —</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre} ({c.tipo})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Cantidad de bidones</label>
            <input
              type="number"
              min={1}
              className="input"
              value={form.cantidad_botellones}
              onChange={(e) => set('cantidad_botellones', Number(e.target.value))}
              required
            />
          </div>

          <div className="field">
            <label>Fecha de entrega estimada (opcional)</label>
            <input
              type="date"
              className="input"
              value={form.fecha_entrega_estimada}
              onChange={(e) => set('fecha_entrega_estimada', e.target.value)}
            />
          </div>

          <div className="field">
            <label>Notas de entrega (opcional)</label>
            <textarea rows={2} value={form.notas} onChange={(e) => set('notas', e.target.value)} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Registrar pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
