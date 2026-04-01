const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('c:/KeystoneData/src/components', processFile);
walkDir('c:/KeystoneData/src/pages', processFile);

function processFile(filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Replace rounded-lg, xl, 2xl with rounded-md
        content = content.replace(/\brounded-(lg|xl|2xl|3xl)\b/g, 'rounded-md');
        
        // Remove shadow-lg, shadow-xl, shadow-2xl
        content = content.replace(/\bshadow-(lg|xl|2xl)\b/g, '');
        
        // Remove backdrop-blur-*
        content = content.replace(/\bbackdrop-blur-(sm|md|lg|xl)\b/g, '');
        content = content.replace(/\bbackdrop-blur\b/g, '');

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated:', filePath);
        }
    }
}
