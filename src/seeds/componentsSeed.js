const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const Component = require('../models/Component');
const PresetBuild = require('../models/PresetBuild');

const components = [
  // CPU
  { name: 'Intel Core i5-13400F', category: 'cpu', brand: 'Intel', price: 210, specifications: { socket: 'LGA1700', tdp: 65, cores: 10, threads: 16, includedCooler: true } },
  { name: 'Intel Core i7-13700K', category: 'cpu', brand: 'Intel', price: 380, specifications: { socket: 'LGA1700', tdp: 125, cores: 16, threads: 24, includedCooler: false } },
  { name: 'AMD Ryzen 5 7600X', category: 'cpu', brand: 'AMD', price: 230, specifications: { socket: 'AM5', tdp: 105, cores: 6, threads: 12, includedCooler: false } },
  { name: 'AMD Ryzen 7 7800X3D', category: 'cpu', brand: 'AMD', price: 400, specifications: { socket: 'AM5', tdp: 120, cores: 8, threads: 16, includedCooler: false } },
  { name: 'AMD Ryzen 5 5600G', category: 'cpu', brand: 'AMD', price: 140, specifications: { socket: 'AM4', tdp: 65, cores: 6, threads: 12, includedCooler: true } },
  { name: 'AMD Ryzen 9 7950X', category: 'cpu', brand: 'AMD', price: 540, specifications: { socket: 'AM5', tdp: 170, cores: 16, threads: 32, includedCooler: false } },

  // Placas madre
  { name: 'MSI PRO B760-P WiFi', category: 'motherboard', brand: 'MSI', price: 150, specifications: { socket: 'LGA1700', formFactor: 'atx', ramType: 'DDR4', ramSlots: 4, maxRamSpeed: 3200, m2Slots: 3, sataPorts: 4 } },
  { name: 'ASUS ROG STRIX B760-F', category: 'motherboard', brand: 'ASUS', price: 220, specifications: { socket: 'LGA1700', formFactor: 'atx', ramType: 'DDR5', ramSlots: 4, maxRamSpeed: 7200, m2Slots: 3, sataPorts: 4 } },
  { name: 'GIGABYTE B650 AORUS Elite AX', category: 'motherboard', brand: 'GIGABYTE', price: 190, specifications: { socket: 'AM5', formFactor: 'atx', ramType: 'DDR5', ramSlots: 4, maxRamSpeed: 6400, m2Slots: 4, sataPorts: 4 } },
  { name: 'ASRock X670E Taichi', category: 'motherboard', brand: 'ASRock', price: 400, specifications: { socket: 'AM5', formFactor: 'atx', ramType: 'DDR5', ramSlots: 4, maxRamSpeed: 7200, m2Slots: 5, sataPorts: 8 } },
  { name: 'MSI B450 TOMAHAWK MAX II', category: 'motherboard', brand: 'MSI', price: 110, specifications: { socket: 'AM4', formFactor: 'atx', ramType: 'DDR4', ramSlots: 4, maxRamSpeed: 3600, m2Slots: 2, sataPorts: 6 } },
  { name: 'ASUS PRIME B550M-A', category: 'motherboard', brand: 'ASUS', price: 90, specifications: { socket: 'AM4', formFactor: 'microatx', ramType: 'DDR4', ramSlots: 4, maxRamSpeed: 4400, m2Slots: 2, sataPorts: 4 } },

  // Memoria RAM
  { name: 'Corsair Vengeance 8GB DDR4 3200', category: 'ram', brand: 'Corsair', price: 30, specifications: { type: 'DDR4', capacityTotal: 8, modules: 1, speed: 3200 } },
  { name: 'Corsair Vengeance 16GB DDR4 3200', category: 'ram', brand: 'Corsair', price: 55, specifications: { type: 'DDR4', capacityTotal: 16, modules: 2, speed: 3200 } },
  { name: 'Corsair Vengeance 32GB DDR4 3600', category: 'ram', brand: 'Corsair', price: 95, specifications: { type: 'DDR4', capacityTotal: 32, modules: 2, speed: 3600 } },
  { name: 'G.Skill Trident Z5 RGB 32GB DDR5 6000', category: 'ram', brand: 'G.Skill', price: 135, specifications: { type: 'DDR5', capacityTotal: 32, modules: 2, speed: 6000 } },
  { name: 'Kingston Fury Beast 64GB DDR5 6400', category: 'ram', brand: 'Kingston', price: 210, specifications: { type: 'DDR5', capacityTotal: 64, modules: 2, speed: 6400 } },

  // GPU
  { name: 'AMD Radeon RX 6600 8GB', category: 'gpu', brand: 'AMD', price: 230, specifications: { vram: 8, tdp: 132, lengthMm: 200, recommendedPsu: 450 } },
  { name: 'NVIDIA RTX 4060 8GB', category: 'gpu', brand: 'NVIDIA', price: 300, specifications: { vram: 8, tdp: 115, lengthMm: 240, recommendedPsu: 550 } },
  { name: 'AMD Radeon RX 7600 8GB', category: 'gpu', brand: 'AMD', price: 270, specifications: { vram: 8, tdp: 165, lengthMm: 240, recommendedPsu: 550 } },
  { name: 'NVIDIA RTX 4070 Super 12GB', category: 'gpu', brand: 'NVIDIA', price: 600, specifications: { vram: 12, tdp: 220, lengthMm: 280, recommendedPsu: 650 } },
  { name: 'NVIDIA RTX 4080 Super 16GB', category: 'gpu', brand: 'NVIDIA', price: 1000, specifications: { vram: 16, tdp: 320, lengthMm: 310, recommendedPsu: 750 } },
  { name: 'AMD Radeon RX 7900 XTX 24GB', category: 'gpu', brand: 'AMD', price: 950, specifications: { vram: 24, tdp: 355, lengthMm: 287, recommendedPsu: 800 } },
  { name: 'NVIDIA RTX 4090 24GB', category: 'gpu', brand: 'NVIDIA', price: 1700, specifications: { vram: 24, tdp: 450, lengthMm: 336, recommendedPsu: 850 } },

  // Almacenamiento
  { name: 'Crucial P3 500GB NVMe', category: 'storage', brand: 'Crucial', price: 50, specifications: { interface: 'NVMe M.2', capacity: 500, formFactor: 'M.2 2280' } },
  { name: 'Kingston NV2 1TB NVMe', category: 'storage', brand: 'Kingston', price: 55, specifications: { interface: 'NVMe M.2', capacity: 1000, formFactor: 'M.2 2280' } },
  { name: 'Samsung 980 Pro 1TB NVMe', category: 'storage', brand: 'Samsung', price: 90, specifications: { interface: 'NVMe M.2', capacity: 1000, formFactor: 'M.2 2280' } },
  { name: 'WD Blue SN580 2TB NVMe', category: 'storage', brand: 'Western Digital', price: 130, specifications: { interface: 'NVMe M.2', capacity: 2000, formFactor: 'M.2 2280' } },
  { name: 'Seagate BarraCuda 2TB', category: 'storage', brand: 'Seagate', price: 60, specifications: { interface: 'SATA 6Gb/s', capacity: 2000, formFactor: '3.5"' } },

  // Fuentes de poder
  { name: 'EVGA 450 BR 80+ Bronze', category: 'psu', brand: 'EVGA', price: 45, specifications: { wattage: 450, grade: '80+ Bronze', modular: false } },
  { name: 'EVGA 600 W1 80+', category: 'psu', brand: 'EVGA', price: 60, specifications: { wattage: 600, grade: '80+', modular: false } },
  { name: 'Thermaltake Smart 750W 80+ White', category: 'psu', brand: 'Thermaltake', price: 70, specifications: { wattage: 750, grade: '80+ White', modular: false } },
  { name: 'Corsair RM650x 80+ Gold', category: 'psu', brand: 'Corsair', price: 110, specifications: { wattage: 650, grade: '80+ Gold', modular: true } },
  { name: 'Corsair RM850x 80+ Gold', category: 'psu', brand: 'Corsair', price: 150, specifications: { wattage: 850, grade: '80+ Gold', modular: true } },
  { name: 'Seasonic Focus GX-1000 80+ Gold', category: 'psu', brand: 'Seasonic', price: 190, specifications: { wattage: 1000, grade: '80+ Gold', modular: true } },

  // Refrigeración
  { name: 'Cooler Master Hyper 212', category: 'cooling', brand: 'Cooler Master', price: 40, specifications: { type: 'air', tdpRating: 150, radiatorSize: 0 } },
  { name: 'be quiet! Pure Rock 2', category: 'cooling', brand: 'be quiet!', price: 45, specifications: { type: 'air', tdpRating: 150, radiatorSize: 0 } },
  { name: 'Noctua NH-U12S', category: 'cooling', brand: 'Noctua', price: 70, specifications: { type: 'air', tdpRating: 150, radiatorSize: 0 } },
  { name: 'Arctic Liquid Freezer III 240', category: 'cooling', brand: 'Arctic', price: 100, specifications: { type: 'liquid', tdpRating: 240, radiatorSize: 240 } },
  { name: 'Corsair iCUE H150i 360', category: 'cooling', brand: 'Corsair', price: 160, specifications: { type: 'liquid', tdpRating: 280, radiatorSize: 360 } },

  // Gabinetes
  { name: 'Cooler Master MasterBox Q300L', category: 'case', brand: 'Cooler Master', price: 50, specifications: { formFactor: 'microatx', maxGpuLength: 360, radiatorSupport: 120 } },
  { name: 'Fractal Design Meshify C', category: 'case', brand: 'Fractal Design', price: 90, specifications: { formFactor: 'atx', maxGpuLength: 315, radiatorSupport: 360 } },
  { name: 'NZXT H5 Flow', category: 'case', brand: 'NZXT', price: 95, specifications: { formFactor: 'atx', maxGpuLength: 365, radiatorSupport: 280 } },
  { name: 'Lian Li Lancool 216', category: 'case', brand: 'Lian Li', price: 100, specifications: { formFactor: 'atx', maxGpuLength: 392, radiatorSupport: 360 } },
  { name: 'Corsair 4000D Airflow', category: 'case', brand: 'Corsair', price: 110, specifications: { formFactor: 'atx', maxGpuLength: 360, radiatorSupport: 360 } },
  { name: 'NZXT H210i', category: 'case', brand: 'NZXT', price: 110, specifications: { formFactor: 'mini-itx', maxGpuLength: 325, radiatorSupport: 240 } },
];

