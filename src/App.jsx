// EVOKE — Italian Luxury Bath & Architectural Interiors
// Complete SPA: Public Site + Admin Panel

import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchProducts, saveProduct, deleteProduct,
  fetchCollections, saveCollection, deleteCollection,
  fetchFinishes, saveFinish, deleteFinish,
  fetchCategories, saveCategory,
  submitEnquiry,
  seedDefaults,
} from "./lib/db.js";

// ── Product images (Vite resolves & hashes these at build time) ──
import imgVHBF001 from "./assets/VH-BF-001.jpg";
import imgVHBF002 from "./assets/VH-BF-002.jpg";
import heroBgVideo from "./assets/hero-bg.mp4";
import imgVHSS001 from "./assets/VH-SS-001.jpg";
import imgVHSS002 from "./assets/VH-SS-002.jpg";
import imgVHWB001 from "./assets/VH-WB-001.jpg";
import imgVHLV001 from "./assets/VH-LV-001.jpg";

// ── New product images ──
import imgVHBF003 from "./assets/VH-BF-003.jpg";
import imgVHBF004 from "./assets/VH-BF-004.jpg";
import imgVHSS003 from "./assets/VH-SS-003.jpg";
import imgVHSS004 from "./assets/VH-SS-004.jpg";
import imgVHWB002 from "./assets/VH-WB-002.jpg";
import imgVHWB003 from "./assets/VH-WB-003.jpg";
import imgVHLV002 from "./assets/VH-LV-002.jpg";
import imgVHLV003 from "./assets/VH-LV-003.jpg";
import imgEVMR001 from "./assets/EV-MR-001.jpg";
import imgEVMR002 from "./assets/EV-MR-002.jpg";
import imgEVMR003 from "./assets/EV-MR-003.jpg";
import imgEVMR004 from "./assets/EV-MR-004.jpg";
import imgEVSW001 from "./assets/EV-SW-001.jpg";
import imgEVBL001 from "./assets/EV-BL-001.jpg";
import imgEVBL002 from "./assets/EV-BL-002.jpg";
import imgEVAC001 from "./assets/EV-AC-001.jpg";
import imgEVAC002 from "./assets/EV-AC-002.jpg";

// ── Collection lifestyle images ──
import imgColMilano  from "./assets/collection-milano.jpg";
import imgColComo    from "./assets/collection-como.jpg";
import imgColVerona  from "./assets/collection-verona.jpg";

// ── Project images ──
import imgProjAurelia  from "./assets/project-aurelia.jpg";
import imgProjStRegis  from "./assets/project-stregis.jpg";
import imgProjMeridian from "./assets/project-meridian.jpg";

// ═══════════════════════════════════════════
// CONSTANTS & MOCK DATA
// ═══════════════════════════════════════════

const ALLOWED_ADMIN_EMAILS = ["gangulanandan@gmail.com"];

const COLLECTIONS = [
  { id: "milano", name: "Milano", mood: "Sharp geometry. Polished chrome. Milanese restraint." },
  { id: "como", name: "Como", mood: "Fluid curves. Brushed nickel. Lakeside serenity." },
  { id: "verona", name: "Verona", mood: "Classic proportion. Matte black. Timeless authority." },
];

const FINISHES_DEFAULT = [
  { id: "chrome", label: "Chrome", hex: "#C8C8C8" },
  { id: "brushed-nickel", label: "Brushed Nickel", hex: "#A7A39B" },
  { id: "matte-black", label: "Matte Black", hex: "#1C1C1C" },
  { id: "brushed-gold", label: "Brushed Gold", hex: "#C9A96E" },
  { id: "satin-black", label: "Satin Black", hex: "#2C2C2C" },
];

// ── The 6 top-level categories shown in navigation ───────────
// subcategory IDs live only inside the subcategories array (never as separate rows).
// Products: categoryId = one of the 6 IDs, subcategoryId = a leaf subcategory id.
const CATEGORIES_DEFAULT = [
  {
    id: "bath-fittings", name: "Bath Fittings", descriptor: "Mixers, faucets and integrated systems",
    subcategories: [
      { id: "wall-mounted-mixers",  name: "Wall-Mounted Mixers",  descriptor: "Precision engineered for wall installation" },
      { id: "deck-mounted-mixers",  name: "Deck-Mounted Mixers",  descriptor: "Surface-mounted basin and bath mixers" },
      { id: "concealed-mixers",     name: "Concealed Mixers",     descriptor: "Recessed systems for architectural interiors" },
      { id: "sensor-faucets",       name: "Sensor Faucets",       descriptor: "Touchless precision for hospitality spaces" },
    ]
  },
  {
    id: "shower-systems", name: "Shower Systems", descriptor: "Rain, handheld and thermostatic",
    subcategories: [
      { id: "rain-showerheads",     name: "Rain Showerheads",     descriptor: "Overhead rainfall experience" },
      { id: "handheld-showers",     name: "Handheld Showers",     descriptor: "Flexible precision delivery" },
      { id: "thermostatic-systems", name: "Thermostatic Systems", descriptor: "Precision temperature control" },
      { id: "shower-columns",       name: "Shower Columns",       descriptor: "Integrated column systems" },
    ]
  },
  {
    id: "wash-basins", name: "Wash Basins", descriptor: "Counter, wall-hung and vessel",
    subcategories: [
      { id: "counter-top-basins",   name: "Counter-Top Basins",   descriptor: "Surface-mounted installations" },
      { id: "wall-hung-basins",     name: "Wall-Hung Basins",     descriptor: "Clean architectural suspension" },
      { id: "vessel-basins",        name: "Vessel Basins",        descriptor: "Above-counter statement pieces" },
      { id: "under-counter-basins", name: "Under-Counter Basins", descriptor: "Seamless vanity integration" },
    ]
  },
  {
    id: "luxury-vanities", name: "Vanities", descriptor: "Custom cabinetry and integrated units",
    subcategories: [
      { id: "wall-hung-vanities",   name: "Wall-Hung Vanities",   descriptor: "Floating minimalist storage" },
      { id: "freestanding-vanities",name: "Freestanding Vanities",descriptor: "Statement floor-standing units" },
      { id: "double-vanities",      name: "Double Vanities",      descriptor: "His and hers specifications" },
      { id: "custom-units",         name: "Custom Units",         descriptor: "Bespoke project specifications" },
    ]
  },
  {
    id: "mirrors", name: "Mirrors", descriptor: "Framed, frameless and illuminated",
    subcategories: [
      { id: "led-smart-mirrors",    name: "LED Smart Mirrors",    descriptor: "Integrated illumination systems" },
      { id: "frameless-mirrors",    name: "Frameless Mirrors",    descriptor: "Edge-to-edge glass clarity" },
      { id: "framed-mirrors",       name: "Framed Mirrors",       descriptor: "Defined architectural frames" },
      { id: "shaving-mirrors",      name: "Shaving Mirrors",      descriptor: "Precision magnification" },
    ]
  },
  {
    // Merged category: sanitaryware + bathroom lighting + accessories
    id: "sanitaryware-accessories", name: "Sanitaryware & Accessories",
    descriptor: "WCs, lighting, towel rails and bathroom accessories",
    subcategories: [
      // Sanitaryware
      { id: "wall-hung-wcs",        name: "Wall-Hung WCs",        descriptor: "Floating pan installations" },
      { id: "close-coupled-wcs",    name: "Close-Coupled WCs",    descriptor: "Classic integrated cisterns" },
      { id: "bidets",               name: "Bidets",               descriptor: "Italian hygiene tradition" },
      { id: "cisterns",             name: "Cisterns",             descriptor: "Concealed and exposed systems" },
      // Bathroom lighting
      { id: "mirror-lighting",      name: "Mirror Lighting",      descriptor: "Task and vanity illumination" },
      { id: "recessed-lighting",    name: "Recessed Lighting",    descriptor: "Flush architectural integration" },
      { id: "ceiling-fixtures",     name: "Ceiling Fixtures",     descriptor: "Overhead ambient systems" },
      { id: "heated-lamps",         name: "Heated Lamps",         descriptor: "Warmth and ambience combined" },
      // Accessories
      { id: "towel-rails",          name: "Towel Rails",          descriptor: "Heated and unheated systems" },
      { id: "soap-dispensers",      name: "Soap Dispensers",      descriptor: "Wall-mounted and deck options" },
      { id: "robe-hooks",           name: "Robe Hooks",           descriptor: "Single and double configurations" },
      { id: "toilet-roll-holders",  name: "Toilet Roll Holders",  descriptor: "Recessed and surface-mounted" },
    ]
  },
];

// Legacy category ID → new top-level category ID mapping
// Used to remap products whose categoryId is an old standalone category.
const LEGACY_CAT_MAP = {
  "sanitaryware":     "sanitaryware-accessories",
  "bathroom-lighting":"sanitaryware-accessories",
  "accessories":      "sanitaryware-accessories",
};

