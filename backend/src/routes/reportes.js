const express = require('express');
const ctrl = require('../controllers/reporteController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/clientes-por-tipo', ctrl.clientesPorTipo);
router.get('/clientes-inactivos', ctrl.clientesInactivos);
router.get('/prediccion-consumo', ctrl.prediccionConsumo);
router.get('/top-bidones', ctrl.topClientesPorBidones);

module.exports = router;
