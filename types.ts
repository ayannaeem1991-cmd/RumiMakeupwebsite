export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpfulCount: number;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'Lips' | 'Eyes' | 'Face' | 'Skincare';
  subcategory: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  rating: number;
  benefits: string[];
  sales: number;
  reviews: Review[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export type ViewState = 'HOME' | 'SHOP' | 'ADVISOR' | 'PRODUCT_DETAILS' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';