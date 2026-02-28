const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const products = [];

const folders = fs.readdirSync(assetsDir).filter(f => fs.statSync(path.join(assetsDir, f)).isDirectory());

folders.forEach(folder => {
    const folderPath = path.join(assetsDir, folder);
    const files = fs.readdirSync(folderPath);
    
    // Skip if empty or just has .keep
    if (files.length <= 1 && files.includes('.keep')) return;

    let product = {
        id: folder,
        name: folder.replace(/-/g, ' ').toUpperCase(),
        description: "",
        original_price_eur: null,
        price_eur: null,
        price_usdc: 0,
        commission_usdc: 0,
        stripe_price_id: `price_placeholder_${folder}`,
        images: [],
        stock: "available"
    };

    // Find the description file (.md or .rtf)
    const descFile = files.find(f => f.endsWith('.md') || f.endsWith('.rtf'));
    if (descFile) {
        const content = fs.readFileSync(path.join(folderPath, descFile), 'utf8');
        
        // Extract Name from # Header
        const nameMatch = content.match(/^# (.*)/);
        if (nameMatch) product.name = nameMatch[1].trim();

        // Extract Prices
        const origPriceMatch = content.match(/Original Price: (?:EUR|€)\s*(\d+)/i);
        const discPriceMatch = content.match(/Discounted Price: (?:EUR|€)\s*(\d+)/i);
        
        if (origPriceMatch) product.original_price_eur = parseInt(origPriceMatch[1]);
        if (discPriceMatch) {
            product.price_eur = parseInt(discPriceMatch[1]);
            product.price_usdc = product.price_eur * 1000000;
            product.commission_usdc = product.price_usdc * 0.1;
        }

        // Simple description (take the first few paragraphs after prices)
        const lines = content.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#') && !l.toLowerCase().includes('price'));
        product.description = lines.slice(0, 2).join(' ').substring(0, 200) + "...";
    }

    // Find images
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
    const imageFiles = files.filter(f => imageExtensions.includes(path.extname(f).toLowerCase()));
    
    // Sort to prioritize 'main' images
    imageFiles.sort((a, b) => {
        if (a.toLowerCase().includes('main')) return -1;
        if (b.toLowerCase().includes('main')) return 1;
        return 0;
    });

    product.images = imageFiles.map(img => `https://raw.githubusercontent.com/moltiecatalog/moltie-catalog/main/assets/${folder}/${img}`);

    products.push(product);
});

const catalog = {
    version: "1.1.0",
    last_updated: new Date().toISOString().split('T')[0],
    commission_rate: 0.10,
    currency: "USDC",
    network: "base",
    products: products
};

fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify(catalog, null, 2));
console.log(`✅ Generated catalog with ${products.length} products.`);
