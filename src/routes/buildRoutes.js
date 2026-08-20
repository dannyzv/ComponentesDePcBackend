const router = require('express').Router();
const { getPresets, optimize } = require('../controllers/buildController');
const { requireAuth } = require('../middleware/auth');

router.get('/presets', getPresets);
router.post('/optimize', requireAuth, optimize);

module.exports = router;