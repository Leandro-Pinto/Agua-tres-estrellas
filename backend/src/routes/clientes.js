const express = require('express');
const ctrl = require('../controllers/clienteController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.get('/:id', ctrl.obtener);
router.put('/:id', ctrl.actualizar);
router.patch('/:id/baja', ctrl.darDeBaja);
router.patch('/:id/reactivar', ctrl.reactivar);

module.exports = router;
