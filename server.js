const express = require('express');
const path = require('path');
const app = express();

// 提供 public 文件夹中的静态资源
app.use(express.static(path.join(__dirname, 'public')));

// 设置主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(3000, () => {
    console.log('服务器启动成功，访问地址：http://localhost:3000');
});
