// 获取商品数据并渲染到页面
async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
  
      const productTable = document.getElementById('product-table').getElementsByTagName('tbody')[0];
      productTable.innerHTML = ''; // 清空商品列表
      products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${product.category}</td>
          <td>${product.name}</td>
          <td>${product.price}</td>
          <td>${product.stock}</td>
          <td>
            <button onclick="editProduct(${product.id})">编辑</button>
            <button onclick="deleteProduct(${product.id})">删除</button>
          </td>
        `;
        productTable.appendChild(row);
      });
    } catch (error) {
      console.error('获取商品列表失败', error);
    }
  }
  
  // 页面加载时获取商品数据
  window.onload = function() {
    fetchProducts();  // 加载商品列表
  };
  
  // 商品数量变化时更新总金额
  document.getElementById('quantity').addEventListener('input', function () {
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const totalAmount = price * quantity;
    document.getElementById('total-amount').textContent = totalAmount.toFixed(2);
  });
  
  // 提交订单后跳转到支付页面
  document.getElementById('order-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    // 获取订单信息
    const productCategory = document.getElementById('product-category').value;
    const productName = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const totalAmount = price * quantity;
    const email = document.getElementById('email').value;
  
    // 构造订单信息
    const orderInfo = {
      productCategory,
      productName,
      price,
      quantity,
      totalAmount,
      email,
    };
  
    // 存储订单信息
    localStorage.setItem('orderInfo', JSON.stringify(orderInfo));
  
    // 跳转到支付页面
    window.location.href = 'payment.html';
  });
  