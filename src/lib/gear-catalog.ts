// Amazon Affiliate Store: nickinfotech-21
// All affiliateUrl values include tracking via the Amazon Associates program.
// Commission: 4-8% per qualifying purchase.

export type GearCategory =
  | "Resistance"
  | "Weights"
  | "Protein"
  | "Accessories"
  | "Yoga"
  | "Recovery";

export interface GearProduct {
  id: number;
  name: string;
  subtitle: string;
  price: string;
  rating: number;
  reviews: string;
  category: GearCategory;
  emoji: string;
  gradient: string;
  affiliateUrl: string;
  tag: string | null;
  tagColor: string | null;
}

export const GEAR_CATEGORIES: { key: GearCategory | "All"; emoji: string }[] = [
  { key: "All", emoji: "" },
  { key: "Resistance", emoji: "🔴" },
  { key: "Weights", emoji: "🏋️" },
  { key: "Protein", emoji: "💪" },
  { key: "Yoga", emoji: "🧘" },
  { key: "Accessories", emoji: "🥊" },
  { key: "Recovery", emoji: "🔵" },
];

export const GEAR_PRODUCTS: GearProduct[] = [
  {
    id: 1,
    name: "Resistance Bands Set",
    subtitle: "For strength & mobility training",
    price: "From ₹299",
    rating: 4.5,
    reviews: "2.3k",
    category: "Resistance",
    emoji: "🔴",
    gradient: "linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)",
    affiliateUrl: "https://a.co/d/002v8s8F",
    tag: "Best Seller",
    tagColor: "#FF6B35",
  },
  {
    id: 2,
    name: "PVC Dumbbell Weight Set",
    subtitle: "Home gym essentials — multiple sizes",
    price: "From ₹899",
    rating: 4.3,
    reviews: "1.8k",
    category: "Weights",
    emoji: "🏋️",
    gradient: "linear-gradient(135deg, #4361EE 0%, #2541B2 100%)",
    affiliateUrl: "https://amzn.to/3R01NIP",
    tag: "Popular",
    tagColor: "#4361EE",
  },
  {
    id: 3,
    name: "Whey Protein Powder",
    subtitle: "Build muscle & recover faster",
    price: "From ₹999",
    rating: 4.6,
    reviews: "5.1k",
    category: "Protein",
    emoji: "💪",
    gradient: "linear-gradient(135deg, #06D6A0 0%, #048A5D 100%)",
    affiliateUrl: "https://amzn.to/44Nct0N",
    tag: "Top Rated",
    tagColor: "#06D6A0",
  },
  {
    id: 4,
    name: "Anti-Slip Yoga Mat",
    subtitle: "6mm thick — perfect for all workouts",
    price: "From ₹499",
    rating: 4.4,
    reviews: "3.7k",
    category: "Yoga",
    emoji: "🧘",
    gradient: "linear-gradient(135deg, #7B2FBE 0%, #4A1180 100%)",
    affiliateUrl: "https://amzn.to/4eVGHU4",
    tag: null,
    tagColor: null,
  },
  {
    id: 5,
    name: "Gym Training Gloves",
    subtitle: "Grip & wrist support for heavy lifts",
    price: "From ₹299",
    rating: 4.2,
    reviews: "987",
    category: "Accessories",
    emoji: "🥊",
    gradient: "linear-gradient(135deg, #FFD166 0%, #F59700 100%)",
    affiliateUrl: "https://amzn.to/44f00CY",
    tag: null,
    tagColor: null,
  },
  {
    id: 6,
    name: "EVA Foam Roller",
    subtitle: "Deep tissue recovery & muscle relief",
    price: "From ₹599",
    rating: 4.5,
    reviews: "1.2k",
    category: "Recovery",
    emoji: "🔵",
    gradient: "linear-gradient(135deg, #EF476F 0%, #C0003C 100%)",
    affiliateUrl: "https://amzn.to/4aCsUjU",
    tag: "Recovery",
    tagColor: "#EF476F",
  },
];
