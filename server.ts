import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = process.cwd();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = 3000;

app.use(express.json());

// Database file path for state persistence
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initial Seed Data for E-Commerce platform
const initialProducts = [
  {
    id: "prod_1",
    name: "AeroBuds Pro Max - ANC Earbuds",
    category: "Electronics",
    brand: "AeroTech",
    price: 3499,
    originalPrice: 8999,
    discount: 61,
    rating: 4.6,
    stock: 120,
    tags: ["earbuds", "audio", "anc", "wireless", "best-seller"],
    description: "Immersive audio experience with 45dB hybrid active noise cancellation, smart ambient transparency mode, and ultra-comfortable ear tips designed for long usage.",
    specifications: {
      "Battery Life": "Up to 40 Hours with Charging Case",
      "Drivers": "11mm Dynamic Copper Drivers",
      "Bluetooth Version": "5.4 Dual Connect",
      "Water Resistance": "IPX7 Sweat & Water Proof"
    },
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    reviews: [
      { id: "rev_1", user: "Rohan Sharma", rating: 5, comment: "Incredible sound detailing! The ANC blocks train noise perfectly.", date: "2026-05-15" },
      { id: "rev_2", user: "Smriti Iyer", rating: 4, comment: "Very good battery backup, though case is slightly glossy and prone to fingerprints.", date: "2026-05-20" }
    ],
    qna: [
      { question: "Dual pairing supported?", answer: "Yes, you can pair it with both your phone and laptop simultaneously." }
    ]
  },
  {
    id: "prod_2",
    name: "Titanium Chrono X-3 Smartwatch",
    category: "Electronics",
    brand: "ChronoCorp",
    price: 4999,
    originalPrice: 15999,
    discount: 68,
    rating: 4.4,
    stock: 85,
    tags: ["smartwatch", "wearable", "fitness", "titanium", "mens"],
    description: "Premium titanium alloy rugged casing smartwatch featuring a continuous 1.43-inch AMOLED display, real-time blood dynamics monitoring, dual-band precise GPS, and custom sporting coaching tracks.",
    specifications: {
      "Display": "1.43\" Sapphire Glass AMOLED Touch",
      "Casing": "Aerospace Grade Titanium",
      "Sensors": "Heart Rate, SpO2, Accelerometer, Gyro, Compass",
      "Battery Life": "14 Days on Wearable Mode"
    },
    images: ["https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    reviews: [
      { id: "rev_3", user: "Vikram Malhotra", rating: 4, comment: "High-quality body and screen but the sleep tracker is sometimes slightly off.", date: "2026-05-28" },
      { id: "rev_4", user: "Divya Patel", rating: 5, comment: "Absolute value for money. Built like a luxury tank!", date: "2026-06-02" }
    ],
    qna: [
      { question: "Can we reply to WhatsApp messages?", answer: "Yes, quick-text replies are supported on Android devices." }
    ]
  },
  {
    id: "prod_3",
    name: "UltraCook AI Smart Blender & Soup Maker",
    category: "Appliances",
    brand: "KitchIntel",
    price: 7999,
    originalPrice: 19999,
    discount: 60,
    rating: 4.8,
    stock: 40,
    tags: ["kitchen", "blender", "appliances", "smart-home", "heaters"],
    description: "High-speed multi-cook blender that chops, purees, grinds, and cooks hot soups in under 20 minutes with intelligent heat sensors.",
    specifications: {
      "Motor Capacity": "1400 Watts Peak Power",
      "Heating Element": "800W Integrated Quick-Heater",
      "Jar Capacity": "1.75 Liters Borosilicate Glass",
      "Speeds": "10 Variable Speeds with Pulse"
    },
    images: ["https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_5", user: "Ananya Deshmukh", rating: 5, comment: "My daily soup making routine is entirely automated now. Exceptional!", date: "2026-05-10" }
    ],
    qna: [
      { question: "Does it grind dry spices?", answer: "Yes, it has a dedicated pulverizing mode specifically for hard whole spices." }
    ]
  },
  {
    id: "prod_4",
    name: "Zenith Fly-Knit Sport Running Sneakers",
    category: "Fashion",
    brand: "Zenith",
    price: 1899,
    originalPrice: 4999,
    discount: 62,
    rating: 4.2,
    stock: 220,
    tags: ["shoes", "fashion", "sports", "running", "mens", "footwear"],
    description: "Extremely breathable fly-knit mesh running sneakers with double cushioned EVA midsoles designed for comfortable speed workouts, running tracks, or regular gym sessions.",
    specifications: {
      "Upper Material": "Stretched Fly-Knit Engineered Mesh",
      "Midsole": "High-elasticity Responsive Foam",
      "Outsole": "Carbon Anti-slip Tactical Rubber",
      "Weight": "240g Ultra Light"
    },
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_6", user: "Aditya Roy", rating: 4, comment: "Extremely comfortable and springy, though size fits slightly tight. Buy one size larger.", date: "2026-05-30" }
    ],
    qna: [
      { question: "Are these water-resistant?", answer: "No, they are highly breathable knit mesh designed to dry quickly, but they are not waterproof." }
    ]
  },
  {
    id: "prod_5",
    name: "AuraGlow Smart LED Ambience Bar Dual-Pack",
    category: "Appliances",
    brand: "AuraGlow",
    price: 1299,
    originalPrice: 3999,
    discount: 67,
    rating: 4.5,
    stock: 140,
    tags: ["lighting", "home", "smart-home", "interior", "rgb"],
    description: "Set up the perfect ambient lighting for your desk, gaming rig, or TV backend. Supports dynamic flow, music synchronization, and standard voice controller integrations.",
    specifications: {
      "Color Support": "16 Million RGB Combinations",
      "Control Channels": "Mobile App, Push Control, and Alexa/Google Assist",
      "Power Source": "USB-C DC 5V Powered",
      "Controller Length": "1.5 Meters Dual Cables"
    },
    images: ["https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_7", user: "Gaurav Gupta", rating: 5, comment: "Makes my entire living room look premium. Sync with sound is flawless.", date: "2026-06-03" }
    ],
    qna: [
      { question: "Can we use both bars on separate locations?", answer: "No, they share a common dual USB power output split string, so they stay reasonably close to each other." }
    ]
  },
  {
    id: "prod_6",
    name: "Nebula UltraPortable 4K Android Projector",
    category: "Electronics",
    brand: "Nebula",
    price: 12999,
    originalPrice: 24999,
    discount: 48,
    rating: 4.7,
    stock: 35,
    tags: ["projector", "electronics", "theatre", "portable", "luxury"],
    description: "Compact smart theater projector featuring HDR10, auto focus, vertical/horizontal keystone calibration, dynamic 700 ANSI Lumens, and integrated Google TV apps support.",
    specifications: {
      "Native Resolution": "Full HD 1080P with 4K Engine Decoding",
      "Brightness": "700 ANSI Lumens",
      "Speaker Drivers": "Dual 10W Dolby Premium Audio",
      "System OS": "Licensed Android TV OS"
    },
    images: ["https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&auto=format&fit=crop&q=80"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    reviews: [
      { id: "rev_8", user: "Sarah Verma", rating: 5, comment: "I cancelled my TV purchase plans. This projection on a plain wall is outstanding!", date: "2026-05-18" }
    ],
    qna: [
      { question: "Does it support battery operations?", answer: "No, this is a heavy lumen model requiring direct AC mains power input." }
    ]
  },
  {
    id: "prod_7",
    name: "Samsung Galaxy S26 Ultra (5G, 512GB, AI Zoom)",
    category: "Mobiles",
    brand: "Samsung",
    price: 124999,
    originalPrice: 144999,
    discount: 13,
    rating: 4.9,
    stock: 55,
    tags: ["mobiles", "samsung", "galaxy", "5g", "ai"],
    description: "Experience the next frontier of mobile intelligence with Galaxy S26 Ultra. Equipped with 200MP Quad AI Telephoto camera, 100x Space Zoom, and built-in S-Pen.",
    specifications: {
      "Display": "6.8\" Quad HD+ Dynamic AMOLED 2X",
      "Camera": "200MP + 50MP + 12MP + 10MP",
      "Processor": "Snapdragon 8 Gen 5 AI Special",
      "Battery": "5500 mAh with 45W Fast Charging"
    },
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_9", user: "Harish Gupta", rating: 5, comment: "Camera results are phenomenal, the AI zoom is magical!", date: "2026-06-01" }
    ],
    qna: [
      { question: "Is charger included in the box?", answer: "No, box includes the smartphone, S-Pen, and Type-C to Type-C cable. Charger is sold separately." }
    ]
  },
  {
    id: "prod_8",
    name: "MacBook Pro M4 Pro (16-inch, 48GB RAM, 1TB SSD)",
    category: "Laptops",
    brand: "Apple",
    price: 249900,
    originalPrice: 269900,
    discount: 7,
    rating: 4.9,
    stock: 25,
    tags: ["laptops", "apple", "macbook", "m4", "pro"],
    description: "The absolute gold standard for creative professionals, developers, and speed enthusiasts. Built with Apple M4 Pro chip with 16-core CPU, 20-core GPU, and gorgeous Liquid Retina XDR screen.",
    specifications: {
      "Processor": "Apple M4 Pro with 16-core CPU",
      "Memory": "48GB Unified RAM",
      "Storage": "1TB SuperFast SSD",
      "Battery Life": "Up to 24 Hours Movie Playback"
    },
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_10", user: "Priya Menon", rating: 5, comment: "Pure performance beast. 48GB unified memory compiles my workspace in seconds.", date: "2026-05-25" }
    ],
    qna: [
      { question: "Does it support external monitors?", answer: "Yes, it supports up to three external displays with 6K resolution." }
    ]
  },
  {
    id: "prod_9",
    name: "Zoul Teakwood Comfort Home Workstation",
    category: "Home & Living",
    brand: "Zoul",
    price: 5499,
    originalPrice: 12999,
    discount: 57,
    rating: 4.4,
    stock: 80,
    tags: ["furniture", "desk", "home", "office", "teakwood"],
    description: "Ergonomically designed solid teakwood laptop and studying table with integrated power cord grommet, drawers, and heavy powder-coated steel frame.",
    specifications: {
      "Material": "Solid Teakwood & Heavy Carbon Steel",
      "Dimensions": "120cm Width x 60cm Depth x 75cm Height",
      "Features": "Ducting Channels, Built-in Headphone Hook",
      "Weight Capacity": "Up to 100 kg"
    },
    images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_11", user: "Karan Johar", rating: 4, comment: "Very sturdy build, took 15 mins to assemble. Looks extremely premium.", date: "2026-06-03" }
    ],
    qna: [
      { question: "Is assembly guide included?", answer: "Yes! Visual step-by-step DIY assembly guide and all tools are included." }
    ]
  },
  {
    id: "prod_10",
    name: "Bella Vita Luxury Unisex Perfume Gift Set (4x20ml)",
    category: "Beauty",
    brand: "Bella Vita",
    price: 849,
    originalPrice: 1249,
    discount: 32,
    rating: 4.5,
    stock: 400,
    tags: ["perfume", "beauty", "scents", "lifestyle", "luxury"],
    description: "Bella Vita Organic luxury perfume gift set for men & women features four iconic fragrances (CEO, Fresh, Honey Oud, Impact) perfect for gifting and special corporate occasions.",
    specifications: {
      "Included EDPs": "CEO MAN, FRESH, HONEY OUD, IMPACT",
      "Volume": "4 x 20ml Travel-Friendly Bottles",
      "Longevity": "Up to 8-10 Hours",
      "Ingredients": "100% Organic, Cruelty-Free Vegan"
    },
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_12", user: "Neetu Chawla", rating: 5, comment: "Amazing value for gifting. Each of the four scents smells incredibly royal.", date: "2026-06-04" }
    ],
    qna: [
      { question: "Is this travel friendly?", answer: "Yes, 20ml sleek glass bottles are fully flight travel-safe." }
    ]
  },
  {
    id: "prod_11",
    name: "Atomic Habits Hardcover (International Best Seller)",
    category: "Books",
    brand: "James Clear",
    price: 499,
    originalPrice: 799,
    discount: 37,
    rating: 4.8,
    stock: 650,
    tags: ["books", "bestseller", "habits", "self-help", "nonfiction"],
    description: "Atomic Habits by James Clear is the definitive guide to breaking bad behaviors and creating positive, automated daily routines in tiny, incremental 1% steps.",
    specifications: {
      "Format": "Hardcover Premium International Edition",
      "Publisher": "Penguin Random House",
      "Pages": "320 pages",
      "Genre": "Self-Help / Business Productivity"
    },
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_13", user: "Suresh Prabhu", rating: 5, comment: "Life-changing book. Simple examples that work practically.", date: "2026-05-18" }
    ],
    qna: [
      { question: "Is this the original print edition?", answer: "Yes, original publication from Penguin Books with hologram stamp on back page." }
    ]
  },
  {
    id: "prod_12",
    name: "Premium Farm Fresh Organic Cashews (W320, 500g)",
    category: "Grocery",
    brand: "FarmDirect",
    price: 529,
    originalPrice: 999,
    discount: 47,
    rating: 4.6,
    stock: 320,
    tags: ["grocery", "cashews", "nuts", "healthy", "food"],
    description: "Premium jumbo-sized whole organic cashew nuts sourced from high-yield Kerala orchards. Packed in nitrogen flushed vacuum zip bags to lock in absolute crunch.",
    specifications: {
      "Grade": "Whole White Cashews Grade W320",
      "Weight": "500 grams",
      "Packaging": "Airtight Sealable Stand-up Pouch",
      "Shelf Life": "9 Months from packing"
    },
    images: ["https://images.unsplash.com/photo-1623428187969-5da2dcee5ebf?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_14", user: "Meera Nair", rating: 4, comment: "Extremely clean, not a single broken piece. Very sweet and high class.", date: "2026-06-05" }
    ],
    qna: [
      { question: "Are they roasted or raw?", answer: "These are raw whole cashews. You can roast or salt them at your home." }
    ]
  },
  {
    id: "prod_13",
    name: "Apple iPhone 17 Pro Max (A19 Bionic, Dual Active eSIM)",
    category: "Mobiles",
    brand: "Apple",
    price: 154999,
    originalPrice: 159999,
    discount: 3,
    rating: 4.9,
    stock: 40,
    tags: ["mobiles", "apple", "iphone", "5g", "ios"],
    description: "Discover the pinnacle of mobile technology with Apple iPhone 17 Pro Max. Super Retina XDR Always-On OLED display, A19 Bionic pro chip, and dynamic action button context.",
    specifications: {
      "Display": "6.9\" Super Retina XDR OLED",
      "Processor": "Apple A19 Bionic Chip",
      "Camera": "48MP Triple Pro Camera System",
      "OS": "iOS 19 Premium Edition"
    },
    images: ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_15", user: "Ayush Saxena", rating: 5, comment: "Titanium feels like velvet, battery backup easily survives two heavy usage days.", date: "2026-06-01" }
    ],
    qna: [
      { question: "Is eSIM mandatory?", answer: "Yes, this international version exclusively supports eSIM activations." }
    ]
  },
  {
    id: "prod_14",
    name: "OnePlus Nord CE 4 (8GB RAM, 256GB Storage)",
    category: "Mobiles",
    brand: "OnePlus",
    price: 24999,
    originalPrice: 28999,
    discount: 13,
    rating: 4.5,
    stock: 110,
    tags: ["mobiles", "oneplus", "nord", "android"],
    description: "Uncompromising speed and efficiency. The OnePlus Nord CE 4 delivers exceptional gaming battery life with 100W SUPERVOOC charging, fluid AMOLED screen, and Sony UltraClear camera.",
    specifications: {
      "Display": "6.7\" 120Hz Fluid AMOLED",
      "Processor": "Snapdragon 7 Gen 3",
      "Battery": "5500 mAh with 100W Fast Charge",
      "OS": "OxygenOS based on Android 14"
    },
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_16", user: "Sahil Khan", rating: 4, comment: "Charging speed is blazing fast. Reaches 100% in exactly 28 minutes.", date: "2026-06-03" }
    ],
    qna: [
      { question: "Does it support expandable storage?", answer: "Yes, expandable up to 1TB using a hybrid MicroSD card slot." }
    ]
  },
  {
    id: "prod_15",
    name: "HP Pavilion Plus 14 (AMD Ryzen 7, 16GB RAM, 1TB SSD)",
    category: "Laptops",
    brand: "HP",
    price: 72999,
    originalPrice: 84999,
    discount: 14,
    rating: 4.4,
    stock: 45,
    tags: ["laptops", "hp", "pavilion", "ryzen", "work"],
    description: "An incredibly fast, ultra-portable workstation. HP Pavilion Plus is built with high-performance Ryzen series processors, premium metal chassis, and exceptional thermal cooling vents.",
    specifications: {
      "Processor": "AMD Ryzen 7 7840U Boost",
      "Memory": "16GB LPDDR5 RAM",
      "Storage": "1TB PCIe Gen4 NVMe SSD",
      "Graphics": "AMD Radeon 780M Integrated"
    },
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_17", user: "Gaurav Malhotra", rating: 4, comment: "Crisp display, sleek design. Heavy rendering heats it up slightly after an hour.", date: "2026-06-05" }
    ],
    qna: [
      { question: "Does it have a backlit keyboard?", answer: "Yes, standard 3-stage bright white backlit keyboard is included." }
    ]
  },
  {
    id: "prod_16",
    name: "Lenovo IdeaPad Slim 3 (Intel i5, 8GB, 512GB SSD)",
    category: "Laptops",
    brand: "Lenovo",
    price: 42999,
    originalPrice: 59999,
    discount: 28,
    rating: 4.1,
    stock: 70,
    tags: ["laptops", "lenovo", "ideapad", "i5", "student"],
    description: "The ideal back-to-school student companion. Combines Intel's reliable multi-thread core speed with a sleek design and crystal-clear FHD anti-glare screen.",
    specifications: {
      "Processor": "Intel Core i5 12th Gen Ultra",
      "Memory": "8GB DDR4 RAM",
      "Storage": "512GB NVMe M.2 SSD",
      "OS": "Windows 11 Home pre-loaded"
    },
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_18", user: "Rajesh Sani", rating: 4, comment: "Superb daily laptop. Speakers could have been slightly louder.", date: "2026-05-22" }
    ],
    qna: [
      { question: "Does it include MS Office?", answer: "Yes, fully licensed Microsoft Office Home & Student 2021 is pre-activated." }
    ]
  },
  {
    id: "prod_17",
    name: "Sony WH-1000XM5 Wireless Over-Ear ANC Headphones",
    category: "Electronics",
    brand: "Sony",
    price: 29990,
    originalPrice: 34990,
    discount: 14,
    rating: 4.8,
    stock: 90,
    tags: ["headphones", "audio", "anc", "sony", "premium"],
    description: "Industry-leading ambient active noise cancellation with premium Auto-Optimizing software, crystal-clear hands-free calls using dual processors, and comfortable lightweight dome cups.",
    specifications: {
      "ANC": "Industry-leading Dual Processor ANC",
      "Battery Life": "Up to 30 Hours with ANC On",
      "Microphone": "4 Beamforming Mics for Clear Calls",
      "Bluetooth": "Version 5.2 MultiPoint Adaptive"
    },
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_19", user: "Vikrant Patil", rating: 5, comment: "Best headphones on the planet. ANC cuts down air condition hum on flights to absolute zero.", date: "2026-06-03" }
    ],
    qna: [
      { question: "Does it support wired connection?", answer: "Yes, standard 3.5mm premium audio jack connection is included in the carry case." }
    ]
  },
  {
    id: "prod_18",
    name: "OnePlus Smart TV 43Y1S (43-inch, Full HD, Borderless Display)",
    category: "Electronics",
    brand: "OnePlus",
    price: 21999,
    originalPrice: 29999,
    discount: 26,
    rating: 4.3,
    stock: 40,
    tags: ["tv", "electronics", "oneplus", "smart", "home"],
    description: "Bring rich, borderless movie visuals to your living room. Powered by gamma engine optimization, dual Dolby audio speakers, and seamless OxygenPlay ecosystem integration.",
    specifications: {
      "Display size": "43 Inches Full HD Vivid Panel",
      "Speaker": "20W Dolby Audio Speakers System",
      "OS": "Android TV 11 with OxygenPlay 2.0",
      "Connectivity": "Dual-Band Wi-Fi, 2 x HDMI"
    },
    images: ["https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_20", user: "Pallavi Verma", rating: 4, comment: "Picture quality is fantastic, Android TV starts up instantly with next to no lag.", date: "2026-06-02" }
    ],
    qna: [
      { question: "Does it support screencast?", answer: "Yes, built-in Google Chromecast and Miracast are supported." }
    ]
  },
  {
    id: "prod_19",
    name: "Philips Digital Air Fryer HD9252 (4.1L, Multi-Cook Presets)",
    category: "Appliances",
    brand: "Philips",
    price: 7499,
    originalPrice: 11999,
    discount: 37,
    rating: 4.6,
    stock: 150,
    tags: ["airfryer", "appliances", "kitchen", "healthy", "cooking"],
    description: "Enjoy zero-guilt fried food with up to 90% less oil. Uses rapid swirl air circulation technology to cook food perfectly crispy on the outside and tender inside.",
    specifications: {
      "Capacity": "4.1 Liters Pan",
      "Technology": "Rapid Air tech with 7 Touch Presets",
      "Power": "1400 Watts peak power",
      "Control": "Touch screen interface with QuickClean"
    },
    images: ["https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_21", user: "Kiran Mazumdar", rating: 5, comment: "Absolutely essential kitchen helper. I make roasted paneer and fries in minutes with minimal oil.", date: "2026-06-04" }
    ],
    qna: [
      { question: "Is the basket dishwasher safe?", answer: "Yes, the non-stick coated basket is fully dishwasher-friendly." }
    ]
  },
  {
    id: "prod_20",
    name: "LG 190L 4-Star Smart Inverter Refrigerator (Single Door)",
    category: "Appliances",
    brand: "LG",
    price: 16490,
    originalPrice: 19990,
    discount: 17,
    rating: 4.4,
    stock: 30,
    tags: ["refrigerator", "appliances", "lg", "kitchen", "cooling"],
    description: "Keep your organic fruits, dairy, and meal preparations perfectly cooled day and night with unmatched energy savings and stabilizer-free protection controls.",
    specifications: {
      "Capacity": "190 Liters Single Door",
      "Energy Rating": "4 Star Smart Inverter Efficiency",
      "Base Drawer": "Includes Base Stand Drawer for onion/potato",
      "Stabilizer Free": "Works on 90V - 310V range"
    },
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_22", user: "Tarun Bajaj", rating: 4, comment: "Keeps ice solid, runs extremely silent. Base drawer is surprisingly practical.", date: "2026-05-28" }
    ],
    qna: [
      { question: "Can it run on home solar?", answer: "Yes, it can run on home inverter and standard solar energy backups." }
    ]
  },
  {
    id: "prod_21",
    name: "Nike Air Max Pulse Mens Sports Running Shoes",
    category: "Fashion",
    brand: "Nike",
    price: 12995,
    originalPrice: 14995,
    discount: 13,
    rating: 4.7,
    stock: 85,
    tags: ["shoes", "fashion", "nike", "running", "mens"],
    description: "The ultimate lifestyle trainer meets marathon-ready shock absorption. Fitted with point-loaded bounce cushions and custom lightweight canvas wrapping.",
    specifications: {
      "Sole": "High-Pressure Heel Cushion Air Unit",
      "Upper": "Soft breathable engineered textile mesh",
      "Design": "Lace-up vintage athletic design",
      "Style Code": "DR0449-002"
    },
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_23", user: "Sameer Saxena", rating: 5, comment: "It feels like walking on premium springs. Highly recommend for high-intensity training.", date: "2026-06-03" }
    ],
    qna: [
      { question: "Can I wash them in a machine?", answer: "Hand wash with cold water and soft brush is recommended to protect the air mesh fabric." }
    ]
  },
  {
    id: "prod_22",
    name: "Adidas Legend Cotton Athletic Hooded Sweatshirt",
    category: "Fashion",
    brand: "Adidas",
    price: 2999,
    originalPrice: 4999,
    discount: 40,
    rating: 4.4,
    stock: 180,
    tags: ["clothing", "fashion", "adidas", "hoodie", "sportswear"],
    description: "Classic streetwear silhouette engineered with incredibly soft heavy French terry cotton. Keeps you cozy and warm during gym routines or urban transit.",
    specifications: {
      "Material": "70% French Terry Cotton / 30% Polyester Duo",
      "Fit": "Regular fit with ribbed hem & elastic cuffs",
      "Hood": "Drawcord-adjustable hood loops",
      "Pockets": "Kangaroo styled linked front pockets"
    },
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_24", user: "Manoj Rawat", rating: 4, comment: "Softest cotton material ever. The hood is double fabric lined and keeps head cozy.", date: "2026-06-01" }
    ],
    qna: [
      { question: "Does it shrink on machine wash?", answer: "No, the pre-shrunk cotton dual fabric retains shape perfectly." }
    ]
  },
  {
    id: "prod_23",
    name: "Solimo Premium Double Glace Cotton Bedsheet",
    category: "Home & Living",
    brand: "Solimo",
    price: 899,
    originalPrice: 1599,
    discount: 43,
    rating: 4.2,
    stock: 240,
    tags: ["bedsheet", "home", "cotton", "solimo", "decor"],
    description: "Drape your master bedroom mattress in soft premium cotton grids with dynamic print fastness. Highly breathable fabric ensuring deeply comforting sleep under fan cooling.",
    specifications: {
      "Size": "Double Bedsheet 228 x 274 cm",
      "Material": "100% Pure Premium Glace Cotton",
      "Thread Count": "180 TC Grid weave finish",
      "Package Contents": "1 Double Bedsheet with 2 Pillow Covers"
    },
    images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_25", user: "Shweta Tiwari", rating: 4, comment: "Colours did not bleed at all on first cold wash. Fits my king mattress easily.", date: "2026-05-24" }
    ],
    qna: [
      { question: "Is it pure cotton?", answer: "Yes, it is weaved using 100% premium long-staple organic cotton fibers." }
    ]
  },
  {
    id: "prod_24",
    name: "Minimalist Ceramic Donut Flower Vase (Set of 3)",
    category: "Home & Living",
    brand: "CraftHub",
    price: 1199,
    originalPrice: 2499,
    discount: 52,
    rating: 4.6,
    stock: 110,
    tags: ["vase", "home", "ceramic", "decor", "interior"],
    description: "Stylize your desk console, corner table, or shelving unit with a gorgeous triptych of matte sand glazed handcrafted ceramic flower vases of varying heights.",
    specifications: {
      "Material": "Eco-friendly Glazed Matte Textured Ceramic",
      "Pieces included": "Set of 3 Multi-size Vases",
      "Design Theme": "Nordic minimalist donut curves",
      "Durability Ratio": "Crack-resistant double-fired heavy ceramic"
    },
    images: ["https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_26", user: "Deepika Padukone", rating: 5, comment: "Looks incredibly subtle and modern. Excellent packaging with bubble wraps.", date: "2026-06-04" }
    ],
    qna: [
      { question: "Can we put real water and flowers in it?", answer: "Yes, the interior is water-tight glazed specifically to hold fresh flower stems." }
    ]
  },
  {
    id: "prod_25",
    name: "L'Oreal Paris Extraordinary Hair Serum (100ml)",
    category: "Beauty",
    brand: "L'Oreal",
    price: 499,
    originalPrice: 649,
    discount: 23,
    rating: 4.5,
    stock: 450,
    tags: ["serum", "beauty", "haircare", "loreal", "shampoo"],
    description: "Deep hair cuticle nourishment with a non-sticky formulation. Infused with six rare flower extracts to eliminate tangles and grant a brilliant 24-hour shine boost.",
    specifications: {
      "Volume": "100ml Matte Travel Bottle",
      "Base Oil Blend": "6 Rich Flower Oil active extracts",
      "Primary Benefits": "Deep nourishment, 24-hr shine, frizz shield",
      "Application Guide": "Pre-shampoo, post-wash, or before iron styling"
    },
    images: ["https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_27", user: "Ridhi Dogra", rating: 5, comment: "A single pump does wonders for dry ends. Keeps hair smelling sweet and shiny.", date: "2026-06-03" }
    ],
    qna: [
      { question: "Is it safe for chemically colored hair?", answer: "Yes, it is lightweight, paraben-free, and fully safe for treated hair." }
    ]
  },
  {
    id: "prod_26",
    name: "Minimalist 10% Niacinamide Spot Face Serum (30ml)",
    category: "Beauty",
    brand: "Minimalist",
    price: 539,
    originalPrice: 599,
    discount: 10,
    rating: 4.6,
    stock: 390,
    tags: ["serum", "beauty", "spotcare", "minimalist", "skin"],
    description: "Soothe acne marks, blemishes, and uneven skin textures. Our clinical grade formula blends active Zinc PCA to regulate sebum oil balance beautifully.",
    specifications: {
      "Main Active": "10% Niacinamide (Vitamin B3) + Zinc PCA",
      "Capacity": "30ml Frosted Amber Dropper Bottle",
      "Chemical safety": "Sulphate & Paraben-free oil hydration",
      "Best Results": "Use morning and evening before moisturizer"
    },
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_28", user: "Kriti Sanon", rating: 5, comment: "Noticeable reduction in acne red marks within 14 days. My skin feels super calm.", date: "2026-06-05" }
    ],
    qna: [
      { question: "Does it work on sensitive skin?", answer: "Yes, it is formulated at pH 5.5-6.5 to prevent any burning or tingling." }
    ]
  },
  {
    id: "prod_27",
    name: "Ikigai: The Japanese Secret to a Long and Happy Life",
    category: "Books",
    brand: "Hector Garcia",
    price: 349,
    originalPrice: 599,
    discount: 41,
    rating: 4.7,
    stock: 800,
    tags: ["books", "bestseller", "ikigai", "happiness", "philosophy"],
    description: "Explore the legendary Japanese philosophy of finding your active intersect of what you love, what you are good at, and what the world needs.",
    specifications: {
      "Format": "Hardcover English Library Edition",
      "Publisher": "Cornerstone British Publications",
      "Page Count": "208 pages with illustrations",
      "Core Theme": "Mindfulness, healthy eating, and daily life flow"
    },
    images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_29", user: "Nitin Kamath", rating: 5, comment: "An absolute literary gem. Extremely gentle yet deeply impactful advice.", date: "2026-05-30" }
    ],
    qna: [
      { question: "Is this the hardcover original?", answer: "Yes, original publication from Penguin Books with premium binding." }
    ]
  },
  {
    id: "prod_28",
    name: "The Psychology of Money by Morgan Housel",
    category: "Books",
    brand: "Morgan Housel",
    price: 299,
    originalPrice: 399,
    discount: 25,
    rating: 4.8,
    stock: 910,
    tags: ["books", "bestseller", "finance", "money", "investing"],
    description: "Nineteen fascinating short stories exploring the weird ways people think about wealth, greed, and happy long-term family security operations.",
    specifications: {
      "Format": "Paperback National bestseller print",
      "Publisher": "Jaico Books Publishing House",
      "Page Count": "252 pages standard stock",
      "Genre": "Personal finance behavioral psychology"
    },
    images: ["https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_30", user: "Zerodha Nithin", rating: 5, comment: "Best finance book ever written. Points out behavioral traps wonderfully.", date: "2026-06-01" }
    ],
    qna: [
      { question: "Is it easy to read for beginners?", answer: "Yes, fully conversational English requiring zero background in economics." }
    ]
  },
  {
    id: "prod_29",
    name: "Tata Tea Gold Leaf Filter Premium Assam Blend (1kg)",
    category: "Grocery",
    brand: "Tata Tea",
    price: 419,
    originalPrice: 479,
    discount: 12,
    rating: 4.5,
    stock: 500,
    tags: ["grocery", "tea", "chai", "beverage", "tata"],
    description: "Treat yourself to a brilliant aroma and full-bodied classic taste. Tata Tea Gold wefts rich Assam orthodox black tea leaves with premium CTC granules.",
    specifications: {
      "Net Quantity": "1 kg Fresh Vacuum Pack",
      "Blend details": "Rich Assam orthodox tea leaves with 15% long leaf strings",
      "Flavour type": "Exquisite heavy body aroma and bright liquors",
      "Shelf Life": "12 Months from vacuum seal"
    },
    images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_31", user: "Ajay Devgn", rating: 5, comment: "This is my daily morning chai companion. Absolutely authentic color and taste.", date: "2026-06-04" }
    ],
    qna: [
      { question: "Is this black tea or green tea?", answer: "This is high quality loose black orthodox CTC tea." }
    ]
  },
  {
    id: "prod_30",
    name: "Daawat Rozana Super Basmati Long Grain Rice (5kg Bag)",
    category: "Grocery",
    brand: "Daawat",
    price: 395,
    originalPrice: 499,
    discount: 20,
    rating: 4.4,
    stock: 310,
    tags: ["grocery", "rice", "basmati", "grains", "food"],
    description: "Premium aged organic super basmati long grain rice. Expands double its length on cooking, granting a rich jasmine buttery aroma to daily regular meals.",
    specifications: {
      "Net Weight": "5 kg Heavy Air-sealed Pouch",
      "Grain Length": "Half and three-quarters average milled length grains",
      "Perfect For": "Biryani side dishes, traditional pulao, and fried rice",
      "Aging period": "Naturally aged for 12 months minimum"
    },
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [
      { id: "rev_32", user: "Sanjeev Kapoor", rating: 5, comment: "Grains stay completely separate, making it exceptionally dry and perfect for frying.", date: "2026-06-05" }
    ],
    qna: [
      { question: "Are they whole grain or broken?", answer: "These are rozana Grade-A premium grains, consisting of up to 75% length whole grains." }
    ]
  }
];

