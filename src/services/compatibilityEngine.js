const CATEGORIES = ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'cooling', 'case'];

function getByCategory(components, category) {
  return components.find((c) => (c.category || '').toLowerCase() === category) || null;
}

function normalizeComponent(entry) {
  return {
    ...entry,
    category: (entry.category || entry._doc?.category || '').toLowerCase(),
    specifications: entry.specifications || entry.specs || {},
    price: entry.price || 0,
  };
}

function estimatePower(components) {
  const drain = {
    cpu: 65,
    gpu: 0,
    motherboard: 50,
    ram: 5,
    storage: 5,
    cooling: 5,
    psu: 0,
    case: 0,
  };

  let total = 0;
  for (const comp of components) {
    const spec = comp.specifications || {};
    const base = drain[comp.category] || 0;
    const tdp = Number(spec.tdp || spec.tbp || base || 0);
    total += tdp || base;
  }
  return total;
}

function validateSocket(motherboard, cpu, issues) {
  if (!motherboard || !cpu) return;
  const boardSocket = motherboard.specifications?.socket;
  const cpuSocket = cpu.specifications?.socket;
  if (boardSocket && cpuSocket && boardSocket !== cpuSocket) {
    issues.push({
      severity: 'error',
      rule: 'socket',
      component: 'CPU',
      message: `El socket ${cpuSocket} del CPU no es compatible con el socket ${boardSocket} de la placa madre.`,
    });
  }
}

function validateRamType(motherboard, ram, issues) {
  if (!motherboard || !ram) return;
  const boardType = motherboard.specifications?.ramType;
  const ramType = ram.specifications?.type;
  if (boardType && ramType && boardType !== ramType) {
    issues.push({
      severity: 'error',
      rule: 'ram-type',
      component: 'RAM',
      message: `La memoria ${ramType} no es compatible con la placa que acepta ${boardType}.`,
    });
  }
}

function validateRamSlots(motherboard, ram, issues) {
  if (!motherboard || !ram) return;
  const slots = motherboard.specifications?.ramSlots;
  const modules = Number(ram.specifications?.modules || ram.specifications?.capacityModules || 1);
  if (slots && modules > slots) {
    issues.push({
      severity: 'error',
      rule: 'ram-slots',
      component: 'RAM',
      message: `La placa tiene ${slots} slots de memoria y se propusieron ${modules} módulos.`,
    });
  }
}

