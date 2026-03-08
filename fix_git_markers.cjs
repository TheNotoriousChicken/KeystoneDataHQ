const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    let fixedCount = 0;

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            fixedCount += walkDir(filePath);
        } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Handle both LF and CRLF line endings
            const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>>[^\n\r]*\r?\n?/g;

            if (regex.test(content)) {
                content = content.replace(regex, '$1');
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Cleaned merge conflict inside: ${filePath}`);
                fixedCount++;
            }
        }
    }
    return fixedCount;
}

const total = walkDir(srcDir);
console.log(`\n🎉 Completely eliminated merge conflicts in ${total} files!`);