// Load core state from DB or write default
function loadDb() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading db file, regenerating defaults", e);
    }
  }
  
  // Set default state structure
  const defaultState = {
    products: initialProducts,
    users: [
      {
        uid: "user_customer",
        email: "customer@shopsphere.com",
        name: "Saurabh Gupta",
        role: "customer",
        phone: "+91 9876543210",
        wishlist: ["prod_1", "prod_3"],
        cart: [],
        orders: [],
        businessProfile: null,
        sellerProfile: null
      },
      {
        uid: "user_business_owner",
        email: "wholesale@enterprise.com",
        name: "Gupta Wholesale Enterprises",
        role: "customer", // initially customer prior to business verification
        phone: "+91 9988776655",
        wishlist: [],
        cart: [],
        orders: [],
        businessProfile: {
          businessName: "Gupta Wholesale Corporation",
          gstNumber: "27AAACG1234F1Z1",
          phone: "+91 9988776655",
          panNumber: "ABCDE1234F",
          aadhaarNumber: "123456789012",
          address: "102, Nariman Point, Industrial Hub, Mumbai, MH",
          status: "pending", // pending, approved, rejected
          submittedAt: "2026-06-05T12:00:00Z"
        },
        sellerProfile: null
      },
      {
        uid: "user_seller_pro",
        email: "seller@aerotech.com",
        name: "AeroTech Official Brand",
        role: "seller", // already approved
        phone: "+91 9000111222",
        wishlist: [],
        cart: [],
        orders: [],
        businessProfile: null,
        sellerProfile: {
          companyName: "AeroTech Retail Private Limited",
          gstNumber: "29AAACG9988C2Z4",
          panNumber: "PQRSTA1234B",
          aadhaarNumber: "987654321098",
          bankAccount: "918273645544 IFSC DBSS0239103",
          address: "Sector 4, Phase 2, HSR Layout, Bengaluru, KA",
          logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80",
          status: "approved",
          submittedAt: "2026-03-10T10:00:00Z"
        }
      }
    ],
    coupons: [
      { code: "SHOP10", type: "percent", value: 10, minPurchase: 1000 },
      { code: "B2BDEAL", type: "flat", value: 1500, minPurchase: 15000 },
      { code: "FESTIVE500", type: "flat", value: 500, minPurchase: 3000 }
    ],
    orderLogs: [
      {
        orderId: "ORD_382103",
        userId: "user_customer",
        items: [
          { productId: "prod_1", qty: 1, purchasePrice: 3499, name: "AeroBuds Pro Max - ANC Earbuds" }
        ],
        shippingMode: "fast",
        shippingCost: 150,
        gstDetails: null,
        couponCode: "SHOP10",
        discountAmount: 350,
        taxAmount: 567, // 18% GST
        subtotal: 3499,
        total: 3866,
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        deliveryStatus: "In Transit",
        deliveryDate: "2026-06-09",
        orderDate: "2026-06-06T15:30:23Z",
        trackingTimeline: [
          { title: "Order Processed", desc: "Your payment was processed successfully.", date: "2026-06-06T15:30:23Z" },
          { title: "Dispatched", desc: "Shipped via Express Logistics Hub Pune", date: "2026-06-07T08:15:00Z" }
        ]
      }
    ],
    fraudLogs: [],
    clicksAndViews: [
      // user behaviors for hybrid collaborative suggestion engine
      { userId: "user_customer", productId: "prod_1", count: 12 },
      { userId: "user_customer", productId: "prod_3", count: 4 }
    ],
    chatHistory: {}
  };
  
  fs.writeFileSync(DB_PATH, JSON.stringify(defaultState, null, 2), 'utf-8');
  return defaultState;
}

function saveDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Global active session for this app (mock session cookie for easy frontend demo toggle)
let currentSessionUserUid = "user_customer";

// Fetch current user details
const getCurrentUserFromDb = (dbState: any) => {
  return dbState.users.find((u: any) => u.uid === currentSessionUserUid) || dbState.users[0];
};

// ---------------------- ENDPOINTS ----------------------

// 1. Session APIs
app.get('/api/auth/session', (req, res) => {
  const dbState = loadDb();
  const user = getCurrentUserFromDb(dbState);
  res.json({ user, allAvailableUsers: dbState.users.map((u: any) => ({ uid: u.uid, name: u.name, role: u.uid === 'user_business_owner' && u.businessProfile?.status === 'approved' ? 'business' : u.role, email: u.email })) });
});

// Switch mock sessions (allows instant evaluation in UI of Customer vs Business vs Seller flows!)
app.post('/api/auth/switch-session', (req, res) => {
  const { uid } = req.body;
  const dbState = loadDb();
  const userExist = dbState.users.find((u: any) => u.uid === uid);
  if (userExist) {
    currentSessionUserUid = uid;
    res.json({ success: true, user: userExist });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and Email are fully required" });
  }
  
  const dbState = loadDb();
  const alreadyExist = dbState.users.find((u: any) => u.email === email);
  if (alreadyExist) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const newUid = "user_" + Math.random().toString(36).substr(2, 9);
  
  // Map registration role to app properties
  let actualRole = "customer";
  let businessProfile = null;
  let sellerProfile = null;

  if (role === 'wholesaler' || role === 'business') {
    actualRole = "business"; // directly approved
    businessProfile = {
      businessName: `${name} Wholesale Corp`,
      gstNumber: "27AAACG1234F1Z1",
      phone: phone || "+91 9988776655",
      panNumber: "ABCDE1234F",
      aadhaarNumber: "123456789012",
      address: "102, Commercial Estate Phase 1, Mumbai, MH",
      status: "approved",
      submittedAt: new Date().toISOString()
    };
  } else if (role === 'brandseller' || role === 'seller') {
    actualRole = "seller";
    sellerProfile = {
      companyName: `${name} Brand Hub`,
      gstNumber: "29AAACG9988C2Z4",
      panNumber: "PQRSTA1234B",
      aadhaarNumber: "987654321098",
      bankAccount: "918273645544 IFSC DBSS0239103",
      address: "Sector 4, Phase 2, HSR Layout, Bengaluru, KA",
      logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80",
      status: "approved",
      submittedAt: new Date().toISOString()
    };
  }

  const newUser = {
    uid: newUid,
    email,
    name,
    role: actualRole,
    phone: phone || "",
    wishlist: [],
    cart: [],
    orders: [],
    businessProfile,
    sellerProfile
  };

  dbState.users.push(newUser);
  saveDb(dbState);

  currentSessionUserUid = newUid;
  res.json({ success: true, user: newUser });
});

