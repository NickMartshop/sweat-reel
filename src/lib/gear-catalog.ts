// Amazon Affiliate Store: nickinfotech-21
// All affiliateUrl values include tracking via the Amazon Associates program.
// Commission: 4-8% per qualifying purchase.

/* HOW TO ADD REAL AMAZON PRODUCT IMAGES:
   1. Open each Amazon product page
   2. Right-click the main product image
   3. Click "Copy image address"
   4. The URL looks like:
      https://m.media-amazon.com/images/I/XXXXX.jpg
   5. Replace the imageUrl field below with that URL
   6. The app automatically uses the real image when available,
      and falls back to the emoji gradient if it fails to load.
*/

export type GearCategory =
  | "Resistance"
  | "Weights"
  | "Protein"
  | "Accessories"
  | "Yoga"
  | "Cardio"
  | "Recovery";

export interface GearProduct {
  id: number;
  name: string;
  subtitle: string;
  price: string;
  mrp: string;
  rating: number;
  reviews: string;
  category: GearCategory;
  emoji: string;
  gradient: string;
  affiliateUrl: string;
  imageUrl: string;
  tag: string | null;
  tagColor: string | null;
  badge: string;
  isNew?: boolean;
}

export const GEAR_CATEGORIES: { key: GearCategory | "All"; emoji: string }[] = [
  { key: "All", emoji: "" },
  { key: "Resistance", emoji: "🔴" },
  { key: "Weights", emoji: "🏋️" },
  { key: "Protein", emoji: "💪" },
  { key: "Yoga", emoji: "🧘" },
  { key: "Accessories", emoji: "🥊" },
  { key: "Cardio", emoji: "🏃" },
  { key: "Recovery", emoji: "🔵" },
];

