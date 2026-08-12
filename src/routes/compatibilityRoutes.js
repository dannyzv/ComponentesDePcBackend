const router = require('express').Router();
const { checkCompatibility } = require('../controllers/compatibilityController');

router.post('/check', checkCompatibility);

module.exports = router;