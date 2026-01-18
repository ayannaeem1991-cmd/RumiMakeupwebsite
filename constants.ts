import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Velvet Rose Matte Lipstick',
    category: 'Lips',
    subcategory: 'Lipstick',
    discounted_price: 3950,
    original_price: 4500,
    description: 'A long-lasting, hydrating matte lipstick in our signature deep rose shade. Enriched with Vitamin E.',
    image: 'https://picsum.photos/400/400?random=1',
    rating: 4.8,
    sales: 1500,
    benefits: ['12-hour wear', 'Non-drying', 'Highly pigmented'],
    reviews: [
      { id: 'r1', userName: 'Sarah M.', rating: 5, comment: 'Best lipstick I have ever owned! Stays on all day.', date: '2023-10-15', helpfulCount: 12, verified: true },
      { id: 'r2', userName: 'Jessica K.', rating: 4, comment: 'Love the color, slightly drying but manageable.', date: '2023-11-02', helpfulCount: 3, verified: true }
    ]
  },
  {
    id: 'p2',
    name: 'Luminous Silk Foundation',
    category: 'Face',
    subcategory: 'Foundation',
    discounted_price: 12500,
    original_price: 15000,
    description: 'Buildable coverage that leaves your skin looking naturally radiant and flawless. Oil-free formula.',
    image: 'https://picsum.photos/400/400?random=2',
    rating: 4.7,
    sales: 2300,
    benefits: ['Medium coverage', 'Radiant finish', 'SPF 15'],
    reviews: [
        { id: 'r3', userName: 'Emily R.', rating: 5, comment: 'My skin looks like glass!', date: '2023-09-10', helpfulCount: 20, verified: true }
    ]
  },
  {
    id: 'p3',
    name: 'Midnight Drama Mascara',
    category: 'Eyes',
    subcategory: 'Mascara',
    discounted_price: 4500,
    description: 'Volumizing and lengthening mascara for a dramatic false-lash effect without clumps.',
    image: 'https://picsum.photos/400/400?random=3',
    rating: 4.9,
    sales: 3100,
    benefits: ['Water-resistant', 'Smudge-proof', 'Volumizing'],
    reviews: []
  },
  {
    id: 'p4',
    name: 'Sunset Glow Blush Palette',
    category: 'Face',
    subcategory: 'Blush',
    discounted_price: 6800,
    original_price: 8500,
    description: 'A trio of peach, coral, and gold tones to warm up your complexion. Silky powder texture.',
    image: 'https://picsum.photos/400/400?random=4',
    rating: 4.6,
    sales: 850,
    benefits: ['Buildable', 'Universal shades', 'Long-lasting'],
    reviews: []
  },
  {
    id: 'p5',
    name: 'Hydra-Boost Setting Spray',
    category: 'Skincare',
    subcategory: 'Moisturizers',
    discounted_price: 4200,
    description: 'Lock in your look for up to 16 hours while keeping skin hydrated and fresh.',
    image: 'https://picsum.photos/400/400?random=5',
    rating: 4.5,
    sales: 1200,
    benefits: ['Dewy finish', 'Alcohol-free', 'Soothing'],
    reviews: []
  },
  {
    id: 'p6',
    name: 'Precision Liquid Liner',
    category: 'Eyes',
    subcategory: 'Eyeliner',
    discounted_price: 3200,
    description: 'Ultra-fine tip for precise cat eyes. Intense black pigment that lasts all day.',
    image: 'https://picsum.photos/400/400?random=6',
    rating: 4.8,
    sales: 1800,
    benefits: ['Waterproof', 'Matte black', 'Easy application'],
    reviews: []
  },
  {
    id: 'p7',
    name: 'Radiance Renewal Serum',
    category: 'Skincare',
    subcategory: 'Serums',
    discounted_price: 14500,
    original_price: 18000,
    description: 'A potent vitamin C serum that brightens and evens skin tone over time.',
    image: 'https://picsum.photos/400/400?random=7',
    rating: 4.9,
    sales: 900,
    benefits: ['Brightening', 'Anti-aging', 'Hydrating'],
    reviews: []
  },
  {
    id: 'p8',
    name: 'Sheer Shine Lip Gloss',
    category: 'Lips',
    subcategory: 'Lip Gloss',
    discounted_price: 3500,
    description: 'Non-sticky, high-shine gloss with a hint of shimmer. Perfect for layering.',
    image: 'https://picsum.photos/400/400?random=8',
    rating: 4.4,
    sales: 2100,
    benefits: ['High shine', 'Moisturizing', 'Non-sticky'],
    reviews: []
  },
  {
    id: 'p9',
    name: 'Full Coverage Concealer',
    category: 'Face',
    subcategory: 'Concealer',
    discounted_price: 4800,
    description: 'Creamy formula that hides dark circles and blemishes without creasing.',
    image: 'https://picsum.photos/400/400?random=9',
    rating: 4.7,
    sales: 1600,
    benefits: ['Full coverage', 'Crease-proof', 'Long-wear'],
    reviews: []
  },
  {
    id: 'p10',
    name: 'Golden Hour Eyeshadow',
    category: 'Eyes',
    subcategory: 'Eyeshadow Palettes',
    discounted_price: 9500,
    original_price: 12000,
    description: '12 highly pigmented warm neutral shades in matte and shimmer finishes.',
    image: 'https://picsum.photos/400/400?random=10',
    rating: 4.8,
    sales: 2500,
    benefits: ['Blendable', 'High pigment', 'Versatile'],
    reviews: []
  }
];

export const getSystemInstruction = (products: Product[]) => `You are Rumi, a professional makeup artist and the AI Beauty Advisor for "Rumi Makeup". 
Your tone is warm, professional, sophisticated, and encouraging.
You have access to the following product catalog:
${products.map(p => `- ${p.name} (Rs. ${p.discounted_price}${p.original_price ? ` - discounted from Rs. ${p.original_price}` : ''}) [${p.category} - ${p.subcategory}]: ${p.description}`).join('\n')}

Rules:
1. Always recommend products from the Rumi Makeup catalog when relevant.
2. If a user asks about makeup tips (e.g., "how to apply eyeliner"), give expert advice.
3. Keep responses concise (under 3 paragraphs) unless asked for a detailed tutorial.
4. If asked about shipping or returns, professionally state that you are a demo advisor and suggest checking the footer links.
5. Emphasize "enhancing natural beauty" rather than "fixing flaws".
`;