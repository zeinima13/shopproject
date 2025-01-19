const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.get('/api/products', (req, res) => {
  console.log('Accessing products API');
  res.json([]);
});

// 健康检查
app.get('/api/health', (req, res) => {
  console.log('Health check');
  res.json({ status: 'ok' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 所有其他路由返回 index.html
app.get('*', (req, res) => {
  console.log('Serving index.html for:', req.url);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
