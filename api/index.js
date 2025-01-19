const express = require('express');
const app = express();

// 中间件
app.use(express.json());

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 处理根路由
app.get('/', (req, res) => {
  res.send('API is running');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 处理 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const port = process.env.PORT || 3000;

// 对于 Vercel，我们需要导出 app
module.exports = app;

// 如果不是在 Vercel 上运行，则启动服务器
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
