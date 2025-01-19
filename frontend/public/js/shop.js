// 加载商户信息
async function loadShopInfo() {
    try {
        const response = await fetch('/api/shop-info');
        const shopInfo = await response.json();
        
        // 更新商户名称
        document.getElementById('merchantName').textContent = shopInfo.merchantName;
        
        // 更新客服信息
        document.getElementById('customerService').textContent = shopInfo.customerService;
        
        // 更新公告
        const announcement = document.getElementById('announcement');
        if (announcement && shopInfo.announcement) {
            announcement.textContent = shopInfo.announcement;
        }

        // 更新二维码
        const qrcodeImg = document.getElementById('qrcode');
        if (qrcodeImg && shopInfo.qrcodePath) {
            qrcodeImg.src = shopInfo.qrcodePath;
            qrcodeImg.style.display = 'block';
        }
    } catch (error) {
        console.error('加载商户信息失败:', error);
    }
}

// 加载商品分类
async function loadCategories() {
    try {
        const response = await fetch('/api/admin/products');
        const products = await response.json();
        
        // 获取所有唯一的分类
        const categories = [...new Set(products.map(p => p.category))];
        
        // 更新分类选择器
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">请选择分类</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // 添加分类变化事件监听器
        categorySelect.addEventListener('change', () => {
            loadProducts(categorySelect.value);
            updatePrice();
        });
    } catch (error) {
        console.error('加载商品分类失败:', error);
    }
}

// 加载商品
async function loadProducts(category = '') {
    try {
        const response = await fetch('/api/admin/products');
        const allProducts = await response.json();
        
        // 根据分类筛选商品
        const products = category 
            ? allProducts.filter(p => p.category === category)
            : allProducts;

        // 更新商品选择器
        const productSelect = document.getElementById('product');
        productSelect.innerHTML = '<option value="">请选择商品</option>';
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            option.dataset.price = product.price;
            option.dataset.stock = product.stock;
            productSelect.appendChild(option);
        });

        // 添加商品变化事件监听器
        productSelect.addEventListener('change', updatePrice);
    } catch (error) {
        console.error('加载商品失败:', error);
    }
}

// 更新价格显示
function updatePrice() {
    const productSelect = document.getElementById('product');
    const selectedOption = productSelect.selectedOptions[0];
    const priceDisplay = document.getElementById('price');
    const stockDisplay = document.getElementById('stock');
    
    if (selectedOption && selectedOption.value) {
        const price = selectedOption.dataset.price;
        const stock = selectedOption.dataset.stock;
        priceDisplay.textContent = `￥${price}`;
        stockDisplay.textContent = stock;
        updateTotalPrice();
    } else {
        priceDisplay.textContent = '￥0';
        stockDisplay.textContent = '0';
    }
}

// 更新总价
function updateTotalPrice() {
    const productSelect = document.getElementById('product');
    const selectedOption = productSelect.selectedOptions[0];
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const totalPriceDisplay = document.getElementById('totalPrice');
    
    if (selectedOption && selectedOption.value && quantity > 0) {
        const price = parseFloat(selectedOption.dataset.price);
        const total = price * quantity;
        totalPriceDisplay.textContent = `￥${total.toFixed(2)}`;
    } else {
        totalPriceDisplay.textContent = '￥0';
    }
}

// 创建订单
async function createOrder() {
    const productSelect = document.getElementById('product');
    const selectedOption = productSelect.selectedOptions[0];
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    
    if (!selectedOption || !selectedOption.value) {
        alert('请选择商品');
        return;
    }
    
    if (quantity <= 0) {
        alert('请输入有效的数量');
        return;
    }
    
    const stock = parseInt(selectedOption.dataset.stock);
    if (quantity > stock) {
        alert('库存不足');
        return;
    }
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: selectedOption.value,
                quantity: quantity
            })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('订单创建成功！');
            // 重置表单
            document.getElementById('category').value = '';
            document.getElementById('product').value = '';
            document.getElementById('quantity').value = '';
            updatePrice();
        } else {
            alert(result.message || '创建订单失败');
        }
    } catch (error) {
        console.error('创建订单失败:', error);
        alert('创建订单失败，请重试');
    }
}

// 监听数量变化
document.getElementById('quantity').addEventListener('input', updateTotalPrice);

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    loadShopInfo();
    loadCategories();
});
