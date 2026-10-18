export const CATEGORIES = ["cpu", "motherboard", "ram", "gpu", "storage", "psu", "case", "cooler"] as const;
export type Category = (typeof CATEGORIES)[number];

export type FormFactor = "ATX" | "mATX" | "ITX";

export interface Part {
  id: string;
  category: Category;
  name: string;
  brand: string;
  price: number;
  /** 0-100 relative performance within its category */
  perf: number;
  specs: string;
  socket?: string;
  ramType?: "DDR4" | "DDR5";
  tdp?: number;
  watts?: number;
  formFactor?: FormFactor;
  supports?: FormFactor[];
  compact?: boolean;
  igpu?: boolean;
  sizeGB?: number;
  capacityGB?: number;
  coolerTdp?: number;
  rgb?: boolean;
  wifi?: boolean;
}

export type Build = Record<Category, string>;

export const PURPOSES = [
  "personal",
  "office",
  "graphic-design",
  "gaming",
  "video-editing",
  "programming",
] as const;
export type Purpose = (typeof PURPOSES)[number];

export interface Requirements {
  /** one or more intended uses, e.g. gaming + video editing */
  purposes: Purpose[];
  budget: number;
  cpuBrand: "any" | "Intel" | "AMD";
  gpuBrand: "any" | "NVIDIA" | "AMD";
  minRamGB: number;
  minStorageGB: number;
  size: "any" | "compact";
  gpuMode: "auto" | "dedicated" | "integrated";
  rgb: boolean;
  wifi: boolean;
  futureProof: boolean;
  notes: string;
}

export interface Quote {
  /** value | balanced | performance | custom */
  id: string;
  summary: string;
  build: Build;
  total: number;
  source: "ai" | "rules";
}
