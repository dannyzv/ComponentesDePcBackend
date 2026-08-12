const router = require('express').Router();
const { getPresets, optimize } = require('../controllers/buildController');

router.get('/presets', getPresets);
router.post('/optimize', optimize);

module.exports = router;