const presets = [
  {
    useType: 'gaming',
    name: 'Gaming Starter',
    description: 'Una build para jugar a 1080p sin gastar de más.',
    budget: 900,
    components: {
      cpu: 'AMD Ryzen 5 5600G',
      motherboard: 'ASUS PRIME B550M-A',
      ram: 'Corsair Vengeance 16GB DDR4 3200',
      gpu: 'AMD Radeon RX 6600 8GB',
      storage: 'Kingston NV2 1TB NVMe',
      psu: 'EVGA 600 W1 80+',
      cooling: 'Cooler Master Hyper 212',
      case: 'Cooler Master MasterBox Q300L',
    },
  },
  {
    useType: 'gaming',
    name: 'Gaming High-End',
    description: 'Rendimiento tope para 1440p y 4K.',
    budget: 2300,
    components: {
      cpu: 'AMD Ryzen 7 7800X3D',
      motherboard: 'GIGABYTE B650 AORUS Elite AX',
      ram: 'G.Skill Trident Z5 RGB 32GB DDR5 6000',
      gpu: 'NVIDIA RTX 4080 Super 16GB',
      storage: 'Samsung 980 Pro 1TB NVMe',
      psu: 'Corsair RM850x 80+ Gold',
      cooling: 'Arctic Liquid Freezer III 240',
      case: 'Lian Li Lancool 216',
    },
  },
  {
    useType: 'office',
    name: 'Oficina Eficiente',
    description: 'Productividad diaria y multitarea ligera.',
    budget: 600,
    components: {
      cpu: 'AMD Ryzen 5 5600G',
      motherboard: 'ASUS PRIME B550M-A',
      ram: 'Corsair Vengeance 16GB DDR4 3200',
      storage: 'Kingston NV2 1TB NVMe',
      psu: 'EVGA 450 BR 80+ Bronze',
      case: 'Cooler Master MasterBox Q300L',
    },
  },
  {
    useType: 'editing',
    name: 'Edición de Video',
    description: 'Muchos núcleos y mucha memoria para render.',
    budget: 2200,
    components: {
      cpu: 'AMD Ryzen 9 7950X',
      motherboard: 'GIGABYTE B650 AORUS Elite AX',
      ram: 'Kingston Fury Beast 64GB DDR5 6400',
      gpu: 'NVIDIA RTX 4070 Super 12GB',
      storage: 'Samsung 980 Pro 1TB NVMe',
      psu: 'Corsair RM850x 80+ Gold',
      cooling: 'Arctic Liquid Freezer III 240',
      case: 'Corsair 4000D Airflow',
    },
  },
  {
    useType: 'development',
    name: 'Desarrollo Estándar',
    description: 'Compilación y contenedores sin fricción.',
    budget: 1100,
    components: {
      cpu: 'Intel Core i5-13400F',
      motherboard: 'MSI PRO B760-P WiFi',
      ram: 'Corsair Vengeance 32GB DDR4 3600',
      gpu: 'NVIDIA RTX 4060 8GB',
      storage: 'Samsung 980 Pro 1TB NVMe',
      psu: 'Corsair RM650x 80+ Gold',
      cooling: 'Cooler Master Hyper 212',
      case: 'NZXT H5 Flow',
    },
  },
];

async function seed() {
  await connectDB();

  await Component.deleteMany({});
  await PresetBuild.deleteMany({});

  await Component.insertMany(components);
  console.log(`Componentes insertados: ${components.length}`);

  for (const preset of presets) {
    const componentIds = {};
    let totalPrice = 0;
    for (const [category, name] of Object.entries(preset.components)) {
      const component = await Component.findOne({ name });
      if (!component) {
        console.warn(`  [preset ${preset.name}] no se encontró: ${name}`);
        continue;
      }
      componentIds[category] = component._id;
      totalPrice += component.price;
    }
    await PresetBuild.create({
      name: preset.name,
      useType: preset.useType,
      description: preset.description,
      budget: preset.budget,
      components: componentIds,
      totalPrice,
    });
    console.log(`  Preset creado: ${preset.name} ($${totalPrice})`);
  }

  await mongoose.disconnect();
  console.log('Seed completado.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});