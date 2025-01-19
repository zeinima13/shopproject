// 获取商品数据并更新商品分类和商品名称下拉框
async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
  
      const categoryDropdown = document.getElementById('product-category');
      const nameDropdown = document.getElementById('product-name');
      
      // 更新商品分类下拉框
      const categories = [...new Set(products.map(product => product.category))];
      categoryDropdown.innerHTML = '';  // 清空现有选项
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryDropdown.appendChild(option);
      });
  
      // 更新商品名称下拉框
      nameDropdown.innerHTML = '';  // 清空现有选项
      products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.name;
        option.textContent = product.name;
        nameDropdown.appendChild(option);
      });
  
    } catch (error) {
      console.error('获取商品列表失败', error);
    }
  }
  
  // 页面加载时获取商品数据
  window.onload = function() {
    fetchProducts();  // 加载商品分类和名称
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
  