require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

// CORS配置
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// 确保必要的目录存在
const DATA_DIR = path.join(process.env.DATA_DIR || __dirname, 'data');
const UPLOAD_DIR = path.join(process.env.UPLOAD_DIR || __dirname, 'uploads');
const QRCODE_DIR = path.join(UPLOAD_DIR, 'qrcodes');

// 确保目录存在
try {
    fs.ensureDirSync(DATA_DIR);
    fs.ensureDirSync(UPLOAD_DIR);
    fs.ensureDirSync(QRCODE_DIR);
    console.log('所有必要目录已创建');
} catch (error) {
    console.error('创建目录时出错:', error);
}

// 其余代码保持不变...
