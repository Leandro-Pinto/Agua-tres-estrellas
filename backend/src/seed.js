require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Cliente, Pedido, Usuario } = require('./models');

async function seed() {
  await sequelize.sync({ force: true }); // ¡Cuidado! recrea las tablas desde cero.

  const password_hash = await bcrypt.hash('admin123', 10);
  await Usuario.create({
    nombre: 'Administrador',
    username: 'admin',
    password_hash,
  });
  console.log('Usuario creado -> usuario: admin / contraseña: admin123');

  const clientes = await Cliente.bulkCreate([
    {
      nombre: 'María Quispe',
      tipo: 'Hogar',
      telefono: '987654321',
      direccion: 'Jr. Los Cedros 123, Puerto Maldonado',
      referencia: 'Frente a la posta de salud',
      frecuencia_habitual: 'Semanal',
      observaciones: 'Prefiere entrega en la mañana.',
    },
    {
      nombre: 'Restaurante El Fogón',
      tipo: 'Empresa',
      telefono: '982111222',
      direccion: 'Av. Madre de Dios 456',
      frecuencia_habitual: 'Semanal',
    },
    {
      nombre: 'I.E. San Martín',
      tipo: 'Institución',
      telefono: '984333444',
      direccion: 'Calle Cusco 789',
      frecuencia_habitual: 'Quincenal',
    },
    {
      nombre: 'Oficina Contable Rojas',
      tipo: 'Oficina',
      telefono: '981555666',
      direccion: 'Jr. Loreto 234, piso 2',
      frecuencia_habitual: 'Mensual',
    },
    {
      nombre: 'Juan Pérez',
      tipo: 'Hogar',
      telefono: '989777888',
      direccion: 'Urb. Las Palmeras Mz. B Lt. 5',
      frecuencia_habitual: 'Ocasional',
      activo: false,
      observaciones: 'Cliente dado de baja: se mudó de ciudad.',
    },
  ]);

  const hoy = new Date();
  const diasAtras = (n) => new Date(hoy.getTime() - n * 24 * 60 * 60 * 1000);

  await Pedido.bulkCreate([
    {
      id_cliente: clientes[0].id_cliente,
      cantidad_botellones: 2,
      fecha_solicitud: diasAtras(1),
      estado: 'Pedido recibido',
    },
    {
      id_cliente: clientes[1].id_cliente,
      cantidad_botellones: 10,
      fecha_solicitud: diasAtras(2),
      estado: 'Pedido confirmado',
    },
    {
      id_cliente: clientes[1].id_cliente,
      cantidad_botellones: 8,
      fecha_solicitud: diasAtras(3),
      estado: 'En reparto',
    },
    {
      id_cliente: clientes[2].id_cliente,
      cantidad_botellones: 5,
      fecha_solicitud: diasAtras(30),
      fecha_entrega_real: diasAtras(29),
      estado: 'Entregado',
    },
    {
      id_cliente: clientes[3].id_cliente,
      cantidad_botellones: 3,
      fecha_solicitud: diasAtras(60),
      fecha_entrega_real: diasAtras(59),
      estado: 'Entregado',
    },
    {
      id_cliente: clientes[0].id_cliente,
      cantidad_botellones: 2,
      fecha_solicitud: diasAtras(15),
      fecha_entrega_real: diasAtras(14),
      estado: 'Entregado',
    },
  ]);

  console.log('Datos de prueba insertados correctamente.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error al sembrar datos:', err);
  process.exit(1);
});
