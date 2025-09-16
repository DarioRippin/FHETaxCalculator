const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

console.log('🚀 Optimizing build for production...');

const distDir = path.join(__dirname, '../public');

// Optimize JavaScript
const jsPath = path.join(distDir, 'app.js');
if (fs.existsSync(jsPath)) {
    console.log('📦 Minifying JavaScript...');
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    
    minify(jsContent, {
        compress: {
            drop_console: false, // Keep console for debugging
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
            passes: 2
        },
        mangle: {
            keep_fnames: true // Keep function names for debugging
        },
        format: {
            comments: false,
            semicolons: true
        }
    }).then(result => {
        if (result.code) {
            fs.writeFileSync(jsPath, result.code);
            console.log('✅ JavaScript optimized');
        }
    }).catch(err => {
        console.warn('⚠️  JavaScript minification failed:', err.message);
    });
}

// Optimize CSS
const cssPath = path.join(distDir, 'styles.css');
if (fs.existsSync(cssPath)) {
    console.log('🎨 Optimizing CSS...');
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Simple CSS minification
    cssContent = cssContent
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/;\s*}/g, '}') // Remove last semicolon
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .trim();
    
    fs.writeFileSync(cssPath, cssContent);
    console.log('✅ CSS optimized');
}

// Optimize HTML
const htmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(htmlPath)) {
    console.log('📄 Optimizing HTML...');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Add optimization meta tags and preload directives
    const optimizations = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="theme-color" content="#1a1a2e">
    <meta name="color-scheme" content="dark light">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    
    <!-- Performance optimizations -->
    <link rel="preload" href="./styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="./styles.css"></noscript>
    <link rel="preload" href="./app.js" as="script">
    
    <!-- DNS prefetch for external resources -->
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="//unpkg.com">
    
    <!-- Preconnect to improve performance -->
    <link rel="preconnect" href="https://sepolia.infura.io">
    <link rel="preconnect" href="https://rpc.sepolia.org">
    `;
    
    // Insert optimization tags
    if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `${optimizations}\n</head>`);
    }
    
    // Minify HTML (basic)
    htmlContent = htmlContent
        .replace(/>\s+</g, '><') // Remove whitespace between tags
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
    
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✅ HTML optimized');
}

// Create manifest.json for PWA compatibility
const manifestPath = path.join(distDir, 'manifest.json');
const manifest = {
    name: 'Privacy Tax Calculator',
    short_name: 'TaxCalc',
    description: 'Privacy-preserving tax calculation using blockchain technology',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a2e',
    theme_color: '#4a90e2',
    icons: [
        {
            src: '/favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
        }
    ]
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('✅ PWA manifest created');

// Create robots.txt
const robotsPath = path.join(distDir, 'robots.txt');
const robotsContent = `User-agent: *
Allow: /

Sitemap: https://privacy-tax-calculator.vercel.app/sitemap.xml`;

fs.writeFileSync(robotsPath, robotsContent);
console.log('✅ Robots.txt created');

console.log('✨ Build optimization completed!');