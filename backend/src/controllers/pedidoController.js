const { Op } = require('sequelize');
const { Pedido, Cliente } = require('../models');
const { ESTADOS_PEDIDO, ORDEN_ESTADOS } = Pedido;

// RF-07 + RF-08: registrar un pedido; el estado inicial siempre es "Pedido recibido".
async function crear(req, res, next) {
  try {
    const { id_cliente, cantidad_botellones, fecha_entrega_estimada, notas } = req.body;

    const cliente = await Cliente.findByPk(id_cliente);
    if (!cliente) return res.status(404).json({ error: 'El cliente indicado no existe.' });

    const pedido = await Pedido.create({
      id_cliente,
      cantidad_botellones,
      fecha_entrega_estimada,
      notas,
      estado: 'Pedido recibido',
    });
    res.status(201).json(pedido);
  } catch (err) {
    next(err);
  }
}

// RF-11: listar y filtrar pedidos por estado, cliente y rango de fechas.
async function listar(req, res, next) {
  try {
    const { estado, id_cliente, desde, hasta } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    if (id_cliente) where.id_cliente = id_cliente;
    if (desde || hasta) {
      where.fecha_solicitud = {};
      if (desde) where.fecha_solicitud[Op.gte] = new Date(desde);
      if (hasta) where.fecha_solicitud[Op.lte] = new Date(hasta);
    }

    const pedidos = await Pedido.findAll({
      where,
      include: [{ model: Cliente, as: 'cliente', attributes: ['id_cliente', 'nombre', 'tipo', 'telefono'] }],
      order: [['fecha_solicitud', 'DESC']],
    });
    res.json(pedidos);
  } catch (err) {
    next(err);
  }
}

// RF-12: vista tipo tablero (kanban) -- pedidos agrupados por estado.
async function tablero(req, res, next) {
  try {
    const pedidos = await Pedido.findAll({
      include: [{ model: Cliente, as: 'cliente', attributes: ['id_cliente', 'nombre', 'tipo', 'telefono'] }],
      order: [['fecha_solicitud', 'ASC']],
    });

    const columnas = Object.fromEntries(ESTADOS_PEDIDO.map((estado) => [estado, []]));
    pedidos.forEach((p) => columnas[p.estado].push(p));

    res.json(columnas);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [{ model: Cliente, as: 'cliente' }],
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado.' });
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado.' });

    const { cantidad_botellones, fecha_entrega_estimada, notas } = req.body;
    await pedido.update({ cantidad_botellones, fecha_entrega_estimada, notas });
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

// RF-09 + RF-10: cambiar el estado siguiendo el embudo (sección 4.4).
// Por defecto solo permite avanzar un paso; retroceder requiere "forzar=true"
// para dejar claro que es una corrección manual de errores (ver ERS 4.4).
async function cambiarEstado(req, res, next) {
  try {
    const { estado, forzar } = req.body;
    if (!ESTADOS_PEDIDO.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Use uno de: ${ESTADOS_PEDIDO.join(', ')}` });
    }

    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado.' });

    const actual = ORDEN_ESTADOS[pedido.estado];
    const nuevo = ORDEN_ESTADOS[estado];
    const esAvanceDeUnPaso = nuevo === actual + 1;
    const esRetroceso = nuevo < actual;

    if (!esAvanceDeUnPaso && !(esRetroceso && forzar)) {
      return res.status(400).json({
        error:
          'Transición no permitida. Solo se puede avanzar un paso a la vez, o retroceder enviando forzar=true para corregir un error de registro.',
      });
    }

    const cambios = { estado };
    if (estado === 'Entregado') {
      cambios.fecha_entrega_real = new Date(); // RF-10
    }
    if (esRetroceso && pedido.estado === 'Entregado') {
      cambios.fecha_entrega_real = null; // se corrige el error, ya no está entregado
    }

    await pedido.update(cambios);
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar, tablero, obtener, actualizar, cambiarEstado };