app.post('/api/auth/verify-profile', (req, res) => {
  const { mode, aadhaar, pan, gst, companyName, bankAccount, address, logo } = req.body;
  const dbState = loadDb();
  const userIndex = dbState.users.findIndex((u: any) => u.uid === currentSessionUserUid);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "Session expired or user not found" });
  }

  const user = dbState.users[userIndex];

  if (mode === 'business') {
    if (!aadhaar || !pan || !gst || !companyName || !address) {
      return res.status(400).json({ error: "All business fields (Aadhaar, PAN, GST, Name, Address) are required" });
    }
    user.businessProfile = {
      businessName: companyName,
      gstNumber: gst,
      panNumber: pan,
      aadhaarNumber: aadhaar,
      address,
      phone: user.phone || "+91 9999999999",
      status: "pending", // Starts as pending for manual Admin panel approval!
      submittedAt: new Date().toISOString()
    };
  } else if (mode === 'seller') {
    if (!aadhaar || !pan || !gst || !companyName || !address || !bankAccount) {
      return res.status(400).json({ error: "All seller fields are required" });
    }
    user.sellerProfile = {
      companyName,
      gstNumber: gst,
      panNumber: pan,
      aadhaarNumber: aadhaar,
      bankAccount,
      address,
      logo: logo || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100",
      status: "pending", // Pending admin approval
      submittedAt: new Date().toISOString()
    };
  } else {
    return res.status(400).json({ error: "Invalid verification mode" });
  }

  dbState.users[userIndex] = user;
  saveDb(dbState);
  res.json({ success: true, user });
});

