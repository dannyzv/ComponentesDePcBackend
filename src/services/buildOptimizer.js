const { estimatePower } = require('./compatibilityEngine');

const USE_PRIORITIES = {
  gaming: ['gpu', 'cpu', 'ram', 'motherboard', 'storage', 'cooling', 'psu', 'case'],
  office: ['cpu', 'ram', 'storage', 'motherboard', 'psu', 'case', 'gpu', 'cooling'],
  editing: ['cpu', 'ram', 'gpu', 'storage', 'motherboard', 'cooling', 'psu', 'case'],
  development: ['cpu', 'ram', 'storage', 'motherboard', 'cooling', 'psu', 'gpu', 'case'],
};

function scoreComponent(component, useType, priorityIndex) {
  const spec = component.specifications || {};
  let score = 100 - priorityIndex;

  if (useType === 'gaming') {
    if (component.category === 'gpu') score += Number(spec.vram || spec.tbp || 0) * 2;
    if (component.category === 'cpu') score += Number(spec.cores || 0);
  } else if (useType === 'office') {
    if (component.category === 'cpu') score += Number(spec.cores || 0);
    if (component.category === 'ram') score += Math.min(Number(spec.capacityTotal || 0), 16);
  } else if (useType === 'editing') {
    if (component.category === 'cpu') score += Number(spec.cores || 0) * 2;
    if (component.category === 'ram') score += Number(spec.capacityTotal || 0);
    if (component.category === 'gpu') score += Number(spec.vram || 0) * 3;
  } else if (useType === 'development') {
    if (component.category === 'cpu') score += Number(spec.cores || 0) * 2 + Number(spec.threads || 0);
    if (component.category === 'ram') score += Number(spec.capacityTotal || 0);
  }

  return score;
}

function optimizeBuild(components, { budget, useType = 'gaming', preferredBrand = null }) {
  const priorities = USE_PRIORITIES[useType] || USE_PRIORITIES.gaming;
  const byCategory = {};
  for (const component of components) {
    const category = (component.category || '').toLowerCase();
    const price = Number(component.price || 0);
    if (price > budget) continue;
    if (preferredBrand && component.brand !== preferredBrand) continue;
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push({ ...component.toObject ? component.toObject() : component, category });
  }

  const selection = {};
  let remaining = budget;
  const rejections = [];

  for (const category of priorities) {
    const candidates = byCategory[category] || [];
    if (!candidates.length) continue;
    const priorityIndex = priorities.indexOf(category);
    const ranked = candidates
      .map((c) => ({ ...c, _score: scoreComponent(c, useType, priorityIndex) }))
      .sort((a, b) => b._score - a._score);

    let chosen = ranked.find((c) => c.price <= remaining);
    if (!chosen) {
      const affordable = ranked.filter((c) => c.price <= remaining);
      if (affordable.length) {
        chosen = affordable[affordable.length - 1];
      } else {
        rejections.push({ category, reason: 'Sin opciones dentro del presupuesto restante.' });
        continue;
      }
    }
    selection[category] = { id: chosen._id, name: chosen.name, brand: chosen.brand, price: chosen.price, specifications: chosen.specifications };
    remaining -= chosen.price;
  }

  const selectedList = Object.keys(selection).map((c) => ({
    category: c,
    price: selection[c].price,
    specifications: selection[c].specifications,
  }));

  const powerEstimate = Math.round(estimatePower(selectedList));

  return {
    useType,
    budget,
    totalPrice: budget - remaining,
    remainingBudget: remaining,
    powerEstimate,
    components: selection,
    rejectionReasons: rejections,
  };
}

module.exports = { optimizeBuild, USE_PRIORITIES };