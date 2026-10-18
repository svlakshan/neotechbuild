import type { Category, Part } from "@/lib/types";

// SAMPLE DATA (prices in LKR) – replace names, stock and prices with your real catalog.
export const parts: Part[] = [
  // CPUs
  { id: "cpu-i3-12100f", category: "cpu", brand: "Intel", name: "Intel Core i3-12100F", price: 28500, perf: 28, specs: "4C/8T · up to 4.3GHz · no iGPU", socket: "LGA1700", tdp: 58 },
  { id: "cpu-i5-12400", category: "cpu", brand: "Intel", name: "Intel Core i5-12400", price: 45000, perf: 42, specs: "6C/12T · up to 4.4GHz · UHD 730", socket: "LGA1700", tdp: 65, igpu: true },
  { id: "cpu-i5-13400f", category: "cpu", brand: "Intel", name: "Intel Core i5-13400F", price: 57000, perf: 54, specs: "10C/16T · up to 4.6GHz · no iGPU", socket: "LGA1700", tdp: 65 },
  { id: "cpu-i5-14600k", category: "cpu", brand: "Intel", name: "Intel Core i5-14600K", price: 96000, perf: 75, specs: "14C/20T · up to 5.3GHz", socket: "LGA1700", tdp: 125, igpu: true },
  { id: "cpu-i7-14700k", category: "cpu", brand: "Intel", name: "Intel Core i7-14700K", price: 123000, perf: 86, specs: "20C/28T · up to 5.6GHz", socket: "LGA1700", tdp: 125, igpu: true },
  { id: "cpu-r5-5600", category: "cpu", brand: "AMD", name: "AMD Ryzen 5 5600", price: 37500, perf: 40, specs: "6C/12T · up to 4.4GHz · no iGPU", socket: "AM4", tdp: 65 },
  { id: "cpu-r5-5600g", category: "cpu", brand: "AMD", name: "AMD Ryzen 5 5600G", price: 40500, perf: 38, specs: "6C/12T · Radeon graphics", socket: "AM4", tdp: 65, igpu: true },
  { id: "cpu-r5-7600", category: "cpu", brand: "AMD", name: "AMD Ryzen 5 7600", price: 60000, perf: 56, specs: "6C/12T · up to 5.1GHz · AM5", socket: "AM5", tdp: 65, igpu: true },
  { id: "cpu-r7-7700", category: "cpu", brand: "AMD", name: "AMD Ryzen 7 7700", price: 87000, perf: 68, specs: "8C/16T · up to 5.3GHz", socket: "AM5", tdp: 65, igpu: true },
  { id: "cpu-r7-7800x3d", category: "cpu", brand: "AMD", name: "AMD Ryzen 7 7800X3D", price: 120000, perf: 84, specs: "8C/16T · 3D V-Cache · top gaming CPU", socket: "AM5", tdp: 120, igpu: true },
  { id: "cpu-r9-7950x", category: "cpu", brand: "AMD", name: "AMD Ryzen 9 7950X", price: 156000, perf: 96, specs: "16C/32T · up to 5.7GHz", socket: "AM5", tdp: 170, igpu: true },

  // Motherboards
  { id: "mb-h610m", category: "motherboard", brand: "ASUS", name: "ASUS Prime H610M-K (DDR4)", price: 24000, perf: 20, specs: "LGA1700 · mATX · DDR4", socket: "LGA1700", ramType: "DDR4", formFactor: "mATX" },
  { id: "mb-b760m-d4", category: "motherboard", brand: "MSI", name: "MSI PRO B760M-P (DDR4)", price: 33000, perf: 40, specs: "LGA1700 · mATX · DDR4", socket: "LGA1700", ramType: "DDR4", formFactor: "mATX" },
  { id: "mb-b760-d5", category: "motherboard", brand: "Gigabyte", name: "Gigabyte B760 Gaming X (DDR5)", price: 45000, perf: 55, specs: "LGA1700 · ATX · DDR5 · PCIe 4.0", socket: "LGA1700", ramType: "DDR5", formFactor: "ATX", wifi: true },
  { id: "mb-z790-d5", category: "motherboard", brand: "ASUS", name: "ASUS TUF Gaming Z790-Plus (DDR5)", price: 69000, perf: 80, specs: "LGA1700 · ATX · DDR5 · overclocking", socket: "LGA1700", ramType: "DDR5", formFactor: "ATX", wifi: true },
  { id: "mb-a520m", category: "motherboard", brand: "ASRock", name: "ASRock A520M-HDV", price: 21000, perf: 20, specs: "AM4 · mATX · DDR4", socket: "AM4", ramType: "DDR4", formFactor: "mATX" },
  { id: "mb-b550", category: "motherboard", brand: "MSI", name: "MSI B550 Gaming Plus", price: 33000, perf: 45, specs: "AM4 · ATX · DDR4 · PCIe 4.0", socket: "AM4", ramType: "DDR4", formFactor: "ATX" },
  { id: "mb-b650m", category: "motherboard", brand: "Gigabyte", name: "Gigabyte B650M Gaming Plus WiFi", price: 40500, perf: 50, specs: "AM5 · mATX · DDR5 · WiFi", socket: "AM5", ramType: "DDR5", formFactor: "mATX", wifi: true },
  { id: "mb-b650", category: "motherboard", brand: "MSI", name: "MSI MAG B650 Tomahawk WiFi", price: 57000, perf: 72, specs: "AM5 · ATX · DDR5 · WiFi 6E", socket: "AM5", ramType: "DDR5", formFactor: "ATX", wifi: true },
  { id: "mb-b650i", category: "motherboard", brand: "ASUS", name: "ASUS ROG Strix B650E-I", price: 78000, perf: 78, specs: "AM5 · Mini-ITX · DDR5 · WiFi 6E", socket: "AM5", ramType: "DDR5", formFactor: "ITX", wifi: true },
  { id: "mb-x670e", category: "motherboard", brand: "ASUS", name: "ASUS ROG Strix X670E-E", price: 114000, perf: 95, specs: "AM5 · ATX · DDR5 · PCIe 5.0", socket: "AM5", ramType: "DDR5", formFactor: "ATX", wifi: true },

  // Memory
  { id: "ram-d4-16", category: "ram", brand: "Corsair", name: "Corsair Vengeance 16GB (2x8) DDR4-3200", price: 12000, perf: 30, specs: "16GB · DDR4-3200", ramType: "DDR4", sizeGB: 16 },
  { id: "ram-d4-32", category: "ram", brand: "Corsair", name: "Corsair Vengeance 32GB (2x16) DDR4-3600", price: 21000, perf: 55, specs: "32GB · DDR4-3600", ramType: "DDR4", sizeGB: 32 },
  { id: "ram-d5-16", category: "ram", brand: "Kingston", name: "Kingston Fury Beast 16GB (2x8) DDR5-5600", price: 16500, perf: 35, specs: "16GB · DDR5-5600", ramType: "DDR5", sizeGB: 16 },
  { id: "ram-d5-32", category: "ram", brand: "G.Skill", name: "G.Skill Ripjaws 32GB (2x16) DDR5-6000", price: 28500, perf: 65, specs: "32GB · DDR5-6000", ramType: "DDR5", sizeGB: 32 },
  { id: "ram-d5-64", category: "ram", brand: "G.Skill", name: "G.Skill Trident Z5 64GB (2x32) DDR5-6000", price: 57000, perf: 90, specs: "64GB · DDR5-6000", ramType: "DDR5", sizeGB: 64 },

  // Graphics
  { id: "gpu-igpu", category: "gpu", brand: "Integrated", name: "Integrated graphics (no dedicated GPU)", price: 0, perf: 4, specs: "Uses CPU graphics · office & light tasks", tdp: 0 },
  { id: "gpu-3050", category: "gpu", brand: "NVIDIA", name: "NVIDIA GeForce RTX 3050 6GB", price: 54000, perf: 22, specs: "6GB GDDR6 · 1080p entry", tdp: 70 },
  { id: "gpu-rx6600", category: "gpu", brand: "AMD", name: "AMD Radeon RX 6600 8GB", price: 60000, perf: 30, specs: "8GB GDDR6 · solid 1080p", tdp: 132 },
  { id: "gpu-4060", category: "gpu", brand: "NVIDIA", name: "NVIDIA GeForce RTX 4060 8GB", price: 90000, perf: 44, specs: "8GB GDDR6 · DLSS 3 · 1080p high", tdp: 115 },
  { id: "gpu-4060ti", category: "gpu", brand: "NVIDIA", name: "NVIDIA GeForce RTX 4060 Ti 16GB", price: 135000, perf: 54, specs: "16GB GDDR6 · 1440p ready", tdp: 160 },
  { id: "gpu-7800xt", category: "gpu", brand: "AMD", name: "AMD Radeon RX 7800 XT 16GB", price: 150000, perf: 68, specs: "16GB GDDR6 · strong 1440p", tdp: 263 },
  { id: "gpu-4070s", category: "gpu", brand: "NVIDIA", name: "NVIDIA GeForce RTX 4070 Super 12GB", price: 186000, perf: 73, specs: "12GB GDDR6X · 1440p ultra", tdp: 220 },
  { id: "gpu-4070tis", category: "gpu", brand: "NVIDIA", name: "NVIDIA GeForce RTX 4070 Ti Super 16GB", price: 240000, perf: 83, specs: "16GB GDDR6X · 4K capable", tdp: 285 },
  { id: "gpu-4080s", category: "gpu", brand: "NVIDIA", name: "NVIDIA GeForce RTX 4080 Super 16GB", price: 300000, perf: 91, specs: "16GB GDDR6X · 4K high refresh", tdp: 320 },
  { id: "gpu-4090", category: "gpu", brand: "NVIDIA", name: "NVIDIA GeForce RTX 4090 24GB", price: 570000, perf: 100, specs: "24GB GDDR6X · no-compromise 4K", tdp: 450 },

  // Storage
  { id: "ssd-500", category: "storage", brand: "WD", name: "WD Blue SN580 500GB NVMe", price: 12000, perf: 30, specs: "500GB · NVMe Gen4", capacityGB: 500 },
  { id: "ssd-1000", category: "storage", brand: "WD", name: "WD Blue SN580 1TB NVMe", price: 19500, perf: 45, specs: "1TB · NVMe Gen4", capacityGB: 1000 },
  { id: "ssd-1000-g4", category: "storage", brand: "Samsung", name: "Samsung 980 Pro 1TB NVMe", price: 27000, perf: 70, specs: "1TB · NVMe Gen4 fast", capacityGB: 1000 },
  { id: "ssd-2000", category: "storage", brand: "Samsung", name: "Samsung 990 Pro 2TB NVMe", price: 48000, perf: 85, specs: "2TB · NVMe Gen4 fast", capacityGB: 2000 },
  { id: "ssd-4000", category: "storage", brand: "Crucial", name: "Crucial T500 4TB NVMe", price: 87000, perf: 95, specs: "4TB · NVMe Gen4", capacityGB: 4000 },

  // Power supplies
  { id: "psu-450", category: "psu", brand: "Cooler Master", name: "Cooler Master MWE 450W Bronze", price: 13500, perf: 20, specs: "450W · 80+ Bronze", watts: 450 },
  { id: "psu-550", category: "psu", brand: "Corsair", name: "Corsair CX550 550W Bronze", price: 18000, perf: 30, specs: "550W · 80+ Bronze", watts: 550 },
  { id: "psu-650", category: "psu", brand: "Corsair", name: "Corsair RM650e 650W Gold", price: 27000, perf: 50, specs: "650W · 80+ Gold · modular", watts: 650 },
  { id: "psu-750", category: "psu", brand: "MSI", name: "MSI MAG A750GL 750W Gold", price: 33000, perf: 60, specs: "750W · 80+ Gold · modular", watts: 750 },
  { id: "psu-850", category: "psu", brand: "Corsair", name: "Corsair RM850e 850W Gold", price: 42000, perf: 75, specs: "850W · 80+ Gold · modular", watts: 850 },
  { id: "psu-1000", category: "psu", brand: "Seasonic", name: "Seasonic Focus GX-1000 Gold", price: 57000, perf: 90, specs: "1000W · 80+ Gold · modular", watts: 1000 },

  // Cases
  { id: "case-budget", category: "case", brand: "Deepcool", name: "Deepcool Macube 110 (mATX)", price: 16500, perf: 20, specs: "mATX/ITX · compact tower", supports: ["mATX", "ITX"], compact: true },
  { id: "case-atx-basic", category: "case", brand: "Cooler Master", name: "Cooler Master MasterBox NR600", price: 21000, perf: 35, specs: "ATX mid tower · mesh front", supports: ["ATX", "mATX", "ITX"] },
  { id: "case-airflow", category: "case", brand: "Lian Li", name: "Lian Li Lancool 216", price: 30000, perf: 60, specs: "ATX · high airflow · 2 fans", supports: ["ATX", "mATX", "ITX"] },
  { id: "case-rgb", category: "case", brand: "NZXT", name: "NZXT H5 Flow RGB", price: 39000, perf: 70, specs: "ATX · tempered glass · RGB fans", supports: ["ATX", "mATX", "ITX"], rgb: true },
  { id: "case-itx", category: "case", brand: "Fractal", name: "Fractal Ridge (Mini-ITX)", price: 37500, perf: 55, specs: "Mini-ITX · slim, compact", supports: ["ITX"], compact: true },
  { id: "case-premium", category: "case", brand: "Lian Li", name: "Lian Li O11 Dynamic EVO RGB", price: 57000, perf: 90, specs: "ATX · dual chamber · RGB", supports: ["ATX", "mATX", "ITX"], rgb: true },

  // Coolers
  { id: "cool-stock", category: "cooler", brand: "Bundled", name: "Stock cooler", price: 0, perf: 10, specs: "Included with CPU · up to 65W", coolerTdp: 65 },
  { id: "cool-tower", category: "cooler", brand: "Thermalright", name: "Thermalright Assassin X 120", price: 6500, perf: 50, specs: "Single tower air · up to 150W", coolerTdp: 150 },
  { id: "cool-dual", category: "cooler", brand: "Deepcool", name: "Deepcool AK620", price: 18000, perf: 70, specs: "Dual tower air · up to 220W", coolerTdp: 220 },
  { id: "cool-240", category: "cooler", brand: "Arctic", name: "Arctic Liquid Freezer III 240", price: 30000, perf: 85, specs: "240mm AIO · up to 250W", coolerTdp: 250, rgb: true },
  { id: "cool-360", category: "cooler", brand: "Arctic", name: "Arctic Liquid Freezer III 360", price: 39000, perf: 95, specs: "360mm AIO · up to 350W", coolerTdp: 350, rgb: true },
];

export const partsById = new Map(parts.map((p) => [p.id, p]));
export const partsByCategory = (c: Category) => parts.filter((p) => p.category === c);
