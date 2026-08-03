const sequelize = require('../config/database');
const Cliente = require('./Cliente');
const Pedido = require('./Pedido');
const Usuario = require('./Usuario');

// Relación 1:N -- un cliente puede tener varios pedidos (sección 5 del ERS).
Cliente.hasMany(Pedido, { foreignKey: 'id_cliente', as: 'pedidos' });
Pedido.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });

module.exports = { sequelize, Cliente, Pedido, Usuario };
