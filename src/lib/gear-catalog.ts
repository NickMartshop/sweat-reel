// REPLACE placeholder affiliate_url values with real Amazon affiliate links from
// your Associates account at https://affiliate-program.amazon.in
export type GearCategory =
  | "Resistance"
  | "Weights"
  | "Protein"
  | "Accessories"
  | "Yoga"
  | "Recovery";

export interface GearProduct {
  id: string;
  name: string;
  price: string;
  category: GearCategory;
  asin: string;
  affiliate_url: string;
  rating: number; // 0-5
  image: string;
}

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/400/400`;
}

export const GEAR_CATEGORIES: (GearCategory | "All")[] = [
  "All",
  "Resistance",
  "Weights",
  "Protein",
  "Accessories",
  "Yoga",
  "Recovery",
];

export const GEAR_PRODUCTS: GearProduct[] = [
  {
    id: "bands",
    name: "Boldfit Resistance Bands Set",
    price: "₹499",
    category: "Resistance",
    asin: "B07XXXXXXXXXXX",
    affiliate_url: "https://amzn.to/PLACEHOLDER1",
    rating: 4.5,
    image: img("resistance-bands"),
  },
  {
    id: "weights",
    name: "Kore PVC 10kg Weight Set",
    price: "₹1,299",
    category: "Weights",
    asin: "B08XXXXXXXXXXX",
    affiliate_url: "https://amzn.to/PLACEHOLDER2",
    rating: 4.5,
    image: img("dumbbells"),
  },
  {
    id: "protein",
    name: "MuscleBlaze Whey Protein 1kg",
    price: "₹1,799",
    category: "Protein",
    asin: "B09XXXXXXXXXXX",
    affiliate_url: "https://amzn.to/PLACEHOLDER3",
    rating: 4.5,
    image: img("protein"),
  },
  {
    id: "mat",
    name: "Strauss Yoga Mat 6mm",
    price: "₹599",
    category: "Yoga",
    asin: "B01XXXXXXXXXXX",
    affiliate_url: "https://amzn.to/PLACEHOLDER4",
    rating: 4.5,
    image: img("yogamat"),
  },
  {
    id: "gloves",
    name: "Boldfit Gym Gloves",
    price: "₹399",
    category: "Accessories",
    asin: "B06XXXXXXXXXXX",
    affiliate_url: "https://amzn.to/PLACEHOLDER5",
    rating: 4.5,
    image: img("gloves"),
  },
  {
    id: "foam",
    name: "HealthSense Foam Roller",
    price: "₹799",
    category: "Recovery",
    asin: "B07YYYYYYYYYYY",
    affiliate_url: "https://amzn.to/PLACEHOLDER6",
    rating: 4.5,
    image: img("foamroller"),
  },
];
