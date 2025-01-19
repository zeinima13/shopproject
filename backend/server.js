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

// 确保必要的目录存在
const DATA_DIR = path.join(process.env.DATA_DIR || __dirname, 'data');
const UPLOAD_DIR = path.join(process.env.UPLOAD_DIR || __dirname, '..', 'public', 'uploads');
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

// 初始化数据文件
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SHOP_INFO_FILE = path.join(DATA_DIR, 'shop-info.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const OPERATION_LOG_FILE = path.join(DATA_DIR, 'operation_logs.json');

// 确保文件使用UTF-8编码
function initDataFile(filePath, defaultData = {}) {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
        }
    } catch (error) {
        console.error(`初始化文件失败 ${filePath}:`, error);
        // 如果文件损坏，重新创建
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
    }
}

// 初始化所有数据文件
initDataFile(PRODUCTS_FILE, []);
initDataFile(SHOP_INFO_FILE, {
    merchantName: '',
    customerService: '',
    announcement: '',
    qrcodePath: ''
});
initDataFile(ADMIN_FILE, {
    username: '136815',
    password: bcrypt.hashSync('rinima123', 10)
});
initDataFile(OPERATION_LOG_FILE, []);

// 配置multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, QRCODE_DIR);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// 安全地读取JSON文件
function safeReadJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`读取文件失败 ${filePath}:`, error);
        // 如果文件损坏，返回默认值
        return filePath === PRODUCTS_FILE ? [] : {};
    }
}

// 安全地写入JSON文件
function safeWriteJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`写入文件失败 ${filePath}:`, error);
        return false;
    }
}

// 验证token中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: '未提供认证token' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: '无效的token' });
        }
        req.user = user;
        next();
    });
}

// 记录操作日志
function logOperation(operation, details) {
    try {
        const logs = safeReadJsonFile(OPERATION_LOG_FILE);
        logs.push({
            timestamp: new Date().toISOString(),
            operation,
            details
        });
        safeWriteJsonFile(OPERATION_LOG_FILE, logs);
    } catch (error) {
        console.error('记录操作日志失败:', error);
    }
}

// 路由
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const adminData = safeReadJsonFile(ADMIN_FILE);

        if (username === adminData.username && bcrypt.compareSync(password, adminData.password)) {
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ success: true, token });
            logOperation('login', { username });
        } else {
            res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

app.get('/api/verify-token', authenticateToken, (req, res) => {
    res.json({ success: true });
});

// 商户信息相关接口
app.get('/api/shop-info', (req, res) => {
    try {
        const shopInfo = safeReadJsonFile(SHOP_INFO_FILE);
        res.json(shopInfo);
    } catch (error) {
        console.error('获取商户信息错误:', error);
        res.status(500).json({ success: false, message: '获取商户信息失败' });
    }
});

app.post('/api/admin/shop-info', authenticateToken, (req, res) => {
    try {
        const { merchantName, customerService, announcement } = req.body;
        const shopInfo = safeReadJsonFile(SHOP_INFO_FILE);
        
        const updatedInfo = {
            ...shopInfo,
            merchantName: merchantName || shopInfo.merchantName,
            customerService: customerService || shopInfo.customerService,
            announcement: announcement || shopInfo.announcement
        };

        if (safeWriteJsonFile(SHOP_INFO_FILE, updatedInfo)) {
            logOperation('update_shop_info', updatedInfo);
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: '更新商户信息失败' });
        }
    } catch (error) {
        console.error('更新商户信息错误:', error);
        res.status(500).json({ success: false, message: '更新商户信息失败' });
    }
});

app.post('/api/admin/upload-qrcode', authenticateToken, upload.single('qrcode'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '未上传文件' });
        }

        const qrcodePath = '/uploads/qrcodes/' + req.file.filename;
        const shopInfo = safeReadJsonFile(SHOP_INFO_FILE);
        
        // 删除旧二维码
        if (shopInfo.qrcodePath) {
            const oldPath = path.join(__dirname, '..', 'public', shopInfo.qrcodePath);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        shopInfo.qrcodePath = qrcodePath;
        if (safeWriteJsonFile(SHOP_INFO_FILE, shopInfo)) {
            logOperation('upload_qrcode', { path: qrcodePath });
            res.json({ success: true, qrcodePath });
        } else {
            res.status(500).json({ success: false, message: '保存二维码信息失败' });
        }
    } catch (error) {
        console.error('上传二维码错误:', error);
        res.status(500).json({ success: false, message: '上传二维码失败' });
    }
});

