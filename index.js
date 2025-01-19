const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use('/', express.static(path.join(__dirname, 'public')));

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 所有其他路由返回 index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// 导出 app 而不是启动服务器
// 这样 Vercel 可以处理服务器的启动
module.exports = app;

// 本地开发时使用
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
