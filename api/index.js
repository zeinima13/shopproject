const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 连接数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shop_admin:wusuowei314@cluster0.7e9tv.mongodb.net/shop-project?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// 定义产品模型
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String
});

const Product = mongoose.model('Product', productSchema);

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
