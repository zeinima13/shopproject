// 商品数据
const products = [
    {
        id: 1,
        name: '商品1',
        description: '这是商品1的描述',
        price: 99.00,
        image: 'https://via.placeholder.com/300'
    },
    {
        id: 2,
        name: '商品2',
        description: '这是商品2的描述',
        price: 199.00,
        image: 'https://via.placeholder.com/300'
    }
];

// 购物车功能
let cart = [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartUI();
    }
}

function updateCartUI() {
    // 更新购物车显示
    console.log('购物车更新：', cart);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.querySelector('.grid');
    
    // 渲染商品
    products.forEach(product => {
        const productElement = createProductElement(product);
        productGrid.appendChild(productElement);
    });
});

function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow-md p-4';
    div.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover rounded">
        <div class="mt-4">
            <h3 class="text-lg font-semibold">${product.name}</h3>
            <p class="text-gray-600 mt-2">${product.description}</p>
            <div class="mt-4 flex justify-between items-center">
                <span class="text-xl font-bold text-blue-600">¥${product.price}</span>
                <button onclick="addToCart(${product.id})" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                    加入购物车
                </button>
            </div>
        </div>
    `;
    return div;
}
