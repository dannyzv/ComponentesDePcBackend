const router = require('express').Router();
const { listComponents, getComponentById } = require('../controllers/componentController');

router.get('/', listComponents);
router.get('/:id', getComponentById);

module.exports = router;