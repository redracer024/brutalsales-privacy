export interface Product {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price?: string;
}

export const products: Product[] = [
  {
    priceId: 'price_1RYqu0I1USWec4yHQ7MnxX7D',
    name: 'Upgrade to PRO',
    description: 'Upgrade to PRO to remove ads and limitations',
    mode: 'subscription',
    price: '$9.99/month'
  }
];

export function getProductByPriceId(priceId: string): Product | undefined {
  return products.find(product => product.priceId === priceId);
}