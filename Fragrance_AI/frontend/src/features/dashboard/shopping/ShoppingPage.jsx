import React, { useMemo } from 'react';
import ProductGrid from './ProductGrid';
import useCartStore from '../state/useCartStore';
import product1 from '../../../assets/perfume-1.jpg';
import product2 from '../../../assets/perfume-4.jpg';
import product3 from '../../../assets/perfume-6.jpg';
import product4 from '../../../assets/perfume-12.jpg';
import product5 from '../../../assets/perfume-15.jpg';
import product6 from '../../../assets/perfume-20.jpg';

const products = [
  { id: 's1', name: 'Santal Bloom', price: '$145', priceValue: 145, vendor: 'Amazon', image: product1 },
  { id: 's2', name: 'Amber Atelier', price: '$175', priceValue: 175, vendor: 'eBay', image: product2 },
  { id: 's3', name: 'Marine Veil', price: '$120', priceValue: 120, vendor: 'Flipkart', image: product3 },
  { id: 's4', name: 'Rose Atlas', price: '$199', priceValue: 199, vendor: 'Amazon', image: product4 },
  { id: 's5', name: 'Velvet Oud', price: '$189', priceValue: 189, vendor: 'eBay', image: product5 },
  { id: 's6', name: 'Citrus Muse', price: '$130', priceValue: 130, vendor: 'Flipkart', image: product6 },
];

const ShoppingPage = () => {
  const { addItem, openCart } = useCartStore();

  const viewProduct = (product) => {
    addItem(product);
    openCart();
  };

  const sorted = useMemo(() => products, []);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-120px)]">
      <div className="px-1 flex-shrink-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/60 font-bold mb-1">Shopping</p>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">Curated perfumes</h1>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Explore luxury picks across vendors. Add to cart or open details.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar-black">
        <ProductGrid products={sorted} onView={viewProduct} />
      </div>
    </div>
  );
};

export default ShoppingPage;

