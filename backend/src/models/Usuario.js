const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// RNF-02: autenticación con usuario y contraseña, sin registro público.
// En v1 solo existe un rol operativo (Administrador/Encargado); ver ERS sección 3.4.
const Usuario = sequelize.define(
  'Usuario',
  {
    id_usuario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'usuarios',
    timestamps: true,
  }
);

module.exports = Usuario;
