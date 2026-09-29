const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains the strings
    if (content.toLowerCase().includes('cryptofin')) {
        let newContent = content
            .replace(/Cryptofin/g, 'Cryptofin')
            .replace(/cryptofin/g, 'cryptofin')
            .replace(/CRYPTOFIN/g, 'CRYPTOFIN');
            
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        
        // Exclude some directories and binary files
        if (stat && stat.isDirectory()) {
            if (!file.includes('.git') && !file.includes('node_modules') && !file.includes('.next')) {
                walk(file);
            }
        } else {
            const ext = path.extname(file);
            const validExts = ['.ts', '.tsx', '.js', '.jsx', '.css', '.md', '.json', '.html', '.env', '.env.local', '.env.example'];
            if (validExts.includes(ext) || path.basename(file) === '.env.local' || path.basename(file) === '.env') {
                try {
                    replaceInFile(file);
                } catch (e) {}
            }
        }
    });
}

walk('.');
console.log('Replacement complete.');
