const express = require('express');
const ctrl = require('../controllers/pedidoController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.get('/tablero', ctrl.tablero);
router.get('/:id', ctrl.obtener);
router.put('/:id', ctrl.actualizar);
router.patch('/:id/estado', ctrl.cambiarEstado);

module.exports = router;