// User action tracking tool
app.post('/api/analytics/view', (req, res) => {
  const { productId } = req.body;
  const dbState = loadDb();
  
  let record = dbState.clicksAndViews.find((c: any) => c.userId === currentSessionUserUid && c.productId === productId);
  if (record) {
    record.count += 1;
  } else {
    dbState.clicksAndViews.push({ userId: currentSessionUserUid, productId, count: 1 });
  }
  
  saveDb(dbState);
  res.json({ success: true });
});

// Appreciate dynamic user configuration (Cart manipulation, Wishlist toggle)
app.post('/api/user/wishlist', (req, res) => {
  const { productId } = req.body;
  const dbState = loadDb();
  const user = getCurrentUserFromDb(dbState);
  
  const isWishlisted = user.wishlist.includes(productId);
  if (isWishlisted) {
    user.wishlist = user.wishlist.filter((id: string) => id !== productId);
  } else {
    user.wishlist.push(productId);
  }

  const idx = dbState.users.findIndex((u: any) => u.uid === user.uid);
  dbState.users[idx] = user;
  saveDb(dbState);
  res.json({ success: true, wishlist: user.wishlist });
});

app.post('/api/user/cart', (req, res) => {
  const { productId, qty, act } = req.body; // act: "add", "set", "remove"
  const dbState = loadDb();
  const user = getCurrentUserFromDb(dbState);

  if (!user.cart) user.cart = [];

  const existingItemIndex = user.cart.findIndex((i: any) => i.productId === productId);

  if (act === 'remove') {
    user.cart = user.cart.filter((i: any) => i.productId !== productId);
  } else if (act === 'set') {
    if (qty > 0) {
      if (existingItemIndex > -1) {
        user.cart[existingItemIndex].qty = qty;
      } else {
        user.cart.push({ productId, qty });
      }
    } else {
      user.cart = user.cart.filter((i: any) => i.productId !== productId);
    }
  } else { // add-by-one by default
    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].qty += (qty || 1);
    } else {
      user.cart.push({ productId, qty: (qty || 1) });
    }
  }

  const idx = dbState.users.findIndex((u: any) => u.uid === user.uid);
  dbState.users[idx] = user;
  saveDb(dbState);
  res.json({ success: true, cart: user.cart });
});

