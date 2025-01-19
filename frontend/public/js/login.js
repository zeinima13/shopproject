document.getElementById('login-form').addEventListener('submit', handleLogin);

async function handleLogin(event) {
    event.preventDefault();
    console.log('Login attempt started');
    const errorMessage = document.getElementById('error-message');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    errorMessage.style.display = 'block';
    errorMessage.textContent = '正在登录...';

    try {
        console.log('Sending request to server...');
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        console.log('Response received:', response);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            errorMessage.style.display = 'block';
            errorMessage.style.color = '#4CAF50';
            errorMessage.textContent = '登录成功，正在跳转...';
            // 保存token
            localStorage.setItem('adminToken', data.token);
            // 跳转到管理页面
            window.location.href = '/admin.html';
        } else {
            errorMessage.style.color = '#dc3545';
            errorMessage.textContent = data.message || '登录失败';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.style.color = '#dc3545';
        errorMessage.textContent = '登录失败，请稍后重试';
        errorMessage.style.display = 'block';
    }
}

// 检查是否已登录
const token = localStorage.getItem('adminToken');
if (token) {
    // 验证token有效性
    fetch('/api/verify-token', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.valid) {
            window.location.href = '/admin.html';
        }
    })
    .catch(error => {
        console.error('Token verification error:', error);
        localStorage.removeItem('adminToken');
    });
}
