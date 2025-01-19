'use client'

import Image from 'next/image'
import { products } from './data/products'

export default function Home() {
  return (
    <main>
      <div className="header">
        <h1>优质商品 一站购齐</h1>
      </div>
      <div className="container">
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={200}
              />
              <h3>{product.name}</h3>
              <p className="description">{product.description}</p>
              <p className="price">¥{product.price}</p>
              <button onClick={() => alert('添加到购物车')}>
                加入购物车
              </button>
            </div>
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
    </main>
  )
}
