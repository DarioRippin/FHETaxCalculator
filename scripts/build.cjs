const fs = require('fs');
const path = require('path');

console.log('🔨 Building Privacy Tax Calculator...');

// 创建 public 目录
const distDir = path.join(__dirname, '../public');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// 读取polyfills
const polyfillsPath = path.join(__dirname, 'polyfills.cjs');
let polyfillsContent = '';
if (fs.existsSync(polyfillsPath)) {
    polyfillsContent = fs.readFileSync(polyfillsPath, 'utf8') + '\n\n';
    console.log('✅ Loaded browser polyfills');
}

// 复制和处理主要文件
const filesToCopy = [
    'index.html',
    'styles.css',
    'favicon.ico'
];

filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, '../', file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
    } else {
        console.log(`⚠️  File ${file} not found`);
    }
});

// 处理 app.js - 添加 polyfills
const appJsPath = path.join(__dirname, '../app.js');
const distAppJsPath = path.join(distDir, 'app.js');

if (fs.existsSync(appJsPath)) {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    const finalAppJs = polyfillsContent + appJsContent;
    fs.writeFileSync(distAppJsPath, finalAppJs);
    console.log('✅ Built app.js with polyfills');
} else {
    console.log('⚠️  app.js not found');
}

// 创建 assets 目录并复制资源
const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

const srcAssetsDir = path.join(__dirname, '../assets');
if (fs.existsSync(srcAssetsDir)) {
    copyDir(srcAssetsDir, assetsDir);
    console.log('✅ Copied assets directory');
}

// 复制合约文件
const contractsDir = path.join(distDir, 'contracts');
if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
}

const srcContractsDir = path.join(__dirname, '../contracts');
if (fs.existsSync(srcContractsDir)) {
    copyDir(srcContractsDir, contractsDir);
    console.log('✅ Copied contracts directory');
}

// 创建 package.json 用于 Vercel 部署识别
const deployPackage = {
    "name": "privacy-tax-calculator",
    "version": "1.0.0",
    "type": "module",
    "engines": {
        "node": ">=18.0.0"
    }
};

fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(deployPackage, null, 2));
console.log('✅ Created deployment package.json');

console.log('✨ Build completed successfully!');
console.log(`📦 Output directory: ${distDir}`);

// 工具函数：递归复制目录
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    
    files.forEach(file => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        
        if (fs.statSync(srcFile).isDirectory()) {
            copyDir(srcFile, destFile);
        } else {
            fs.copyFileSync(srcFile, destFile);
        }
    });
}
