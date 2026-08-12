const Component = require('../models/Component');

async function listComponents(req, res, next) {
  try {
    const { category, brand, minPrice, maxPrice, search } = req.query;
    const filter = {};

    if (category) filter.category = category.toLowerCase();
    if (brand) filter.brand = brand;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    let query = Component.find(filter);

    if (search) {
      query = Component.find({ $text: { $search: search } });
      if (category || brand || minPrice || maxPrice) {
        query = query.find(filter);
      }
    }

    const components = await query.sort({ category: 1, price: 1 }).lean();
    res.json({ count: components.length, components });
  } catch (error) {
    next(error);
  }
}

async function getComponentById(req, res, next) {
  try {
    const component = await Component.findById(req.params.id).lean();
    if (!component) {
      return res.status(404).json({ error: 'Componente no encontrado' });
    }
    res.json(component);
  } catch (error) {
    next(error);
  }
}

module.exports = { listComponents, getComponentById };