function validateRamSpeed(motherboard, ram, issues) {
  if (!motherboard || !ram) return;
  const maxSpeed = numberOrNull(motherboard.specifications?.maxRamSpeed);
  const ramSpeed = numberOrNull(ram.specifications?.speed);
  if (maxSpeed && ramSpeed && ramSpeed > maxSpeed) {
    issues.push({
      severity: 'warning',
      rule: 'ram-speed',
      component: 'RAM',
      message: `La memoria corre a ${ramSpeed} MHz pero la placa soporta hasta ${maxSpeed} MHz.`,
    });
  }
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function validatePsu(components, psu, issues) {
  const estimate = estimatePower(components.filter((c) => c.category !== 'psu'));
  if (!psu) {
    issues.push({
      severity: 'error',
      rule: 'psu-missing',
      component: 'PSU',
      message: 'El build no incluye fuente de poder.',
    });
    return;
  }

  const wattage = numberOrNull(psu.specifications?.wattage);
  if (!wattage) {
    issues.push({
      severity: 'warning',
      rule: 'psu-wattage',
      component: 'PSU',
      message: 'No se pudo leer la potencia de la fuente.',
    });
    return;
  }

  const required = Math.round(estimate * 1.3);
  if (wattage < estimate) {
    issues.push({
      severity: 'error',
      rule: 'psu-power',
      component: 'PSU',
      message: `La fuente de ${wattage} W no cubre el consumo estimado de ${Math.round(estimate)} W.`,
    });
  } else if (wattage < required) {
    issues.push({
      severity: 'warning',
      rule: 'psu-headroom',
      component: 'PSU',
      message: `La fuente de ${wattage} W deja poco margen. Se recomiendan al menos ${required} W.`,
    });
  }
}

function validateGpuClearance(caseComp, gpu, issues) {
  if (!caseComp || !gpu) return;
  const maxGpu = numberOrNull(caseComp.specifications?.maxGpuLength);
  const gpuLength = numberOrNull(gpu.specifications?.lengthMm);
  if (maxGpu && gpuLength && gpuLength > maxGpu) {
    issues.push({
      severity: 'error',
      rule: 'gpu-clearance',
      component: 'GPU',
      message: `La GPU mide ${gpuLength} mm y el gabinete admite hasta ${maxGpu} mm.`,
    });
  }
}

function validateStorage(motherboard, storage, issues) {
  if (!motherboard || !storage) return;
  const interfaceType = (storage.specifications?.interface || '').toLowerCase();
  if (!interfaceType) {
    issues.push({ severity: 'warning', rule: 'storage-interface', component: 'Disco', message: 'No se pudo determinar la interfaz del almacenamiento.' });
    return;
  }

  if (interfaceType.includes('nvme') || interfaceType.includes('m.2')) {
    const m2 = numberOrNull(motherboard.specifications?.m2Slots);
    if (m2 !== null && m2 < 1) {
      issues.push({
        severity: 'error',
        rule: 'storage-m2',
        component: 'Disco',
        message: 'La placa no tiene slots M.2 para el disco NVMe.',
      });
    }
  } else if (interfaceType.includes('sata')) {
    const sata = numberOrNull(motherboard.specifications?.sataPorts);
    if (sata !== null && sata < 1) {
      issues.push({
        severity: 'error',
        rule: 'storage-sata',
        component: 'Disco',
        message: 'La placa no tiene puertos SATA libres.',
      });
    }
  }
}

function validateCooling(cpu, cooling, issues) {
  if (!cpu) return;
  const cpuTdp = numberOrNull(cpu.specifications?.tdp);
  if (!cpuTdp) return;
  if (!cooling) {
    const included = cpu.specifications?.includedCooler;
    if (!included) {
      issues.push({
        severity: 'warning',
        rule: 'cooling-missing',
        component: 'Refrigeración',
        message: 'El CPU no incluye cooler y no se agregó uno al build.',
      });
    }
    return;
  }
  const rating = numberOrNull(cooling.specifications?.tdpRating);
  const type = (cooling.specifications?.type || '').toLowerCase();
  if (rating && cpuTdp > rating) {
    issues.push({
      severity: 'warning',
      rule: 'cooling-capacity',
      component: 'Refrigeración',
      message: `La refrigeración disipa hasta ${rating} W y el CPU exige ${cpuTdp} W.`,
    });
  }
  if (type === 'liquid' && cpuTdp > 125) {
    issues.push({
      severity: 'info',
      rule: 'cooling-liquid',
      component: 'Refrigeración',
      message: 'Refrigeración líquida recomendada para CPUs de alta gama.',
    });
  }
}

function validateFormFactor(caseComp, motherboard, issues) {
  if (!caseComp || !motherboard) return;
  const caseFF = (caseComp.specifications?.formFactor || '').toLowerCase();
  const boardFF = (motherboard.specifications?.formFactor || '').toLowerCase();
  if (!caseFF || !boardFF) {
    issues.push({ severity: 'info', rule: 'form-factor', component: 'Gabinete', message: 'No se pueden validar los form factors.' });
    return;
  }
  const support = {
    atx: ['atx'],
    microatx: ['atx', 'microatx', 'matx'],
    matx: ['atx', 'microatx', 'matx'],
    itx: ['atx', 'microatx', 'matx', 'itx', 'miniitx', 'mini-itx'],
    'mini-itx': ['atx', 'microatx', 'matx', 'itx', 'miniitx', 'mini-itx'],
    miniitx: ['atx', 'microatx', 'matx', 'itx', 'miniitx', 'mini-itx'],
  };
  const supported = support[caseFF];
  if (supported && !supported.includes(boardFF)) {
    issues.push({
      severity: 'error',
      rule: 'form-factor',
      component: 'Gabinete',
      message: `El gabinete ${caseFF.toUpperCase()} no admite placas ${boardFF.toUpperCase()}.`,
    });
  }
}

function validateRadiatorSupport(caseComp, cooling, issues) {
  if (!caseComp || !cooling) return;
  const type = (cooling.specifications?.type || '').toLowerCase();
  const radiator = numberOrNull(cooling.specifications?.radiatorSize);
  if (type !== 'liquid' || radiator === null) return;
  const support = numberOrNull(caseComp.specifications?.radiatorSupport);
  if (support && radiator > support) {
    issues.push({
      severity: 'error',
      rule: 'radiator-support',
      component: 'Refrigeración',
      message: `El radiador de ${radiator} mm no cabe (gabinete admite ${support} mm).`,
    });
  }
}

function validatePsuConnectors(psu, gpu, issues) {
  if (!psu || !gpu) return;
  const gpuRecommended = numberOrNull(gpu.specifications?.recommendedPsu);
  const psuWattage = numberOrNull(psu.specifications?.wattage);
  if (!gpuRecommended) return;
  if (psuWattage && psuWattage < gpuRecommended) {
    issues.push({
      severity: 'warning',
      rule: 'psu-gpu-connectors',
      component: 'GPU',
      message: `La GPU recomienda una fuente de al menos ${gpuRecommended} W (la elegida es de ${psuWattage} W).`,
    });
  }
}

function validateBuild(components) {
  const normalized = components.map(normalizeComponent);
  const issues = [];

  const motherboard = getByCategory(normalized, 'motherboard');
  const cpu = getByCategory(normalized, 'cpu');
  const ram = getByCategory(normalized, 'ram');
  const gpu = getByCategory(normalized, 'gpu');
  const psu = getByCategory(normalized, 'psu');
  const cooling = getByCategory(normalized, 'cooling');
  const caseComp = getByCategory(normalized, 'case');
  const storage = getByCategory(normalized, 'storage');

  validateSocket(motherboard, cpu, issues);
  validateRamType(motherboard, ram, issues);
  validateRamSlots(motherboard, ram, issues);
  validateRamSpeed(motherboard, ram, issues);
  validatePsu(normalized, psu, issues);
  validateGpuClearance(caseComp, gpu, issues);
  validateStorage(motherboard, storage, issues);
  validateCooling(cpu, cooling, issues);
  validateFormFactor(caseComp, motherboard, issues);
  validateRadiatorSupport(caseComp, cooling, issues);
  validatePsuConnectors(psu, gpu, issues);

  const power = {
    estimate: Math.round(estimatePower(normalized.filter((c) => c.category !== 'psu'))),
    totalWattage: numberOrNull(psu?.specifications?.wattage) || 0,
  };

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  return {
    compatible: errors.length === 0,
    score: Math.max(0, 100 - errors.length * 25 - warnings.length * 5),
    power,
    issues,
    errors,
    warnings,
    infos,
  };
}

module.exports = { validateBuild, estimatePower, CATEGORIES };