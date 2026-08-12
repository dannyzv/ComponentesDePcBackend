const Component = require('../models/Component');
const PresetBuild = require('../models/PresetBuild');
const { optimizeBuild } = require('../services/buildOptimizer');

async function getPresets(req, res, next) {
  try {
    const { useType } = req.query;
    const filter = useType ? { useType } : {};
    const presets = await PresetBuild.find(filter).lean();

    const ids = [];
    for (const preset of presets) {
      for (const id of Object.values(preset.components || {})) ids.push(id);
    }
    const populated = await Component.find({ _id: { $in: ids } }).lean();
    const byId = new Map(populated.map((c) => [String(c._id), c]));

    for (const preset of presets) {
      preset.components = Object.fromEntries(
        Object.entries(preset.components || {}).map(([category, id]) => [
          category,
          byId.get(String(id)) || null,
        ])
      );
    }

    res.json({ count: presets.length, presets });
  } catch (error) {
    next(error);
  }
}

async function optimize(req, res, next) {
  try {
    const { budget, useType, preferredBrand } = req.body;
    const numericBudget = Number(budget || 0);

    if (!numericBudget || numericBudget <= 0) {
      return res.status(400).json({ error: 'Se requiere un presupuesto válido.' });
    }

    const allComponents = await Component.find().lean();
    const result = optimizeBuild(allComponents, {
      budget: numericBudget,
      useType: useType || 'gaming',
      preferredBrand: preferredBrand || null,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { getPresets, optimize };