// 2. Admin verification systems
app.get('/api/admin/pending', (req, res) => {
  const dbState = loadDb();
  const pendingBusiness = dbState.users.filter((u: any) => u.businessProfile && u.businessProfile.status === 'pending');
  const pendingSellers = dbState.users.filter((u: any) => u.sellerProfile && u.sellerProfile.status === 'pending');
  res.json({ pendingBusiness, pendingSellers });
});

app.post('/api/admin/approve', (req, res) => {
  const { targetUid, approvalType, status } = req.body; // approvalType: 'business' | 'seller', status: 'approved' | 'rejected'
  const dbState = loadDb();
  const userIndex = dbState.users.findIndex((u: any) => u.uid === targetUid);

  if (userIndex === -1) {
    return res.status(404).json({ error: "Target user not found" });
  }

  const user = dbState.users[userIndex];
  if (approvalType === 'business' && user.businessProfile) {
    user.businessProfile.status = status;
    if (status === 'approved') {
      user.role = "business"; // Officially activate business status of the user profile!
    }
  } else if (approvalType === 'seller' && user.sellerProfile) {
    user.sellerProfile.status = status;
    if (status === 'approved') {
      user.role = "seller"; // Activate seller dashboard role!
    }
  }

  dbState.users[userIndex] = user;
  saveDb(dbState);
  res.json({ success: true, user });
});

// 3. Products Endpoints
app.get('/api/products', (req, res) => {
  const { category, search, brand, sort } = req.query;
  const dbState = loadDb();
  let matches = [...dbState.products];

  if (category) {
    matches = matches.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    matches = matches.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  }

  if (brand) {
    matches = matches.filter(p => p.brand.toLowerCase() === (brand as string).toLowerCase());
  }

  if (sort) {
    if (sort === 'low_to_high') {
      matches.sort((a, b) => a.price - b.price);
    } else if (sort === 'high_to_low') {
      matches.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      matches.sort((a, b) => b.rating - a.rating);
    }
  }

  res.json(matches);
});

// Specific Product Detail
app.get('/api/products/:id', (req, res) => {
  const dbState = loadDb();
  const product = dbState.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

// Add a new product (Sellers ONLY)
app.post('/api/products', (req, res) => {
  const { name, category, brand, price, originalPrice, description, specifications, images } = req.body;
  if (!name || !category || !price || !description) {
    return res.status(400).json({ error: "Product name, category, price, and description are required" });
  }

  const dbState = loadDb();
  const user = getCurrentUserFromDb(dbState);
  
  if (user.role !== 'seller') {
    return res.status(403).json({ error: "Only approved Sellers can add products" });
  }

  const newId = "prod_" + Math.random().toString(36).substr(2, 9);
  const discountVal = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  const newProduct = {
    id: newId,
    name,
    category,
    brand: brand || user.sellerProfile?.companyName || "Independent Seller",
    price: Number(price),
    originalPrice: Number(originalPrice || price),
    discount: discountVal,
    rating: 5.0, // Brand new product gets 5-star rating!
    stock: 50,
    tags: [category.toLowerCase(), name.toLowerCase().split(' ')[0]],
    description,
    specifications: specifications || {},
    images: (images && images.length > 0) ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
    videoUrl: null,
    reviews: [],
    qna: []
  };

  dbState.products.push(newProduct);
  saveDb(dbState);
  res.json({ success: true, product: newProduct });
});

// Edit existing product stock
app.put('/api/products/:id/stock', (req, res) => {
  const { stock, price } = req.body;
  const dbState = loadDb();
  const user = getCurrentUserFromDb(dbState);

  if (user.role !== 'seller') {
    return res.status(403).json({ error: "Only approved Sellers can edit inventory" });
  }

  const idx = dbState.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (stock !== undefined) dbState.products[idx].stock = Number(stock);
  if (price !== undefined) {
    dbState.products[idx].price = Number(price);
    const orig = dbState.products[idx].originalPrice || dbState.products[idx].price;
    dbState.products[idx].discount = Math.round(((orig - Number(price)) / orig) * 100);
  }

  saveDb(dbState);
  res.json({ success: true, product: dbState.products[idx] });
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
  const dbState = loadDb();
  const user = getCurrentUserFromDb(dbState);

  if (user.role !== 'seller') {
    return res.status(403).json({ error: "Only approved Sellers can delete products." });
  }

  dbState.products = dbState.products.filter(p => p.id !== req.params.id);
  saveDb(dbState);
  res.json({ success: true });
});

// Review submission
app.post('/api/products/:id/review', (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: "Rating and comment required" });
  }

  const dbState = loadDb();
  const user = getCurrentUserFromDb(dbState);
  const prodIndex = dbState.products.findIndex(p => p.id === req.params.id);

  if (prodIndex === -1) {
    return res.status(440).json({ error: "Product not found" });
  }

  const p = dbState.products[prodIndex];
  const newReview = {
    id: "rev_" + Math.random().toString(36).substr(2, 5),
    user: user.name,
    rating: Number(rating),
    comment,
    date: new Date().toISOString().split('T')[0]
  };

  p.reviews.push(newReview);
  
  // Recalculate average rating
  const total = p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
  p.rating = Number((total / p.reviews.length).toFixed(1));

  dbState.products[prodIndex] = p;
  saveDb(dbState);
  res.json({ success: true, reviews: p.reviews, avgRating: p.rating });
});

// Question & Answer Submission
app.post('/api/products/:id/qna', (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question content required" });
  }

  const dbState = loadDb();
  const prodIndex = dbState.products.findIndex(p => p.id === req.params.id);

  if (prodIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const p = dbState.products[prodIndex];
  
  // Check if seller gets auto-answering help!
  let autoAnswer = "Thanks for asking! Our product support executive will answer your query shortly.";
  if (question.toLowerCase().includes("battery") && p.specifications["Battery Life"]) {
    autoAnswer = `The battery details are: ${p.specifications["Battery Life"]}.`;
  } else if (question.toLowerCase().includes("warranty") || question.toLowerCase().includes("guarantee")) {
    autoAnswer = "This product includes a standard 1-year manufacturer warranty covering internal defects.";
  }

  p.qna.push({ question, answer: autoAnswer });
  dbState.products[prodIndex] = p;
  saveDb(dbState);
  res.json({ success: true, qna: p.qna });
});

// 4. Coupon Support
app.post('/api/coupons/apply', (req, res) => {
  const { code, cartAmount } = req.body;
  const dbState = loadDb();
  const coupon = dbState.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

  if (!coupon) {
    return res.status(400).json({ error: "Invalid coupon code" });
  }

  if (cartAmount < coupon.minPurchase) {
    return res.status(400).json({ error: `Minimum purchase of ₹${coupon.minPurchase} required to apply this coupon` });
  }

  res.json({ success: true, coupon });
});

