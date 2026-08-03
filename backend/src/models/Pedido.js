const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Catálogo único de estados del pedido (sección 4.4 y 5.2 del ERS).
// OJO: "Nuevo cliente" y "Seguimiento para nuevo pedido" NO son estados de Pedido,
// son etapas del ciclo de vida del cliente dentro del embudo comercial.
const ESTADOS_PEDIDO = ['Pedido recibido', 'Pedido confirmado', 'En reparto', 'Entregado'];

// Orden del embudo, usado para validar transiciones de avance/retroceso (RF-09).
const ORDEN_ESTADOS = {
  'Pedido recibido': 0,
  'Pedido confirmado': 1,
  'En reparto': 2,
  Entregado: 3,
};

const Pedido = sequelize.define(
  'Pedido',
  {
    id_pedido: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_cliente: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'clientes', key: 'id_cliente' },
    },
    cantidad_botellones: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    fecha_solicitud: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_entrega_estimada: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_entrega_real: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_PEDIDO),
      allowNull: false,
      defaultValue: 'Pedido recibido', // RF-08
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'pedidos',
    timestamps: true,
  }
);

Pedido.ESTADOS_PEDIDO = ESTADOS_PEDIDO;
Pedido.ORDEN_ESTADOS = ORDEN_ESTADOS;

module.exports = Pedido;