// 商品管理接口
app.get('/api/admin/products', authenticateToken, (req, res) => {
    try {
        const products = safeReadJsonFile(PRODUCTS_FILE);
        res.json(products);
    } catch (error) {
        console.error('获取商品列表错误:', error);
        res.status(500).json({ success: false, message: '获取商品列表失败' });
    }
});

app.post('/api/admin/products', authenticateToken, (req, res) => {
    try {
        const { category, name, price, stock } = req.body;
        
        if (!category || !name || !price || !stock) {
            return res.status(400).json({ success: false, message: '缺少必要的商品信息' });
        }

        const products = safeReadJsonFile(PRODUCTS_FILE);
        const newProduct = {
            id: Date.now().toString(),
            category,
            name,
            price: parseFloat(price),
            stock: parseInt(stock)
        };

        products.push(newProduct);
        if (safeWriteJsonFile(PRODUCTS_FILE, products)) {
            logOperation('add_product', newProduct);
            res.json({ success: true, product: newProduct });
        } else {
            res.status(500).json({ success: false, message: '保存商品信息失败' });
        }
    } catch (error) {
        console.error('添加商品错误:', error);
        res.status(500).json({ success: false, message: '添加商品失败' });
    }
});

app.delete('/api/admin/products/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const products = safeReadJsonFile(PRODUCTS_FILE);
        const updatedProducts = products.filter(p => p.id !== id);
        
        if (products.length === updatedProducts.length) {
            return res.status(404).json({ success: false, message: '商品不存在' });
        }

        if (safeWriteJsonFile(PRODUCTS_FILE, updatedProducts)) {
            logOperation('delete_product', { id });
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: '删除商品失败' });
        }
    } catch (error) {
        console.error('删除商品错误:', error);
        res.status(500).json({ success: false, message: '删除商品失败' });
    }
});

app.post('/api/admin/products/batch', authenticateToken, (req, res) => {
    try {
        const { products: newProducts } = req.body;
        
        if (!Array.isArray(newProducts)) {
            return res.status(400).json({ success: false, message: '无效的商品数据' });
        }

        const products = safeReadJsonFile(PRODUCTS_FILE);
        const productsToAdd = newProducts.map(p => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            category: p.category,
            name: p.name,
            price: parseFloat(p.price),
            stock: parseInt(p.stock)
        }));

        products.push(...productsToAdd);
        if (safeWriteJsonFile(PRODUCTS_FILE, products)) {
            logOperation('batch_import_products', { count: productsToAdd.length });
            res.json({ 
                success: true, 
                message: `成功导入 ${productsToAdd.length} 个商品` 
            });
        } else {
            res.status(500).json({ success: false, message: '保存商品数据失败' });
        }
    } catch (error) {
        console.error('批量导入商品错误:', error);
        res.status(500).json({ success: false, message: '批量导入商品失败' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8');
        const products = JSON.parse(data);
        res.json(products);
    } catch (error) {
        console.error('Error reading products:', error);
        res.status(500).json({ error: 'Failed to read products' });
    }
});

app.get('/api/products/:id', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8'));
        const product = products.find(p => p.id === req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: '商品不存在' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('获取商品信息失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

app.post('/api/admin/import-products', async (req, res) => {
    try {
        const products = [
            {
                id: Date.now().toString() + '1',
                category: "微博产品",
                name: "微博白号",
                price: 0.50,
                stock: 6582
            },
            {
                id: Date.now().toString() + '2',
                category: "微博产品",
                name: "微博ck号",
                price: 0.22,
                stock: 54693
            },
            {
                id: Date.now().toString() + '3',
                category: "微博产品",
                name: "微博--信用分510以上---6-9级老号",
                price: 2.00,
                stock: 535
            },
            {
                id: Date.now().toString() + '4',
                category: "微博产品",
                name: "微博0-20级",
                price: 2.80,
                stock: 653
            }
        ];

        // 读取现有商品
        const productsPath = path.join(__dirname, 'data', 'products.json');
        let existingProducts = [];
        try {
            const existingData = await fs.readFile(productsPath, 'utf8');
            existingProducts = JSON.parse(existingData);
        } catch (error) {
            console.error('读取现有商品失败，将创建新文件');
        }

        // 合并商品数据
        const updatedProducts = [...existingProducts, ...products];

        // 保存更新后的商品数据
        await fs.writeFile(productsPath, JSON.stringify(updatedProducts, null, 2), 'utf8');

        res.json({ success: true, message: '商品导入成功', count: products.length });
    } catch (error) {
        console.error('Error importing products:', error);
        res.status(500).json({ error: 'Failed to import products', details: error.message });
    }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('数据目录:', DATA_DIR);
    console.log('上传目录:', UPLOAD_DIR);
});
