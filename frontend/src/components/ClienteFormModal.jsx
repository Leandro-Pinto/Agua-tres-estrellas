import React, { useState } from 'react';

const TIPOS = ['Hogar', 'Oficina', 'Empresa', 'Institución'];
const FRECUENCIAS = ['Semanal', 'Quincenal', 'Mensual', 'Ocasional'];

export default function ClienteFormModal({ cliente, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: cliente?.nombre || '',
    tipo: cliente?.tipo || 'Hogar',
    telefono: cliente?.telefono || '',
    direccion: cliente?.direccion || '',
    referencia: cliente?.referencia || '',
    frecuencia_habitual: cliente?.frecuencia_habitual || '',
    observaciones: cliente?.observaciones || '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el cliente.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{cliente ? 'Editar cliente' : 'Nuevo cliente'}</h2>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field field-full">
              <label>Nombre / razón social</label>
              <input className="input" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
            </div>

            <div className="field">
              <label>Tipo de cliente</label>
              <select className="select" value={form.tipo} onChange={(e) => set('tipo', e.target.value)} required>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Teléfono / WhatsApp</label>
              <input className="input" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} required />
            </div>

            <div className="field field-full">
              <label>Dirección de entrega</label>
              <input className="input" value={form.direccion} onChange={(e) => set('direccion', e.target.value)} required />
            </div>

            <div className="field field-full">
              <label>Referencia (opcional)</label>
              <input className="input" value={form.referencia} onChange={(e) => set('referencia', e.target.value)} />
            </div>

            <div className="field field-full">
              <label>Frecuencia habitual</label>
              <select
                className="select"
                value={form.frecuencia_habitual}
                onChange={(e) => set('frecuencia_habitual', e.target.value)}
              >
                <option value="">— No definida —</option>
                {FRECUENCIAS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="field field-full">
              <label>Observaciones (opcional)</label>
              <textarea
                rows={3}
                value={form.observaciones}
                onChange={(e) => set('observaciones', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
