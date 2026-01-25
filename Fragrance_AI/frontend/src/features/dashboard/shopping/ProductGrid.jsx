import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onView }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {products.map((product) => (
      <ProductCard key={product.id} product={product} onView={onView} />
    ))}
  </div>
);

export default ProductGrid;

