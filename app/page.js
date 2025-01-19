'use client'

import { products } from './data/products'
import ProductCard from './components/ProductCard'

export default function Home() {
  return (
    <div>
      <div className="header">
        <h1>优质商品 一站购齐</h1>
      </div>
      <div className="container">
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .header {
          background: #4a90e2;
          color: white;
          text-align: center;
          padding: 2rem 1rem;
          margin-bottom: 2rem;
        }
        .header h1 {
          margin: 0;
          font-size: 2rem;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
