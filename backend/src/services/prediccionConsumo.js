function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function normalizarFrecuencia(frecuencia) {
  switch (frecuencia) {
    case 'Semanal':
      return 1;
    case 'Quincenal':
      return 0.8;
    case 'Mensual':
      return 0.55;
    case 'Ocasional':
      return 0.3;
    default:
      return 0.5;
  }
}

function normalizarTipo(tipo) {
  switch (tipo) {
    case 'Empresa':
      return 0.9;
    case 'Hogar':
      return 0.75;
    case 'Oficina':
      return 0.65;
    case 'Institución':
      return 0.6;
    default:
      return 0.5;
  }
}

function calcularPrediccionCliente({
  frecuencia_habitual,
  tipo,
  dias_sin_pedido,
  volumen_promedio,
  historial_pedidos,
  estabilidad,
}) {
  const frecuencia = normalizarFrecuencia(frecuencia_habitual);
  const tipoScore = normalizarTipo(tipo);
  const recencia = dias_sin_pedido == null ? 0.2 : Math.max(0, Math.min(1, 1 - dias_sin_pedido / 60));
  const volumen = volumen_promedio == null ? 0.2 : Math.max(0.2, Math.min(1, volumen_promedio / 6));
  const historial = historial_pedidos == null ? 0.2 : Math.max(0.2, Math.min(1, historial_pedidos / 6));
  const estabilidadScore = estabilidad == null ? 0.4 : Math.max(0.2, Math.min(1, estabilidad));

  const z =
    -1.1 +
    0.9 * frecuencia +
    1.1 * recencia +
    0.7 * volumen +
    0.6 * historial +
    0.8 * estabilidadScore +
    0.35 * tipoScore;

  const probabilidad = Math.max(0.05, Math.min(0.98, sigmoid(z)));
  const clase = probabilidad >= 0.5 ? 'Consume agua' : 'No consume agua';

  return {
    probabilidad_consumo: Number(probabilidad.toFixed(2)),
    clase_prediccion: clase,
  };
}

module.exports = { calcularPrediccionCliente };
