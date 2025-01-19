// 获取token
function getToken() {
    return localStorage.getItem('token');
}

// 检查登录状态
async function checkLoginStatus() {
    const token = getToken();
    if (!token) {
        showLoginForm();
        return false;
    }

    try {
        const response = await fetch('/api/verify-token', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token验证失败');
        }

        hideLoginForm();
        return true;
    } catch (error) {
        console.error('验证token失败:', error);
        showLoginForm();
        return false;
    }
}

// 显示登录表单
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
}

// 隐藏登录表单
function hideLoginForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            hideLoginForm();
            await loadShopInfo();
            await loadProducts();
        } else {
            alert('登录失败：' + (data.message || '用户名或密码错误'));
        }
    } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败，请重试');
    }
}

// 加载商户信息
async function loadShopInfo() {
    try {
        const response = await fetch('/api/shop-info');
        const shopInfo = await response.json();
        
        document.getElementById('merchantName').value = shopInfo.merchantName || '';
        document.getElementById('customerService').value = shopInfo.customerService || '';
        document.getElementById('announcement').value = shopInfo.announcement || '';
        
        if (shopInfo.qrcodePath) {
            document.getElementById('currentQRCode').src = shopInfo.qrcodePath;
            document.getElementById('currentQRCode').style.display = 'block';
        }
    } catch (error) {
        console.error('加载商户信息失败:', error);
        alert('加载商户信息失败');
    }
}

// 更新商户信息
async function updateShopInfo() {
    const token = getToken();
    if (!token) {
        alert('请先登录');
        return;
    }

    const merchantName = document.getElementById('merchantName').value;
    const customerService = document.getElementById('customerService').value;
    const announcement = document.getElementById('announcement').value;

    try {
        const response = await fetch('/api/admin/shop-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                merchantName,
                customerService,
                announcement
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('商户信息更新成功');
            await loadShopInfo();
        } else {
            alert('更新失败：' + data.message);
        }
    } catch (error) {
        console.error('更新商户信息失败:', error);
        alert('更新商户信息失败，请重试');
    }
}

// 上传二维码
async function uploadQRCode() {
    const token = getToken();
    if (!token) {
        alert('请先登录');
        return;
    }

    const fileInput = document.getElementById('qrcodeFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('请选择要上传的二维码图片');
        return;
    }

    const formData = new FormData();
    formData.append('qrcode', file);

    try {
        const response = await fetch('/api/admin/upload-qrcode', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            alert('二维码上传成功');
            document.getElementById('currentQRCode').src = data.qrcodePath;
            document.getElementById('currentQRCode').style.display = 'block';
            fileInput.value = '';
        } else {
            alert('上传失败：' + data.message);
        }
    } catch (error) {
        console.error('上传二维码失败:', error);
        alert('上传二维码失败，请重试');
    }
}

// 加载商品列表
async function loadProducts() {
    const token = getToken();
    if (!token) {
        alert('请先登录');
        return;
    }

    try {
        const response = await fetch('/api/admin/products', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const products = await response.json();
        const tableBody = document.querySelector('#productTable tbody');
        tableBody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.category}</td>
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.stock}</td>
                <td>
                    <button onclick="deleteProduct('${product.id}')">删除</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('加载商品列表失败:', error);
        alert('加载商品列表失败');
    }
}

// 添加商品
async function addProduct() {
    const token = getToken();
    if (!token) {
        alert('请先登录');
        return;
    }

    const category = document.getElementById('productCategory').value;
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const stock = document.getElementById('productStock').value;

    if (!category || !name || !price || !stock) {
        alert('请填写所有商品信息');
        return;
    }

    try {
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                category,
                name,
                price: parseFloat(price),
                stock: parseInt(stock)
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('商品添加成功');
            document.getElementById('productCategory').value = '';
            document.getElementById('productName').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productStock').value = '';
            await loadProducts();
        } else {
            alert('添加失败：' + data.message);
        }
    } catch (error) {
        console.error('添加商品失败:', error);
        alert('添加商品失败，请重试');
    }
}

// 删除商品
async function deleteProduct(productId) {
    const token = getToken();
    if (!token) {
        alert('请先登录');
        return;
    }

    if (!confirm('确定要删除这个商品吗？')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            alert('商品删除成功');
            await loadProducts();
        } else {
            alert('删除失败：' + data.message);
        }
    } catch (error) {
        console.error('删除商品失败:', error);
        alert('删除商品失败，请重试');
    }
}

// 批量导入商品
async function batchImportProducts() {
    const token = getToken();
    if (!token) {
        alert('请先登录');
        return;
    }

    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请选择要导入的文件');
        return;
    }

    try {
        const text = await file.text();
        const rows = text.split('\n').filter(row => row.trim());
        const products = rows.map(row => {
            const [category, name, price, stock] = row.split(',').map(item => item.trim());
            return {
                category,
                name,
                price: parseFloat(price),
                stock: parseInt(stock)
            };
        });

        const response = await fetch('/api/admin/products/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ products })
        });

        const data = await response.json();
        if (data.success) {
            alert(data.message);
            fileInput.value = '';
            await loadProducts();
        } else {
            alert('导入失败：' + data.message);
        }
    } catch (error) {
        console.error('批量导入商品失败:', error);
        alert('批量导入失败，请检查文件格式是否正确');
    }
}

// 初始化
window.onload = async function() {
    // 绑定登录表单提交事件
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // 绑定更新商户信息按钮事件
    document.getElementById('updateShopInfoBtn').addEventListener('click', updateShopInfo);

    // 绑定上传二维码按钮事件
    document.getElementById('uploadQRCodeBtn').addEventListener('click', uploadQRCode);

    // 绑定添加商品按钮事件
    document.getElementById('addProductBtn').addEventListener('click', addProduct);

    // 绑定批量导入按钮事件
    document.getElementById('importBtn').addEventListener('click', batchImportProducts);

    // 检查登录状态并加载数据
    const isLoggedIn = await checkLoginStatus();
    if (isLoggedIn) {
        await loadShopInfo();
        await loadProducts();
    }
};
