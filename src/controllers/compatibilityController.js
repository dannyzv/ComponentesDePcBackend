const Component = require('../models/Component');
const { validateBuild } = require('../services/compatibilityEngine');

async function checkCompatibility(req, res, next) {
  try {
    const { components } = req.body;
    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ error: 'Se requiere la lista de componentes.' });
    }

    const ids = components
      .filter((c) => c && c.id)
      .map((c) => c.id);

    const found = await Component.find({ _id: { $in: ids } }).lean();
    const result = validateBuild(found);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { checkCompatibility };