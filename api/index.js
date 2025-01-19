const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 连接数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shop_admin:wusuowei314@cluster0.7e9tv.mongodb.net/shop-project?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 首页
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>优质商品 一站购齐</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 20px;
            }
            .status {
                text-align: center;
                padding: 20px;
                background: #e8f5e9;
                border-radius: 4px;
                margin: 20px 0;
            }
            .info {
                color: #666;
                line-height: 1.6;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>优质商品 一站购齐</h1>
            <div class="status">
                ✅ API 服务运行正常
            </div>
            <div class="info">
                <p>服务器状态：在线</p>
                <p>API 版本：1.0.0</p>
                <p>服务时间：9:00-21:00</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '页面未找到' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器错误' });
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