const PRODUCTS_DEFAULT = [
  {
    id: "VH-BF-001", name: "Elara Wall-Mounted Basin Mixer",
    categoryId: "bath-fittings", subcategoryId: "wall-mounted-mixers", collectionId: "milano",
    published: true, featured: true, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A study in geometric restraint, the Elara mixer brings Milanese precision to the wash basin. Crafted from solid brass with a ceramic disc cartridge.",
    fullDescription: "The Elara Wall-Mounted Basin Mixer represents the finest expression of the Milano Collection — form reduced to its essential geometry, function elevated to art.",
    finishes: ["chrome", "brushed-nickel", "matte-black"],
    material: "Solid brass body, ceramic disc cartridge",
    additionalMaterial: "Stainless steel braided hose",
    features: ["Solid brass construction", "Ceramic disc cartridge — drip-free lifetime", "Compatible with all EVOKE Milano sanitaryware", "Available in 5 architectural finishes", "WRAS approved"],
    specifications: [{ key: "Cartridge Type", value: "Ceramic disc" }, { key: "Water Pressure", value: "0.5–5.0 bar" }, { key: "Flow Rate", value: "5 L/min at 3 bar" }, { key: "Certification", value: "WRAS, CE" }],
    dimensions: { height: 192, width: 44, depth: 176, spoutReach: 152, spoutHeight: 110, weight: 1.2 },
    tradePrice: 18500, mrp: 24000, pricingMode: "on-request", pricingNote: "",
    sku: "VH-BF-001-CHR", tags: ["basin mixer", "wall mounted", "milano"],
    images: [imgVHBF001], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-BF-002", "VH-SS-001"],
    metaTitle: "Elara Wall-Mounted Basin Mixer — EVOKE Milano",
    metaDescription: "Specification-grade wall-mounted basin mixer from the EVOKE Milano Collection.",
  },
  {
    id: "VH-BF-002", name: "Palazzo Deck-Mounted Bath Mixer",
    categoryId: "bath-fittings", subcategoryId: "deck-mounted-mixers", collectionId: "como",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "The Palazzo deck mixer channels the fluid elegance of the Como Collection. Brushed nickel finish, organic curves, enduring form.",
    fullDescription: "Inspired by the gentle curves of Lake Como's shores, the Palazzo mixer softens the geometry of the contemporary bath without sacrificing specification-grade performance.",
    finishes: ["brushed-nickel", "brushed-gold"],
    material: "Solid brass body, ceramic disc cartridge",
    additionalMaterial: "",
    features: ["Fluid curve geometry", "Single-lever precision control", "Como Collection compatible", "Suitable for 0.5–5 bar", "WRAS approved"],
    specifications: [{ key: "Cartridge Type", value: "Ceramic disc" }, { key: "Water Pressure", value: "0.5–5.0 bar" }],
    dimensions: { height: 220, width: 52, depth: 190, spoutReach: 168, spoutHeight: 130, weight: 1.5 },
    tradePrice: 22000, mrp: 29000, pricingMode: "on-request", pricingNote: "",
    sku: "VH-BF-002-BN", tags: ["bath mixer", "deck mounted", "como"],
    images: [imgVHBF002], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-BF-001", "VH-WB-001"],
    metaTitle: "Palazzo Deck-Mounted Bath Mixer — EVOKE Como", metaDescription: "",
  },
  {
    id: "VH-SS-001", name: "Cielo Rain Showerhead 300mm",
    categoryId: "shower-systems", subcategoryId: "rain-showerheads", collectionId: "milano",
    published: true, featured: true, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "The Cielo 300mm overhead rain showerhead delivers a wide, enveloping rainfall experience through 120 precision-laser-cut nozzles.",
    fullDescription: "Engineered for five-star hospitality environments and luxury residential projects, the Cielo rain showerhead pairs architectural proportion with hydrological precision.",
    finishes: ["chrome", "matte-black", "brushed-nickel"],
    material: "316L stainless steel body, silicone nozzles",
    additionalMaterial: "",
    features: ["120 laser-cut silicone nozzles", "Anti-limescale technology", "Compatible with EVOKE thermostatic systems", "Easy clean nozzle wipe"],
    specifications: [{ key: "Spray Pattern", value: "Full rainfall" }, { key: "Nozzles", value: "120 silicone" }, { key: "Flow Rate", value: "12 L/min at 3 bar" }],
    dimensions: { height: 8, width: 300, depth: 300, spoutReach: 0, spoutHeight: 0, weight: 0.9 },
    tradePrice: 14000, mrp: 19500, pricingMode: "on-request", pricingNote: "",
    sku: "VH-SS-001-CHR", tags: ["rain shower", "overhead", "milano"],
    images: [imgVHSS001], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-BF-001", "VH-SS-002"],
    metaTitle: "Cielo Rain Showerhead 300mm — EVOKE Milano", metaDescription: "",
  },
  {
    id: "VH-SS-002", name: "Terma Thermostatic Shower Column",
    categoryId: "shower-systems", subcategoryId: "shower-columns", collectionId: "verona",
    published: true, featured: false, stockStatus: "made-to-order",
    projectAvailability: true, retailAvailability: false,
    description: "The Terma thermostatic column integrates overhead rain, body jets, and a handheld shower within a single architectural statement piece.",
    fullDescription: "Specified for the most demanding hospitality and residential projects, the Terma column embodies the Verona Collection's commitment to classical proportion.",
    finishes: ["matte-black", "satin-black"],
    material: "Solid brass thermostatic body, stainless steel column",
    additionalMaterial: "",
    features: ["Integrated thermostatic cartridge", "300mm overhead rain", "4 body jets", "Handheld shower with 1.5m hose", "Anti-scald safety system"],
    specifications: [{ key: "Thermostatic Range", value: "20–50°C" }, { key: "Water Pressure", value: "1.0–5.0 bar" }, { key: "Outlets", value: "3 (overhead / jets / handheld)" }],
    dimensions: { height: 1200, width: 120, depth: 120, spoutReach: 0, spoutHeight: 0, weight: 8.5 },
    tradePrice: 85000, mrp: 110000, pricingMode: "on-request", pricingNote: "Hotel projects: minimum 10 units",
    sku: "VH-SS-002-MB", tags: ["thermostatic", "shower column", "verona"],
    images: [imgVHSS002], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-SS-001", "VH-BF-001"],
    metaTitle: "Terma Thermostatic Shower Column — EVOKE Verona", metaDescription: "",
  },
  {
    id: "VH-WB-001", name: "Lago Vessel Basin",
    categoryId: "wash-basins", subcategoryId: "vessel-basins", collectionId: "como",
    published: true, featured: true, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "The Lago vessel basin sits above the vanity surface like a singular sculptural object. Hand-finished ceramic in a soft matte white glaze.",
    fullDescription: "Drawn from the organic forms of Italian ceramic tradition, the Lago basin is produced in a single casting from vitreous ceramic, then hand-finished to a level of surface quality reserved for gallery objects.",
    finishes: ["matte-black"],
    material: "Vitreous ceramic, hand-finished matte white glaze",
    additionalMaterial: "",
    features: ["Single-cast vitreous ceramic", "Hand-finished surface", "Overflow integrated", "Compatible with all EVOKE wall-mounted mixers"],
    specifications: [{ key: "Material", value: "Vitreous ceramic" }, { key: "Glaze", value: "Matte white, hand-finished" }, { key: "Overflow", value: "Integrated" }],
    dimensions: { height: 148, width: 450, depth: 350, spoutReach: 0, spoutHeight: 0, weight: 9.2 },
    tradePrice: 32000, mrp: 42000, pricingMode: "on-request", pricingNote: "",
    sku: "VH-WB-001-MW", tags: ["vessel basin", "ceramic", "como"],
    images: [imgVHWB001], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-BF-002", "VH-LV-001"],
    metaTitle: "Lago Vessel Basin — EVOKE Como", metaDescription: "",
  },
  {
    id: "VH-LV-001", name: "Stanza Wall-Hung Vanity 1200mm",
    categoryId: "luxury-vanities", subcategoryId: "wall-hung-vanities", collectionId: "verona",
    published: true, featured: false, stockStatus: "made-to-order",
    projectAvailability: true, retailAvailability: true,
    description: "The Stanza vanity unit in American oak veneer with a floating wall-hung profile. Softclose drawers, integrated basin cut-out, matte black hardware.",
    fullDescription: "The Stanza 1200mm vanity represents EVOKE's specification furniture range — architectural joinery at bathroom scale, built to the same tolerances demanded of structural elements.",
    finishes: ["matte-black", "brushed-nickel"],
    material: "American oak veneer over MDF carcass, solid oak drawer fronts",
    additionalMaterial: "Matte black powder-coated hardware",
    features: ["Wall-hung floating installation", "Softclose undermount drawers", "Integrated basin cut-out (500mm)", "Matte black hardware throughout", "FSC-certified oak veneer"],
    specifications: [{ key: "Carcass", value: "MDF, moisture-resistant" }, { key: "Doors/Drawers", value: "Solid oak veneer, softclose" }, { key: "Hardware", value: "Matte black powder coat" }],
    dimensions: { height: 520, width: 1200, depth: 480, spoutReach: 0, spoutHeight: 0, weight: 42 },
    tradePrice: 95000, mrp: 130000, pricingMode: "on-request", pricingNote: "Lead time: 8 weeks",
    sku: "VH-LV-001-OAK", tags: ["vanity", "wall-hung", "oak", "verona"],
    images: [imgVHLV001], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-WB-001", "VH-BF-002"],
    metaTitle: "Stanza Wall-Hung Vanity 1200mm — EVOKE Verona", metaDescription: "",
  },
  // ── Mirrors ────────────────────────────────────────────────
  {
    id: "EV-MR-001", name: "Lumina LED Smart Mirror",
    categoryId: "mirrors", subcategoryId: "led-smart-mirrors", collectionId: "milano",
    published: true, featured: true, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "Integrated LED illumination with touch dimming. Anti-fog coating, backlit perimeter glow and warm/cool light temperature control.",
    fullDescription: "The Lumina Smart Mirror redefines bathroom illumination with precision-engineered LED technology. A perimeter backlight casts an even, flattering glow while the anti-fog system ensures clarity in all conditions.",
    finishes: ["brushed-nickel", "matte-black"],
    material: "Float glass, aluminium frame, LED strip",
    additionalMaterial: "IP44 rated driver, touch sensor panel",
    features: ["Anti-fog coating", "Touch dimmer control", "Warm/cool light temperature 2700–6500K", "IP44 splash-rated", "Milano Collection compatible"],
    specifications: [{ key: "Glass", value: "5mm float glass" }, { key: "LED Life", value: "50,000 hrs" }, { key: "IP Rating", value: "IP44" }, { key: "Light Temp", value: "2700–6500K" }],
    dimensions: { height: 800, width: 600, depth: 40, weight: 8.5 },
    tradePrice: 28000, mrp: 36000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-MR-001-BN", tags: ["smart mirror", "LED mirror", "illuminated", "anti-fog"],
    images: [imgEVMR001], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-MR-002", "VH-LV-001"],
    metaTitle: "Lumina LED Smart Mirror — EVOKE Milano", metaDescription: "Integrated LED smart mirror with anti-fog and touch dimming from EVOKE.",
  },
  {
    id: "EV-MR-002", name: "Arco Frameless Mirror",
    categoryId: "mirrors", subcategoryId: "frameless-mirrors", collectionId: "como",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A pure expression of architectural restraint. Polished edge frameless glass with a concealed wall bracket system.",
    fullDescription: "The Arco Frameless Mirror achieves visual weightlessness through concealed bracket fixings and polished edge glass. Available in standard and bespoke sizing.",
    finishes: ["chrome", "brushed-nickel"],
    material: "6mm low-iron glass, polished edge",
    additionalMaterial: "Concealed stainless bracket system",
    features: ["Polished bevelled edge", "Concealed bracket fixing", "Available in custom sizes", "Como Collection compatible"],
    specifications: [{ key: "Glass", value: "6mm low-iron" }, { key: "Edge", value: "Polished bevel 10mm" }, { key: "Fixing", value: "Concealed bracket" }],
    dimensions: { height: 900, width: 700, depth: 25, weight: 12 },
    tradePrice: 18000, mrp: 24000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-MR-002-PE", tags: ["frameless mirror", "architectural", "como"],
    images: [imgEVMR002], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-MR-001", "VH-WB-001"],
    metaTitle: "Arco Frameless Mirror — EVOKE Como", metaDescription: "Polished-edge frameless mirror with concealed fixings from EVOKE.",
  },
  // ── Sanitaryware ─────────────────────────────────────────
  {
    id: "EV-SW-001", name: "Forma Wall-Hung WC",
    categoryId: "sanitaryware-accessories", subcategoryId: "wall-hung-wcs", collectionId: "verona",
    published: true, featured: true, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A sculptural wall-hung WC with a softly tapered form. Rimless wash technology, dual flush, and a whisper-close seat.",
    fullDescription: "The Forma WC pairs refined geometry with engineering precision. The rimless bowl ensures effortless hygiene while the whisper-close seat and dual-flush mechanism deliver quiet, efficient performance.",
    finishes: ["matte-white", "matte-black"],
    material: "Vitreous china, high-gloss glaze",
    additionalMaterial: "Soft-close PP seat, stainless fixings",
    features: ["Rimless flush technology", "Dual flush 3/6L", "Whisper-close soft seat", "Wall-hung — floor clearance for easy cleaning", "Verona Collection compatible"],
    specifications: [{ key: "Flush", value: "Dual 3/6L" }, { key: "Material", value: "Vitreous china" }, { key: "Seat", value: "Soft-close PP" }, { key: "Fixing Height", value: "400–430mm AFF" }],
    dimensions: { height: 350, width: 360, depth: 520, weight: 22 },
    tradePrice: 32000, mrp: 42000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-SW-001-MW", tags: ["wall hung WC", "rimless", "sanitaryware", "verona"],
    images: [imgEVSW001], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-SW-002", "EV-AC-001"],
    metaTitle: "Forma Wall-Hung WC — EVOKE Verona", metaDescription: "Rimless wall-hung WC with dual flush and whisper-close seat from EVOKE.",
  },
  {
    id: "EV-SW-002", name: "Alto Concealed Cistern",
    categoryId: "sanitaryware-accessories", subcategoryId: "cisterns", collectionId: "verona",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "In-wall concealed cistern frame for wall-hung WC installations. Adjustable height, pneumatic flush, and full-access service panel.",
    fullDescription: "The Alto Concealed Cistern provides the structural and hydraulic infrastructure for floating WC installations. Engineered for silent operation and long-term accessibility.",
    finishes: ["chrome", "brushed-nickel", "matte-black"],
    material: "Galvanised steel frame, ABS cistern",
    additionalMaterial: "Dual pneumatic flush valve, service panel",
    features: ["Height adjustable 820–1050mm", "Silent fill valve", "Dual flush pneumatic actuation", "Full front-access service panel", "Compatible with EV-SW-001"],
    specifications: [{ key: "Frame Height", value: "820–1050mm adj." }, { key: "Cistern Capacity", value: "9L" }, { key: "Flush", value: "Pneumatic dual 3/6L" }, { key: "Wall Thickness", value: "100mm min." }],
    dimensions: { height: 1000, width: 500, depth: 115, weight: 18 },
    tradePrice: 22000, mrp: 29000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-SW-002-CHR", tags: ["concealed cistern", "in-wall frame", "sanitaryware"],
    images: [], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-SW-001"],
    metaTitle: "Alto Concealed Cistern — EVOKE", metaDescription: "In-wall concealed cistern frame with pneumatic flush for wall-hung WC installations.",
  },
  // ── Bathroom Lighting ─────────────────────────────────────
  {
    id: "EV-BL-001", name: "Lume Mirror Light Bar",
    categoryId: "sanitaryware-accessories", subcategoryId: "mirror-lighting", collectionId: "milano",
    published: true, featured: true, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A slender architectural LED bar for mirror-side task lighting. High-CRI output, dimmable, and IP44 rated for wet zone installation.",
    fullDescription: "The Lume Light Bar delivers high-quality task illumination at the vanity position. Its slim profile and brushed metal housing integrate seamlessly above or beside any EVOKE mirror.",
    finishes: ["brushed-nickel", "matte-black"],
    material: "Extruded aluminium housing, opal diffuser",
    additionalMaterial: "High-CRI LED module, IP44 driver",
    features: ["CRI 95+ for true colour rendering", "IP44 splash rated", "Dimmable 1–100%", "Flicker-free output", "Milano Collection compatible"],
    specifications: [{ key: "CRI", value: "95+" }, { key: "IP Rating", value: "IP44" }, { key: "Power", value: "18W" }, { key: "Colour Temp", value: "2700K / 4000K" }],
    dimensions: { height: 50, width: 600, depth: 80, weight: 1.8 },
    tradePrice: 14000, mrp: 18500, pricingMode: "on-request", pricingNote: "",
    sku: "EV-BL-001-BN", tags: ["mirror light", "LED bar", "task lighting", "bathroom"],
    images: [imgEVBL001], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-BL-002", "EV-MR-001"],
    metaTitle: "Lume Mirror Light Bar — EVOKE Milano", metaDescription: "High-CRI LED mirror light bar, IP44 rated, dimmable. From EVOKE.",
  },
  {
    id: "EV-BL-002", name: "Aureo Recessed Ceiling Light",
    categoryId: "sanitaryware-accessories", subcategoryId: "recessed-lighting", collectionId: "como",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A flush architectural downlight engineered for wet zone ceilings. Anti-glare optic, wide beam distribution, and IP65 rated.",
    fullDescription: "The Aureo Recessed Light disappears into the ceiling plane while delivering refined ambient illumination. The anti-glare diffuser and wide 60° beam create an even, shadow-free wash.",
    finishes: ["brushed-nickel", "matte-white"],
    material: "Die-cast aluminium, anti-glare PC optic",
    additionalMaterial: "IP65 LED module, dimmable driver",
    features: ["IP65 fully sealed", "Anti-glare trim optic", "60° wide beam", "Dimmable DALI compatible", "Como Collection compatible"],
    specifications: [{ key: "IP Rating", value: "IP65" }, { key: "Power", value: "12W" }, { key: "Beam Angle", value: "60°" }, { key: "Cut-out", value: "Ø90mm" }],
    dimensions: { height: 65, width: 110, depth: 110, weight: 0.9 },
    tradePrice: 9500, mrp: 13000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-BL-002-BN", tags: ["recessed light", "downlight", "ceiling", "IP65"],
    images: [imgEVBL002], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-BL-001"],
    metaTitle: "Aureo Recessed Ceiling Light — EVOKE Como", metaDescription: "IP65 anti-glare recessed downlight for wet zone ceilings from EVOKE.",
  },
  // ── Accessories ───────────────────────────────────────────
  {
    id: "EV-AC-001", name: "Sera Towel Rail",
    categoryId: "sanitaryware-accessories", subcategoryId: "towel-rails", collectionId: "verona",
    published: true, featured: true, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A wall-mounted double towel rail in solid brass. Clean horizontal geometry with concealed fixings and a fine E-monogrammed end cap.",
    fullDescription: "The Sera Towel Rail pairs architectural restraint with enduring material quality. Solid brass construction and concealed wall fixings create a seamless profile that anchors the accessory palette.",
    finishes: ["brushed-nickel", "chrome", "matte-black"],
    material: "Solid brass, PVD finish",
    additionalMaterial: "Concealed wall fixings, E-monogram end caps",
    features: ["Solid brass construction", "PVD finish — tarnish resistant", "Concealed fixing system", "E-monogram end caps", "Verona Collection compatible"],
    specifications: [{ key: "Bar Diameter", value: "Ø22mm" }, { key: "Projection", value: "110mm" }, { key: "Finish", value: "PVD Brushed Nickel" }, { key: "Fixing", value: "Concealed wall plate" }],
    dimensions: { height: 22, width: 600, depth: 110, weight: 1.2 },
    tradePrice: 8500, mrp: 11500, pricingMode: "on-request", pricingNote: "",
    sku: "EV-AC-001-BN", tags: ["towel rail", "towel bar", "accessory", "brass"],
    images: [imgEVAC001], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-AC-002", "EV-SW-001"],
    metaTitle: "Sera Towel Rail — EVOKE Verona", metaDescription: "Solid brass double towel rail with concealed fixings and E-monogram end caps from EVOKE.",
  },
  {
    id: "EV-AC-002", name: "Nera Robe Hook Set",
    categoryId: "sanitaryware-accessories", subcategoryId: "robe-hooks", collectionId: "verona",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A set of two double robe hooks in solid brass with a fine E-monogram impression at the base. Concealed fixing system.",
    fullDescription: "The Nera Robe Hook Set maintains the same architectural discipline as the Sera Towel Rail. Supplied as a pair, each hook carries a discreet E-monogram impression — the defining detail of the EVOKE accessory range.",
    finishes: ["brushed-nickel", "chrome", "matte-black"],
    material: "Solid brass, PVD finish",
    additionalMaterial: "Concealed anchor plate, stainless fixings",
    features: ["Double hook per unit", "Set of two", "E-monogram base impression", "Concealed wall plate fixing", "Verona Collection compatible"],
    specifications: [{ key: "Hook Projection", value: "65mm" }, { key: "Base Width", value: "55mm" }, { key: "Load Rating", value: "5kg per hook" }, { key: "Supplied", value: "Pair" }],
    dimensions: { height: 65, width: 55, depth: 65, weight: 0.4 },
    tradePrice: 6000, mrp: 8000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-AC-002-BN", tags: ["robe hook", "hook", "accessory", "brass"],
    images: [imgEVAC002], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-AC-001"],
    metaTitle: "Nera Robe Hook Set — EVOKE Verona", metaDescription: "Solid brass double robe hook set with E-monogram impression from EVOKE.",
  },

  // ── Bath Fittings — additional ───────────────────────────────
  {
    id: "VH-BF-003", name: "Vela Concealed Basin Mixer",
    categoryId: "bath-fittings", subcategoryId: "concealed-mixers", collectionId: "verona",
    published: true, featured: false, stockStatus: "made-to-order",
    projectAvailability: true, retailAvailability: true,
    description: "A fully concealed wall-mounted basin mixer from the Verona Collection. Recessed body with a minimal exposed trim plate and single-lever control in matte black.",
    fullDescription: "The Vela Concealed Basin Mixer represents the ultimate expression of architectural restraint — the fitting disappears into the wall, leaving only a flush trim plate and lever as evidence of the infrastructure behind.",
    finishes: ["matte-black", "satin-black"],
    material: "Solid brass body, ceramic disc cartridge",
    additionalMaterial: "Flush trim plate, concealed rough-in valve",
    features: ["Fully concealed installation", "Ceramic disc cartridge", "Compatible with standard 150mm wall rough-in", "Verona Collection compatible", "WRAS approved"],
    specifications: [{ key: "Cartridge", value: "Ceramic disc" }, { key: "Rough-In", value: "150mm standard" }, { key: "Water Pressure", value: "1.0–5.0 bar" }, { key: "Finish", value: "PVD Matte Black" }],
    dimensions: { height: 40, width: 180, depth: 12, spoutReach: 0, spoutHeight: 0, weight: 1.8 },
    tradePrice: 26000, mrp: 34000, pricingMode: "on-request", pricingNote: "Includes rough-in valve",
    sku: "VH-BF-003-MB", tags: ["concealed mixer", "basin mixer", "recessed", "verona"],
    images: [imgVHBF003], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-BF-001", "VH-WB-001"],
    metaTitle: "Vela Concealed Basin Mixer — EVOKE Verona", metaDescription: "Fully concealed wall-mounted basin mixer with PVD matte black finish from EVOKE.",
  },
  {
    id: "VH-BF-004", name: "Sento Sensor Faucet",
    categoryId: "bath-fittings", subcategoryId: "sensor-faucets", collectionId: "milano",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: false,
    description: "Touchless infrared sensor faucet engineered for hospitality and commercial washrooms. Precision flow control, automatic shut-off, and a clean geometric profile.",
    fullDescription: "The Sento Sensor Faucet combines the Milano Collection's geometric discipline with touchless infrared technology. Designed for high-traffic hospitality environments where hygiene and water efficiency are equally paramount.",
    finishes: ["chrome", "brushed-nickel"],
    material: "Solid brass body, infrared sensor module",
    additionalMaterial: "Integrated solenoid valve, battery or mains powered",
    features: ["Infrared touchless activation", "Adjustable flow rate 4–6 L/min", "Battery (6 × AA) or AC adapter", "Anti-legionella thermal flush programmable", "Milano Collection compatible"],
    specifications: [{ key: "Sensor Range", value: "100–200mm" }, { key: "Flow Rate", value: "4–6 L/min" }, { key: "Power", value: "6×AA / 6V AC" }, { key: "IP Rating", value: "IP67 sensor" }],
    dimensions: { height: 165, width: 38, depth: 155, spoutReach: 130, spoutHeight: 95, weight: 1.4 },
    tradePrice: 32000, mrp: 42000, pricingMode: "on-request", pricingNote: "Minimum 4 units for hospitality projects",
    sku: "VH-BF-004-CHR", tags: ["sensor faucet", "touchless", "hospitality", "milano"],
    images: [imgVHBF004], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-BF-001", "VH-SS-001"],
    metaTitle: "Sento Sensor Faucet — EVOKE Milano", metaDescription: "Touchless infrared sensor faucet for hospitality environments from EVOKE.",
  },

  // ── Shower Systems — additional ──────────────────────────────
  {
    id: "VH-SS-003", name: "Bruma Handheld Shower 120mm",
    categoryId: "shower-systems", subcategoryId: "handheld-showers", collectionId: "como",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A 120mm handheld shower handset with a soft mist spray and silicone anti-limescale nozzles. Includes 1.75m stainless braided hose and wall bracket.",
    fullDescription: "The Bruma Handheld Shower brings the Como Collection's fluid sensibility to the handset format. Its oval profile and brushed nickel finish pair naturally with the Palazzo deck mixer and Lago vessel basin.",
    finishes: ["brushed-nickel", "brushed-gold"],
    material: "ABS body, silicone nozzles, stainless steel hose",
    additionalMaterial: "Wall bracket, 1.75m braided hose",
    features: ["3-function spray modes", "Anti-limescale silicone nozzles", "1.75m braided stainless hose included", "Como Collection compatible", "WRAS approved"],
    specifications: [{ key: "Head Diameter", value: "120mm" }, { key: "Spray Modes", value: "3 (rain / massage / mist)" }, { key: "Flow Rate", value: "8 L/min at 3 bar" }, { key: "Hose Length", value: "1.75m" }],
    dimensions: { height: 240, width: 120, depth: 55, spoutReach: 0, spoutHeight: 0, weight: 0.6 },
    tradePrice: 9500, mrp: 13000, pricingMode: "on-request", pricingNote: "",
    sku: "VH-SS-003-BN", tags: ["handheld shower", "shower handset", "como"],
    images: [imgVHSS003], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-SS-001", "VH-BF-002"],
    metaTitle: "Bruma Handheld Shower 120mm — EVOKE Como", metaDescription: "3-function handheld shower handset with anti-limescale nozzles from EVOKE.",
  },
  {
    id: "VH-SS-004", name: "Cascata Thermostatic Shower System",
    categoryId: "shower-systems", subcategoryId: "thermostatic-systems", collectionId: "milano",
    published: true, featured: true, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A wall-mounted two-outlet thermostatic shower system with a 250mm overhead rain plate and handheld outlet. Precise temperature memory and anti-scald lock.",
    fullDescription: "The Cascata Thermostatic System delivers the reliability demanded by five-star hospitality alongside the aesthetic precision of the Milano Collection. Temperature is set once and held — every shower begins at the same perfect degree.",
    finishes: ["chrome", "matte-black"],
    material: "Solid brass thermostatic valve, stainless trim",
    additionalMaterial: "250mm rain plate, handheld handset, 1.5m hose",
    features: ["Temperature memory cartridge", "Anti-scald lock at 38°C", "Two independent volume controls", "250mm overhead rain plate", "Handheld shower included"],
    specifications: [{ key: "Thermostatic Range", value: "20–48°C" }, { key: "Water Pressure", value: "1.0–5.0 bar" }, { key: "Outlets", value: "2 (overhead / handheld)" }, { key: "Certification", value: "WRAS, CE" }],
    dimensions: { height: 200, width: 380, depth: 90, spoutReach: 0, spoutHeight: 0, weight: 4.2 },
    tradePrice: 48000, mrp: 62000, pricingMode: "on-request", pricingNote: "",
    sku: "VH-SS-004-CHR", tags: ["thermostatic shower", "shower system", "milano"],
    images: [imgVHSS004], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-SS-001", "VH-SS-002"],
    metaTitle: "Cascata Thermostatic Shower System — EVOKE Milano", metaDescription: "Two-outlet wall-mounted thermostatic shower system with rain plate from EVOKE.",
  },

  // ── Wash Basins — additional ─────────────────────────────────
  {
    id: "VH-WB-002", name: "Pietra Counter-Top Basin",
    categoryId: "wash-basins", subcategoryId: "counter-top-basins", collectionId: "verona",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A counter-top basin in cast mineral composite with a matte stone texture. Rectangular form with gently radiused corners and a low-profile overflow slot.",
    fullDescription: "The Pietra Counter-Top Basin draws from the Verona Collection's reverence for classical materials. Its mineral composite surface replicates the tactile warmth of honed stone while providing the durability required for luxury residential and hospitality use.",
    finishes: ["matte-black"],
    material: "Cast mineral composite, matte stone texture",
    additionalMaterial: "Waste and overflow fitting included",
    features: ["Cast mineral composite — chip and stain resistant", "Integrated low-profile overflow", "Pre-drilled single tap hole", "Compatible with all EVOKE deck-mounted mixers", "Verona Collection compatible"],
    specifications: [{ key: "Material", value: "Mineral composite" }, { key: "Surface", value: "Matte stone texture" }, { key: "Overflow", value: "Integrated slot" }, { key: "Tap Hole", value: "Single Ø35mm" }],
    dimensions: { height: 120, width: 520, depth: 380, spoutReach: 0, spoutHeight: 0, weight: 11.5 },
    tradePrice: 28000, mrp: 36000, pricingMode: "on-request", pricingNote: "",
    sku: "VH-WB-002-MS", tags: ["counter top basin", "stone basin", "mineral composite", "verona"],
    images: [imgVHWB002], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-WB-001", "VH-BF-002"],
    metaTitle: "Pietra Counter-Top Basin — EVOKE Verona", metaDescription: "Cast mineral composite counter-top basin with matte stone texture from EVOKE.",
  },
  {
    id: "VH-WB-003", name: "Sospeso Wall-Hung Basin",
    categoryId: "wash-basins", subcategoryId: "wall-hung-basins", collectionId: "milano",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A cantilevered wall-hung basin in high-gloss vitreous china. Slim 145mm depth profile, concealed wall brackets, and a single tap hole centred at the rear.",
    fullDescription: "The Sospeso Wall-Hung Basin creates the illusion of floating at the wall plane — its slim depth and concealed bracket system allow the floor to read as uninterrupted. Specified across premium residential and boutique hospitality projects.",
    finishes: ["chrome"],
    material: "Vitreous china, high-gloss white glaze",
    additionalMaterial: "Concealed wall bracket set, click-clack waste",
    features: ["145mm slim-depth wall projection", "Concealed stainless bracket system", "Integrated overflow", "Single rear tap hole Ø35mm", "Milano Collection compatible"],
    specifications: [{ key: "Material", value: "Vitreous china" }, { key: "Glaze", value: "High-gloss white" }, { key: "Projection", value: "145mm from wall" }, { key: "Overflow", value: "Integrated" }],
    dimensions: { height: 145, width: 560, depth: 370, spoutReach: 0, spoutHeight: 0, weight: 13 },
    tradePrice: 22000, mrp: 29000, pricingMode: "on-request", pricingNote: "",
    sku: "VH-WB-003-W", tags: ["wall hung basin", "floating basin", "vitreous china", "milano"],
    images: [imgVHWB003], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-WB-001", "VH-BF-001"],
    metaTitle: "Sospeso Wall-Hung Basin — EVOKE Milano", metaDescription: "Slim 145mm wall-hung basin in high-gloss vitreous china from EVOKE.",
  },

  // ── Luxury Vanities — additional ─────────────────────────────
  {
    id: "VH-LV-002", name: "Torre Freestanding Vanity 900mm",
    categoryId: "luxury-vanities", subcategoryId: "freestanding-vanities", collectionId: "como",
    published: true, featured: false, stockStatus: "made-to-order",
    projectAvailability: true, retailAvailability: true,
    description: "A 900mm freestanding floor vanity in natural oak veneer with an integrated storage column. Soft-close doors, push-to-open drawers, and brushed nickel legs.",
    fullDescription: "The Torre brings the Como Collection's warmth and organic material language to the freestanding format. Its integrated column provides generous towel and amenity storage without the visual weight of a full-height unit.",
    finishes: ["brushed-nickel"],
    material: "Natural oak veneer over moisture-resistant MDF",
    additionalMaterial: "Brushed nickel adjustable legs, push-to-open hardware",
    features: ["Integrated storage column", "Push-to-open softclose drawers", "Adjustable brushed nickel legs ±20mm", "FSC-certified oak veneer", "Como Collection compatible"],
    specifications: [{ key: "Carcass", value: "MR-MDF, moisture-resistant" }, { key: "Veneer", value: "Natural oak, UV-lacquered" }, { key: "Hardware", value: "Brushed nickel" }, { key: "Lead Time", value: "8 weeks" }],
    dimensions: { height: 860, width: 900, depth: 460, spoutReach: 0, spoutHeight: 0, weight: 52 },
    tradePrice: 88000, mrp: 115000, pricingMode: "on-request", pricingNote: "Lead time: 8 weeks",
    sku: "VH-LV-002-OAK", tags: ["freestanding vanity", "oak vanity", "storage column", "como"],
    images: [imgVHLV002], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-LV-001", "VH-WB-001"],
    metaTitle: "Torre Freestanding Vanity 900mm — EVOKE Como", metaDescription: "900mm freestanding oak vanity with integrated storage column from EVOKE.",
  },
  {
    id: "VH-LV-003", name: "Doppio Double Vanity 1500mm",
    categoryId: "luxury-vanities", subcategoryId: "double-vanities", collectionId: "milano",
    published: true, featured: true, stockStatus: "made-to-order",
    projectAvailability: true, retailAvailability: true,
    description: "A 1500mm wall-hung double vanity for his-and-hers specification. Smoked oak veneer, twin soft-close drawer sets, and integrated basin cut-outs for two Ø450mm vessels.",
    fullDescription: "The Doppio Double Vanity defines the master bathroom specification. At 1500mm, it provides generous personal storage for two while maintaining the floating, weightless aesthetic that defines the Milano Collection's approach to cabinetry.",
    finishes: ["matte-black", "brushed-nickel"],
    material: "Smoked oak veneer over moisture-resistant MDF",
    additionalMaterial: "Matte black or brushed nickel hardware",
    features: ["Twin soft-close undermount drawer sets", "Dual integrated basin cut-outs 450mm", "Wall-hung floating installation", "Anti-humidity sealed interior", "Milano Collection compatible"],
    specifications: [{ key: "Carcass", value: "MR-MDF moisture-resistant" }, { key: "Veneer", value: "Smoked oak, UV-lacquered" }, { key: "Basin Cut-outs", value: "2 × Ø450mm" }, { key: "Lead Time", value: "10 weeks" }],
    dimensions: { height: 520, width: 1500, depth: 480, spoutReach: 0, spoutHeight: 0, weight: 68 },
    tradePrice: 145000, mrp: 190000, pricingMode: "on-request", pricingNote: "Lead time: 10 weeks",
    sku: "VH-LV-003-MB", tags: ["double vanity", "his and hers", "smoked oak", "milano"],
    images: [imgVHLV003], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["VH-LV-001", "VH-WB-001"],
    metaTitle: "Doppio Double Vanity 1500mm — EVOKE Milano", metaDescription: "1500mm wall-hung double vanity in smoked oak for his-and-hers specification from EVOKE.",
  },

  // ── Mirrors — additional ─────────────────────────────────────
  {
    id: "EV-MR-003", name: "Specchio Framed Mirror",
    categoryId: "mirrors", subcategoryId: "framed-mirrors", collectionId: "verona",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A slim architectural frame mirror in matte black or brushed nickel. 12mm square-profile frame, concealed wall fixings, and available in four standard sizes.",
    fullDescription: "The Specchio Framed Mirror asserts presence without excess. Its 12mm square-profile frame defines the mirror's boundary with the same precision that the Verona Collection brings to every element of the bathroom composition.",
    finishes: ["matte-black", "brushed-nickel"],
    material: "5mm float glass, powder-coated aluminium frame",
    additionalMaterial: "Concealed wall bracket system",
    features: ["12mm square-profile frame", "5mm float glass", "Concealed bracket fixing", "Four standard sizes", "Verona Collection compatible"],
    specifications: [{ key: "Frame Profile", value: "12mm square aluminium" }, { key: "Glass", value: "5mm float" }, { key: "Fixing", value: "Concealed bracket" }, { key: "Sizes", value: "600 / 750 / 900 / 1000mm" }],
    dimensions: { height: 900, width: 750, depth: 30, weight: 9 },
    tradePrice: 16000, mrp: 21000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-MR-003-MB", tags: ["framed mirror", "architectural", "slim frame", "verona"],
    images: [imgEVMR003], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-MR-001", "EV-MR-002"],
    metaTitle: "Specchio Framed Mirror — EVOKE Verona", metaDescription: "Slim 12mm square-profile framed mirror in matte black or brushed nickel from EVOKE.",
  },
  {
    id: "EV-MR-004", name: "Lente Shaving Mirror",
    categoryId: "mirrors", subcategoryId: "shaving-mirrors", collectionId: "como",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A wall-mounted magnifying shaving mirror on an articulated arm. 5× magnification, 200mm disc, integrated LED surround, and a 300mm reach articulation.",
    fullDescription: "The Lente Shaving Mirror elevates the daily grooming ritual with 5× magnification and a high-CRI LED surround that eliminates shadow. Its articulated arm extends 300mm from the wall and locks at any angle.",
    finishes: ["brushed-nickel", "chrome"],
    material: "Brass articulated arm, 5× magnification glass",
    additionalMaterial: "LED surround module, IP44 driver",
    features: ["5× magnification", "200mm diameter disc", "Integrated CRI 95+ LED surround", "300mm articulated arm reach", "IP44 splash rated"],
    specifications: [{ key: "Magnification", value: "5×" }, { key: "Disc Diameter", value: "200mm" }, { key: "Arm Reach", value: "300mm" }, { key: "IP Rating", value: "IP44" }],
    dimensions: { height: 200, width: 200, depth: 320, weight: 1.4 },
    tradePrice: 18500, mrp: 24000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-MR-004-BN", tags: ["shaving mirror", "magnifying mirror", "LED mirror", "como"],
    images: [imgEVMR004], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-MR-001", "VH-LV-001"],
    metaTitle: "Lente Shaving Mirror — EVOKE Como", metaDescription: "5× magnification shaving mirror with LED surround and articulated arm from EVOKE.",
  },

  // ── Sanitaryware — additional ────────────────────────────────
  {
    id: "EV-SW-003", name: "Puro Close-Coupled WC",
    categoryId: "sanitaryware-accessories", subcategoryId: "close-coupled-wcs", collectionId: "como",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A close-coupled WC with an integrated cistern in high-gloss vitreous china. Rimless bowl, dual-flush push button, and a soft-close quick-release seat.",
    fullDescription: "The Puro Close-Coupled WC achieves the impossible balance — a classic integrated form that feels entirely contemporary. Its flush curves and brilliant white glaze make it the natural centrepiece of Como Collection bathrooms.",
    finishes: ["chrome"],
    material: "Vitreous china, high-gloss white",
    additionalMaterial: "Soft-close quick-release seat, chrome push-button",
    features: ["Rimless flush bowl", "Dual flush 3/6L push button", "Soft-close quick-release seat", "S-trap or P-trap conversion kit included", "Como Collection compatible"],
    specifications: [{ key: "Flush", value: "Dual 3/6L push button" }, { key: "Material", value: "Vitreous china" }, { key: "Trap", value: "S-trap / P-trap (kit included)" }, { key: "Seat", value: "Soft-close QR" }],
    dimensions: { height: 780, width: 360, depth: 680, weight: 30 },
    tradePrice: 24000, mrp: 31000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-SW-003-W", tags: ["close coupled WC", "toilet", "rimless", "como"],
    images: [], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-SW-001", "EV-SW-002"],
    metaTitle: "Puro Close-Coupled WC — EVOKE Como", metaDescription: "Rimless close-coupled WC with soft-close seat from EVOKE.",
  },
  {
    id: "EV-SW-004", name: "Fonte Wall-Hung Bidet",
    categoryId: "sanitaryware-accessories", subcategoryId: "bidets", collectionId: "milano",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A wall-hung bidet in high-gloss vitreous china. Concealed trap, single tap hole, and an overflow to the front. Pairs with the Elara mixer series.",
    fullDescription: "The Fonte Wall-Hung Bidet brings the Italian hygiene tradition into the Milano Collection's geometric vocabulary. Suspended at wall height, it creates the same visual lightness as the Sospeso basin — the floor reads as continuous.",
    finishes: ["chrome"],
    material: "Vitreous china, high-gloss white",
    additionalMaterial: "Concealed waste, wall fixings included",
    features: ["Wall-hung installation", "Concealed trap", "Single tap hole Ø35mm", "Integrated front overflow", "Milano Collection compatible"],
    specifications: [{ key: "Material", value: "Vitreous china" }, { key: "Trap", value: "Concealed wall" }, { key: "Tap Hole", value: "Single Ø35mm" }, { key: "Fixing Height", value: "400mm AFF" }],
    dimensions: { height: 340, width: 360, depth: 540, weight: 14 },
    tradePrice: 18000, mrp: 24000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-SW-004-W", tags: ["bidet", "wall hung bidet", "sanitaryware", "milano"],
    images: [], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-SW-001", "VH-BF-001"],
    metaTitle: "Fonte Wall-Hung Bidet — EVOKE Milano", metaDescription: "Wall-hung bidet in high-gloss vitreous china from EVOKE.",
  },

  // ── Bathroom Lighting — additional ───────────────────────────
  {
    id: "EV-BL-003", name: "Volta Ceiling Fixture",
    categoryId: "sanitaryware-accessories", subcategoryId: "ceiling-fixtures", collectionId: "verona",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A surface-mounted architectural ceiling fixture in die-cast aluminium. IP44 rated, 24W, opal diffuser for even shadow-free illumination across the full bathroom plane.",
    fullDescription: "The Volta Ceiling Fixture provides the architectural backbone of the Verona Collection's lighting palette. Circular and minimal, it delivers uniform ambient illumination from a single high-efficacy LED module — no visible lamp, no hotspots.",
    finishes: ["matte-black", "brushed-nickel"],
    material: "Die-cast aluminium housing, opal PMMA diffuser",
    additionalMaterial: "24W integrated LED module, IP44 driver",
    features: ["IP44 splash rated", "Opal diffuser — shadow-free output", "24W high-efficacy LED", "CRI 90+", "Dimmable TRIAC compatible"],
    specifications: [{ key: "IP Rating", value: "IP44" }, { key: "Power", value: "24W" }, { key: "Diameter", value: "Ø280mm" }, { key: "Colour Temp", value: "2700K / 3000K" }],
    dimensions: { height: 80, width: 280, depth: 280, weight: 1.6 },
    tradePrice: 16000, mrp: 21000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-BL-003-MB", tags: ["ceiling light", "surface mounted", "IP44", "verona"],
    images: [], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-BL-001", "EV-BL-002"],
    metaTitle: "Volta Ceiling Fixture — EVOKE Verona", metaDescription: "Surface-mounted architectural ceiling fixture, IP44, 24W opal diffuser from EVOKE.",
  },
  {
    id: "EV-BL-004", name: "Calda Heated Lamp",
    categoryId: "sanitaryware-accessories", subcategoryId: "heated-lamps",
    collectionId: "como",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A ceiling-mounted infrared heated lamp providing both warmth and ambient illumination. 1200W heating element, 25W ambient lamp, and a pull-cord switch.",
    fullDescription: "The Calda Heated Lamp brings the spa experience into the domestic bathroom. Its infrared element delivers instant radiant warmth to 3–4 sqm, while the ambient lamp provides soft, even illumination — all from a single, elegant ceiling fixture.",
    finishes: ["chrome", "brushed-nickel"],
    material: "Polished aluminium reflector, chrome trim ring",
    additionalMaterial: "1200W infrared element, 25W ambient bulb, pull cord",
    features: ["1200W infrared heating element", "25W integrated ambient lamp", "Instant-on radiant heat", "Pull-cord switch or separate switch wiring", "IP44 rated"],
    specifications: [{ key: "Heating Output", value: "1200W infrared" }, { key: "Coverage", value: "3–4 sqm" }, { key: "Ambient Light", value: "25W" }, { key: "IP Rating", value: "IP44" }],
    dimensions: { height: 160, width: 300, depth: 300, weight: 2.8 },
    tradePrice: 12000, mrp: 16000, pricingMode: "on-request", pricingNote: "",
    sku: "EV-BL-004-CHR", tags: ["heated lamp", "infrared", "bathroom heating", "como"],
    images: [], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-BL-003", "EV-BL-001"],
    metaTitle: "Calda Heated Lamp — EVOKE Como", metaDescription: "Infrared heated ceiling lamp with ambient illumination, IP44, from EVOKE.",
  },

  // ── Accessories — additional ──────────────────────────────────
  {
    id: "EV-AC-003", name: "Deco Soap Dispenser",
    categoryId: "sanitaryware-accessories", subcategoryId: "soap-dispensers", collectionId: "milano",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A wall-mounted soap or lotion dispenser in solid brass with a 300ml capacity. E-monogram pump head, concealed fixing plate, and a satin-smooth pump action.",
    fullDescription: "The Deco Soap Dispenser completes the EVOKE accessory palette. Its solid brass body and E-monogrammed pump head carry the same material and dimensional discipline as the Sera Towel Rail — delivering a unified accessory language across the space.",
    finishes: ["brushed-nickel", "matte-black"],
    material: "Solid brass body and pump, PVD finish",
    additionalMaterial: "Concealed fixing plate, 300ml ABS reservoir",
    features: ["300ml capacity reservoir", "E-monogram pump head", "Satin-smooth pump action", "Concealed wall fixing", "Milano Collection compatible"],
    specifications: [{ key: "Capacity", value: "300ml" }, { key: "Pump", value: "Metered 1ml dose" }, { key: "Material", value: "Solid brass PVD" }, { key: "Fixing", value: "Concealed wall plate" }],
    dimensions: { height: 185, width: 65, depth: 90, weight: 0.5 },
    tradePrice: 5500, mrp: 7500, pricingMode: "on-request", pricingNote: "",
    sku: "EV-AC-003-BN", tags: ["soap dispenser", "lotion dispenser", "accessory", "brass"],
    images: [], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-AC-001", "EV-AC-002"],
    metaTitle: "Deco Soap Dispenser — EVOKE Milano", metaDescription: "Wall-mounted solid brass soap dispenser with E-monogram pump head from EVOKE.",
  },
  {
    id: "EV-AC-004", name: "Asse Toilet Roll Holder",
    categoryId: "sanitaryware-accessories", subcategoryId: "toilet-roll-holders", collectionId: "verona",
    published: true, featured: false, stockStatus: "in-stock",
    projectAvailability: true, retailAvailability: true,
    description: "A surface-mounted toilet roll holder in solid brass. Sprung arm with a square-profile back plate and concealed fixings. Part of the Verona accessory set.",
    fullDescription: "The Asse Toilet Roll Holder maintains the Verona Collection's insistence on material quality even in the most utilitarian element. Solid brass, a sprung arm that holds without rattling, and a square back plate that aligns precisely with the Sera Towel Rail.",
    finishes: ["matte-black", "chrome"],
    material: "Solid brass, PVD finish",
    additionalMaterial: "Concealed anchor plate, stainless fixings",
    features: ["Solid brass construction", "Sprung arm — holds roll securely", "Square back plate — aligns with Sera Rail", "Concealed fixing system", "Verona Collection compatible"],
    specifications: [{ key: "Arm Projection", value: "130mm" }, { key: "Back Plate", value: "55 × 55mm square" }, { key: "Material", value: "Solid brass PVD" }, { key: "Fixing", value: "Concealed anchor plate" }],
    dimensions: { height: 55, width: 155, depth: 130, weight: 0.45 },
    tradePrice: 5000, mrp: 6800, pricingMode: "on-request", pricingNote: "",
    sku: "EV-AC-004-MB", tags: ["toilet roll holder", "paper holder", "accessory", "brass"],
    images: [], cadFile: null, bimFile: null, techDataSheet: null, installationManual: null, dimensionDiagram: null,
    relatedProducts: ["EV-AC-001", "EV-AC-002"],
    metaTitle: "Asse Toilet Roll Holder — EVOKE Verona", metaDescription: "Solid brass surface-mounted toilet roll holder with sprung arm from EVOKE.",
  },
];

// ═══════════════════════════════════════════
// CORE SVG COMPONENTS
// ═══════════════════════════════════════════