// 5. Intelligent Hybrid Recommendations Engine
// We create: Frequently Bought Together, Similar Products, Customers Also Viewed, and Collaborative-Personalized
app.get('/api/products/:id/recommendations', (req, res) => {
  const targetId = req.params.id;
  const dbState = loadDb();
  const targetProduct = dbState.products.find(p => p.id === targetId);

  if (!targetProduct) {
    return res.status(404).json({ error: "Target product not found" });
  }

  // A. Similar products (same category, different id)
  const similarProducts = dbState.products
    .filter(p => p.category === targetProduct.category && p.id !== targetId)
    .slice(0, 3);

  // B. Frequently bought together (content-based association + dynamic tag overlaps)
  // Let's check overlaps of tags or category to pair them
  const frequentlyBought = dbState.products
    .filter(p => p.id !== targetId && p.tags && p.tags.some(t => targetProduct.tags?.includes(t)))
    .slice(0, 2);
  
  // C. Customers also viewed (random high rated products in other categories to increase exploration breadth)
  const customersAlsoViewed = dbState.products
    .filter(p => p.id !== targetId && p.category !== targetProduct.category)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  res.json({
similarProducts,
    frequentlyBought: frequentlyBought.length > 0 ? frequentlyBought : dbState.products.filter(p => p.id !== targetId).slice(0, 2),
    customersAlsoViewed
  });
});

// Dynamic Collaborative Filtering Recommendations for logged-in sessions!
app.get('/api/recommendations/personalized', (req, res) => {
  const dbState = loadDb();
  const user = getCurrentUserFromDb(dbState);
  
  // Find all views of this user to filter matching tags
  const userViews = dbState.clicksAndViews.filter((c: any) => c.userId === user.uid);
  
  if (userViews.length === 0) {
    // Fallback: Trending Best Sellers (average rating sorting)
    const bestSellers = [...dbState.products].sort((a, b) => b.rating - a.rating).slice(0, 4);
    return res.json({ title: "Trending Best Sellers", recommendations: bestSellers });
  }

  // Find their most viewed product categories
  const viewedProductIds = userViews.map((v: any) => v.productId);
  const viewedProducts = dbState.products.filter(p => viewedProductIds.includes(p.id));
  const categoriesOfInterest = [...new Set(viewedProducts.map(p => p.category))];

  // Collaborative aspect: find items highly matched by people who also viewed categories of interest
  let matches = dbState.products.filter(p => categoriesOfInterest.includes(p.category) && !viewedProductIds.includes(p.id));

  if (matches.length === 0) {
    matches = dbState.products.filter(p => !viewedProductIds.includes(p.id));
  }

  res.json({
    title: "Personalized Suggestions For You",
    recommendations: matches.slice(0, 4)
  });
});

// 6. Checkout & Invoices API
app.post('/api/orders', (req, res) => {
  const { cartItems, shippingMode, paymentMethod, couponCode, companyDetails, shippingAddress } = req.body;
  
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Cart cannot be empty to place an order" });
  }

  if (!shippingAddress || !shippingAddress.trim()) {
    return res.status(400).json({ error: "A valid shipping delivery address is strictly required to proceed with order dispatch." });
  }

  const dbState = loadDb();
  const userIndex = dbState.users.findIndex((u: any) => u.uid === currentSessionUserUid);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User session not found" });
  }

  const user = dbState.users[userIndex];

  // Core prices
  let subtotal = 0;
  const itemsLog: any[] = [];

  // Verify stock and extract pricing details
  for (const item of cartItems) {
    const p = dbState.products.find(prod => prod.id === item.productId);
    if (!p) {
      return res.status(404).json({ error: `Product ${item.productId} model no longer available` });
    }
    if (p.stock < item.qty) {
      return res.status(400).json({ error: `Insufficient stock for ${p.name}. Only ${p.stock} units remaining.` });
    }
    p.stock -= item.qty; // Dedicate stock reduction on successful buy!
    
    // Wholesaler pricing (similar to Flipkart Business / Wholesale)
    // Business users receive special bulk tier discount:
    let basePrice = p.price;
    const isBusinessUserApproved = user.role === 'business';
    
    if (isBusinessUserApproved && item.qty >= 5) {
      basePrice = Math.round(p.price * 0.85); // 15% wholesale bulk tier discount!
    } else if (isBusinessUserApproved) {
      basePrice = Math.round(p.price * 0.90); // 10% standard business discount flat!
    }

    subtotal += basePrice * item.qty;
    itemsLog.push({
      productId: p.id,
      qty: item.qty,
      purchasePrice: basePrice,
      name: p.name
    });
  }

  // Shipping dynamic selection logic
  let shippingCost = 0;
  let deliveryDays = 4;
  if (shippingMode === 'fast') {
    shippingCost = 150;
    deliveryDays = 2;
  } else if (shippingMode === 'same_day') {
    shippingCost = 350;
    deliveryDays = 0;
  } else if (shippingMode === 'scheduled') {
    shippingCost = 90;
    deliveryDays = 5;
  } else if (shippingMode === 'express') {
    shippingCost = 250;
    deliveryDays = 1;
  }

  // Dynamic Coupon Deduction
  let discountAmount = 0;
  if (couponCode) {
    const coupon = dbState.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon && subtotal >= coupon.minPurchase) {
      if (coupon.type === 'percent') {
        discountAmount = Math.round((subtotal * coupon.value) / 100);
      } else {
        discountAmount = coupon.value;
      }
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.18); // 18% electronic goods GST
  const total = taxableAmount + taxAmount + shippingCost;

  // Real-time dynamic delivery date
  const today = new Date();
  today.setDate(today.getDate() + deliveryDays);
  const estimatedDeliveryStr = today.toISOString().split('T')[0];

  const gstDetails = (user.role === 'business' || companyDetails?.gstNumber) ? {
    companyName: companyDetails?.name || user.businessProfile?.businessName || "Registered Business Client",
    gstNumber: companyDetails?.gstNumber || user.businessProfile?.gstNumber || "MOCK_GST_UNKNOWN",
    address: companyDetails?.address || user.businessProfile?.address || "Registered Address"
  } : null;

  const orderId = "ORD_" + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    orderId,
    userId: user.uid,
    items: itemsLog,
    shippingMode,
    shippingCost,
    shippingAddress: shippingAddress.trim(),
    gstDetails,
    couponCode: couponCode || null,
    discountAmount,
    taxAmount,
    subtotal,
    total,
    paymentMethod: paymentMethod || "UPI",
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
    deliveryStatus: "Order Placed",
    deliveryDate: estimatedDeliveryStr,
    orderDate: new Date().toISOString(),
    trackingTimeline: [
      { title: "Order Placed", desc: "Your standard credentials and balance verification is completed successfully.", date: new Date().toISOString() }
    ]
  };

  dbState.orderLogs.push(newOrder);
  
  // Clear the Cart after order placing!
  user.cart = [];
  const uIdx = dbState.users.findIndex((u: any) => u.uid === user.uid);
  dbState.users[uIdx] = user;

  saveDb(dbState);
  res.json({ success: true, order: newOrder });
});

// Fetch Order History and Returns
app.get('/api/orders', (req, res) => {
  const dbState = loadDb();
  const userOrders = dbState.orderLogs.filter(o => o.userId === currentSessionUserUid);
  res.json(userOrders);
});

// Request return/refund
app.post('/api/orders/:id/return', (req, res) => {
  const { reason, comment } = req.body;
  if (!reason) {
    return res.status(400).json({ error: "Reason for returning is required" });
  }

  const dbState = loadDb();
  const orderIdx = dbState.orderLogs.findIndex(o => o.orderId === req.params.id && o.userId === currentSessionUserUid);

  if (orderIdx === -1) {
    return res.status(404).json({ error: "Order details not found" });
  }

  const order = dbState.orderLogs[orderIdx];
  order.deliveryStatus = "Return Requested";
  order.trackingTimeline.push({
    title: "Return Requested",
    desc: `Reason submitted: ${reason}. Detailed feedback: ${comment || 'No added description.'}`,
    date: new Date().toISOString()
  });

  dbState.orderLogs[orderIdx] = order;
  saveDb(dbState);
  res.json({ success: true, order });
});

