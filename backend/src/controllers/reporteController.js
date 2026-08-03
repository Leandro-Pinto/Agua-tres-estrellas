const { Op, fn, col, literal } = require('sequelize');
const { Cliente, Pedido } = require('../models');

// Umbrales de RF-16 (en días), configurables vía query string si se necesita ajustar.
const UMBRAL_DEFAULT = { Semanal: 10, Quincenal: 20, Mensual: 45, Ocasional: 90 };

// RF-15: reporte de clientes por tipo.
async function clientesPorTipo(req, res, next) {
  try {
    const filas = await Cliente.findAll({
      attributes: ['tipo', [fn('COUNT', col('id_cliente')), 'total']],
      where: { activo: true },
      group: ['tipo'],
    });
    res.json(filas);
  } catch (err) {
    next(err);
  }
}

// RF-16: clientes inactivos según su frecuencia habitual (ver ERS 4.3, RF-16).
async function clientesInactivos(req, res, next) {
  try {
    const umbral = { ...UMBRAL_DEFAULT };
    ['Semanal', 'Quincenal', 'Mensual', 'Ocasional'].forEach((f) => {
      if (req.query[f]) umbral[f] = Number(req.query[f]);
    });

    const clientes = await Cliente.findAll({
      where: { activo: true, frecuencia_habitual: { [Op.ne]: null } },
      include: [{ model: Pedido, as: 'pedidos' }],
    });

    const hoy = new Date();
    const inactivos = clientes
      .map((cliente) => {
        const entregados = cliente.pedidos.filter((p) => p.fecha_entrega_real);
        if (entregados.length === 0) return null;

        const ultimaEntrega = entregados.reduce((max, p) =>
          new Date(p.fecha_entrega_real) > new Date(max.fecha_entrega_real) ? p : max
        ).fecha_entrega_real;

        const diasSinPedido = Math.floor((hoy - new Date(ultimaEntrega)) / (1000 * 60 * 60 * 24));
        const limite = umbral[cliente.frecuencia_habitual];

        if (diasSinPedido > limite) {
          return {
            id_cliente: cliente.id_cliente,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            frecuencia_habitual: cliente.frecuencia_habitual,
            ultima_entrega: ultimaEntrega,
            dias_sin_pedido: diasSinPedido,
            umbral_dias: limite,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.dias_sin_pedido - a.dias_sin_pedido);

    res.json({ umbral_dias: umbral, clientes: inactivos });
  } catch (err) {
    next(err);
  }
}

// RF-17: clientes con mayor cantidad de bidones pedidos en el mes actual (o el indicado por ?mes=YYYY-MM).
async function topClientesPorBidones(req, res, next) {
  try {
    const mes = req.query.mes || new Date().toISOString().slice(0, 7);
    const inicio = new Date(`${mes}-01T00:00:00`);
    const fin = new Date(inicio);
    fin.setMonth(fin.getMonth() + 1);

    const filas = await Pedido.findAll({
      attributes: ['id_cliente', [fn('SUM', col('cantidad_botellones')), 'total_botellones']],
      where: { fecha_solicitud: { [Op.gte]: inicio, [Op.lt]: fin } },
      group: ['id_cliente'],
      order: [[literal('total_botellones'), 'DESC']],
      include: [{ model: Cliente, as: 'cliente', attributes: ['nombre', 'tipo', 'telefono'] }],
      limit: 20,
    });

    res.json({ mes, ranking: filas });
  } catch (err) {
    next(err);
  }
}

module.exports = { clientesPorTipo, clientesInactivos, topClientesPorBidones };
