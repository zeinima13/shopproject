const express = require('express');
const path = require('path');
const app = express();

// 静态文件服务
app.use(express.static('public'));

// 所有路由返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 导出app供Vercel使用
module.exports = app;
