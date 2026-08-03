const { Op } = require('sequelize');
const { Pedido, Cliente } = require('../models');
const { ESTADOS_PEDIDO } = Pedido;

// RF-13: número de pedidos agrupados por estado.
async function resumen(req, res, next) {
  try {
    const conteos = await Promise.all(
      ESTADOS_PEDIDO.map(async (estado) => ({
        estado,
        total: await Pedido.count({ where: { estado } }),
      }))
    );

    const totalClientesActivos = await Cliente.count({ where: { activo: true } });
    const totalClientes = await Cliente.count();

    res.json({ pedidos_por_estado: conteos, total_clientes_activos: totalClientesActivos, total_clientes: totalClientes });
  } catch (err) {
    next(err);
  }
}

// RF-14: pedidos activos (todos menos "Entregado"), ordenados por fecha de solicitud.
async function activos(req, res, next) {
  try {
    const pedidos = await Pedido.findAll({
      where: { estado: { [Op.ne]: 'Entregado' } },
      include: [{ model: Cliente, as: 'cliente', attributes: ['id_cliente', 'nombre', 'telefono'] }],
      order: [['fecha_solicitud', 'ASC']],
    });
    res.json(pedidos);
  } catch (err) {
    next(err);
  }
}

module.exports = { resumen, activos };
