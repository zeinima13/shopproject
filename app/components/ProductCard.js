'use client'

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="description">{product.description}</p>
      <p className="price">¥{product.price}</p>
      <button onClick={() => alert('添加到购物车')}>
        加入购物车
      </button>
    </div>
  );
}
