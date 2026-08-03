const express = require('express');
const ctrl = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/resumen', ctrl.resumen);
router.get('/activos', ctrl.activos);

module.exports = router;
