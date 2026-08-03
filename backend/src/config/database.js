const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const storagePath = process.env.DB_STORAGE || './data/database.sqlite';
const absoluteDir = path.dirname(path.resolve(storagePath));
if (!fs.existsSync(absoluteDir)) {
  fs.mkdirSync(absoluteDir, { recursive: true });
}

// SQLite se usa por simplicidad de instalación (RNF-03 permite PostgreSQL, MySQL o SQLite).
// Para producción, basta con cambiar 'dialect' y las credenciales aquí.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
});

module.exports = sequelize;