const VMonogram = ({ size = 40, className = "", color = "currentColor" }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 60 60" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ color }}
  >
    {/* Oval frame */}
    <ellipse cx="30" cy="30" rx="28" ry="28" stroke="currentColor" strokeWidth="1.2" fill="none" />
    {/* E letterform — vertical stem + three horizontal bars */}
    <line x1="20" y1="16" x2="20" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="16" x2="38" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="30" x2="35" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="44" x2="38" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const VMark = ({ size = 40, className = "" }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <VMonogram size={size} />
    <div style={{ width: 32, height: 2, backgroundColor: "#C7B9A6", marginTop: 8 }} />
  </div>
);

const Wordmark = ({ className = "", style = {} }) => {
  // fontSize from parent style; fall back to 22px for nav
  const fs = style.fontSize || 22;
  const color = style.color || "currentColor";
  // SVG size: match cap-height ≈ 72% of font-size
  // 1.3× font-size makes the circle height visually match Playfair uppercase
  const monoSize = typeof fs === "number" ? Math.round(fs * 1.3) : 26;
  return (
    <span
      className={`font-display inline-flex items-center ${className}`}
      style={{ fontWeight: 400, letterSpacing: "0.22em", lineHeight: 1, ...style }}
    >
      {/* Circle-E monogram replaces the "E" */}
      <VMonogram size={monoSize} color={color} style={{ flexShrink: 0, display: "block" }} />
      {/* VOKE — letter-spacing on the left compensates for the removed "E" gap */}
      <span style={{ marginLeft: "0.18em", letterSpacing: "0.22em", paddingRight: "0.22em" }}>
        VOKE
      </span>
    </span>
  );
};

// Image with E watermark
const ImageWithWatermark = ({ src, alt = "", aspectClass = "aspect-square", monogramSize = 24, objectPosition = "center center", children }) => (
  <div className={`${aspectClass} relative overflow-hidden w-full`}
    style={{ background: "linear-gradient(145deg, #D8CEC0 0%, #C7B9A6 50%, #8F8981 100%)" }}>
    {src && (
      <img src={src} alt={alt}
        className="w-full h-full object-cover"
        style={{ objectPosition }}
        onError={e => { e.target.style.display = "none"; }}
      />
    )}
    {children}
    <div className="absolute bottom-3 right-3 z-10" style={{ opacity: 0.13 }}>
      <VMonogram size={monogramSize} color="white" />
    </div>
  </div>
);

// Toast notification
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div
      className="fixed z-50 top-6 right-6 bg-charcoal text-warm-white px-5 py-3 flex items-center gap-3"
      style={{ borderLeft: `3px solid ${toast.type === "error" ? "#DC2626" : "#C7B9A6"}`, minWidth: 260 }}
    >
      <span className="font-body text-sm" style={{ fontWeight: 300 }}>{toast.message}</span>
    </div>
  );
};

// Breadcrumb
const Breadcrumb = ({ items, navigate }) => (
  <div className="flex items-center gap-2 font-body text-warm-grey" style={{ fontSize: 12, letterSpacing: "0.03em" }}>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-2">
        {i > 0 && <span className="opacity-40">/</span>}
        {item.page ? (
          <button onClick={() => navigate(item.page, item.params || {})}
            className="hover:text-charcoal transition-colors duration-200">{item.label}</button>
        ) : (
          <span className="text-charcoal">{item.label}</span>
        )}
      </span>
    ))}
  </div>
);

// Section Header
const SectionHeader = ({ eyebrow, heading, subheading, align = "center", dark = false }) => (
  <div className={`mb-20 ${align === "center" ? "text-center" : ""}`}>
    {eyebrow && (
      <p className="font-body uppercase mb-4" style={{
        fontSize: 12, letterSpacing: "0.28em", fontWeight: 400,
        color: dark ? "#8F8981" : "#8F8981"
      }}>{eyebrow}</p>
    )}
    <h2 className="font-display" style={{
      fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400,
      letterSpacing: "0.17em", color: dark ? "#F5F1EA" : "#171717",
      lineHeight: 1.2
    }}>{heading}</h2>
    {subheading && (
      <p className="font-body mt-4 mx-auto" style={{
        fontSize: 17, fontWeight: 300, letterSpacing: "0.03em",
        color: dark ? "rgba(245,241,234,0.6)" : "#8F8981",
        maxWidth: 540, lineHeight: 1.95
      }}>{subheading}</p>
    )}
  </div>
);

// ═══════════════════════════════════════════
// INTRO ANIMATION — cinematic wordmark on first load
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════

const Navbar = ({ navigate, currentPage, categories }) => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHeroPage = ["home", "projects", "about", "architects", "hospitality", "inspiration", "showrooms", "collections"].includes(currentPage);
  const transparent = isHeroPage && !scrolled && !dropdownOpen;

  const handleDropdownEnter = () => {
    clearTimeout(dropdownTimer.current);
    setDropdownOpen(true);
  };
  const handleDropdownLeave = () => {
    dropdownTimer.current = setTimeout(() => setDropdownOpen(false), 300);
  };

  const navLinks = [
    { label: "Products", page: null, hasDropdown: true },
    { label: "Collections", page: "collections" },
    { label: "Projects", page: "projects" },
    { label: "Inspiration", page: "inspiration" },
    { label: "Architects & Designers", page: "architects" },
    { label: "About", page: "about" },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 transition-all duration-500"
        style={{
          backgroundColor: transparent ? "transparent" : "#F5F1EA",
          borderBottom: transparent ? "none" : "1px solid #D8CEC0",
          // Adaptive contrast: on transparent, a top-gradient scrim ensures
          // nav text is always legible regardless of hero image brightness.
          backgroundImage: transparent
            ? "linear-gradient(to bottom, rgba(14,14,13,0.55) 0%, rgba(14,14,13,0.0) 100%)"
            : "none",
        }}
      >
        <div className="flex items-center justify-between px-8 lg:px-16" style={{ height: 80 }}>
          {/* Left: Wordmark */}
          <button onClick={() => navigate("home")} className="flex items-center">
            <Wordmark style={{ fontSize: 20, color: transparent ? "#F5F1EA" : "#171717" }} />
          </button>

          {/* Center: Nav links (desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div key={link.label}
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                  className="relative">
                  <button
                    className="font-body uppercase transition-colors duration-200"
                    style={{
                      fontSize: 13, letterSpacing: "0.20em", fontWeight: 400,
                      color: transparent ? "rgba(245,241,234,0.92)" : "#8F8981",
                    }}
                    onMouseEnter={e => e.target.style.color = transparent ? "#F5F1EA" : "#171717"}
                    onMouseLeave={e => e.target.style.color = transparent ? "rgba(245,241,234,0.92)" : "#8F8981"}
                  >
                    Products
                  </button>
                </div>
              ) : (
                <button
                  key={link.label}
                  onClick={() => navigate(link.page)}
                  className="font-body uppercase transition-colors duration-200 relative"
                  style={{
                    fontSize: 12, letterSpacing: "0.28em", fontWeight: 400,
                    color: currentPage === link.page
                      ? (transparent ? "#F5F1EA" : "#171717")
                      : (transparent ? "rgba(245,241,234,0.92)" : "#8F8981"),
                    borderBottom: currentPage === link.page ? "2px solid #C7B9A6" : "none",
                    paddingBottom: currentPage === link.page ? 2 : 0,
                  }}
                >{link.label}</button>
              )
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("contact")}
              className="hidden lg:block font-body uppercase transition-all duration-300"
              style={{
                fontSize: 12, letterSpacing: "0.28em", fontWeight: 400,
                padding: "10px 24px",
                border: `1px solid ${transparent ? "rgba(245,241,234,0.6)" : "#171717"}`,
                color: transparent ? "#F5F1EA" : "#171717",
                background: "transparent",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = transparent ? "rgba(245,241,234,0.15)" : "#171717";
                e.currentTarget.style.color = transparent ? "#F5F1EA" : "#F5F1EA";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = transparent ? "#F5F1EA" : "#171717";
              }}
            >Project Inquiry</button>

            {/* Search icon */}
            <button
              onClick={() => navigate("search", { query: "" })}
              className="hidden lg:flex items-center justify-center transition-opacity duration-200"
              style={{ width: 36, height: 36, opacity: 0.7 }}
              onMouseEnter={e => e.currentTarget.style.opacity = "1"}
              onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
              aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke={transparent ? "#F5F1EA" : "#171717"} strokeWidth="1.4" />
                <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke={transparent ? "#F5F1EA" : "#171717"} strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>

            {/* Hamburger */}
            <button className="lg:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileOpen(true)}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "block", width: 22, height: 1,
                  backgroundColor: transparent ? "#F5F1EA" : "#171717"
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mega Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute top-full left-0 w-full bg-warm-white border-b border-travertine"
            style={{ boxShadow: "0 4px 24px rgba(14,14,13,0.06)" }}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <div className="flex px-16 py-12 gap-16">
              {/* Categories grid */}
              <div className="flex-1">
                <p className="font-body uppercase mb-6" style={{ fontSize: 11, letterSpacing: "0.28em", color: "#8F8981" }}>
                  PRODUCT CATEGORIES
                </p>
                <div className="grid grid-cols-2 gap-0">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { navigate("category", { categoryId: cat.id }); setDropdownOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 border-b border-travertine group"
                      style={{ color: "#171717" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#D8CEC0"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span className="font-body" style={{ fontSize: 15, fontWeight: 400, flex: 1 }}>{cat.name}</span>
                      <span className="text-warm-grey text-sm">→</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Featured */}
              <div className="w-72">
                <div
                  className="relative overflow-hidden cursor-pointer"
                  style={{ aspectRatio: "4/3", background: "linear-gradient(145deg, #D8CEC0, #8F8981)" }}
                  onClick={() => { navigate("collection-detail", { collectionId: "milano" }); setDropdownOpen(false); }}
                >
                  <div className="absolute bottom-0 left-0 right-0 p-5"
                    style={{ background: "linear-gradient(to top, rgba(14,14,13,0.75), transparent)" }}>
                    <p className="font-body text-warm-white uppercase mb-1" style={{ fontSize: 11, letterSpacing: "0.28em" }}>NOW AVAILABLE</p>
                    <p className="font-display text-warm-white" style={{ fontSize: 24, fontWeight: 400, letterSpacing: "0.1em" }}>Milano Collection</p>
                    <p className="font-body text-warm-white mt-2" style={{ fontSize: 12, opacity: 0.8 }}>Explore →</p>
                  </div>
                  <div className="absolute bottom-3 right-3 text-white" style={{ opacity: 0.15 }}>
                    <VMonogram size={24} color="white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0E0E0D" }}>
          <div className="flex justify-between items-center px-6 py-5">
            <Wordmark style={{ fontSize: 20, color: "#F5F1EA" }} />
            <button onClick={() => setMobileOpen(false)}
              className="text-warm-white text-2xl font-light">✕</button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => {
                  if (link.page) navigate(link.page);
                  else navigate("category", { categoryId: "bath-fittings" });
                  setMobileOpen(false);
                }}
                className="font-display text-warm-white"
                style={{ fontSize: 34, fontWeight: 400, letterSpacing: "0.17em" }}
              >{link.label}</button>
            ))}
            <button
              onClick={() => { navigate("contact"); setMobileOpen(false); }}
              className="font-body uppercase text-warm-white border border-warm-white mt-4"
              style={{ fontSize: 12, letterSpacing: "0.28em", padding: "12px 32px" }}
            >Project Inquiry</button>
          </div>
        </div>
      )}
    </>
  );
};

// ═══════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════

