const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace Logo Image tag with Icon + Text
    // This regex looks for the Image tag for the logo and replaces it.
    const logoRegex = /<Image\s+src="\/new logo cryptofin\.png"\s+alt="Cryptofin"\s+width=\{[0-9]+\}\s+height=\{[0-9]+\}\s+className="([^"]+)"\s*(priority\s*)?\/>/g;
    
    content = content.replace(logoRegex, (match, className) => {
        // We make the icon exactly 36x36 so it doesn't blow up
        return `<div className="flex items-center gap-2">
            <Image src="/new logo cryptofin.png" alt="Cryptofin Icon" width={36} height={36} className="object-contain drop-shadow-[0_0_10px_rgba(0,98,229,0.5)]" />
            <span className="text-2xl font-bold text-white tracking-tight lowercase">cryptofin</span>
        </div>`;
    });

    // 2. Fix the emerald colors globally to use primary
    content = content.replace(/bg-emerald-500/g, 'bg-primary');
    content = content.replace(/hover:bg-emerald-400/g, 'hover:bg-primary-hover');
    content = content.replace(/text-emerald-500/g, 'text-primary');
    content = content.replace(/text-emerald-400/g, 'text-primary');
    content = content.replace(/border-emerald-500/g, 'border-primary');
    content = content.replace(/emerald-500/g, 'primary');
    content = content.replace(/emerald-400/g, 'primary-hover');
    content = content.replace(/emerald-200/g, 'blue-200'); // For gradients

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
            const validExts = ['.ts', '.tsx', '.js', '.jsx'];
            if (validExts.includes(ext)) {
                try {
                    replaceInFile(file);
                } catch (e) {}
            }
        }
    });
}

walk('./src');
console.log('Fix complete.');
