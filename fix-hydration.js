const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src/app', function (filePath) {
    if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Check if the file imports useAuthStore
        if (!content.includes('useAuthStore')) return;

        // Add hasHydrated to useAuthStore destructs if not present
        if (content.match(/const\s+\{\s*[^}]*isAuthenticated[^}]*\}\s*=\s*useAuthStore\(\)/)) {
            if (!content.includes('hasHydrated')) {
                content = content.replace(/(const\s+\{\s*)([^}]*isAuthenticated[^}]*)(\}\s*=\s*useAuthStore\(\))/g, '$1hasHydrated, $2$3');
            }
        }

        // Change if (!isAuthenticated) to if (hasHydrated && !isAuthenticated)
        content = content.replace(/if\s*\(\!isAuthenticated\)/g, 'if (hasHydrated && !isAuthenticated)');

        // Change if (!isAuthenticated || user?.role !== "admin") to if (hasHydrated && (!isAuthenticated || user?.role !== "admin"))
        content = content.replace(/if\s*\(\!isAuthenticated\s*\|\|\s*user\?\.role\s*!==\s*["']admin["']\)/g, 'if (hasHydrated && (!isAuthenticated || user?.role !== "admin"))');

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed:', filePath);
        }
    }
});