const Footer = ({ navigate, categories }) => (
  <footer className="relative overflow-hidden" style={{ background: "#0E0E0D", paddingTop: 80, paddingBottom: 40 }}>
    {/* BG watermark */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <VMonogram size={280} color="white" className="opacity-5" />
    </div>
    <div className="relative px-8 lg:px-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Col 1 */}
        <div>
          <Wordmark style={{ color: "#F5F1EA", fontSize: 21, display: "block", marginBottom: 12 }} />
          <div style={{ width: 32, height: 2, background: "#C7B9A6", marginBottom: 20 }} />
          <p className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.95, marginBottom: 16 }}>
            Specification-grade bath solutions for luxury residences, hotels, and landmark developments.
          </p>
          <p className="font-body text-warm-grey uppercase" style={{ fontSize: 11, letterSpacing: "0.28em" }}>
            BATH. SANITARYWARE. ARCHITECTURAL SOLUTIONS.
          </p>
        </div>
        {/* Col 2: Products */}
        <div>
          <p className="font-body uppercase text-warm-white mb-5" style={{ fontSize: 11, letterSpacing: "0.28em" }}>Products</p>
          <div className="flex flex-col gap-3">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => navigate("category", { categoryId: cat.id })}
                className="font-body text-warm-grey text-left transition-colors duration-200 hover:text-warm-white"
                style={{ fontSize: 15, fontWeight: 300 }}>{cat.name}</button>
            ))}
          </div>
        </div>
        {/* Col 3: Company */}
        <div>
          <p className="font-body uppercase text-warm-white mb-5" style={{ fontSize: 11, letterSpacing: "0.28em" }}>Company</p>
          <div className="flex flex-col gap-3">
            {[
              { label: "Projects", page: "projects" },
              { label: "Collections", page: "collections" },
              { label: "About", page: "about" },
              { label: "Inspiration", page: "inspiration" },
              { label: "Architects & Designers", page: "architects" },
              { label: "Hospitality", page: "hospitality" },
            ].map(item => (
              <button key={item.label} onClick={() => navigate(item.page)}
                className="font-body text-warm-grey text-left transition-colors duration-200 hover:text-warm-white"
                style={{ fontSize: 15, fontWeight: 300 }}>{item.label}</button>
            ))}
          </div>
        </div>
        {/* Col 4: Contact */}
        <div>
          <p className="font-body uppercase text-warm-white mb-5" style={{ fontSize: 11, letterSpacing: "0.28em" }}>Contact</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("contact")}
              className="font-body text-warm-grey text-left hover:text-warm-white transition-colors"
              style={{ fontSize: 15, fontWeight: 300 }}>Project Inquiry</button>
            <button onClick={() => navigate("showrooms")}
              className="font-body text-warm-grey text-left hover:text-warm-white transition-colors"
              style={{ fontSize: 15, fontWeight: 300 }}>Dealer Inquiry</button>
            <p className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300 }}>info@evoke.in</p>
            <p className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.75 }}>
              EVOKE India<br />
              Bengaluru · Mumbai · Delhi
            </p>
          </div>
        </div>
      </div>
      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ borderTop: "1px solid rgba(167,163,155,0.2)", paddingTop: 24 }}>
        <p className="font-body text-warm-grey" style={{ fontSize: 12, fontWeight: 300 }}>
          © 2025 EVOKE. All rights reserved.
          {/* Hidden admin entry — invisible dot */}
          <span onClick={() => navigate("admin")}
            style={{ opacity: 0, cursor: "default", userSelect: "none", paddingLeft: 4 }}
            aria-hidden="true">·</span>
        </p>
        <div className="flex gap-6">
          {["Privacy Policy", "Terms", "Sitemap"].map(item => (
            <button key={item} className="font-body text-warm-grey hover:text-warm-white transition-colors"
              style={{ fontSize: 12, fontWeight: 300 }}>{item}</button>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ═══════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// SEARCH BAR COMPONENT (homepage + reusable)
// ═══════════════════════════════════════════

const EXAMPLE_SEARCHES = [
  "wall mounted mixer", "brushed nickel shower", "vessel basin",
  "matte black faucet", "LED mirror", "towel rail",
];

const SearchBar = ({ navigate }) => {
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState(EXAMPLE_SEARCHES[0]);
  const inputRef = useRef(null);

  // Cycle placeholder examples
  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % EXAMPLE_SEARCHES.length;
      setPlaceholder(EXAMPLE_SEARCHES[idx]);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate("search", { query: q });
  };

  // Shared vertical rhythm: 20px padding-top, 20px padding-bottom on BOTH
  // input and button. The form has no border — each child owns its own
  // borderBottom at the same distance from baseline → pixel-perfect alignment.
  const rowPad = { paddingTop: 26, paddingBottom: 26 };
  const BORDER = "1px solid rgba(167,163,155,0.25)";

  return (
    <div style={{ borderTop: BORDER, borderBottom: BORDER }}>
      <form onSubmit={handleSubmit} className="flex items-end gap-0">

        {/* Search icon */}
        <div className="flex items-center flex-shrink-0"
          style={{ padding: "0 24px", paddingBottom: 26, paddingTop: 26 }}>
          <svg width="17" height="17" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.45, display: "block" }}>
            <circle cx="6.5" cy="6.5" r="5.5" stroke="#F5F1EA" strokeWidth="1.3" />
            <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="#F5F1EA" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Try "${placeholder}"`}
          className="font-body text-warm-white flex-1"
          style={{
            fontSize: 16, fontWeight: 300, letterSpacing: "0.03em",
            background: "transparent", outline: "none", color: "#F5F1EA",
            border: "none",
            ...rowPad,
          }}
        />

        {/* Hint chips */}
        <div className="hidden lg:flex items-center gap-2 px-5 flex-shrink-0"
          style={{ paddingBottom: 26, paddingTop: 26 }}>
          {EXAMPLE_SEARCHES.slice(0, 3).map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => { setQuery(ex); navigate("search", { query: ex }); }}
              className="font-body transition-all duration-200"
              style={{ fontSize: 12, letterSpacing: "0.17em", border: "1px solid rgba(167,163,155,0.3)", color: "#8F8981", padding: "5px 14px", background: "transparent", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,241,234,0.5)"; e.currentTarget.style.color = "#F5F1EA"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(167,163,155,0.3)"; e.currentTarget.style.color = "#8F8981"; }}>
              {ex}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="font-body uppercase text-warm-white flex-shrink-0 transition-colors duration-200"
          style={{
            fontSize: 13, letterSpacing: "0.22em",
            background: "transparent",
            borderLeft: BORDER,
            padding: `${rowPad.paddingTop}px 36px ${rowPad.paddingBottom}px`,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(245,241,234,0.06)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          Search
        </button>
      </form>
    </div>
  );
};

const HomePage = ({ navigate, categories, products, collections }) => {
  const featuredProducts = products.filter(p => p.featured && p.published);

  return (
    <div>
      {/* HERO */}
      <section className="relative flex items-center justify-center"
        style={{ height: "100vh", minHeight: 600, background: "linear-gradient(145deg, #D8CEC0 0%, #8F8981 60%, #171717 100%)" }}>
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        >
          <source src={heroBgVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(14,14,13,0.45) 0%, rgba(14,14,13,0.75) 100%)" }} />
        <div className="relative z-10 text-center px-6" style={{ maxWidth: 800, marginTop: 80 }}>
          <div className="flex justify-center" style={{ marginBottom: 28 }}>
            <Wordmark style={{ fontSize: 48, color: "#F5F1EA", letterSpacing: "0.22em" }} />
          </div>
          <p className="font-body uppercase text-warm-grey mb-10" style={{ fontSize: 13, letterSpacing: "0.32em" }}>
            ARCHITECTURAL BATH SOLUTIONS
          </p>
          <h1 className="font-display text-warm-white" style={{
            fontSize: "clamp(32px, 4.5vw, 58px)", fontWeight: 400,
            letterSpacing: "0.14em", lineHeight: 1.2
          }}>
            Designed for Architecture.<br />Crafted for Living.
          </h1>
          <p className="font-body text-warm-white mt-8 mx-auto" style={{
            fontSize: 17, fontWeight: 300, opacity: 0.75, maxWidth: 520, lineHeight: 1.95
          }}>
            Complete bathroom systems for luxury residences, hotels, and landmark developments.
          </p>
          <div className="flex items-center justify-center gap-4 mt-12 flex-wrap">
            <button
              onClick={() => navigate("projects")}
              className="font-body uppercase transition-all duration-300"
              style={{
                fontSize: 12, letterSpacing: "0.28em", fontWeight: 400,
                background: "#F5F1EA", color: "#171717", padding: "14px 36px",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#D8CEC0"}
              onMouseLeave={e => e.currentTarget.style.background = "#F5F1EA"}
            >Explore Projects</button>
            <button
              onClick={() => navigate("category", { categoryId: "bath-fittings" })}
              className="font-body uppercase transition-all duration-300"
              style={{
                fontSize: 12, letterSpacing: "0.28em", fontWeight: 400,
                border: "1px solid rgba(245,241,234,0.6)", color: "#F5F1EA",
                padding: "14px 36px", background: "transparent",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,241,234,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >View Products</button>
          </div>
        </div>

      </section>

      {/* SEARCH BAR */}
      <section style={{ background: "#0E0E0D", padding: "0" }}>
        <div className="px-8 lg:px-16">
          <SearchBar navigate={navigate} />
        </div>
      </section>

      {/* BRAND INTRO */}
      <section className="bg-warm-white py-36">
        <div className="px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-body uppercase text-warm-grey mb-6" style={{ fontSize: 12, letterSpacing: "0.28em" }}>
              THE EVOKE STANDARD
            </p>
            <h2 className="font-display text-charcoal mb-8" style={{ fontSize: "clamp(32px, 3.5vw, 46px)", fontWeight: 400, letterSpacing: "0.14em", lineHeight: 1.2 }}>
              Where Italian Craftsmanship Meets Architectural Precision
            </h2>
            <p className="font-body text-warm-grey mb-6" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0 }}>
              EVOKE was founded on a single principle: that every element of the bathroom environment deserves the same level of specification rigour applied to structural architecture. We serve architects, interior designers, luxury developers, and five-star hospitality groups across India and internationally.
            </p>
            <p className="font-body text-warm-grey mb-10" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0 }}>
              Every product in our catalogue is designed as a complete system — faucet to finish, basin to cistern — coordinated across collections to allow seamless specification at any project scale.
            </p>
            <button
              onClick={() => navigate("about")}
              className="font-body uppercase text-charcoal transition-colors duration-200"
              style={{ fontSize: 12, letterSpacing: "0.28em", fontWeight: 400, textDecoration: "underline", textUnderlineOffset: 4 }}
            >Our Approach →</button>
          </div>
          <div className="relative">
            <ImageWithWatermark src={imgVHWB001} aspectClass="aspect-4/3" monogramSize={28} alt="Lago Vessel Basin — EVOKE" />
          </div>
        </div>
      </section>

      {/* BRAND PILLARS */}
      <section className="py-10" style={{ background: "#0E0E0D" }}>
        <div className="px-8 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-0">
            {[
              "Italian Craftsmanship", "Architectural Precision", "Specification Grade",
              "Built to Endure", "Timeless Design", "Global Projects"
            ].map((pillar, i) => (
              <div key={i} className="flex flex-col items-center text-center py-6 px-4"
                style={{ borderRight: i < 5 ? "1px solid rgba(167,163,155,0.2)" : "none" }}>
                <div className="mb-3">
                  <VMonogram size={20} color="#8F8981" />
                </div>
                <p className="font-body uppercase text-warm-grey" style={{ fontSize: 11, letterSpacing: "0.22em", lineHeight: 1.5 }}>
                  {pillar}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT CATEGORIES */}
      <section className="bg-warm-white py-28">
        <div className="px-8 lg:px-16">
          <SectionHeader eyebrow="COMPLETE SYSTEMS" heading="Every Element. Specified."
            subheading="From faucet to finish — a complete architectural bath solution." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "#D8CEC0" }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate("category", { categoryId: cat.id })}
                className="bg-warm-white text-left transition-all duration-500 group"
                style={{ border: "1px solid #D8CEC0" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C7B9A6"; e.currentTarget.style.transform = "translateY(-6px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#D8CEC0"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <ImageWithWatermark
                  src={{"bath-fittings":imgVHBF001,"shower-systems":imgVHSS001,"wash-basins":imgVHWB001,"luxury-vanities":imgVHLV001,"mirrors":imgEVMR001,"sanitaryware-accessories":imgEVSW001}[cat.id]}
                  aspectClass="aspect-4/3" monogramSize={24}
                  objectPosition={{"mirrors":"center 30%","luxury-vanities":"center 20%","wash-basins":"center 40%"}[cat.id] || "center center"}
                  alt={cat.name} />
                <div className="px-6 py-7" style={{ background: "#F5F1EA" }}>
                  <h3 className="font-display text-charcoal" style={{ fontSize: 21, fontWeight: 400, letterSpacing: "0.17em" }}>{cat.name}</h3>
                  <p className="font-body text-warm-grey mt-1" style={{ fontSize: 13, fontWeight: 300 }}>{cat.descriptor}</p>
                  <p className="font-body text-warm-grey mt-4 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ fontSize: 12 }}>→</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="py-24" style={{ background: "#D8CEC0" }}>
        <div className="px-8 lg:px-16">
          <SectionHeader eyebrow="OUR WORK" heading="Landmark Spaces"
            subheading="Specification-grade solutions delivered to the world's most demanding projects." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Luxury Residences", descriptor: "Private villas, penthouses and bespoke homes" },
              { title: "Five-Star Hospitality", descriptor: "Hotel suites, spas and wellness facilities" },
              { title: "Premium Villas", descriptor: "Branded residences and resort developments" },
              { title: "Commercial Projects", descriptor: "Mixed-use, serviced apartments and landmark offices" },
            ].map((proj, i) => (
              <button
                key={i}
                onClick={() => navigate("projects")}
                className="relative overflow-hidden text-left group transition-all duration-500"
                style={{ aspectRatio: "3/4", background: `linear-gradient(${135 + i * 15}deg, #D8CEC0, #8F8981)` }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                {[imgProjAurelia, imgProjStRegis, imgProjMeridian, imgProjMeridian][i] && (
                  <img
                    src={[imgProjAurelia, imgProjStRegis, imgProjMeridian, imgProjMeridian][i]}
                    alt={proj.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: "center" }}
                  />
                )}
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(14,14,13,0.75) 0%, transparent 55%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-warm-white" style={{ fontSize: 24, fontWeight: 400, letterSpacing: "0.1em" }}>{proj.title}</h3>
                  <p className="font-body text-warm-white mt-2" style={{ fontSize: 13, fontWeight: 300, opacity: 0.75 }}>{proj.descriptor}</p>
                  <p className="font-body text-warm-white mt-3 uppercase" style={{ fontSize: 11, letterSpacing: "0.22em", opacity: 0.8 }}>View Projects →</p>
                </div>
                <div className="absolute bottom-3 right-3 text-white" style={{ opacity: 0.15 }}>
                  <VMonogram size={20} color="white" />
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={() => navigate("projects")}
              className="font-body uppercase text-charcoal"
              style={{ fontSize: 12, letterSpacing: "0.28em", textDecoration: "underline", textUnderlineOffset: 4 }}>
              View All Projects →
            </button>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="bg-warm-white py-24">
        <div className="px-8 lg:px-16">
          <SectionHeader eyebrow="SIGNATURE COLLECTIONS" heading="Italian Design. Enduring Form." />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {collections.map(col => (
              <button
                key={col.id}
                onClick={() => navigate("collection-detail", { collectionId: col.id })}
                className="text-left group transition-all duration-500"
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, #D8CEC0, #8F8981)" }}>
                  {({"milano": imgColMilano, "como": imgColComo, "verona": imgColVerona})[col.id] && (
                    <img src={({"milano": imgColMilano, "como": imgColComo, "verona": imgColVerona})[col.id]}
                      alt={col.name + " Collection"}
                      className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute bottom-3 right-3 text-white" style={{ opacity: 0.15 }}>
                    <VMonogram size={28} color="white" />
                  </div>
                </div>
                <div className="pt-6 pb-2">
                  <div style={{ width: 32, height: 2, background: "#C7B9A6", marginBottom: 16 }} />
                  <h3 className="font-display text-charcoal" style={{ fontSize: 30, fontWeight: 400, letterSpacing: "0.17em" }}>{col.name}</h3>
                  <p className="font-body text-warm-grey mt-2" style={{ fontSize: 15, fontWeight: 300 }}>{col.mood}</p>
                  <p className="font-body text-charcoal uppercase mt-5" style={{ fontSize: 12, letterSpacing: "0.28em", fontWeight: 400 }}>
                    Explore Collection →
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTS CTA */}
      <section className="py-28" style={{ background: "#0E0E0D" }}>
        <div className="px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-body uppercase text-warm-grey mb-6" style={{ fontSize: 12, letterSpacing: "0.28em" }}>
              FOR THE SPECIFICATION COMMUNITY
            </p>
            <h2 className="font-display text-warm-white mb-8" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, letterSpacing: "0.14em", lineHeight: 1.2 }}>
              Designed for Architects, Designers and Developers
            </h2>
            <p className="font-body text-warm-grey mb-10" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0 }}>
              EVOKE offers dedicated specification support for the professional community — including project-specific pricing, finish coordination across entire builds, BOQ assistance, design consultation, bulk supply agreements, and a dedicated project manager for each engagement.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => navigate("architects")}
                className="font-body uppercase transition-all duration-300"
                style={{ fontSize: 12, letterSpacing: "0.28em", fontWeight: 400, background: "#F5F1EA", color: "#171717", padding: "14px 36px" }}
                onMouseEnter={e => e.currentTarget.style.background = "#D8CEC0"}
                onMouseLeave={e => e.currentTarget.style.background = "#F5F1EA"}
              >Request Specification Pack</button>
              <button
                onClick={() => navigate("contact")}
                className="font-body uppercase transition-all duration-300"
                style={{ fontSize: 12, letterSpacing: "0.28em", fontWeight: 400, border: "1px solid rgba(245,241,234,0.5)", color: "#F5F1EA", padding: "14px 36px", background: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(245,241,234,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >Book a Consultation</button>
            </div>
          </div>
          <div>
            <ImageWithWatermark src={imgVHBF001} aspectClass="aspect-4/3" monogramSize={28} alt="Elara Wall-Mounted Basin Mixer — EVOKE" />
          </div>
        </div>
      </section>

      {/* SHOWROOMS STRIP */}
      <section className="bg-warm-white py-16" style={{ borderTop: "1px solid #D8CEC0" }}>
        <div className="px-8 lg:px-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-charcoal" style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 400, letterSpacing: "0.14em" }}>
              Visit an EVOKE Showroom
            </h2>
            <p className="font-body text-warm-grey mt-3" style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.95 }}>
              Experience our complete collection at authorised showrooms and dealer partners.
            </p>
          </div>
          <div className="flex gap-6 items-center flex-shrink-0">
            <button
              onClick={() => navigate("showrooms")}
              className="font-body uppercase transition-all duration-300"
              style={{ fontSize: 12, letterSpacing: "0.28em", fontWeight: 400, border: "1px solid #171717", color: "#171717", padding: "12px 28px", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#171717"; e.currentTarget.style.color = "#F5F1EA"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#171717"; }}
            >Find a Showroom →</button>
            <button
              onClick={() => navigate("contact")}
              className="font-body text-charcoal"
              style={{ fontSize: 12, letterSpacing: "0.28em", textDecoration: "underline", textUnderlineOffset: 4 }}>
              Become a Dealer
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════
// CATEGORY PAGE
// ═══════════════════════════════════════════

const CategoryPage = ({ navigate, params, categories }) => {
  const category = categories.find(c => c.id === params.categoryId) || categories[0];
  return (
    <div style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center"
        style={{ height: "40vh", minHeight: 300, background: "linear-gradient(145deg, #D8CEC0, #8F8981)" }}>
        <div className="absolute inset-0" style={{ background: "rgba(14,14,13,0.4)" }} />
        <div className="absolute top-6 left-8 lg:left-16 z-10">
          <Breadcrumb navigate={navigate} items={[
            { label: "Home", page: "home" },
            { label: category.name }
          ]} />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="font-display text-warm-white" style={{ fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 300, letterSpacing: "0.17em" }}>
            {category.name}
          </h1>
          <div style={{ width: 40, height: 2, background: "#C7B9A6", margin: "16px auto 0" }} />
        </div>
      </div>

      {/* Subcategories */}
      <section className="bg-warm-white py-20">
        <div className="px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: "#D8CEC0" }}>
            {category.subcategories.map(sub => (
              <button
                key={sub.id}
                onClick={() => navigate("product-listing", { categoryId: category.id, subcategoryId: sub.id })}
                className="bg-warm-white text-left group transition-all duration-500"
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <ImageWithWatermark
                  src={{
              "wall-mounted-mixers": imgVHBF001,
              "deck-mounted-mixers": imgVHBF002,
              "rain-showerheads": imgVHSS001,
              "shower-columns": imgVHSS002,
              "vessel-basins": imgVHWB001,
              "wall-hung-vanities": imgVHLV001,
              "freestanding-vanities": imgVHLV001,
              "counter-top-basins": imgVHWB001,
            }[sub.id]}
                  aspectClass="aspect-video" monogramSize={20}
                  alt={sub.name} />
                <div className="px-6 py-7" style={{ borderTop: "1px solid #D8CEC0" }}>
                  <h3 className="font-display text-charcoal" style={{ fontSize: 26, fontWeight: 400, letterSpacing: "0.17em" }}>{sub.name}</h3>
                  <p className="font-body text-warm-grey mt-1" style={{ fontSize: 15, fontWeight: 300 }}>{sub.descriptor}</p>
                  <p className="font-body text-charcoal uppercase mt-5" style={{ fontSize: 12, letterSpacing: "0.28em" }}>View Products →</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════
// PRODUCT LISTING PAGE
// ═══════════════════════════════════════════

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "az",       label: "A–Z" },
  { value: "za",       label: "Z–A" },
  { value: "newest",   label: "Newest" },
];

const applySort = (arr, sortBy) => {
  const copy = [...arr];
  switch (sortBy) {
    case "az":      return copy.sort((a,b) => a.name.localeCompare(b.name));
    case "za":      return copy.sort((a,b) => b.name.localeCompare(a.name));
    case "newest":  return copy.sort((a,b) => b.id.localeCompare(a.id));
    case "featured":
    default:        return copy.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
};

const ProductListingPage = ({ navigate, params, products, categories, finishes }) => {
  const [activeFilters, setActiveFilters] = useState({ finishes: [], collections: [] });
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const category = categories.find(c => c.id === params.categoryId) || categories[0];
  const subcategory = category?.subcategories.find(s => s.id === params.subcategoryId);

  const filtered = applySort(products.filter(p => {
    if (!p.published) return false;
    if (p.categoryId !== params.categoryId) return false;
    if (params.subcategoryId && p.subcategoryId !== params.subcategoryId) return false;
    if (activeFilters.finishes.length > 0 && !activeFilters.finishes.some(f => p.finishes.includes(f))) return false;
    if (activeFilters.collections.length > 0 && !activeFilters.collections.includes(p.collectionId)) return false;
    return true;
  }), sortBy);

  const toggleFilter = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) ? prev[type].filter(v => v !== value) : [...prev[type], value]
    }));
  };

  const FilterContent = () => (
    <div>
      <p className="font-body uppercase text-warm-grey mb-6" style={{ fontSize: 11, letterSpacing: "0.28em" }}>REFINE</p>
      {/* Finish filters */}
      <div style={{ borderTop: "1px solid #D8CEC0", paddingTop: 20, marginTop: 20 }}>
        <p className="font-body text-charcoal uppercase mb-4" style={{ fontSize: 12, letterSpacing: "0.22em" }}>Finish</p>
        {finishes.map(f => (
          <label key={f.id} className="flex items-center gap-3 mb-3 cursor-pointer">
            <div
              onClick={() => toggleFilter("finishes", f.id)}
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 16, height: 16, border: `1px solid ${activeFilters.finishes.includes(f.id) ? "#171717" : "#D8CEC0"}`,
                background: activeFilters.finishes.includes(f.id) ? "#171717" : "transparent",
                flexShrink: 0
              }}>
              {activeFilters.finishes.includes(f.id) && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
            </div>
            <div className="flex items-center gap-2 flex-1" onClick={() => toggleFilter("finishes", f.id)}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: f.hex, border: "1px solid #D8CEC0" }} />
              <span className="font-body text-charcoal" style={{ fontSize: 15, fontWeight: 300 }}>{f.label}</span>
            </div>
          </label>
        ))}
      </div>
      {/* Collection filters */}
      <div style={{ borderTop: "1px solid #D8CEC0", paddingTop: 20, marginTop: 20 }}>
        <p className="font-body text-charcoal uppercase mb-4" style={{ fontSize: 12, letterSpacing: "0.22em" }}>Collection</p>
        {["milano", "como", "verona"].map(c => (
          <label key={c} className="flex items-center gap-3 mb-3 cursor-pointer">
            <div
              onClick={() => toggleFilter("collections", c)}
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 16, height: 16, border: `1px solid ${activeFilters.collections.includes(c) ? "#171717" : "#D8CEC0"}`,
                background: activeFilters.collections.includes(c) ? "#171717" : "transparent",
                flexShrink: 0
              }}>
              {activeFilters.collections.includes(c) && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
            </div>
            <span className="font-body text-charcoal capitalize" style={{ fontSize: 15, fontWeight: 300 }}
              onClick={() => toggleFilter("collections", c)}>{c.charAt(0).toUpperCase() + c.slice(1)}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block sticky top-18 self-start" style={{ width: 240, minWidth: 240, padding: "32px 24px", borderRight: "1px solid #D8CEC0", height: "calc(100vh - 72px)", overflowY: "auto" }}>
          <FilterContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 lg:px-10 py-10">
          {/* Breadcrumb */}
          <Breadcrumb navigate={navigate} items={[
            { label: "Home", page: "home" },
            { label: category?.name, page: "category", params: { categoryId: params.categoryId } },
            { label: subcategory?.name || "All Products" }
          ]} />

          <div className="flex items-center justify-between mt-6 mb-8">
            <h1 className="font-display text-charcoal" style={{ fontSize: 34, fontWeight: 400, letterSpacing: "0.14em" }}>
              {subcategory?.name || category?.name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-body text-warm-grey" style={{ fontSize: 13 }}>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="font-body text-charcoal"
                style={{ fontSize: 12, letterSpacing: "0.14em", border: "1px solid #D8CEC0", background: "#F5F1EA", padding: "5px 26px 5px 10px", cursor: "pointer", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238F8981'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", appearance: "none" }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden font-body text-charcoal uppercase border border-charcoal px-4 py-2"
                style={{ fontSize: 12, letterSpacing: "0.22em" }}>Filter +</button>
            </div>
          </div>

          {/* Mobile filters */}
          {filterOpen && (
            <div className="lg:hidden mb-8 p-6 border border-travertine bg-warm-white">
              <FilterContent />
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <p className="font-body text-warm-grey" style={{ fontSize: 14 }}>No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(product => (
                <button
                  key={product.id}
                  onClick={() => navigate("product-detail", { productId: product.id })}
                  className="text-left group transition-all duration-500"
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ border: "1px solid #D8CEC0" }}>
                    <ImageWithWatermark src={product.images[0]} aspectClass="aspect-square" monogramSize={20} alt={product.name} />
                    <div className="p-5" style={{ background: "#F5F1EA" }}>
                      <p className="font-body text-warm-grey uppercase" style={{ fontSize: 11, letterSpacing: "0.28em" }}>{product.id}</p>
                      <h3 className="font-display text-charcoal mt-1" style={{ fontSize: 21, fontWeight: 400, letterSpacing: "0.14em" }}>{product.name}</h3>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="font-body uppercase" style={{ fontSize: 11, letterSpacing: "0.22em", background: "#C7B9A6", color: "#171717", padding: "2px 8px" }}>
                          {product.collectionId}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {product.finishes.map(fId => {
                          const f = finishes.find(fn => fn.id === fId);
                          return f ? (
                            <div key={fId} style={{ width: 14, height: 14, borderRadius: "50%", background: f.hex, border: "2px solid #A7A39B" }} title={f.label} />
                          ) : null;
                        })}
                      </div>
                      <p className="font-body text-warm-grey mt-3" style={{ fontSize: 13, fontWeight: 300 }}>Pricing on request</p>
                      <p className="font-body text-charcoal uppercase mt-3" style={{ fontSize: 12, letterSpacing: "0.22em" }}>View Specifications →</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// PRODUCT DETAIL PAGE
// ═══════════════════════════════════════════

const ProductDetailPage = ({ navigate, params, products, categories, finishes }) => {
  const product = products.find(p => p.id === params.productId);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFinish, setSelectedFinish] = useState(null);
  const [selectedThumb, setSelectedThumb] = useState(0);

  useEffect(() => {
    if (product) setSelectedFinish(product.finishes[0]);
  }, [product?.id]);

  if (!product) return (
    <div className="flex items-center justify-center min-h-screen bg-warm-white">
      <p className="font-body text-warm-grey">Product not found.</p>
    </div>
  );

  const category = categories.find(c => c.id === product.categoryId);
  const subcategory = category?.subcategories.find(s => s.id === product.subcategoryId);
  const related = products.filter(p => product.relatedProducts.includes(p.id) && p.published);
  const activeFinish = finishes.find(f => f.id === selectedFinish);

  const mmToIn = (mm) => mm ? (mm / 25.4).toFixed(1) : "—";
  const kgToLb = (kg) => kg ? (kg * 2.205).toFixed(2) : "—";

  const tabs = ["overview", "dimensions", "downloads"];

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left: Image Panel */}
        <div className="lg:sticky lg:top-18 lg:h-screen flex flex-col" style={{ background: "#F5F1EA" }}>
          {/* Main image */}
          <div className="relative flex-1 overflow-hidden" style={{ minHeight: 400 }}>
            <div className="w-full h-full" style={{ background: "linear-gradient(145deg, #D8CEC0, #8F8981)" }}>
              {(() => {
                const lifestyleByCollection = { milano: imgColMilano, como: imgColComo, verona: imgColVerona };
                const lifestyle = lifestyleByCollection[product.collectionId] || imgColMilano;
                const slots = [
                  product.images[0] || lifestyle,
                  product.images[1] || lifestyle,
                  product.images[2] || lifestyle,
                  product.images[3] || lifestyle,
                ];
                const displayImg = slots[selectedThumb];
                return displayImg ? <img src={displayImg} alt={product.name} className="w-full h-full object-cover" /> : null;
              })()}
            </div>
            {/* Finish label */}
            {activeFinish && (
              <div className="absolute top-4 left-4 font-body uppercase"
                style={{ fontSize: 11, letterSpacing: "0.28em", background: "#F5F1EA", color: "#171717", padding: "4px 12px", border: "1px solid #D8CEC0" }}>
                {activeFinish.label}
              </div>
            )}
            <div className="absolute bottom-3 right-3" style={{ opacity: 0.15 }}>
              <VMonogram size={32} color="white" />
            </div>
          </div>

          {/* Thumbnails */}
          {(() => {
            // Build a 4-slot image array: real images first, then lifestyle fallbacks
            const lifestyleByCollection = {
              milano: imgColMilano, como: imgColComo, verona: imgColVerona,
            };
            const lifestyle = lifestyleByCollection[product.collectionId] || imgColMilano;
            const slots = [
              product.images[0] || lifestyle,
              product.images[1] || lifestyle,
              product.images[2] || lifestyle,
              product.images[3] || lifestyle,
            ];
            return (
              <div className="flex gap-2 p-4" style={{ borderTop: "1px solid #D8CEC0" }}>
                {slots.map((imgSrc, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedThumb(i)}
                    className="flex-1 overflow-hidden relative"
                    style={{
                      aspectRatio: "1",
                      border: `${selectedThumb === i ? 2 : 1}px solid ${selectedThumb === i ? "#C7B9A6" : "#D8CEC0"}`,
                      background: "linear-gradient(145deg, #D8CEC0, #C7B9A6)"
                    }}>
                    {imgSrc && (
                      <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    {i > 0 && !product.images[i] && (
                      <div className="absolute inset-0" style={{ background: "rgba(245,241,234,0.35)" }} />
                    )}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Finish selector */}
          <div className="p-6" style={{ borderTop: "1px solid #D8CEC0" }}>
            <p className="font-body uppercase text-warm-grey mb-3" style={{ fontSize: 11, letterSpacing: "0.28em" }}>SELECT FINISH</p>
            <div className="flex gap-4">
              {product.finishes.map(fId => {
                const f = finishes.find(fn => fn.id === fId);
                if (!f) return null;
                return (
                  <button key={fId} onClick={() => setSelectedFinish(fId)}
                    className="flex flex-col items-center gap-2">
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: f.hex,
                      border: `2px solid ${selectedFinish === fId ? "#171717" : "#D8CEC0"}`
                    }} />
                    <span className="font-body text-warm-grey" style={{ fontSize: 11 }}>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Spec Panel */}
        <div className="px-8 lg:px-14 py-12 bg-warm-white overflow-y-auto">
          <Breadcrumb navigate={navigate} items={[
            { label: "Home", page: "home" },
            { label: category?.name, page: "category", params: { categoryId: product.categoryId } },
            { label: subcategory?.name, page: "product-listing", params: { categoryId: product.categoryId, subcategoryId: product.subcategoryId } },
            { label: product.name }
          ]} />

          <p className="font-body text-warm-grey uppercase mt-6" style={{ fontSize: 11, letterSpacing: "0.28em" }}>{product.id}</p>
          <h1 className="font-display text-charcoal mt-2" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, letterSpacing: "0.17em", lineHeight: 1.15 }}>
            {product.name}
          </h1>
          <div className="mt-4">
            <span className="font-body uppercase" style={{ fontSize: 11, letterSpacing: "0.22em", background: "#C7B9A6", color: "#171717", padding: "3px 10px" }}>
              {product.collectionId?.charAt(0).toUpperCase() + product.collectionId?.slice(1)} Collection
            </span>
          </div>
          <div style={{ width: 40, height: 2, background: "#C7B9A6", marginTop: 24, marginBottom: 24 }} />

          <p className="font-body text-warm-grey" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0 }}>{product.description}</p>

          <div className="mt-6">
            <p className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300 }}>
              {product.pricingMode === "show-mrp"
                ? `₹${product.mrp?.toLocaleString("en-IN")}`
                : "Pricing available on request"}
            </p>
            <p className="font-body text-warm-grey mt-1" style={{ fontSize: 12, fontWeight: 300, opacity: 0.7 }}>
              Contact our project team for specification pricing and availability.
            </p>
          </div>

          <div className="flex gap-4 mt-8 flex-wrap">
            <button
              onClick={() => navigate("contact")}
              className="font-body uppercase transition-all duration-300"
              style={{ fontSize: 12, letterSpacing: "0.28em", fontWeight: 400, background: "#171717", color: "#F5F1EA", padding: "14px 28px" }}
              onMouseEnter={e => e.currentTarget.style.background = "#0E0E0D"}
              onMouseLeave={e => e.currentTarget.style.background = "#171717"}
            >Request a Quote</button>
            <button
              onClick={() => navigate("contact")}
              className="font-body uppercase transition-all duration-300"
              style={{ fontSize: 12, letterSpacing: "0.28em", fontWeight: 400, border: "1px solid #171717", color: "#171717", padding: "14px 28px", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#171717"; e.currentTarget.style.color = "#F5F1EA"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#171717"; }}
            >Request Spec Sheet</button>
          </div>

          <div style={{ borderTop: "1px solid #D8CEC0", marginTop: 40 }} />

          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid #D8CEC0", marginTop: 32 }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="font-body uppercase mr-8 pb-3 transition-colors duration-200"
                style={{
                  fontSize: 12, letterSpacing: "0.28em", fontWeight: 400,
                  color: activeTab === tab ? "#171717" : "#8F8981",
                  borderBottom: activeTab === tab ? "2px solid #C7B9A6" : "2px solid transparent",
                  marginBottom: -1
                }}
              >{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-8">
            {activeTab === "overview" && (
              <div>
                <h3 className="font-display text-charcoal mb-6" style={{ fontSize: 21, fontWeight: 400, letterSpacing: "0.14em" }}>Key Specifications</h3>
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between py-3" style={{ borderBottom: "1px solid #D8CEC0" }}>
                    <span className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300 }}>{spec.key}</span>
                    <span className="font-body text-charcoal" style={{ fontSize: 15, fontWeight: 400 }}>{spec.value}</span>
                  </div>
                ))}
                <h3 className="font-display text-charcoal mt-8 mb-4" style={{ fontSize: 21, fontWeight: 400, letterSpacing: "0.14em" }}>Features</h3>
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid #D8CEC0" }}>
                    <span className="text-sand mt-0.5" style={{ fontSize: 13 }}>—</span>
                    <span className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300 }}>{f}</span>
                  </div>
                ))}
                <div className="mt-6">
                  <p className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300 }}>
                    <strong className="text-charcoal font-normal">Material:</strong> {product.material}
                  </p>
                  {product.additionalMaterial && (
                    <p className="font-body text-warm-grey mt-2" style={{ fontSize: 15, fontWeight: 300 }}>
                      <strong className="text-charcoal font-normal">Additional:</strong> {product.additionalMaterial}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "dimensions" && (
              <div>
                <table className="w-full" style={{ borderTop: "1px solid #D8CEC0" }}>
                  <thead>
                    <tr style={{ background: "#F5F1EA" }}>
                      <th className="font-body text-warm-grey text-left py-3 px-4 uppercase" style={{ fontSize: 11, letterSpacing: "0.22em", fontWeight: 400 }}>Dimension</th>
                      <th className="font-body text-warm-grey text-right py-3 px-4 uppercase" style={{ fontSize: 11, letterSpacing: "0.22em", fontWeight: 400 }}>mm</th>
                      <th className="font-body text-warm-grey text-right py-3 px-4 uppercase" style={{ fontSize: 11, letterSpacing: "0.22em", fontWeight: 400 }}>inches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Height", key: "height" },
                      { label: "Width", key: "width" },
                      { label: "Depth", key: "depth" },
                      { label: "Spout Reach", key: "spoutReach" },
                      { label: "Spout Height", key: "spoutHeight" },
                    ].map((row, i) => product.dimensions[row.key] ? (
                      <tr key={i} style={{ borderBottom: "1px solid #D8CEC0", background: i % 2 === 0 ? "#F5F1EA" : "white" }}>
                        <td className="font-body text-warm-grey py-3 px-4" style={{ fontSize: 15, fontWeight: 300 }}>{row.label}</td>
                        <td className="font-body text-charcoal text-right py-3 px-4" style={{ fontSize: 15 }}>{product.dimensions[row.key]}</td>
                        <td className="font-body text-charcoal text-right py-3 px-4" style={{ fontSize: 15 }}>{mmToIn(product.dimensions[row.key])}"</td>
                      </tr>
                    ) : null)}
                    <tr style={{ borderBottom: "1px solid #D8CEC0", background: "white" }}>
                      <td className="font-body text-warm-grey py-3 px-4" style={{ fontSize: 15, fontWeight: 300 }}>Weight</td>
                      <td className="font-body text-charcoal text-right py-3 px-4" style={{ fontSize: 15 }}>{product.dimensions.weight}kg</td>
                      <td className="font-body text-charcoal text-right py-3 px-4" style={{ fontSize: 15 }}>{kgToLb(product.dimensions.weight)}lb</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-8 flex items-center justify-center"
                  style={{ aspectRatio: "16/9", background: "linear-gradient(145deg, #D8CEC0, #C7B9A6)", position: "relative" }}>
                  <p className="font-body text-warm-grey uppercase" style={{ fontSize: 11, letterSpacing: "0.22em" }}>
                    DIMENSION DIAGRAM
                  </p>
                </div>
              </div>
            )}

            {activeTab === "downloads" && (
              <div>
                {[
                  { label: "Technical Data Sheet", type: "PDF" },
                  { label: "Installation Manual", type: "PDF" },
                  { label: "CAD Drawing (.dwg)", type: "DWG" },
                  { label: "BIM File", type: "BIM" },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #D8CEC0" }}>
                    <div className="flex items-center gap-4">
                      <span className="font-body text-warm-grey uppercase" style={{ fontSize: 11, letterSpacing: "0.22em", background: "#D8CEC0", padding: "2px 8px" }}>{doc.type}</span>
                      <span className="font-body text-charcoal" style={{ fontSize: 15, fontWeight: 300 }}>{doc.label}</span>
                    </div>
                    <button
                      onClick={() => navigate("contact")}
                      className="font-body text-warm-grey hover:text-charcoal transition-colors"
                      style={{ fontSize: 12, letterSpacing: "0.17em" }}>
                      Request →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div style={{ marginTop: 64, borderTop: "1px solid #D8CEC0", paddingTop: 48 }}>
              <p className="font-body uppercase text-warm-grey mb-8" style={{ fontSize: 12, letterSpacing: "0.28em" }}>YOU MAY ALSO SPECIFY</p>
              <div className="grid grid-cols-3 gap-4">
                {related.slice(0, 3).map(rel => (
                  <button key={rel.id} onClick={() => navigate("product-detail", { productId: rel.id })}
                    className="text-left">
                    <ImageWithWatermark src={rel.images[0]} aspectClass="aspect-square" monogramSize={16} alt={rel.name} />
                    <p className="font-body text-warm-grey mt-2" style={{ fontSize: 11, letterSpacing: "0.22em" }}>{rel.id}</p>
                    <p className="font-body text-charcoal" style={{ fontSize: 15, fontWeight: 400, letterSpacing: "0.10em", marginTop: 2 }}>{rel.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// COLLECTIONS PAGE
// ═══════════════════════════════════════════

const CollectionsPage = ({ navigate, collections, products }) => (
  <div style={{ paddingTop: 80 }}>
    <div className="relative flex items-center justify-center" style={{ height: "40vh", background: "linear-gradient(145deg, #D8CEC0, #8F8981)" }}>
      <div className="absolute inset-0" style={{ background: "rgba(14,14,13,0.4)" }} />
      <div className="relative z-10 text-center">
        <h1 className="font-display text-warm-white" style={{ fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 300, letterSpacing: "0.17em" }}>
          Signature Collections
        </h1>
        <div style={{ width: 40, height: 2, background: "#C7B9A6", margin: "16px auto 0" }} />
      </div>
    </div>
    <section className="bg-warm-white py-24">
      <div className="px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {collections.map(col => (
            <button key={col.id} onClick={() => navigate("collection-detail", { collectionId: col.id })}
              className="text-left transition-all duration-500 group"
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", background: "linear-gradient(145deg, #D8CEC0, #8F8981)" }}>
                {({ milano: imgColMilano, como: imgColComo, verona: imgColVerona })[col.id] && (
                  <img
                    src={({ milano: imgColMilano, como: imgColComo, verona: imgColVerona })[col.id]}
                    alt={col.name + " Collection"}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: "center" }}
                  />
                )}
                <div className="absolute bottom-3 right-3" style={{ opacity: 0.15 }}><VMonogram size={28} color="white" /></div>
              </div>
              <div className="pt-6">
                <div style={{ width: 32, height: 2, background: "#C7B9A6", marginBottom: 16 }} />
                <h3 className="font-display text-charcoal" style={{ fontSize: 34, fontWeight: 400, letterSpacing: "0.17em" }}>{col.name}</h3>
                <p className="font-body text-warm-grey mt-2" style={{ fontSize: 15, fontWeight: 300 }}>{col.mood}</p>
                <p className="font-body text-charcoal uppercase mt-5" style={{ fontSize: 12, letterSpacing: "0.28em" }}>Explore →</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  </div>
);

const CollectionDetailPage = ({ navigate, params, collections, products, categories }) => {
  const collection = collections.find(c => c.id === params.collectionId) || collections[0];
  const colProducts = products.filter(p => p.collectionId === collection.id && p.published);
  return (
    <div style={{ paddingTop: 80 }}>
      <div className="relative flex items-center justify-center" style={{ height: "50vh", background: "linear-gradient(145deg, #D8CEC0, #171717)" }}>
        <div className="absolute inset-0" style={{ background: "rgba(14,14,13,0.5)" }} />
        <div className="relative z-10 text-center">
          <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>EVOKE COLLECTION</p>
          <h1 className="font-display text-warm-white" style={{ fontSize: "clamp(42px, 6vw, 80px)", fontWeight: 300, letterSpacing: "0.22em" }}>{collection.name}</h1>
          <p className="font-body text-warm-white mt-4" style={{ fontSize: 17, fontWeight: 300, opacity: 0.75 }}>{collection.mood}</p>
          <div style={{ width: 40, height: 2, background: "#C7B9A6", margin: "20px auto 0" }} />
        </div>
      </div>
      <section className="bg-warm-white py-20">
        <div className="px-8 lg:px-16">
          <SectionHeader eyebrow={`${collection.name} COLLECTION`} heading="Complete Specification Range" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {colProducts.map(p => (
              <button key={p.id} onClick={() => navigate("product-detail", { productId: p.id })}
                className="text-left transition-all duration-500"
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ border: "1px solid #D8CEC0" }}>
                  <ImageWithWatermark src={p.images[0]} aspectClass="aspect-square" monogramSize={20} alt={p.name} />
                  <div className="p-5" style={{ background: "#F5F1EA" }}>
                    <p className="font-body text-warm-grey uppercase" style={{ fontSize: 11, letterSpacing: "0.22em" }}>{p.id}</p>
                    <h3 className="font-display text-charcoal mt-1" style={{ fontSize: 20, fontWeight: 400, letterSpacing: "0.1em" }}>{p.name}</h3>
                    <p className="font-body text-charcoal uppercase mt-3" style={{ fontSize: 12, letterSpacing: "0.22em" }}>View Specifications →</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-16 py-16 text-center" style={{ background: "#0E0E0D" }}>
            <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>FOR PROJECT TEAMS</p>
            <h2 className="font-display text-warm-white mb-6" style={{ fontSize: 38, fontWeight: 400, letterSpacing: "0.14em" }}>Request Specification Pack</h2>
            <button onClick={() => navigate("contact")}
              className="font-body uppercase transition-all duration-300"
              style={{ fontSize: 12, letterSpacing: "0.28em", background: "#F5F1EA", color: "#171717", padding: "14px 36px" }}>
              Get in Touch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════
// CONTACT PAGE
// ═══════════════════════════════════════════

const ContactPage = ({ navigate }) => {
  const [form, setForm] = useState({ name: "", company: "", projectType: "", city: "", country: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="py-20 px-10 lg:px-16" style={{ background: "#D8CEC0" }}>
          <p className="font-body uppercase text-charcoal mb-4" style={{ fontSize: 12, letterSpacing: "0.28em", opacity: 0.6 }}>GET IN TOUCH</p>
          <h1 className="font-display text-charcoal mb-8" style={{ fontSize: "clamp(38px, 4vw, 56px)", fontWeight: 400, letterSpacing: "0.14em" }}>
            Project Inquiry
          </h1>
          <div style={{ width: 40, height: 2, background: "#8F8981", marginBottom: 40 }} />
          <div className="space-y-6">
            <div>
              <p className="font-body text-charcoal uppercase mb-1" style={{ fontSize: 11, letterSpacing: "0.22em", opacity: 0.7 }}>EMAIL</p>
              <p className="font-body text-charcoal" style={{ fontSize: 17, fontWeight: 300 }}>projects@evoke.in</p>
            </div>
            <div>
              <p className="font-body text-charcoal uppercase mb-1" style={{ fontSize: 11, letterSpacing: "0.22em", opacity: 0.7 }}>SHOWROOMS</p>
              <p className="font-body text-charcoal" style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.95 }}>
                Bengaluru · Mumbai · Delhi NCR<br />New Appointment Required
              </p>
            </div>
            <div>
              <p className="font-body text-charcoal uppercase mb-1" style={{ fontSize: 11, letterSpacing: "0.22em", opacity: 0.7 }}>SPECIFICATION SUPPORT</p>
              <p className="font-body text-charcoal" style={{ fontSize: 17, fontWeight: 300 }}>+91 80 4612 0000</p>
            </div>
          </div>
          <div className="mt-16 opacity-10 flex justify-center"><VMonogram size={80} color="#171717" /></div>
        </div>
        <div className="py-20 px-10 lg:px-16 bg-warm-white">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full">
              <VMark size={48} className="text-charcoal mb-8" />
              <h2 className="font-display text-charcoal text-center" style={{ fontSize: 38, fontWeight: 400, letterSpacing: "0.14em" }}>Inquiry Received</h2>
              <p className="font-body text-warm-grey text-center mt-4" style={{ fontSize: 17, fontWeight: 300 }}>Our specification team will be in touch within 48 hours.</p>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-charcoal mb-10" style={{ fontSize: 34, fontWeight: 400, letterSpacing: "0.14em" }}>Tell us about your project</h2>
              <div className="grid grid-cols-2 gap-5 mb-5">
                {[
                  { key: "name", label: "NAME", placeholder: "Your full name" },
                  { key: "company", label: "COMPANY / PRACTICE", placeholder: "Firm or company name" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="font-body uppercase text-warm-grey block mb-1" style={{ fontSize: 11, letterSpacing: "0.22em" }}>{field.label}</label>
                    <input
                      value={form[field.key]}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full font-body text-charcoal"
                      style={{ border: "1px solid #D8CEC0", padding: "10px 12px", fontSize: 14, fontWeight: 300, background: "white", outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "#171717"}
                      onBlur={e => e.target.style.borderColor = "#D8CEC0"}
                    />
                  </div>
                ))}
              </div>
              <div className="mb-5">
                <label className="font-body uppercase text-warm-grey block mb-1" style={{ fontSize: 11, letterSpacing: "0.22em" }}>PROJECT TYPE</label>
                <select
                  value={form.projectType}
                  onChange={e => setForm(p => ({ ...p, projectType: e.target.value }))}
                  className="w-full font-body text-charcoal"
                  style={{ border: "1px solid #D8CEC0", padding: "10px 12px", fontSize: 14, fontWeight: 300, background: "white", outline: "none" }}>
                  <option value="">Select project type</option>
                  {["Residential", "Hospitality", "Commercial", "Retail Inquiry", "Other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-5 mb-5">
                {[
                  { key: "city", label: "CITY", placeholder: "City" },
                  { key: "email", label: "EMAIL", placeholder: "email@example.com" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="font-body uppercase text-warm-grey block mb-1" style={{ fontSize: 11, letterSpacing: "0.22em" }}>{field.label}</label>
                    <input
                      value={form[field.key]}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full font-body text-charcoal"
                      style={{ border: "1px solid #D8CEC0", padding: "10px 12px", fontSize: 14, fontWeight: 300, background: "white", outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "#171717"}
                      onBlur={e => e.target.style.borderColor = "#D8CEC0"}
                    />
                  </div>
                ))}
              </div>
              <div className="mb-5">
                <label className="font-body uppercase text-warm-grey block mb-1" style={{ fontSize: 11, letterSpacing: "0.22em" }}>MESSAGE</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your project, timeline, and specification requirements..."
                  rows={5}
                  className="w-full font-body text-charcoal"
                  style={{ border: "1px solid #D8CEC0", padding: "10px 12px", fontSize: 14, fontWeight: 300, background: "white", outline: "none", resize: "none" }}
                  onFocus={e => e.target.style.borderColor = "#171717"}
                  onBlur={e => e.target.style.borderColor = "#D8CEC0"}
                />
              </div>
              <button
                onClick={async () => {
                  await submitEnquiry(form).catch(() => {});
                  setSubmitted(true);
                }}
                className="w-full font-body uppercase transition-all duration-300"
                style={{ fontSize: 12, letterSpacing: "0.28em", fontWeight: 400, background: "#171717", color: "#F5F1EA", padding: "16px" }}
                onMouseEnter={e => e.currentTarget.style.background = "#0E0E0D"}
                onMouseLeave={e => e.currentTarget.style.background = "#171717"}
              >Send Inquiry</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// STUB PAGES
// ═══════════════════════════════════════════



// ═══════════════════════════════════════════
// SEARCH UTILITIES
// ═══════════════════════════════════════════

const SYNONYMS = {
  faucet:   ["mixer", "tap", "basin mixer", "faucet"],
  tap:      ["mixer", "faucet", "tap"],
  sink:     ["basin", "wash basin", "vessel basin", "counter top", "sink"],
  gold:     ["brushed-gold", "brushed gold", "bronze", "smoked bronze", "warm metal", "gold"],
  black:    ["matte-black", "matte black", "warm charcoal", "charcoal", "black"],
  silver:   ["chrome", "brushed-nickel", "brushed nickel", "silver"],
  cabinet:  ["vanity", "cabinet", "unit"],
  shower:   ["showerhead", "shower column", "shower system", "rain shower", "thermostatic", "shower"],
  mirror:   ["mirror", "smart mirror", "led mirror", "frameless mirror"],
  toilet:   ["WC", "wall hung WC", "cistern", "sanitaryware", "toilet"],
  light:    ["lighting", "light bar", "downlight", "recessed", "ceiling light", "mirror light"],
  hook:     ["robe hook", "hook", "towel rail", "accessory"],
  towel:    ["towel rail", "towel bar", "robe hook", "towel"],
};

const expandQuery = (q) => {
  const lower = q.toLowerCase();
  const words = lower.split(/\s+/);
  const expanded = new Set(words);
  words.forEach(w => {
    Object.entries(SYNONYMS).forEach(([key, vals]) => {
      if (key === w || vals.some(v => v.toLowerCase().includes(w))) {
        vals.forEach(v => v.split(" ").forEach(t => expanded.add(t.toLowerCase())));
        expanded.add(key);
      }
    });
  });
  return Array.from(expanded);
};

const scoreProduct = (product, terms) => {
  const haystack = [
    product.name,
    product.description,
    product.categoryId,
    product.collectionId,
    product.subcategoryId,
    product.sku,
    ...(product.tags || []),
    ...(product.finishes || []),
    product.material || "",
  ].join(" ").toLowerCase();

  return terms.reduce((score, term) => {
    if (!term || term.length < 2) return score;
    if (haystack.includes(term)) {
      // Weight: name match > tag > description
      if (product.name.toLowerCase().includes(term)) return score + 3;
      if ((product.tags || []).some(t => t.toLowerCase().includes(term))) return score + 2;
      return score + 1;
    }
    return score;
  }, 0);
};

const searchProducts = (query, products) => {
  if (!query.trim()) return [];
  const terms = expandQuery(query);
  const scored = products
    .filter(p => p.published)
    .map(p => ({ product: p, score: scoreProduct(p, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map(s => s.product);
};

// ═══════════════════════════════════════════
// SEARCH PAGE
// ═══════════════════════════════════════════

const SearchPage = ({ navigate, query, products, categories }) => {
  const [localQuery, setLocalQuery] = useState(query || "");
  const [sortBy, setSortBy] = useState("featured");

  const raw = searchProducts(localQuery, products);
  const results = applySort(raw, sortBy);

  // Fallback: related products when no results
  const fallback = localQuery.trim()
    ? applySort(products.filter(p => p.published && p.featured), sortBy).slice(0, 6)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) navigate("search", { query: localQuery.trim() });
  };

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: "#F5F1EA" }}>
      {/* Search header */}
      <div style={{ background: "#0E0E0D", padding: "48px 0 40px" }}>
        <div className="px-8 lg:px-16">
          <p className="font-body uppercase text-warm-grey mb-5" style={{ fontSize: 11, letterSpacing: "0.32em" }}>PRODUCT SEARCH</p>
          <form onSubmit={handleSearchSubmit} className="flex items-end gap-0" style={{ maxWidth: 680 }}>
            <input
              type="text"
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              placeholder="Search by product, finish, collection, SKU…"
              className="font-body text-warm-white flex-1"
              style={{
                fontSize: 21, fontWeight: 300, letterSpacing: "0.04em",
                background: "transparent", border: "none",
                borderBottom: "1px solid rgba(245,241,234,0.3)",
                padding: "0 0 14px 0", outline: "none",
              }}
              autoFocus
            />
            <button type="submit"
              className="font-body uppercase text-warm-white transition-colors duration-200"
              style={{
                fontSize: 12, letterSpacing: "0.28em",
                padding: "0 24px 14px 24px",
                borderBottom: "1px solid rgba(245,241,234,0.3)",
                background: "transparent", flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#C7B9A6"}
              onMouseLeave={e => e.currentTarget.style.color = "#F5F1EA"}>
              Search →
            </button>
          </form>
        </div>
      </div>

      {/* Results meta bar */}
      <div style={{ borderBottom: "1px solid #D8CEC0", padding: "16px 0", background: "#F5F1EA" }}>
        <div className="px-8 lg:px-16 flex items-center justify-between flex-wrap gap-4">
          <div>
            {localQuery.trim() ? (
              <p className="font-body text-charcoal" style={{ fontSize: 14, fontWeight: 300 }}>
                {results.length > 0
                  ? <><span style={{ fontWeight: 400 }}>{results.length} result{results.length !== 1 ? "s" : ""}</span> for "<span style={{ fontStyle: "italic" }}>{localQuery}</span>"</>
                  : <>No results for "<span style={{ fontStyle: "italic" }}>{localQuery}</span>" — showing related products</>
                }
              </p>
            ) : (
              <p className="font-body text-warm-grey" style={{ fontSize: 15 }}>Enter a search term above</p>
            )}
          </div>
          {(results.length > 0 || fallback.length > 0) && (
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="font-body text-charcoal"
              style={{ fontSize: 12, letterSpacing: "0.14em", border: "1px solid #D8CEC0", background: "#F5F1EA", padding: "5px 26px 5px 10px", cursor: "pointer", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238F8981'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", appearance: "none" }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Results grid */}
      <section className="py-16">
        <div className="px-8 lg:px-16">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {results.map(product => (
                <button key={product.id}
                  onClick={() => navigate("product-detail", { productId: product.id })}
                  className="text-left group transition-all duration-300"
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <ImageWithWatermark src={product.images[0]} aspectClass="aspect-square" monogramSize={20} alt={product.name} />
                  <div className="pt-4">
                    <p className="font-body uppercase text-warm-grey" style={{ fontSize: 10, letterSpacing: "0.28em", marginBottom: 6 }}>
                      {product.collectionId?.charAt(0).toUpperCase() + product.collectionId?.slice(1)} · {product.sku}
                    </p>
                    <p className="font-display text-charcoal" style={{ fontSize: 20, fontWeight: 400, letterSpacing: "0.10em", lineHeight: 1.35 }}>{product.name}</p>
                    <p className="font-body text-warm-grey mt-2" style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.75 }}>{product.description?.slice(0, 80)}…</p>
                    <p className="font-body uppercase text-charcoal mt-3" style={{ fontSize: 11, letterSpacing: "0.22em" }}>Price on Application</p>
                  </div>
                </button>
              ))}
            </div>
          ) : localQuery.trim() ? (
            <div>
              {/* Empty state */}
              <div className="text-center py-20 mb-16">
                <VMonogram size={48} color="#D8CEC0" className="mx-auto mb-6" />
                <p className="font-display text-charcoal mb-3" style={{ fontSize: 34, fontWeight: 300, letterSpacing: "0.14em" }}>
                  No Results Found
                </p>
                <p className="font-body text-warm-grey mb-10 mx-auto" style={{ fontSize: 14, fontWeight: 300, maxWidth: 400, lineHeight: 1.95 }}>
                  We couldn't find a product matching "<span style={{ fontStyle: "italic" }}>{localQuery}</span>".
                  Our specification team may be able to help.
                </p>
                <button onClick={() => navigate("contact")}
                  className="font-body uppercase transition-all duration-300"
                  style={{ fontSize: 12, letterSpacing: "0.28em", background: "#171717", color: "#F5F1EA", padding: "14px 36px" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0E0E0D"}
                  onMouseLeave={e => e.currentTarget.style.background = "#171717"}>
                  Contact EVOKE →
                </button>
              </div>
              {/* Related products fallback */}
              <div>
                <p className="font-body uppercase text-warm-grey mb-10" style={{ fontSize: 11, letterSpacing: "0.32em" }}>YOU MAY ALSO LIKE</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {fallback.map(product => (
                    <button key={product.id}
                      onClick={() => navigate("product-detail", { productId: product.id })}
                      className="text-left group transition-all duration-300"
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                      <ImageWithWatermark src={product.images[0]} aspectClass="aspect-square" monogramSize={20} alt={product.name} />
                      <div className="pt-4">
                        <p className="font-body uppercase text-warm-grey" style={{ fontSize: 10, letterSpacing: "0.28em", marginBottom: 6 }}>{product.collectionId} · {product.sku}</p>
                        <p className="font-display text-charcoal" style={{ fontSize: 20, fontWeight: 400, letterSpacing: "0.10em" }}>{product.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // No query yet — show all featured
            <div>
              <p className="font-body uppercase text-warm-grey mb-10" style={{ fontSize: 11, letterSpacing: "0.32em" }}>FEATURED PRODUCTS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {applySort(products.filter(p => p.published && p.featured), sortBy).map(product => (
                  <button key={product.id}
                    onClick={() => navigate("product-detail", { productId: product.id })}
                    className="text-left group transition-all duration-300"
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <ImageWithWatermark src={product.images[0]} aspectClass="aspect-square" monogramSize={20} alt={product.name} />
                    <div className="pt-4">
                      <p className="font-body uppercase text-warm-grey" style={{ fontSize: 10, letterSpacing: "0.28em", marginBottom: 6 }}>{product.collectionId} · {product.sku}</p>
                      <p className="font-display text-charcoal" style={{ fontSize: 20, fontWeight: 400, letterSpacing: "0.10em" }}>{product.name}</p>
                      <p className="font-body uppercase text-charcoal mt-3" style={{ fontSize: 11, letterSpacing: "0.22em" }}>Price on Application</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════
// PROJECTS PAGE
// ═══════════════════════════════════════════

const ProjectsPage = ({ navigate }) => {
  const projects = [
    {
      id: "aurelia",
      number: "01",
      name: "The Aurelia Residences",
      location: "Mumbai, India",
      type: "Ultra-Luxury Residential",
      units: "184 residences · 3 towers",
      collections: ["Milano Collection", "Wall-Mounted Mixers", "Rain Shower Systems", "Custom Vanities"],
      summary: "EVOKE supplied a complete bathroom solution package for one of Mumbai's premium residential developments. The project focused on understated luxury, durable finishes, and consistent design language across all residences.",
    },
    {
      id: "stregis",
      number: "02",
      name: "The St. Regis Coastal Resort",
      location: "Goa, India",
      type: "Five-Star Hospitality",
      units: "220 guest rooms · 32 villas · Spa & wellness",
      collections: ["Verona Collection", "Thermostatic Shower Systems", "Smart Mirrors", "Luxury Accessories"],
      summary: "Designed for a luxury hospitality environment where aesthetics, maintenance efficiency, and guest experience were equally important.",
    },
    {
      id: "meridian",
      number: "03",
      name: "Meridian Business Suites",
      location: "Bengaluru, India",
      type: "Commercial",
      units: "1.2 million sq ft campus · Executive washrooms",
      collections: ["Milano Collection", "Sensor Faucets", "Architectural Lighting"],
      summary: "A commercial specification project prioritizing durability, water efficiency, and contemporary architectural detailing.",
    },
  ];

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div className="relative flex items-center justify-center"
        style={{ height: "40vh", minHeight: 320, background: "linear-gradient(145deg, #D8CEC0 0%, #8F8981 60%, #171717 100%)" }}>
        <div className="absolute inset-0" style={{ background: "rgba(14,14,13,0.45)" }} />
        <div className="relative z-10 text-center">
          <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>OUR WORK</p>
          <h1 className="font-display text-warm-white" style={{ fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 300, letterSpacing: "0.17em" }}>
            Landmark Projects
          </h1>
          <div style={{ width: 40, height: 2, background: "#C7B9A6", margin: "16px auto 0" }} />
        </div>
      </div>

      {/* Intro strip */}
      <section style={{ background: "#0E0E0D", padding: "48px 0" }}>
        <div className="px-8 lg:px-16">
          <p className="font-body text-warm-grey text-center mx-auto" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0, maxWidth: 640 }}>
            From private residences to five-star resorts, EVOKE delivers complete bathroom solutions for the world's most demanding projects.
          </p>
        </div>
      </section>

      {/* Projects list */}
      <section className="bg-warm-white py-20">
        <div className="px-8 lg:px-16">
          {projects.map((project, idx) => (
            <div key={project.id}
              style={{ borderBottom: idx < projects.length - 1 ? "1px solid #D8CEC0" : "none", paddingBottom: 72, marginBottom: 72 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Left: Project info */}
                <div>
                  <div className="flex items-center gap-6 mb-8">
                    <span className="font-display text-warm-grey" style={{ fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 300, letterSpacing: "0.1em", lineHeight: 1 }}>
                      {project.number}
                    </span>
                    <div style={{ width: 1, height: 64, background: "#D8CEC0" }} />
                    <div>
                      <p className="font-body uppercase text-warm-grey" style={{ fontSize: 11, letterSpacing: "0.28em", marginBottom: 6 }}>{project.type}</p>
                      <p className="font-body text-warm-grey" style={{ fontSize: 13, fontWeight: 300 }}>{project.location}</p>
                    </div>
                  </div>

                  <h2 className="font-display text-charcoal mb-6" style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, letterSpacing: "0.14em", lineHeight: 1.2 }}>
                    {project.name}
                  </h2>

                  <p className="font-body text-warm-grey mb-8" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0 }}>
                    {project.summary}
                  </p>

                  <p className="font-body text-warm-grey mb-3" style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.17em", textTransform: "uppercase" }}>Scope</p>
                  <p className="font-body text-warm-grey mb-8" style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.85 }}>{project.units}</p>

                  <p className="font-body text-warm-grey mb-3" style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.17em", textTransform: "uppercase" }}>Products Specified</p>
                  <div className="flex flex-wrap gap-2">
                    {project.collections.map(c => (
                      <span key={c} className="font-body" style={{ fontSize: 12, letterSpacing: "0.17em", background: "#F5F1EA", color: "#8F8981", border: "1px solid #D8CEC0", padding: "4px 12px" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Project image */}
                <div className="relative overflow-hidden"
                  style={{ aspectRatio: "4/3", background: `linear-gradient(${135 + idx * 20}deg, #D8CEC0 0%, #C7B9A6 40%, #8F8981 100%)` }}>
                  {({ aurelia: imgProjAurelia, stregis: imgProjStRegis, meridian: imgProjMeridian })[project.id] && (
                    <img
                      src={({ aurelia: imgProjAurelia, stregis: imgProjStRegis, meridian: imgProjMeridian })[project.id]}
                      alt={project.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: "center" }}
                    />
                  )}
                  <div className="absolute inset-0 flex items-end p-8"
                    style={{ background: "linear-gradient(to top, rgba(14,14,13,0.5) 0%, transparent 60%)" }}>
                    <div>
                      <p className="font-body uppercase text-warm-white" style={{ fontSize: 10, letterSpacing: "0.32em", opacity: 0.7 }}>PROJECT {project.number}</p>
                      <p className="font-display text-warm-white" style={{ fontSize: 21, fontWeight: 300, letterSpacing: "0.14em" }}>{project.name}</p>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6" style={{ opacity: 0.12 }}>
                    <VMonogram size={40} color="white" />
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#0E0E0D", padding: "80px 0" }}>
        <div className="px-8 lg:px-16 text-center">
          <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>START A PROJECT</p>
          <h2 className="font-display text-warm-white mb-6" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, letterSpacing: "0.14em" }}>
            Let's Specify Together
          </h2>
          <p className="font-body text-warm-grey mb-10 mx-auto" style={{ fontSize: 17, fontWeight: 300, maxWidth: 480, lineHeight: 1.95 }}>
            Tell us about your project and we'll connect you with the right specification consultant.
          </p>
          <button onClick={() => navigate("contact")}
            className="font-body uppercase transition-all duration-300"
            style={{ fontSize: 12, letterSpacing: "0.28em", background: "#F5F1EA", color: "#171717", padding: "14px 40px" }}
            onMouseEnter={e => e.currentTarget.style.background = "#D8CEC0"}
            onMouseLeave={e => e.currentTarget.style.background = "#F5F1EA"}>
            Project Inquiry →
          </button>
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════
// INSPIRATION PAGE
// ═══════════════════════════════════════════

const InspirationPage = ({ navigate }) => {
  const [activeBoard, setActiveBoard] = useState(null);

  const boards = [
    {
      id: "minimalism",
      label: "Modern Minimalism",
      eyebrow: "01",
      description: "Quiet spaces defined by natural materials, sculptural forms, and restrained detailing.",
      tags: ["Stone", "Matte Finishes", "Negative Space", "Vessel Basins"],
      accent: "linear-gradient(135deg, #D8CEC0 0%, #C7B9A6 60%, #8F8981 100%)",
    },
    {
      id: "warm",
      label: "Warm Contemporary",
      eyebrow: "02",
      description: "Travertine, brushed metals, and soft lighting create an inviting hospitality-inspired atmosphere.",
      tags: ["Travertine", "Brushed Nickel", "Warm Tones", "Deck Mixers"],
      accent: "linear-gradient(145deg, #C7B9A6 0%, #A7A39B 50%, #8F8981 100%)",
    },
    {
      id: "architectural",
      label: "Architectural Luxury",
      eyebrow: "03",
      description: "Large-format stone, bespoke joinery, and precision-crafted fixtures designed for premium residences.",
      tags: ["Large Format Stone", "Bespoke Joinery", "Chrome", "Wall-Hung Vanities"],
      accent: "linear-gradient(155deg, #171717 0%, #8F8981 60%, #C7B9A6 100%)",
    },
    {
      id: "wellness",
      label: "Wellness Retreat",
      eyebrow: "04",
      description: "Spa-inspired environments that prioritize calm, balance, and sensory comfort.",
      tags: ["Rain Showers", "Thermostatic", "Soft Lighting", "Natural Stone"],
      accent: "linear-gradient(145deg, #D8CEC0 0%, #A7A39B 100%)",
    },
    {
      id: "penthouse",
      label: "Urban Penthouse",
      eyebrow: "05",
      description: "Sophisticated city living with dramatic materials, integrated technology, and timeless elegance.",
      tags: ["Matte Black", "Smart Mirrors", "Statement Basins", "Sensor Faucets"],
      accent: "linear-gradient(145deg, #0E0E0D 0%, #171717 40%, #8F8981 100%)",
    },
  ];

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div className="relative flex items-center justify-center"
        style={{ height: "40vh", minHeight: 320, background: "linear-gradient(145deg, #D8CEC0 0%, #8F8981 60%, #171717 100%)" }}>
        <div className="absolute inset-0" style={{ background: "rgba(14,14,13,0.4)" }} />
        <div className="relative z-10 text-center">
          <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>SPACES & IDEAS</p>
          <h1 className="font-display text-warm-white" style={{ fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 300, letterSpacing: "0.17em" }}>Inspiration</h1>
          <div style={{ width: 40, height: 2, background: "#C7B9A6", margin: "16px auto 0" }} />
        </div>
      </div>

      {/* Intro */}
      <section className="bg-warm-white py-20">
        <div className="px-8 lg:px-16">
          <SectionHeader
            eyebrow="DESIGN DIRECTIONS"
            heading="Five Aesthetic Worlds"
            subheading="Explore curated design directions that define the EVOKE approach to the contemporary bathroom."
          />

          {/* Board grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px" style={{ background: "#D8CEC0" }}>
            {boards.slice(0, 3).map(board => (
              <button
                key={board.id}
                onClick={() => setActiveBoard(activeBoard === board.id ? null : board.id)}
                className="bg-warm-white text-left transition-all duration-500 group"
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", background: board.accent }}>
                  <div className="absolute inset-0 flex items-end p-6"
                    style={{ background: "linear-gradient(to top, rgba(14,14,13,0.65) 0%, transparent 55%)" }}>
                    <div>
                      <p className="font-body uppercase text-warm-white" style={{ fontSize: 10, letterSpacing: "0.32em", opacity: 0.6, marginBottom: 4 }}>{board.eyebrow}</p>
                      <p className="font-display text-warm-white" style={{ fontSize: 24, fontWeight: 400, letterSpacing: "0.14em" }}>{board.label}</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4" style={{ opacity: 0.12 }}>
                    <VMonogram size={28} color="white" />
                  </div>
                </div>
                <div className="px-6 py-6" style={{ borderTop: "1px solid #D8CEC0" }}>
                  <p className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.95 }}>{board.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {board.tags.map(tag => (
                      <span key={tag} className="font-body" style={{ fontSize: 11, letterSpacing: "0.17em", background: "#F5F1EA", color: "#8F8981", padding: "3px 10px", border: "1px solid #D8CEC0" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px mt-px" style={{ background: "#D8CEC0" }}>
            {boards.slice(3).map(board => (
              <button
                key={board.id}
                onClick={() => setActiveBoard(activeBoard === board.id ? null : board.id)}
                className="bg-warm-white text-left transition-all duration-500"
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", background: board.accent }}>
                  <div className="absolute inset-0 flex items-end p-6"
                    style={{ background: "linear-gradient(to top, rgba(14,14,13,0.65) 0%, transparent 55%)" }}>
                    <div>
                      <p className="font-body uppercase text-warm-white" style={{ fontSize: 10, letterSpacing: "0.32em", opacity: 0.6, marginBottom: 4 }}>{board.eyebrow}</p>
                      <p className="font-display text-warm-white" style={{ fontSize: 24, fontWeight: 400, letterSpacing: "0.14em" }}>{board.label}</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4" style={{ opacity: 0.12 }}>
                    <VMonogram size={28} color="white" />
                  </div>
                </div>
                <div className="px-6 py-6" style={{ borderTop: "1px solid #D8CEC0" }}>
                  <p className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.95 }}>{board.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {board.tags.map(tag => (
                      <span key={tag} className="font-body" style={{ fontSize: 11, letterSpacing: "0.17em", background: "#F5F1EA", color: "#8F8981", padding: "3px 10px", border: "1px solid #D8CEC0" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#D8CEC0", padding: "72px 0" }}>
        <div className="px-8 lg:px-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-charcoal" style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, letterSpacing: "0.14em" }}>
              Ready to Specify?
            </h2>
            <p className="font-body text-warm-grey mt-3" style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.95, maxWidth: 440 }}>
              Browse our complete product catalogue or speak to a specification consultant.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap flex-shrink-0">
            <button onClick={() => navigate("category", { categoryId: "bath-fittings" })}
              className="font-body uppercase transition-all duration-300"
              style={{ fontSize: 12, letterSpacing: "0.28em", background: "#171717", color: "#F5F1EA", padding: "14px 32px" }}
              onMouseEnter={e => e.currentTarget.style.background = "#0E0E0D"}
              onMouseLeave={e => e.currentTarget.style.background = "#171717"}>
              View Products →
            </button>
            <button onClick={() => navigate("contact")}
              className="font-body uppercase transition-all duration-300"
              style={{ fontSize: 12, letterSpacing: "0.28em", border: "1px solid #171717", color: "#171717", padding: "14px 32px", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#171717"; e.currentTarget.style.color = "#F5F1EA"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#171717"; }}>
              Speak to Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════
// ARCHITECTS & DESIGNERS PAGE
// ═══════════════════════════════════════════

const ArchitectsPage = ({ navigate }) => {
  const services = [
    "Technical specification assistance",
    "CAD & BIM support",
    "Finish sampling",
    "Product customization",
    "BOQ assistance",
    "Project coordination",
    "Dedicated specification consultants",
  ];

  const resources = [
    { label: "Product Catalogue", format: "PDF", desc: "Complete product specifications and finishes" },
    { label: "Technical Drawings", format: "DWG / PDF", desc: "2D CAD drawings for all products" },
    { label: "BIM Library", format: "RFA / IFC", desc: "Full BIM families for Revit and other platforms" },
    { label: "Installation Guides", format: "PDF", desc: "Step-by-step installation documentation" },
    { label: "Finish Sample Requests", format: "Physical", desc: "Request finish samples for your project" },
  ];

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div className="relative flex items-center justify-center"
        style={{ height: "50vh", minHeight: 360, background: "linear-gradient(145deg, #171717 0%, #8F8981 70%, #D8CEC0 100%)" }}>
        <div className="absolute inset-0" style={{ background: "rgba(14,14,13,0.5)" }} />
        <div className="relative z-10 text-center px-6" style={{ maxWidth: 680 }}>
          <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>SPECIFICATION COMMUNITY</p>
          <h1 className="font-display text-warm-white" style={{ fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 300, letterSpacing: "0.17em", lineHeight: 1.15 }}>
            Built for Specification
          </h1>
          <div style={{ width: 40, height: 2, background: "#C7B9A6", margin: "20px auto" }} />
          <p className="font-body text-warm-white" style={{ fontSize: 17, fontWeight: 300, opacity: 0.75, lineHeight: 1.95 }}>
            EVOKE works closely with architects, interior designers, consultants, and project teams to deliver tailored bathroom solutions.
          </p>
        </div>
      </div>

      {/* Services + Resources two-column */}
      <section className="bg-warm-white py-24">
        <div className="px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Services */}
          <div>
            <p className="font-body uppercase text-warm-grey mb-6" style={{ fontSize: 12, letterSpacing: "0.28em" }}>WHAT WE OFFER</p>
            <h2 className="font-display text-charcoal mb-8" style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, letterSpacing: "0.14em", lineHeight: 1.2 }}>
              End-to-End Specification Support
            </h2>
            <div>
              {services.map((svc, i) => (
                <div key={i} className="flex items-start gap-4 py-4" style={{ borderBottom: "1px solid #D8CEC0" }}>
                  <span className="font-body text-warm-grey" style={{ fontSize: 13, minWidth: 24, paddingTop: 1 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-body text-charcoal" style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.75 }}>{svc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="font-body uppercase text-warm-grey mb-6" style={{ fontSize: 12, letterSpacing: "0.28em" }}>RESOURCES AVAILABLE</p>
            <h2 className="font-display text-charcoal mb-8" style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, letterSpacing: "0.14em", lineHeight: 1.2 }}>
              Everything You Need to Specify
            </h2>
            <div>
              {resources.map((res, i) => (
                <div key={i} className="flex items-center justify-between py-4 group cursor-pointer"
                  style={{ borderBottom: "1px solid #D8CEC0" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F5F1EA"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div className="flex items-center gap-4 px-2">
                    <span className="font-body uppercase" style={{ fontSize: 10, letterSpacing: "0.22em", background: "#D8CEC0", color: "#171717", padding: "2px 8px" }}>
                      {res.format}
                    </span>
                    <div>
                      <p className="font-body text-charcoal" style={{ fontSize: 15, fontWeight: 400 }}>{res.label}</p>
                      <p className="font-body text-warm-grey" style={{ fontSize: 12, fontWeight: 300 }}>{res.desc}</p>
                    </div>
                  </div>
                  <span className="font-body text-warm-grey" style={{ fontSize: 13, paddingRight: 8 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional account CTA */}
      <section style={{ background: "#0E0E0D", padding: "80px 0" }}>
        <div className="px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>TRADE PROGRAMME</p>
            <h2 className="font-display text-warm-white mb-6" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, letterSpacing: "0.14em", lineHeight: 1.2 }}>
              Apply for an EVOKE Professional Account
            </h2>
            <p className="font-body text-warm-grey mb-10" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0 }}>
              Verified architects and designers receive access to trade pricing, priority specification support, dedicated account management, and full technical documentation.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button onClick={() => navigate("contact")}
                className="font-body uppercase transition-all duration-300"
                style={{ fontSize: 12, letterSpacing: "0.28em", background: "#F5F1EA", color: "#171717", padding: "14px 36px" }}
                onMouseEnter={e => e.currentTarget.style.background = "#D8CEC0"}
                onMouseLeave={e => e.currentTarget.style.background = "#F5F1EA"}>
                Apply Now
              </button>
              <button onClick={() => navigate("contact")}
                className="font-body uppercase transition-all duration-300"
                style={{ fontSize: 12, letterSpacing: "0.28em", border: "1px solid rgba(245,241,234,0.4)", color: "#F5F1EA", padding: "14px 36px", background: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(245,241,234,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Request Samples
              </button>
            </div>
          </div>
          <div className="relative overflow-hidden"
            style={{ aspectRatio: "4/3", background: "linear-gradient(145deg, #D8CEC0 0%, #8F8981 100%)" }}>
            <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.08 }}>
              <VMonogram size={120} color="white" />
            </div>
            <div className="absolute bottom-8 left-8 right-8">
              <p className="font-display text-warm-white" style={{ fontSize: 21, fontWeight: 300, letterSpacing: "0.14em", lineHeight: 1.4, opacity: 0.9 }}>
                "Specification-grade products with the support to match."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════
// HOSPITALITY & DEVELOPERS PAGE
// ═══════════════════════════════════════════

const HospitalityPage = ({ navigate }) => {
  const capabilities = [
    "Multi-property rollouts",
    "Hotel developments",
    "Branded residences",
    "Serviced apartments",
    "Luxury villas",
    "Commercial developments",
  ];

  const support = [
    { title: "Dedicated Account Manager", desc: "A single point of contact across the entire project lifecycle." },
    { title: "Logistics Coordination", desc: "Phased delivery schedules matched to your construction programme." },
    { title: "Procurement Support", desc: "BOQ preparation, pricing, and procurement documentation." },
    { title: "Technical Compliance", desc: "Full compliance review against project specifications." },
    { title: "Custom Finish Programmes", desc: "Coordinated finishes across all product categories." },
  ];

  const stats = [
    { value: "500+", label: "Project Units Delivered" },
    { value: "50+", label: "Project Partners" },
    { value: "12+", label: "Markets Served" },
    { value: "98%", label: "On-Time Delivery Rate" },
  ];

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div className="relative flex items-center justify-center"
        style={{ height: "50vh", minHeight: 360, background: "linear-gradient(145deg, #0E0E0D 0%, #171717 40%, #8F8981 100%)" }}>
        <div className="absolute inset-0" style={{ background: "rgba(14,14,13,0.4)" }} />
        <div className="relative z-10 text-center px-6" style={{ maxWidth: 680 }}>
          <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>PROJECT SOLUTIONS</p>
          <h1 className="font-display text-warm-white" style={{ fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 300, letterSpacing: "0.17em", lineHeight: 1.15 }}>
            Project-Scale Solutions
          </h1>
          <div style={{ width: 40, height: 2, background: "#C7B9A6", margin: "20px auto" }} />
          <p className="font-body text-warm-white" style={{ fontSize: 17, fontWeight: 300, opacity: 0.75, lineHeight: 1.95 }}>
            EVOKE partners with hospitality operators, real estate developers, and project management firms to deliver complete bathroom solutions at scale.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <section style={{ background: "#171717", padding: "0" }}>
        <div className="px-8 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center py-10 px-6"
                style={{ borderRight: i < 3 ? "1px solid rgba(167,163,155,0.2)" : "none" }}>
                <p className="font-display text-warm-white" style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 300, letterSpacing: "0.10em", lineHeight: 1 }}>
                  {stat.value}
                </p>
                <p className="font-body uppercase text-warm-grey mt-3" style={{ fontSize: 11, letterSpacing: "0.22em", lineHeight: 1.5 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities + Project Support */}
      <section className="bg-warm-white py-24">
        <div className="px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Capabilities */}
          <div>
            <p className="font-body uppercase text-warm-grey mb-6" style={{ fontSize: 12, letterSpacing: "0.28em" }}>SECTORS WE SERVE</p>
            <h2 className="font-display text-charcoal mb-8" style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, letterSpacing: "0.14em", lineHeight: 1.2 }}>
              Built for Every Project Type
            </h2>
            <div className="grid grid-cols-2 gap-px" style={{ background: "#D8CEC0" }}>
              {capabilities.map((cap, i) => (
                <div key={i} className="bg-warm-white flex items-center gap-3 px-5 py-5">
                  <VMonogram size={16} color="#C7B9A6" />
                  <span className="font-body text-charcoal" style={{ fontSize: 15, fontWeight: 300 }}>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project support */}
          <div>
            <p className="font-body uppercase text-warm-grey mb-6" style={{ fontSize: 12, letterSpacing: "0.28em" }}>PROJECT SUPPORT</p>
            <h2 className="font-display text-charcoal mb-8" style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, letterSpacing: "0.14em", lineHeight: 1.2 }}>
              Complete Project Management
            </h2>
            <div>
              {support.map((item, i) => (
                <div key={i} className="py-5" style={{ borderBottom: "1px solid #D8CEC0" }}>
                  <p className="font-body text-charcoal mb-1" style={{ fontSize: 14, fontWeight: 400, letterSpacing: "0.05em" }}>{item.title}</p>
                  <p className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.85 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#D8CEC0", padding: "80px 0" }}>
        <div className="px-8 lg:px-16 text-center">
          <p className="font-body uppercase text-charcoal mb-4" style={{ fontSize: 12, letterSpacing: "0.28em", opacity: 0.6 }}>PARTNER WITH EVOKE</p>
          <h2 className="font-display text-charcoal mb-6" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, letterSpacing: "0.14em" }}>
            Let's Discuss Your Project
          </h2>
          <p className="font-body text-warm-grey mb-10 mx-auto" style={{ fontSize: 17, fontWeight: 300, maxWidth: 480, lineHeight: 1.95 }}>
            Contact our project division for pricing, logistics, and specification support at any scale.
          </p>
          <button onClick={() => navigate("contact")}
            className="font-body uppercase transition-all duration-300"
            style={{ fontSize: 12, letterSpacing: "0.28em", background: "#171717", color: "#F5F1EA", padding: "14px 40px" }}
            onMouseEnter={e => e.currentTarget.style.background = "#0E0E0D"}
            onMouseLeave={e => e.currentTarget.style.background = "#171717"}>
            Contact the Project Division →
          </button>
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════
// SHOWROOMS & DEALERS PAGE
// ═══════════════════════════════════════════

const ShowroomsPage = ({ navigate }) => {
  const showrooms = [
    {
      type: "Flagship",
      name: "EVOKE Experience Centre",
      city: "Mumbai",
      address: ["Ground Floor,", "The Capital Building,", "Bandra Kurla Complex,", "Mumbai, India"],
      tag: "Flagship Showroom",
    },
    {
      type: "Studio",
      name: "EVOKE Studio",
      city: "Bengaluru",
      address: ["Indiranagar Design District,", "Bengaluru, India"],
      tag: "Partner Showroom",
    },
    {
      type: "Studio",
      name: "EVOKE Studio",
      city: "Hyderabad",
      address: ["Jubilee Hills Road No. 36,", "Hyderabad, India"],
      tag: "Partner Showroom",
    },
  ];

  const dealerBenefits = [
    "Dealer pricing",
    "Marketing support",
    "Product training",
    "Lead referrals",
    "Regional sales support",
  ];

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div className="relative flex items-center justify-center"
        style={{ height: "40vh", minHeight: 320, background: "linear-gradient(145deg, #D8CEC0 0%, #8F8981 60%, #171717 100%)" }}>
        <div className="absolute inset-0" style={{ background: "rgba(14,14,13,0.4)" }} />
        <div className="relative z-10 text-center">
          <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>FIND EVOKE</p>
          <h1 className="font-display text-warm-white" style={{ fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 300, letterSpacing: "0.17em" }}>Showrooms & Dealers</h1>
          <div style={{ width: 40, height: 2, background: "#C7B9A6", margin: "16px auto 0" }} />
        </div>
      </div>

      {/* Showroom cards */}
      <section className="bg-warm-white py-20">
        <div className="px-8 lg:px-16">
          <SectionHeader eyebrow="OUR LOCATIONS" heading="Experience EVOKE in Person" subheading="Visit a showroom to explore our complete collection, handle finishes, and speak with a specification consultant." />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {showrooms.map((s, i) => (
              <div key={i} style={{ border: "1px solid #D8CEC0", background: "#F5F1EA" }}>
                {/* Showroom visual */}
                <div className="relative overflow-hidden"
                  style={{ aspectRatio: "4/3", background: `linear-gradient(${135 + i * 25}deg, #D8CEC0 0%, #C7B9A6 50%, #8F8981 100%)` }}>
                  <div className="absolute top-4 left-4">
                    <span className="font-body uppercase" style={{ fontSize: 10, letterSpacing: "0.28em", background: "#F5F1EA", color: "#171717", padding: "3px 10px" }}>
                      {s.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4" style={{ opacity: 0.15 }}>
                    <VMonogram size={32} color="white" />
                  </div>
                </div>

                {/* Showroom details */}
                <div className="p-6">
                  <p className="font-body uppercase text-warm-grey mb-2" style={{ fontSize: 11, letterSpacing: "0.28em" }}>{s.city}</p>
                  <h3 className="font-display text-charcoal mb-4" style={{ fontSize: 26, fontWeight: 400, letterSpacing: "0.14em" }}>{s.name}</h3>
                  <div style={{ width: 24, height: 1, background: "#C7B9A6", marginBottom: 16 }} />
                  <address className="font-body not-italic text-warm-grey" style={{ fontSize: 15, fontWeight: 300, lineHeight: 2.0 }}>
                    {s.address.map((line, j) => (
                      <span key={j}>{line}<br /></span>
                    ))}
                  </address>
                  <button onClick={() => navigate("contact")}
                    className="font-body uppercase mt-6 transition-colors duration-200"
                    style={{ fontSize: 12, letterSpacing: "0.22em", color: "#8F8981", textDecoration: "underline", textUnderlineOffset: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = "#171717"}
                    onMouseLeave={e => e.currentTarget.style.color = "#8F8981"}>
                    Book an Appointment →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Become a Dealer */}
          <div style={{ background: "#0E0E0D", padding: "64px 0" }}>
            <div className="px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>DEALER NETWORK</p>
                <h2 className="font-display text-warm-white mb-6" style={{ fontSize: "clamp(30px, 3.5vw, 46px)", fontWeight: 400, letterSpacing: "0.14em", lineHeight: 1.2 }}>
                  Become an EVOKE Partner
                </h2>
                <p className="font-body text-warm-grey mb-8" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0 }}>
                  Join our growing network of authorised dealers and showroom partners across India and internationally.
                </p>
                <button onClick={() => navigate("contact")}
                  className="font-body uppercase transition-all duration-300"
                  style={{ fontSize: 12, letterSpacing: "0.28em", background: "#F5F1EA", color: "#171717", padding: "14px 36px" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#D8CEC0"}
                  onMouseLeave={e => e.currentTarget.style.background = "#F5F1EA"}>
                  Apply to Become a Dealer
                </button>
              </div>
              <div>
                <p className="font-body uppercase text-warm-grey mb-6" style={{ fontSize: 11, letterSpacing: "0.28em" }}>DEALER BENEFITS</p>
                {dealerBenefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid rgba(167,163,155,0.2)" }}>
                    <VMonogram size={14} color="#C7B9A6" />
                    <span className="font-body text-warm-white" style={{ fontSize: 15, fontWeight: 300 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════
// ABOUT PAGE
// ═══════════════════════════════════════════

const AboutPage = ({ navigate }) => {
  const values = [
    { number: "01", title: "Thoughtful Design", desc: "Every product begins with purpose." },
    { number: "02", title: "Precision Craftsmanship", desc: "Built to perform beautifully over time." },
    { number: "03", title: "Timeless Materials", desc: "Authentic finishes that age gracefully." },
    { number: "04", title: "Human Experience", desc: "Design that enhances daily rituals." },
  ];

  const timeline = [
    { year: "2016", event: "Brand Founded" },
    { year: "2018", event: "First Flagship Collection Launch" },
    { year: "2020", event: "Expansion into Hospitality Projects" },
    { year: "2023", event: "National Dealer Network Established" },
    { year: "2026", event: "EVOKE Project Division Launch" },
  ];

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div className="relative flex items-center justify-center"
        style={{ height: "60vh", minHeight: 400, background: "linear-gradient(145deg, #D8CEC0 0%, #8F8981 50%, #171717 100%)" }}>
        <div className="absolute inset-0" style={{ background: "rgba(14,14,13,0.5)" }} />
        <div className="relative z-10 text-center px-6" style={{ maxWidth: 720 }}>
          <VMark size={56} className="mx-auto mb-8 text-warm-white" />
          <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>THE BRAND</p>
          <h1 className="font-display text-warm-white" style={{ fontSize: "clamp(34px, 5vw, 64px)", fontWeight: 300, letterSpacing: "0.17em", lineHeight: 1.15 }}>
            Designing Spaces That Inspire Presence
          </h1>
          <div style={{ width: 40, height: 2, background: "#C7B9A6", margin: "24px auto 0" }} />
        </div>
      </div>

      {/* Brand story */}
      <section className="bg-warm-white py-24">
        <div className="px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="font-body uppercase text-warm-grey mb-6" style={{ fontSize: 12, letterSpacing: "0.28em" }}>OUR STORY</p>
            <h2 className="font-display text-charcoal mb-8" style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, letterSpacing: "0.14em", lineHeight: 1.25 }}>
              Founded on a Vision to Elevate Everyday Rituals
            </h2>
            <p className="font-body text-warm-grey mb-6" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0 }}>
              EVOKE creates bathroom environments that combine architectural precision, sensory comfort, and enduring quality.
            </p>
            <p className="font-body text-warm-grey mb-6" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0 }}>
              Inspired by European design principles and crafted for contemporary living, our collections balance innovation with timeless aesthetics. Every detail is considered — from material selection and engineering to the way light interacts with a space.
            </p>
            <p className="font-body text-warm-grey" style={{ fontSize: 17, fontWeight: 300, lineHeight: 2.0 }}>
              Today, EVOKE partners with homeowners, architects, hospitality operators, and developers to deliver complete bathroom solutions across residential, commercial, and hospitality projects.
            </p>
          </div>

          {/* Visual panel */}
          <div className="relative overflow-hidden"
            style={{ aspectRatio: "3/4", background: "linear-gradient(145deg, #D8CEC0 0%, #C7B9A6 40%, #8F8981 100%)" }}>
            <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.07 }}>
              <VMonogram size={160} color="white" />
            </div>
            <div className="absolute bottom-10 left-10 right-10">
              <div style={{ width: 32, height: 2, background: "#C7B9A6", marginBottom: 16 }} />
              <p className="font-display text-warm-white" style={{ fontSize: 21, fontWeight: 300, letterSpacing: "0.1em", lineHeight: 1.5, opacity: 0.9 }}>
                "Inspired by European design principles. Crafted for contemporary living."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core values */}
      <section style={{ background: "#0E0E0D", padding: "80px 0" }}>
        <div className="px-8 lg:px-16">
          <SectionHeader dark eyebrow="WHAT WE STAND FOR" heading="Core Values" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(167,163,155,0.2)" }}>
            {values.map((v) => (
              <div key={v.number} className="flex flex-col px-8 py-10" style={{ background: "#0E0E0D" }}>
                <span className="font-display text-warm-grey mb-6" style={{ fontSize: 36, fontWeight: 300, letterSpacing: "0.1em", lineHeight: 1, opacity: 0.4 }}>
                  {v.number}
                </span>
                <div style={{ width: 24, height: 1, background: "#C7B9A6", marginBottom: 20 }} />
                <p className="font-display text-warm-white mb-3" style={{ fontSize: 21, fontWeight: 400, letterSpacing: "0.1em" }}>{v.title}</p>
                <p className="font-body text-warm-grey" style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.85 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-warm-white py-24">
        <div className="px-8 lg:px-16">
          <SectionHeader eyebrow="OUR JOURNEY" heading="Milestones" />
          <div className="relative mx-auto" style={{ maxWidth: 720 }}>
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0" style={{ width: 1, background: "#D8CEC0", transform: "translateX(-50%)" }} />

            {timeline.map((item, i) => (
              <div key={i} className={`relative flex items-center gap-8 mb-12 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                {/* Content */}
                <div className="flex-1">
                  <div className={`${i % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                    <p className="font-display text-charcoal" style={{ fontSize: 34, fontWeight: 300, letterSpacing: "0.17em" }}>{item.year}</p>
                    <p className="font-body text-warm-grey mt-1" style={{ fontSize: 15, fontWeight: 300 }}>{item.event}</p>
                  </div>
                </div>

                {/* Dot */}
                <div className="absolute left-1/2 z-10" style={{ transform: "translateX(-50%)" }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#C7B9A6", border: "2px solid #F5F1EA", outline: "1px solid #D8CEC0" }} />
                </div>

                {/* Empty side */}
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: "#D8CEC0", padding: "72px 0" }}>
        <div className="px-8 lg:px-16 text-center">
          <h2 className="font-display text-charcoal mb-6" style={{ fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 400, letterSpacing: "0.14em" }}>
            Ready to Work Together?
          </h2>
          <p className="font-body text-warm-grey mb-10 mx-auto" style={{ fontSize: 17, fontWeight: 300, maxWidth: 440, lineHeight: 1.95 }}>
            Whether you're specifying a single bathroom or an entire development, we'd love to hear about your project.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => navigate("contact")}
              className="font-body uppercase transition-all duration-300"
              style={{ fontSize: 12, letterSpacing: "0.28em", background: "#171717", color: "#F5F1EA", padding: "14px 36px" }}
              onMouseEnter={e => e.currentTarget.style.background = "#0E0E0D"}
              onMouseLeave={e => e.currentTarget.style.background = "#171717"}>
              Get in Touch
            </button>
            <button onClick={() => navigate("category", { categoryId: "bath-fittings" })}
              className="font-body uppercase transition-all duration-300"
              style={{ fontSize: 12, letterSpacing: "0.28em", border: "1px solid #171717", color: "#171717", padding: "14px 36px", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#171717"; e.currentTarget.style.color = "#F5F1EA"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#171717"; }}>
              Explore Products
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const StubPage = ({ title, eyebrow, navigate }) => (
  <div style={{ paddingTop: 80 }}>
    <div className="relative flex items-center justify-center" style={{ height: "40vh", background: "linear-gradient(145deg, #D8CEC0, #8F8981)" }}>
      <div className="absolute inset-0" style={{ background: "rgba(14,14,13,0.45)" }} />
      <div className="relative z-10 text-center">
        {eyebrow && <p className="font-body uppercase text-warm-grey mb-4" style={{ fontSize: 12, letterSpacing: "0.28em" }}>{eyebrow}</p>}
        <h1 className="font-display text-warm-white" style={{ fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 300, letterSpacing: "0.17em" }}>{title}</h1>
        <div style={{ width: 40, height: 2, background: "#C7B9A6", margin: "16px auto 0" }} />
      </div>
    </div>
    <section className="bg-warm-white py-24">
      <div className="px-8 lg:px-16 text-center">
        <VMark size={48} className="mx-auto mb-8 text-charcoal" />
        <p className="font-body text-warm-grey" style={{ fontSize: 17, fontWeight: 300 }}>This section is in development.</p>
        <button onClick={() => navigate("contact")}
          className="font-body uppercase mt-8 inline-block transition-all duration-300"
          style={{ fontSize: 12, letterSpacing: "0.28em", background: "#171717", color: "#F5F1EA", padding: "14px 36px" }}>
          Contact Us
        </button>
      </div>
    </section>
  </div>
);

// ═══════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) { setError(true); return; }
    setLoading(true);
    setTimeout(() => {
      const allowed = ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
      if (allowed) {
        localStorage.setItem("vorhaus_admin_auth", "true");
        localStorage.setItem("vorhaus_admin_email", email.trim().toLowerCase());
        onLogin(true);
      } else {
        setError(true);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F8F8" }}>
      <div style={{ background: "white", border: "1px solid #E2E2E2", padding: 48, width: "100%", maxWidth: 380 }}>
        <div className="flex flex-col items-center mb-10">
          <VMonogram size={32} color="#171717" />
          <Wordmark style={{ fontSize: 18, color: "#171717", display: "block", marginTop: 12 }} />
          <p className="font-body uppercase" style={{ fontSize: 11, color: "#6B6B6B", letterSpacing: "0.25em", marginTop: 4 }}>
            Admin Access
          </p>
        </div>

        <div className="mb-4">
          <label className="font-body uppercase block mb-1" style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6B6B6B" }}>EMAIL ADDRESS</label>
          <input
            type="email" value={email}
            onChange={e => { setEmail(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="admin@evoke.in"
            className="w-full font-body"
            style={{ border: `1px solid ${error ? "#DC2626" : "#E2E2E2"}`, padding: "10px 12px", fontSize: 14, color: "#1A1A1A", outline: "none", background: "white" }}
            onFocus={e => e.target.style.borderColor = "#171717"}
            onBlur={e => e.target.style.borderColor = error ? "#DC2626" : "#E2E2E2"}
          />
        </div>
        <div className="mb-2">
          <label className="font-body uppercase block mb-1" style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6B6B6B" }}>PASSWORD</label>
          <input
            type="password" value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            className="w-full font-body"
            style={{ border: `1px solid ${error ? "#DC2626" : "#E2E2E2"}`, padding: "10px 12px", fontSize: 14, color: "#1A1A1A", outline: "none", background: "white" }}
            onFocus={e => e.target.style.borderColor = "#171717"}
            onBlur={e => e.target.style.borderColor = error ? "#DC2626" : "#E2E2E2"}
          />
        </div>
        {error && (
          <p className="font-body" style={{ fontSize: 12, color: "#DC2626", marginTop: 8, fontWeight: 300 }}>
            Access denied. This email is not authorised.
          </p>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full font-body uppercase transition-all duration-300 mt-6"
          style={{ fontSize: 11, letterSpacing: "0.25em", fontWeight: 400, background: loading ? "#8F8981" : "#171717", color: "#F5F1EA", padding: "14px", cursor: loading ? "wait" : "pointer" }}
        >{loading ? "Verifying..." : "Sign In"}</button>
        <p className="font-body text-center mt-6" style={{ fontSize: 11, color: "#6B6B6B", fontWeight: 300 }}>
          Protected access. Authorised personnel only.
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// ADMIN LAYOUT & SIDEBAR
// ═══════════════════════════════════════════

const AdminLayout = ({ children, currentPage, navigate, onLogout, adminEmail }) => {
  const navItems = [
    { group: "CATALOGUE", items: [
      { label: "Dashboard", page: "admin", icon: "⊞" },
      { label: "All Products", page: "admin-products", icon: "☰" },
      { label: "Add New Product", page: "admin-add-product", icon: "+" },
      { label: "Categories", page: "admin-categories", icon: "◫" },
      { label: "Collections", page: "admin-collections", icon: "◈" },
    ]},
    { group: "SETTINGS", items: [
      { label: "Finishes", page: "admin-finishes", icon: "◉" },
    ]},
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#F8F8F8" }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen flex flex-col" style={{ width: 240, background: "#0E0E0D", zIndex: 40 }}>
        <div className="p-6" style={{ borderBottom: "1px solid rgba(167,163,155,0.2)" }}>
          <div className="flex items-center gap-3 mb-1">
            <VMonogram size={20} color="#F5F1EA" />
            <Wordmark style={{ color: "#F5F1EA", fontSize: 15 }} />
          </div>
          <p className="font-body uppercase" style={{ fontSize: 10, color: "#8F8981", letterSpacing: "0.25em" }}>Admin Panel</p>
          <p className="font-body mt-3" style={{ fontSize: 11, color: "#8F8981", fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {adminEmail}
          </p>
        </div>

        {/* Prototype disclaimer */}
        <div className="px-4 py-3" style={{ background: "rgba(199,185,166,0.1)", borderBottom: "1px solid rgba(167,163,155,0.15)" }}>
          <p className="font-body" style={{ fontSize: 10, color: "#8F8981", lineHeight: 1.5, fontWeight: 300 }}>
            Prototype mode — data resets on refresh.
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map(group => (
            <div key={group.group}>
              <p className="font-body uppercase px-4 pt-5 pb-2" style={{ fontSize: 9, color: "#8F8981", letterSpacing: "0.25em", opacity: 0.5 }}>
                {group.group}
              </p>
              {group.items.map(item => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200"
                  style={{
                    background: currentPage === item.page ? "#C7B9A6" : "transparent",
                    color: currentPage === item.page ? "#0E0E0D" : "#8F8981",
                    borderLeft: currentPage === item.page ? "2px solid #C7B9A6" : "2px solid transparent",
                  }}
                  onMouseEnter={e => { if (currentPage !== item.page) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#F5F1EA"; } }}
                  onMouseLeave={e => { if (currentPage !== item.page) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F8981"; } }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span className="font-body" style={{ fontSize: 13, fontWeight: 400 }}>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid rgba(167,163,155,0.2)" }}>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors"
            style={{ color: "#8F8981" }}
            onMouseEnter={e => e.currentTarget.style.color = "#F5F1EA"}
            onMouseLeave={e => e.currentTarget.style.color = "#8F8981"}>
            <span style={{ fontSize: 14 }}>↩</span>
            <span className="font-body" style={{ fontSize: 13, fontWeight: 400 }}>Logout</span>
          </button>
          <button onClick={() => navigate("home")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
            style={{ color: "#8F8981" }}
            onMouseEnter={e => e.currentTarget.style.color = "#F5F1EA"}
            onMouseLeave={e => e.currentTarget.style.color = "#8F8981"}>
            <span style={{ fontSize: 12 }}>←</span>
            <span className="font-body" style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.1em" }}>Back to Site</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1" style={{ marginLeft: 240, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
};

// ═══════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════

const AdminDashboard = ({ navigate, products, categories }) => {
  const published = products.filter(p => p.published).length;
  const inStock = products.filter(p => p.stockStatus === "in-stock").length;
  const drafts = products.filter(p => !p.published).length;

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-body" style={{ fontSize: 22, fontWeight: 500, color: "#1A1A1A" }}>Dashboard</h1>
          <p className="font-body mt-1" style={{ fontSize: 13, color: "#6B6B6B", fontWeight: 300 }}>EVOKE Product Management</p>
        </div>
        <button onClick={() => navigate("admin-add-product")}
          className="font-body uppercase transition-colors duration-200"
          style={{ fontSize: 11, letterSpacing: "0.2em", background: "#171717", color: "white", padding: "10px 20px" }}
          onMouseEnter={e => e.currentTarget.style.background = "#0E0E0D"}
          onMouseLeave={e => e.currentTarget.style.background = "#171717"}>
          + Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Products", value: products.length },
          { label: "Published", value: published },
          { label: "In Stock", value: inStock },
          { label: "Drafts", value: drafts },
        ].map(stat => (
          <div key={stat.label} style={{ background: "white", border: "1px solid #E2E2E2", padding: 20 }}>
            <p className="font-body uppercase" style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6B6B6B" }}>{stat.label}</p>
            <p className="font-body mt-2" style={{ fontSize: 36, fontWeight: 300, color: "#1A1A1A" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Products table */}
      <div style={{ background: "white", border: "1px solid #E2E2E2" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E2E2E2" }}>
          <h2 className="font-body" style={{ fontSize: 15, fontWeight: 500, color: "#1A1A1A" }}>All Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: "#F8F8F8", borderBottom: "1px solid #E2E2E2" }}>
              <tr>
                {["", "Code", "Name", "Category", "Collection", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} className="font-body text-left py-3 px-4 uppercase"
                    style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6B6B6B", fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <AdminProductRow key={p.id} product={p} navigate={navigate} categories={categories} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminProductRow = ({ product, navigate, categories, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cat = categories.find(c => c.id === product.categoryId);

  return (
    <tr style={{ borderBottom: "1px solid #E2E2E2" }}
      onMouseEnter={e => e.currentTarget.style.background = "#F8F8F8"}
      onMouseLeave={e => e.currentTarget.style.background = "white"}>
      <td className="py-3 px-4">
        <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #D8CEC0, #C7B9A6)", flexShrink: 0, overflow: "hidden", borderRadius: 3, position: "relative" }}>
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          )}
        </div>
      </td>
      <td className="py-3 px-4 font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>{product.id}</td>
      <td className="py-3 px-4 font-body" style={{ fontSize: 13, color: "#1A1A1A", fontWeight: 500 }}>{product.name}</td>
      <td className="py-3 px-4 font-body" style={{ fontSize: 12, color: "#6B6B6B", fontWeight: 300 }}>{cat?.name}</td>
      <td className="py-3 px-4">
        <span className="font-body uppercase" style={{ fontSize: 10, letterSpacing: "0.15em", background: "#C7B9A6", color: "#171717", padding: "2px 8px" }}>
          {product.collectionId}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="font-body flex items-center gap-2" style={{ fontSize: 12, color: product.stockStatus === "in-stock" ? "#16A34A" : product.stockStatus === "out-of-stock" ? "#DC2626" : "#D97706" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
          {product.stockStatus === "in-stock" ? "In Stock" : product.stockStatus === "out-of-stock" ? "Out of Stock" : "Made to Order"}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="font-body flex items-center gap-2" style={{ fontSize: 12, color: product.published ? "#16A34A" : "#6B6B6B" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
          {product.published ? "Published" : "Draft"}
        </span>
      </td>
      <td className="py-3 px-4">
        {confirmDelete ? (
          <span className="flex items-center gap-2">
            <button onClick={() => onDelete?.(product.id)}
              className="font-body" style={{ fontSize: 11, color: "#DC2626", fontWeight: 400 }}>Confirm</button>
            <span style={{ color: "#E2E2E2" }}>|</span>
            <button onClick={() => setConfirmDelete(false)}
              className="font-body" style={{ fontSize: 11, color: "#6B6B6B" }}>Cancel</button>
          </span>
        ) : (
          <span className="flex items-center gap-3">
            <button onClick={() => navigate("admin-edit-product", { productId: product.id })}
              className="font-body" style={{ fontSize: 12, color: "#171717", fontWeight: 400 }}>Edit</button>
            <button onClick={() => setConfirmDelete(true)}
              className="font-body" style={{ fontSize: 12, color: "#DC2626" }}>Delete</button>
          </span>
        )}
      </td>
    </tr>
  );
};

// ── AdminProductForm helpers (module level — prevents focus-loss remounting) ──
const adminInputStyle = (err) => ({
  border: `1px solid ${err ? "#DC2626" : "#E2E2E2"}`, padding: "10px 12px",
  fontSize: 14, color: "#1A1A1A", outline: "none", background: "white", width: "100%"
});

const adminLabelStyle = {
  fontSize: 10, letterSpacing: "0.2em", color: "#6B6B6B",
  display: "block", marginBottom: 4, textTransform: "uppercase",
  fontFamily: "DM Sans, system-ui, sans-serif",
};

const AdminToggle = ({ label, checked, onChange, helper }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="font-body" style={{ fontSize: 13, color: "#1A1A1A", fontWeight: 400 }}>{label}</p>
      {helper && <p className="font-body" style={{ fontSize: 11, color: "#6B6B6B", fontWeight: 300 }}>{helper}</p>}
    </div>
    <div onClick={() => onChange(!checked)}
      className="relative cursor-pointer"
      style={{ width: 40, height: 22, background: checked ? "#C7B9A6" : "#E2E2E2", transition: "background 200ms" }}>
      <div style={{ position: "absolute", top: 3, left: checked ? 19 : 3, width: 16, height: 16, background: "white", transition: "left 200ms" }} />
    </div>
  </div>
);

const AdminCardSection = ({ title, children }) => (
  <div style={{ background: "white", border: "1px solid #E2E2E2", padding: 24, marginBottom: 20 }}>
    <h3 className="font-body" style={{ fontSize: 14, fontWeight: 500, color: "#1A1A1A", borderBottom: "1px solid #E2E2E2", paddingBottom: 12, marginBottom: 20 }}>{title}</h3>
    {children}
  </div>
);

const mmToIn = v => v ? (parseFloat(v) / 25.4).toFixed(1) : "—";
const kgToLb = v => v ? (parseFloat(v) * 2.205).toFixed(2) : "—";

// ═══════════════════════════════════════════
// ADMIN PRODUCT FORM
// ═══════════════════════════════════════════

const AdminProductForm = ({ navigate, params, products, categories, collections, finishes, onSave, onDelete }) => {
  const isEdit = !!params?.productId;
  const existing = isEdit ? products.find(p => p.id === params.productId) : null;

  const emptyForm = {
    name: "", id: "", sku: "", description: "", fullDescription: "",
    categoryId: "", subcategoryId: "", collectionId: "", published: false, featured: false,
    stockStatus: "in-stock", projectAvailability: true, retailAvailability: true,
    finishes: [], material: "", additionalMaterial: "",
    features: [""], specifications: [{ key: "", value: "" }],
    dimensions: { height: "", width: "", depth: "", spoutReach: "", spoutHeight: "", weight: "" },
    tradePrice: "", mrp: "", pricingMode: "on-request", pricingNote: "",
    tags: [], images: [], cadFile: null, bimFile: null, techDataSheet: null,
    installationManual: null, dimensionDiagram: null, relatedProducts: [],
    metaTitle: "", metaDescription: "",
  };

  const [form, setForm] = useState(existing ? { ...emptyForm, ...existing } : emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [relatedSearch, setRelatedSearch] = useState("");
  const [showSeo, setShowSeo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (key, value) => setForm(p => ({ ...p, [key]: value }));
  const setDim = (key, value) => setForm(p => ({ ...p, dimensions: { ...p.dimensions, [key]: value } }));

  // Auto-generate product code
  const catMap = { "bath-fittings": "BF", "shower-systems": "SS", "wash-basins": "WB", "luxury-vanities": "LV", "mirrors": "MI", "sanitaryware-accessories": "SA" };
  const suggestCode = () => {
    if (!form.categoryId) return "";
    const cat = catMap[form.categoryId] || "XX";
    const n = products.filter(p => p.categoryId === form.categoryId).length + 1;
    return `VH-${cat}-${String(n).padStart(3, "0")}`;
  };

  const subcats = categories.find(c => c.id === form.categoryId)?.subcategories || [];

  const validate = (publish = false) => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (publish) {
      if (!form.categoryId) errs.categoryId = "Category is required";
      if (!form.subcategoryId) errs.subcategoryId = "Subcategory is required";
      if (form.finishes.length === 0) errs.finishes = "Select at least one finish";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (publish = false) => {
    if (!validate(publish)) return;
    setSaving(true);
    try {
      const data = { ...form, published: publish ? true : form.published };
      await onSave(data, isEdit ? params.productId : null);
      navigate("admin-products");
    } catch (err) {
      console.error("[handleSave] onSave threw:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (field, file, isImage = false) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (isImage) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
        const imgs = [...form.images];
        imgs.push(e.target.result);
        set("images", imgs);
      } else {
        set(field, { name: file.name, size: file.size, type: file.type, dataUrl: e.target.result });
      }
    };
    reader.readAsDataURL(file);
  };


  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-body" style={{ fontSize: 22, fontWeight: 500, color: "#1A1A1A" }}>
            {isEdit ? `Edit — ${form.name || "Untitled Product"}` : "Add New Product"}
          </h1>
          {isEdit && <p className="font-body mt-1" style={{ fontSize: 13, color: "#6B6B6B", fontWeight: 300 }}>{form.id}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleSave(false)} disabled={saving}
            className="font-body uppercase transition-colors"
            style={{ fontSize: 11, letterSpacing: "0.2em", border: "1px solid #171717", color: "#171717", padding: "10px 20px", background: "transparent", opacity: saving ? 0.5 : 1, cursor: saving ? "wait" : "pointer" }}>
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="font-body uppercase transition-colors"
            style={{ fontSize: 11, letterSpacing: "0.2em", background: "#171717", color: "white", padding: "10px 20px", opacity: saving ? 0.5 : 1, cursor: saving ? "wait" : "pointer" }}>
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 320px" }}>
        {/* Main form */}
        <div>
          <AdminCardSection title="Basic Information">
            <div className="mb-4">
              <label style={adminLabelStyle}>Product Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="e.g. Elara Wall-Mounted Basin Mixer"
                style={adminInputStyle(errors.name)}
                onFocus={e => e.target.style.borderColor = "#171717"}
                onBlur={e => e.target.style.borderColor = errors.name ? "#DC2626" : "#E2E2E2"} />
              {errors.name && <p style={{ fontSize: 11, color: "#DC2626", marginTop: 4 }}>{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label style={adminLabelStyle}>Product Code</label>
                <input value={form.id} onChange={e => set("id", e.target.value)}
                  placeholder="e.g. VH-BF-001" style={adminInputStyle(false)}
                  onFocus={e => e.target.style.borderColor = "#171717"}
                  onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
                {suggestCode() && !form.id && (
                  <p style={{ fontSize: 11, color: "#6B6B6B", marginTop: 4 }}>
                    Suggested: {suggestCode()}{" "}
                    <button onClick={() => set("id", suggestCode())} style={{ color: "#C7B9A6", fontWeight: 400 }}>[Use this]</button>
                  </p>
                )}
              </div>
              <div>
                <label style={adminLabelStyle}>SKU</label>
                <input value={form.sku} onChange={e => set("sku", e.target.value)}
                  placeholder="e.g. VH-BF-001-CHR" style={adminInputStyle(false)}
                  onFocus={e => e.target.style.borderColor = "#171717"}
                  onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
              </div>
            </div>
            <div className="mb-4">
              <label style={adminLabelStyle}>Short Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="2–3 sentences for product cards..." rows={3}
                style={{ ...adminInputStyle(false), resize: "none" }} />
              <p style={{ fontSize: 11, color: "#6B6B6B", marginTop: 4 }}>{form.description.length}/200</p>
            </div>
            <div>
              <label style={adminLabelStyle}>Full Description</label>
              <textarea value={form.fullDescription} onChange={e => set("fullDescription", e.target.value)}
                placeholder="Full specification description..." rows={5}
                style={{ ...adminInputStyle(false), resize: "none" }} />
            </div>
          </AdminCardSection>

          <AdminCardSection title="Classification">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label style={adminLabelStyle}>Category *</label>
                <select value={form.categoryId}
                  onChange={e => { set("categoryId", e.target.value); set("subcategoryId", ""); }}
                  style={adminInputStyle(errors.categoryId)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p style={{ fontSize: 11, color: "#DC2626", marginTop: 4 }}>{errors.categoryId}</p>}
              </div>
              <div>
                <label style={adminLabelStyle}>Subcategory *</label>
                <select value={form.subcategoryId} onChange={e => set("subcategoryId", e.target.value)}
                  style={{ ...adminInputStyle(errors.subcategoryId), opacity: !form.categoryId ? 0.5 : 1 }}
                  disabled={!form.categoryId}>
                  <option value="">Select subcategory</option>
                  {subcats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.subcategoryId && <p style={{ fontSize: 11, color: "#DC2626", marginTop: 4 }}>{errors.subcategoryId}</p>}
              </div>
              <div>
                <label style={adminLabelStyle}>Collection</label>
                <select value={form.collectionId} onChange={e => set("collectionId", e.target.value)} style={adminInputStyle(false)}>
                  <option value="">None</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={adminLabelStyle}>Stock Status</label>
                <select value={form.stockStatus} onChange={e => set("stockStatus", e.target.value)} style={adminInputStyle(false)}>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="made-to-order">Made to Order</option>
                </select>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #E2E2E2", paddingTop: 16 }}>
              <AdminToggle label="Project Availability" checked={form.projectAvailability}
                onChange={v => set("projectAvailability", v)} helper="Available for project specification" />
              <AdminToggle label="Retail Availability" checked={form.retailAvailability}
                onChange={v => set("retailAvailability", v)} helper="Available for retail purchase" />
            </div>
          </AdminCardSection>

          <AdminCardSection title="Finishes & Materials">
            <div className="mb-5">
              <label style={adminLabelStyle}>Available Finishes *</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {finishes.map(f => (
                  <label key={f.id} className="flex items-center gap-3 cursor-pointer py-1">
                    <div onClick={() => {
                      const cur = form.finishes;
                      set("finishes", cur.includes(f.id) ? cur.filter(x => x !== f.id) : [...cur, f.id]);
                    }}
                      className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 16, height: 16, border: `1px solid ${form.finishes.includes(f.id) ? "#171717" : "#E2E2E2"}`, background: form.finishes.includes(f.id) ? "#171717" : "transparent" }}>
                      {form.finishes.includes(f.id) && <span style={{ color: "white", fontSize: 10 }}>✓</span>}
                    </div>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: f.hex, border: "1px solid #E2E2E2", flexShrink: 0 }} />
                    <span className="font-body" style={{ fontSize: 13, color: "#1A1A1A", fontWeight: 300 }}>{f.label}</span>
                  </label>
                ))}
              </div>
              {errors.finishes && <p style={{ fontSize: 11, color: "#DC2626", marginTop: 4 }}>{errors.finishes}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={adminLabelStyle}>Primary Material</label>
                <input value={form.material} onChange={e => set("material", e.target.value)}
                  placeholder="e.g. Solid brass body" style={adminInputStyle(false)}
                  onFocus={e => e.target.style.borderColor = "#171717"}
                  onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
              </div>
              <div>
                <label style={adminLabelStyle}>Additional Materials</label>
                <input value={form.additionalMaterial} onChange={e => set("additionalMaterial", e.target.value)}
                  placeholder="e.g. Stainless steel hose" style={adminInputStyle(false)}
                  onFocus={e => e.target.style.borderColor = "#171717"}
                  onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
              </div>
            </div>
          </AdminCardSection>

          <AdminCardSection title="Key Features">
            {form.features.map((feat, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={feat} onChange={e => {
                  const arr = [...form.features]; arr[i] = e.target.value; set("features", arr);
                }}
                  placeholder={`Feature ${i + 1}`}
                  style={{ ...adminInputStyle(false), flex: 1 }}
                  onFocus={e => e.target.style.borderColor = "#171717"}
                  onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
                <button onClick={() => set("features", form.features.filter((_, j) => j !== i))}
                  style={{ color: "#6B6B6B", fontSize: 18, padding: "0 8px", flexShrink: 0 }}>×</button>
              </div>
            ))}
            {form.features.length < 10 && (
              <button onClick={() => set("features", [...form.features, ""])}
                className="font-body mt-2" style={{ fontSize: 12, color: "#C7B9A6", fontWeight: 400 }}>
                + Add Feature
              </button>
            )}
          </AdminCardSection>

          <AdminCardSection title="Technical Specifications">
            {form.specifications.map((spec, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={spec.key} onChange={e => {
                  const arr = [...form.specifications]; arr[i] = { ...arr[i], key: e.target.value }; set("specifications", arr);
                }} placeholder="e.g. Cartridge Type"
                  style={{ ...adminInputStyle(false), width: 200, flexShrink: 0 }}
                  onFocus={e => e.target.style.borderColor = "#171717"}
                  onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
                <input value={spec.value} onChange={e => {
                  const arr = [...form.specifications]; arr[i] = { ...arr[i], value: e.target.value }; set("specifications", arr);
                }} placeholder="e.g. Ceramic disc"
                  style={{ ...adminInputStyle(false), flex: 1 }}
                  onFocus={e => e.target.style.borderColor = "#171717"}
                  onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
                <button onClick={() => set("specifications", form.specifications.filter((_, j) => j !== i))}
                  style={{ color: "#6B6B6B", fontSize: 18, padding: "0 8px", flexShrink: 0 }}>×</button>
              </div>
            ))}
            <button onClick={() => set("specifications", [...form.specifications, { key: "", value: "" }])}
              className="font-body mt-2" style={{ fontSize: 12, color: "#C7B9A6", fontWeight: 400 }}>
              + Add Specification
            </button>
          </AdminCardSection>

          <AdminCardSection title="Dimensions">
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "height", label: "Height (mm)" },
                { key: "width", label: "Width (mm)" },
                { key: "depth", label: "Depth (mm)" },
                { key: "spoutReach", label: "Spout Reach (mm)" },
                { key: "spoutHeight", label: "Spout Height (mm)" },
                { key: "weight", label: "Weight (kg)" },
              ].map(dim => (
                <div key={dim.key}>
                  <label style={adminLabelStyle}>{dim.label}</label>
                  <input type="number" min="0" step={dim.key === "weight" ? "0.1" : "1"}
                    value={form.dimensions[dim.key]}
                    onChange={e => setDim(dim.key, e.target.value)}
                    style={adminInputStyle(false)}
                    onFocus={e => e.target.style.borderColor = "#171717"}
                    onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
                  <p style={{ fontSize: 11, color: "#6B6B6B", marginTop: 3 }}>
                    = {dim.key === "weight"
                      ? (form.dimensions[dim.key] ? `${kgToLb(form.dimensions[dim.key])} lb` : "—")
                      : (form.dimensions[dim.key] ? `${mmToIn(form.dimensions[dim.key])}"` : "—")}
                  </p>
                </div>
              ))}
            </div>
          </AdminCardSection>

          <AdminCardSection title="Pricing">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label style={adminLabelStyle}>Trade / Project Price (₹ INR)</label>
                <input type="number" value={form.tradePrice} onChange={e => set("tradePrice", e.target.value)}
                  placeholder="0" style={adminInputStyle(false)}
                  onFocus={e => e.target.style.borderColor = "#171717"}
                  onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
                <p style={{ fontSize: 11, color: "#6B6B6B", marginTop: 4 }}>Internal only. Never displayed publicly.</p>
              </div>
              <div>
                <label style={adminLabelStyle}>MRP / RRP (₹ INR)</label>
                <input type="number" value={form.mrp} onChange={e => set("mrp", e.target.value)}
                  placeholder="0" style={adminInputStyle(false)}
                  onFocus={e => e.target.style.borderColor = "#171717"}
                  onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
              </div>
            </div>
            <div className="mb-4">
              <label style={adminLabelStyle}>Pricing Display Mode</label>
              <div className="flex flex-col gap-2 mt-2">
                {[
                  { value: "on-request", label: "Pricing on request", helper: "Shows: 'Pricing available on request'" },
                  { value: "show-mrp", label: "Show MRP on site", helper: form.mrp ? `Shows: ₹${Number(form.mrp).toLocaleString("en-IN")}` : "Shows: ₹[MRP]" },
                  { value: "hidden", label: "Hide pricing entirely", helper: "No price shown" },
                ].map(opt => (
                  <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
                    <div onClick={() => set("pricingMode", opt.value)}
                      style={{
                        width: 16, height: 16, borderRadius: "50%", marginTop: 2, flexShrink: 0,
                        border: `2px solid ${form.pricingMode === opt.value ? "#171717" : "#E2E2E2"}`,
                        background: form.pricingMode === opt.value ? "#171717" : "transparent"
                      }} />
                    <div onClick={() => set("pricingMode", opt.value)}>
                      <p className="font-body" style={{ fontSize: 13, color: "#1A1A1A", fontWeight: 400 }}>{opt.label}</p>
                      <p className="font-body" style={{ fontSize: 11, color: "#6B6B6B", fontWeight: 300 }}>{opt.helper}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={adminLabelStyle}>Pricing Notes (Internal)</label>
              <textarea value={form.pricingNote} onChange={e => set("pricingNote", e.target.value)}
                placeholder="Notes for project team..." rows={3}
                style={{ ...adminInputStyle(false), resize: "none" }} />
            </div>
          </AdminCardSection>
        </div>

        {/* Sidebar */}
        <div>
          {/* Images */}
          <AdminCardSection title="Product Images">
            <label style={adminLabelStyle}>Primary Image</label>
            <div
              style={{ border: "2px dashed #E2E2E2", background: "#F8F8F8", padding: 24, textAlign: "center", cursor: "pointer", marginBottom: 16 }}
              onClick={() => document.getElementById("primary-img-upload").click()}>
              {form.images[0] ? (
                <div className="relative">
                  <img src={form.images[0]} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
                  <button onClick={e => { e.stopPropagation(); set("images", form.images.slice(1)); }}
                    style={{ position: "absolute", top: 4, right: 4, background: "white", border: "1px solid #E2E2E2", padding: "2px 8px", fontSize: 12, color: "#DC2626" }}>×</button>
                </div>
              ) : (
                <>
                  <p className="font-body" style={{ fontSize: 24, color: "#6B6B6B" }}>↑</p>
                  <p className="font-body" style={{ fontSize: 12, color: "#6B6B6B", marginTop: 4, fontWeight: 300 }}>Click to upload or drag & drop</p>
                  <p className="font-body" style={{ fontSize: 11, color: "#6B6B6B", fontWeight: 300 }}>PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
            <input id="primary-img-upload" type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
              onChange={e => e.target.files[0] && handleFileUpload("images", e.target.files[0], true)} />

            <label style={{ ...adminLabelStyle, marginTop: 16 }}>Additional Images (up to 8)</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i}
                  style={{ aspectRatio: "1", border: "1px dashed #E2E2E2", background: "#F8F8F8", overflow: "hidden", cursor: "pointer", position: "relative" }}
                  onClick={() => { document.getElementById(`img-upload-${i}`).click(); }}>
                  {form.images[i] ? (
                    <>
                      <img src={form.images[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={e => { e.stopPropagation(); const arr = [...form.images]; arr.splice(i, 1); set("images", arr); }}
                        style={{ position: "absolute", top: 2, right: 2, background: "white", border: "none", fontSize: 10, color: "#DC2626", cursor: "pointer", padding: "1px 4px" }}>×</button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <span style={{ fontSize: 18, color: "#6B6B6B" }}>+</span>
                    </div>
                  )}
                  <input id={`img-upload-${i}`} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                    onChange={e => e.target.files[0] && handleFileUpload("images", e.target.files[0], true)} />
                </div>
              ))}
            </div>
          </AdminCardSection>

          {/* Technical Files */}
          <AdminCardSection title="Technical Files">
            {[
              { field: "cadFile", label: "2D CAD Drawing", accept: ".dwg,.dxf,.pdf", types: "DWG, DXF, PDF" },
              { field: "bimFile", label: "3D BIM File", accept: ".rvt,.rfa,.ifc", types: "RVT, RFA, IFC" },
              { field: "techDataSheet", label: "Technical Data Sheet", accept: ".pdf", types: "PDF" },
              { field: "installationManual", label: "Installation Manual", accept: ".pdf", types: "PDF" },
              { field: "dimensionDiagram", label: "Dimension Diagram", accept: ".png,.jpg,.svg", types: "PNG, JPG, SVG" },
            ].map(({ field, label, accept, types }) => (
              <div key={field} className="mb-5">
                <label style={adminLabelStyle}>{label}</label>
                <div
                  style={{ border: "1px dashed #E2E2E2", background: "#F8F8F8", padding: "16px 12px", cursor: "pointer" }}
                  onClick={() => document.getElementById(`file-${field}`).click()}>
                  {form[field] ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body" style={{ fontSize: 12, color: "#1A1A1A", fontWeight: 400 }}>{form[field].name}</p>
                        <p className="font-body" style={{ fontSize: 11, color: "#6B6B6B", fontWeight: 300 }}>
                          {(form[field].size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); set(field, null); }}
                        style={{ fontSize: 12, color: "#DC2626" }}>×</button>
                    </div>
                  ) : (
                    <p className="font-body text-center" style={{ fontSize: 12, color: "#6B6B6B", fontWeight: 300 }}>
                      Upload {label} — {types}
                    </p>
                  )}
                </div>
                <input id={`file-${field}`} type="file" accept={accept} className="hidden"
                  onChange={e => e.target.files[0] && handleFileUpload(field, e.target.files[0])} />
              </div>
            ))}
          </AdminCardSection>

          {/* Visibility */}
          <AdminCardSection title="Visibility">
            <AdminToggle label="Published" checked={form.published} onChange={v => set("published", v)}
              helper="Visible on public site" />
            <AdminToggle label="Featured" checked={form.featured} onChange={v => set("featured", v)}
              helper="Show in homepage featured section" />
            <div className="mt-4">
              <label style={adminLabelStyle}>Tags</label>
              <input value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    set("tags", [...form.tags, tagInput.trim()]);
                    setTagInput("");
                  }
                }}
                placeholder="Add tag and press Enter"
                style={adminInputStyle(false)}
                onFocus={e => e.target.style.borderColor = "#171717"}
                onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="font-body flex items-center gap-1"
                      style={{ fontSize: 10, background: "#C7B9A6", color: "#171717", padding: "2px 8px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      {tag}
                      <button onClick={() => set("tags", form.tags.filter((_, j) => j !== i))}
                        style={{ fontSize: 10, color: "#171717", marginLeft: 2 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4">
              <button onClick={() => setShowSeo(!showSeo)}
                className="font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>
                SEO & Metadata {showSeo ? "▲" : "▾"}
              </button>
              {showSeo && (
                <div className="mt-3">
                  <div className="mb-3">
                    <label style={adminLabelStyle}>Meta Title</label>
                    <input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)}
                      style={adminInputStyle(false)}
                      onFocus={e => e.target.style.borderColor = "#171717"}
                      onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
                  </div>
                  <div>
                    <label style={adminLabelStyle}>Meta Description</label>
                    <textarea value={form.metaDescription} onChange={e => set("metaDescription", e.target.value)}
                      rows={3} style={{ ...adminInputStyle(false), resize: "none" }} />
                  </div>
                </div>
              )}
            </div>
          </AdminCardSection>

          {/* Save panel */}
          <AdminCardSection title="Save Product">
            <button onClick={() => handleSave(false)} disabled={saving}
              className="w-full font-body uppercase mb-3 transition-colors"
              style={{ fontSize: 11, letterSpacing: "0.2em", border: "1px solid #171717", color: "#171717", padding: "12px", background: "transparent" }}>
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="w-full font-body uppercase transition-colors"
              style={{ fontSize: 11, letterSpacing: "0.2em", background: "#171717", color: "white", padding: "12px" }}>
              {saving ? "Publishing..." : "Publish"}
            </button>
            {isEdit && (
              <div className="mt-5 text-center">
                {confirmDelete ? (
                  <div>
                    <p className="font-body" style={{ fontSize: 12, color: "#DC2626", marginBottom: 8 }}>
                      Permanently delete '{form.name}'?
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button onClick={() => { onDelete(params.productId); navigate("admin-products"); }}
                        className="font-body" style={{ fontSize: 12, color: "#DC2626", fontWeight: 400 }}>Delete Permanently</button>
                      <button onClick={() => setConfirmDelete(false)}
                        className="font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)}
                    className="font-body" style={{ fontSize: 12, color: "#DC2626", textDecoration: "underline" }}>
                    Delete Product
                  </button>
                )}
              </div>
            )}
          </AdminCardSection>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// ADMIN PRODUCTS LIST
// ═══════════════════════════════════════════

const AdminProductList = ({ navigate, products, categories, onDelete, onDuplicate }) => {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && p.categoryId !== filterCat) return false;
    if (filterStatus === "published" && !p.published) return false;
    if (filterStatus === "draft" && p.published) return false;
    if (filterStock && p.stockStatus !== filterStock) return false;
    return true;
  });

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-body" style={{ fontSize: 22, fontWeight: 500, color: "#1A1A1A" }}>All Products</h1>
        <button onClick={() => navigate("admin-add-product")}
          className="font-body uppercase transition-colors"
          style={{ fontSize: 11, letterSpacing: "0.2em", background: "#171717", color: "white", padding: "10px 20px" }}>
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or code..."
          className="font-body flex-1" style={{ minWidth: 200, border: "1px solid #E2E2E2", padding: "8px 12px", fontSize: 13, outline: "none" }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="font-body" style={{ border: "1px solid #E2E2E2", padding: "8px 12px", fontSize: 13, background: "white", outline: "none" }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="font-body" style={{ border: "1px solid #E2E2E2", padding: "8px 12px", fontSize: 13, background: "white", outline: "none" }}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={filterStock} onChange={e => setFilterStock(e.target.value)}
          className="font-body" style={{ border: "1px solid #E2E2E2", padding: "8px 12px", fontSize: 13, background: "white", outline: "none" }}>
          <option value="">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
          <option value="made-to-order">Made to Order</option>
        </select>
      </div>

      <div style={{ background: "white", border: "1px solid #E2E2E2" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 800 }}>
            <thead style={{ background: "#F8F8F8", borderBottom: "1px solid #E2E2E2" }}>
              <tr>
                {["Thumb", "Code", "Name", "Category", "Collection", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} className="font-body text-left py-3 px-4 uppercase"
                    style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6B6B6B", fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 font-body" style={{ color: "#6B6B6B", fontSize: 13 }}>
                  No products found.
                </td></tr>
              ) : filtered.map(p => {
                const cat = categories.find(c => c.id === p.categoryId);
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #E2E2E2" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F8F8F8"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}>
                    <td className="py-3 px-4">
                      <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #D8CEC0, #C7B9A6)", overflow: "hidden", borderRadius: 3, position: "relative" }}>
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt={p.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>{p.id}</td>
                    <td className="py-3 px-4 font-body" style={{ fontSize: 13, color: "#1A1A1A", fontWeight: 500 }}>{p.name}</td>
                    <td className="py-3 px-4 font-body" style={{ fontSize: 12, color: "#6B6B6B", fontWeight: 300 }}>{cat?.name}</td>
                    <td className="py-3 px-4">
                      {p.collectionId && <span className="font-body uppercase" style={{ fontSize: 10, letterSpacing: "0.15em", background: "#C7B9A6", color: "#171717", padding: "2px 8px" }}>{p.collectionId}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-body flex items-center gap-1" style={{ fontSize: 12, color: p.stockStatus === "in-stock" ? "#16A34A" : p.stockStatus === "out-of-stock" ? "#DC2626" : "#D97706" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                        {p.stockStatus === "in-stock" ? "In Stock" : p.stockStatus === "out-of-stock" ? "Out of Stock" : "MTO"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-body flex items-center gap-1" style={{ fontSize: 12, color: p.published ? "#16A34A" : "#6B6B6B" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                        {p.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {deleteId === p.id ? (
                        <span className="flex items-center gap-2">
                          <button onClick={() => { onDelete(p.id); setDeleteId(null); }}
                            className="font-body" style={{ fontSize: 11, color: "#DC2626" }}>Confirm</button>
                          <span style={{ color: "#E2E2E2" }}>|</span>
                          <button onClick={() => setDeleteId(null)}
                            className="font-body" style={{ fontSize: 11, color: "#6B6B6B" }}>Cancel</button>
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <button onClick={() => navigate("admin-edit-product", { productId: p.id })}
                            className="font-body" style={{ fontSize: 12, color: "#171717" }}>Edit</button>
                          <button onClick={() => onDuplicate(p.id)}
                            className="font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>Duplicate</button>
                          <button onClick={() => setDeleteId(p.id)}
                            className="font-body" style={{ fontSize: 12, color: "#DC2626" }}>Delete</button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #E2E2E2" }}>
          <p className="font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>
            Showing {filtered.length} of {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// ADMIN CATEGORIES
// ═══════════════════════════════════════════

const AdminCategories = ({ categories, products, navigate }) => {
  const [expanded, setExpanded] = useState(null);
  const [deleteSubcat, setDeleteSubcat] = useState(null);

  return (
    <div className="px-8 py-8">
      <h1 className="font-body mb-6" style={{ fontSize: 22, fontWeight: 500, color: "#1A1A1A" }}>Categories</h1>
      <div style={{ background: "white", border: "1px solid #E2E2E2" }}>
        {categories.map((cat, i) => {
          const count = products.filter(p => p.categoryId === cat.id).length;
          const catProducts = products.filter(p => p.categoryId === cat.id);
          return (
            <div key={cat.id} style={{ borderBottom: i < categories.length - 1 ? "1px solid #E2E2E2" : "none" }}>
              {/* Category header */}
              <div className="flex items-center px-6 py-4 cursor-pointer"
                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                onMouseEnter={e => e.currentTarget.style.background = "#F8F8F8"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div className="flex-1">
                  <span className="font-body" style={{ fontSize: 14, fontWeight: 500, color: "#1A1A1A" }}>{cat.name}</span>
                  <span className="font-body ml-3" style={{ fontSize: 10, background: "#C7B9A6", color: "#171717", padding: "2px 8px", letterSpacing: "0.15em" }}>
                    {cat.subcategories.length} {cat.subcategories.length === 1 ? "subcategory" : "subcategories"} · {count} {count === 1 ? "product" : "products"}
                  </span>
                </div>
                <span style={{ color: "#6B6B6B", fontSize: 14 }}>{expanded === cat.id ? "▲" : "▼"}</span>
              </div>

              {/* Expanded: product rows */}
              {expanded === cat.id && (
                <div style={{ borderTop: "1px solid #E2E2E2" }}>
                  {/* Products in this category */}
                  {catProducts.length === 0 ? (
                    <div className="px-10 py-5" style={{ background: "#F8F8F8" }}>
                      <p className="font-body" style={{ fontSize: 13, color: "#6B6B6B", fontWeight: 300 }}>No products in this category.</p>
                    </div>
                  ) : (
                    <table className="w-full" style={{ background: "#F8F8F8" }}>
                      <thead style={{ borderBottom: "1px solid #E2E2E2" }}>
                        <tr>
                          {["", "Code", "Name", "Subcategory", "Stock", "Status", "Actions"].map(h => (
                            <th key={h} className="font-body text-left py-2 px-4 uppercase"
                              style={{ fontSize: 9, letterSpacing: "0.2em", color: "#8F8981", fontWeight: 400 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {catProducts.map(p => {
                          const sub = cat.subcategories.find(s => s.id === p.subcategoryId);
                          return (
                            <tr key={p.id} style={{ borderBottom: "1px solid #E2E2E2" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#F0EDE8"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <td className="py-2 px-4">
                                <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #D8CEC0, #C7B9A6)", overflow: "hidden", borderRadius: 2 }}>
                                  {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                                </div>
                              </td>
                              <td className="py-2 px-4 font-body" style={{ fontSize: 11, color: "#6B6B6B" }}>{p.id}</td>
                              <td className="py-2 px-4 font-body" style={{ fontSize: 13, color: "#1A1A1A", fontWeight: 400 }}>{p.name}</td>
                              <td className="py-2 px-4 font-body" style={{ fontSize: 11, color: "#6B6B6B", fontWeight: 300 }}>{sub?.name || "—"}</td>
                              <td className="py-2 px-4">
                                <span className="font-body flex items-center gap-1" style={{ fontSize: 11, color: p.stockStatus === "in-stock" ? "#16A34A" : p.stockStatus === "out-of-stock" ? "#DC2626" : "#D97706" }}>
                                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                                  {p.stockStatus === "in-stock" ? "In Stock" : p.stockStatus === "out-of-stock" ? "Out of Stock" : "MTO"}
                                </span>
                              </td>
                              <td className="py-2 px-4">
                                <span className="font-body" style={{ fontSize: 11, color: p.published ? "#16A34A" : "#6B6B6B" }}>
                                  {p.published ? "Published" : "Draft"}
                                </span>
                              </td>
                              <td className="py-2 px-4">
                                <span className="flex items-center gap-3">
                                  <button onClick={() => navigate("product-detail", { productId: p.id })}
                                    className="font-body" style={{ fontSize: 11, color: "#6B6B6B" }}>View</button>
                                  <button onClick={() => navigate("admin-edit-product", { productId: p.id })}
                                    className="font-body" style={{ fontSize: 11, color: "#171717" }}>Edit</button>
                                  <button onClick={() => onDelete?.(p.id)}
                                    className="font-body" style={{ fontSize: 11, color: "#DC2626" }}>Delete</button>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// ADMIN COLLECTIONS
// ═══════════════════════════════════════════

const AdminCollections = ({ collections, onSave, onDelete: onDeleteCollection, products, navigate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", mood: "", description: "" });
  const [deleteId, setDeleteId] = useState(null);
  const [viewId, setViewId] = useState(null);

  const startEdit = (col) => {
    setEditingId(col.id);
    setEditForm({ name: col.name, mood: col.mood, description: col.description || "" });
  };

  const saveEdit = () => {
    onSave({ ...collections.find(c => c.id === editingId), ...editForm });
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newForm.name.trim()) return;
    const id = newForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onSave({ id, ...newForm });
    setNewForm({ name: "", mood: "", description: "" });
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    onDeleteCollection(id);
    setDeleteId(null);
    if (viewId === id) setViewId(null);
  };

  const inputSt = { border: "1px solid #E2E2E2", padding: "8px 10px", fontSize: 13, outline: "none", width: "100%", fontFamily: "DM Sans, system-ui, sans-serif" };

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-body" style={{ fontSize: 22, fontWeight: 500, color: "#1A1A1A" }}>Collections</h1>
        <button onClick={() => { setShowAdd(true); setEditingId(null); }}
          className="font-body uppercase"
          style={{ fontSize: 11, letterSpacing: "0.2em", background: "#171717", color: "white", padding: "10px 20px" }}>
          + New Collection
        </button>
      </div>

      {/* Add new collection form */}
      {showAdd && (
        <div style={{ background: "white", border: "1px solid #E2E2E2", padding: 24, marginBottom: 20 }}>
          <h3 className="font-body mb-5" style={{ fontSize: 14, fontWeight: 500, color: "#1A1A1A", borderBottom: "1px solid #E2E2E2", paddingBottom: 12 }}>
            New Collection
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-body" style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6B6B6B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
                Name *
              </label>
              <input value={newForm.name} onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Roma" style={inputSt}
                onFocus={e => e.target.style.borderColor = "#171717"}
                onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
            </div>
            <div>
              <label className="font-body" style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6B6B6B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
                Mood Line
              </label>
              <input value={newForm.mood} onChange={e => setNewForm(p => ({ ...p, mood: e.target.value }))}
                placeholder="e.g. Bold geometry. Warm stone. Roman authority." style={inputSt}
                onFocus={e => e.target.style.borderColor = "#171717"}
                onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
            </div>
          </div>
          <div className="mb-5">
            <label className="font-body" style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6B6B6B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
              Description
            </label>
            <textarea value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Optional collection description..." rows={3}
              style={{ ...inputSt, resize: "none" }}
              onFocus={e => e.target.style.borderColor = "#171717"}
              onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd}
              className="font-body uppercase"
              style={{ fontSize: 11, letterSpacing: "0.2em", background: "#171717", color: "white", padding: "10px 20px" }}>
              Create Collection
            </button>
            <button onClick={() => setShowAdd(false)}
              className="font-body uppercase"
              style={{ fontSize: 11, letterSpacing: "0.2em", border: "1px solid #E2E2E2", color: "#6B6B6B", padding: "10px 20px", background: "transparent" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collection cards */}
      <div className="grid grid-cols-3 gap-4">
        {collections.map(col => {
          const colProducts = products.filter(p => p.collectionId === col.id);
          const count = colProducts.length;
          const isEditing = editingId === col.id;
          const isViewing = viewId === col.id;

          return (
            <div key={col.id} style={{ background: "white", border: "1px solid #E2E2E2" }}>
              {/* Card header */}
              <div style={{ padding: 24, borderBottom: "1px solid #E2E2E2" }}>
                {isEditing ? (
                  <div>
                    <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                      className="font-body mb-2" style={{ ...inputSt, fontSize: 15, fontWeight: 500 }}
                      onFocus={e => e.target.style.borderColor = "#171717"}
                      onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
                    <input value={editForm.mood} onChange={e => setEditForm(p => ({ ...p, mood: e.target.value }))}
                      placeholder="Mood line..." className="font-body mb-2"
                      style={{ ...inputSt, fontSize: 13 }}
                      onFocus={e => e.target.style.borderColor = "#171717"}
                      onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
                    <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Description..." rows={2}
                      style={{ ...inputSt, resize: "none", fontSize: 12 }}
                      onFocus={e => e.target.style.borderColor = "#171717"}
                      onBlur={e => e.target.style.borderColor = "#E2E2E2"} />
                  </div>
                ) : (
                  <>
                    <h3 className="font-body" style={{ fontSize: 16, fontWeight: 500, color: "#1A1A1A" }}>{col.name}</h3>
                    <p className="font-body mt-1" style={{ fontSize: 13, color: "#6B6B6B", fontWeight: 300 }}>{col.mood}</p>
                    {col.description && <p className="font-body mt-2" style={{ fontSize: 12, color: "#8F8981", fontWeight: 300 }}>{col.description}</p>}
                    <p className="font-body mt-3" style={{ fontSize: 11, color: "#6B6B6B" }}>
                      <span style={{ fontWeight: 500, color: "#1A1A1A" }}>{count}</span> {count === 1 ? "product" : "products"}
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 px-5 py-3 flex-wrap" style={{ background: "#F8F8F8" }}>
                {isEditing ? (
                  <>
                    <button onClick={saveEdit} className="font-body" style={{ fontSize: 12, color: "#171717", fontWeight: 500 }}>Save</button>
                    <button onClick={() => setEditingId(null)} className="font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setViewId(isViewing ? null : col.id)}
                      className="font-body" style={{ fontSize: 12, color: "#171717" }}>
                      {isViewing ? "Hide" : "View"} Products
                    </button>
                    <button onClick={() => startEdit(col)}
                      className="font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>Edit</button>
                    {deleteId === col.id ? (
                      <>
                        <button onClick={() => handleDelete(col.id)}
                          className="font-body" style={{ fontSize: 12, color: "#DC2626", fontWeight: 500 }}>Confirm Delete</button>
                        <button onClick={() => setDeleteId(null)}
                          className="font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteId(col.id)}
                        className="font-body" style={{ fontSize: 12, color: "#DC2626" }}>Delete</button>
                    )}
                  </>
                )}
              </div>

              {/* Product list for this collection */}
              {isViewing && !isEditing && (
                <div style={{ borderTop: "1px solid #E2E2E2" }}>
                  {colProducts.length === 0 ? (
                    <p className="font-body px-5 py-4" style={{ fontSize: 12, color: "#6B6B6B" }}>No products in this collection.</p>
                  ) : colProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3"
                      style={{ borderBottom: "1px solid #F0EDE8" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F8F8F8"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #D8CEC0, #C7B9A6)", overflow: "hidden", borderRadius: 2, flexShrink: 0 }}>
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body" style={{ fontSize: 12, fontWeight: 500, color: "#1A1A1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                        <p className="font-body" style={{ fontSize: 10, color: "#6B6B6B" }}>{p.id}</p>
                      </div>
                      <button onClick={() => navigate("admin-edit-product", { productId: p.id })}
                        className="font-body" style={{ fontSize: 11, color: "#171717", flexShrink: 0 }}>Edit</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// ADMIN FINISHES
// ═══════════════════════════════════════════

const AdminFinishes = ({ finishes, onSave: onSaveFinish, onDelete: onDelFinish, products }) => {
  const [newFinish, setNewFinish] = useState({ label: "", hex: "#C8C8C8", description: "", active: true });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const inpSt = { border: "1px solid #E2E2E2", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "DM Sans, system-ui, sans-serif" };

  return (
    <div className="px-8 py-8">
      <h1 className="font-body mb-2" style={{ fontSize: 22, fontWeight: 500, color: "#1A1A1A" }}>Finishes</h1>
      <p className="font-body mb-6" style={{ fontSize: 13, color: "#6B6B6B", fontWeight: 300 }}>Manage finish options available across all products.</p>
      <div style={{ background: "white", border: "1px solid #E2E2E2" }}>
        <table className="w-full">
          <thead style={{ background: "#F8F8F8", borderBottom: "1px solid #E2E2E2" }}>
            <tr>
              {["Swatch", "Name", "Hex", "Description", "Status", "Products", "Actions"].map(h => (
                <th key={h} className="font-body text-left py-3 px-4 uppercase"
                  style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6B6B6B", fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {finishes.map(f => {
              const count = products.filter(p => p.finishes.includes(f.id)).length;
              const isEditing = editId === f.id;
              const isDeleting = deleteId === f.id;
              const active = f.active !== false;
              return (
                <tr key={f.id} style={{ borderBottom: "1px solid #E2E2E2", opacity: active ? 1 : 0.5 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F8F8F8"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}>
                  <td className="py-3 px-4">
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: isEditing ? editData.hex : f.hex, border: "1px solid #E2E2E2" }} />
                  </td>
                  <td className="py-3 px-4 font-body" style={{ fontSize: 13, color: "#1A1A1A" }}>
                    {isEditing ? (
                      <input value={editData.label} onChange={e => setEditData(p => ({ ...p, label: e.target.value }))}
                        style={{ ...inpSt, width: 140 }} />
                    ) : <><span style={{ fontWeight: 400 }}>{f.label}</span><br /><span style={{ fontSize: 10, color: "#8F8981" }}>{f.id}</span></>}
                  </td>
                  <td className="py-3 px-4 font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input type="color" value={editData.hex} onChange={e => setEditData(p => ({ ...p, hex: e.target.value }))}
                          style={{ width: 32, height: 32, border: "none", cursor: "pointer" }} />
                        <input value={editData.hex} onChange={e => setEditData(p => ({ ...p, hex: e.target.value }))}
                          style={{ ...inpSt, width: 85 }} />
                      </div>
                    ) : f.hex}
                  </td>
                  <td className="py-3 px-4 font-body" style={{ fontSize: 12, color: "#6B6B6B", maxWidth: 200 }}>
                    {isEditing ? (
                      <input value={editData.description || ""} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
                        placeholder="Optional description" style={{ ...inpSt, width: "100%" }} />
                    ) : (f.description || <span style={{ opacity: 0.4 }}>—</span>)}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div onClick={() => setEditData(p => ({ ...p, active: !p.active }))}
                          style={{ width: 36, height: 20, background: editData.active !== false ? "#C7B9A6" : "#E2E2E2", position: "relative", cursor: "pointer", transition: "background 200ms" }}>
                          <div style={{ position: "absolute", top: 2, left: editData.active !== false ? 17 : 2, width: 16, height: 16, background: "white", transition: "left 200ms" }} />
                        </div>
                        <span className="font-body" style={{ fontSize: 11, color: "#6B6B6B" }}>{editData.active !== false ? "Active" : "Inactive"}</span>
                      </label>
                    ) : (
                      <span className="font-body flex items-center gap-1" style={{ fontSize: 11, color: active ? "#16A34A" : "#6B6B6B" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                        {active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>
                    {count} {count === 1 ? "product" : "products"}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <span className="flex gap-3">
                        <button onClick={() => { onSaveFinish({ ...f, ...editData }); setEditId(null); }}
                          className="font-body" style={{ fontSize: 12, color: "#171717", fontWeight: 500 }}>Save</button>
                        <button onClick={() => setEditId(null)}
                          className="font-body" style={{ fontSize: 12, color: "#6B6B6B" }}>Cancel</button>
                      </span>
                    ) : isDeleting ? (
                      <span className="flex gap-2">
                        <button onClick={() => { onDelFinish(f.id); setDeleteId(null); }}
                          className="font-body" style={{ fontSize: 11, color: "#DC2626", fontWeight: 500 }}>Confirm</button>
                        <span style={{ color: "#E2E2E2" }}>|</span>
                        <button onClick={() => setDeleteId(null)}
                          className="font-body" style={{ fontSize: 11, color: "#6B6B6B" }}>Cancel</button>
                      </span>
                    ) : (
                      <span className="flex gap-3">
                        <button onClick={() => { setEditId(f.id); setEditData({ label: f.label, hex: f.hex, description: f.description || "", active: f.active !== false }); }}
                          className="font-body" style={{ fontSize: 12, color: "#171717" }}>Edit</button>
                        <button onClick={() => setDeleteId(f.id)}
                          className="font-body" style={{ fontSize: 12, color: "#DC2626" }}
                          title={count > 0 ? `Used by ${count} product${count === 1 ? "" : "s"}` : "Delete"}>
                          Delete
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {/* Add new finish row */}
            <tr style={{ borderTop: "2px solid #E2E2E2", background: "#F8F8F8" }}>
              <td className="py-3 px-4">
                <input type="color" value={newFinish.hex} onChange={e => setNewFinish(p => ({ ...p, hex: e.target.value }))}
                  style={{ width: 32, height: 32, border: "none", cursor: "pointer" }} />
              </td>
              <td className="py-3 px-4">
                <input value={newFinish.label} onChange={e => setNewFinish(p => ({ ...p, label: e.target.value }))}
                  placeholder="Finish name (e.g. Smoked Bronze)"
                  style={{ ...inpSt, width: 160 }}
                  onKeyDown={e => e.key === "Enter" && newFinish.label.trim() && (() => { const id = newFinish.label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); onSaveFinish({ ...newFinish, id }); setNewFinish({ label: "", hex: "#C8C8C8", description: "", active: true }); })()} />
              </td>
              <td className="py-3 px-4 font-body" style={{ fontSize: 11, color: "#6B6B6B" }}>{newFinish.hex}</td>
              <td className="py-3 px-4">
                <input value={newFinish.description} onChange={e => setNewFinish(p => ({ ...p, description: e.target.value }))}
                  placeholder="Optional description" style={{ ...inpSt, width: "100%" }} />
              </td>
              <td className="py-3 px-4">
                <span className="font-body" style={{ fontSize: 11, color: "#16A34A" }}>● Active</span>
              </td>
              <td className="py-3 px-4" />
              <td className="py-3 px-4">
                <button onClick={() => {
                    if (!newFinish.label.trim()) return;
                    const id = newFinish.label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                    onSaveFinish({ ...newFinish, id });
                    setNewFinish({ label: "", hex: "#C8C8C8", description: "", active: true });
                  }}
                  className="font-body uppercase"
                  style={{ fontSize: 11, letterSpacing: "0.15em", background: "#171717", color: "white", padding: "6px 14px" }}>
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [pageParams, setPageParams] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // ── Data state — seeded from PRODUCTS_DEFAULT on first render,
  //    then kept in sync with Supabase via effects below ──────
  const [products,   setProducts]   = useState(PRODUCTS_DEFAULT);
  const [categories, setCategories] = useState(CATEGORIES_DEFAULT);
  const [collections,setCollections]= useState(COLLECTIONS);
  const [finishes,   setFinishes]   = useState(FINISHES_DEFAULT);

  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);


  // Auth — localStorage only (no server session needed for anon key pattern)
  const [adminAuthenticated, setAdminAuthenticated] = useState(
    () => localStorage.getItem("vorhaus_admin_auth") === "true"
  );
  const adminEmail = localStorage.getItem("vorhaus_admin_email") || "";

  // ── Navigation ──────────────────────────────────────────────
  const navigate = useCallback((page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo(0, 0);
    if (page === "admin" || page.startsWith("admin-")) {
      window.history.pushState({}, "", "#admin");
    } else if (window.location.hash === "#admin") {
      window.history.pushState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    if (window.location.hash === "#admin") setCurrentPage("admin");
  }, []);

  // ── Toast ───────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Supabase bootstrap: load data on mount ──────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Seed default collections, finishes, categories if DB is empty
        await seedDefaults(COLLECTIONS, FINISHES_DEFAULT, CATEGORIES_DEFAULT, PRODUCTS_DEFAULT);

        const [dbProducts, dbCollections, dbFinishes, dbCategories] = await Promise.all([
          fetchProducts(),
          fetchCollections(),
          fetchFinishes(),
          fetchCategories(),
        ]);

        if (!alive) return;

        // Only replace state if we got real data back from Supabase
        if (dbProducts?.length) {
          const localById = Object.fromEntries(PRODUCTS_DEFAULT.map(p => [p.id, p]));
          const merged = dbProducts.map(dbP => {
            // 1. Remap legacy categoryId values to sanitaryware-accessories
            const remappedCat = LEGACY_CAT_MAP[dbP.categoryId] || dbP.categoryId;
            // 2. Fall back to local bundled images when DB has none yet
            const hasImages = Array.isArray(dbP.images) && dbP.images.length > 0;
            const images = hasImages ? dbP.images : (localById[dbP.id]?.images || []);
            return { ...dbP, categoryId: remappedCat, images };
          });
          setProducts(merged);
        }
        if (dbCollections?.length) setCollections(dbCollections);
        if (dbFinishes?.length)    setFinishes(dbFinishes);
        if (dbCategories?.length) {
          // Only accept the 6 known top-level category IDs.
          // The DB may also contain legacy flat subcategory rows — ignore them.
          const TOP_LEVEL_IDS = [
            "bath-fittings","shower-systems","wash-basins",
            "luxury-vanities","mirrors","sanitaryware-accessories",
          ];
          const dbById = Object.fromEntries(
            dbCategories
              .filter(c => TOP_LEVEL_IDS.includes(c.id))
              .map(c => [c.id, { ...c, subcategories: c.subcategories || [] }])
          );
          // For any top-level ID missing from DB, use the local default
          const localById = Object.fromEntries(CATEGORIES_DEFAULT.map(c => [c.id, c]));
          const merged = TOP_LEVEL_IDS.map(id => dbById[id] || localById[id]).filter(Boolean);
          setCategories(merged);
        }
      } catch (e) {
        // Supabase not configured — silently run in local mode
        console.warn("[EVOKE] Running in local mode (Supabase not configured):", e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // ── Supabase CRUD handlers ──────────────────────────────────
  const catMap = {
    "bath-fittings": "BF", "shower-systems": "SS", "wash-basins": "WB",
    "luxury-vanities": "LV", "mirrors": "MI", "sanitaryware-accessories": "SA",
  };

  const generateCode = (categoryId) => {
    const cat = catMap[categoryId] || "XX";
    const n = products.filter(p => p.categoryId === categoryId).length + 1;
    return `VH-${cat}-${String(n).padStart(3, "0")}`;
  };

  const handleSaveProduct = async (data, productId) => {
    const id = productId || data.id || generateCode(data.categoryId);
    try {
      const saved = await saveProduct({ ...data, id }, productId || null);
      if (saved) {
        setProducts(prev =>
          productId
            ? prev.map(p => p.id === productId ? saved : p)
            : [...prev, saved]
        );
        showToast(productId ? "Product updated" : "Product added");
      } else {
        // Supabase failed — fall back to local state update
        setProducts(prev =>
          productId
            ? prev.map(p => p.id === productId ? { ...p, ...data } : p)
            : [...prev, { ...data, id }]
        );
        showToast(productId ? "Product updated (local)" : "Product added (local)");
      }
    } catch {
      setProducts(prev =>
        productId
          ? prev.map(p => p.id === productId ? { ...p, ...data } : p)
          : [...prev, { ...data, id }]
      );
      showToast(productId ? "Product updated (local)" : "Product added (local)");
    }
  };

  const handleDeleteProduct = async (productId) => {
    try { await deleteProduct(productId); } catch { /* local fallback */ }
    setProducts(prev =>
      prev.filter(p => p.id !== productId)
          .map(p => ({ ...p, relatedProducts: (p.relatedProducts || []).filter(id => id !== productId) }))
    );
    showToast("Product deleted", "error");
    navigate("admin-products");
  };

  const handleDuplicateProduct = async (productId) => {
    const source = products.find(p => p.id === productId);
    if (!source) return;
    const newId = generateCode(source.categoryId);
    const copy = { ...source, id: newId, name: source.name + " (Copy)", published: false };
    try {
      const saved = await saveProduct(copy, null);
      setProducts(prev => [...prev, saved || copy]);
    } catch {
      setProducts(prev => [...prev, copy]);
    }
    showToast("Product duplicated");
  };

  // Collections CRUD
  const handleSaveCollection = async (col) => {
    try {
      const saved = await saveCollection(col);
      setCollections(prev =>
        prev.some(c => c.id === col.id)
          ? prev.map(c => c.id === col.id ? (saved || col) : c)
          : [...prev, saved || col]
      );
    } catch {
      setCollections(prev =>
        prev.some(c => c.id === col.id)
          ? prev.map(c => c.id === col.id ? col : c)
          : [...prev, col]
      );
    }
  };

  const handleDeleteCollection = async (id) => {
    try { await deleteCollection(id); } catch { /* local fallback */ }
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  // Finishes CRUD
  const handleSaveFinish = async (finish) => {
    try {
      const saved = await saveFinish(finish);
      setFinishes(prev =>
        prev.some(f => f.id === finish.id)
          ? prev.map(f => f.id === finish.id ? (saved || finish) : f)
          : [...prev, saved || finish]
      );
    } catch {
      setFinishes(prev =>
        prev.some(f => f.id === finish.id)
          ? prev.map(f => f.id === finish.id ? finish : f)
          : [...prev, finish]
      );
    }
  };

  const handleDeleteFinish = async (id) => {
    try { await deleteFinish(id); } catch { /* local fallback */ }
    setFinishes(prev => prev.filter(f => f.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem("vorhaus_admin_auth");
    localStorage.removeItem("vorhaus_admin_email");
    setAdminAuthenticated(false);
    navigate("home");
  };

  // Admin route check
  const isAdminRoute = currentPage.startsWith("admin");

  // Render admin
  if (isAdminRoute) {
    if (!adminAuthenticated) return <AdminLogin onLogin={setAdminAuthenticated} />;
    return (
      <AdminLayout currentPage={currentPage} navigate={navigate} onLogout={handleLogout} adminEmail={adminEmail}>
        <Toast toast={toast} />
        {currentPage === "admin" && (
          <AdminDashboard navigate={navigate} products={products} categories={categories}
            onDelete={handleDeleteProduct} />
        )}
        {currentPage === "admin-products" && (
          <AdminProductList navigate={navigate} products={products} categories={categories}
            onDelete={handleDeleteProduct} onDuplicate={handleDuplicateProduct} />
        )}
        {(currentPage === "admin-add-product" || currentPage === "admin-edit-product") && (
          <AdminProductForm navigate={navigate} params={pageParams}
            products={products} categories={categories} collections={collections} finishes={finishes}
            onSave={handleSaveProduct} onDelete={handleDeleteProduct} />
        )}
        {currentPage === "admin-categories" && (
          <AdminCategories categories={categories} products={products} navigate={navigate} onDelete={handleDeleteProduct} />
        )}
        {currentPage === "admin-collections" && (
          <AdminCollections collections={collections} onSave={handleSaveCollection} onDelete={handleDeleteCollection} products={products} navigate={navigate} />
        )}
        {currentPage === "admin-finishes" && (
          <AdminFinishes finishes={finishes} onSave={handleSaveFinish} onDelete={handleDeleteFinish} products={products} />
        )}
      </AdminLayout>
    );
  }

  // Render public site
  return (
    <div style={{ background: "#F5F1EA", minHeight: "100vh" }}>
      <Toast toast={toast} />
      <Navbar navigate={navigate} currentPage={currentPage} categories={categories} />

      {currentPage === "home" && (
        <HomePage navigate={navigate} categories={categories} products={products} collections={collections} />
      )}
      {currentPage === "category" && (
        <CategoryPage navigate={navigate} params={pageParams} categories={categories} />
      )}
      {currentPage === "product-listing" && (
        <ProductListingPage navigate={navigate} params={pageParams}
          products={products} categories={categories} finishes={finishes} />
      )}
      {currentPage === "product-detail" && (
        <ProductDetailPage navigate={navigate} params={pageParams}
          products={products} categories={categories} finishes={finishes} />
      )}
      {currentPage === "collections" && (
        <CollectionsPage navigate={navigate} collections={collections} products={products} />
      )}
      {currentPage === "collection-detail" && (
        <CollectionDetailPage navigate={navigate} params={pageParams}
          collections={collections} products={products} categories={categories} />
      )}
      {currentPage === "contact" && <ContactPage navigate={navigate} />}
      {currentPage === "projects" && <ProjectsPage navigate={navigate} />}
      {currentPage === "inspiration" && <InspirationPage navigate={navigate} />}
      {currentPage === "architects" && <ArchitectsPage navigate={navigate} />}
      {currentPage === "hospitality" && <HospitalityPage navigate={navigate} />}
      {currentPage === "showrooms" && <ShowroomsPage navigate={navigate} />}
      {currentPage === "about" && <AboutPage navigate={navigate} />}
  {currentPage === "search" && (
    <SearchPage navigate={navigate} query={pageParams.query || ""} products={products} categories={categories} />
  )}

      <Footer navigate={navigate} categories={categories} />
    </div>
  );
}