export const GEAR_PRODUCTS: GearProduct[] = [
  // RESISTANCE
  {
    id: 1,
    name: "Resistance Bands Set",
    subtitle: "5 levels · Full body toning & mobility",
    price: "₹299",
    mrp: "₹599",
    rating: 4.5,
    reviews: "2.3k",
    category: "Resistance",
    emoji: "🔴",
    gradient: "linear-gradient(135deg,#FF6B35,#FF4500)",
    affiliateUrl: "https://a.co/d/002v8s8F",
    imageUrl: "",
    tag: "Best Seller",
    tagColor: "#FF6B35",
    badge: "50% OFF",
  },
  {
    id: 2,
    name: "Fabric Hip Resistance Bands",
    subtitle: "Non-slip · Glute & leg activation",
    price: "₹449",
    mrp: "₹899",
    rating: 4.3,
    reviews: "1.1k",
    category: "Resistance",
    emoji: "🟠",
    gradient: "linear-gradient(135deg,#FF9500,#FF6B35)",
    affiliateUrl:
      "https://www.amazon.in/s?k=fabric+hip+resistance+bands&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "50% OFF",
  },
  {
    id: 3,
    name: "Pull-Up Assist Bands Set",
    subtitle: "For pull-ups, stretching & mobility",
    price: "₹699",
    mrp: "₹1,299",
    rating: 4.4,
    reviews: "876",
    category: "Resistance",
    emoji: "🟡",
    gradient: "linear-gradient(135deg,#FFD166,#FF9500)",
    affiliateUrl:
      "https://www.amazon.in/s?k=pull+up+assist+bands&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "46% OFF",
  },
  // WEIGHTS
  {
    id: 4,
    name: "PVC Dumbbell Weight Set",
    subtitle: "Home gym essentials — multiple sizes",
    price: "₹899",
    mrp: "₹1,499",
    rating: 4.3,
    reviews: "1.8k",
    category: "Weights",
    emoji: "🏋️",
    gradient: "linear-gradient(135deg,#4361EE,#2541B2)",
    affiliateUrl: "https://amzn.to/3R01NIP",
    imageUrl: "",
    tag: "Popular",
    tagColor: "#4361EE",
    badge: "40% OFF",
  },
  {
    id: 5,
    name: "Adjustable Dumbbell Set 10kg",
    subtitle: "Space-saving · Home & gym use",
    price: "₹2,499",
    mrp: "₹3,999",
    rating: 4.5,
    reviews: "432",
    category: "Weights",
    emoji: "💪",
    gradient: "linear-gradient(135deg,#2541B2,#1A2980)",
    affiliateUrl:
      "https://www.amazon.in/s?k=adjustable+dumbbell+set&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "37% OFF",
  },
  {
    id: 6,
    name: "Cast Iron Kettlebell 8kg",
    subtitle: "Functional training · Full body",
    price: "₹1,299",
    mrp: "₹1,999",
    rating: 4.4,
    reviews: "654",
    category: "Weights",
    emoji: "⚫",
    gradient: "linear-gradient(135deg,#434343,#000000)",
    affiliateUrl: "https://www.amazon.in/s?k=kettlebell+8kg&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "35% OFF",
  },
  // PROTEIN
  {
    id: 7,
    name: "Whey Protein Powder 1kg",
    subtitle: "Build muscle & recover faster",
    price: "₹999",
    mrp: "₹1,699",
    rating: 4.6,
    reviews: "5.1k",
    category: "Protein",
    emoji: "💪",
    gradient: "linear-gradient(135deg,#06D6A0,#048A5D)",
    affiliateUrl: "https://amzn.to/44Nct0N",
    imageUrl: "",
    tag: "Top Rated",
    tagColor: "#06D6A0",
    badge: "41% OFF",
  },
  {
    id: 8,
    name: "BCAA Recovery Supplement",
    subtitle: "Reduce soreness · Faster recovery",
    price: "₹699",
    mrp: "₹1,199",
    rating: 4.3,
    reviews: "2.1k",
    category: "Protein",
    emoji: "🟢",
    gradient: "linear-gradient(135deg,#048A5D,#036B47)",
    affiliateUrl:
      "https://www.amazon.in/s?k=bcaa+supplement+india&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "42% OFF",
  },
  {
    id: 9,
    name: "Creatine Monohydrate 250g",
    subtitle: "Strength · Power · Performance",
    price: "₹499",
    mrp: "₹799",
    rating: 4.5,
    reviews: "3.4k",
    category: "Protein",
    emoji: "⚡",
    gradient: "linear-gradient(135deg,#7B2FBE,#4A1180)",
    affiliateUrl:
      "https://www.amazon.in/s?k=creatine+monohydrate&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "37% OFF",
  },
  // YOGA
  {
    id: 10,
    name: "Anti-Slip Yoga Mat 6mm",
    subtitle: "6mm thick — all workouts & yoga",
    price: "₹499",
    mrp: "₹999",
    rating: 4.4,
    reviews: "3.7k",
    category: "Yoga",
    emoji: "🧘",
    gradient: "linear-gradient(135deg,#7B2FBE,#5B1F8E)",
    affiliateUrl: "https://amzn.to/4eVGHU4",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "50% OFF",
  },
  {
    id: 11,
    name: "Yoga Blocks Set (2 pcs)",
    subtitle: "Improve flexibility & alignment",
    price: "₹349",
    mrp: "₹599",
    rating: 4.2,
    reviews: "876",
    category: "Yoga",
    emoji: "🟣",
    gradient: "linear-gradient(135deg,#5B1F8E,#4A1180)",
    affiliateUrl: "https://www.amazon.in/s?k=yoga+blocks+set&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "42% OFF",
  },
  // ACCESSORIES
  {
    id: 12,
    name: "Gym Training Gloves",
    subtitle: "Grip & wrist support for heavy lifts",
    price: "₹299",
    mrp: "₹599",
    rating: 4.2,
    reviews: "987",
    category: "Accessories",
    emoji: "🥊",
    gradient: "linear-gradient(135deg,#FFD166,#F59700)",
    affiliateUrl: "https://amzn.to/44f00CY",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "50% OFF",
  },
  {
    id: 13,
    name: "Gym Duffle Bag 35L",
    subtitle: "Separate shoe compartment · Waterproof",
    price: "₹799",
    mrp: "₹1,499",
    rating: 4.4,
    reviews: "1.2k",
    category: "Accessories",
    emoji: "🎒",
    gradient: "linear-gradient(135deg,#F59700,#D97B00)",
    affiliateUrl: "https://www.amazon.in/s?k=gym+duffle+bag&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "47% OFF",
  },
  {
    id: 14,
    name: "Stainless Steel Shaker 700ml",
    subtitle: "Leak-proof · BPA-free · Wide mouth",
    price: "₹399",
    mrp: "₹699",
    rating: 4.5,
    reviews: "4.3k",
    category: "Accessories",
    emoji: "🥤",
    gradient: "linear-gradient(135deg,#C0C0C0,#808080)",
    affiliateUrl:
      "https://www.amazon.in/s?k=protein+shaker+bottle&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "43% OFF",
  },
  // CARDIO
  {
    id: 15,
    name: "Jump Rope Speed Cable",
    subtitle: "Cardio · HIIT · Fat burn",
    price: "₹249",
    mrp: "₹499",
    rating: 4.3,
    reviews: "2.8k",
    category: "Cardio",
    emoji: "🏃",
    gradient: "linear-gradient(135deg,#EF476F,#C0003C)",
    affiliateUrl: "https://www.amazon.in/s?k=speed+jump+rope&tag=nickinfotech-21",
    imageUrl: "",
    tag: "New",
    tagColor: "#EF476F",
    badge: "50% OFF",
    isNew: true,
  },
  // RECOVERY
  {
    id: 16,
    name: "EVA Foam Roller 45cm",
    subtitle: "Deep tissue recovery & muscle relief",
    price: "₹599",
    mrp: "₹999",
    rating: 4.5,
    reviews: "1.2k",
    category: "Recovery",
    emoji: "🔵",
    gradient: "linear-gradient(135deg,#0077B6,#023E8A)",
    affiliateUrl: "https://amzn.to/4aCsUjU",
    imageUrl: "",
    tag: "Recovery",
    tagColor: "#0077B6",
    badge: "40% OFF",
  },
  {
    id: 17,
    name: "Mini Massage Gun",
    subtitle: "Percussive therapy · Muscle recovery",
    price: "₹1,499",
    mrp: "₹3,499",
    rating: 4.4,
    reviews: "743",
    category: "Recovery",
    emoji: "⚡",
    gradient: "linear-gradient(135deg,#023E8A,#03045E)",
    affiliateUrl: "https://www.amazon.in/s?k=mini+massage+gun&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "57% OFF",
    isNew: true,
  },
  {
    id: 18,
    name: "Sports Ice Gel Pack",
    subtitle: "Hot & cold therapy · Injury relief",
    price: "₹299",
    mrp: "₹499",
    rating: 4.1,
    reviews: "431",
    category: "Recovery",
    emoji: "🧊",
    gradient: "linear-gradient(135deg,#90E0EF,#00B4D8)",
    affiliateUrl:
      "https://www.amazon.in/s?k=sports+ice+gel+pack&tag=nickinfotech-21",
    imageUrl: "",
    tag: null,
    tagColor: null,
    badge: "40% OFF",
  },
];
