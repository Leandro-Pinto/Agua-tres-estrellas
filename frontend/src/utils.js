export const ESTADOS = ['Pedido recibido', 'Pedido confirmado', 'En reparto', 'Entregado'];

export function claseBadgeEstado(estado) {
  switch (estado) {
    case 'Pedido recibido':
      return 'badge badge-recibido';
    case 'Pedido confirmado':
      return 'badge badge-confirmado';
    case 'En reparto':
      return 'badge badge-reparto';
    case 'Entregado':
      return 'badge badge-entregado';
    default:
      return 'badge';
  }
}

export function formatoFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function siguienteEstado(estado) {
  const idx = ESTADOS.indexOf(estado);
  return idx >= 0 && idx < ESTADOS.length - 1 ? ESTADOS[idx + 1] : null;
}