// GST Invoice generation / Download as formatted HTML/text endpoint!
app.get('/api/invoices/:orderId', (req, res) => {
  const dbState = loadDb();
  const order = dbState.orderLogs.find(o => o.orderId === req.params.orderId);
  
  if (!order) {
    return res.status(404).send("<h2>Invoice Not Found</h2>");
  }

  const invoiceHtml = `
  <html>
    <head>
      <title>Tax Invoice - ${order.orderId}</title>
      <style>
        body { font-family: sans-serif; padding: 30px; color: #333; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ccc; padding-bottom: 15px; }
        .logo { font-size: 24px; font-weight: bold; color: #e11d48; }
        .section-title { font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 10px; color: #1e293b; background: #f1f5f9; padding: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f8fafc; }
        .right-text { text-align: right; }
        .total-box { margin-top: 20px; float: right; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
        .total-bold { font-weight: bold; font-size: 16px; border-top: 1px solid #333; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">ShopSphere India</div>
          <div>Multi-vendor Enterprise Logistics hub</div>
          <div>GSTIN: 27AASPP1203D4M2</div>
        </div>
        <div style="text-align: right;">
          <h2>TAX INVOICE</h2>
          <div><strong>Order ID:</strong> ${order.orderId}</div>
          <div><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</div>
          <div><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <div>
          <strong>Billing Details:</strong>
          <div>User: Saurabh Gupta</div>
          <div>Address: Pune Sector 1, Maharashtra, IN</div>
          <div>Phone: +91 9876543210</div>
        </div>
        ${order.gstDetails ? `
        <div style="text-align: right;">
          <strong>B2B Company GST Registered:</strong>
          <div>Company: ${order.gstDetails.companyName}</div>
          <div>GSTIN: ${order.gstDetails.gstNumber}</div>
          <div>Address: ${order.gstDetails.address}</div>
        </div>` : `
        <div style="text-align: right;">
          <strong>Client Type:</strong>
          <div>Retail Individual Customer (B2C)</div>
        </div>`}
      </div>

      <div class="section-title">PRODUCT SUMMARY</div>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Base Price (₹)</th>
            <th>Quantity</th>
            <th class="right-text">Subtotal (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((i: any) => `
            <tr>
              <td>${i.name}</td>
              <td>${i.purchasePrice}</td>
              <td>${i.qty}</td>
              <td class="right-text">${i.purchasePrice * i.qty}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-box">
        <div class="total-row"><span>Total Purchase:</span> <span>₹${order.subtotal}</span></div>
        ${order.discountAmount > 0 ? `<div class="total-row" style="color: green;"><span>Coupon Saving (${order.couponCode}):</span> <span>-₹${order.discountAmount}</span></div>` : ''}
        <div class="total-row"><span>18% Electronic Goods CGST+SGST:</span> <span>₹${order.taxAmount}</span></div>
        <div class="total-row"><span>Logistics Shipping Fee (${order.shippingMode.toUpperCase()}):</span> <span>₹${order.shippingCost}</span></div>
        <div class="total-row total-bold"><span>Total Net Balance:</span> <span>₹${order.total}</span></div>
      </div>
      
      <div style="margin-top: 140px; border-top: 1px dotted #ccc; padding-top: 15px; font-size: 11px; text-align: center; color: #777;">
        This is a computer generated digital e-invoice generated dynamically under Indian Goods and Services Tax Act 2017. Signature not required.
      </div>
    </body>
  </html>
  `;
  res.send(invoiceHtml);
});

// 7. GEMINI AI POWERED FEATURES (SERVER-SIDE)
// AI Chatbot endpoint
app.post('/api/ai/chatbot', async (req, res) => {
  const { message, productId, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Empty prompt not allowed" });
  }

  // Load catalog knowledge to grounding-context or text system context!
  const dbState = loadDb();
  const catalogList = dbState.products.map(p => `ID: ${p.id}, name: "${p.name}", category: "${p.category}", brand: "${p.brand}", price: ₹${p.price}, rating: ${p.rating}, availability: ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}`).join('; ');

  let prompt = `You are ShopSphere's premium intelligent AI shopping assistant, helping patrons find information on products, suggesting options, explaining multi-vendor roles, or summarizing returns. Keep responses compact, neat and fully helpful. Do not mention internal API coordinates or secret variables.
  
Here is our live database products knowledge for your reference: [${catalogList}].`;

  if (productId) {
    const p = dbState.products.find(prod => prod.id === productId);
    if (p) {
      prompt += `\nCurrently, the user is looking precisely at item: "${p.name}" with description: "${p.description}" and tags: [${p.tags?.join(', ')}]. Assist on questions about this item specifically.`;
    }
  }

  try {
    if (!apiKey) {
      return res.json({ response: "AI features are operating in standard mode. To connect Google Gemini, please add your active GEMINI_API_KEY inside Settings > Secrets." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: 'user', parts: [{ text: `${prompt}\nUser Query: ${message}` }] }
      ]
    });

    res.json({ response: response.text });
  } catch (err: any) {
    console.error("Gemini chatbot error:", err);
    res.json({ response: `Our support engine is processing high traffic, but here is manual info: AeroBuds Pro is priced at ₹3499, and Titanium Watch is ₹4999. Do you wish to proceed to checkout?` });
  }
});

// Smart description and tag generation for sellers or summarizing reviews!
app.post('/api/ai/generate-content', async (req, res) => {
  const { productName, category, specs } = req.body;
  if (!productName || !category) {
    return res.status(400).json({ error: "Product name and category are required attributes" });
  }

  try {
    if (!apiKey) {
      return res.json({ 
        description: `Premium, highly integrated ${productName} engineered for outstanding durability in ${category}. Includes professional ergonomic components matching customer expectations perfectly.`,
        tags: [category.toLowerCase(), "quality", "bestseller", "trending"]
      });
    }

    const promptText = `Generate a compelling, SEO-friendly 2-sentence description and an array of 5 relevant search tags for a product called "${productName}" under the category "${category}". Additional specifications provided: ${JSON.stringify(specs || {})}. Return responses as a JSON object of key "description" (string) and "tags" (array of strings).`;

    const aiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(aiRes.text || '{}');
    res.json({
      description: parsed.description || `Outstanding ${productName} curated specifically for active users.`,
      tags: parsed.tags || [category.toLowerCase(), "performance"]
    });
  } catch (err) {
    console.error("AI generator error:", err);
    res.json({
      description: `A pristine quality product in the ${category} category, designed to make your daily tasks effortless. Built with premium materials to ensure high reliability.`,
      tags: [category.toLowerCase(), "imported", "new"]
    });
  }
});

// AI Review summarization
app.get('/api/ai/reviews-summary/:productId', async (req, res) => {
  const dbState = loadDb();
  const product = dbState.products.find(p => p.id === req.params.productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (product.reviews.length === 0) {
    return res.json({ summary: "No reviews has been recorded for this product yet. Be the first to leave feedback!" });
  }

  const reviewListText = product.reviews.map((r: any) => `Reviewer: "${r.user}", Rating: ${r.rating}, Feedback: "${r.comment}"`).join('\n');

  try {
    if (!apiKey) {
      return res.json({ summary: "This highly-rated item generally receives strong positive customer reviews, emphasizing its build density, responsive electronics state, and exceptional Indian retail budget-friendly pricing." });
    }

    const aiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an analytics assistant. Summarize these reviews for product "${product.name}" in a single friendly paragraph. Be balanced, highlighting both key praise and common criticism if any:\n\n${reviewListText}`
    });

    res.json({ summary: aiRes.text });
  } catch (e) {
    res.json({ summary: "Outstanding customer feedback on premium build and long battery lifespan, highlighting incredible day-to-day comfort." });
  }
});

// Bulk file upload schema helper
app.post('/api/seller/bulk-upload', (req, res) => {
  const { csvData } = req.body;
  if (!csvData || csvData.length === 0) {
    return res.status(400).json({ error: "Empty dataset submitted" });
  }

  const dbState = loadDb();
  const user = getCurrentUserFromDb(dbState);
  if (user.role !== 'seller') {
    return res.status(403).json({ error: "Seller clearances required" });
  }

  let uploadCount = 0;
  for (const item of csvData) {
    if (item.name && item.category && item.price) {
      const newId = "prod_bulk_" + Math.random().toString(36).substr(2, 5);
      dbState.products.push({
        id: newId,
        name: item.name,
        category: item.category,
        brand: item.brand || user.sellerProfile?.companyName || "Bulk Supplier",
        price: Number(item.price),
        originalPrice: Number(item.originalPrice || item.price),
        discount: item.originalPrice ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0,
        rating: 4.5,
        stock: Number(item.stock || 50),
        tags: [item.category.toLowerCase(), "bulk-uploaded"],
        description: item.description || `Premium quality ${item.name} catalog item.`,
        specifications: {},
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
        videoUrl: null,
        reviews: [],
        qna: []
      });
      uploadCount++;
    }
  }

  saveDb(dbState);
  res.json({ success: true, uploadedProductsCount: uploadCount });
});

// Serve frontend build files for production, fallback to index.html for SPAs
// Support dev server and production serve safely inside a wrapped self-executing environment to support CommonJS building
(async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
})();

// Launch server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=============================================================`);
  console.log(`🛒 SHOPSPHERE SERVICE IS RUNNING SECURELY ON PORT ${PORT}`);
  console.log(`=============================================================\n`);
});
