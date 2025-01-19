const fs = require('fs');
const path = require('path');

// 重置商品数据
const productsPath = path.join(__dirname, '..', 'data', 'products.json');
fs.writeFileSync(productsPath, '[]', 'utf8');

console.log('商品数据已重置');
