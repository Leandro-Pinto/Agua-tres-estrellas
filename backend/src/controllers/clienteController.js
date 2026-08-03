const { Op } = require('sequelize');
const { Cliente, Pedido } = require('../models');

// RF-01: registrar un nuevo cliente.
async function crear(req, res, next) {
  try {
    const { nombre, tipo, telefono, direccion, referencia, frecuencia_habitual, observaciones } = req.body;
    const cliente = await Cliente.create({
      nombre,
      tipo,
      telefono,
      direccion,
      referencia,
      frecuencia_habitual,
      observaciones,
    });
    res.status(201).json(cliente);
  } catch (err) {
    next(err);
  }
}

// RF-04 (buscar por nombre/teléfono) + RF-05 (filtrar por tipo).
// Por defecto solo lista clientes activos; ?incluirInactivos=true los incluye.
async function listar(req, res, next) {
  try {
    const { q, tipo, incluirInactivos } = req.query;
    const where = {};

    if (!incluirInactivos || incluirInactivos === 'false') {
      where.activo = true;
    }
    if (tipo) {
      where.tipo = tipo;
    }
    if (q) {
      where[Op.or] = [{ nombre: { [Op.like]: `%${q}%` } }, { telefono: { [Op.like]: `%${q}%` } }];
    }

    const clientes = await Cliente.findAll({ where, order: [['nombre', 'ASC']] });
    res.json(clientes);
  } catch (err) {
    next(err);
  }
}

// RF-06: ficha del cliente con su historial completo de pedidos.
async function obtener(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [{ model: Pedido, as: 'pedidos', order: [['fecha_solicitud', 'DESC']] }],
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

// RF-02: editar datos de un cliente existente.
async function actualizar(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });

    const { nombre, tipo, telefono, direccion, referencia, frecuencia_habitual, observaciones } = req.body;
    await cliente.update({ nombre, tipo, telefono, direccion, referencia, frecuencia_habitual, observaciones });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

// RF-03: baja lógica. No borra el registro ni su historial de pedidos.
async function darDeBaja(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
    await cliente.update({ activo: false });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

// Reactivar un cliente dado de baja (operación complementaria, no rompe RF-03).
async function reactivar(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
    await cliente.update({ activo: true });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar, obtener, actualizar, darDeBaja, reactivar };
