/* ─────────────────────────────────────────────
   Mock Data — Floral Boutique
───────────────────────────────────────────── */

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  categoryId: number;
  categoryName: string;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

/* ── Asset URLs - Local Images ── */
// Products page cards
const IMG_P1 = "/images/hero-main.png";
const IMG_P2 = "/images/birthday.png";
const IMG_P3 = "/images/anniversary.png";
const IMG_P4 = "/images/sympathy.png";
const IMG_P5 = "/images/process-step-2.png";
const IMG_P6 = "/images/process-step-3.png";

// Product detail images
const IMG_DETAIL_MAIN  = "/images/heritage-main.png";
const IMG_RELATED_1    = "/images/gallery-photo.png";
const IMG_RELATED_2    = "/images/hero-main.png";
const IMG_RELATED_3    = "/images/birthday.png";
const IMG_RELATED_4    = "/images/anniversary.png";

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Everyday",  description: "Hoa thường ngày" },
  { id: 2, name: "Wedding",   description: "Hoa cưới" },
  { id: 3, name: "Birthday",  description: "Hoa sinh nhật" },
  { id: 4, name: "Luxury",    description: "Hoa cao cấp" },
  { id: 5, name: "Seasonal",  description: "Hoa theo mùa" },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "The Velvet Romance",
    price: 125.00,
    image: IMG_DETAIL_MAIN,
    categoryId: 4,
    categoryName: "Luxury",
    description:
      "A poetic composition of deep velvet roses, silver dollar eucalyptus, and seasonal greenery. Each bloom is hand-selected from sustainable growers to ensure unmatched freshness and beauty.",
  },
  {
    id: 2,
    name: "Morning Dew Peonies",
    price: 95.00,
    image: IMG_RELATED_1,
    categoryId: 1,
    categoryName: "Everyday",
    description:
      "Soft, blush-toned peonies gathered with delicate baby's breath. A timeless arrangement that brings the freshness of a morning garden right to your door.",
  },
  {
    id: 3,
    name: "French Lavender Box",
    price: 78.00,
    image: IMG_RELATED_2,
    categoryId: 5,
    categoryName: "Seasonal",
    description:
      "Bundles of fragrant lavender paired with white lisianthus, presented in our signature kraft box. Perfect for calming any space.",
  },
  {
    id: 4,
    name: "Tropical Sunset",
    price: 110.00,
    image: IMG_RELATED_3,
    categoryId: 3,
    categoryName: "Birthday",
    description:
      "A vibrant burst of birds-of-paradise, heliconia, and tropical foliage. Bold, joyful, and utterly unforgettable.",
  },
  {
    id: 5,
    name: "Everlasting Aura",
    price: 65.00,
    image: IMG_RELATED_4,
    categoryId: 1,
    categoryName: "Everyday",
    description:
      "Dried pampas grass and wheat stalks arranged in a sculptural arc. Lasts for months and grows more beautiful over time.",
  },
  {
    id: 6,
    name: "Bridal Whisper",
    price: 220.00,
    image: IMG_P1,
    categoryId: 2,
    categoryName: "Wedding",
    description:
      "An ethereal cascade of white garden roses, sweet peas, and trailing jasmine. Designed to complement the most important day of your life.",
  },
  {
    id: 7,
    name: "Crimson Elegance",
    price: 88.00,
    image: IMG_P2,
    categoryId: 3,
    categoryName: "Birthday",
    description:
      "Classic red roses nestled with dark foliage and burgundy ranunculus. Timeless passion, expertly arranged.",
  },
  {
    id: 8,
    name: "Golden Harvest",
    price: 72.00,
    image: IMG_P3,
    categoryId: 5,
    categoryName: "Seasonal",
    description:
      "Sunflowers, wheat stalks, and orange dahlias celebrating the warmth of autumn. A cheerful gift for any occasion.",
  },
  {
    id: 9,
    name: "Sakura Dream",
    price: 135.00,
    image: IMG_P4,
    categoryId: 4,
    categoryName: "Luxury",
    description:
      "Delicate cherry blossoms and soft pink tulips arranged in a flowing arc. Inspired by the ephemeral beauty of spring in Kyoto.",
  },
  {
    id: 10,
    name: "Garden Medley",
    price: 58.00,
    image: IMG_P5,
    categoryId: 1,
    categoryName: "Everyday",
    description:
      "A joyful mix of seasonal blooms hand-picked from our partner gardens. Different every week, always beautiful.",
  },
  {
    id: 11,
    name: "Midnight Orchid",
    price: 165.00,
    image: IMG_P6,
    categoryId: 4,
    categoryName: "Luxury",
    description:
      "Deep purple and white phalaenopsis orchids arranged with black ti-leaves. Dramatic, sophisticated, and long-lasting.",
  },
  {
    id: 12,
    name: "Rose Anniversary",
    price: 195.00,
    image: IMG_P1,
    categoryId: 2,
    categoryName: "Wedding",
    description:
      "Two dozen premium garden roses in soft champagne and blush, wrapped in our signature silk ribbon. The ultimate anniversary gesture.",
  },
];

/* ── Helper: paginate ── */
export function paginateProducts(
  products: Product[],
  page: number,
  size: number
) {
  const totalElements = products.length;
  const totalPages = Math.ceil(totalElements / size);
  const start = page * size;
  const content = products.slice(start, start + size);
  return {
    content,
    totalPages,
    totalElements,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}

/* ── Helper: filter products ── */
export function filterProducts(params: {
  name?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
}): Product[] {
  return MOCK_PRODUCTS.filter((p) => {
    if (params.name && !p.name.toLowerCase().includes(params.name.toLowerCase())) {
      return false;
    }
    if (params.categoryId && String(p.categoryId) !== params.categoryId) {
      return false;
    }
    if (params.minPrice && p.price < Number(params.minPrice)) {
      return false;
    }
    if (params.maxPrice && Number(params.maxPrice) > 0 && p.price > Number(params.maxPrice)) {
      return false;
    }
    return true;
  });
}
