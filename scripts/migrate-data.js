const { MongoClient } = require('mongodb');
const fs = require('fs-extra');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://shop_admin:wusuowei314@cluster0.7e9tv.mongodb.net/shop-project?retryWrites=true&w=majority&appName=Cluster0';

async function migrateData() {
    try {
        // 连接到 MongoDB
        const client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('shop-project');
        
        // 读取产品数据
        const productsData = await fs.readJson(path.join(__dirname, '../backend/data/products.json'));
        if (productsData && productsData.length > 0) {
            await db.collection('products').deleteMany({}); // 清空现有数据
            await db.collection('products').insertMany(productsData);
            console.log('产品数据迁移成功');
        }
        
        // 读取操作日志
        const logsData = await fs.readJson(path.join(__dirname, '../backend/data/operation_logs.json'));
        if (logsData && logsData.length > 0) {
            await db.collection('operation_logs').deleteMany({});
            await db.collection('operation_logs').insertMany(logsData);
            console.log('操作日志迁移成功');
        }
        
        console.log('所有数据迁移完成');
        await client.close();
    } catch (error) {
        console.error('迁移过程中出错:', error);
    }
}

migrateData();
