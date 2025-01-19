const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb');

const app = express();

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI;
let db;

async function connectToDatabase() {
    if (db) return db;
    try {
        const client = await MongoClient.connect(MONGODB_URI);
        db = client.db('shop-project');
        console.log('Successfully connected to MongoDB.');
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

// 中间件配置
app.use(cors());
app.use(bodyParser.json());

// API路由
app.get('/api/products', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const products = await db.collection('products').find({}).toArray();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: '读取商品数据失败' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const product = await db.collection('products').findOne({ id: req.params.id });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: '商品不存在' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: '读取商品数据失败' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const newProduct = {
            id: Date.now().toString(),
            ...req.body
        };
        
        await db.collection('products').insertOne(newProduct);
        await db.collection('operation_logs').insertOne({
            timestamp: new Date().toISOString(),
            operation: 'add_product',
            details: newProduct
        });
        
        res.json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: '添加商品失败' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const result = await db.collection('products').deleteOne({ id: req.params.id });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: '商品不存在' });
        }
        
        await db.collection('operation_logs').insertOne({
            timestamp: new Date().toISOString(),
            operation: 'delete_product',
            details: { id: req.params.id }
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: '删除商品失败' });
    }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 导出 API 处理函数
module.exports = app;
