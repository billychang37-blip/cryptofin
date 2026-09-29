const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let original = content;
    content = content.replace(/logo_new_2\.png/g, 'new logo cryptofin.png');
    content = content.replace(/rgba\(16,\s*185,\s*129,/g, 'rgba(0, 98, 229,');
    content = content.replace(/rgba\(16,185,129,/g, 'rgba(0,98,229,');
    content = content.replace(/10b981/gi, '0062E5');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        
        if (stat && stat.isDirectory()) {
            if (!file.includes('.git') && !file.includes('node_modules') && !file.includes('.next')) {
                walk(file);
            }
        } else {
            const ext = path.extname(file);
            const validExts = ['.ts', '.tsx', '.js', '.jsx', '.css'];
            if (validExts.includes(ext)) {
                try {
                    replaceInFile(file);
                } catch (e) {}
            }
        }
    });
}

walk('./src');
console.log('Replacement complete.');
