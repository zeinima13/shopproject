const express = require('express');
const path = require('path');
const app = express();

// 基本的错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// 主页路由
app.get('/', (req, res) => {
  res.send('Hello from Vercel!');
});

// 导出app供Vercel使用
module.exports = app;
