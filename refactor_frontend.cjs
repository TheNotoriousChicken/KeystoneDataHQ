const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const searchString = /http:\/\/localhost:4000/g;
const replacementString = 'import.meta.env.VITE_API_URL';

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.match(searchString)) {

                // Replace string literals: 'http://localhost:4000/api...'
                // Need to be careful. In JS, usually it's `http://localhost:4000${something}` or 'http://localhost:4000/something'
                // Easiest is to replace the exact string without quotes first, but we want to deal with quotes elegantly.

                // Let's replace 'http://localhost:4000' with `${import.meta.env.VITE_API_URL}` so it works in template literals.
                // e.g. 'http://localhost:4000/api/login' -> `${import.meta.env.VITE_API_URL}/api/login`

                // We will replace occurrences of http://localhost:4000 inside template literals:
                content = content.replace(/`http:\/\/localhost:4000([^`]*)`/g, "`${import.meta.env.VITE_API_URL}$1`");

                // For single quotes: 'http://localhost:4000/api/login' -> `${import.meta.env.VITE_API_URL}/api/login`
                content = content.replace(/'http:\/\/localhost:4000([^']*)'/g, "`${import.meta.env.VITE_API_URL}$1`");

                // For double quotes: "http://localhost:4000/api/login" -> `${import.meta.env.VITE_API_URL}/api/login`
                content = content.replace(/"http:\/\/localhost:4000([^"]*)"/g, "`${import.meta.env.VITE_API_URL}$1`");

                // In case there are bare ones (e.g. inside an existing template literal)
                content = content.replace(/http:\/\/localhost:4000/g, "${import.meta.env.VITE_API_URL}");

                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    }
}

walkDir(srcDir);
console.log('Frontend refactor complete.');
