require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // crea las tablas si no existen (usar migraciones en producción)
    console.log('Base de datos conectada y sincronizada.');

    app.listen(PORT, () => {
      console.log(`API del CRM escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
