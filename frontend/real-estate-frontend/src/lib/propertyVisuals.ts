// src/lib/propertyVisuals.ts
// Visual assets and architectural specifications for PropX Dubai properties

export interface PropertyVisualData {
  image: string;
  imageUrl: string;
  gallery: string[];
  beds: number;
  baths: number;
  sqft: number;
  view: string;
  amenities: string[];
  dtcmPermit: string;
  investorScore: number; // 1-100 gaming score
  riskLevel: 'Ultra Low' | 'Low' | 'Balanced';
  occupancyRate: number;
  tourHotspots: Array<{
    id: string;
    title: string;
    description: string;
    yieldBoost: string;
    x: number; // percentage on image
    y: number;
  }>;
}

export const PROPERTY_VISUALS: Record<string, PropertyVisualData> = {
  // Seven Palm Luxury Hotel Suite
  'cccccccc-cccc-cccc-cccc-cccccccccccc': {
    image: '/images/properties/seven_palm.jpg',
    imageUrl: '/images/properties/seven_palm.jpg',
    gallery: [
      '/images/properties/seven_palm.jpg',
      '/images/properties/partition_render.jpg',
      '/images/properties/marina_gate.jpg',
    ],
    beds: 1,
    baths: 1,
    sqft: 850,
    view: 'Arabian Gulf & Dubai Eye Beachfront',
    amenities: ['Private Beach Access', 'Rooftop Infinity Pool', 'Fully Managed Hotel Pool', 'DTCM Holiday Home Permit'],
    dtcmPermit: 'DTCM-PALM-7712',
    investorScore: 98,
    riskLevel: 'Ultra Low',
    occupancyRate: 94.8,
    tourHotspots: [
      { id: 'h1', title: 'Open Beachfront Terrace', description: 'Private sun deck with uninterrupted Palm Jumeirah skyline view', yieldBoost: '+3.2%', x: 28, y: 55 },
      { id: 'h2', title: 'Executive King Suite', description: 'Italian marble ensuite with acoustic noise-canceling glass', yieldBoost: '+4.1%', x: 72, y: 62 },
      { id: 'h3', title: 'Acoustic Partition Divider', description: 'Convertible dual micro-suite for twin short-term vacation rentals', yieldBoost: '+6.8%', x: 50, y: 45 },
    ],
  },

  // Burj Crown Luxury 2BR Suite
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa': {
    image: '/images/properties/burj_crown.jpg',
    imageUrl: '/images/properties/burj_crown.jpg',
    gallery: [
      '/images/properties/burj_crown.jpg',
      '/images/properties/partition_render.jpg',
      '/images/properties/seven_palm.jpg',
    ],
    beds: 2,
    baths: 2,
    sqft: 1420,
    view: 'Direct Burj Khalifa & Dubai Fountain Sunset',
    amenities: ['Direct Fountain View', 'Floor-to-Ceiling Panoramic Glass', 'Smart Home Keypads', 'Valet & Concierge'],
    dtcmPermit: 'DTCM-DOWNTOWN-8821',
    investorScore: 96,
    riskLevel: 'Ultra Low',
    occupancyRate: 96.2,
    tourHotspots: [
      { id: 'h1', title: 'Burj Khalifa Panoramic Lounge', description: 'Floor-to-ceiling glass framing Dubai Fountain shows', yieldBoost: '+2.8%', x: 42, y: 68 },
      { id: 'h2', title: 'Soundproof Master Suite', description: 'Luxury walk-in wardrobe and en-suite master bath', yieldBoost: '+3.9%', x: 80, y: 50 },
      { id: 'h3', title: 'Partitioned Dual Suite', description: 'Demountable acoustic wall doubling corporate short-let yields', yieldBoost: '+5.4%', x: 58, y: 40 },
    ],
  },

  // Marina Gate Waterfront Penthouse
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb': {
    image: '/images/properties/marina_gate.jpg',
    imageUrl: '/images/properties/marina_gate.jpg',
    gallery: [
      '/images/properties/marina_gate.jpg',
      '/images/properties/partition_render.jpg',
      '/images/properties/seven_palm.jpg',
    ],
    beds: 3,
    baths: 4,
    sqft: 2850,
    view: 'Full Dubai Marina Skyline & Superyacht Berths',
    amenities: ['Private Sky Pool', 'Direct Marina Walk Access', 'Dual Balconies', 'Smart Temperature Sensors'],
    dtcmPermit: 'DTCM-MARINA-4402',
    investorScore: 94,
    riskLevel: 'Ultra Low',
    occupancyRate: 92.4,
    tourHotspots: [
      { id: 'h1', title: 'Private Sky Infinity Pool', description: 'Suspended acrylic pool overlooking yachts on Marina Walk', yieldBoost: '+4.5%', x: 35, y: 70 },
      { id: 'h2', title: 'High-Ceiling Penthouse Salon', description: 'Expansive 6m ceiling with floor-to-ceiling curtain wall glazing', yieldBoost: '+3.0%', x: 65, y: 52 },
      { id: 'h3', title: 'Convertible Guest Studio Wing', description: 'Acoustic modular door creating private locked guest studio for Airbnb', yieldBoost: '+7.2%', x: 82, y: 42 },
    ],
  },

  // The Opus Executive Commercial Wing
  'dddddddd-dddd-dddd-dddd-dddddddddddd': {
    image: '/images/properties/the_opus.jpg',
    imageUrl: '/images/properties/the_opus.jpg',
    gallery: [
      '/images/properties/the_opus.jpg',
      '/images/properties/partition_render.jpg',
      '/images/properties/burj_crown.jpg',
    ],
    beds: 0,
    baths: 4,
    sqft: 4800,
    view: 'Dame Zaha Hadid Central Organic Void',
    amenities: ['Grade-A Tech Hub Lease', 'Zaha Hadid Signature Architecture', '24/7 Security & Server Rooms', 'Corporate Blue-Chip Tenant'],
    dtcmPermit: 'DED-COMM-9941',
    investorScore: 95,
    riskLevel: 'Low',
    occupancyRate: 98.5,
    tourHotspots: [
      { id: 'h1', title: 'Central Glass Void Atrium', description: 'Iconic glowing architectural centerpiece in Business Bay', yieldBoost: '+2.5%', x: 50, y: 48 },
      { id: 'h2', title: 'Executive Boardroom Wing', description: 'Acoustically isolated high-security corporate boardroom', yieldBoost: '+3.5%', x: 25, y: 60 },
      { id: 'h3', title: 'Modular Pod Partitioning', description: 'Subdivided co-working tech incubator pods generating premium lease rent', yieldBoost: '+6.1%', x: 75, y: 60 },
    ],
  },
};

// Fallback for any other property
export const DEFAULT_PROPERTY_VISUAL: PropertyVisualData = {
  image: '/images/properties/burj_crown.jpg',
  imageUrl: '/images/properties/burj_crown.jpg',
  gallery: ['/images/properties/burj_crown.jpg'],
  beds: 2,
  baths: 2,
  sqft: 1200,
  view: 'Dubai Skyline & City Views',
  amenities: ['Balcony', 'Swimming Pool', 'Covered Parking', 'Gym'],
  dtcmPermit: 'DTCM-GEN-001',
  investorScore: 92,
  riskLevel: 'Balanced',
  occupancyRate: 91.0,
  tourHotspots: [
    { id: 'h1', title: 'Living Space', description: 'Spacious lounge with balcony access', yieldBoost: '+2.5%', x: 45, y: 55 },
    { id: 'h2', title: 'Partition Divider', description: 'Yield optimization partition', yieldBoost: '+4.5%', x: 70, y: 45 },
  ],
};

export function getPropertyVisual(propertyId: string): PropertyVisualData {
  return PROPERTY_VISUALS[propertyId] || DEFAULT_PROPERTY_VISUAL;
}
